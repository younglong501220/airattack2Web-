import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WingmanType } from '../game/types';
import { buildPlayerAircraft, buildWingmanAircraft } from '../game/models';
import { PlaneModelKey } from '../game/aircraftSkins';

export interface HangarLightingConfig {
  lightColor: string;
  rotationSpeed: number; // 0.0 to 2.5
  specularIntensity: number; // 0.5 to 2.5
}

interface HangarTurntableCanvasProps {
  modelType: 'player' | WingmanType;
  skinId?: string;
  lightingConfig?: HangarLightingConfig;
  className?: string;
}

export const HangarTurntableCanvas: React.FC<HangarTurntableCanvasProps> = ({
  modelType,
  skinId,
  lightingConfig = {
    lightColor: '#fffaed',
    rotationSpeed: 1.0,
    specularIntensity: 1.0,
  },
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // References to live Three.js scene elements for instant non-destructive updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const spotlightRef = useRef<THREE.SpotLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const turntableGroupRef = useRef<THREE.Group | null>(null);
  const aircraftGroupRef = useRef<THREE.Group | null>(null);
  const propMeshRef = useRef<THREE.Mesh | THREE.Group | null>(null);

  const lightingConfigRef = useRef(lightingConfig);
  useEffect(() => {
    lightingConfigRef.current = lightingConfig;

    // Apply live lighting adjustments to Three.js scene immediately
    if (spotlightRef.current) {
      spotlightRef.current.color.set(lightingConfig.lightColor);
      spotlightRef.current.intensity = 3.2 * lightingConfig.specularIntensity;
    }
    if (ambientLightRef.current) {
      const ambientTint = new THREE.Color(lightingConfig.lightColor).multiplyScalar(0.4).add(new THREE.Color(0x2d3748));
      ambientLightRef.current.color.copy(ambientTint);
      ambientLightRef.current.intensity = 1.2 * Math.max(0.7, lightingConfig.specularIntensity * 0.9);
    }
    if (rimLightRef.current) {
      rimLightRef.current.intensity = 1.8 * lightingConfig.specularIntensity;
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = 1.0 * lightingConfig.specularIntensity;
    }
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = 1.25 * Math.min(1.8, Math.max(0.6, lightingConfig.specularIntensity));
    }
  }, [lightingConfig]);

  // Handle Model and Skin swaps smoothly
  useEffect(() => {
    const turntable = turntableGroupRef.current;
    if (!turntable) return;

    // Remove existing aircraft
    if (aircraftGroupRef.current) {
      turntable.remove(aircraftGroupRef.current);
      aircraftGroupRef.current.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      aircraftGroupRef.current = null;
      propMeshRef.current = null;
    }

    // Build new aircraft with updated geometry and skin
    let newPlane: THREE.Group;
    let newProp: THREE.Mesh | THREE.Group | undefined;

    const actualKey: PlaneModelKey =
      modelType === 'player' || modelType === 'none' ? 'spitfire' : modelType;

    if (actualKey === 'spitfire') {
      const built = buildPlayerAircraft(skinId);
      newPlane = built.plane;
      newProp = built.propGroup;
    } else {
      const built = buildWingmanAircraft(actualKey, skinId);
      newPlane = built.plane;
      newProp = built.prop;
    }

    newPlane.position.set(0, 1.25, 0);
    newPlane.rotation.x = -0.06;
    turntable.add(newPlane);

    aircraftGroupRef.current = newPlane;
    propMeshRef.current = newProp || null;
  }, [modelType, skinId]);

  // Main Scene Mount Effect (Runs only once on canvas mount)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Cinematic Hangar Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0f14, 0.022);
    sceneRef.current = scene;

    // 2. Camera: High quality 3/4 perspective
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 5.5, 13.5);
    camera.lookAt(0, 0.8, 0);

    // 3. Renderer with soft shadow maps and tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25 * lightingConfigRef.current.specularIntensity;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Rig (Key Spotlight + Rim Light + Metal Specular Fill)
    const ambientLight = new THREE.AmbientLight(0x475569, 1.4);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Overhead Hangar Bay Spotlight
    const spotlight = new THREE.SpotLight(
      new THREE.Color(lightingConfigRef.current.lightColor),
      3.2 * lightingConfigRef.current.specularIntensity
    );
    spotlight.position.set(0, 15, 4);
    spotlight.angle = Math.PI / 4;
    spotlight.penumbra = 0.5;
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
    spotlight.shadow.bias = -0.001;
    scene.add(spotlight);
    scene.add(spotlight.target);
    spotlight.target.position.set(0, 0.5, 0);
    spotlightRef.current = spotlight;

    // Cyan metallic rim light from rear-right
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8 * lightingConfigRef.current.specularIntensity);
    rimLight.position.set(10, 8, -10);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Amber workshop fill light from front-left
    const fillLight = new THREE.DirectionalLight(0xf59e0b, 1.0 * lightingConfigRef.current.specularIntensity);
    fillLight.position.set(-10, 5, 8);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // 5. Concrete Turntable Platform & Hangar Floor
    const hangarBaseGroup = new THREE.Group();
    scene.add(hangarBaseGroup);

    // Polished Dark Concrete Floor
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f151c,
      roughness: 0.35,
      metalness: 0.5,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    hangarBaseGroup.add(floor);

    // Rotating Circular Turntable Disc
    const turntableGroup = new THREE.Group();
    scene.add(turntableGroup);
    turntableGroupRef.current = turntableGroup;

    const platformGeo = new THREE.CylinderGeometry(6.2, 6.4, 0.25, 48);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x182029,
      roughness: 0.4,
      metalness: 0.6,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 0.12;
    platform.receiveShadow = true;
    platform.castShadow = true;
    turntableGroup.add(platform);

    // Steel Ring Track
    const ringGeo = new THREE.RingGeometry(5.8, 6.1, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.2,
      metalness: 0.9,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.26;
    turntableGroup.add(ring);

    // Inner Concentric Hazard Lines
    const innerRingGeo = new THREE.RingGeometry(3.6, 3.8, 36);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      side: THREE.DoubleSide,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.26;
    turntableGroup.add(innerRing);

    // Circular Perimeter Runway Ticks
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const tick = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 0.8),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide })
      );
      tick.rotation.x = -Math.PI / 2;
      tick.rotation.z = -angle;
      tick.position.set(Math.cos(angle) * 5.4, 0.26, Math.sin(angle) * 5.4);
      turntableGroup.add(tick);
    }

    // Build the Initial Aircraft Model
    let initialPlane: THREE.Group;
    let initialProp: THREE.Mesh | THREE.Group | undefined;

    const initKey: PlaneModelKey =
      modelType === 'player' || modelType === 'none' ? 'spitfire' : modelType;

    if (initKey === 'spitfire') {
      const built = buildPlayerAircraft(skinId);
      initialPlane = built.plane;
      initialProp = built.propGroup;
    } else {
      const built = buildWingmanAircraft(initKey, skinId);
      initialPlane = built.plane;
      initialProp = built.prop;
    }

    initialPlane.position.set(0, 1.25, 0);
    initialPlane.rotation.x = -0.06;
    turntableGroup.add(initialPlane);
    aircraftGroupRef.current = initialPlane;
    propMeshRef.current = initialProp || null;

    // 7. Interactive Drag-to-Rotate Variables
    let isDragging = false;
    let prevMouseX = 0;
    let autoRotate = true;
    let idleTimer: NodeJS.Timeout | null = null;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      autoRotate = false;
      if (idleTimer) clearTimeout(idleTimer);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      prevMouseX = clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - prevMouseX;
      prevMouseX = clientX;
      turntableGroup.rotation.y += deltaX * 0.009;
    };

    const onPointerUp = () => {
      isDragging = false;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        autoRotate = true;
      }, 2500);
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 8. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const _delta = clock.getDelta();

      // Smooth propeller spin
      if (propMeshRef.current) {
        propMeshRef.current.rotation.z += 0.25;
      }

      // Continuous turntable rotation scaled by user setting
      if (autoRotate) {
        const speedMult = lightingConfigRef.current.rotationSpeed ?? 1.0;
        turntableGroup.rotation.y += 0.007 * speedMult;
      }

      // Gentle aircraft suspension breathing motion
      if (aircraftGroupRef.current) {
        const t = clock.getElapsedTime();
        aircraftGroupRef.current.position.y = 1.25 + Math.sin(t * 1.5) * 0.03;
      }

      renderer.render(scene, camera);
    };

    render();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      if (idleTimer) clearTimeout(idleTimer);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sceneRef.current = null;
      turntableGroupRef.current = null;
      aircraftGroupRef.current = null;
      propMeshRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none ${className}`}
    />
  );
};
