const referenceKinds = ['status-pills','action-rows','clay-calendar','product-card','workout-card','activity-rings','filter-chips'];

export interface ClayAsset {
  id: string;
  name: string;
  ruName: string;
  path: string;
  category: 'icon' | 'mascot' | 'reference';
  suggestedBg: string;
  accentHex: string;
  usageHint: string;
}

export function resolveClayAssetPath(assetPath: string): string {
  if (!assetPath) return assetPath;
  if (assetPath.startsWith('http://') || assetPath.startsWith('https://') || assetPath.startsWith('data:')) {
    return assetPath;
  }
  const clean = assetPath.replace(/^\/+/, '');
  const base =
    typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL
      ? (import.meta as unknown as { env?: { BASE_URL?: string } }).env!.BASE_URL!
      : './';
  if (base === './' || base === '.') {
    return `./${clean}`;
  }
  return `${base.replace(/\/$/, '')}/${clean}`;
}

export const UPLOADED_CLAY_ASSETS: ClayAsset[] = [
  {
    id: 'star_mascot',
    name: 'Cute Smiling Star & Sparkles',
    ruName: 'Звёздочка с искрами',
    path: '/assets/aistudio/11111_21446bf1.png',
    category: 'mascot',
    suggestedBg: 'lavender',
    accentHex: '#F9C846',
    usageHint: 'Баннеры, достижения, рейтинг и промо-блоки',
  },
  {
    id: 'girl_cat_mascot',
    name: 'Peeking Girl & Tabby Cat',
    ruName: 'Девушка с котиком',
    path: '/assets/aistudio/____________ChatGPT_14_____._2026__.__04_20_48_8694cf43.png',
    category: 'mascot',
    suggestedBg: 'cream',
    accentHex: '#A58AF8',
    usageHint: 'Крупный 3D-маскот со свисающими через край лапками и руками',
  },
  {
    id: 'welcome_gift',
    name: 'Welcome Gift Box with Stars',
    ruName: 'Подарочная коробка со звёздами',
    path: '/assets/aistudio/welcome_gift_d09e2000.png',
    category: 'mascot',
    suggestedBg: 'peach',
    accentHex: '#F48FB1',
    usageHint: 'Карточки Go Premium, бонусы и программа лояльности',
  },
  {
    id: 'cloud_upload',
    name: 'Cloud Upload & Camera',
    ruName: 'Облако загрузки с камерой',
    path: '/assets/aistudio/cloud_upload_bc9d95e9.png',
    category: 'icon',
    suggestedBg: 'lavender',
    accentHex: '#A58AF8',
    usageHint: 'Загрузка медиа, обновление аватара и облачное хранилище',
  },
  {
    id: 'check_badge',
    name: 'Mint Checkmark Badge',
    ruName: 'Мятный бейдж подтверждения',
    path: '/assets/aistudio/icon_check_badge_abe58b1a.png',
    category: 'icon',
    suggestedBg: 'mint',
    accentHex: '#6BC5B8',
    usageHint: 'Статусы успеха, верификация профиля и выполненные серии',
  },
  {
    id: 'magic_wand',
    name: 'Star Magic Wand',
    ruName: 'Волшебная палочка со звёздами',
    path: '/assets/aistudio/icon_magic_wand_7de955e9.png',
    category: 'icon',
    suggestedBg: 'butter',
    accentHex: '#F7C948',
    usageHint: 'Автогенерация, умный подбор плейлистов и быстрые действия',
  },
  {
    id: 'padlock',
    name: 'Mint Security Padlock',
    ruName: 'Мятный 3D-замок безопасности',
    path: '/assets/aistudio/icon_padlock_e2e3dd3f.png',
    category: 'icon',
    suggestedBg: 'mint',
    accentHex: '#68C3B7',
    usageHint: 'Поля ввода пароля, настройки приватности и защита данных',
  },
  {
    id: 'speech_bubbles',
    name: '3D Chat Speech Bubbles',
    ruName: 'Диалоговые облачка чата',
    path: '/assets/aistudio/icon_speech_bubbles_62f65106.png',
    category: 'icon',
    suggestedBg: 'lavender',
    accentHex: '#A68CF8',
    usageHint: 'Комментарии, поддержка, уведомления и лента активности',
  },
  {
    id: 'telegram_plane',
    name: 'Lavender Paper Plane',
    ruName: 'Лавандовый бумажный самолётик',
    path: '/assets/aistudio/icon_telegram_plane_dd1b14fc.png',
    category: 'icon',
    suggestedBg: 'sky',
    accentHex: '#B298FA',
    usageHint: 'Отправка сообщений, быстрый шеринг и приглашения',
  },
  {
    id: 'icon_upload_cloud_alt',
    name: 'Cloud Photo Uploader Alt',
    ruName: 'Иконка облачного импорта',
    path: '/assets/aistudio/icon_upload_cloud_bc9d95e9.png',
    category: 'icon',
    suggestedBg: 'cream',
    accentHex: '#A58AF8',
    usageHint: 'Импорт треков, резервное копирование и медиа-библиотека',
  },
  {
    id: 'ref_dashboard',
    name: 'Reference 1: Mia Music Dashboard',
    ruName: 'Музыкальный Дашборд Mia',
    path: '/assets/aistudio/2_28937b99.jpg',
    category: 'reference',
    suggestedBg: 'cream',
    accentHex: '#9E82F4',
    usageHint: 'Эталон сетки Бенто, 3D-графиков, бокового меню и KPI-карточек',
  },
  {
    id: 'ref_login',
    name: 'Reference 2: Welcome Back Login',
    ruName: 'Экран входа Welcome Back',
    path: '/assets/aistudio/1_47e2d1fa.jpg',
    category: 'reference',
    suggestedBg: 'cream',
    accentHex: '#9E82F4',
    usageHint: 'Эталон многослойности с выглядывающим персонажем и 3D-инпутами',
  },
];

export type ClayColorPresetId =
  | 'cream'
  | 'lavender'
  | 'purple-cta'
  | 'peach'
  | 'butter'
  | 'sky'
  | 'mint'
  | 'rose';

export interface ClayColorPreset {
  id: ClayColorPresetId;
  name: string;
  ruName: string;
  shortLabel: string;
  role: string;
  gradStart: string;
  gradEnd: string;
  textHex: string;
  mutedTextHex: string;
  outerShadowRgb: string; // "R, G, B"
  innerLightRgba: string;
  innerDarkHex: string;
  badgeBgHex: string;
}

export const CLAY_COLOR_PRESETS: Record<ClayColorPresetId, ClayColorPreset> = {
  cream: {
    id: 'cream',
    name: 'Warm Marshmallow Cream',
    ruName: 'Тёплый сливочный зефир',
    shortLabel: 'Зефир',
    role: 'Основные доски, контейнеры, карточки графиков и инпуты',
    gradStart: '#FFFDFB',
    gradEnd: '#F5EDE4',
    textHex: '#2E2360',
    mutedTextHex: '#7A6F8E',
    outerShadowRgb: '95, 75, 140',
    innerLightRgba: 'rgba(255, 255, 255, 0.96)',
    innerDarkHex: '#DACBBE',
    badgeBgHex: '#9E82F5',
  },
  lavender: {
    id: 'lavender',
    name: 'Soft Lilac Mist',
    ruName: 'Нежная сиреневая дымка',
    shortLabel: 'Сирень',
    role: 'Приветственные баннеры, карточка Songs Played, фоновые плашки',
    gradStart: '#E5D2FF',
    gradEnd: '#C9AAF2',
    textHex: '#2E2348',
    mutedTextHex: '#6C5B91',
    outerShadowRgb: '104, 78, 168',
    innerLightRgba: 'rgba(255, 255, 255, 0.9)',
    innerDarkHex: '#B193DC',
    badgeBgHex: '#9374F2',
  },
  'purple-cta': {
    id: 'purple-cta',
    name: 'Royal Clay Amethyst',
    ruName: 'Насыщенный аметист',
    shortLabel: 'Аметист',
    role: 'Главные кнопки, боковое меню и акцентные промо-баннеры',
    gradStart: '#C5A8EE',
    gradEnd: '#AC89DF',
    textHex: '#FFFFFF',
    mutedTextHex: '#EFEAFF',
    outerShadowRgb: '98, 66, 189',
    innerLightRgba: 'rgba(255, 255, 255, 0.62)',
    innerDarkHex: '#9472C7',
    badgeBgHex: '#FFFFFF',
  },
  peach: {
    id: 'peach',
    name: 'Coral Peach Clay',
    ruName: 'Персиковый румянец',
    shortLabel: 'Персик',
    role: 'Карточка Favorites, блок Go Premium и тёплые акценты',
    gradStart: '#FFF0EA',
    gradEnd: '#FAD8CE',
    textHex: '#3B2528',
    mutedTextHex: '#8C6568',
    outerShadowRgb: '168, 102, 92',
    innerLightRgba: 'rgba(255, 255, 255, 0.92)',
    innerDarkHex: '#E8B7AA',
    badgeBgHex: '#F27D72',
  },
  butter: {
    id: 'butter',
    name: 'Honey Buttercream',
    ruName: 'Ванильно-медовый крем',
    shortLabel: 'Ваниль',
    role: 'Карточка Hours Listened, золотые звёзды и корона премиума',
    gradStart: '#FFF5BC',
    gradEnd: '#FFE597',
    textHex: '#3B301E',
    mutedTextHex: '#8A7550',
    outerShadowRgb: '166, 134, 68',
    innerLightRgba: 'rgba(255, 255, 255, 0.94)',
    innerDarkHex: '#E8C66B',
    badgeBgHex: '#F5B841',
  },
  sky: {
    id: 'sky',
    name: 'Powder Sky Blue',
    ruName: 'Пудрово-небесный',
    shortLabel: 'Небо',
    role: 'Карточка Current Streak, голубые столбцы графиков и бейджи',
    gradStart: '#C6EDFC',
    gradEnd: '#A9D9F1',
    textHex: '#22304A',
    mutedTextHex: '#617799',
    outerShadowRgb: '82, 114, 166',
    innerLightRgba: 'rgba(255, 255, 255, 0.92)',
    innerDarkHex: '#8BBCD7',
    badgeBgHex: '#6CA2EA',
  },
  mint: {
    id: 'mint',
    name: 'Pistachio Mint Clay',
    ruName: 'Мятно-фисташковый пластилин',
    shortLabel: 'Мята',
    role: 'Статусы прироста, иконки проверки и безопасности',
    gradStart: '#C5F4E5',
    gradEnd: '#A0DFC7',
    textHex: '#1D3B35',
    mutedTextHex: '#4F8278',
    outerShadowRgb: '64, 140, 125',
    innerLightRgba: 'rgba(255, 255, 255, 0.92)',
    innerDarkHex: '#88C5AD',
    badgeBgHex: '#4DB6A5',
  },
  rose: {
    id: 'rose',
    name: 'Berry Rose Button',
    ruName: 'Ягодно-розовый',
    shortLabel: 'Роза',
    role: 'Кнопка Upgrade, бейджи уведомлений и акцентные сердечки',
    gradStart: '#FFADA5',
    gradEnd: '#FF8B82',
    textHex: '#FFFFFF',
    mutedTextHex: '#FFEBF0',
    outerShadowRgb: '184, 78, 104',
    innerLightRgba: 'rgba(255, 255, 255, 0.65)',
    innerDarkHex: '#EC756E',
    badgeBgHex: '#FFFFFF',
  },
};

export interface ClayPhysicsParams {
  presetId: ClayColorPresetId;
  surfaceMode: 'raised' | 'recessed' | 'floating-pill';
  borderRadius: number; // px, e.g. 28
  depth: number; // 1 to 24 (controls inner bevel & outer drop distance)
  blurSoftness: number; // 8 to 48
  specularIntensity: number; // 0.3 to 1.0 (top-left white highlight)
  padding: number; // px, e.g. 24
  thumbRadius?: number; // px, 4 (angular squircle) to 18 (sphere)
}

export interface ComputedClayStyles {
  background: string;
  boxShadow: string;
  shadowLayers: string[];
  borderRadius: string;
  innerChildRadius: number;
  textColor: string;
  mutedTextColor: string;
  cssString: string;
  tailwindArbitraryShadow: string;
}

/**
 * Calculates concentric inner border-radius so nested clay layers never look pinched.
 * Formula: R_inner = max(8, R_outer - padding * 0.5)
 */
export function computeConcentricRadius(outerRadius: number, padding: number): number {
  if (outerRadius >= 999) return 9999;
  const calculated = Math.round(outerRadius - padding * 0.55);
  return Math.max(8, calculated);
}

/**
 * Generates the signature 4-layer Soft 3D Claymorphism shadow stack:
 * 1. Outer Ambient Drop Shadow (soft diffused colored shadow below/right)
 * 2. Outer Contact Shadow (tighter shadow right under the rim)
 * 3. Top-Left Inner Specular Rim Highlight (white marshmallow reflection)
 * 4. Bottom-Right Inner Volume Bevel (darker clay shade giving 3D thickness)
 */
export function computeClayStyles(params: ClayPhysicsParams): ComputedClayStyles {
  const preset = CLAY_COLOR_PRESETS[params.presetId] || CLAY_COLOR_PRESETS.cream;
  const d = Math.max(1, Math.min(32, params.depth));
  const blur = Math.max(4, Math.min(64, params.blurSoftness));
  const spec = Math.max(0.1, Math.min(1, params.specularIntensity));

  const radiusPx = params.borderRadius >= 999 ? '9999px' : `${params.borderRadius}px`;
  const innerChildRadius = computeConcentricRadius(params.borderRadius, params.padding);

  let background = `linear-gradient(145deg, ${preset.gradStart} 0%, ${preset.gradEnd} 100%)`;
  let shadowLayers: string[] = [];

  if (params.surfaceMode === 'recessed') {
    // Recessed socket / input track (pressed into the clay board)
    background = `linear-gradient(145deg, ${preset.gradEnd} 0%, ${preset.gradStart} 100%)`;
    const insetTopX = Math.max(2, Math.round(d * 0.28));
    const insetTopY = Math.max(3, Math.round(d * 0.48));
    const insetTopBlur = Math.max(4, Math.round(blur * 0.42));
    const insetBottomY = Math.max(2, Math.round(d * 0.35));
    shadowLayers = [
      `inset ${insetTopX}px ${insetTopY}px ${insetTopBlur}px rgba(${preset.outerShadowRgb}, 0.34)`,
      `inset -2px -${insetBottomY}px ${Math.round(insetTopBlur * 0.8)}px rgba(255, 255, 255, ${spec.toFixed(2)})`,
      `0 2px 5px rgba(255, 255, 255, 0.82)`,
    ];
  } else {
    // Raised 3D Clay Card or Floating Pill with crisp directional 135deg lighting
    const dropX1 = Math.max(3, Math.round(d * 0.42));
    const dropY1 = Math.round(d * 0.78);
    const dropBlur1 = Math.round(blur * 0.7);
    const dropSpread1 = -Math.round(d * 0.25);
    const dropAlpha1 = params.surfaceMode === 'floating-pill' ? 0.28 : 0.20;

    const dropX2 = Math.max(2, Math.round(d * 0.2));
    const dropY2 = Math.max(3, Math.round(d * 0.46));
    const dropBlur2 = Math.max(5, Math.round(blur * 0.38));
    const dropAlpha2 = params.surfaceMode === 'floating-pill' ? 0.18 : 0.12;

    const insetLightX = Math.max(2, Math.round(d * 0.24));
    const insetLightY = Math.max(2, Math.round(d * 0.38));
    const insetLightBlur = Math.max(3, Math.round(d * 0.58));

    const insetDarkX = Math.max(2, Math.round(d * 0.28));
    const insetDarkY = Math.max(3, Math.round(d * 0.42));
    const insetDarkBlur = Math.max(4, Math.round(d * 0.58));

    shadowLayers = [
      `${dropX1}px ${dropY1}px ${dropBlur1}px ${dropSpread1}px rgba(${preset.outerShadowRgb}, ${dropAlpha1})`,
      `${dropX2}px ${dropY2}px ${dropBlur2}px -1px rgba(${preset.outerShadowRgb}, ${dropAlpha2})`,
      `inset ${insetLightX}px ${insetLightY}px ${insetLightBlur}px rgba(255, 255, 255, ${spec.toFixed(2)})`,
      `inset -${insetDarkX}px -${insetDarkY}px ${insetDarkBlur}px ${preset.innerDarkHex}`,
    ];
  }

  const boxShadow = shadowLayers.join(', ');

  const cssString = `.clay-element {
  background: ${background};
  border-radius: ${radiusPx};
  padding: ${params.padding}px;
  color: ${preset.textHex};
  box-shadow:
    ${shadowLayers.join(',\n    ')};
  transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 160ms ease;
}`;

  const tailwindArbitraryShadow = `shadow-[${boxShadow.replace(/\s+/g, '_')}]`;

  return {
    background,
    boxShadow,
    shadowLayers,
    borderRadius: radiusPx,
    innerChildRadius,
    textColor: preset.textHex,
    mutedTextColor: preset.mutedTextHex,
    cssString,
    tailwindArbitraryShadow,
  };
}

export type GeneratorComponentType =
  | 'status-pills' | 'action-rows' | 'clay-calendar' | 'product-card' | 'workout-card' | 'activity-rings' | 'filter-chips'
  | 'clay-avatar'
  | 'kpi-card'
  | 'icon-input'
  | 'pill-button'
  | 'peeking-card'
  | 'bottom-nav'
  | 'clay-slider'
  | 'clay-toggle'
  | 'bar-chart-card'
  | 'donut-chart-card'
  | 'promo-banner'
  | 'track-list-card';

export interface GeneratorConfig {
  componentType: GeneratorComponentType;
  physics: ClayPhysicsParams;
  selectedAssetId: string;
  titleText: string;
  subtitleText: string;
  metricValue: string;
  metricDelta: string;
  ctaLabel: string;
}

export function generateComponentCode(
  config: GeneratorConfig,
  format: 'react' | 'css' | 'tokens',
  referenceExports?: { source: string; css: string }
): string {
  const styles = computeClayStyles(config.physics);
  const preset = CLAY_COLOR_PRESETS[config.physics.presetId] || CLAY_COLOR_PRESETS.cream;
  const asset =
    UPLOADED_CLAY_ASSETS.find((a) => a.id === config.selectedAssetId) ||
    UPLOADED_CLAY_ASSETS[0];

  if (format === 'css') {
    if (referenceKinds.includes(config.componentType)) return `${styles.cssString}\n\n${referenceExports?.css || '/* Pass the reference CSS source to export this component. */'}`;
    return `/* ==========================================================
 * Soft 3D Claymorphism — Сгенерированный CSS (${config.componentType})
 * Палитра: ${preset.ruName} (${preset.gradStart} -> ${preset.gradEnd})
 * Формула 4-слойного объёма + Неоднородная тягучая Clay-анимация
 * ========================================================== */

${styles.cssString}

/* Неоднородная тягучая физика пластилина (Viscous Taffy Clay Stretch):
 * Фаза 1 (0–28%): Лидирующий край тянется, хвост залипает (scaleX 1.045, scaleY 0.96)
 * Фаза 2 (28–65%): Хвост отрывается и догоняет массу, собираясь в пухлый комок (scaleX 0.975, scaleY 1.025)
 * Фаза 3 (65–100%): Вязкое затухание без лишней пружинистости (scaleX 1.03, scaleY 0.98 -> 1)
 */
@keyframes clayViscousStretch {
  0% {
    transform: scale3d(1, 1, 1);
  }
  28% {
    transform: scale3d(1.045, 0.96, 1);
    border-radius: 9999px;
  }
  62% {
    transform: scale3d(0.975, 1.025, 1);
  }
  84% {
    transform: scale3d(1.04, 0.97, 1);
  }
  100% {
    transform: scale3d(1, 1, 1);
  }
}

.clay-viscous-active {
  animation: clayViscousStretch 360ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* 3D Ползунок / Прогресс-бар (Цилиндрическая трубка + Пухлый 3D-шарик) */
.clay-slider-track {
  height: 16px;
  border-radius: 9999px;
  background: linear-gradient(180deg, #FFFFFF 0%, #F7EFE6 58%, #E6DBD0 100%);
  box-shadow:
    0 6px 12px -2px rgba(95, 75, 140, 0.18),
    inset 0 3px 4px rgba(255, 255, 255, 1),
    inset 0 -3px 5px #D5C7B8;
}

.clay-slider-thumb-pink {
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  background: radial-gradient(circle at 32% 28%, #FFE0E8 0%, #F7A3B8 52%, #E37892 100%);
  box-shadow:
    0 10px 18px -3px rgba(184, 78, 104, 0.45),
    inset 0 4px 6px rgba(255, 255, 255, 0.9),
    inset 0 -5px 8px #C25570;
}

/* Физический 3D Clay Тумблер (ClayToggle — вдавливается и меняет цвет при включении) */
.clay-toggle-socket-off {
  background: linear-gradient(145deg, #E8DFD6 0%, #F9F3EC 100%);
  box-shadow:
    inset 0 5px 9px rgba(156, 140, 128, 0.48),
    inset 0 -3px 6px rgba(255, 255, 255, 0.92),
    0 2px 4px rgba(255, 255, 255, 0.85);
}

.clay-toggle-socket-on {
  background: linear-gradient(145deg, #62C4B2 0%, #8FE3D3 100%);
  box-shadow:
    inset 0 5px 10px rgba(36, 110, 96, 0.5),
    inset 0 -3px 6px rgba(255, 255, 255, 0.7),
    0 2px 4px rgba(255, 255, 255, 0.8);
}

/* Вложенный 3D-бейдж иконки (концентрический радиус: ${styles.innerChildRadius}px) */
.clay-icon-badge {
  background: linear-gradient(145deg, ${preset.badgeBgHex} 0%, ${preset.innerDarkHex} 100%);
  border-radius: ${styles.innerChildRadius}px;
  box-shadow:
    0 6px 14px -2px rgba(${preset.outerShadowRgb}, 0.32),
    inset 0 3px 5px rgba(255, 255, 255, 0.65),
    inset 0 -4px 6px rgba(0, 0, 0, 0.18);
}`;
  }

  if (format === 'tokens') {
    return JSON.stringify(
      {
        designSystem: 'Soft 3D Tactile Claymorphism',
        component: config.componentType,
        palette: {
          id: preset.id,
          name: preset.ruName,
          surfaceGradient: [preset.gradStart, preset.gradEnd],
          textPrimary: preset.textHex,
          textSecondary: preset.mutedTextHex,
          innerBevelShade: preset.innerDarkHex,
          badgeAccent: preset.badgeBgHex,
        },
        viscousAnimationPhysics: {
          type: 'Non-Uniform Viscoelastic Clay (Тягучий пластилин)',
          phases: [
            '0% -> 28%: Залипание хвоста и растяжение ведущего края (scaleX: 1.045, scaleY: 0.96)',
            '28% -> 62%: Отрыв хвоста и сборка в пухлую каплю (scaleX: 0.975, scaleY: 1.025)',
            '62% -> 100%: Мягкая вязкая усадка на место (scaleX: 1.04 -> 1.0)',
          ],
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          durationMs: 360,
        },
        geometry: {
          outerRadiusPx: config.physics.borderRadius,
          concentricInnerRadiusPx: styles.innerChildRadius,
          sliderThumbRadiusPx: config.physics.thumbRadius ?? 18,
          paddingPx: config.physics.padding,
          extrusionDepth: config.physics.depth,
        },
        shadowLayers: styles.shadowLayers,
        asset: {
          id: asset.id,
          name: asset.ruName,
          src: asset.path,
        },
      },
      null,
      2
    );
  }

  // React + Tailwind JSX generator
  if (referenceKinds.includes(config.componentType)) {
    return `// Requires react and lucide-react. Save the CSS tab as reference-clay.css.\nimport './reference-clay.css';\n${referenceExports?.source || ''}\n\nexport default function GeneratedClayComponent() {\n  return <div className="ref-element-wrapper" style={${JSON.stringify({background:styles.background,borderRadius:styles.borderRadius,padding:config.physics.padding,boxShadow:styles.boxShadow})}}><ReferenceElement kind=${JSON.stringify(config.componentType)} title={${JSON.stringify(config.titleText || undefined)}} /></div>;\n}`;
  }
  const styleObjCode = `{{
        background: '${styles.background}',
        borderRadius: '${styles.borderRadius}',
        padding: '${config.physics.padding}px',
        color: '${styles.textColor}',
        boxShadow: '${styles.boxShadow}',
      }}`;

  switch (config.componentType) {
    case 'clay-avatar':
      return `import React from 'react';

export function ClayPopOutAvatarCard() {
  return (
    <div
      className="flex flex-col items-center text-center gap-4 max-w-sm mx-auto select-none"
      style=${styleObjCode}
    >
      {/* 3D Avatar Substrate with Raised Outer Frame, Deep Inset Well & Unclipped Overhang */}
      <div className="relative pt-11 pb-2 inline-flex justify-center overflow-visible">
        <div
          className="relative w-[248px] h-[172px] p-[15px] rounded-t-[64px] rounded-b-[38px] flex items-center justify-center overflow-visible"
          style={{
            background: 'linear-gradient(145deg, #F5EEFF 0%, #B89EFA 44%, #7A58DE 100%)',
            boxShadow:
              '8px 18px 30px -4px rgba(58, 34, 128, 0.56), 3px 6px 12px -1px rgba(58, 34, 128, 0.36), inset 3.5px 4.5px 7px rgba(255, 255, 255, 0.94), inset -4px -7px 12px #5E3EC4',
          }}
        >
          {/* Recessed Inner Well with Deep Inset Shadow */}
          <div
            className="w-full h-full rounded-t-[49px] rounded-b-[23px]"
            style={{
              background: 'linear-gradient(155deg, #CFBBEF 0%, #E7DAFF 42%, #FCF9FF 100%)',
              boxShadow:
                'inset 11px 15px 24px rgba(38, 16, 102, 0.64), inset 3px 5px 9px rgba(38, 16, 102, 0.42), inset -5px -6px 12px rgba(255, 255, 255, 0.96)',
              border: '1.5px solid rgba(255, 255, 255, 0.68)',
            }}
          />

          {/* Pop-Out 3D Avatar Breaking Out Above Top Rim & Over Bottom Rim */}
          <div className="absolute inset-x-0 -bottom-1 z-20 pointer-events-none flex justify-center overflow-visible">
            <img
              src="${asset.path}"
              alt="${asset.ruName}"
              className="w-[220px] h-[220px] max-w-none object-contain drop-shadow-[3px_9px_9px_rgba(34,16,84,0.46)]"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-black font-display">${config.titleText}</h3>
        <p className="text-xs font-bold opacity-80 mt-1">${config.subtitleText}</p>
      </div>
    </div>
  );
}`;
    case 'clay-toggle':
      return `import React, { useState } from 'react';
import { motion } from 'motion/react';

export function ClayPhysicalToggle() {
  const [checked, setChecked] = useState(true);

  return (
    <div
      className="flex items-center justify-between gap-4 max-w-md mx-auto select-none"
      style=${styleObjCode}
    >
      <div className="flex items-center gap-3.5">
        <img
          src="${asset.path}"
          alt="${asset.ruName}"
          className="w-11 h-11 object-contain drop-shadow-sm"
        />
        <div>
          <h4 className="text-base font-black font-display">${config.titleText}</h4>
          <p className="text-xs font-bold opacity-75">
            {checked ? 'Включено · Кнопка физически вдавлена' : '${config.subtitleText}'}
          </p>
        </div>
      </div>

      {/* Fixed-Size Physical Recessed Clay Switch Well (84x44px) */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked((v) => !v)}
        className="relative w-[84px] h-[44px] rounded-full p-1.5 transition-colors duration-300 cursor-pointer shrink-0 flex items-center"
        style={{
          background: checked
            ? 'linear-gradient(145deg, #62C4B2 0%, #8FE3D3 100%)'
            : 'linear-gradient(145deg, #E8DFD6 0%, #F9F3EC 100%)',
          boxShadow: checked
            ? 'inset 0 5px 10px rgba(36, 110, 96, 0.5), inset 0 -3px 6px rgba(255,255,255,0.7)'
            : 'inset 0 5px 9px rgba(156, 140, 128, 0.48), inset 0 -3px 6px rgba(255,255,255,0.92)',
        }}
      >
        <motion.div
          animate={{ x: checked ? 40 : 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 24, mass: 0.9 }}
          className="w-8 h-8 rounded-full shrink-0"
          style={{
            background: checked
              ? 'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #EBFBF7 58%, #A0DFC7 100%)'
              : 'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #F7EFE6 55%, #E0D3C5 100%)',
            boxShadow: checked
              ? '0 6px 12px -2px rgba(42, 122, 108, 0.42), inset 0 4px 6px #FFF, inset 0 -5px 8px #88C5AD'
              : '0 6px 12px -2px rgba(95, 75, 140, 0.32), inset 0 4px 5px #FFF, inset 0 -5px 7px #C9B9A8',
          }}
        />
      </button>
    </div>
  );
}`;
    case 'bottom-nav':
      return `import React, { useState } from 'react';
import { motion } from 'motion/react';

export function ClayBottomNavDock() {
  const [activeId, setActiveId] = useState('home');
  const items = [
    { id: 'home', label: 'Главная' },
    { id: 'generator', label: 'Генератор' },
    { id: 'showcase', label: 'Макеты 3D' },
    { id: 'tokens', label: 'Система' },
  ];

  return (
    <nav
      aria-label="Нижнее меню Clay"
      className="relative grid grid-cols-2 md:grid-cols-4 items-center gap-2 sm:gap-3 w-full max-w-4xl mx-auto"
      style=${styleObjCode}
    >
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            animate={
              active
                ? {
                    scaleX: [1, 1.08, 0.94, 1.02, 1],
                    scaleY: [1, 0.89, 1.06, 0.98, 1],
                    y: [0, 2, -1.5, 0],
                  }
                : { scaleX: 1, scaleY: 1, y: 0 }
            }
            transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full min-w-0 flex items-center justify-center px-5 py-3 rounded-full text-xs sm:text-sm font-black overflow-hidden"
            style={{ color: active ? '#FFFFFF' : '${styles.textColor}', transition: 'color 260ms ease' }}
          >
            <motion.span
              initial={false}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 rounded-full -z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(145deg, #C5A8EE 0%, #AC89DF 100%)',
                boxShadow:
                  '0 10px 18px -4px rgba(98, 66, 189, 0.48), inset 0 3px 5px rgba(255,255,255,0.7), inset 0 -5px 8px #5E3EC4',
              }}
            />
            <span>{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}`;

    case 'clay-slider':
      return `import React, { useState } from 'react';

export function Clay3DSlider() {
  const [val, setVal] = useState(64);
  const [pressed, setPressed] = useState(false);
  const thumbRadius = ${config.physics.thumbRadius ?? 18};

  return (
    <div className="w-full max-w-md space-y-5" style=${styleObjCode}>
      <div className="flex justify-between text-sm font-black">
        <span>${config.titleText}</span>
        <span className="font-mono">{Math.round(val)}%</span>
      </div>

      {/* 3D Cylindrical Clay Track + Customizable Thumb Rounding (\${thumbRadius}px) */}
      <div className="relative h-10 flex items-center">
        <div
          className="w-full h-4 rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F7EFE6 58%, #E6DBD0 100%)',
            boxShadow:
              '0 6px 12px -2px rgba(95,75,140,0.18), inset 0 3px 4px #FFF, inset 0 -3px 5px #D5C7B8',
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: \`\${val}%\`,
              background: 'linear-gradient(180deg, #FFE8EE 0%, #F9C2D0 100%)',
            }}
          />
        </div>

        <div
          className="absolute top-1/2 pointer-events-none"
          style={{
            width: '34px',
            height: '34px',
            left: \`calc(\${val}% - \${(val / 100) * 34}px)\`,
            borderRadius: \`\${thumbRadius}px\`,
            background:
              thumbRadius < 14
                ? 'linear-gradient(145deg, #FFD8E2 0%, #F7A3B8 55%, #E37892 100%)'
                : 'radial-gradient(circle at 32% 28%, #FFE0E8 0%, #F7A3B8 52%, #E37892 100%)',
            boxShadow:
              '0 10px 18px -3px rgba(184,78,104,0.45), inset 0 4px 6px rgba(255,255,255,0.92), inset 0 -5px 8px #C25570',
            transform: pressed
              ? 'translate3d(0, -50%, 0) scaleX(1.12) scaleY(0.975)'
              : 'translate3d(0, -50%, 0) scaleX(1) scaleY(1)',
            transition: 'transform 140ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'left, transform',
          }}
        />

        <input
          type="range"
          min={0}
          max={100}
          step="any"
          value={val}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onChange={(e) => setVal( parseFloat(e.target.value) )}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}`;

    case 'kpi-card':
      return `import React from 'react';

export function ClayKpiCard() {
  return (
    <div
      className="relative flex flex-col justify-between transition-transform duration-150 hover:-translate-y-1 clay-squish"
      style=${styleObjCode}
    >
      {/* 3D Clay Squircle Icon Badge */}
      <div
        className="w-14 h-14 flex items-center justify-center mb-4"
        style={{
          background: 'linear-gradient(145deg, ${preset.badgeBgHex} 0%, ${preset.innerDarkHex} 100%)',
          borderRadius: '${Math.min(18, styles.innerChildRadius)}px',
          boxShadow: '0 8px 16px -3px rgba(${preset.outerShadowRgb}, 0.35), inset 0 3px 5px rgba(255,255,255,0.7), inset 0 -4px 6px rgba(0,0,0,0.16)',
        }}
      >
        <img
          src="${asset.path}"
          alt="${asset.ruName}"
          className="w-10 h-10 object-contain drop-shadow-sm"
        />
      </div>

      <span className="text-sm font-bold opacity-75">${config.titleText}</span>
      <div className="text-3xl font-black tracking-tight my-1 tabular-nums font-display">
        ${config.metricValue}
      </div>
      <span className="text-xs font-extrabold text-[#2E8B6E]">
        ${config.metricDelta}
      </span>
    </div>
  );
}`;

    case 'icon-input':
      return `import React from 'react';

export function ClayBadgeInput() {
  return (
    <label className="relative flex items-center w-full max-w-md cursor-text select-none">
      {/* Recessed Input Track */}
      <div
        className="w-full flex items-center pl-16 pr-5 py-4"
        style=${styleObjCode}
      >
        <input
          type="text"
          placeholder="${config.titleText}"
          className="w-full bg-transparent border-none outline-none text-base font-bold placeholder:opacity-60"
          style={{ color: '${styles.textColor}' }}
        />
      </div>

      {/* Overlapping 3D Circular Icon Medallion (Left Edge) */}
      <div
        className="absolute left-1.5 w-12 h-12 rounded-full flex items-center justify-center pointer-events-none"
        style={{
          background: 'linear-gradient(145deg, #B298FA 0%, #8C6DE6 100%)',
          boxShadow: '0 6px 12px -2px rgba(98, 66, 189, 0.45), inset 0 3px 5px rgba(255,255,255,0.7), inset 0 -4px 6px rgba(79, 49, 166, 0.7)',
        }}
      >
        <img
          src="${asset.path}"
          alt="${asset.ruName}"
          className="w-8 h-8 object-contain"
        />
      </div>
    </label>
  );
}`;

    case 'peeking-card':
      return `import React from 'react';

export function ClayPeekingMascotCard() {
  return (
    <div className="relative pt-8 max-w-md mx-auto">
      {/* Raised Clay Card Body withMascot Paws Overhanging the Bottom/Top Edge */}
      <div
        className="relative z-10 flex flex-col gap-4 overflow-visible"
        style=${styleObjCode}
      >
        {/* Z-Layer 30: Enlarged Mascot whose hands & paws hang over the edge (-mb-10) */}
        <div className="relative z-30 flex justify-center -mt-20 -mb-6 pointer-events-none">
          <img
            src="${asset.path}"
            alt="${asset.ruName}"
            className="w-64 h-auto object-contain drop-shadow-[0_16px_18px_rgba(68,46,128,0.32)]"
          />
        </div>

        <div className="text-center pt-2">
          <h3 className="text-2xl font-black font-display">${config.titleText}</h3>
          <p className="text-sm font-semibold opacity-75 mt-1">${config.subtitleText}</p>
        </div>

        <button
          type="button"
          className="w-full py-3.5 rounded-full font-extrabold text-white clay-btn-purple"
        >
          ${config.ctaLabel}
        </button>
      </div>
    </div>
  );
}`;

    default:
      return `import React from 'react';

export function ClayCustomComponent() {
  return (
    <div
      className="flex items-center justify-between gap-4 transition-all duration-150 clay-squish"
      style=${styleObjCode}
    >
      <div className="flex items-center gap-4">
        <img
          src="${asset.path}"
          alt="${asset.ruName}"
          className="w-16 h-16 object-contain drop-shadow-md"
        />
        <div>
          <h4 className="text-lg font-black font-display">${config.titleText}</h4>
          <p className="text-sm font-semibold opacity-80">${config.subtitleText}</p>
        </div>
      </div>
      <button
        type="button"
        className="px-6 py-3 rounded-full font-extrabold text-sm clay-btn-purple text-white shrink-0"
      >
        ${config.ctaLabel}
      </button>
    </div>
  );
}`;
  }
}
