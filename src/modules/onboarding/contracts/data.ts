// Onboarding Module Data Contracts
// Version: 1.0.0

export interface OnboardingStatus {
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: Date;
  dreamId?: string;
  phase?: 'explore' | 'build' | 'launch';
  version: number;
}

export interface UserDream {
  id: string;
  userId: string;
  dreamText: string;
  currentPhase: 'explore' | 'build' | 'launch';
  starterActions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPlatformSettings {
  userId: string;
  onboardingCompleted: boolean;
  preferredPhase?: 'explore' | 'build' | 'launch';
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingRepository {
  getStatus(userId: string): Promise<OnboardingStatus | null>;
  createStatus(status: Omit<OnboardingStatus, 'version'>): Promise<OnboardingStatus>;
  updateStatus(userId: string, updates: Partial<OnboardingStatus>): Promise<OnboardingStatus>;
  completeOnboarding(userId: string, dreamId: string, phase: 'explore' | 'build' | 'launch'): Promise<OnboardingStatus>;
}

export interface UserDreamRepository {
  findByUserId(userId: string): Promise<UserDream | null>;
  create(dream: Omit<UserDream, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserDream>;
  update(id: string, updates: Partial<UserDream>): Promise<UserDream>;
}

export interface UserPlatformSettingsRepository {
  findByUserId(userId: string): Promise<UserPlatformSettings | null>;
  upsert(settings: Omit<UserPlatformSettings, 'createdAt' | 'updatedAt'>): Promise<UserPlatformSettings>;
}
