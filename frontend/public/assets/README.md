# SmartDesk Assets Directory

This directory contains all static assets for the SmartDesk application.

## Directory Structure

### 📁 `/sounds/`
- **notification.mp3** - Notification sound effects
- **success.mp3** - Success action sounds
- **error.mp3** - Error alert sounds
- **click.mp3** - Button click sounds

### 📁 `/images/`
- **backgrounds/** - Background images and patterns
- **illustrations/** - UI illustrations and graphics
- **screenshots/** - Application screenshots for documentation

### 📁 `/icons/`
- **favicon.ico** - Browser favicon
- **app-icon-192.png** - PWA icon (192x192)
- **app-icon-512.png** - PWA icon (512x512)
- **apple-touch-icon.png** - iOS home screen icon

### 📁 `/logos/`
- **smartdesk-logo.svg** - Main application logo (SVG)
- **smartdesk-logo.png** - Main application logo (PNG)
- **chatbot-avatar.svg** - Chatbot avatar/logo
- **brand-mark.svg** - Brand mark/symbol only

## Usage

Access assets in your components using the public path:

```typescript
// Sounds
const notificationSound = '/assets/sounds/notification.mp3';

// Images
const backgroundImage = '/assets/images/backgrounds/pattern.svg';

// Icons
const appIcon = '/assets/icons/app-icon-192.png';

// Logos
const mainLogo = '/assets/logos/smartdesk-logo.svg';
```

## File Formats

- **Sounds**: MP3, WAV, OGG
- **Images**: PNG, JPG, SVG, WebP
- **Icons**: ICO, PNG, SVG
- **Logos**: SVG (preferred), PNG

## Guidelines

1. Keep file sizes optimized for web
2. Use SVG for scalable graphics
3. Provide multiple sizes for icons
4. Use descriptive filenames
5. Compress images before adding