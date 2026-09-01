import { AvatarOption, VoiceOption, PricingPlan, VideoAsset, ImageAsset } from './types';

export const AVATARS: AvatarOption[] = [
  {
    id: 'av_1',
    name: 'Sarah',
    type: 'Gen Z Fashion & Beauty',
    gender: 'Female',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400',
    description: 'High energy, authentic lifestyle & skincare review creator.',
    niche: 'Fashion, Beauty, Skincare'
  },
  {
    id: 'av_2',
    name: 'Marcus',
    type: 'Tech & Fitness Reviewer',
    gender: 'Male',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400',
    description: 'Confident, articulate gadget tester & fitness advocate.',
    niche: 'Tech, Gadgets, Gym'
  },
  {
    id: 'av_3',
    name: 'Elena',
    type: 'Luxury & Travel Host',
    gender: 'Female',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400',
    description: 'Sophisticated narrator for high-end products & hotel reviews.',
    niche: 'Luxury, Travel, Hospitality'
  },
  {
    id: 'av_4',
    name: 'David',
    type: 'E-commerce & Unboxing',
    gender: 'Male',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400',
    description: 'Relatable everyman creator with punchy unboxing reactions.',
    niche: 'Gadgets, Home Goods'
  },
  {
    id: 'av_5',
    name: 'Maya',
    type: 'Wellness & Foodie',
    gender: 'Female',
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400&h=400',
    description: 'Warm, cozy aesthetic for supplements, coffee & home decor.',
    niche: 'Food, Health, Home'
  }
];

export const VOICES: VoiceOption[] = [
  {
    id: 'v_1',
    name: 'Rachel (US - Conversational)',
    provider: 'ElevenLabs HD',
    gender: 'Female',
    accent: 'US English',
    style: 'Friendly & Upbeat'
  },
  {
    id: 'v_2',
    name: 'Drew (US - News & Authority)',
    provider: 'ElevenLabs HD',
    gender: 'Male',
    accent: 'US English',
    style: 'Clear & Trustworthy'
  },
  {
    id: 'v_3',
    name: 'Bella (UK - Casual Elegance)',
    provider: 'ElevenLabs HD',
    gender: 'Female',
    accent: 'British',
    style: 'Sophisticated & Natural'
  },
  {
    id: 'v_4',
    name: 'Antoni (US - High Energy)',
    provider: 'ElevenLabs HD',
    gender: 'Male',
    accent: 'US English',
    style: 'Enthusiastic & Viral'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan_starter',
    name: 'Free Starter',
    credits: 5,
    price: '$0',
    period: 'forever',
    features: [
      '5 AI Video Credits / month',
      'Unlimited Image & Carousel Generation',
      'Standard Avatar Models (720p)',
      'Basic AI Scriptwriter',
      '1080p Image Exports'
    ]
  },
  {
    id: 'plan_pro',
    name: 'Creator Pro',
    credits: 50,
    price: '$29',
    period: 'per month',
    isPopular: true,
    features: [
      '50 AI Video Credits / month',
      'Ultra-HD 4K Video Render',
      'Custom Voice Cloning & ElevenLabs HD',
      'AI Prompt Enhancer & Viral Script Engine',
      'Commercial Rights & Watermark Free',
      'Priority Queue Generation'
    ]
  },
  {
    id: 'plan_brand',
    name: 'Brand Scale',
    credits: 200,
    price: '$89',
    period: 'per month',
    features: [
      '200 AI Video Credits / month',
      'Multi-Avatar Team Workspaces',
      'Auto-Translate into 25+ Languages',
      'API Access for Automated Batch Output',
      'Dedicated Account Support',
      'Custom UGC Studio Branding'
    ]
  }
];

export const INITIAL_VIDEOS: VideoAsset[] = [
  {
    id: 'vid_101',
    title: 'GlowSkin Serum - Unboxing & Hook Test',
    avatarName: 'Sarah',
    avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400',
    voiceName: 'Rachel (US)',
    aspectRatio: '9:16',
    duration: '32s',
    createdAt: '2 hours ago',
    status: 'ready',
    posterUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600&h=900',
    views: 14200,
    likes: 1840,
    script: {
      hook: "Stop scrolling if your skin feels dry and dull this season! 💦",
      body: [
        "I was skeptical until I tried this hydration serum for 3 days straight.",
        "Look at this instant glass-skin finish - zero filter needed!",
        "It locks in moisture all day without feeling sticky or greasy."
      ],
      cta: "Click the link in bio to snag 20% off with my code GLOW20!",
      estimatedDuration: "32s",
      caption: "Glass skin achieved in 3 days! ✨ Drop a comment if you want the link!",
      hashtags: ["#SkincareRoutine", "#GlassSkin", "#UGCReview", "#GlowUp", "#BeautyHacks"]
    }
  },
  {
    id: 'vid_102',
    title: 'PulseFit Smart Watch - 60s Tech Review',
    avatarName: 'Marcus',
    avatarImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400',
    voiceName: 'Drew (US)',
    aspectRatio: '9:16',
    duration: '45s',
    createdAt: '1 day ago',
    status: 'ready',
    posterUrl: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=600&h=900',
    views: 28900,
    likes: 3410,
    script: {
      hook: "This smartwatch costs 1/4th of the big brands, but does THIS work?",
      body: [
        "I tested its heart rate monitor and sleep tracker against my $400 watch.",
        "The battery lasts 10 full days on a single charge - no joke.",
        "Plus, the AMOLED display is super bright even in direct sunlight."
      ],
      cta: "Tap shop now to lock in the early bird sale before it sells out!",
      estimatedDuration: "45s",
      caption: "The smartwatch disruptor of 2026. ⌚ Would you buy this?",
      hashtags: ["#TechReview", "#Smartwatch", "#Unboxing", "#Gadgets", "#FitnessGear"]
    }
  }
];

export const INITIAL_IMAGES: ImageAsset[] = [
  {
    id: 'img_201',
    title: 'OOTD Linen Cafe Aesthetic',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800&h=1000',
    prompt: 'A stylish woman in a white linen shirt and chic gold jewelry enjoying an iced matcha latte at a minimal Scandinavian cafe, natural golden hour sunlight, soft depth of field.',
    ratio: '4:5',
    mode: 'influencer',
    createdAt: '3 hours ago',
    caption: "Slow mornings & crisp linen shirts ☕✨\n\nSave this post for your weekend coffee outfit inspo! What's your go-to weekend drink?",
    hashtags: ['#OOTDinspo', '#MinimalistStyle', '#CafeAesthetic', '#CleanGirlLook', '#GoldenHour']
  },
  {
    id: 'img_202',
    title: 'Luxury Perfume Bottle Float',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800&h=800',
    prompt: 'Commercial product photography of a sleek glass perfume bottle floating over gentle water ripples, dramatic rim lighting, dark navy moody atmosphere.',
    ratio: '1:1',
    mode: 'product',
    createdAt: 'Yesterday',
    caption: "Elegance captured in a bottle. 🌌 Experience the new nocturnal fragrance collection.\n\nShop exclusively at our flagship store.",
    hashtags: ['#ProductPhotography', '#PerfumeCollection', '#LuxuryAesthetic', '#CommercialPhoto']
  }
];
