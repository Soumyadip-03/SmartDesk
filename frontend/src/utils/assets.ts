// Asset utility functions for SmartDesk

export const ASSETS = {
  // Sounds
  SOUNDS: {
    NOTIFICATION: '/assets/sounds/notification sound.wav',
    SUCCESS: '/assets/sounds/success.mp3',
    ERROR: '/assets/sounds/error.mp3',
    CLICK: '/assets/sounds/click.mp3',
  },
  
  // Images
  IMAGES: {
    BACKGROUNDS: {
      PATTERN: '/assets/images/backgrounds/pattern.svg',
      HERO: '/assets/images/backgrounds/hero.jpg',
    },
    ILLUSTRATIONS: {
      EMPTY_STATE: '/assets/images/illustrations/empty-state.svg',
      ERROR_404: '/assets/images/illustrations/404.svg',
    }
  },
  
  // Icons
  ICONS: {
    FAVICON: '/assets/icons/favicon.ico',
    APP_192: '/assets/icons/app-icon-192.png',
    APP_512: '/assets/icons/app-icon-512.png',
    APPLE_TOUCH: '/assets/icons/apple-touch-icon.png',
  },
  
  // Logos
  LOGOS: {
    MAIN_PNG: '/assets/logos/smartdesk-logo.png',
    CHATBOT: '/assets/icons/chatbot-avatar.png',
  }
} as const;

// Audio utility functions
export class AudioManager {
  private static audioCache = new Map<string, HTMLAudioElement>();
  
  static async playSound(soundPath: string, volume = 0.5): Promise<void> {
    try {
      let audio = this.audioCache.get(soundPath);
      
      if (!audio) {
        audio = new Audio(soundPath);
        audio.volume = volume;
        this.audioCache.set(soundPath, audio);
      }
      
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }
  
  static preloadSounds(soundPaths: string[]): void {
    soundPaths.forEach(path => {
      if (!this.audioCache.has(path)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.audioCache.set(path, audio);
      }
    });
  }
}

// Image utility functions
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Preload critical assets
export const preloadCriticalAssets = (): void => {
  // Preload notification sounds
  AudioManager.preloadSounds([
    ASSETS.SOUNDS.NOTIFICATION,
    ASSETS.SOUNDS.SUCCESS,
    ASSETS.SOUNDS.ERROR,
  ]);
  
  // Preload critical images
  const criticalImages = [
    ASSETS.LOGOS.MAIN_PNG,
  ];
  
  criticalImages.forEach(src => {
    loadImage(src).catch(console.warn);
  });
};