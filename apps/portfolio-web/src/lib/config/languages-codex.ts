/**
 * @file languages-codex.ts
 * @description Códice Global de Identidad (Sovereign Language Hub).
 *              Mapeo exhaustivo de locales con soporte nativo e internacional (intName).
 * @version 3.0 - Microsoft/Apple Style Globalization
 * @author Raz Podestá - MetaShark Tech
 */

export interface LanguageEntry {
  code: string;           // BCP 47 Code (ej: fr-CA)
  nativeName: string;     // Glosa Nativa (ej: Français)
  intName: string;        // International Name ALWAYS ENGLISH (ej: French)
  regionName: string;     // Región Nativa (ej: Canada)
  intRegionName: string;  // International Region ALWAYS ENGLISH (ej: Canada)
  isImplemented: boolean; // Si el diccionario físico existe actualmente
}

export interface RegionGroup {
  region: string;
  intRegion: string;      // Nombre de continente en Inglés
  languages: LanguageEntry[];
}

export const LANGUAGES_CODEX: RegionGroup[] = [
  {
    region: "Americas",
    intRegion: "Americas",
    languages: [
      /* PRIORIDAD: IMPLEMENTADOS */
      { code: "pt-BR", nativeName: "Português", intName: "Portuguese", regionName: "Brasil", intRegionName: "Brazil", isImplemented: true },
      { code: "en-US", nativeName: "English", intName: "English", regionName: "United States", intRegionName: "United States", isImplemented: true },
      /* ALFABÉTICO */
      { code: "es-AR", nativeName: "Español", intName: "Spanish", regionName: "Argentina", intRegionName: "Argentina", isImplemented: false },
      { code: "es-CL", nativeName: "Español", intName: "Spanish", regionName: "Chile", intRegionName: "Chile", isImplemented: false },
      { code: "en-CA", nativeName: "English", intName: "English", regionName: "Canada", intRegionName: "Canada", isImplemented: false },
      { code: "fr-CA", nativeName: "Français", intName: "French", regionName: "Canada", intRegionName: "Canada", isImplemented: false },
      { code: "es-CO", nativeName: "Español", intName: "Spanish", regionName: "Colombia", intRegionName: "Colombia", isImplemented: false },
      { code: "es-MX", nativeName: "Español", intName: "Spanish", regionName: "México", intRegionName: "Mexico", isImplemented: false },
      { code: "es-PE", nativeName: "Español", intName: "Spanish", regionName: "Perú", intRegionName: "Peru", isImplemented: false },
      { code: "es-UY", nativeName: "Español", intName: "Spanish", regionName: "Uruguay", intRegionName: "Uruguay", isImplemented: false }
    ]
  },
  {
    region: "Europe",
    intRegion: "Europe",
    languages: [
      /* PRIORIDAD: IMPLEMENTADOS */
      { code: "es-ES", nativeName: "Español", intName: "Spanish", regionName: "España", intRegionName: "Spain", isImplemented: true },
      /* ALFABÉTICO */
      { code: "de-DE", nativeName: "Deutsch", intName: "German", regionName: "Deutschland", intRegionName: "Germany", isImplemented: false },
      { code: "fr-FR", nativeName: "Français", intName: "French", regionName: "France", intRegionName: "France", isImplemented: false },
      { code: "it-IT", nativeName: "Italiano", intName: "Italian", regionName: "Italia", intRegionName: "Italy", isImplemented: false },
      { code: "nl-NL", nativeName: "Nederlands", intName: "Dutch", regionName: "Nederland", intRegionName: "Netherlands", isImplemented: false },
      { code: "pt-PT", nativeName: "Português", intName: "Portuguese", regionName: "Portugal", intRegionName: "Portugal", isImplemented: false },
      { code: "ru-RU", nativeName: "Русский", intName: "Russian", regionName: "Россия", intRegionName: "Russia", isImplemented: false },
      { code: "sv-SE", nativeName: "Svenska", intName: "Swedish", regionName: "Sverige", intRegionName: "Sweden", isImplemented: false },
      { code: "tr-TR", nativeName: "Türkçe", intName: "Turkish", regionName: "Türkiye", intRegionName: "Turkey", isImplemented: false }
    ]
  },
  {
    region: "Asia Pacific",
    intRegion: "Asia Pacific",
    languages: [
      { code: "zh-CN", nativeName: "简体中文", intName: "Chinese (Simplified)", regionName: "中国", intRegionName: "China", isImplemented: false },
      { code: "ja-JP", nativeName: "日本語", intName: "Japanese", regionName: "日本", intRegionName: "Japan", isImplemented: false },
      { code: "ko-KR", nativeName: "한국어", intName: "Korean", regionName: "대한민국", intRegionName: "South Korea", isImplemented: false },
      { code: "th-TH", nativeName: "ไทย", intName: "Thai", regionName: "ประเทศไทย", intRegionName: "Thailand", isImplemented: false },
      { code: "vi-VN", nativeName: "Tiếng Việt", intName: "Vietnamese", regionName: "Việt Nam", intRegionName: "Vietnam", isImplemented: false },
      { code: "hi-IN", nativeName: "हिन्दी", intName: "Hindi", regionName: "भारत", intRegionName: "India", isImplemented: false }
    ]
  },
  {
    region: "Middle East & Africa",
    intRegion: "Middle East & Africa",
    languages: [
      { code: "ar-SA", nativeName: "العربية", intName: "Arabic", regionName: "السعودية", intRegionName: "Saudi Arabia", isImplemented: false },
      { code: "he-IL", nativeName: "עברית", intName: "Hebrew", regionName: "ישראל", intRegionName: "Israel", isImplemented: false },
      { code: "en-ZA", nativeName: "English", intName: "English", regionName: "South Africa", intRegionName: "South Africa", isImplemented: false },
      { code: "sw-KE", nativeName: "Kiswahili", intName: "Swahili", regionName: "Kenya", intRegionName: "Kenya", isImplemented: false }
    ]
  }
];