import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  PlayerState,
  BulletEntity,
  BombEntity,
  EnemyEntity,
  GroundTargetEntity,
  PickupEntity,
  ParticleEntity,
  EnemyType,
  GroundTargetType,
  PickupType,
  PlayerUpgrades,
  DamageNumberItem,
  WeatherType,
} from './types';
import {
  buildPlayerAircraft,
  buildBombReticle,
  buildEnemyAircraft,
  buildGroundTarget,
  buildBomb,
  buildPickup,
  buildTerrainSegment,
} from './models';
import { sound } from '../audio/soundEngine';
import { DynamicWeatherManager } from './weather/DynamicWeatherManager';
import { WingmanSystem } from './wingman/WingmanSystem';
import { TacticalChallengeManager } from './challenges/TacticalChallengeManager';

interface GameCanvasProps {
  playerState: PlayerState;
  onUpdateState: (updater: (prev: PlayerState) => PlayerState) => void;
  onGameOver: () => void;
  onMissionComplete: () => void;
  controlMode: 'mouse' | 'keyboard';
  upgrades: PlayerUpgrades;
  playerSkinId?: string;
  wingmanSkinId?: string;
  onDamageEvent?: (item: DamageNumberItem) => void;
  onWeatherChange?: (weather: WeatherType, notification: string) => void;
  onComms?: (msg: string) => void;
  onChallengeReward?: (rewardGold: number, title: string) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  playerState,
  onUpdateState,
  onGameOver,
  onMissionComplete,
  controlMode,
  upgrades,
  playerSkinId,
  wingmanSkinId,
  onDamageEvent,
  onWeatherChange,
  onComms,
  onChallengeReward,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // References to preserve state across render loop
  const activeRef = useRef(playerState.active);
  const pausedRef = useRef(playerState.isPaused);
  const controlModeRef = useRef(controlMode);
  const upgradesRef = useRef(upgrades);
  const onDamageEventRef = useRef(onDamageEvent);
  const onWeatherChangeRef = useRef(onWeatherChange);
  const onCommsRef = useRef(onComms);
  const onChallengeRewardRef = useRef(onChallengeReward);
  const playerStateRef = useRef(playerState);

  useEffect(() => {
    playerStateRef.current = playerState;
    activeRef.current = playerState.active;
  }, [playerState]);

  useEffect(() => {
    pausedRef.current = playerState.isPaused;
  }, [playerState.isPaused]);

  useEffect(() => {
    controlModeRef.current = controlMode;
  }, [controlMode]);

  useEffect(() => {
    upgradesRef.current = upgrades;
  }, [upgrades]);

  useEffect(() => {
    onDamageEventRef.current = onDamageEvent;
  }, [onDamageEvent]);

  useEffect(() => {
    onWeatherChangeRef.current = onWeatherChange;
  }, [onWeatherChange]);

  useEffect(() => {
    onCommsRef.current = onComms;
  }, [onComms]);

  useEffect(() => {
    onChallengeRewardRef.current = onChallengeReward;
  }, [onChallengeReward]);

  // Main game engine mount effect
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x131c24, 0.011);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 400);
    camera.position.set(0, 36, 26);
    camera.lookAt(0, 0, -4);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Base Lighting
    const ambientLight = new THREE.AmbientLight(0x8fa3b8, 1.4);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xfff3db, 2.0);
    sun.position.set(30, 60, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -35;
    sun.shadow.camera.right = 35;
    sun.shadow.camera.top = 35;
    sun.shadow.camera.bottom = -35;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 140;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-25, 20, -20);
    scene.add(fillLight);

    // 4. Ocean Base Plane
    const oceanGeo = new THREE.PlaneGeometry(240, 400);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x112738,
      roughness: 0.18,
      metalness: 0.7,
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -1.2;
    ocean.receiveShadow = true;
    scene.add(ocean);

    // 5. Dynamic Weather Manager
    const weatherManager = new DynamicWeatherManager(
      scene,
      ambientLight,
      sun,
      ocean,
      playerState.currentWeather || 'sunny',
      (newWeather, notification) => {
        onUpdateState(prev => ({ ...prev, currentWeather: newWeather }));
        if (onWeatherChangeRef.current) {
          onWeatherChangeRef.current(newWeather, notification);
        }
      }
    );

    // 6. Scrolling Terrain Segments
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);
    const terrainTiles: THREE.Group[] = [];
    for (let i = 0; i < 5; i++) {
      const tile = buildTerrainSegment(-70 * i + 30, i);
      terrainTiles.push(tile);
      terrainGroup.add(tile);
    }

    // 7. Player Aircraft & Ground Reticle
    const { plane: playerMesh, propGroup } = buildPlayerAircraft(playerSkinId);
    playerMesh.position.set(0, 8, 14);
    scene.add(playerMesh);

    const bombReticle = buildBombReticle();
    scene.add(bombReticle);

    // Muzzle flash lights
    const muzzleFlashL = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xfff000 })
    );
    const muzzleFlashR = muzzleFlashL.clone();
    muzzleFlashL.position.set(-2.6, -0.05, -2.1);
    muzzleFlashR.position.set(2.6, -0.05, -2.1);
    muzzleFlashL.visible = false;
    muzzleFlashR.visible = false;
    playerMesh.add(muzzleFlashL, muzzleFlashR);

    // 8. Wingman Autonomous System with AI
    const wingmanSystem = new WingmanSystem(
      scene,
      playerState.selectedWingman,
      (msg: string) => {
        if (onCommsRef.current) {
          onCommsRef.current(msg);
        }
      },
      wingmanSkinId
    );

    // 9. Tactical Challenge Manager (Random Secondary Objectives)
    const challengeManager = new TacticalChallengeManager(
      challenge => {
        onUpdateState(prev => ({ ...prev, tacticalChallenge: challenge }));
      },
      (rewardGold, title) => {
        if (onChallengeRewardRef.current) {
          onChallengeRewardRef.current(rewardGold, title);
        }
      }
    );

    // 10. Collections
    const bullets: BulletEntity[] = [];
    const bombs: BombEntity[] = [];
    const enemies: EnemyEntity[] = [];
    const groundTargets: GroundTargetEntity[] = [];
    const pickups: PickupEntity[] = [];
    const particles: ParticleEntity[] = [];

    // Internal Variables
    let frame = 0;
    let cameraShake = 0;
    let lastTime = performance.now();
    let reloadCounter = 0;
    let comboTimer = 0;
    let bossSpawned = false;

    // Movement Input State
    const inputState = {
      targetX: 0,
      targetZ: 14,
      keys: {} as Record<string, boolean>,
    };

    // Vector helpers for Damage Numbers 3D->2D Projection
    const tempProjVec = new THREE.Vector3();
    const emitDamageNumber = (
      x: number,
      y: number,
      z: number,
      amount: number,
      isCrit = false,
      isBomb = false,
      isHeal = false,
      text?: string
    ) => {
      if (!onDamageEventRef.current) return;
      tempProjVec.set(x, y, z);
      tempProjVec.project(camera);

      if (tempProjVec.z < 1) {
        const screenX = Math.round(((tempProjVec.x + 1) / 2) * 100);
        const screenY = Math.round(((-tempProjVec.y + 1) / 2) * 100);
        onDamageEventRef.current({
          id: `dmg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          screenX,
          screenY,
          amount,
          isCrit,
          isBomb,
          isHeal,
          text,
          createdAt: Date.now(),
        });
      }
    };

    // Raycaster for mouse plane interception
    const raycaster = new THREE.Raycaster();
    const flightPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -8);
    const pointerPos = new THREE.Vector2();

    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!activeRef.current || pausedRef.current) return;
      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;

      pointerPos.set(x, y);
      raycaster.setFromCamera(pointerPos, camera);
      const hitPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(flightPlane, hitPoint);
      if (hitPoint) {
        inputState.targetX = THREE.MathUtils.clamp(hitPoint.x, -21, 21);
        inputState.targetZ = THREE.MathUtils.clamp(hitPoint.z, -3, 24);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (controlModeRef.current === 'mouse') {
        handlePointerMove(e.clientX, e.clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      inputState.keys[e.code] = true;
      if (e.code === 'Space') {
        triggerBombDrop();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      inputState.keys[e.code] = false;
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerBombDrop();
    };

    // Public Bomb Trigger
    const triggerBombDrop = () => {
      if (!activeRef.current || pausedRef.current) return;
      challengeManager.onBombUsed();

      onUpdateState(prev => {
        if (prev.bombs <= 0) return prev;

        sound.bombDrop();
        const bombMesh = buildBomb();
        bombMesh.position.copy(playerMesh.position);
        bombMesh.position.y -= 0.5;

        // Shadow projection on ground
        const shadowMesh = new THREE.Mesh(
          new THREE.CircleGeometry(0.5, 12),
          new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 })
        );
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.set(bombMesh.position.x, 0.1, bombMesh.position.z);
        scene.add(shadowMesh);

        scene.add(bombMesh);
        bombs.push({
          mesh: bombMesh,
          velocity: new THREE.Vector3(0, -0.32, -0.38),
          targetY: 0.1,
          shadowMesh,
        });

        return {
          ...prev,
          bombs: prev.bombs - 1,
          stats: {
            ...prev.stats,
            bombsDropped: prev.stats.bombsDropped + 1,
          },
        };
      });
    };

    (window as unknown as { triggerGameBomb?: () => void }).triggerGameBomb = triggerBombDrop;

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('contextmenu', onContextMenu);

    // Particle Burst System
    const spawnExplosion = (x: number, y: number, z: number, count = 28, isHuge = false) => {
      sound.explode(isHuge ? 'huge' : count > 15 ? 'medium' : 'small');
      cameraShake = Math.max(cameraShake, isHuge ? 1.5 : 0.7);

      for (let i = 0; i < count; i++) {
        const size = (Math.random() * 0.45 + 0.25) * (isHuge ? 2.2 : 1.0);
        const isFire = Math.random() > 0.35;
        const color = isFire
          ? (Math.random() > 0.5 ? 0xff4500 : 0xfbbf24)
          : (Math.random() > 0.5 ? 0x222222 : 0x475569);

        const pMesh = new THREE.Mesh(
          new THREE.BoxGeometry(size, size, size),
          new THREE.MeshStandardMaterial({
            color,
            roughness: 0.6,
            metalness: 0.3,
            emissive: isFire ? color : 0x000000,
            emissiveIntensity: isFire ? 0.6 : 0,
          })
        );
        pMesh.position.set(x, y, z);
        pMesh.castShadow = true;

        const speedMult = isHuge ? 1.6 : 0.9;
        const vel = new THREE.Vector3(
          (Math.random() - 0.5) * speedMult,
          (Math.random() * 0.9 + 0.2) * speedMult,
          (Math.random() - 0.5) * speedMult
        );

        scene.add(pMesh);
        particles.push({
          mesh: pMesh,
          velocity: vel,
          life: 1.0,
          decay: Math.random() * 0.025 + 0.02,
          rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
          ),
        });
      }
    };

    // Parachute Pickup Spawner
    const spawnPickup = (x: number, z: number, type?: PickupType) => {
      const selectedType: PickupType =
        type || (Math.random() < 0.45 ? 'bomb' : Math.random() < 0.75 ? 'repair' : 'medal');
      const pickupGroup = buildPickup(selectedType);
      pickupGroup.position.set(x, 8, z);
      scene.add(pickupGroup);

      pickups.push({
        mesh: pickupGroup,
        type: selectedType,
        velocity: new THREE.Vector3(0, 0, 0.16),
      });
    };

    // Player Shooting Logic
    const firePlayerGuns = () => {
      sound.shoot();
      muzzleFlashL.visible = true;
      muzzleFlashR.visible = true;
      setTimeout(() => {
        muzzleFlashL.visible = false;
        muzzleFlashR.visible = false;
      }, 35);

      const bulletDmg = 18 + (upgradesRef.current.cannonDamage || 1) * 3;
      const bulletMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

      [-2.6, 2.6].forEach(offset => {
        const bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 1.8), bulletMat);
        bMesh.position.set(playerMesh.position.x + offset, playerMesh.position.y - 0.05, playerMesh.position.z - 2.2);
        scene.add(bMesh);

        bullets.push({
          mesh: bMesh,
          velocity: new THREE.Vector3(0, 0, -1.8),
          isEnemy: false,
          damage: bulletDmg,
          life: 60,
        });
      });

      onUpdateState(prev => ({
        ...prev,
        stats: { ...prev.stats, shotsFired: prev.stats.shotsFired + 2 },
      }));
    };

    // Enemy Gunfire
    const fireEnemyBullet = (fromPos: THREE.Vector3, speed = 0.36, isSpread = false) => {
      sound.flakShot();
      const bMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

      if (isSpread) {
        [-0.15, 0, 0.15].forEach(angle => {
          const bMesh = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), bMat);
          bMesh.position.copy(fromPos);
          const dir = new THREE.Vector3().subVectors(playerMesh.position, fromPos).normalize();
          dir.x += angle;
          dir.normalize();
          scene.add(bMesh);
          bullets.push({
            mesh: bMesh,
            velocity: dir.multiplyScalar(speed),
            isEnemy: true,
            damage: 12,
            life: 140,
          });
        });
      } else {
        const bMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), bMat);
        bMesh.position.copy(fromPos);
        const dir = new THREE.Vector3().subVectors(playerMesh.position, fromPos).normalize();
        scene.add(bMesh);
        bullets.push({
          mesh: bMesh,
          velocity: dir.multiplyScalar(speed),
          isEnemy: true,
          damage: 14,
          life: 140,
        });
      }
    };

    // Enemy Spawner with Stuka, Torpedo, and Boss classes
    const spawnEnemy = (wave = 1) => {
      const typeRoll = Math.random();
      let type: EnemyType = 'fighter';

      if (playerState.mission.hasBoss && !bossSpawned && frame > 900) {
        type = 'boss';
        bossSpawned = true;
      } else if (typeRoll < 0.25) {
        type = 'stuka';
      } else if (typeRoll < 0.5) {
        type = 'torpedo';
      } else if (wave >= 3 && typeRoll < 0.75) {
        type = 'ace';
      } else if (wave >= 2 && typeRoll < 0.9) {
        type = 'bomber';
      } else {
        type = 'fighter';
      }

      const { plane: eMesh, propeller, propellers } = buildEnemyAircraft(type);
      const spawnX = type === 'boss' ? 0 : (Math.random() - 0.5) * 36;
      const spawnZ = type === 'boss' ? -65 : -55;
      eMesh.position.set(spawnX, type === 'boss' ? 9.5 : 8, spawnZ);
      scene.add(eMesh);

      let baseHp = 30;
      let speed = 0.22 + Math.random() * 0.08;
      let scoreVal = 150;

      if (type === 'boss') {
        baseHp = 1200;
        speed = 0.06;
        scoreVal = 2500;
      } else if (type === 'stuka') {
        baseHp = 50;
        speed = 0.26;
        scoreVal = 280;
      } else if (type === 'torpedo') {
        baseHp = 80;
        speed = 0.18;
        scoreVal = 320;
      } else if (type === 'bomber') {
        baseHp = 95;
        speed = 0.16;
        scoreVal = 450;
      } else if (type === 'ace') {
        baseHp = 55;
        speed = 0.32;
        scoreVal = 350;
      }

      enemies.push({
        mesh: eMesh,
        type,
        hp: baseHp,
        maxHp: baseHp,
        speed,
        fireCooldown: Math.floor(45 + Math.random() * 55),
        scoreValue: scoreVal,
        timeOffset: Math.random() * 100,
        propeller,
        propellers,
        diveState: type === 'stuka' ? 'cruise' : undefined,
        diveTimer: 0,
        bossHealthBar: type === 'boss',
      });
    };

    const spawnGroundStructure = (z = -80) => {
      const types: GroundTargetType[] = ['factory', 'flak', 'fuel_depot', 'radar'];
      const type = types[Math.floor(Math.random() * types.length)];
      const { group: gMesh, turret, smokingPipes } = buildGroundTarget(type);

      const x = (Math.random() - 0.5) * 32;
      gMesh.position.set(x, 0, z);
      scene.add(gMesh);

      const hp = type === 'factory' ? 140 : type === 'fuel_depot' ? 90 : 70;
      const score = type === 'factory' ? 600 : type === 'fuel_depot' ? 450 : 300;

      groundTargets.push({
        mesh: gMesh,
        type,
        hp,
        maxHp: hp,
        scoreValue: score,
        fireCooldown: Math.floor(70 + Math.random() * 60),
        turret,
        smokingPipes,
      });
    };

    // Populate initial ground installations
    spawnGroundStructure(-30);
    spawnGroundStructure(-65);
    spawnGroundStructure(-100);

    // Start Sound Engine
    sound.startEngine();

    // 10. Main Animation Loop
    let animId: number;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);

      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Propeller spin
      propGroup.rotation.z += 0.85;

      // Update Dynamic Weather Engine
      weatherManager.update(dt, frame);

      // Camera screen shake
      if (cameraShake > 0) {
        camera.position.x = (Math.random() - 0.5) * cameraShake;
        camera.position.y = 36 + (Math.random() - 0.5) * cameraShake;
        cameraShake *= 0.88;
        if (cameraShake < 0.02) {
          cameraShake = 0;
          camera.position.set(0, 36, 26);
        }
      }

      if (!activeRef.current || pausedRef.current) {
        renderer.render(scene, camera);
        return;
      }

      frame++;

      // Keyboard Controls
      if (controlModeRef.current === 'keyboard') {
        const k = inputState.keys;
        const keySpeed = 0.55;
        if (k['ArrowLeft'] || k['KeyA']) inputState.targetX -= keySpeed;
        if (k['ArrowRight'] || k['KeyD']) inputState.targetX += keySpeed;
        if (k['ArrowUp'] || k['KeyW']) inputState.targetZ -= keySpeed;
        if (k['ArrowDown'] || k['KeyS']) inputState.targetZ += keySpeed;
        inputState.targetX = THREE.MathUtils.clamp(inputState.targetX, -21, 21);
        inputState.targetZ = THREE.MathUtils.clamp(inputState.targetZ, -3, 24);
      }

      // Player flight interpolation
      const dx = inputState.targetX - playerMesh.position.x;
      const dz = inputState.targetZ - playerMesh.position.z;
      playerMesh.position.x += dx * 0.12;
      playerMesh.position.z += dz * 0.12;

      // Bank Roll & Pitch Tilt
      const targetRoll = -dx * 0.18;
      const targetPitch = dz * 0.08;
      playerMesh.rotation.z += (targetRoll - playerMesh.rotation.z) * 0.2;
      playerMesh.rotation.x += (targetPitch - playerMesh.rotation.x) * 0.2;

      // Update flight instruments telemetry (pitch, roll, heading)
      if (frame % 3 === 0) {
        const pitchDeg = Math.round((-playerMesh.rotation.x * 180) / Math.PI * 1.8);
        const rollDeg = Math.round((playerMesh.rotation.z * 180) / Math.PI);
        const headingDeg = Math.round(((360 + playerMesh.position.x * 2.8 - playerMesh.rotation.z * 24) % 360 + 360) % 360);
        onUpdateState(prev => {
          if (
            prev.flightPitch === pitchDeg &&
            prev.flightRoll === rollDeg &&
            prev.flightHeading === headingDeg
          ) {
            return prev;
          }
          return {
            ...prev,
            flightPitch: pitchDeg,
            flightRoll: rollDeg,
            flightHeading: headingDeg,
          };
        });
      }

      // Update Tactical Challenge system
      challengeManager.update(dt);

      // Engine Pitch Modulation
      sound.updateEnginePitch(Math.abs(dz) * 0.2, playerMesh.rotation.z);

      // Reticle follow
      bombReticle.position.set(playerMesh.position.x, 0.15, playerMesh.position.z - 8.5);
      bombReticle.rotation.z += 0.02;

      // Update Autonomous Wingman AI (Formation, Coordinated Attack, Emergency Intercept)
      const currentHpPct = (playerStateRef.current.hp / playerStateRef.current.maxHp) * 100;
      wingmanSystem.update(
        dt,
        frame,
        playerMesh.position,
        playerMesh.rotation.z,
        currentHpPct,
        enemies,
        groundTargets,
        bullets,
        newBullet => bullets.push(newBullet),
        (ix, iy, iz) => {
          spawnExplosion(ix, iy, iz, 8);
          emitDamageNumber(ix, iy, iz, 0, false, false, false, 'INTERCEPTED!');
        }
      );

      // Auto Continuous Machine Gun Fire
      const fireInterval = Math.max(4, 9 - Math.floor((upgradesRef.current.cannonFireRate || 1) * 0.5));
      if (frame % fireInterval === 0) {
        firePlayerGuns();
      }

      // Bomb Reload Timer
      reloadCounter++;
      const reloadTotalFrames = Math.max(180, 360 - (upgradesRef.current.bombReloadSpeed || 1) * 16);
      const reloadPct = Math.min(1, reloadCounter / reloadTotalFrames);

      if (reloadCounter >= reloadTotalFrames) {
        reloadCounter = 0;
        onUpdateState(prev => {
          if (prev.bombs < prev.maxBombs) {
            return { ...prev, bombs: prev.bombs + 1, bombReloadProgress: 0 };
          }
          return { ...prev, bombReloadProgress: 1 };
        });
      } else {
        if (frame % 15 === 0) {
          onUpdateState(prev => ({ ...prev, bombReloadProgress: reloadPct }));
        }
      }

      // Combo Decay Timer
      if (comboTimer > 0) {
        comboTimer -= dt;
        if (comboTimer <= 0) {
          onUpdateState(prev => ({ ...prev, combo: 0, comboMultiplier: 1 }));
        }
      }

      // Scroll Terrain Segments
      const scrollSpeed = 0.32;
      terrainTiles.forEach(tile => {
        tile.position.z += scrollSpeed;
        if (tile.position.z > 80) {
          tile.position.z -= 70 * terrainTiles.length;
        }
      });

      // Spawning Cadence
      const currentWave = Math.min(5, Math.floor(frame / 1200) + 1);
      if (frame % Math.max(50, 95 - currentWave * 8) === 0) {
        spawnEnemy(currentWave);
      }
      if (frame % 140 === 0) {
        spawnGroundStructure(-90);
      }

      // Update Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.mesh.position.add(b.velocity);
        b.life--;

        if (b.isEnemy) {
          // Collide with player
          if (b.mesh.position.distanceTo(playerMesh.position) < 1.9) {
            sound.playerHit();
            spawnExplosion(playerMesh.position.x, playerMesh.position.y, playerMesh.position.z, 8);
            scene.remove(b.mesh);
            bullets.splice(i, 1);
            challengeManager.onPlayerDamaged();

            emitDamageNumber(playerMesh.position.x, playerMesh.position.y, playerMesh.position.z, b.damage, false, false, false, `-${b.damage}`);

            onUpdateState(prev => {
              const nextHp = Math.max(0, prev.hp - b.damage);
              if (nextHp <= 0) {
                spawnExplosion(playerMesh.position.x, playerMesh.position.y, playerMesh.position.z, 60, true);
                onGameOver();
              }
              return { ...prev, hp: nextHp };
            });
            continue;
          }
        } else {
          // Player & Wingman bullets collide with enemies
          for (let j = enemies.length - 1; j >= 0; j--) {
            const en = enemies[j];
            const hitDist = en.type === 'boss' ? 7.5 : en.type === 'bomber' ? 3.6 : 2.4;
            if (b.mesh.position.distanceTo(en.mesh.position) < hitDist) {
              en.hp -= b.damage;
              spawnExplosion(b.mesh.position.x, b.mesh.position.y, b.mesh.position.z, 3);
              scene.remove(b.mesh);
              bullets.splice(i, 1);

              emitDamageNumber(en.mesh.position.x, en.mesh.position.y, en.mesh.position.z, b.damage, b.damage > 28, false, false);

              onUpdateState(prev => ({
                ...prev,
                stats: { ...prev.stats, shotsHit: prev.stats.shotsHit + 1 },
              }));

              if (en.hp <= 0) {
                const isHuge = en.type === 'bomber' || en.type === 'boss';
                spawnExplosion(en.mesh.position.x, en.mesh.position.y, en.mesh.position.z, isHuge ? 65 : 22, isHuge);

                if (en.type === 'boss') {
                  onUpdateState(prev => ({
                    ...prev,
                    missionBossDefeated: true,
                  }));
                }

                if (Math.random() < (en.type === 'bomber' || en.type === 'boss' ? 0.9 : 0.35)) {
                  spawnPickup(en.mesh.position.x, en.mesh.position.z);
                }

                scene.remove(en.mesh);
                enemies.splice(j, 1);
                challengeManager.onAirKill(en.type);

                comboTimer = 3.5;
                onUpdateState(prev => {
                  const newCombo = prev.combo + 1;
                  const mult = Math.min(5, 1 + Math.floor(newCombo / 4));
                  const earned = en.scoreValue * mult;
                  const newAirKills = prev.missionAirKills + 1;

                  const meetsAir = newAirKills >= prev.mission.targetAirKills;
                  const meetsGround = prev.missionGroundKills >= prev.mission.targetGroundKills;
                  const meetsBoss = !prev.mission.hasBoss || prev.missionBossDefeated || en.type === 'boss';

                  if (meetsAir && meetsGround && meetsBoss && !prev.missionComplete) {
                    setTimeout(() => onMissionComplete(), 500);
                  }

                  return {
                    ...prev,
                    score: prev.score + earned,
                    combo: newCombo,
                    comboMultiplier: mult,
                    missionAirKills: newAirKills,
                    missionComplete: meetsAir && meetsGround && meetsBoss,
                    stats: {
                      ...prev.stats,
                      acesDowned: prev.stats.acesDowned + 1,
                      maxCombo: Math.max(prev.stats.maxCombo, newCombo),
                    },
                  };
                });
              }
              break;
            }
          }
        }

        if (b.life <= 0 || b.mesh.position.z < -80 || b.mesh.position.z > 40) {
          scene.remove(b.mesh);
          bullets.splice(i, 1);
        }
      }

      // Update Bombs
      for (let i = bombs.length - 1; i >= 0; i--) {
        const bm = bombs[i];
        bm.mesh.position.add(bm.velocity);
        bm.velocity.y -= 0.022;
        bm.mesh.rotation.x += 0.05;

        if (bm.shadowMesh) {
          bm.shadowMesh.position.set(bm.mesh.position.x, 0.1, bm.mesh.position.z);
          const heightRatio = THREE.MathUtils.clamp(bm.mesh.position.y / 8, 0.2, 1);
          bm.shadowMesh.scale.setScalar(heightRatio);
        }

        if (bm.mesh.position.y <= bm.targetY) {
          spawnExplosion(bm.mesh.position.x, 0.6, bm.mesh.position.z, 65, true);

          const blastRadius = 11;
          for (let k = groundTargets.length - 1; k >= 0; k--) {
            const gt = groundTargets[k];
            const dist = new THREE.Vector2(
              bm.mesh.position.x - gt.mesh.position.x,
              bm.mesh.position.z - gt.mesh.position.z
            ).length();

            if (dist < blastRadius) {
              const bombDmg = 160;
              gt.hp -= bombDmg;
              spawnExplosion(gt.mesh.position.x, 1.2, gt.mesh.position.z, 35, true);
              emitDamageNumber(gt.mesh.position.x, 1.2, gt.mesh.position.z, bombDmg, true, true, false);

              if (gt.hp <= 0) {
                setTimeout(() => {
                  spawnExplosion(
                    gt.mesh.position.x + (Math.random() - 0.5) * 4,
                    1.5,
                    gt.mesh.position.z + (Math.random() - 0.5) * 4,
                    30,
                    true
                  );
                }, 180);

                spawnPickup(gt.mesh.position.x, gt.mesh.position.z);
                scene.remove(gt.mesh);
                groundTargets.splice(k, 1);
                challengeManager.onGroundTargetBombed();

                onUpdateState(prev => {
                  const newCombo = prev.combo + 1;
                  const mult = Math.min(5, 1 + Math.floor(newCombo / 4));
                  const earned = gt.scoreValue * mult;
                  const newGroundKills = prev.missionGroundKills + 1;

                  const meetsAir = prev.missionAirKills >= prev.mission.targetAirKills;
                  const meetsGround = newGroundKills >= prev.mission.targetGroundKills;
                  const meetsBoss = !prev.mission.hasBoss || prev.missionBossDefeated;

                  if (meetsAir && meetsGround && meetsBoss && !prev.missionComplete) {
                    setTimeout(() => onMissionComplete(), 500);
                  }

                  return {
                    ...prev,
                    score: prev.score + earned,
                    combo: newCombo,
                    comboMultiplier: mult,
                    missionGroundKills: newGroundKills,
                    missionComplete: meetsAir && meetsGround && meetsBoss,
                    stats: {
                      ...prev.stats,
                      groundTargetsBombed: prev.stats.groundTargetsBombed + 1,
                      maxCombo: Math.max(prev.stats.maxCombo, newCombo),
                    },
                  };
                });
              }
            }
          }

          if (bm.shadowMesh) scene.remove(bm.shadowMesh);
          scene.remove(bm.mesh);
          bombs.splice(i, 1);
        }
      }

      // Update Enemies & Stuka Dive Logic
      for (let i = enemies.length - 1; i >= 0; i--) {
        const en = enemies[i];
        en.mesh.position.z += en.speed;

        if (en.propeller) en.propeller.rotation.z += 0.8;
        if (en.propellers) en.propellers.forEach(p => (p.rotation.z += 0.8));

        // Stuka Dive Maneuver & Bomb Release
        if (en.type === 'stuka') {
          if (en.diveState === 'cruise' && en.mesh.position.z > -28) {
            en.diveState = 'diving';
            sound.stukaSiren();
          }
          if (en.diveState === 'diving') {
            en.speed = 0.44;
            en.mesh.position.y -= 0.08;
            en.mesh.rotation.x = Math.PI / 3.5;

            // Dive smoke trail particles
            if (frame % 3 === 0) {
              const sm = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 4, 4),
                new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.5 })
              );
              sm.position.set(en.mesh.position.x, en.mesh.position.y, en.mesh.position.z + 1.5);
              scene.add(sm);
              particles.push({
                mesh: sm,
                velocity: new THREE.Vector3(0, 0, 0.1),
                life: 0.6,
                decay: 0.04,
                rotSpeed: new THREE.Vector3(0, 0, 0),
              });
            }

            // Release 250kg dive bomb at apex of dive
            if (en.mesh.position.y < 4.2) {
              en.diveState = 'pullup';
              sound.bombDrop();
              const stukaBomb = buildBomb();
              stukaBomb.position.copy(en.mesh.position);
              scene.add(stukaBomb);
              bombs.push({
                mesh: stukaBomb,
                velocity: new THREE.Vector3(
                  (playerMesh.position.x - en.mesh.position.x) * 0.02,
                  -0.28,
                  0.35
                ),
                targetY: 0.1,
              });
            }
          } else if (en.diveState === 'pullup') {
            en.mesh.position.y += 0.08;
            en.mesh.rotation.x = -Math.PI / 5;
            if (frame % 15 === 0 && en.mesh.position.z < playerMesh.position.z) {
              fireEnemyBullet(en.mesh.position, 0.45);
            }
          }
        }

        // Torpedo Raider Sea-Skimming Flight & Spread Torpedo Attack
        if (en.type === 'torpedo') {
          en.mesh.position.y = 4.2;
          if (frame % 4 === 0) {
            const wake = new THREE.Mesh(
              new THREE.CircleGeometry(0.6, 8),
              new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
            );
            wake.rotation.x = -Math.PI / 2;
            wake.position.set(en.mesh.position.x, 0.05, en.mesh.position.z);
            scene.add(wake);
            particles.push({
              mesh: wake,
              velocity: new THREE.Vector3(0, 0, 0.3),
              life: 0.5,
              decay: 0.03,
              rotSpeed: new THREE.Vector3(0, 0, 0),
            });
          }
        }

        // Heavy Bomber Carpet Bombing Drops
        if (en.type === 'bomber' && frame % 120 === 0 && en.mesh.position.z < 10) {
          const carpetBomb = buildBomb();
          carpetBomb.scale.set(0.7, 0.7, 0.7);
          carpetBomb.position.copy(en.mesh.position);
          scene.add(carpetBomb);
          bombs.push({
            mesh: carpetBomb,
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.05, -0.3, 0.15),
            targetY: 0.1,
          });
        }

        // Ace evasive weave & High-G roll
        if (en.type === 'ace') {
          en.mesh.position.x += Math.sin((frame + en.timeOffset) * 0.09) * 0.32;
          en.mesh.rotation.z = Math.sin((frame + en.timeOffset) * 0.09) * 0.55;
          for (let bIdx = 0; bIdx < bullets.length; bIdx++) {
            const b = bullets[bIdx];
            if (!b.isEnemy && b.mesh.position.distanceTo(en.mesh.position) < 6.0) {
              en.mesh.rotation.z += 0.4;
              en.mesh.position.x += (b.mesh.position.x > en.mesh.position.x ? -0.2 : 0.2);
              break;
            }
          }
        }

        // Enemy firing mechanics
        en.fireCooldown--;
        if (en.fireCooldown <= 0 && en.mesh.position.z < playerMesh.position.z + 4) {
          if (en.type === 'torpedo') {
            fireEnemyBullet(en.mesh.position, 0.38, true);
            en.fireCooldown = 90;
          } else if (en.type === 'boss') {
            fireEnemyBullet(en.mesh.position, 0.4, true);
            setTimeout(() => {
              fireEnemyBullet(new THREE.Vector3(en.mesh.position.x - 8, en.mesh.position.y, en.mesh.position.z), 0.36);
              fireEnemyBullet(new THREE.Vector3(en.mesh.position.x + 8, en.mesh.position.y, en.mesh.position.z), 0.36);
            }, 120);
            en.fireCooldown = 50;
          } else if (en.type === 'ace') {
            fireEnemyBullet(en.mesh.position, 0.46);
            setTimeout(() => fireEnemyBullet(en.mesh.position, 0.46), 70);
            en.fireCooldown = 65;
          } else {
            fireEnemyBullet(en.mesh.position, en.type === 'bomber' ? 0.32 : 0.42);
            en.fireCooldown = en.type === 'bomber' ? 65 : 85;
          }
        }

        if (en.mesh.position.distanceTo(playerMesh.position) < 3.2) {
          sound.playerHit();
          spawnExplosion(en.mesh.position.x, en.mesh.position.y, en.mesh.position.z, 35, true);
          scene.remove(en.mesh);
          enemies.splice(i, 1);
          challengeManager.onPlayerDamaged();

          onUpdateState(prev => {
            const nextHp = Math.max(0, prev.hp - 35);
            if (nextHp <= 0) {
              spawnExplosion(playerMesh.position.x, playerMesh.position.y, playerMesh.position.z, 60, true);
              onGameOver();
            }
            return { ...prev, hp: nextHp };
          });
          continue;
        }

        if (en.mesh.position.z > 36) {
          scene.remove(en.mesh);
          enemies.splice(i, 1);
        }
      }

      // Update Ground Targets
      for (let i = groundTargets.length - 1; i >= 0; i--) {
        const gt = groundTargets[i];
        gt.mesh.position.z += scrollSpeed;

        if (gt.type === 'factory' && gt.smokingPipes && frame % 12 === 0) {
          gt.smokingPipes.forEach(pipe => {
            const sm = new THREE.Mesh(
              new THREE.SphereGeometry(0.35, 6, 6),
              new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.6 })
            );
            sm.position.set(gt.mesh.position.x + pipe.x, pipe.y, gt.mesh.position.z + pipe.z);
            scene.add(sm);
            particles.push({
              mesh: sm,
              velocity: new THREE.Vector3((Math.random() - 0.5) * 0.05, 0.15, scrollSpeed * 0.5),
              life: 1.0,
              decay: 0.025,
              rotSpeed: new THREE.Vector3(0, 0, 0),
            });
          });
        }

        if (gt.type === 'flak' && gt.turret) {
          gt.turret.lookAt(playerMesh.position.x, playerMesh.position.y, playerMesh.position.z);
          gt.fireCooldown--;
          if (gt.fireCooldown <= 0 && gt.mesh.position.z < playerMesh.position.z + 16) {
            fireEnemyBullet(new THREE.Vector3(gt.mesh.position.x, 3.0, gt.mesh.position.z), 0.38);
            gt.fireCooldown = Math.floor(95 + Math.random() * 45);
          }
        }

        if (gt.type === 'radar' && gt.turret) {
          gt.turret.rotation.y += 0.04;
        }

        if (gt.mesh.position.z > 45) {
          scene.remove(gt.mesh);
          groundTargets.splice(i, 1);
        }
      }

      // Update Parachute Pickups
      for (let i = pickups.length - 1; i >= 0; i--) {
        const pk = pickups[i];
        pk.mesh.position.add(pk.velocity);
        pk.mesh.rotation.y += 0.03;
        pk.mesh.rotation.z = Math.sin(frame * 0.05) * 0.15;

        if (pk.mesh.position.distanceTo(playerMesh.position) < 3.2) {
          sound.pickup();
          scene.remove(pk.mesh);
          pickups.splice(i, 1);

          onUpdateState(prev => {
            let nextBombs = prev.bombs;
            let nextHp = prev.hp;
            let bonusScore = 0;

            if (pk.type === 'bomb') {
              nextBombs = Math.min(prev.maxBombs, prev.bombs + 1);
              bonusScore = 150;
              emitDamageNumber(playerMesh.position.x, playerMesh.position.y, playerMesh.position.z, 0, false, false, true, '+1 BOMB!');
            } else if (pk.type === 'repair') {
              nextHp = Math.min(prev.maxHp, prev.hp + 35);
              bonusScore = 150;
              emitDamageNumber(playerMesh.position.x, playerMesh.position.y, playerMesh.position.z, 35, false, false, true, '+35 REPAIR');
            } else {
              bonusScore = 800;
              emitDamageNumber(playerMesh.position.x, playerMesh.position.y, playerMesh.position.z, 800, true, false, false, '+800 MEDAL');
            }

            return {
              ...prev,
              bombs: nextBombs,
              hp: nextHp,
              score: prev.score + bonusScore,
              stats: {
                ...prev.stats,
                itemsCollected: prev.stats.itemsCollected + 1,
              },
            };
          });
          continue;
        }

        if (pk.mesh.position.z > 36) {
          scene.remove(pk.mesh);
          pickups.splice(i, 1);
        }
      }

      // Update Particle Physics
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.mesh.position.add(p.velocity);
        p.velocity.y -= 0.014;
        p.mesh.rotation.x += p.rotSpeed.x;
        p.mesh.rotation.y += p.rotSpeed.y;
        p.life -= p.decay;

        const currentScale = Math.max(0.01, p.life);
        p.mesh.scale.set(currentScale, currentScale, currentScale);

        if (p.life <= 0 || p.mesh.position.y < -2) {
          scene.remove(p.mesh);
          particles.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(gameLoop);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      sound.stopEngine();
      weatherManager.dispose();
      wingmanSystem.dispose();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('resize', handleResize);
      delete (window as unknown as { triggerGameBomb?: () => void }).triggerGameBomb;

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-crosshair overflow-hidden touch-none"
    />
  );
};
