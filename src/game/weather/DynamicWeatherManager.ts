import * as THREE from 'three';
import { WeatherType } from '../types';
import { buildRainSystem } from '../models';
import { sound } from '../../audio/soundEngine';

interface WeatherProfile {
  fogColor: THREE.Color;
  fogDensity: number;
  ambientColor: THREE.Color;
  ambientIntensity: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  oceanColor: THREE.Color;
  rainActive: boolean;
}

export class DynamicWeatherManager {
  private scene: THREE.Scene;
  private ambientLight: THREE.AmbientLight;
  private sun: THREE.DirectionalLight;
  private ocean: THREE.Mesh;
  private rainMesh: THREE.LineSegments | null = null;
  private rainPositions: Float32Array | null = null;

  public currentWeather: WeatherType;
  private targetWeather: WeatherType;
  private isTransitioning: boolean = false;
  private transitionAlpha: number = 1.0;
  private transitionSpeed: number = 0.35; // ~3 seconds full transition

  // Profiles
  private profiles: Record<WeatherType, WeatherProfile> = {
    sunny: {
      fogColor: new THREE.Color(0x131c24),
      fogDensity: 0.011,
      ambientColor: new THREE.Color(0x8fa3b8),
      ambientIntensity: 1.4,
      sunColor: new THREE.Color(0xfff3db),
      sunIntensity: 2.0,
      oceanColor: new THREE.Color(0x112738),
      rainActive: false,
    },
    rainstorm: {
      fogColor: new THREE.Color(0x0f172a),
      fogDensity: 0.02,
      ambientColor: new THREE.Color(0x475569),
      ambientIntensity: 0.9,
      sunColor: new THREE.Color(0x94a3b8),
      sunIntensity: 1.0,
      oceanColor: new THREE.Color(0x09141d),
      rainActive: true,
    },
    dense_fog: {
      fogColor: new THREE.Color(0x334155),
      fogDensity: 0.034,
      ambientColor: new THREE.Color(0x64748b),
      ambientIntensity: 1.25,
      sunColor: new THREE.Color(0x94a3b8),
      sunIntensity: 1.1,
      oceanColor: new THREE.Color(0x162533),
      rainActive: false,
    },
  };

  // Interpolation cache
  private startProfile: WeatherProfile;
  private currentProfileValues: WeatherProfile;

  // Random weather change timer
  private timer: number = 0;
  private nextChangeInterval: number = 900; // frames
  private onWeatherChangeCallback?: (weather: WeatherType, notification: string) => void;

  constructor(
    scene: THREE.Scene,
    ambientLight: THREE.AmbientLight,
    sun: THREE.DirectionalLight,
    ocean: THREE.Mesh,
    initialWeather: WeatherType = 'sunny',
    onWeatherChange?: (weather: WeatherType, notification: string) => void
  ) {
    this.scene = scene;
    this.ambientLight = ambientLight;
    this.sun = sun;
    this.ocean = ocean;
    this.currentWeather = initialWeather;
    this.targetWeather = initialWeather;
    this.onWeatherChangeCallback = onWeatherChange;

    // Build Rain Line Mesh (kept in scene, visibility controlled)
    const { rainMesh, positions } = buildRainSystem(1400);
    this.rainMesh = rainMesh;
    this.rainPositions = positions;
    this.rainMesh.visible = initialWeather === 'rainstorm';
    this.scene.add(this.rainMesh);

    // Deep copy starting profile
    this.startProfile = {
      fogColor: this.profiles[initialWeather].fogColor.clone(),
      fogDensity: this.profiles[initialWeather].fogDensity,
      ambientColor: this.profiles[initialWeather].ambientColor.clone(),
      ambientIntensity: this.profiles[initialWeather].ambientIntensity,
      sunColor: this.profiles[initialWeather].sunColor.clone(),
      sunIntensity: this.profiles[initialWeather].sunIntensity,
      oceanColor: this.profiles[initialWeather].oceanColor.clone(),
      rainActive: this.profiles[initialWeather].rainActive,
    };

    this.currentProfileValues = {
      fogColor: this.profiles[initialWeather].fogColor.clone(),
      fogDensity: this.profiles[initialWeather].fogDensity,
      ambientColor: this.profiles[initialWeather].ambientColor.clone(),
      ambientIntensity: this.profiles[initialWeather].ambientIntensity,
      sunColor: this.profiles[initialWeather].sunColor.clone(),
      sunIntensity: this.profiles[initialWeather].sunIntensity,
      oceanColor: this.profiles[initialWeather].oceanColor.clone(),
      rainActive: this.profiles[initialWeather].rainActive,
    };

    this.applyProfile(this.currentProfileValues);
  }

  public setWeather(weather: WeatherType, notify = true) {
    if (this.targetWeather === weather && !this.isTransitioning) return;

    this.startProfile = {
      fogColor: this.currentProfileValues.fogColor.clone(),
      fogDensity: this.currentProfileValues.fogDensity,
      ambientColor: this.currentProfileValues.ambientColor.clone(),
      ambientIntensity: this.currentProfileValues.ambientIntensity,
      sunColor: this.currentProfileValues.sunColor.clone(),
      sunIntensity: this.currentProfileValues.sunIntensity,
      oceanColor: this.currentProfileValues.oceanColor.clone(),
      rainActive: this.currentProfileValues.rainActive,
    };

    this.targetWeather = weather;
    this.transitionAlpha = 0;
    this.isTransitioning = true;

    if (weather === 'rainstorm' && this.rainMesh) {
      this.rainMesh.visible = true;
    }

    if (notify && this.onWeatherChangeCallback) {
      const label =
        weather === 'rainstorm'
          ? '熱帶暴風雨席捲戰區！視野受限，雷電轟鳴'
          : weather === 'dense_fog'
          ? '深重濃霧籠罩海域！嚴防低空突襲'
          : '風暴漸止，天際拂曉放晴！重獲全空域視野';
      this.onWeatherChangeCallback(weather, label);
    }
  }

  public update(dt: number, frame: number) {
    // 1. Random Weather Transition Trigger during Mission
    this.timer++;
    if (this.timer >= this.nextChangeInterval) {
      this.timer = 0;
      this.nextChangeInterval = 850 + Math.floor(Math.random() * 600); // 15-25s

      // Cycle to a different weather condition
      const weathers: WeatherType[] = ['sunny', 'rainstorm', 'dense_fog'];
      const candidates = weathers.filter(w => w !== this.currentWeather);
      const nextW = candidates[Math.floor(Math.random() * candidates.length)];
      this.setWeather(nextW, true);
    }

    // 2. Smooth Lerp Transition
    if (this.isTransitioning) {
      this.transitionAlpha += dt * this.transitionSpeed;
      if (this.transitionAlpha >= 1) {
        this.transitionAlpha = 1;
        this.isTransitioning = false;
        this.currentWeather = this.targetWeather;
        if (this.rainMesh) {
          this.rainMesh.visible = this.profiles[this.currentWeather].rainActive;
        }
      }

      const targetProf = this.profiles[this.targetWeather];

      // Lerp Fog
      this.currentProfileValues.fogColor.lerpColors(
        this.startProfile.fogColor,
        targetProf.fogColor,
        this.transitionAlpha
      );
      this.currentProfileValues.fogDensity = THREE.MathUtils.lerp(
        this.startProfile.fogDensity,
        targetProf.fogDensity,
        this.transitionAlpha
      );

      // Lerp Ambient Light
      this.currentProfileValues.ambientColor.lerpColors(
        this.startProfile.ambientColor,
        targetProf.ambientColor,
        this.transitionAlpha
      );
      this.currentProfileValues.ambientIntensity = THREE.MathUtils.lerp(
        this.startProfile.ambientIntensity,
        targetProf.ambientIntensity,
        this.transitionAlpha
      );

      // Lerp Sun Light
      this.currentProfileValues.sunColor.lerpColors(
        this.startProfile.sunColor,
        targetProf.sunColor,
        this.transitionAlpha
      );
      this.currentProfileValues.sunIntensity = THREE.MathUtils.lerp(
        this.startProfile.sunIntensity,
        targetProf.sunIntensity,
        this.transitionAlpha
      );

      // Lerp Ocean
      this.currentProfileValues.oceanColor.lerpColors(
        this.startProfile.oceanColor,
        targetProf.oceanColor,
        this.transitionAlpha
      );

      this.applyProfile(this.currentProfileValues);
    }

    // 3. Rain Particle Stream in Rainstorm
    if (this.rainMesh && this.rainPositions && this.rainMesh.visible) {
      for (let i = 0; i < this.rainPositions.length / 6; i++) {
        this.rainPositions[i * 6 + 1] -= 1.8;
        this.rainPositions[i * 6 + 4] -= 1.8;
        if (this.rainPositions[i * 6 + 1] < 0) {
          this.rainPositions[i * 6 + 1] = 45;
          this.rainPositions[i * 6 + 4] = 45 - (1.2 + Math.random() * 0.8);
        }
      }
      this.rainMesh.geometry.attributes.position.needsUpdate = true;

      // Random Lightning Flash & Thunder
      if (frame % 460 === 0 && Math.random() > 0.35) {
        this.sun.intensity = 4.6;
        sound.thunder();
        setTimeout(() => {
          this.sun.intensity = this.currentProfileValues.sunIntensity;
        }, 130);
      }
    }
  }

  private applyProfile(profile: WeatherProfile) {
    if (this.scene.fog && 'density' in this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.copy(profile.fogColor);
      (this.scene.fog as THREE.FogExp2).density = profile.fogDensity;
    }

    this.ambientLight.color.copy(profile.ambientColor);
    this.ambientLight.intensity = profile.ambientIntensity;

    this.sun.color.copy(profile.sunColor);
    this.sun.intensity = profile.sunIntensity;

    if (this.ocean.material && 'color' in this.ocean.material) {
      (this.ocean.material as THREE.MeshStandardMaterial).color.copy(profile.oceanColor);
    }
  }

  public dispose() {
    if (this.rainMesh) {
      this.scene.remove(this.rainMesh);
      this.rainMesh.geometry.dispose();
      (this.rainMesh.material as THREE.Material).dispose();
      this.rainMesh = null;
    }
  }
}
