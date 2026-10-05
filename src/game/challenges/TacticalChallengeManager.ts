import { TacticalChallenge, EnemyType } from '../types';
import { sound } from '../../audio/soundEngine';

export class TacticalChallengeManager {
  public activeChallenge: TacticalChallenge | null = null;
  private cooldownTimer: number = 22; // initial start delay in seconds
  private onChallengeUpdateCallback?: (challenge: TacticalChallenge | null) => void;
  private onChallengeRewardCallback?: (rewardGold: number, title: string) => void;

  constructor(
    onChallengeUpdate?: (challenge: TacticalChallenge | null) => void,
    onChallengeReward?: (rewardGold: number, title: string) => void
  ) {
    this.onChallengeUpdateCallback = onChallengeUpdate;
    this.onChallengeRewardCallback = onChallengeReward;
  }

  public update(dt: number) {
    if (!this.activeChallenge) {
      this.cooldownTimer -= dt;
      if (this.cooldownTimer <= 0) {
        this.rollNewChallenge();
      }
      return;
    }

    if (this.activeChallenge.completed || this.activeChallenge.failed) {
      this.cooldownTimer -= dt;
      if (this.cooldownTimer <= 0) {
        this.activeChallenge = null;
        this.cooldownTimer = 40 + Math.random() * 25; // 40-65s cooldown
        this.notify();
      }
      return;
    }

    // Decrement active challenge countdown
    this.activeChallenge.timeLeft -= dt;
    if (this.activeChallenge.timeLeft <= 0) {
      this.activeChallenge.timeLeft = 0;
      this.activeChallenge.failed = true;
      this.cooldownTimer = 3.5; // display failed for 3.5s
      this.notify();
    }
  }

  private rollNewChallenge() {
    const roll = Math.random();
    let challenge: TacticalChallenge;

    if (roll < 0.28) {
      challenge = {
        id: `tc_${Date.now()}`,
        type: 'no_bombs_kills',
        title: '戰術挑戰：空戰機砲極限',
        description: '在 30 秒內不使用任何炸彈，以機砲擊落 3 架敵機！',
        duration: 30,
        timeLeft: 30,
        targetCount: 3,
        currentCount: 0,
        rewardGold: 350,
        completed: false,
        failed: false,
      };
    } else if (roll < 0.55) {
      challenge = {
        id: `tc_${Date.now()}`,
        type: 'bomb_structures',
        title: '戰術挑戰：精準對地爆破',
        description: '在 35 秒內精準投彈摧毀 2 座地面設施或防空陣地！',
        duration: 35,
        timeLeft: 35,
        targetCount: 2,
        currentCount: 0,
        rewardGold: 450,
        completed: false,
        failed: false,
      };
    } else if (roll < 0.78) {
      challenge = {
        id: `tc_${Date.now()}`,
        type: 'no_damage_kills',
        title: '戰術挑戰：無損空優突防',
        description: '在 25 秒內不受到任何敵火命中，並擊落 2 架敵機！',
        duration: 25,
        timeLeft: 25,
        targetCount: 2,
        currentCount: 0,
        rewardGold: 400,
        completed: false,
        failed: false,
      };
    } else {
      challenge = {
        id: `tc_${Date.now()}`,
        type: 'hunt_ace',
        title: '戰術挑戰：獵殺敵方王牌',
        description: '在 40 秒內獵殺 1 架王牌截擊機或斯圖卡俯衝機！',
        duration: 40,
        timeLeft: 40,
        targetCount: 1,
        currentCount: 0,
        rewardGold: 500,
        completed: false,
        failed: false,
      };
    }

    this.activeChallenge = challenge;
    sound.pickup();
    this.notify();
  }

  // Hook: When player shoots down an enemy aircraft
  public onAirKill(enemyType: EnemyType) {
    if (!this.activeChallenge || this.activeChallenge.completed || this.activeChallenge.failed) {
      return;
    }

    if (this.activeChallenge.type === 'no_bombs_kills' || this.activeChallenge.type === 'no_damage_kills') {
      this.activeChallenge.currentCount++;
      if (this.activeChallenge.currentCount >= this.activeChallenge.targetCount) {
        this.succeedChallenge();
      } else {
        this.notify();
      }
    } else if (this.activeChallenge.type === 'hunt_ace') {
      if (enemyType === 'ace' || enemyType === 'stuka' || enemyType === 'boss') {
        this.activeChallenge.currentCount++;
        this.succeedChallenge();
      }
    }
  }

  // Hook: When player destroys a ground structure with bombs
  public onGroundTargetBombed() {
    if (!this.activeChallenge || this.activeChallenge.completed || this.activeChallenge.failed) {
      return;
    }

    if (this.activeChallenge.type === 'bomb_structures') {
      this.activeChallenge.currentCount++;
      if (this.activeChallenge.currentCount >= this.activeChallenge.targetCount) {
        this.succeedChallenge();
      } else {
        this.notify();
      }
    }
  }

  // Hook: When player drops a bomb
  public onBombUsed() {
    if (!this.activeChallenge || this.activeChallenge.completed || this.activeChallenge.failed) {
      return;
    }

    if (this.activeChallenge.type === 'no_bombs_kills') {
      this.activeChallenge.failed = true;
      this.cooldownTimer = 3.5;
      this.notify();
    }
  }

  // Hook: When player takes damage
  public onPlayerDamaged() {
    if (!this.activeChallenge || this.activeChallenge.completed || this.activeChallenge.failed) {
      return;
    }

    if (this.activeChallenge.type === 'no_damage_kills') {
      this.activeChallenge.failed = true;
      this.cooldownTimer = 3.5;
      this.notify();
    }
  }

  private succeedChallenge() {
    if (!this.activeChallenge) return;
    this.activeChallenge.completed = true;
    this.cooldownTimer = 4.0; // display completed banner for 4s
    sound.pickup();

    if (this.onChallengeRewardCallback) {
      this.onChallengeRewardCallback(this.activeChallenge.rewardGold, this.activeChallenge.title);
    }
    this.notify();
  }

  private notify() {
    if (this.onChallengeUpdateCallback) {
      this.onChallengeUpdateCallback(
        this.activeChallenge ? { ...this.activeChallenge } : null
      );
    }
  }

  public dispose() {
    this.activeChallenge = null;
  }
}
