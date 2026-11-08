/**
 * ==============================================================================
 * SURMIO MUSIC PLAYER - CENTRAL CONFIGURATION FILE
 * ==============================================================================
 * 
 * Single source of truth for app metadata, download links, Telegram links,
 * and support information. Grounded strictly in the actual Surmio project.
 * 
 * [EDITABLE PLACEHOLDER] marks URLs and channels you can configure.
 * ==============================================================================
 */

export const config = {
  // General App Information (Grounded in the real Surmio app)
  app: {
    name: "Surmio",
    tagline: "Music, in your rhythm.",
    badge: "Version 1.0 Live • Android APK & Web PWA Available",
    version: "v1.0",
    releaseDate: "November 2026",
    license: "Free & Open Source",
    taglineSub: "Stream your favorite songs, listen in the background with your screen locked, sing along with dynamic lyrics, and save tracks for offline listening—100% free and without ads.",
    githubRepo: "https://github.com/aditys4444/Surmio-Music-app" // [EDITABLE PLACEHOLDER]
  },

  // Telegram Channel & Community Details
  // [EDITABLE PLACEHOLDER] Replace with your actual Telegram links & handles
  telegram: {
    channelUrl: "https://telegram.me/+n5uBAsCDeYUyMjg1",             // <-- Unblocked Telegram Channel link
    communityGroupUrl: "https://telegram.me/+n5uBAsCDeYUyMjg1",     // <-- Telegram Channel link
    channelHandle: "Surmio Music Channel",                      // <-- Channel handle / name
    memberCount: "15.8k",
    onlineCount: "2.4k online",
    channelTitle: "Surmio Official • Music & Releases",
    
    // Sample messages to display in the interactive Telegram channel mockup
    samplePosts: [
      {
        id: 1,
        author: "Surmio Official",
        handle: "@SurmioMusic",
        avatar: "assets/icons/telegram-avatar.svg",
        time: "Today at 14:20",
        pinned: true,
        content: `🎉 <b>Surmio v1.0 is now live!</b><br><br>
Here's what you can do with this release:<br>
• 📱 <b>True Background Playback</b> — music keeps playing when your phone screen is locked or while multitasking.<br>
• 🎧 <b>MediaSession Controls</b> — lockscreen widget, notification bar, and Bluetooth earbud gestures.<br>
• ⬇️ <b>Direct Offline Audio Saving</b> — download songs directly to your phone storage in seconds.<br>
• 🎛️ <b>10-Band Studio Equalizer</b> — customize your sound curve with built-in presets and Bass Boost.<br>
• 📜 <b>Dynamic Synchronized Lyrics</b> — line-by-line karaoke tracking for singing along.<br><br>
Grab the direct APK (7.7 MB) below or install the Web PWA! 👇`,
        reactions: [
          { emoji: "🔥", count: 842 },
          { emoji: "❤️", count: 526 },
          { emoji: "🎉", count: 319 }
        ]
      },
      {
        id: 2,
        author: "Surmio Official",
        handle: "@SurmioMusic",
        avatar: "assets/icons/telegram-avatar.svg",
        time: "Yesterday at 18:45",
        pinned: false,
        content: `🗳️ <b>Community Poll: What feature should we focus on next?</b><br><br>
Vote in the poll below to help shape the next update! Sleep timer, custom playlist covers, and auto-downloading favorite artists are leading the votes.`,
        reactions: [
          { emoji: "🚀", count: 412 },
          { emoji: "⚡", count: 289 }
        ]
      }
    ]
  },

  // Platform Downloads & Verified URLs
  downloads: {
    android: {
      name: "Android",
      icon: "android",
      version: "v1.0 (Stable)",
      size: "7.7 MB",
      minOs: "Android 7.0 (Nougat) or newer",
      // Verified SHA256 of the actual build in downloads/Surmio-Music-v1.0.apk
      sha256: "92eba0ab1e257570d745bc5bbc0bbff3b23c617e02f4bf6a60459cf9593465ca",
      primaryUrl: "downloads/Surmio-Music-v1.0.apk",
      fileName: "Surmio-Music-v1.0.apk",
      badge: "Direct APK Install (7.7 MB)",
      isVerified: true,
      alternatives: [
        { label: "Install via PWA", url: "#preview", note: "Add to Home Screen (Instant)" },
        { label: "Telegram APK Drop", url: "https://telegram.me/+n5uBAsCDeYUyMjg1", note: "Direct in Telegram" }
      ]
    },
    web: {
      name: "Web Player & PWA",
      icon: "globe",
      version: "v1.0",
      size: "Zero Install",
      minOs: "Chrome, Safari, Edge, Firefox",
      primaryUrl: "#preview",
      fileName: "Surmio Web App",
      badge: "Installable PWA (Add to Home Screen)",
      isVerified: true,
      alternatives: [
        { label: "Launch Web Demo", url: "#preview", note: "Instant In-Browser Test" },
        { label: "Offline Mode", url: "#install", note: "Service Worker Cached" }
      ]
    },
    desktop: {
      name: "Desktop (Win / Mac / Linux)",
      icon: "desktop",
      version: "PWA Available • Native Upcoming",
      size: "Web-Powered",
      minOs: "Windows 10+, macOS 11+, Linux",
      primaryUrl: "#preview",
      fileName: "Surmio PWA Desktop",
      badge: "Install via Browser / Native Builds on Telegram",
      isVerified: true,
      alternatives: [
        { label: "Install via Chrome / Edge", url: "#install", note: "Click 'Install App' in browser" },
        { label: "Native Binaries", url: "https://telegram.me/+n5uBAsCDeYUyMjg1", note: "Subscribe for desktop drops" }
      ]
    }
  },

  // Support and Community links
  links: {
    github: "https://github.com/aditys4444/Surmio-Music-app",       // [EDITABLE PLACEHOLDER]
    telegram: "https://telegram.me/+n5uBAsCDeYUyMjg1",                       // [EDITABLE PLACEHOLDER]
    supportEmail: "support@surmiomusic.online",                         // [EDITABLE PLACEHOLDER]
    docs: "#faq"
  },

  // Verified Core Features based directly on Surmio codebase
  features: [
    {
      id: "background-playback",
      badge: "Uninterrupted Audio",
      title: "True Background & Lockscreen Playback",
      desc: "Music never cuts off when your screen locks or when switching between apps. Integrated with the OS MediaSession API for lockscreen widgets, notifications, and Bluetooth earbud controls.",
      icon: "playback"
    },
    {
      id: "offline-downloads",
      badge: "Offline Freedom",
      title: "Direct Offline Audio Saving",
      desc: "Download full-length tracks directly into your local device storage in seconds. Enjoy your favorite music offline while traveling or on low-connectivity networks without buffering.",
      icon: "download"
    },
    {
      id: "studio-equalizer",
      badge: "Audio Tuning",
      title: "10-Band Equalizer & Bass Boost",
      desc: "Fine-tune your acoustic profile from deep 31 Hz sub-bass to crisp 16 kHz highs. Includes one-tap presets for Bass Boost, Vocal Clarity, EDM, and Rock.",
      icon: "equalizer"
    },
    {
      id: "synced-lyrics",
      badge: "Interactive Lyrics",
      title: "Dynamic Synchronized Lyrics",
      desc: "Follow along in real-time with smooth line-by-line karaoke tracking and word glow. Perfect for singing along to your favorite tracks.",
      icon: "lyrics"
    },
    {
      id: "music-catalog",
      badge: "Infinite Discovery",
      title: "Curated Genres & Instant Search",
      desc: "Discover Bollywood, Punjabi, Lo-Fi, English Pop, Devotional / Bhakti, and Classical music with instant live search autocomplete and infinite continuous scrolling.",
      icon: "catalog"
    },
    {
      id: "privacy-zero-ads",
      badge: "Privacy First",
      title: "Zero Ads & Zero Telemetry",
      desc: "No forced video ads, no audio interruptions, no login requirements, and no invasive trackers. Just pure, uninterrupted music for everyone.",
      icon: "shield"
    }
  ],

  // Grounded Frequently Asked Questions
  faqs: [
    {
      category: "general",
      q: "What is Surmio and how does it work?",
      a: "Surmio is a modern, high-fidelity music streaming and offline player available as a native Android APK and an installable Progressive Web App (PWA). It lets you stream popular music, download tracks directly to your device storage, and play music continuously even when your screen is locked."
    },
    {
      category: "android",
      q: "How do I install the Android APK file?",
      a: "1. Tap <b>Download Android APK</b> to get <code>Surmio-Music-v1.0.apk</code> (7.7 MB).<br>2. When your browser shows the notice <i>'File might be harmful'</i>, tap <b>Download anyway</b> (this is Google's default security prompt for any APK downloaded outside Google Play).<br>3. Open the downloaded file from your notifications or Downloads folder.<br>4. If asked to allow unknown apps, tap <b>Settings</b>, switch on <b>'Allow from this source'</b>, and tap <b>Install</b>."
    },
    {
      category: "audio",
      q: "Does background playback really work when the phone is locked?",
      a: "Yes! Surmio utilizes the native MediaSession API and background audio streaming. When your screen turns off or you switch to other apps, the music keeps playing seamlessly. You can pause, skip, and see album art right on your lockscreen and notification shade, or control playback via wireless Bluetooth earbuds."
    },
    {
      category: "telegram",
      q: "What can I expect in the Telegram channel?",
      a: "Our Telegram channel (<code>@SurmioMusic</code>) is the official community hub where we share direct APK updates before anyone else, announce new feature releases, host community polls on upcoming capabilities, and provide direct help for any user questions."
    },
    {
      category: "privacy",
      q: "What data does Surmio collect about me?",
      a: "None. Surmio does not require an account, has zero tracking scripts, and contains no third-party telemetry. When you use the contact support form on this website, your name and email are used exclusively to reply to your question and are never stored in marketing lists or shared with third parties."
    },
    {
      category: "general",
      q: "Can I use Surmio on PC, Mac, or iOS?",
      a: "Yes! Surmio runs as a full Progressive Web App (PWA). In Chrome, Edge, or Safari, simply click 'Install Surmio' or 'Add to Home Screen' to run it as a standalone app on your desktop or iPad/iPhone with offline caching."
    }
  ],

  // Grounded Changelog History
  changelog: [
    {
      version: "v1.0.0",
      date: "November 2026",
      tag: "Stable Release",
      isLatest: true,
      items: [
        "📱 Official Android APK release (7.7 MB clean package)",
        "🔒 True background and lockscreen playback via MediaSession API",
        "⬇️ Direct audio download capability for offline listening",
        "🎛️ 10-band equalizer with Bass Boost and acoustic genre presets",
        "📜 Dynamic synchronized karaoke lyrics with real-time glow",
        "🎵 Curated genres: Bollywood, Punjabi, Lo-Fi, English Pop & Devotional",
        "🌐 Progressive Web App (PWA) support with offline caching"
      ]
    }
  ]
};

if (typeof window !== "undefined") {
  window.SURMIO_CONFIG = config;
}
