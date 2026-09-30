/**
 * Cloud-drive download sources for the app detail page.
 *
 * Front-end only — there is no backend. Every entry links to the provider's own
 * site, and `downloadUrl()` is the single place to swap in real per-app share
 * links when one exists.
 */

export type DriveId = 'quark' | 'xunlei' | 'aliyun' | 'uc' | 'baidu' | 'pan123'

export interface Drive {
  id: DriveId
  /** Brand name as the service is actually known. */
  name: string
  /** Romanised name, for the English UI. */
  nameEn: string
  /**
   * Tile fill. The mark on top is white and graphical, so every one of these
   * clears 3:1 against it — checked with `pnpm shot --a11y`.
   */
  color: string
  /** The provider's own site, used as the demo link target. */
  home: string
}

export const DRIVES: Drive[] = [
  { id: 'quark', name: '夸克网盘', nameEn: 'Quark Drive', color: '#7A5AF8', home: 'https://pan.quark.cn/' },
  { id: 'xunlei', name: '迅雷云盘', nameEn: 'Xunlei Drive', color: '#1B6FE0', home: 'https://pan.xunlei.com/' },
  { id: 'aliyun', name: '阿里云盘', nameEn: 'Aliyun Drive', color: '#D95400', home: 'https://www.alipan.com/' },
  { id: 'uc', name: 'UC 网盘', nameEn: 'UC Drive', color: '#F0473A', home: 'https://drive.uc.cn/' },
  { id: 'baidu', name: '百度网盘', nameEn: 'Baidu Netdisk', color: '#2932E1', home: 'https://pan.baidu.com/' },
  { id: 'pan123', name: '123 云盘', nameEn: '123 Pan', color: '#00875A', home: 'https://www.123pan.com/' },
]

/**
 * Simplified brand marks — the *inner* markup of an SVG with
 * `viewBox="0 0 48 48"`, drawn in white, same convention as `utils/logos.ts`.
 * They are abstractions, not the real logos.
 */
export const DRIVE_MARKS: Record<DriveId, string> = {
  /* orbit — Quark's mark reads as a ringed planet */
  quark: `
    <ellipse cx="24" cy="24" rx="13.5" ry="6.5" fill="none" stroke="#fff" stroke-width="3" transform="rotate(-32 24 24)"/>
    <circle cx="24" cy="24" r="5.6" fill="#fff"/>`,

  /* bolt — Xunlei's long-standing speed mark */
  xunlei: `
    <path d="M28.5 6.5 11.5 27.5h9.8L18.8 41.5 36 20.5h-9.8z" fill="#fff"/>`,

  /* cloud with a download arrow */
  aliyun: `
    <path d="M16 33.5h16.5a7.8 7.8 0 0 0 .8-15.5 10.4 10.4 0 0 0-19.7-2.4A7.4 7.4 0 0 0 16 33.5Z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
    <path d="M24 20.5v9M20.4 25.9 24 29.5l3.6-3.6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,

  /* letterforms */
  uc: `
    <path d="M11 15.5v9.5a6.5 6.5 0 0 0 13 0v-9.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M36.5 17.5A9 9 0 1 0 36.5 30.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>`,

  /* paw print — Baidu's mark */
  baidu: `
    <g fill="#fff">
      <ellipse cx="16.5" cy="19" rx="4.2" ry="5.2"/>
      <ellipse cx="24" cy="15.5" rx="4.4" ry="5.6"/>
      <ellipse cx="31.5" cy="19" rx="4.2" ry="5.2"/>
      <path d="M24 23c5.8 0 10 4.2 10 8.6 0 3.6-3.6 6.2-10 6.2s-10-2.6-10-6.2C14 27.2 18.2 23 24 23Z"/>
    </g>`,

  /* download into a tray */
  pan123: `
    <path d="M24 10.5v16" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M17.6 20.4 24 26.8l6.4-6.4" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11.5 30.5v3.4a3.6 3.6 0 0 0 3.6 3.6h17.8a3.6 3.6 0 0 0 3.6-3.6v-3.4" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>`,
}

/**
 * Where a card points. Replace the body with a lookup against a share-link API
 * and nothing else in the UI has to change.
 */
export function downloadUrl(drive: Drive): string {
  return drive.home
}

/** Host shown to the reader, so it is clear where a card leads. */
export function driveHost(drive: Drive): string {
  return drive.home.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
