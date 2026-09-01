export interface UserProfile {
  name: string;
  email: string;
  credits: number;
  tier: 'free' | 'pro' | 'brand';
  avatarUrl?: string;
}

export interface AvatarOption {
  id: string;
  name: string;
  type: string;
  gender: 'Female' | 'Male';
  img: string;
  description: string;
  niche: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  provider: string;
  gender: 'Female' | 'Male';
  accent: string;
  style: string;
}

export interface UGCScript {
  hook: string;
  body: string[];
  cta: string;
  estimatedDuration: string;
  caption: string;
  hashtags: string[];
}

export interface VideoAsset {
  id: string;
  title: string;
  avatarName: string;
  avatarImg: string;
  voiceName: string;
  script: UGCScript;
  aspectRatio: '9:16' | '16:9' | '1:1';
  duration: string;
  createdAt: string;
  status: 'processing' | 'ready' | 'failed';
  videoUrl?: string;
  posterUrl: string;
  views?: number;
  likes?: number;
}

export interface ImageAsset {
  id: string;
  url: string;
  prompt: string;
  enhancedPrompt?: string;
  caption?: string;
  title?: string;
  hashtags?: string[];
  ratio: '1:1' | '4:5' | '9:16' | '16:9';
  mode: 'influencer' | 'carousel' | 'product' | 'lifestyle';
  createdAt: string;
}

export interface AssetFilter {
  type: 'all' | 'video' | 'image' | 'carousel';
  search: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  credits: number;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
}
