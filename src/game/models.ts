import * as THREE from 'three';
import { EnemyType, GroundTargetType, PickupType } from './types';
import { AircraftSkin, getSkinById } from './aircraftSkins';

// Shared materials for performance & consistent WWII military aesthetic
const materials = {
  // Player Spitfire
  playerBody: new THREE.MeshStandardMaterial({
    color: 0x3d5236, // Olive Drab Camo
    roughness: 0.45,
    metalness: 0.25,
  }),
  playerCamoDark: new THREE.MeshStandardMaterial({
    color: 0x243322,
    roughness: 0.5,
    metalness: 0.2,
  }),
  playerCanopy: new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    roughness: 0.1,
    metalness: 0.85,
    transparent: true,
    opacity: 0.85,
  }),
  playerYellowAccent: new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.4,
  }),
  playerSpinner: new THREE.MeshStandardMaterial({
    color: 0xd97706, // RAF sky amber spinner
    roughness: 0.3,
    metalness: 0.4,
  }),
  propellerBlur: new THREE.MeshBasicMaterial({
    color: 0x222222,
    transparent: true,
    opacity: 0.6,
  }),
  gunMetal: new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.3,
    metalness: 0.85,
  }),

  // Enemies
  enemyBf109: new THREE.MeshStandardMaterial({
    color: 0x3e4c59, // Luftwaffe Slate Blue-Grey
    roughness: 0.5,
    metalness: 0.25,
  }),
  enemyYellowNose: new THREE.MeshStandardMaterial({
    color: 0xeab308, // Eastern Front Yellow Cowling
    roughness: 0.35,
    metalness: 0.2,
  }),
  enemyAceRed: new THREE.MeshStandardMaterial({
    color: 0xb91c1c, // Crimson Ace trim
    roughness: 0.3,
    metalness: 0.3,
  }),
  enemyBomberGrey: new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.6,
    metalness: 0.15,
  }),
  enemyStukaCamo: new THREE.MeshStandardMaterial({
    color: 0x223825, // Deep Luftwaffe Dunkelgrün
    roughness: 0.55,
  }),
  enemyTorpedoBrown: new THREE.MeshStandardMaterial({
    color: 0x524332,
    roughness: 0.6,
    metalness: 0.2,
  }),
  enemyTitanSteel: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.6,
  }),
  wingmanNavyBlue: new THREE.MeshStandardMaterial({
    color: 0x1e3a5f, // US Navy Sea Blue
    roughness: 0.4,
    metalness: 0.3,
  }),
  wingmanSilverMetal: new THREE.MeshStandardMaterial({
    color: 0xd1d5db, // Polished Aluminum P-51
    roughness: 0.2,
    metalness: 0.85,
  }),
  wingmanRedTail: new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Tuskegee Red Tail
    roughness: 0.35,
  }),

  // Ground targets
  concreteBunker: new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.9,
    metalness: 0.1,
  }),
  brickFactory: new THREE.MeshStandardMaterial({
    color: 0x854d0e,
    roughness: 0.85,
  }),
  factoryRoof: new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.7,
  }),
  fuelTankSilver: new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.25,
    metalness: 0.8,
  }),
  hazardYellow: new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
  }),

  // Bullets & effects
  tracerBullet: new THREE.MeshBasicMaterial({
    color: 0xfef08a,
  }),
  enemyTracer: new THREE.MeshBasicMaterial({
    color: 0xff3b30,
  }),

  // Terrain
  oceanWater: new THREE.MeshStandardMaterial({
    color: 0x153147,
    roughness: 0.25,
    metalness: 0.55,
  }),
  islandGrass: new THREE.MeshStandardMaterial({
    color: 0x2e4125,
    roughness: 0.85,
  }),
  sandCoast: new THREE.MeshStandardMaterial({
    color: 0xa89f76,
    roughness: 0.9,
  }),
  asphaltRunway: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
  }),
};

/**
 * Builds high-fidelity WWII Supermarine Spitfire Mk.IX
 * Hallmarks: Elliptical wings, chin carburetor scoop, underwing dual radiators,
 * teardrop bubble canopy, 12-exhaust Merlin 60 stacks, twin 20mm Hispano cannons.
 */
export function buildSpitfireModel(skin?: AircraftSkin) {
  const activeSkin = skin || getSkinById('spitfire', 'spitfire_raf');
  const plane = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.body,
    roughness: activeSkin.finish.roughness,
    metalness: activeSkin.finish.metalness,
  });
  const camoMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.camo,
    roughness: activeSkin.finish.roughness,
    metalness: activeSkin.finish.metalness,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.accent,
    roughness: activeSkin.finish.roughness,
  });
  const spinnerMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.spinner,
    roughness: 0.25,
    metalness: 0.45,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.belly || 0x64748b,
    roughness: 0.5,
    metalness: 0.2,
  });
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.08,
    metalness: 0.85,
    transparent: true,
    opacity: 0.85,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.cockpitFrame,
    roughness: 0.4,
  });
  const exhaustMat = new THREE.MeshStandardMaterial({
    color: 0x222225,
    roughness: 0.65,
    metalness: 0.75,
  });

  // 1. Fuselage
  // Forward Engine Cowling (Rolls-Royce Merlin 60 series)
  const noseGeo = new THREE.CylinderGeometry(0.68, 0.76, 3.4, 16);
  const nose = new THREE.Mesh(noseGeo, bodyMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.05, -2.1);
  nose.castShadow = true;
  nose.receiveShadow = true;
  plane.add(nose);

  // Upper engine cowl deck
  const noseDeckGeo = new THREE.CylinderGeometry(0.55, 0.6, 3.2, 12, 1, false, 0, Math.PI);
  const noseDeck = new THREE.Mesh(noseDeckGeo, camoMat);
  noseDeck.rotation.x = Math.PI / 2;
  noseDeck.rotation.z = Math.PI / 2;
  noseDeck.position.set(0, 0.32, -2.1);
  plane.add(noseDeck);

  // Cockpit & Center Fuselage Section
  const midFuselageGeo = new THREE.CylinderGeometry(0.76, 0.64, 2.6, 16);
  const midFuselage = new THREE.Mesh(midFuselageGeo, bodyMat);
  midFuselage.rotation.x = Math.PI / 2;
  midFuselage.position.set(0, 0.05, 0.8);
  midFuselage.castShadow = true;
  midFuselage.receiveShadow = true;
  plane.add(midFuselage);

  // Aft Tapering Fuselage
  const aftFuselageGeo = new THREE.CylinderGeometry(0.64, 0.2, 4.2, 16);
  const aftFuselage = new THREE.Mesh(aftFuselageGeo, bodyMat);
  aftFuselage.rotation.x = Math.PI / 2;
  aftFuselage.position.set(0, 0.12, 4.1);
  aftFuselage.castShadow = true;
  aftFuselage.receiveShadow = true;
  plane.add(aftFuselage);

  // Streamlined Needle Propeller Spinner Cone
  const spinnerGeo = new THREE.ConeGeometry(0.66, 1.45, 18);
  const spinnerMesh = new THREE.Mesh(spinnerGeo, spinnerMat);
  spinnerMesh.rotation.x = -Math.PI / 2;
  spinnerMesh.position.set(0, 0.05, -4.3);
  spinnerMesh.castShadow = true;
  plane.add(spinnerMesh);

  // 2. Merlin 60 Series Exhaust Stacks (6 angled ejector stub pipes per side = 12 total)
  [-0.64, 0.64].forEach(sideX => {
    const isRight = sideX > 0;
    for (let i = 0; i < 6; i++) {
      const zPos = -1.3 - i * 0.42;
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.065, 0.36, 8),
        exhaustMat
      );
      pipe.rotation.z = isRight ? -Math.PI / 3 : Math.PI / 3;
      pipe.rotation.x = -Math.PI / 6;
      pipe.position.set(sideX, 0.22, zPos);
      plane.add(pipe);
    }
  });

  // 3. Characteristic Chin Carburetor Air Scoop under nose
  const chinScoopGeo = new THREE.CylinderGeometry(0.24, 0.18, 1.8, 10);
  const chinScoop = new THREE.Mesh(chinScoopGeo, bodyMat);
  chinScoop.rotation.x = Math.PI / 2.1;
  chinScoop.position.set(0, -0.62, -2.5);
  chinScoop.castShadow = true;
  plane.add(chinScoop);

  // Chin scoop air intake hole
  const chinHole = new THREE.Mesh(
    new THREE.CircleGeometry(0.18, 10),
    new THREE.MeshBasicMaterial({ color: 0x111111 })
  );
  chinHole.position.set(0, -0.66, -3.3);
  plane.add(chinHole);

  // 4. Iconic Elliptical Wings with Aerodynamic Dihedral
  // Left Wing (Port) & Right Wing (Starboard)
  const wingGroup = new THREE.Group();
  wingGroup.position.set(0, -0.15, 0.2);

  // Center wing spar
  const centerWing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 2.6), camoMat);
  wingGroup.add(centerWing);

  // Segmented Elliptical Wing Curvature
  [-1, 1].forEach(side => {
    const wingPanel = new THREE.Group();
    // 6-degree dihedral tilt upwards
    wingPanel.rotation.z = side * -0.07;

    // Segment 1: Inboard wide chord
    const seg1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 2.7), camoMat);
    seg1.position.set(side * 2.1, 0, 0.1);
    seg1.castShadow = true;
    wingPanel.add(seg1);

    // Segment 2: Mid-wing elliptical taper
    const seg2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 2.2), camoMat);
    seg2.position.set(side * 4.1, 0, 0.2);
    seg2.castShadow = true;
    wingPanel.add(seg2);

    // Segment 3: Outer elliptical curve
    const seg3 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 1.6), camoMat);
    seg3.position.set(side * 5.7, 0, 0.35);
    seg3.castShadow = true;
    wingPanel.add(seg3);

    // Rounded Elliptical Wingtip
    const tipGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 12);
    const tip = new THREE.Mesh(tipGeo, accentMat);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(side * 6.4, 0, 0.45);
    wingPanel.add(tip);

    // RAF Yellow identification leading edge strip
    const leadingStripe = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.19, 0.2), accentMat);
    leadingStripe.position.set(side * 4.8, 0, -0.85);
    wingPanel.add(leadingStripe);

    // RAF Roundels (Upper wing surface)
    const roundel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.72, 0.02, 18),
      new THREE.MeshBasicMaterial({ color: 0x1d4ed8 })
    );
    roundel.position.set(side * 4.2, 0.1, 0.15);
    const roundelWhite = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 0.025, 18),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    roundelWhite.position.set(side * 4.2, 0.105, 0.15);
    const roundelRed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.03, 18),
      new THREE.MeshBasicMaterial({ color: 0xb91c1c })
    );
    roundelRed.position.set(side * 4.2, 0.11, 0.15);
    wingPanel.add(roundel, roundelWhite, roundelRed);

    // D-Day Invasion stripes support
    if (activeSkin.colors.specialStripes) {
      [-0.4, 0, 0.4].forEach(oz => {
        const stripeW = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        stripeW.position.set(side * 2.8, 0.01, oz);
        const stripeB = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.3), new THREE.MeshBasicMaterial({ color: 0x111111 }));
        stripeB.position.set(side * 2.8, 0.01, oz + 0.15);
        wingPanel.add(stripeW, stripeB);
      });
    }

    // Hispano-Suiza 20mm Cannon Blister & Barrel
    const blisterGeo = new THREE.SphereGeometry(0.18, 8, 8);
    blisterGeo.scale(0.8, 0.6, 2.2);
    const blister = new THREE.Mesh(blisterGeo, camoMat);
    blister.position.set(side * 2.8, 0.1, -0.4);
    const cannonBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 2.4, 8), materials.gunMetal);
    cannonBarrel.rotation.x = Math.PI / 2;
    cannonBarrel.position.set(side * 2.8, 0.06, -1.8);
    cannonBarrel.castShadow = true;
    wingPanel.add(blister, cannonBarrel);

    // Outer .303 Browning Machine Gun Ports
    const browning = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), materials.gunMetal);
    browning.rotation.x = Math.PI / 2;
    browning.position.set(side * 4.6, 0.04, -0.9);
    wingPanel.add(browning);

    wingGroup.add(wingPanel);
  });

  plane.add(wingGroup);

  // 5. Under-Wing Asymmetrical Radiators (Starboard Coolant Radiator + Port Oil Cooler)
  // Starboard Radiator Bath (Rectangular with intake lip and exit flap)
  const radR = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.38, 1.5), bodyMat);
  radR.position.set(1.9, -0.38, 0.3);
  radR.castShadow = true;
  const radHoleR = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), new THREE.MeshBasicMaterial({ color: 0x111111 }));
  radHoleR.position.set(1.9, -0.38, -0.46);
  plane.add(radR, radHoleR);

  // Port Circular Oil Cooler Housing
  const radL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.4, 10), bodyMat);
  radL.rotation.x = Math.PI / 2;
  radL.position.set(-1.9, -0.38, 0.3);
  radL.castShadow = true;
  plane.add(radL);

  // 6. Cockpit Canopy (Teardrop Bubble Glass + Windscreen Frame)
  const canopyBubbleGeo = new THREE.SphereGeometry(0.65, 16, 12);
  canopyBubbleGeo.scale(0.72, 0.85, 2.3);
  const canopyBubble = new THREE.Mesh(canopyBubbleGeo, canopyMat);
  canopyBubble.position.set(0, 0.66, -0.2);
  plane.add(canopyBubble);

  // Windscreen metal frame arch
  const windscreenFrame = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.045, 6, 16, Math.PI),
    frameMat
  );
  windscreenFrame.position.set(0, 0.62, -1.05);
  plane.add(windscreenFrame);

  // Pilot with Leather Helmet & Flying Goggles
  const pilotHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }) // Brown leather
  );
  pilotHead.position.set(0, 0.58, -0.15);
  const goggles = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.1, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9 })
  );
  goggles.position.set(0, 0.62, -0.38);
  const pilotSeat = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.7, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x1e293b })
  );
  pilotSeat.position.set(0, 0.45, 0.25);
  plane.add(pilotHead, goggles, pilotSeat);

  // Dorsal Radio Antenna Mast behind canopy
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.9, 6), frameMat);
  mast.rotation.x = -0.12; // Raked slightly rearward
  mast.position.set(0, 1.1, 1.15);
  plane.add(mast);

  // Rear-View Mirror atop windscreen
  const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.06), materials.gunMetal);
  mirror.position.set(0, 1.1, -1.0);
  plane.add(mirror);

  // 7. Empennage (Gracefully Curved Spitfire Tail Fin & Elliptical Stabilizers)
  // Characteristic curved Spitfire vertical fin & rudder
  const finGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.7, 10);
  finGeo.scale(1, 1, 1.4);
  const fin = new THREE.Mesh(finGeo, bodyMat);
  fin.rotation.x = -0.3;
  fin.position.set(0, 1.05, 4.4);
  fin.castShadow = true;
  plane.add(fin);

  // Elliptical Horizontal Stabilizers
  const hStabGeo = new THREE.BoxGeometry(4.4, 0.12, 1.3);
  const hStab = new THREE.Mesh(hStabGeo, camoMat);
  hStab.position.set(0, 0.28, 4.2);
  hStab.castShadow = true;
  plane.add(hStab);

  // 8. 4-Blade Rotol Constant-Speed Propeller
  const propGroup = new THREE.Group();
  propGroup.position.set(0, 0.05, -5.0);

  const bladeGeo = new THREE.BoxGeometry(3.8, 0.22, 0.04);
  const b1 = new THREE.Mesh(bladeGeo, materials.gunMetal);
  const b2 = new THREE.Mesh(bladeGeo, materials.gunMetal);
  b2.rotation.z = Math.PI / 2;
  propGroup.add(b1, b2);

  // Yellow warning blade tips
  [-1.8, 1.8].forEach(x => {
    const tipH = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.23, 0.05), accentMat);
    tipH.position.set(x, 0, 0);
    const tipV = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.35, 0.05), accentMat);
    tipV.position.set(0, x, 0);
    propGroup.add(tipH, tipV);
  });

  // Propeller semi-transparent motion disc
  const discGeo = new THREE.RingGeometry(0.5, 1.9, 28);
  const disc = new THREE.Mesh(discGeo, materials.propellerBlur);
  propGroup.add(disc);

  plane.add(propGroup);

  return { plane, propGroup };
}

/**
 * Builds the player's WWII Fighter plane (Spitfire Mk.IX with custom livery)
 */
export function buildPlayerAircraft(skinId?: string) {
  const skin = getSkinById('spitfire', skinId);
  return buildSpitfireModel(skin);
}

/**
 * Creates Ground Bomb Targeting Reticle (Projected on terrain)
 */
export function buildBombReticle() {
  const group = new THREE.Group();

  // Outer segmented pulsing ring
  const outerRing = new THREE.Mesh(
    new THREE.RingGeometry(1.4, 1.7, 32),
    new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    })
  );
  outerRing.rotation.x = -Math.PI / 2;
  group.add(outerRing);

  // Inner crosshair ticks
  const tickMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const tick1 = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.9), tickMat);
  tick1.rotation.x = -Math.PI / 2;
  tick1.position.z = -1.6;
  const tick2 = tick1.clone();
  tick2.position.z = 1.6;
  const tick3 = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.15), tickMat);
  tick3.rotation.x = -Math.PI / 2;
  tick3.position.x = -1.6;
  const tick4 = tick3.clone();
  tick4.position.x = 1.6;

  group.add(tick1, tick2, tick3, tick4);

  // Center bullseye dot
  const centerDot = new THREE.Mesh(
    new THREE.CircleGeometry(0.25, 16),
    new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })
  );
  centerDot.rotation.x = -Math.PI / 2;
  group.add(centerDot);

  group.position.y = 0.15;
  return group;
}

/**
 * Enemy Aircraft Factory (Fighter Bf-109, Heavy Bomber He-111, Ace Interceptor)
 */
export function buildEnemyAircraft(type: EnemyType) {
  const plane = new THREE.Group();
  let propeller: THREE.Mesh | undefined;
  const propellers: THREE.Mesh[] = [];

  if (type === 'fighter') {
    // Messerschmitt Bf-109
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.32, 5.8, 8), materials.enemyBf109);
    body.rotation.x = -Math.PI / 2;
    body.castShadow = true;
    plane.add(body);

    // Yellow Cowling Nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.3, 8), materials.enemyYellowNose);
    nose.rotation.x = Math.PI / 2;
    nose.position.z = 3.4;
    nose.castShadow = true;
    plane.add(nose);

    // Wings
    const wings = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.12, 1.8), materials.enemyBf109);
    wings.position.set(0, 0, 0.1);
    wings.castShadow = true;
    plane.add(wings);

    // Wing yellow tips
    [-4.1, 4.1].forEach(x => {
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 1.6), materials.enemyYellowNose);
      tip.position.set(x, 0, 0.1);
      plane.add(tip);
    });

    // Horizontal & vertical stabilizers
    const tailH = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.0), materials.enemyBf109);
    tailH.position.set(0, 0.15, -2.6);
    const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.3, 1.1), materials.enemyYellowNose);
    rudder.position.set(0, 0.7, -2.6);
    plane.add(tailH, rudder);

    // Propeller
    propeller = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 0.04), materials.gunMetal);
    propeller.position.set(0, 0, 4.1);
    plane.add(propeller);

  } else if (type === 'bomber') {
    // Heavy Twin-Engine Bomber (He-111 style)
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.5, 8.5, 10), materials.enemyBomberGrey);
    body.rotation.x = -Math.PI / 2;
    body.castShadow = true;
    plane.add(body);

    // Glazed Greenhouse Cockpit
    const glassNose = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.1, transparent: true, opacity: 0.75 })
    );
    glassNose.scale.set(1, 0.9, 1.4);
    glassNose.position.set(0, 0.1, 4.2);
    plane.add(glassNose);

    // Large Wings
    const wings = new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.22, 3.2), materials.enemyBomberGrey);
    wings.position.set(0, 0.1, 0.6);
    wings.castShadow = true;
    plane.add(wings);

    // Twin Engines
    [-3.8, 3.8].forEach(x => {
      const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 3.6, 8), materials.gunMetal);
      nacelle.rotation.x = -Math.PI / 2;
      nacelle.position.set(x, -0.1, 1.2);
      nacelle.castShadow = true;
      plane.add(nacelle);

      const prop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 0.04), materials.enemyYellowNose);
      prop.position.set(x, -0.1, 3.1);
      plane.add(prop);
      propellers.push(prop);
    });

    // Twin Tail fins
    const tailH = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.15, 1.4), materials.enemyBomberGrey);
    tailH.position.set(0, 0.3, -3.8);
    plane.add(tailH);

    [-2.6, 2.6].forEach(x => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.5, 1.2), materials.enemyBomberGrey);
      fin.position.set(x, 0.8, -3.8);
      plane.add(fin);
    });

  } else if (type === 'stuka') {
    // Ju-87 Stuka Dive Bomber with Inverted Gull Wings & Fixed Wheel Spats
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.38, 6.8, 8), materials.enemyStukaCamo);
    body.rotation.x = -Math.PI / 2;
    body.castShadow = true;
    plane.add(body);

    // Stuka nose with dive siren blades
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.2, 8), materials.enemyYellowNose);
    nose.rotation.x = Math.PI / 2;
    nose.position.z = 3.8;
    plane.add(nose);

    // Inverted Gull Wings (W-wing shape)
    const innerWingL = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.16, 2.2), materials.enemyStukaCamo);
    innerWingL.position.set(-2.2, -0.2, 0.4);
    innerWingL.rotation.z = -0.15;
    const outerWingL = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.14, 1.8), materials.enemyStukaCamo);
    outerWingL.position.set(-5.6, 0.1, 0.4);
    outerWingL.rotation.z = 0.2;

    const innerWingR = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.16, 2.2), materials.enemyStukaCamo);
    innerWingR.position.set(2.2, -0.2, 0.4);
    innerWingR.rotation.z = 0.15;
    const outerWingR = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.14, 1.8), materials.enemyStukaCamo);
    outerWingR.position.set(5.6, 0.1, 0.4);
    outerWingR.rotation.z = -0.2;

    plane.add(innerWingL, outerWingL, innerWingR, outerWingR);

    // Fixed Landing Gear Wheel Spats (Iconic Stuka legs)
    [-2.2, 2.2].forEach(x => {
      const spat = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.3, 1.2), materials.enemyStukaCamo);
      spat.position.set(x, -0.9, 0.4);
      spat.castShadow = true;
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8), materials.gunMetal);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, -1.4, 0.4);
      plane.add(spat, wheel);
    });

    // Rear Gunner Canopy
    const rearCanopy = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.45, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.7 })
    );
    rearCanopy.position.set(0, 0.6, -0.6);
    plane.add(rearCanopy);

    const tailH = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 1.1), materials.enemyStukaCamo);
    tailH.position.set(0, 0.2, -3.0);
    const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.4, 1.2), materials.enemyStukaCamo);
    rudder.position.set(0, 0.8, -3.0);
    plane.add(tailH, rudder);

    propeller = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.22, 0.04), materials.gunMetal);
    propeller.position.set(0, 0, 4.4);
    plane.add(propeller);

  } else if (type === 'torpedo') {
    // Nakajima / Heavy Torpedo Raider
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.5, 7.5, 8), materials.enemyTorpedoBrown);
    body.rotation.x = -Math.PI / 2;
    body.castShadow = true;
    plane.add(body);

    const radialCowling = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.2, 10), materials.gunMetal);
    radialCowling.rotation.x = Math.PI / 2;
    radialCowling.position.z = 4.0;
    plane.add(radialCowling);

    // Thick straight wings
    const wings = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.22, 2.6), materials.enemyTorpedoBrown);
    wings.position.set(0, -0.1, 0.5);
    wings.castShadow = true;
    plane.add(wings);

    // Underbelly Type 91 Aerial Torpedo
    const torpedo = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 3.8, 8), materials.gunMetal);
    torpedo.rotation.x = Math.PI / 2;
    torpedo.position.set(0, -0.9, 0.5);
    const torpedoHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), materials.enemyYellowNose);
    torpedoHead.position.set(0, -0.9, 2.4);
    plane.add(torpedo, torpedoHead);

    const tailH = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 1.2), materials.enemyTorpedoBrown);
    tailH.position.set(0, 0.25, -3.3);
    const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.6, 1.3), materials.enemyTorpedoBrown);
    rudder.position.set(0, 0.9, -3.3);
    plane.add(tailH, rudder);

    propeller = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.24, 0.05), materials.enemyYellowNose);
    propeller.position.set(0, 0, 4.6);
    plane.add(propeller);

  } else if (type === 'boss') {
    // Giant 4-Engine Flying Fortress / Titan Zeppelin Cruiser
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 1.2, 18.0, 12), materials.enemyTitanSteel);
    body.rotation.x = -Math.PI / 2;
    body.castShadow = true;
    plane.add(body);

    // Giant Wingspan
    const mainWings = new THREE.Mesh(new THREE.BoxGeometry(32.0, 0.6, 5.0), materials.enemyTitanSteel);
    mainWings.position.set(0, 0.2, 2.0);
    mainWings.castShadow = true;
    plane.add(mainWings);

    // 4 Heavy Engine Nacelles with Spinning Propellers
    [-11.0, -5.5, 5.5, 11.0].forEach(x => {
      const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.7, 5.5, 8), materials.gunMetal);
      nacelle.rotation.x = -Math.PI / 2;
      nacelle.position.set(x, -0.2, 3.2);
      nacelle.castShadow = true;
      plane.add(nacelle);

      const prop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.28, 0.06), materials.enemyYellowNose);
      prop.position.set(x, -0.2, 6.0);
      plane.add(prop);
      propellers.push(prop);
    });

    // Multiple Heavy Gun Turrets on Dorsal and Wing Placements
    const turretGeo = new THREE.SphereGeometry(0.8, 8, 8);
    const turretMat = materials.concreteBunker;
    const barrelGeo = new THREE.CylinderGeometry(0.14, 0.14, 2.6, 6);

    const turretPositions = [
      { x: 0, y: 1.8, z: 4.5 },
      { x: 0, y: 1.8, z: -3.5 },
      { x: -8.0, y: 0.6, z: 2.0 },
      { x: 8.0, y: 0.6, z: 2.0 },
    ];

    turretPositions.forEach(pos => {
      const t = new THREE.Mesh(turretGeo, turretMat);
      t.position.set(pos.x, pos.y, pos.z);
      const b1 = new THREE.Mesh(barrelGeo, materials.gunMetal);
      b1.rotation.x = Math.PI / 2.5;
      b1.position.set(0.3, 0.3, 1.2);
      const b2 = b1.clone();
      b2.position.x = -0.3;
      t.add(b1, b2);
      plane.add(t);
    });

    // Massive Tail Stabilizers
    const tailH = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.3, 2.5), materials.enemyTitanSteel);
    tailH.position.set(0, 0.6, -7.5);
    plane.add(tailH);

    [-4.5, 4.5].forEach(x => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.0, 2.4), materials.enemyYellowNose);
      fin.position.set(x, 1.8, -7.5);
      plane.add(fin);
    });

  } else {
    // Crimson Ace Interceptor (Fw-190 Ace)
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.35, 6.2, 8), materials.enemyAceRed);
    body.rotation.x = -Math.PI / 2;
    body.castShadow = true;
    plane.add(body);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.4, 8), materials.gunMetal);
    nose.rotation.x = Math.PI / 2;
    nose.position.z = 3.6;
    plane.add(nose);

    // Swept Aggressive Wings
    const wings = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.16, 2.0), materials.enemyAceRed);
    wings.position.set(0, 0, 0.3);
    wings.castShadow = true;
    plane.add(wings);

    // Black stripes on wings
    [-2.5, 2.5].forEach(x => {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 1.9), materials.gunMetal);
      stripe.position.set(x, 0, 0.3);
      plane.add(stripe);
    });

    const tailH = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.1), materials.enemyAceRed);
    tailH.position.set(0, 0.2, -2.8);
    const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.5, 1.2), materials.enemyAceRed);
    rudder.position.set(0, 0.8, -2.8);
    plane.add(tailH, rudder);

    propeller = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 0.04), materials.enemyYellowNose);
    propeller.position.set(0, 0, 4.4);
    plane.add(propeller);
  }

  return { plane, propeller, propellers };
}

/**
 * Builds high-fidelity WWII Hawker Hurricane Mk.II
 * Hallmarks: Thick trapezoidal wings, 8 machine gun ports, deep belly ventral radiator bath,
 * razorback humpback spine, heavily framed greenhouse canopy, 3-blade propeller.
 */
export function buildHurricaneModel(skin?: AircraftSkin) {
  const activeSkin = skin || getSkinById('hurricane', 'hurricane_standard');
  const plane = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.body,
    roughness: activeSkin.finish.roughness,
    metalness: activeSkin.finish.metalness,
  });
  const camoMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.camo,
    roughness: activeSkin.finish.roughness,
    metalness: activeSkin.finish.metalness,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.accent,
    roughness: activeSkin.finish.roughness,
  });
  const spinnerMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.spinner,
    roughness: 0.3,
    metalness: 0.3,
  });
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.82,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.cockpitFrame,
    roughness: 0.5,
  });
  const exhaustMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.7,
    metalness: 0.75,
  });

  // 1. Fuselage
  // Robust nose section
  const noseGeo = new THREE.CylinderGeometry(0.72, 0.78, 2.8, 14);
  const nose = new THREE.Mesh(noseGeo, bodyMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0, -1.8);
  nose.castShadow = true;
  plane.add(nose);

  // Upper engine cowl
  const cowlDeckGeo = new THREE.CylinderGeometry(0.56, 0.62, 2.6, 10, 1, false, 0, Math.PI);
  const cowlDeck = new THREE.Mesh(cowlDeckGeo, camoMat);
  cowlDeck.rotation.x = Math.PI / 2;
  cowlDeck.rotation.z = Math.PI / 2;
  cowlDeck.position.set(0, 0.3, -1.8);
  plane.add(cowlDeck);

  // Center Cockpit Section with High Shoulders
  const midFuselageGeo = new THREE.CylinderGeometry(0.78, 0.7, 2.4, 14);
  const midFuselage = new THREE.Mesh(midFuselageGeo, bodyMat);
  midFuselage.rotation.x = Math.PI / 2;
  midFuselage.position.set(0, 0.05, 0.7);
  midFuselage.castShadow = true;
  plane.add(midFuselage);

  // Characteristic "Razorback" Humpback Spine (Fabric covered rear fuselage with stringers)
  const spineGeo = new THREE.CylinderGeometry(0.7, 0.22, 4.2, 8);
  const spine = new THREE.Mesh(spineGeo, bodyMat);
  spine.rotation.x = Math.PI / 2;
  spine.position.set(0, 0.18, 3.8);
  spine.castShadow = true;
  plane.add(spine);

  // Raised humpback dorsal ridge behind cockpit
  const humpRidge = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 2.6), camoMat);
  humpRidge.position.set(0, 0.62, 2.2);
  humpRidge.rotation.x = -0.15;
  plane.add(humpRidge);

  // Blunt De Havilland Spinner Cone
  const spinnerGeo = new THREE.ConeGeometry(0.7, 1.25, 16);
  const spinnerMesh = new THREE.Mesh(spinnerGeo, spinnerMat);
  spinnerMesh.rotation.x = -Math.PI / 2;
  spinnerMesh.position.set(0, 0, -3.7);
  spinnerMesh.castShadow = true;
  plane.add(spinnerMesh);

  // Exhaust Stacks (6 cylinders per side)
  [-0.68, 0.68].forEach(sideX => {
    const isRight = sideX > 0;
    for (let i = 0; i < 6; i++) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 6), exhaustMat);
      pipe.rotation.z = isRight ? -Math.PI / 3 : Math.PI / 3;
      pipe.position.set(sideX, 0.18, -1.0 - i * 0.36);
      plane.add(pipe);
    }
  });

  // Chin Air Scoop
  const chinScoop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 1.4, 8), bodyMat);
  chinScoop.rotation.x = Math.PI / 2.1;
  chinScoop.position.set(0, -0.62, -2.1);
  plane.add(chinScoop);

  // 2. Iconic Hawker Deep Ventral Radiator Bath (Under center belly)
  const radBathGroup = new THREE.Group();
  radBathGroup.position.set(0, -0.68, 0.7);

  // Main radiator box
  const radBox = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.52, 2.2), bodyMat);
  radBox.castShadow = true;
  radBathGroup.add(radBox);

  // Front radiator open duct
  const radIntake = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.38), new THREE.MeshBasicMaterial({ color: 0x111111 }));
  radIntake.position.set(0, 0, -1.11);
  radBathGroup.add(radIntake);

  // Rear angled cooling flap door
  const radFlap = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.4), camoMat);
  radFlap.rotation.x = 0.35;
  radFlap.position.set(0, -0.15, 1.15);
  radBathGroup.add(radFlap);

  plane.add(radBathGroup);

  // 3. Thick High-Lift Trapezoidal Wings
  const wingGroup = new THREE.Group();
  wingGroup.position.set(0, -0.1, 0.2);

  const centerWing = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 2.8), camoMat);
  wingGroup.add(centerWing);

  [-1, 1].forEach(side => {
    const wingPanel = new THREE.Group();
    wingPanel.rotation.z = side * -0.06;

    // Main trapezoidal wing panel
    const mainPanel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 2.6), camoMat);
    mainPanel.position.set(side * 3.4, 0, 0.15);
    mainPanel.castShadow = true;
    wingPanel.add(mainPanel);

    // Tapered outer wingtip
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.16, 2.2), accentMat);
    tip.position.set(side * 5.8, 0, 0.2);
    wingPanel.add(tip);

    // 4 Browning .303 Machine Gun Blast Ports in leading edge (8 total)
    for (let g = 0; g < 4; g++) {
      const gunTube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.6, 6), materials.gunMetal);
      gunTube.rotation.x = Math.PI / 2;
      gunTube.position.set(side * (2.8 + g * 0.45), 0, -1.3);
      wingPanel.add(gunTube);
    }

    // Leading-edge landing light (Port wing)
    if (side === -1) {
      const light = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.15),
        new THREE.MeshBasicMaterial({ color: 0xfff08a })
      );
      light.position.set(side * 3.8, 0, -1.16);
      wingPanel.add(light);
    }

    wingGroup.add(wingPanel);
  });

  plane.add(wingGroup);

  // 4. Heavily Framed Greenhouse Canopy (Razorback style)
  const canopyGroup = new THREE.Group();
  canopyGroup.position.set(0, 0.62, -0.15);

  const canopyGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.58, 2.0),
    canopyMat
  );
  canopyGroup.add(canopyGlass);

  // Metal structural framing ribs
  for (let f = -0.8; f <= 0.8; f += 0.5) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 4, 12, Math.PI), frameMat);
    rib.position.set(0, 0.1, f);
    canopyGroup.add(rib);
  }

  // Armored windscreen front plate
  const armorScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.45), frameMat);
  armorScreen.rotation.x = -0.3;
  armorScreen.position.set(0, 0.1, -1.02);
  canopyGroup.add(armorScreen);

  // Pilot & Antenna Mast
  const pilot = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x78350f })
  );
  pilot.position.set(0, 0.05, -0.15);
  canopyGroup.add(pilot);

  plane.add(canopyGroup);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.8, 6), frameMat);
  antenna.position.set(0, 1.05, 1.4);
  plane.add(antenna);

  // 5. Broad Rounded Tail Fin & Stabilizers
  const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.6, 1.5), bodyMat);
  tailFin.position.set(0, 0.95, 4.4);
  tailFin.castShadow = true;
  plane.add(tailFin);

  const hStab = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 1.3), camoMat);
  hStab.position.set(0, 0.25, 4.2);
  hStab.castShadow = true;
  plane.add(hStab);

  // 6. 3-Blade Wide-Chord Propeller
  const propGroup = new THREE.Group();
  propGroup.position.set(0, 0, -4.3);

  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.9, 0.04), materials.gunMetal);
    blade.position.y = 0.95;
    const yellowTip = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.05), accentMat);
    yellowTip.position.y = 1.75;
    blade.add(yellowTip);

    const bladeArm = new THREE.Group();
    bladeArm.rotation.z = (i * Math.PI * 2) / 3;
    bladeArm.add(blade);
    propGroup.add(bladeArm);
  }

  const propDisc = new THREE.Mesh(new THREE.RingGeometry(0.4, 1.9, 24), materials.propellerBlur);
  propGroup.add(propDisc);

  plane.add(propGroup);

  return { plane, prop: propGroup };
}

/**
 * Builds high-fidelity WWII Douglas SBD-5 Dauntless
 * Hallmarks: Wright Cyclone radial engine cowl, perforated "Swiss-cheese" dive brakes,
 * tandem two-man greenhouse canopy with aft twin machine guns, ventral dive-bombing trapeze fork.
 */
export function buildDauntlessModel(skin?: AircraftSkin) {
  const activeSkin = skin || getSkinById('dauntless', 'dauntless_midway');
  const plane = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.body,
    roughness: activeSkin.finish.roughness,
    metalness: activeSkin.finish.metalness,
  });
  const camoMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.camo,
    roughness: activeSkin.finish.roughness,
    metalness: activeSkin.finish.metalness,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.accent,
    roughness: activeSkin.finish.roughness,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.belly || 0x94a3b8,
    roughness: 0.5,
    metalness: 0.2,
  });
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.1,
    metalness: 0.85,
    transparent: true,
    opacity: 0.82,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.cockpitFrame,
    roughness: 0.45,
  });

  // 1. Wright R-1820 Cyclone Radial Engine Cowling (Wide open circular cowl)
  const cowlOuterGeo = new THREE.CylinderGeometry(0.88, 0.88, 1.4, 20);
  const cowlOuter = new THREE.Mesh(cowlOuterGeo, bodyMat);
  cowlOuter.rotation.x = Math.PI / 2;
  cowlOuter.position.set(0, 0.05, -2.4);
  cowlOuter.castShadow = true;
  plane.add(cowlOuter);

  // Open Cowl Front Ring with Radial Cylinder Engine Block inside
  const engineBlock = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.75, 0.6, 12),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7, metalness: 0.8 })
  );
  engineBlock.rotation.x = Math.PI / 2;
  engineBlock.position.set(0, 0.05, -2.7);
  plane.add(engineBlock);

  // Engine center crankcase hub
  const crankHub = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85 })
  );
  crankHub.position.set(0, 0.05, -3.1);
  plane.add(crankHub);

  // Top Carburetor Intake Scoop atop cowl
  const topScoop = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 1.2), bodyMat);
  topScoop.position.set(0, 0.95, -2.4);
  const scoopHole = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.14), new THREE.MeshBasicMaterial({ color: 0x111111 }));
  scoopHole.position.set(0, 0.95, -3.01);
  plane.add(topScoop, scoopHole);

  // Twin Forward-Firing .50 cal Synchronized Machine Gun Cowl Troughs
  [-0.24, 0.24].forEach(gx => {
    const gunTrough = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 6), materials.gunMetal);
    gunTrough.rotation.x = Math.PI / 2;
    gunTrough.position.set(gx, 0.82, -2.2);
    plane.add(gunTrough);
  });

  // 2. Main Naval Sturdy Fuselage
  const midFuselageGeo = new THREE.CylinderGeometry(0.86, 0.72, 3.2, 16);
  const midFuselage = new THREE.Mesh(midFuselageGeo, bodyMat);
  midFuselage.rotation.x = Math.PI / 2;
  midFuselage.position.set(0, 0.05, -0.2);
  midFuselage.castShadow = true;
  plane.add(midFuselage);

  const aftFuselageGeo = new THREE.CylinderGeometry(0.72, 0.24, 4.4, 16);
  const aftFuselage = new THREE.Mesh(aftFuselageGeo, bodyMat);
  aftFuselage.rotation.x = Math.PI / 2;
  aftFuselage.position.set(0, 0.15, 3.4);
  aftFuselage.castShadow = true;
  plane.add(aftFuselage);

  // Naval Tail Arrestor Hook Compartment & Hook
  const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), materials.gunMetal);
  hook.rotation.x = -0.3;
  hook.position.set(0, -0.25, 4.8);
  plane.add(hook);

  // 3. Low Wings with Distinctive Trailing-Edge PERFORATED DIVE FLAPS (Swiss-Cheese Flaps)
  const wingGroup = new THREE.Group();
  wingGroup.position.set(0, -0.2, 0.1);

  // Center straight section
  const centerWing = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.22, 2.8), camoMat);
  wingGroup.add(centerWing);

  [-1, 1].forEach(side => {
    const wingPanel = new THREE.Group();
    // Strong naval dihedral (+9 degrees)
    wingPanel.rotation.z = side * -0.14;

    const panel = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.18, 2.6), camoMat);
    panel.position.set(side * 3.4, 0, 0.1);
    panel.castShadow = true;
    wingPanel.add(panel);

    // Wingtip
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.14, 2.1), accentMat);
    tip.position.set(side * 5.8, 0, 0.15);
    wingPanel.add(tip);

    // Iconic Perforated Dive Brakes along the trailing edge (Upper and Lower flaps)
    // Modeled with high-contrast circular aperture markings representing the dive brake holes
    for (let r = 0; r < 5; r++) {
      const holeX = side * (1.8 + r * 0.7);
      const perfDotUpper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.02, 10),
        new THREE.MeshBasicMaterial({ color: 0x0a0e14 })
      );
      perfDotUpper.position.set(holeX, 0.1, 1.05);
      const perfDotLower = perfDotUpper.clone();
      perfDotLower.position.y = -0.1;
      wingPanel.add(perfDotUpper, perfDotLower);
    }

    // Heavy main gear fairing pods under wing roots
    const gearPod = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 1.2), bellyMat);
    gearPod.position.set(side * 1.6, -0.42, 0.1);
    gearPod.castShadow = true;
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.22, 10), materials.gunMetal);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(side * 1.6, -0.75, 0.1);
    wingPanel.add(gearPod, wheel);

    wingGroup.add(wingPanel);
  });

  plane.add(wingGroup);

  // 4. Extended Tandem Two-Crew Greenhouse Canopy
  const tandemGroup = new THREE.Group();
  tandemGroup.position.set(0, 0.72, 0.1);

  // Elongated canopy spanning pilot & rear gunner
  const canopyGeo = new THREE.BoxGeometry(0.72, 0.58, 3.4);
  const canopyGlass = new THREE.Mesh(canopyGeo, canopyMat);
  tandemGroup.add(canopyGlass);

  // Metal structural frames
  for (let f = -1.5; f <= 1.5; f += 0.5) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 4, 12, Math.PI), frameMat);
    rib.position.set(0, 0.08, f);
    tandemGroup.add(rib);
  }

  // Front Pilot Figure
  const pilot = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
  );
  pilot.position.set(0, 0.05, -0.85);
  tandemGroup.add(pilot);

  // Rear Gunner Figure (Facing Aft!)
  const gunner = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
  );
  gunner.position.set(0, 0.05, 0.85);
  tandemGroup.add(gunner);

  // Rear Gunner Station: Twin Flexible Browning .30 cal Machine Guns facing aft!
  const gunMount = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 6), materials.gunMetal);
  gunMount.position.set(0, 0.28, 1.4);
  const twinGuns = new THREE.Group();
  twinGuns.position.set(0, 0.48, 1.4);
  twinGuns.rotation.x = 0.25; // Angled upward and rearward

  [-0.1, 0.1].forEach(gx => {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6), materials.gunMetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(gx, 0, 0.45);
    twinGuns.add(barrel);
  });

  tandemGroup.add(gunMount, twinGuns);
  plane.add(tandemGroup);

  // 5. Ventral Dive Bombing Trapeze Fork & 500lb Bomb
  const trapezeGroup = new THREE.Group();
  trapezeGroup.position.set(0, -0.55, 0.2);

  // Swinging displacement crutch
  const forkL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.2, 6), materials.gunMetal);
  forkL.rotation.z = -0.3;
  forkL.position.set(-0.35, 0, 0);
  const forkR = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.2, 6), materials.gunMetal);
  forkR.rotation.z = 0.3;
  forkR.position.set(0.35, 0, 0);
  trapezeGroup.add(forkL, forkR);

  // 500lb Heavy Bomb
  const bombMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), materials.gunMetal);
  bombMesh.scale.set(0.9, 0.9, 2.6);
  bombMesh.position.set(0, -0.3, 0);
  bombMesh.castShadow = true;
  trapezeGroup.add(bombMesh);

  plane.add(trapezeGroup);

  // 6. High Naval Tail Fin & Stabilizers
  const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.8, 1.6), bodyMat);
  tailFin.position.set(0, 1.05, 4.2);
  tailFin.castShadow = true;
  plane.add(tailFin);

  const hStab = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 1.3), camoMat);
  hStab.position.set(0, 0.28, 4.0);
  hStab.castShadow = true;
  plane.add(hStab);

  // 7. 3-Blade Hamilton Standard Propeller with Chrome Dome Hub
  const propGroup = new THREE.Group();
  propGroup.position.set(0, 0.05, -3.4);

  const chromeDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.9 })
  );
  propGroup.add(chromeDome);

  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.8, 0.04), materials.gunMetal);
    blade.position.y = 0.9;
    const yellowTip = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.05), materials.playerYellowAccent);
    yellowTip.position.y = 1.65;
    blade.add(yellowTip);

    const arm = new THREE.Group();
    arm.rotation.z = (i * Math.PI * 2) / 3;
    arm.add(blade);
    propGroup.add(arm);
  }

  const disc = new THREE.Mesh(new THREE.RingGeometry(0.4, 1.8, 24), materials.propellerBlur);
  propGroup.add(disc);

  plane.add(propGroup);

  return { plane, prop: propGroup };
}

/**
 * Builds high-fidelity WWII North American P-51D Mustang
 * Hallmarks: Laminar flow wings with leading-edge root kink, 6 Browning .50 cal guns,
 * ventral "Doghouse" belly radiator air scoop, 360-degree blown teardrop bubble canopy,
 * Packard Merlin V-1650 6-pipe ejector exhausts, 4-blade paddle propeller.
 */
export function buildMustangModel(skin?: AircraftSkin) {
  const activeSkin = skin || getSkinById('mustang', 'mustang_redtail');
  const plane = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.body,
    roughness: activeSkin.finish.roughness,
    metalness: activeSkin.finish.metalness,
  });
  const camoMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.camo,
    roughness: activeSkin.finish.roughness,
    metalness: activeSkin.finish.metalness,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.accent,
    roughness: activeSkin.finish.roughness,
  });
  const tailColor = activeSkin.colors.tail !== undefined ? activeSkin.colors.tail : activeSkin.colors.body;
  const tailMat = new THREE.MeshStandardMaterial({
    color: tailColor,
    roughness: 0.3,
    metalness: activeSkin.finish.metalness * 0.7,
  });
  const spinnerMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.spinner,
    roughness: 0.2,
    metalness: 0.6,
  });
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.06,
    metalness: 0.9,
    transparent: true,
    opacity: 0.86,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: activeSkin.colors.cockpitFrame,
    roughness: 0.4,
  });
  const exhaustMat = new THREE.MeshStandardMaterial({
    color: 0x222225,
    roughness: 0.65,
    metalness: 0.8,
  });

  // 1. Sleek Aerodynamic Fuselage
  // Packard V-1650 Merlin Engine Nose Section
  const noseGeo = new THREE.CylinderGeometry(0.64, 0.72, 3.2, 16);
  const nose = new THREE.Mesh(noseGeo, bodyMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.05, -2.1);
  nose.castShadow = true;
  plane.add(nose);

  // Sharp Streamlined Propeller Spinner Cone
  const spinnerGeo = new THREE.ConeGeometry(0.64, 1.45, 18);
  const spinnerMesh = new THREE.Mesh(spinnerGeo, spinnerMat);
  spinnerMesh.rotation.x = -Math.PI / 2;
  spinnerMesh.position.set(0, 0.05, -4.3);
  spinnerMesh.castShadow = true;
  plane.add(spinnerMesh);

  // Twin 6-Pipe Ejector Exhaust Stacks (6 cylinders per side with heat shields)
  [-0.64, 0.64].forEach(sideX => {
    const isRight = sideX > 0;
    // Stainless heat shroud backing plate
    const shieldPlate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 2.2), materials.gunMetal);
    shieldPlate.position.set(sideX * 1.02, 0.2, -2.1);
    plane.add(shieldPlate);

    for (let i = 0; i < 6; i++) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8), exhaustMat);
      pipe.rotation.z = isRight ? -Math.PI / 3 : Math.PI / 3;
      pipe.position.set(sideX, 0.2, -1.2 - i * 0.38);
      plane.add(pipe);
    }
  });

  // Center Cockpit & Fuel Tank Fuselage
  const midFuselageGeo = new THREE.CylinderGeometry(0.72, 0.65, 2.6, 16);
  const midFuselage = new THREE.Mesh(midFuselageGeo, bodyMat);
  midFuselage.rotation.x = Math.PI / 2;
  midFuselage.position.set(0, 0.05, 0.7);
  midFuselage.castShadow = true;
  plane.add(midFuselage);

  // Aft Tapering Fuselage with Dorsal Fin Fillet
  const aftFuselageGeo = new THREE.CylinderGeometry(0.65, 0.2, 4.4, 16);
  const aftFuselage = new THREE.Mesh(aftFuselageGeo, bodyMat);
  aftFuselage.rotation.x = Math.PI / 2;
  aftFuselage.position.set(0, 0.12, 4.1);
  aftFuselage.castShadow = true;
  plane.add(aftFuselage);

  // Characteristic P-51D Dorsal Fin Fillet leading into the vertical stabilizer
  const fillet = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 1.8), tailMat);
  fillet.rotation.x = -0.18;
  fillet.position.set(0, 0.65, 3.2);
  plane.add(fillet);

  // 2. The Iconic Ventral "Doghouse" Belly Air Scoop (Meredith Effect Radiator Duct)
  const doghouseGroup = new THREE.Group();
  doghouseGroup.position.set(0, -0.62, 1.1);

  // Aerodynamic scoop housing
  const scoopBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.58, 2.6), bodyMat);
  scoopBox.castShadow = true;
  doghouseGroup.add(scoopBox);

  // Front radiator air intake duct
  const intakeHole = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.42), new THREE.MeshBasicMaterial({ color: 0x111111 }));
  intakeHole.position.set(0, 0, -1.31);
  doghouseGroup.add(intakeHole);

  // Rear angled cooling exhaust ramp door
  const exhaustRamp = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.5), materials.gunMetal);
  exhaustRamp.rotation.x = 0.3;
  exhaustRamp.position.set(0, -0.2, 1.4);
  doghouseGroup.add(exhaustRamp);

  plane.add(doghouseGroup);

  // 3. Famous Laminar Flow Wings with Leading-Edge Root Forward Extension (Mustang Kink)
  const wingGroup = new THREE.Group();
  wingGroup.position.set(0, -0.12, 0.1);

  // Center section
  const centerWing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 2.6), camoMat);
  wingGroup.add(centerWing);

  [-1, 1].forEach(side => {
    const wingPanel = new THREE.Group();
    wingPanel.rotation.z = side * -0.07;

    // Iconic Mustang Root Forward Extension ("The Kink")
    const rootKink = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 0.6), camoMat);
    rootKink.position.set(side * 1.8, 0, -1.25);
    wingPanel.add(rootKink);

    // Main laminar flow panel
    const mainPanel = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.16, 2.3), camoMat);
    mainPanel.position.set(side * 3.5, 0, 0.1);
    mainPanel.castShadow = true;
    wingPanel.add(mainPanel);

    // Squared-off wingtip
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 1.9), accentMat);
    tip.position.set(side * 5.9, 0, 0.15);
    wingPanel.add(tip);

    // 6 Staggered Browning .50 cal Heavy Machine Guns (3 per wing)
    const gunPositions = [-0.95, -0.85, -0.75]; // Staggered leading edge protrusion
    for (let g = 0; g < 3; g++) {
      const gunTube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), materials.gunMetal);
      gunTube.rotation.x = Math.PI / 2;
      gunTube.position.set(side * (2.6 + g * 0.42), 0, gunPositions[g] - 0.4);
      wingPanel.add(gunTube);
    }

    // Yellow or Accent identification stripes on wings
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.17, 2.2), accentMat);
    stripe.position.set(side * 4.6, 0, 0.1);
    wingPanel.add(stripe);

    wingGroup.add(wingPanel);
  });

  plane.add(wingGroup);

  // 4. 360-Degree Blown Teardrop Bubble Canopy
  const bubbleCanopyGeo = new THREE.SphereGeometry(0.66, 18, 14);
  bubbleCanopyGeo.scale(0.72, 0.88, 2.5);
  const bubbleCanopy = new THREE.Mesh(bubbleCanopyGeo, canopyMat);
  bubbleCanopy.position.set(0, 0.68, -0.1);
  plane.add(bubbleCanopy);

  // Armored windscreen front plate & frame
  const screenFrame = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.04, 6, 16, Math.PI),
    frameMat
  );
  screenFrame.position.set(0, 0.62, -1.05);
  plane.add(screenFrame);

  // Pilot & Armored Headrest Bulkhead
  const pilot = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x78350f })
  );
  pilot.position.set(0, 0.58, -0.15);
  const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.12), frameMat);
  headrest.position.set(0, 0.58, 0.18);
  plane.add(pilot, headrest);

  // Radio Antenna Whip Mast
  const whip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.95, 6), frameMat);
  whip.rotation.x = -0.15;
  whip.position.set(0, 1.15, 1.1);
  plane.add(whip);

  // 5. Tall Square-Tipped Vertical Stabilizer & Rudder (e.g. Tuskegee Red Tail)
  const vStabGeo = new THREE.BoxGeometry(0.14, 1.9, 1.5);
  const vStab = new THREE.Mesh(vStabGeo, tailMat);
  vStab.position.set(0, 1.15, 4.4);
  vStab.castShadow = true;
  plane.add(vStab);

  const hStab = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 1.3), tailMat);
  hStab.position.set(0, 0.28, 4.2);
  hStab.castShadow = true;
  plane.add(hStab);

  // 6. 4-Blade Hamilton Standard Paddle Propeller
  const propGroup = new THREE.Group();
  propGroup.position.set(0, 0.05, -5.0);

  const paddleGeo = new THREE.BoxGeometry(3.9, 0.24, 0.04);
  const b1 = new THREE.Mesh(paddleGeo, materials.gunMetal);
  const b2 = new THREE.Mesh(paddleGeo, materials.gunMetal);
  b2.rotation.z = Math.PI / 2;
  propGroup.add(b1, b2);

  // Yellow warning tips
  [-1.85, 1.85].forEach(x => {
    const tipH = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.05), accentMat);
    tipH.position.set(x, 0, 0);
    const tipV = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.05), accentMat);
    tipV.position.set(0, x, 0);
    propGroup.add(tipH, tipV);
  });

  const disc = new THREE.Mesh(new THREE.RingGeometry(0.5, 1.95, 28), materials.propellerBlur);
  propGroup.add(disc);

  plane.add(propGroup);

  return { plane, prop: propGroup };
}

/**
 * Builds selectable Wingman Aircraft with specific WWII geometry and optional custom skin
 */
export function buildWingmanAircraft(type: 'hurricane' | 'dauntless' | 'mustang', skinId?: string) {
  const skin = getSkinById(type, skinId);
  if (type === 'hurricane') {
    return buildHurricaneModel(skin);
  } else if (type === 'dauntless') {
    return buildDauntlessModel(skin);
  } else {
    return buildMustangModel(skin);
  }
}

/**
 * Weather Rain Line Particle System
 */
export function buildRainSystem(count = 1200) {
  const positions = new Float32Array(count * 6);
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 80;
    const y = Math.random() * 45;
    const z = (Math.random() - 0.5) * 80;
    const len = 1.2 + Math.random() * 0.8;

    positions[i * 6] = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;

    positions[i * 6 + 3] = x - 0.1;
    positions[i * 6 + 4] = y - len;
    positions[i * 6 + 5] = z + 0.15;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.65,
  });

  const rainMesh = new THREE.LineSegments(geometry, material);
  return { rainMesh, positions };
}

/**
 * Ground Destructible Targets:
 * - Munitions Factory (Twin smokestacks with real smoke particles)
 * - Flak 88 Anti-Aircraft Bunker (Tracks player and shoots flak bursts)
 * - Fuel Storage Depot (Clustered tanks with giant chain explosions)
 * - Radar Outpost (Revolving military radar dish)
 */
export function buildGroundTarget(type: GroundTargetType) {
  const group = new THREE.Group();
  let turret: THREE.Object3D | undefined;
  const smokingPipes: THREE.Vector3[] = [];

  if (type === 'factory') {
    // Industrial Munitions Factory
    const hallMat = materials.brickFactory;
    const roofMat = materials.factoryRoof;

    // Main hall
    const hall = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.4, 9.2), hallMat);
    hall.position.y = 1.7;
    hall.castShadow = true;
    hall.receiveShadow = true;
    group.add(hall);

    // Sawtooth Roof
    for (let i = -3.2; i <= 3.2; i += 2.2) {
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.2, 4), roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(0, 3.9, i);
      group.add(roof);
    }

    // Heavy Industrial Brick Chimneys (Smoking)
    const pipeGeo = new THREE.CylinderGeometry(0.48, 0.65, 5.8, 10);
    const pipeMat = materials.gunMetal;

    const p1 = new THREE.Mesh(pipeGeo, pipeMat);
    p1.position.set(2.2, 3.8, 2.5);
    p1.castShadow = true;

    const p2 = new THREE.Mesh(pipeGeo, pipeMat);
    p2.position.set(-2.2, 3.8, -2.5);
    p2.castShadow = true;

    group.add(p1, p2);

    smokingPipes.push(new THREE.Vector3(2.2, 6.7, 2.5), new THREE.Vector3(-2.2, 6.7, -2.5));

  } else if (type === 'flak') {
    // Concrete Flak 88 Bunker
    const bunker = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.8, 2.0, 8), materials.concreteBunker);
    bunker.position.y = 1.0;
    bunker.castShadow = true;
    bunker.receiveShadow = true;
    group.add(bunker);

    // Sandbag ring rim
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.7, 0.4, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.9 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 2.1;
    group.add(ring);

    // Rotatable Turret Mount
    turret = new THREE.Group();
    turret.position.y = 2.2;

    const gunBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1.8), materials.concreteBunker);
    gunBase.position.y = 0.45;
    turret.add(gunBase);

    // Dual 88mm Gun Barrels
    [-0.5, 0.5].forEach(x => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.8, 8), materials.gunMetal);
      barrel.rotation.x = Math.PI / 3;
      barrel.position.set(x, 0.8, -1.3);
      turret?.add(barrel);
    });

    group.add(turret);

  } else if (type === 'fuel_depot') {
    // Tri-cluster Fuel Storage Depot
    const positions = [
      { x: -2.0, z: -1.2 },
      { x: 2.0, z: -1.2 },
      { x: 0, z: 2.2 },
    ];

    positions.forEach(pos => {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 3.2, 16), materials.fuelTankSilver);
      tank.position.set(pos.x, 1.6, pos.z);
      tank.castShadow = true;
      tank.receiveShadow = true;

      // Tank Dome Cap
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.78, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), materials.fuelTankSilver);
      dome.position.set(pos.x, 3.2, pos.z);

      // Warning Stripe
      const band = new THREE.Mesh(new THREE.CylinderGeometry(1.82, 1.82, 0.5, 16), materials.hazardYellow);
      band.position.set(pos.x, 1.6, pos.z);

      group.add(tank, dome, band);
    });

  } else {
    // Radar Outpost
    const bunker = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 4.2), materials.concreteBunker);
    bunker.position.y = 1.1;
    bunker.castShadow = true;
    bunker.receiveShadow = true;
    group.add(bunker);

    // Radar dish
    turret = new THREE.Group();
    turret.position.y = 2.4;

    const dishMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 12, 8, 0, Math.PI, 0, Math.PI / 2),
      materials.gunMetal
    );
    dishMesh.rotation.x = -Math.PI / 4;
    dishMesh.position.y = 1.2;
    turret.add(dishMesh);

    group.add(turret);
  }

  return { group, turret, smokingPipes };
}

/**
 * 500-pound Aerial Bomb with fins and shadow projector
 */
export function buildBomb() {
  const group = new THREE.Group();

  // Teardrop body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 8), materials.gunMetal);
  body.scale.set(0.9, 0.9, 2.2);
  body.castShadow = true;
  group.add(body);

  // Yellow ordnance explosive stripe
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.25, 12), materials.hazardYellow);
  stripe.rotation.x = Math.PI / 2;
  stripe.position.z = -0.5;
  group.add(stripe);

  // Cross Tail Fins
  const finGeo = new THREE.BoxGeometry(1.4, 0.08, 0.8);
  const fin1 = new THREE.Mesh(finGeo, materials.gunMetal);
  fin1.position.z = 1.1;
  const fin2 = fin1.clone();
  fin2.rotation.z = Math.PI / 2;
  group.add(fin1, fin2);

  return group;
}

/**
 * Air Drops / Pickups with Parachute
 */
export function buildPickup(type: PickupType) {
  const group = new THREE.Group();

  // Parachute Canopy
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: type === 'bomb' ? 0xf59e0b : type === 'repair' ? 0x10b981 : 0xec4899,
      side: THREE.DoubleSide,
    })
  );
  canopy.position.y = 2.2;
  group.add(canopy);

  // Strings
  const linesMat = new THREE.LineBasicMaterial({ color: 0xcccccc });
  const points = [
    new THREE.Vector3(-1.2, 2.1, 0), new THREE.Vector3(0, 0.6, 0),
    new THREE.Vector3(1.2, 2.1, 0), new THREE.Vector3(0, 0.6, 0),
    new THREE.Vector3(0, 2.1, -1.2), new THREE.Vector3(0, 0.6, 0),
    new THREE.Vector3(0, 2.1, 1.2), new THREE.Vector3(0, 0.6, 0),
  ];
  const linesGeo = new THREE.BufferGeometry().setFromPoints(points);
  const lines = new THREE.LineSegments(linesGeo, linesMat);
  group.add(lines);

  // Cargo Box
  const boxMat = new THREE.MeshStandardMaterial({
    color: type === 'bomb' ? 0xb45309 : type === 'repair' ? 0x047857 : 0xeab308,
    roughness: 0.6,
  });
  const cargo = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), boxMat);
  cargo.position.y = 0.5;
  cargo.castShadow = true;
  group.add(cargo);

  return group;
}

/**
 * Builds dynamic terrain segment (Coastline, island, airbase runway, greenery)
 */
export function buildTerrainSegment(zPos: number, variant: number) {
  const seg = new THREE.Group();

  // Base island/ground plate
  const width = variant % 2 === 0 ? 56 : 48;
  const land = new THREE.Mesh(new THREE.BoxGeometry(width, 1.4, 70), materials.islandGrass);
  land.position.y = -0.7;
  land.receiveShadow = true;
  seg.add(land);

  // Coastal sandy shelf on one side
  const sand = new THREE.Mesh(new THREE.BoxGeometry(width + 6, 0.9, 70), materials.sandCoast);
  sand.position.y = -0.9;
  sand.receiveShadow = true;
  seg.add(sand);

  // Airfield runway / tactical military highway
  if (variant % 3 === 0) {
    const runway = new THREE.Mesh(new THREE.PlaneGeometry(8, 70), materials.asphaltRunway);
    runway.rotation.x = -Math.PI / 2;
    runway.position.y = 0.05;
    runway.receiveShadow = true;
    seg.add(runway);

    // Centerline markings
    for (let z = -30; z < 30; z += 8) {
      const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 4), materials.hazardYellow);
      mark.rotation.x = -Math.PI / 2;
      mark.position.set(0, 0.06, z);
      seg.add(mark);
    }
  }

  // Scattered palm trees / defensive barricades
  for (let i = 0; i < 4; i++) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 2.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    trunk.position.y = 1.25;
    trunk.castShadow = true;

    const foliage = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 2.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 })
    );
    foliage.position.y = 2.8;
    foliage.castShadow = true;

    tree.add(trunk, foliage);
    const px = (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 8);
    const pz = (Math.random() - 0.5) * 50;
    tree.position.set(px, 0, pz);
    seg.add(tree);
  }

  seg.position.set(0, 0, zPos);
  return seg;
}
