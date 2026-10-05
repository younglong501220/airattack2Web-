import * as THREE from 'three';
import { WingmanType, EnemyEntity, GroundTargetEntity, BulletEntity } from '../types';
import { buildWingmanAircraft, buildBomb } from '../models';
import { sound } from '../../audio/soundEngine';

export class WingmanSystem {
  public mesh: THREE.Group | null = null;
  private prop: THREE.Mesh | THREE.Group | null = null;
  public type: WingmanType;
  private scene: THREE.Scene;

  // AI & Flight State
  private formationOffset: THREE.Vector3;
  private currentVelocity: THREE.Vector3 = new THREE.Vector3();
  private fireCooldown: number = 0;
  private rocketCooldown: number = 0;
  private isDefensiveMode: boolean = false;
  private defensiveNotifyCooldown: number = 0;

  // Callback for radio communications
  private onCommsCallback?: (msg: string) => void;

  constructor(
    scene: THREE.Scene,
    type: WingmanType,
    onComms?: (msg: string) => void,
    skinId?: string
  ) {
    this.scene = scene;
    this.type = type;
    this.onCommsCallback = onComms;

    if (type !== 'none') {
      const built = buildWingmanAircraft(type as 'hurricane' | 'dauntless' | 'mustang', skinId);
      this.mesh = built.plane;
      this.prop = built.prop;

      const isRightSide = type === 'dauntless';
      this.formationOffset = new THREE.Vector3(isRightSide ? 4.5 : -4.5, 0, 1.4);
      this.mesh.position.set(this.formationOffset.x, 8, 14 + this.formationOffset.z);
      this.scene.add(this.mesh);

      if (this.onCommsCallback) {
        const wingmanNames: Record<string, string> = {
          hurricane: '【颶風號】已就戰鬥編隊！全空域機砲掩護就緒。',
          dauntless: '【無畏號】到達作戰空域！準備對地火箭壓制。',
          mustang: '【野馬號】就位！空中護衛與彈幕截擊系統全開。',
        };
        this.onCommsCallback(wingmanNames[type] || '僚機已編隊加入戰鬥。');
      }
    } else {
      this.formationOffset = new THREE.Vector3(0, 0, 0);
    }
  }

  public update(
    dt: number,
    frame: number,
    playerPos: THREE.Vector3,
    playerRoll: number,
    playerHpPct: number,
    enemies: EnemyEntity[],
    groundTargets: GroundTargetEntity[],
    bullets: BulletEntity[],
    onSpawnBullet: (b: BulletEntity) => void,
    onInterceptNotice: (x: number, y: number, z: number) => void
  ) {
    if (!this.mesh || this.type === 'none') return;

    // Propeller idle/combat spin
    if (this.prop) {
      this.prop.rotation.z += 0.9;
    }

    // 1. Check Player Armor Condition (Switch to Emergency Intercept AI if HP < 35%)
    const hpIsLow = playerHpPct < 35;
    if (hpIsLow && !this.isDefensiveMode) {
      this.isDefensiveMode = true;
      if (this.onCommsCallback && this.defensiveNotifyCooldown <= 0) {
        this.onCommsCallback('【僚機通訊】主機裝甲告急！我已切換防禦攔截姿態，掩護長官！');
        this.defensiveNotifyCooldown = 300; // frames
      }
    } else if (!hpIsLow && this.isDefensiveMode) {
      this.isDefensiveMode = false;
    }

    if (this.defensiveNotifyCooldown > 0) {
      this.defensiveNotifyCooldown--;
    }

    // 2. Flight Position and Formation Follow AI
    // In defensive mode, wingman moves closer to front of player to screen bullets
    const targetOffset = this.isDefensiveMode
      ? new THREE.Vector3(
          this.formationOffset.x * 0.65,
          this.formationOffset.y + 0.2,
          this.formationOffset.z - 1.2
        )
      : this.formationOffset;

    const targetX = playerPos.x + targetOffset.x;
    const targetZ = playerPos.z + targetOffset.z;

    // Smooth physics spring follow
    const dX = targetX - this.mesh.position.x;
    const dZ = targetZ - this.mesh.position.z;
    this.mesh.position.x += dX * 0.14;
    this.mesh.position.z += dZ * 0.14;

    // Wingman banks and rolls naturally in echelon formation
    const wingmanRoll = -dX * 0.18 + playerRoll * 0.4;
    this.mesh.rotation.z += (wingmanRoll - this.mesh.rotation.z) * 0.2;
    this.mesh.rotation.x = playerRoll * 0.2;

    // 3. Defensive Intercept AI (Destroys enemy bullets heading toward player)
    if (this.isDefensiveMode || this.type === 'mustang') {
      const interceptRadius = this.isDefensiveMode ? 9.5 : 7.0;
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (b.isEnemy && b.mesh.position.distanceTo(playerPos) < interceptRadius) {
          // Intercept shot!
          sound.wingmanFire();
          onInterceptNotice(b.mesh.position.x, b.mesh.position.y, b.mesh.position.z);
          this.scene.remove(b.mesh);
          bullets.splice(i, 1);
          break; // Max 1 intercept per frame
        }
      }
    }

    // 4. Coordinated Target Attack AI
    // Priority:
    // A. Enemies aligned with player's firing lane (player target priority)
    // B. Diving Stuka or Boss
    // C. Closest airborne enemy
    let targetEnemy: EnemyEntity | null = null;
    let minDistance = 999;

    for (const en of enemies) {
      if (en.mesh.position.z < playerPos.z + 1 && en.mesh.position.z > -60) {
        // Check if aligned with player
        const isPlayerAligned = Math.abs(en.mesh.position.x - playerPos.x) < 4.0;
        const isHighThreat = en.type === 'stuka' || en.type === 'boss';
        const dist = en.mesh.position.distanceTo(this.mesh.position);

        if (isPlayerAligned || isHighThreat) {
          targetEnemy = en;
          break;
        } else if (dist < minDistance) {
          minDistance = dist;
          targetEnemy = en;
        }
      }
    }

    // Autonomous Gunfire Cadence
    this.fireCooldown--;
    const fireInterval = this.type === 'hurricane' ? 11 : this.type === 'mustang' ? 14 : 16;

    if (this.fireCooldown <= 0 && targetEnemy) {
      this.fireCooldown = fireInterval;
      sound.wingmanFire();

      // Wingman aims forward with slight convergence towards target
      const targetDir = new THREE.Vector3(
        (targetEnemy.mesh.position.x - this.mesh.position.x) * 0.04,
        0,
        -1.8
      ).normalize();

      const bulletMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
      [-1.4, 1.4].forEach(offset => {
        if (!this.mesh) return;
        const bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 1.6), bulletMat);
        bMesh.position.set(
          this.mesh.position.x + offset,
          this.mesh.position.y,
          this.mesh.position.z - 1.8
        );
        this.scene.add(bMesh);

        onSpawnBullet({
          mesh: bMesh,
          velocity: targetDir.clone().multiplyScalar(1.8),
          isEnemy: false,
          damage: 18,
          life: 60,
          isWingman: true,
        });
      });
    }

    // 5. Dauntless Ground Rocket Strike AI
    if (this.type === 'dauntless') {
      this.rocketCooldown--;
      if (this.rocketCooldown <= 0 && groundTargets.length > 0) {
        this.rocketCooldown = 150; // every ~2.5s
        const targetGt = groundTargets[0];
        sound.bombDrop();

        const rocketMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 1.8, 8),
          new THREE.MeshStandardMaterial({ color: 0x0284c7 })
        );
        rocketMesh.rotation.x = Math.PI / 2.5;
        rocketMesh.position.copy(this.mesh.position);
        this.scene.add(rocketMesh);

        // Rocket travels at high speed toward bunker
        const dir = new THREE.Vector3(
          (targetGt.mesh.position.x - this.mesh.position.x) * 0.035,
          -0.38,
          (targetGt.mesh.position.z - this.mesh.position.z) * 0.045
        );

        onSpawnBullet({
          mesh: rocketMesh as unknown as THREE.Mesh,
          velocity: dir,
          isEnemy: false,
          damage: 120,
          life: 90,
          isWingman: true,
        });

        if (this.onCommsCallback && frame % 300 === 0) {
          this.onCommsCallback('【無畏號】已鎖定地面工事，俯衝穿甲火箭已發射！');
        }
      }
    }
  }

  public dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh = null;
      this.prop = null;
    }
  }
}
