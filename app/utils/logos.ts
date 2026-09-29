/**
 * Simplified vector marks for app icons.
 * Each entry is the *inner* markup of an SVG with viewBox="0 0 48 48".
 * Drawn to stay legible at 28px while reading as "app artwork" at 128px.
 */
export const LOGOS: Record<string, string> = {
  /* ---------------- AI / productivity ---------------- */
  chatgpt: `
    <path d="M24 6.5 39.6 15.6v18.2L24 42.9 8.4 33.8V15.6z" fill="none" stroke="#fff" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M24 15.4 32.2 20.1v9.4L24 34.2 15.8 29.5v-9.4z" fill="#fff" opacity=".9"/>`,
  claude: `
    <g fill="#fff">
      <rect x="22.4" y="7" width="3.2" height="34" rx="1.6"/>
      <rect x="22.4" y="7" width="3.2" height="34" rx="1.6" transform="rotate(45 24 24)"/>
      <rect x="22.4" y="7" width="3.2" height="34" rx="1.6" transform="rotate(90 24 24)"/>
      <rect x="22.4" y="7" width="3.2" height="34" rx="1.6" transform="rotate(135 24 24)"/>
    </g>`,
  gemini: `
    <path d="M24 5c1.4 9.4 4.8 13.6 14 15-9.2 1.4-12.6 5.6-14 15-1.4-9.4-4.8-13.6-14-15 9.2-1.4 12.6-5.6 14-15z" fill="#4a86ff"/>
    <path d="M37.5 31.5c.6 3.9 2 5.6 5.5 6.2-3.5.6-4.9 2.3-5.5 6.2-.6-3.9-2-5.6-5.5-6.2 3.5-.6 4.9-2.3 5.5-6.2z" fill="#8ab4f8"/>`,
  notion: `
    <rect x="11" y="11" width="26" height="26" rx="6" fill="#fff"/>
    <path d="M18 33V16l12 17V16" fill="none" stroke="#111" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  things: `
    <circle cx="24" cy="24" r="17" fill="none" stroke="#fff" stroke-width="3.6"/>
    <path d="M16.5 24.4l5.2 5.2 10-10.6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  goodnotes: `
    <path d="M24 8l7 10-7 22-7-22z" fill="#fff"/>
    <path d="M17 18h14" stroke="#4aa8ff" stroke-width="3" stroke-linecap="round"/>`,
  forest: `
    <path d="M24 8l9.5 13h-5.5l7 10H13l7-10h-5.5z" fill="#fff"/>
    <rect x="22" y="30" width="4" height="9" rx="1.4" fill="#c98b52"/>`,

  /* ---------------- Social ---------------- */
  tiktok: `
    <path d="M29 9v19.2a6.6 6.6 0 1 1-6.6-6.6c.6 0 1.2.1 1.7.2v4.4a2.7 2.7 0 1 0 1.9 2.6V9z" fill="#fff"/>
    <path d="M31.6 12.6c1.6 2.4 4 3.8 6.9 4v4.3c-2.6-.1-5-1-7-2.6z" fill="#25f4ee"/>
    <path d="M28.6 9.4c1.6 2.4 4 3.8 6.9 4v4.3c-2.6-.1-5-1-7-2.6z" fill="#fe2c55" opacity=".85"/>`,
  instagram: `
    <rect x="11.5" y="11.5" width="25" height="25" rx="8" fill="none" stroke="#fff" stroke-width="3"/>
    <circle cx="24" cy="24" r="6" fill="none" stroke="#fff" stroke-width="3"/>
    <circle cx="31.4" cy="16.6" r="2.1" fill="#fff"/>`,
  threads: `
    <path d="M25.6 38c-6.8 0-11-4.6-11-14s4.4-14 10.6-14c5.2 0 8.6 3 9.6 8.2h-3.7c-.8-3.2-2.9-4.8-6-4.8-4.2 0-6.6 3.6-6.6 10.6 0 6.9 2.3 10.5 7 10.5 3.2 0 5.4-1.6 5.4-4.1 0-2.2-1.7-3.6-4.5-3.6-3.3 0-5.4 1.8-5.4 4.6 0 2.4 1.6 4.1 4.1 4.1 2.1 0 3.6-.9 4.6-2.6l3 1.6C31 36.6 28.8 38 25.6 38z" fill="#fff"/>`,
  whatsapp: `
    <path d="M24 9c8.3 0 15 6.7 15 15s-6.7 15-15 15c-2.6 0-5-.7-7.1-1.9L10 39l1.9-6.6A14.9 14.9 0 0 1 9 24c0-8.3 6.7-15 15-15z" fill="#fff"/>
    <path d="M19.4 17.4c.5-.1 1.1 0 1.5.6l1.5 2.5c.3.5.2 1.1-.2 1.5l-1 .9c-.3.3-.4.7-.2 1.1a10 10 0 0 0 4.6 4.4c.4.2.9.1 1.2-.2l.9-1c.4-.4 1-.5 1.5-.2l2.6 1.5c.6.3.8.9.7 1.5-.3 1.6-1.7 2.9-3.5 2.8-5.3-.3-9.9-4.9-10.3-10.2-.1-1.8 1.2-3.3 2.7-3.7z" fill="#25d366"/>`,
  snapchat: `
    <path d="M24 9c4.6 0 8 3.4 8 8.2 0 2 .3 3.4 1.2 4.3 1 .9 2.3 1.4 3.8 1.6l1.8.3-1 2.3-3.3.9c-.5.1-.7.4-.6.9l.9 3.3-4.5 1.4-1.3-1.6c-.6-.7-1.6-.7-2.2 0l-1.3 1.6-4.5-1.4.9-3.3c.1-.5-.1-.8-.6-.9l-3.3-.9-1-2.3 1.8-.3c1.5-.2 2.8-.7 3.8-1.6.9-.9 1.2-2.3 1.2-4.3C16 12.4 19.4 9 24 9z" fill="#fff"/>`,

  /* ---------------- Media ---------------- */
  youtube: `
    <rect x="7" y="13" width="34" height="22" rx="7" fill="#ff0033"/>
    <path d="M21 19.5 31 24l-10 4.5z" fill="#fff"/>`,
  spotify: `
    <g stroke="#fff" stroke-linecap="round" fill="none">
      <path d="M14.5 19.5c6.5-2 13.5-1.4 19 1.6" stroke-width="3.4"/>
      <path d="M16 26c5.2-1.6 10.8-1 15.2 1.4" stroke-width="3"/>
      <path d="M17.5 31.6c4-1.2 8.3-.7 11.7 1.1" stroke-width="2.6"/>
    </g>`,
  music: `
    <path d="M30 11v18.6a5.4 5.4 0 1 1-3.4-5V15l-9 2.4v14.2a5.4 5.4 0 1 1-3.4-5V14.4z" fill="#fff"/>`,
  podcast: `
    <circle cx="24" cy="19" r="5.4" fill="#fff"/>
    <path d="M19.6 26h8.8c1.6 0 2.6 1.2 2.4 2.7l-1.1 9.5a2.4 2.4 0 0 1-2.4 2.1h-6.6a2.4 2.4 0 0 1-2.4-2.1l-1.1-9.5C17 27.2 18 26 19.6 26z" fill="#fff"/>`,
  netflix: `
    <path d="M17 9h5.6l7.8 20.4V9H36v30h-5.6L22.6 18.6V39H17z" fill="#e50914"/>`,

  /* ---------------- Games ---------------- */
  roblox: `
    <rect x="9" y="9" width="30" height="30" rx="6" fill="#e2231a" transform="rotate(-12 24 24)"/>
    <rect x="18" y="18" width="12" height="12" rx="2.4" fill="#fff" transform="rotate(-12 24 24)"/>`,
  minecraft: `
    <rect x="9" y="9" width="30" height="30" rx="4" fill="#7a5230"/>
    <rect x="9" y="9" width="30" height="11" rx="4" fill="#5aa02c"/>
    <g fill="#00000018">
      <rect x="13" y="13" width="6" height="6"/><rect x="25" y="11" width="6" height="6"/>
      <rect x="17" y="25" width="7" height="7"/><rect x="29" y="27" width="6" height="6"/>
    </g>`,
  royalmatch: `
    <path d="M11 20l5 5 8-11 8 11 5-5-3 16H14z" fill="#ffcf3f"/>
    <rect x="13" y="33" width="22" height="4.5" rx="2.2" fill="#ffe89a"/>`,
  clashroyale: `
    <path d="M24 9l13 7v14l-13 9-13-9V16z" fill="#2f6fd0"/>
    <path d="M24 15l8 4.4v8.6L24 33l-8-5v-8.6z" fill="#fff" opacity=".92"/>`,
  clashofclans: `
    <path d="M13 20c-3-2-4-6-2-9 3 0 6 2 7 5" fill="#e8d5b0"/>
    <path d="M35 20c3-2 4-6 2-9-3 0-6 2-7 5" fill="#e8d5b0"/>
    <path d="M24 12c6.6 0 11 4.6 11 11v6c0 5-5 9-11 9s-11-4-11-9v-6c0-6.4 4.4-11 11-11z" fill="#b9905c"/>
    <path d="M19 24h4M25 24h4" stroke="#5c4527" stroke-width="2.6" stroke-linecap="round"/>`,
  brawlstars: `
    <path d="M24 7l5.4 10.4L41 19.6l-8.6 8.2 2.1 12.2L24 34.2 13.5 40l2.1-12.2L7 19.6l11.6-2.2z" fill="#fff"/>
    <circle cx="20.5" cy="23" r="2" fill="#ffb300"/><circle cx="27.5" cy="23" r="2" fill="#ffb300"/>`,
  candycrush: `
    <path d="M24 8l13 8.4v15.2L24 40 11 31.6V16.4z" fill="#fff" opacity=".95"/>
    <path d="M24 15l7.4 4.8v8.4L24 33l-7.4-4.8v-8.4z" fill="#ff4fa3"/>
    <circle cx="20" cy="20" r="2.4" fill="#ffd0e6"/><circle cx="28" cy="28" r="2.4" fill="#ffd0e6"/>`,
  genshin: `
    <path d="M24 7c2.6 7.6 6.4 11.4 14 14-7.6 2.6-11.4 6.4-14 14-2.6-7.6-6.4-11.4-14-14 7.6-2.6 11.4-6.4 14-14z" fill="#fff"/>
    <circle cx="24" cy="21" r="3.4" fill="#7fd7ff"/>`,
  pokemontcg: `
    <circle cx="24" cy="24" r="15" fill="#fff"/>
    <path d="M9 24a15 15 0 0 1 30 0z" fill="#ee1515"/>
    <rect x="9" y="22.6" width="30" height="2.8" fill="#222"/>
    <circle cx="24" cy="24" r="5.4" fill="#222"/>
    <circle cx="24" cy="24" r="3" fill="#fff"/>`,
  codm: `
    <path d="M24 8c8 0 14 6 14 14v9l-4 9H14l-4-9v-9c0-8 6-14 14-14z" fill="#fff"/>
    <circle cx="18.5" cy="23" r="3.6" fill="#111"/><circle cx="29.5" cy="23" r="3.6" fill="#111"/>
    <path d="M21 32h6l-3 5z" fill="#111"/>`,
  monopolygo: `
    <path d="M13 20h22v4H13z" fill="#ffcf3f"/>
    <path d="M14 24h20v13H14z" fill="#e8b32a"/>
    <path d="M16 11h16v9H16z" fill="#ffd968"/>
    <path d="M16 11h16v3.6H16z" fill="#f0b91f"/>`,
  wildwind: `
    <path d="M24 10l12 6v10c0 7-5 11.4-12 13-7-1.6-12-6-12-13V16z" fill="#fff" opacity=".95"/>
    <path d="M17 21l5-4 2 5z" fill="#6b3df5"/><path d="M31 21l-5-4-2 5z" fill="#6b3df5"/>
    <path d="M24 26l3 3-3 3-3-3z" fill="#6b3df5"/>`,
  smartgym: `
    <circle cx="24" cy="24" r="14" fill="none" stroke="#fff" stroke-width="3.6"/>
    <path d="M24 14v10l7 4.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>`,
  sneaky: `
    <path d="M14 18c-3-1.6-4.6-4.6-3.4-7.4 3 .2 5.6 2.2 6.6 4.8" fill="#fff"/>
    <path d="M34 18c3-1.6 4.6-4.6 3.4-7.4-3 .2-5.6 2.2-6.6 4.8" fill="#fff"/>
    <ellipse cx="24" cy="26" rx="13" ry="11" fill="#fff"/>
    <path d="M18 22h4.5v4H18z" fill="#2b2b2b"/><path d="M25.5 22H30v4h-4.5z" fill="#2b2b2b"/>
    <path d="M24 28l2.4 2-2.4 2-2.4-2z" fill="#2b2b2b"/>`,
  highwayracer: `
    <path d="M11 28l3-8c.6-1.7 2.2-2.8 4-2.8h12c1.8 0 3.4 1.1 4 2.8l3 8z" fill="#fff"/>
    <rect x="9" y="27" width="30" height="7" rx="3" fill="#fff"/>
    <circle cx="17" cy="34" r="3.2" fill="#111"/><circle cx="31" cy="34" r="3.2" fill="#111"/>`,
  eafc: `
    <path d="M11 26h26l-3 8H14z" fill="#fff" opacity=".9"/>
    <path d="M14 12h20l-2.6 8H16.6z" fill="#fff"/>`,
  asphalt: `
    <path d="M10 30l4-10c.8-2 2.6-3.2 4.8-3.2h10.4c2.2 0 4 1.2 4.8 3.2l4 10z" fill="#fff"/>
    <path d="M14 12l4 5h12l4-5z" fill="#ffd23f"/>`,
  subway: `
    <path d="M12 14c0-2.2 1.8-4 4-4h16c2.2 0 4 1.8 4 4v14H12z" fill="#fff"/>
    <rect x="16" y="15" width="6.5" height="6" rx="1.4" fill="#3aa0ff"/>
    <rect x="25.5" y="15" width="6.5" height="6" rx="1.4" fill="#3aa0ff"/>
    <path d="M10 30h28l-4 6H14z" fill="#ffd23f"/>`,

  /* ---------------- Utilities / photo ---------------- */
  procreate: `
    <path d="M12 34c6-1 9-4 12-10 2.4-4.8 6-7.6 12-8.6" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M30 12l5.6 5.6" stroke="#ff6b6b" stroke-width="4.4" stroke-linecap="round"/>
    <circle cx="14" cy="34" r="3.2" fill="#4ad9a4"/>`,
  lightroom: `
    <rect x="9" y="9" width="30" height="30" rx="7" fill="#fff" opacity=".16"/>
    <path d="M15 34V15h4.4v15H31v4z" fill="#fff"/>`,
  shadowrocket: `
    <path d="M24 8c7 4 11 9.4 11 16.4 0 6.6-4.6 12-11 15.6-6.4-3.6-11-9-11-15.6C13 17.4 17 12 24 8z" fill="#fff"/>
    <path d="M24 17l3.4 6.2 6.6 1-4.8 4.6 1.2 6.6L24 32l-6.4 3.4 1.2-6.6-4.8-4.6 6.6-1z" fill="#4aa8ff"/>`,
  autosleep: `
    <path d="M31 12a13 13 0 1 0 5 17.6A14.5 14.5 0 0 1 31 12z" fill="#fff"/>
    <circle cx="20" cy="17" r="1.8" fill="#8f6bff"/><circle cx="16.5" cy="24" r="1.5" fill="#8f6bff"/>
    <circle cx="22" cy="30" r="1.2" fill="#8f6bff"/>`,
  picnique: `
    <circle cx="24" cy="24" r="15" fill="#fff" opacity=".95"/>
    <circle cx="19" cy="20" r="4" fill="#ff7a59"/><circle cx="29" cy="20" r="4" fill="#4ad9a4"/>
    <circle cx="19" cy="29" r="4" fill="#4aa8ff"/><circle cx="29" cy="29" r="4" fill="#ffd23f"/>`,
  paprika: `
    <path d="M14 20h20l-2 14a4 4 0 0 1-4 3.4H20A4 4 0 0 1 16 34z" fill="#e0533f"/>
    <rect x="12.6" y="18.4" width="22.8" height="3.6" rx="1.8" fill="#c8452f"/>
    <path d="M24 8c1.6 3 4 4.6 7.4 5.4-3.4.8-5.8 2.4-7.4 5.4-1.6-3-4-4.6-7.4-5.4 3.4-.8 5.8-2.4 7.4-5.4z" fill="#ffd23f"/>`,
  headsup: `
    <rect x="9" y="13" width="30" height="22" rx="8" fill="#fff"/>
    <path d="M21 19.5 31 24l-10 4.5z" fill="#7c4dff"/>`,
  zoom: `
    <rect x="10" y="14" width="20" height="20" rx="5" fill="#fff"/>
    <path d="M32 20.4l6-4.4v16l-6-4.4z" fill="#fff" opacity=".85"/>`,
  gmail: `
    <path d="M11 33.5V17.4a1.6 1.6 0 0 1 2.7-1.2L24 24.6l10.3-8.4a1.6 1.6 0 0 1 2.7 1.2v16.1" fill="none" stroke="#ea4335" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  whiteout: `
    <g stroke="#fff" stroke-width="3.2" stroke-linecap="round">
      <path d="M24 10v28M11.9 17l24.2 14M36.1 17 11.9 31"/>
      <path d="M24 10l-4 4M24 10l4 4M24 38l-4-4M24 38l4-4"/>
    </g>`,
  capcut: `
    <path d="M16.5 13v22M31.5 13v22" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M22.6 18.8 30.4 24l-7.8 5.2z" fill="#25f4ee"/>`,
  duolingo: `
    <path d="M24 8c7.2 0 12.4 5.2 12.4 12.6 0 3.6-.9 6.2-2.6 8.2 1.4 1.1 2.2 2.4 2.2 3.8 0 3-3.3 5.4-7.4 5.4h-9.2C15.3 38 12 35.6 12 32.6c0-1.4.8-2.7 2.2-3.8-1.7-2-2.6-4.6-2.6-8.2C11.6 13.2 16.8 8 24 8z" fill="#fff"/>
    <circle cx="19.4" cy="20" r="4.8" fill="#58cc02"/>
    <circle cx="28.6" cy="20" r="4.8" fill="#58cc02"/>
    <circle cx="19.4" cy="20" r="2" fill="#fff"/>
    <circle cx="28.6" cy="20" r="2" fill="#fff"/>
    <path d="M24 24.8 27.8 28 24 31.2 20.2 28z" fill="#ff9600"/>`,
  maps: `
    <path d="M13 12l10-3v27l-10 3z" fill="#8ee08a"/>
    <path d="M23 9l14 4v26l-14-4z" fill="#cfe8ff"/>
    <path d="M23 9l-2 0 2 30z" fill="#fff"/>
    <path d="M33 17a3 3 0 0 1 3 3c0 2.6-3 6-3 6s-3-3.4-3-6a3 3 0 0 1 3-3z" fill="#ff5a5f"/>`,

  /* ---------------- Store chrome ---------------- */
  arcade: `
    <path d="M24 8l14 9v6l-6-4v15h-6V19h-4v15h-6V19l-6 4v-6z" fill="#fff"/>`,
  appstore: `
    <path d="M17 34l8-13.6 3 5.2-5.2 8.4z" fill="#fff"/>
    <path d="M31 34H13l2.6-4.4h17.8z" fill="#fff"/>
    <circle cx="24" cy="15" r="3.4" fill="#fff"/>`,
  apple: `
    <path d="M28.6 25.3c0-3.6 2.9-5.3 3-5.4-1.6-2.4-4.2-2.7-5.1-2.8-2.2-.2-4.3 1.3-5.4 1.3s-2.8-1.3-4.6-1.2c-2.4 0-4.6 1.4-5.8 3.5-2.5 4.3-.6 10.7 1.8 14.2 1.2 1.7 2.6 3.6 4.5 3.5 1.8-.1 2.5-1.2 4.6-1.2s2.8 1.2 4.6 1.1c1.9 0 3.1-1.7 4.3-3.5 1.3-2 1.9-3.9 1.9-4-.1 0-3.7-1.4-3.8-5.5z" fill="currentColor"/>
    <path d="M25 13.6c1-1.2 1.6-2.8 1.5-4.5-1.5.1-3.2 1-4.2 2.2-.9 1-1.7 2.7-1.5 4.3 1.6.1 3.2-.8 4.2-2z" fill="currentColor"/>`,
}

/** Gradient backgrounds paired with each app icon. */
export const ICON_BG: Record<string, string> = {
  chatgpt: '#0d0d0d',
  claude: '#d97757',
  gemini: '#ffffff',
  notion: '#ffffff',
  things: '#1f7ae0',
  goodnotes: '#2f6fd0',
  forest: '#3aa34a',
  tiktok: '#0d0d0d',
  instagram: 'linear-gradient(135deg,#feda75 0%,#fa7e1e 28%,#d62976 58%,#962fbf 80%,#4f5bd5 100%)',
  threads: '#0d0d0d',
  whatsapp: '#25d366',
  capcut: '#0d0d0d',
  duolingo: '#58cc02',
  snapchat: '#fffc00',
  youtube: '#ffffff',
  spotify: '#1db954',
  music: 'linear-gradient(180deg,#fc5c7d 0%,#fa233b 100%)',
  podcast: '#8b5cf6',
  netflix: '#ffffff',
  roblox: '#ffffff',
  minecraft: '#8b6b45',
  royalmatch: 'linear-gradient(160deg,#2f8ef7 0%,#1a5fd0 100%)',
  clashroyale: '#ffffff',
  clashofclans: '#ffffff',
  brawlstars: 'linear-gradient(160deg,#ffd23f 0%,#ff9f1c 100%)',
  candycrush: 'linear-gradient(160deg,#c026d3 0%,#f472b6 100%)',
  genshin: 'linear-gradient(160deg,#4aa8ff 0%,#7c4dff 100%)',
  pokemontcg: 'linear-gradient(160deg,#3b82f6 0%,#1d4ed8 100%)',
  codm: '#15171c',
  monopolygo: 'linear-gradient(160deg,#2f6fd0 0%,#1a3f8f 100%)',
  wildwind: 'linear-gradient(160deg,#7c4dff 0%,#4a2bb8 100%)',
  smartgym: '#15171c',
  sneaky: 'linear-gradient(160deg,#2f5d3a 0%,#1b3524 100%)',
  highwayracer: 'linear-gradient(160deg,#1f7ae0 0%,#0b3f8f 100%)',
  eafc: 'linear-gradient(160deg,#2b2f3a 0%,#12141a 100%)',
  asphalt: 'linear-gradient(160deg,#ff4d4d 0%,#b91c1c 100%)',
  whiteout: 'linear-gradient(160deg,#3aa0ff 0%,#1d4ed8 100%)',
  subway: 'linear-gradient(160deg,#3aa0ff 0%,#1d4ed8 100%)',
  procreate: '#15171c',
  lightroom: 'linear-gradient(160deg,#2b3a55 0%,#141b28 100%)',
  shadowrocket: '#2f6fd0',
  autosleep: 'linear-gradient(160deg,#3b2b6b 0%,#1b1440 100%)',
  picnique: '#ffffff',
  paprika: '#ffffff',
  headsup: '#7c4dff',
  zoom: '#2d8cff',
  gmail: '#ffffff',
  maps: '#ffffff',
  arcade: 'linear-gradient(160deg,#1f7ae0 0%,#0b3f8f 100%)',
  appstore: 'linear-gradient(160deg,#1f9bf7 0%,#0a6ae0 100%)',
  apple: '#1d1d1f',
}
