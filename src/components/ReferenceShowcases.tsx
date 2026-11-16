import { computeLayerShadow } from '../utils/clayLayers';
import { materialBackground, materialShadow } from '../utils/materialStyle';
import React, { useId, useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Bell,
  User,
  Home,
  Music,
  Heart,
  ListMusic,
  Mic2,
  Activity,
  Settings,
  Play,
  Pause,
  Clock,
  Flame,
  ChevronDown,
  Eye,
  EyeOff,
  SplitSquareVertical,
  Sparkles,
  LogIn,
  Shapes,
  LibraryBig,
  WandSparkles,
  Palette,
} from 'lucide-react';
import {
  UPLOADED_CLAY_ASSETS,
  ClayColorPresetId,
  GeneratorComponentType,
  GeneratorConfig,
  resolveClayAssetPath,
} from '../utils/clayEngine';
import { ReferenceLibrary } from './ReferenceLibrary';
import { ComponentGenerator } from './ComponentGenerator';
import { DesignSystemGuide } from './DesignSystemGuide';
import { useMaterialSettings } from './MaterialSettings';

const DASHBOARD_GENRES = [
  { label: 'Pop', pct: 45, face: '#C7A9ED', edge: '#AB8DCF' },
  { label: 'Lo-fi', pct: 25, face: '#F2B2C2', edge: '#DC97AA' },
  { label: 'Hip Hop', pct: 15, face: '#F4D78B', edge: '#DDBB6D' },
  { label: 'Rock', pct: 10, face: '#B9D4A3', edge: '#9BB987' },
  { label: 'Other', pct: 5, face: '#ADCEE8', edge: '#8EAFCC' },
] as const;

function dashboardDonutSlice(start: number, end: number) {
  const point = (radius: number, angle: number) => [72 + radius * Math.cos(angle), 72 + radius * Math.sin(angle)].map(value => value.toFixed(3)).join(' ');
  const large = end - start > Math.PI ? 1 : 0;
  return `M${point(66, start)} A66 66 0 ${large} 1 ${point(66, end)} L${point(29, end)} A29 29 0 ${large} 0 ${point(29, start)} Z`;
}

/** Matte wedges: pigment, a short colored sidewall, then contact on the cream tray. */
function DashboardGenreDonut() {
  const id = `dashboard-genres-${useId().replace(/:/g, '')}`;
  const { settings } = useMaterialSettings();
  const x = settings.light.endsWith('right') ? -1 : 1;
  const y = settings.light.startsWith('bottom') ? -1 : 1;
  const volume = settings.volume;
  let angle = -Math.PI / 2;
  const slices = DASHBOARD_GENRES.map(genre => {
    const start = angle;
    angle += Math.PI * 2 * genre.pct / 100;
    return { ...genre, path: dashboardDonutSlice(start + .004, angle - .004) };
  });
  return <svg className="w-36 h-36 shrink-0" viewBox="0 0 144 144" overflow="visible" role="img" aria-label="Жанры: Pop 45%, Lo-fi 25%, Hip Hop 15%, Rock 10%, Other 5%" data-clay-layer="control" data-clay-shape="disc" style={{ boxShadow: 'none' }}>
    <defs>
      <filter id={`${id}-contact`} x="-12%" y="-12%" width="124%" height="128%" colorInterpolationFilters="sRGB">
        <feDropShadow dx={.6 * x * volume} dy={2.2 * y * volume} stdDeviation={2 * volume * settings.shadowSoftness} floodColor="#8F768E" floodOpacity={.18 * settings.shadowStrength}/>
      </filter>
      {slices.map((genre, index) => <React.Fragment key={genre.label}>
        <linearGradient id={`${id}-face-${index}`} x1={x > 0 ? '0%' : '100%'} y1={y > 0 ? '0%' : '100%'} x2={x > 0 ? '100%' : '0%'} y2={y > 0 ? '100%' : '0%'}>
          <stop offset="0" stopColor={genre.face}/><stop offset=".7" stopColor={genre.face}/><stop offset="1" stopColor={genre.edge} stopOpacity=".84"/>
        </linearGradient>
        <filter id={`${id}-soft-edge-${index}`} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="erode" radius={1.2 * volume} result="inset"/>
          <feGaussianBlur in="inset" stdDeviation={1.2 * volume} result="shoulder"/>
          <feOffset in="shoulder" dx={1.5 * x * volume} dy={1.8 * y * volume} result="light-shift"/>
          <feComposite in="shoulder" in2="light-shift" operator="out" result="light-band"/>
          <feFlood floodColor="#FFFFFF" floodOpacity=".48" result="light"/>
          <feComposite in="light" in2="light-band" operator="in" result="lit-shoulder"/>
          <feOffset in="shoulder" dx={-2 * x * volume} dy={-2.5 * y * volume} result="shade-shift"/>
          <feComposite in="shoulder" in2="shade-shift" operator="out" result="shade-band"/>
          <feGaussianBlur in="shade-band" stdDeviation={1.8 * volume} result="soft-shade"/>
          <feFlood floodColor={genre.edge} floodOpacity=".15" result="shade"/>
          <feComposite in="shade" in2="soft-shade" operator="in" result="colored-shoulder"/>
          <feMerge result="rounded"><feMergeNode in="SourceGraphic"/><feMergeNode in="colored-shoulder"/><feMergeNode in="lit-shoulder"/></feMerge>
          <feComposite in="rounded" in2="SourceAlpha" operator="in"/>
        </filter>
      </React.Fragment>)}
    </defs>
    <g filter={`url(#${id}-contact)`}>
      <g transform={`translate(${volume} ${2.8 * volume})`}>
        {slices.map(genre => <path key={genre.label} d={genre.path} fill={genre.edge}/>)}
      </g>
      {slices.map((genre, index) => <path key={genre.label} d={genre.path} fill={`url(#${id}-face-${index})`} filter={`url(#${id}-soft-edge-${index})`}/>)}
    </g>
  </svg>;
}

export type DashboardSection = 'dashboard' | 'login' | 'icons' | 'library' | 'generator' | 'design-system';

interface ReferenceShowcasesProps {
  activeScene: DashboardSection;
  onSelectScene: (scene: DashboardSection) => void;
  generatorConfig: GeneratorConfig;
  onChangeGeneratorConfig: React.Dispatch<React.SetStateAction<GeneratorConfig>>;
  onSelectPresetForGenerator: (preset: ClayColorPresetId) => void;
  onSelectForGenerator?: (type: GeneratorComponentType, assetId?: string) => void;
  onInspectInGenerator?: (params: {
    componentType: GeneratorComponentType;
    presetId: ClayColorPresetId;
    assetId: string;
    titleText: string;
    subtitleText: string;
    metricValue?: string;
  }) => void;
}

export function ReferenceShowcases({
  activeScene,
  onSelectScene,
  generatorConfig,
  onChangeGeneratorConfig,
  onSelectPresetForGenerator,
  onSelectForGenerator,
  onInspectInGenerator,
}: ReferenceShowcasesProps) {
  const triggerInspect = (
    type: GeneratorComponentType,
    assetId: string = 'star_mascot',
    presetId: ClayColorPresetId = 'lavender',
    titleText: string = 'Good Morning, Mia!',
    subtitleText: string = 'Let’s enjoy some music today!',
    metricValue?: string
  ) => {
    if (onInspectInGenerator) {
      onInspectInGenerator({
        componentType: type,
        presetId,
        assetId,
        titleText,
        subtitleText,
        metricValue,
      });
    } else {
      onSelectForGenerator?.(type, assetId);
    }
  };
  const selectScene = (scene: DashboardSection) => {
    onSelectScene(scene);
    window.scrollTo({top:0,behavior:'instant'});
  };
  const [showOriginalOverlay, setShowOriginalOverlay] = useState(false);
  const [playingTrack, setPlayingTrack] = useState<string | null>('Sunset Drive');
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'Dashboard', icon: Home, label: 'Dashboard' },
  ];

  const weeklyBars = [
    { day: 'Mon', heightPct: 56, face: '#C9AFE4', edge: '#AD91CA' },
    { day: 'Tue', heightPct: 76, face: '#F1B8C2', edge: '#DB9AA6' },
    { day: 'Wed', heightPct: 58, face: '#F5C58E', edge: '#DFA972' },
    { day: 'Thu', heightPct: 86, face: '#F6D994', edge: '#DFBF77' },
    { day: 'Fri', heightPct: 54, face: '#BDD5A4', edge: '#A3BB8B' },
    { day: 'Sat', heightPct: 72, face: '#ACCEE8', edge: '#91B4D1' },
    { day: 'Sun', heightPct: 60, face: '#CDB4E5', edge: '#B097CC' },
  ];

  const recentTracks = [
    {
      title: 'Sunset Drive',
      artist: 'Lofi Chill',
      coverGrad: 'linear-gradient(135deg, #FF9E9E 0%, #A18CD1 55%, #5D69BE 100%)',
    },
    {
      title: 'Golden Hour',
      artist: 'JVKE',
      coverGrad: 'linear-gradient(135deg, #F6D365 0%, #FDA085 60%, #C96A4B 100%)',
    },
    {
      title: 'Coffee Shop',
      artist: 'Beabadoobee',
      coverGrad: 'linear-gradient(135deg, #F5EFE6 0%, #D7C0AE 55%, #967E76 100%)',
    },
  ];

  return (
    <div data-clay-layer="foundation" className="clay-board rounded-[46px] p-2.5 sm:p-3.5 lg:p-4 grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 relative">
            <aside data-clay-layer="foundation" className="dashboard-sidebar lg:col-span-3 rounded-[38px] p-6 flex flex-col justify-between text-white relative z-20">
              <div>
                {/* Circular portrait on a shallow peach-clay medallion, as in the reference. */}
                <div className="dashboard-profile flex flex-col items-center text-center pt-1 mb-6">
                  <button
                    type="button"
                    aria-label="Открыть аватар Mia в генераторе"
                    className="dashboard-profile-avatar"
                    onClick={() => triggerInspect('clay-avatar', 'girl_cat_mascot', 'peach', 'Hi, Mia!', 'Круглый портрет на светлой пластилиновой подложке')}
                  >
                    <span className="dashboard-profile-portrait">
                      <img src={resolveClayAssetPath('/assets/aistudio/girl_cat_mascot.png')} alt="Mia и кот" />
                    </span>
                  </button>

                  <h2 className="mt-2.5 text-xl font-black tracking-tight flex items-center gap-1.5 font-display dashboard-profile-greeting">
                    Hi, Mia! <span className="text-lg drop-shadow-[0_3px_4px_rgba(40,20,95,0.4)]">👋</span>
                  </h2>
                </div>

                {/* Navigation List with Sculpted 3D Icons & Text Shadows */}
                <nav aria-label="Дашборд" className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = activeScene === 'dashboard';
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => selectScene('dashboard')}
                        animate={
                          active
                            ? {
                                scaleX: [1, 1.025, 0.96, 1.01, 1],
                                scaleY: [1, 0.92, 1.04, 0.99, 1],
                              }
                            : {
                                scaleX: [1, 0.97, 1.01, 1],
                                scaleY: [1, 1.03, 0.99, 1],
                              }
                        }
                        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                        aria-current={active ? 'page' : undefined}
                        className="dashboard-nav-item relative z-10 isolate w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-extrabold cursor-pointer overflow-visible select-none"
                        style={{
                          color: active ? '#3E2F6B' : '#FFFFFF',
                          transition: 'color 240ms ease',
                        }}
                      >
                        {/* Active Marshmallow Cream Pill */}
                        <motion.span
                          data-clay-layer="control"
                          initial={false}
                          animate={{ opacity: active ? 1 : 0 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute inset-0 rounded-full -z-10 pointer-events-none"
                          style={{
                            background: materialBackground('linear-gradient(150deg, #FFFDF8 0%, #F5EDE9 100%)'),
                            boxShadow:
                              computeLayerShadow('control', {shadowRgb:'73,50,112',edge:'#E5D8DC'}, 0.8),
                          }}
                        />

                        {/* The icon itself carries volume; no tile or square background. */}
                        <Icon
                          aria-hidden="true"
                          className={`dashboard-nav-icon ${active ? 'is-active' : ''}`}
                          strokeWidth={2.6}
                          fill={['Dashboard', 'Favorites', 'Settings'].includes(item.id) ? 'currentColor' : 'none'}
                        />

                        <span className={active ? 'font-black' : 'dashboard-nav-label'}>
                          {item.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </nav>
                <nav aria-label="Разделы студии" className="dashboard-studio-nav mt-5 pt-4 space-y-1.5">
                  {([
                    {id:'generator',label:'Генератор UI',icon:WandSparkles},
                    {id:'design-system',label:'Дизайн-система',icon:Palette},
                    {id:'login',label:'Экран входа',icon:LogIn},
                    {id:'icons',label:'Пак 3D-иконок и маскотов',icon:Shapes},
                    {id:'library',label:'Библиотека',icon:LibraryBig},
                  ] as const).map(({id,label,icon:Icon}) => <button key={id} type="button" aria-current={activeScene===id?'page':undefined} onClick={() => selectScene(id)} className={`dashboard-nav-item w-full flex items-center gap-3.5 px-4 py-3 rounded-[22px] text-left text-sm font-extrabold cursor-pointer transition-colors ${activeScene===id?'clay-card-cream text-[#604878]':'hover:bg-white/10'}`}><Icon aria-hidden="true" className={`dashboard-nav-icon ${activeScene===id?'is-active':''}`} strokeWidth={2.6}/><span>{label}</span></button>)}
                </nav>
              </div>

            </aside>
      <div className="dashboard-content lg:col-span-9 min-w-0">
        {activeScene === 'generator' && <div className="p-4 sm:p-6"><ComponentGenerator config={generatorConfig} onChangeConfig={onChangeGeneratorConfig}/></div>}
        {activeScene === 'design-system' && <div className="p-4 sm:p-6"><DesignSystemGuide onSelectPresetForGenerator={onSelectPresetForGenerator}/></div>}
        {activeScene === 'login' && <div className="flex justify-end px-6 pt-5"><button type="button" className="clay-card-lavender rounded-full px-4 py-2 text-xs font-bold cursor-pointer" onClick={() => setShowOriginalOverlay(v => !v)}>{showOriginalOverlay ? 'Скрыть оригинал' : 'Сравнить с оригиналом'}</button></div>}
        {activeScene === 'library' && <div className="p-4 sm:p-6"><ReferenceLibrary onInspect={kind => triggerInspect(kind,'star_mascot','lavender','', '')}/></div>}

      {/* =====================================================================
          SCENE 1: MIA MUSIC DASHBOARD (1:1 Claymorphism Code Replica)
         ===================================================================== */}
      {activeScene === 'dashboard' && (
        <div className="space-y-6">
          {showOriginalOverlay && (
            <div data-clay-layer="foundation" className="clay-board rounded-[32px] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#6A56A6]">
                  Оригинальный референс
                </span>
                <span className="text-xs font-bold text-[#7A6F8E]">
                  Ниже — живая интерактивная сборка в коде
                </span>
              </div>
              <img
                src={resolveClayAssetPath('/assets/aistudio/2_28937b99.jpg')}
                alt="Original Dashboard Reference"
                className="w-full max-w-4xl mx-auto rounded-[28px] shadow-xl border-4 border-white/60"
              />
            </div>
          )}

            {/* RIGHT MAIN CONTENT AREA */}
            <div className="p-4 sm:p-6 lg:p-7 space-y-6">
              {/* Top Header Row: Title + Recessed Search + Notification Bell + Profile */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-black text-[#2E2540] font-display clay-text-3d">
                  Dashboard
                </h1>

                <button type="button" aria-label={showOriginalOverlay ? 'Скрыть оригинал' : 'Сравнить с оригиналом'} aria-pressed={showOriginalOverlay} className="clay-card-cream w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shrink-0" onClick={() => setShowOriginalOverlay(v => !v)}><SplitSquareVertical size={17}/></button>

                {/* Recessed Search Bar */}
                <div
                  onClick={() => triggerInspect('icon-input', 'magic_wand')}
                  className="flex-1 max-w-md clay-recessed-input rounded-full px-5 py-3 flex items-center gap-3 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-[#9B8FB2] clay-icon-3d" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for songs, artists..."
                    className="bg-transparent border-none outline-none text-sm font-bold text-[#2E2540] placeholder:text-[#A396B8] w-full"
                  />
                </div>

                {/* Top Right 3D Circular Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Уведомления"
                    className="relative w-12 h-12 rounded-full clay-card-cream flex items-center justify-center cursor-pointer clay-squish"
                  >
                    <Bell className="w-5 h-5 text-[#7C63D8] fill-[#9B82F3] clay-icon-3d" />
                    <span data-clay-layer="detail"
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center"
                      style={{
                        background: materialBackground('linear-gradient(145deg, #FA9CB0 0%, #E36582 100%)'),
                        boxShadow:
                          computeLayerShadow('detail', {shadowRgb:'184,78,104',edge:'#C9546C'}, 0.7),
                      }}
                    >
                      3
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="Профиль пользователя"
                    className="w-12 h-12 rounded-full clay-btn-purple flex items-center justify-center cursor-pointer"
                  >
                    <User className="w-5 h-5 text-white fill-white/90 clay-icon-3d" />
                  </button>
                </div>
              </div>

              {/* HERO BANNER: Good Morning, Mia! (With Enlarged Girl & Cat Paws Hanging Over Bottom Edge) */}
              <div
                onClick={() => triggerInspect('peeking-card', 'girl_cat_mascot')}
                className="clay-card-lavender rounded-[34px] px-6 pt-5 pb-5 sm:px-8 sm:pt-6 sm:pb-6 relative overflow-visible cursor-pointer group"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
                  {/* Left 3D Character — Enlarged so hands & cat paws hang over the bottom edge */}
                  <div className="md:col-span-5 flex justify-center relative z-30">
                    <img
                      src={resolveClayAssetPath('/assets/aistudio/girl_cat_mascot.png')}
                      alt="Good Morning Mia & Cat"
                      className="w-64 sm:w-72 h-auto object-contain -mt-6 -mb-11 drop-shadow-[0_18px_20px_rgba(68,46,128,0.34)] transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Center Greeting & CTA */}
                  <div className="md:col-span-5 space-y-3 text-center md:text-left z-10">
                    <div className="inline-flex items-center gap-2 text-2xl sm:text-[26px] font-black text-[#2E2348] font-display leading-tight clay-text-3d">
                      Good Morning, Mia!
                      <img
                        src={resolveClayAssetPath('/assets/aistudio/star_mascot.png')}
                        alt="Sun Star"
                        className="w-8 h-8 object-contain clay-icon-3d"
                      />
                    </div>
                    <p className="text-sm font-bold text-[#63538A] max-w-xs mx-auto md:mx-0">
                      Let&apos;s enjoy some music today!
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        className="px-6 py-3 rounded-full clay-btn-purple text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white clay-icon-3d" />
                        <span className="clay-sidebar-text-3d">Play Something</span>
                      </button>
                    </div>
                  </div>

                  {/* Right 3D Decorative Cloud / Plant Accent */}
                  <div className="md:col-span-2 hidden md:flex flex-col items-end justify-center">
                    <img
                      src={resolveClayAssetPath('/assets/aistudio/icon_magic_wand_7de955e9.png')}
                      alt="Magic Music"
                      className="w-24 h-24 object-contain clay-float clay-icon-3d"
                    />
                  </div>
                </div>
              </div>

              {/* 4 KPI STAT CARDS ROW — Crisp 3D Square Tiles + 3D Dropped Icons Inside */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-3">
                {/* Card 1: Songs Played */}
                <div
                  onClick={() => triggerInspect('kpi-card', 'magic_wand')}
                  className="clay-card-lavender rounded-[28px] p-5 flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-1 clay-squish"
                >
                  <div data-clay-layer="detail"
                    className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-3"
                    style={{
                      background: materialBackground('linear-gradient(145deg, #B59BF9 0%, #8C6DE6 100%)'),
                      boxShadow:
                        computeLayerShadow('detail', {shadowRgb:'98,66,189',edge:'#6242C4'}, 1),
                    }}
                  >
                    <Music className="w-6 h-6 text-white clay-icon-3d" />
                  </div>
                  <span className="text-xs font-extrabold text-[#6C5B91]">Songs Played</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#2E2348] my-0.5 font-display tabular-nums clay-text-3d">
                    1,248
                  </div>
                  <span className="text-[11px] font-extrabold text-[#3B8F70]">+18% this week</span>
                </div>

                {/* Card 2: Favorites */}
                <div
                  onClick={() => triggerInspect('kpi-card', 'welcome_gift')}
                  className="clay-card-peach rounded-[28px] p-5 flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-1 clay-squish"
                >
                  <div data-clay-layer="detail"
                    className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-3"
                    style={{
                      background: materialBackground('linear-gradient(145deg, #FFA299 0%, #ED766C 100%)'),
                      boxShadow:
                        computeLayerShadow('detail', {shadowRgb:'204,88,78',edge:'#C95247'}, 1),
                    }}
                  >
                    <Heart className="w-6 h-6 text-white fill-white clay-icon-3d" />
                  </div>
                  <span className="text-xs font-extrabold text-[#8C6568]">Favorites</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#3B2528] my-0.5 font-display tabular-nums clay-text-3d">
                    128
                  </div>
                  <span className="text-[11px] font-extrabold text-[#3B8F70]">+8 this week</span>
                </div>

                {/* Card 3: Hours Listened */}
                <div
                  onClick={() => triggerInspect('kpi-card', 'star_mascot')}
                  className="clay-card-butter rounded-[28px] p-5 flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-1 clay-squish"
                >
                  <div data-clay-layer="detail"
                    className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-3"
                    style={{
                      background: materialBackground('linear-gradient(145deg, #FFE08C 0%, #F2BA49 100%)'),
                      boxShadow:
                        computeLayerShadow('detail', {shadowRgb:'196,144,42',edge:'#CE9424'}, 1),
                    }}
                  >
                    <Clock className="w-6 h-6 text-[#4A3810] clay-icon-3d" />
                  </div>
                  <span className="text-xs font-extrabold text-[#8A7550]">Hours Listened</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#3B301E] my-0.5 font-display tabular-nums clay-text-3d">
                    34.6
                  </div>
                  <span className="text-[11px] font-extrabold text-[#3B8F70]">+6.2 this week</span>
                </div>

                {/* Card 4: Current Streak */}
                <div
                  onClick={() => triggerInspect('kpi-card', 'check_badge')}
                  className="clay-card-sky rounded-[28px] p-5 flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-1 clay-squish"
                >
                  <div data-clay-layer="detail"
                    className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-3"
                    style={{
                      background: materialBackground('linear-gradient(145deg, #9CC8FA 0%, #6FA4E8 100%)'),
                      boxShadow:
                        computeLayerShadow('detail', {shadowRgb:'82,132,196',edge:'#4B7EC2'}, 1),
                    }}
                  >
                    <Flame className="w-6 h-6 text-white fill-white clay-icon-3d" />
                  </div>
                  <span className="text-xs font-extrabold text-[#617799]">Current Streak</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#22304A] my-0.5 font-display tabular-nums clay-text-3d">
                    7
                  </div>
                  <span className="text-[11px] font-extrabold text-[#617799]">days in a row</span>
                </div>
              </div>

              {/* CHARTS ROW: Listening Overview (3D Clay Bars) + Top Genres (3D Clay Donut) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Listening Overview Bar Chart */}
                <div
                  onClick={() => triggerInspect('bar-chart-card')}
                  className="lg:col-span-7 clay-card-cream rounded-[30px] p-6 flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-black text-[#2E2540] font-display">
                      Listening Overview
                    </h3>
                    <span className="px-3.5 py-1.5 rounded-full clay-recessed-input text-xs font-extrabold text-[#6C5B91] inline-flex items-center gap-1">
                      This Week <ChevronDown className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex items-end gap-3 h-44 pt-2">
                    {/* Y-Axis Labels */}
                    <div className="flex flex-col justify-between h-full text-[11px] font-extrabold text-[#9A8FB0] pb-6 pr-1">
                      <span>6h</span>
                      <span>4h</span>
                      <span>2h</span>
                      <span>0</span>
                    </div>

                    {/* Independent clay columns stand directly on the cream chart tray. */}
                    <div className="flex-1 min-w-0 grid grid-cols-7 gap-2 sm:gap-3 h-full items-end">
                      {weeklyBars.map((bar) => (
                        <div key={bar.day} className="flex flex-col items-center min-w-0 h-full justify-end gap-2">
                          <div className="w-full max-w-[34px] flex-1 min-h-0 flex items-end">
                            <div data-clay-layer="control" data-clay-shape="cushion"
                              className="w-full rounded-[11px] transition-[filter] duration-300 hover:brightness-[1.025]"
                              style={{
                                height: `${bar.heightPct}%`,
                                background: materialBackground(`linear-gradient(145deg, ${bar.face}, ${bar.edge})`),
                                boxShadow: computeLayerShadow('control', {shadowRgb:'132,108,128',edge:bar.edge}, .65),
                                '--clay-relief-face': bar.face,
                                '--clay-relief-edge': bar.edge,
                              } as React.CSSProperties}
                            />
                          </div>
                          <span className="text-[11px] font-extrabold text-[#7A6F8E]">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Genres 3D Donut Card */}
                <div
                  onClick={() => triggerInspect('donut-chart-card')}
                  className="lg:col-span-5 clay-card-cream rounded-[30px] p-6 flex flex-col justify-between cursor-pointer"
                >
                  <h3 className="text-base font-black text-[#2E2540] font-display mb-4">
                    Top Genres
                  </h3>

                  <div className="flex items-center justify-between gap-4 my-auto">
                    <DashboardGenreDonut />

                    {/* Genre Legend with 3D Clay Dots */}
                    <div className="flex-1 space-y-2.5">
                      {DASHBOARD_GENRES.map((g) => (
                        <div key={g.label} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-bold text-[#4E416B]">
                            <span data-clay-layer="detail" data-clay-shape="disc"
                              className="w-3.5 h-3.5 rounded-full inline-block"
                              style={{
                                background: materialBackground(g.face),
                                boxShadow:
                                  computeLayerShadow('detail', {shadowRgb:'132,108,128',edge:g.edge}, 0.6),
                                '--clay-relief-face': g.face,
                                '--clay-relief-edge': g.edge,
                              } as React.CSSProperties}
                            />
                            {g.label}
                          </div>
                          <span className="font-black text-[#2E2540] tabular-nums">{g.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM CARDS ROW: Recently Played + Daily Mix */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Recently Played */}
                <div className="lg:col-span-6 clay-card-cream rounded-[30px] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-[#2E2540] font-display">
                      Recently Played
                    </h3>
                    <span className="px-3 py-1 rounded-full clay-recessed-input text-[11px] font-extrabold text-[#6C5B91]">
                      See All
                    </span>
                  </div>

                  <div className="space-y-3">
                    {recentTracks.map((track) => {
                      const isPlaying = playingTrack === track.title;
                      return (
                        <div
                          key={track.title}
                          onClick={() => setPlayingTrack(isPlaying ? null : track.title)}
                          className="flex items-center justify-between p-2.5 rounded-[20px] hover:bg-[#F7EFE6]/70 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5">
                            <div data-clay-layer="detail"
                              className="w-12 h-12 rounded-[16px] shrink-0"
                              style={{
                                background: materialBackground(track.coverGrad),
                                boxShadow:
                                  computeLayerShadow('detail', {shadowRgb:'95,75,140',edge:'#80718B'}, 1),
                              }}
                            />
                            <div>
                              <div className="text-sm font-black text-[#2E2540]">{track.title}</div>
                              <div className="text-xs font-bold text-[#8A7DA6]">{track.artist}</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            aria-label={isPlaying ? `Пауза ${track.title}` : `Воспроизвести ${track.title}`}
                            className="w-10 h-10 rounded-full clay-card-cream flex items-center justify-center cursor-pointer clay-squish"
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4 text-[#7C5CE0] fill-[#7C5CE0] clay-icon-3d" />
                            ) : (
                              <Play className="w-4 h-4 text-[#7C5CE0] fill-[#7C5CE0] ml-0.5 clay-icon-3d" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Mix Card */}
                <div className="lg:col-span-6 clay-card-cream rounded-[30px] p-6 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-[#2E2540] font-display">Daily Mix</h3>
                    <span className="px-3 py-1 rounded-full clay-recessed-input text-[11px] font-extrabold text-[#6C5B91]">
                      See All
                    </span>
                  </div>

                  {/* Cozy 3D Clay Room Scene Card */}
                  <div data-clay-layer="control"
                    className="relative h-48 rounded-[24px] p-5 flex flex-col justify-end overflow-hidden"
                    style={{
                      background:
                        materialBackground('linear-gradient(135deg, #7A5896 0%, #9E7BB8 45%, #E0A98B 100%)'),
                      boxShadow:
                        computeLayerShadow('control', {shadowRgb:'95,75,140',edge:'#775780'}, 1),
                    }}
                  >
                    <div className="absolute top-4 right-5 w-24 h-24 rounded-full bg-[#FFE8B5]/40 blur-xl pointer-events-none" />
                    <img
                      src={resolveClayAssetPath('/assets/aistudio/icon_speech_bubbles_62f65106.png')}
                      alt="Chill Vibes"
                      className="absolute top-4 right-5 w-20 h-20 object-contain clay-icon-3d"
                    />

                    <div className="relative z-10 flex items-end justify-between">
                      <div>
                        <h4 className="text-xl font-black text-white font-display clay-sidebar-text-3d">
                          Chill Vibes
                        </h4>
                        <p className="text-xs font-extrabold text-white/85">80 songs</p>
                      </div>
                      <button
                        type="button"
                        aria-label="Воспроизвести Chill Vibes"
                        className="w-11 h-11 rounded-full clay-card-cream flex items-center justify-center cursor-pointer clay-squish"
                      >
                        <Play className="w-4 h-4 text-[#7C5CE0] fill-[#7C5CE0] ml-0.5 clay-icon-3d" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM PROMO BANNER: Discover new music (Uses uploaded 11111.png Star Mascot) */}
              <div data-clay-layer="foundation"
                onClick={() => triggerInspect('promo-banner', 'star_mascot')}
                className="rounded-[30px] px-6 py-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer transition-transform hover:-translate-y-0.5"
                style={{
                  background: `var(--clay-texture-image, none), ${materialBackground('linear-gradient(145deg, #B59BF9 0%, #9374ED 100%)')}`,
                  backgroundBlendMode: 'soft-light, normal',
                  boxShadow:
                    computeLayerShadow('foundation', {shadowRgb:'102,71,194',edge:'#6A49C9'}, 1),
                }}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={resolveClayAssetPath('/assets/aistudio/star_mascot.png')}
                    alt="Cute Smiling Star Mascot"
                    className="w-16 h-16 object-contain -my-2 clay-icon-3d clay-float"
                  />
                  <div>
                    <h3 className="text-lg font-black text-white font-display clay-sidebar-text-3d">
                      Discover new music
                    </h3>
                    <p className="text-xs font-bold text-white/90">
                      Play songs we think you&apos;ll love
                    </p>
                  </div>
                </div>

                <button data-clay-layer="control"
                  type="button"
                  className="px-6 py-2.5 rounded-full text-xs font-extrabold text-white cursor-pointer clay-squish clay-sidebar-text-3d"
                  style={{
                    background: materialBackground('linear-gradient(145deg, #C7B2FC 0%, #A488F5 100%)'),
                    boxShadow:
                      computeLayerShadow('control', {shadowRgb:'58,35,128',edge:'#7858D6'}, 1),
                  }}
                >
                  Explore Now
                </button>
              </div>
            </div>
        </div>
      )}

      {/* =====================================================================
          SCENE 2: WELCOME BACK LOGIN SCREEN (1:1 Claymorphism Code Replica)
         ===================================================================== */}
      {activeScene === 'login' && (
        <div className="space-y-6">
          {showOriginalOverlay && (
            <div data-clay-layer="foundation" className="clay-board rounded-[32px] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#6A56A6]">
                  Оригинальный референс
                </span>
                <span className="text-xs font-bold text-[#7A6F8E]">
                  Ниже — интерактивная 3D-сборка со свисающими лапками
                </span>
              </div>
              <img
                src={resolveClayAssetPath('/assets/aistudio/1_47e2d1fa.jpg')}
                alt="Original Login Reference"
                className="w-full max-w-md mx-auto rounded-[28px] shadow-xl border-4 border-white/60"
              />
            </div>
          )}

          {/* Outer Lavender Stage with Floating Clay Clouds */}
          <div className="relative py-8 px-4 flex justify-center items-center">
            <img
              src={resolveClayAssetPath('/assets/aistudio/cloud_upload_bc9d95e9.png')}
              alt="Floating Clay Cloud"
              className="hidden md:block absolute left-8 top-16 w-28 h-28 object-contain clay-float pointer-events-none clay-icon-3d"
            />
            <img
              src={resolveClayAssetPath('/assets/aistudio/welcome_gift_d09e2000.png')}
              alt="Floating Gift"
              className="hidden md:block absolute right-10 bottom-16 w-28 h-28 object-contain clay-float pointer-events-none clay-icon-3d"
            />

            {/* Main Vertical Phone Slab (Z-Layer 10) */}
            <div data-clay-layer="foundation" className="w-full max-w-[440px] clay-board rounded-[46px] p-6 sm:p-8 flex flex-col items-center relative z-10">
              {/* Top Pink 3D Clay Heart */}
              <div data-clay-layer="detail"
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{
                  background: materialBackground('linear-gradient(145deg, #FFB5C2 0%, #F07D94 100%)'),
                  boxShadow:
                    computeLayerShadow('detail', {shadowRgb:'204,88,112',edge:'#C9546C'}, 1),
                }}
              >
                <Heart className="w-5 h-5 text-white fill-white clay-icon-3d" />
              </div>

              {/* Extruded 3D Clay Title */}
              <h1 className="text-3xl sm:text-4xl font-black text-[#6E56B8] tracking-tight font-display text-center clay-text-3d">
                Welcome Back
              </h1>
              <p className="text-sm font-bold text-[#7A6F8E] mt-1 text-center">
                Login to continue your journey
              </p>

              {/* Z-Layer 30: Enlarged Peeking Mascot whose hands and cat paws overhang the top edge of the form */}
              <div
                onClick={() => onSelectForGenerator?.('peeking-card', 'girl_cat_mascot')}
                className="relative z-30 mt-3 -mb-9 cursor-pointer transition-transform hover:scale-105"
              >
                <img
                  src={resolveClayAssetPath('/assets/aistudio/girl_cat_mascot.png')}
                  alt="Peeking Girl and Cat Mascot"
                  className="w-64 sm:w-72 h-auto object-contain drop-shadow-[0_18px_20px_rgba(68,46,128,0.34)]"
                />
              </div>

              {/* Z-Layer 20: Raised Inner Form Card */}
              <div className="w-full clay-card-cream rounded-[36px] p-6 pt-9 space-y-4 relative z-20">
                {/* Input 1: Email or Username with Left 3D Circular Medallion */}
                <div
                  onClick={() => onSelectForGenerator?.('icon-input', 'speech_bubbles')}
                  className="relative flex items-center cursor-pointer"
                >
                  <div className="w-full clay-recessed-input rounded-full pl-16 pr-5 py-3.5">
                    <input
                      type="text"
                      placeholder="Email or Username"
                      className="w-full bg-transparent border-none outline-none text-sm font-bold text-[#2E2540] placeholder:text-[#9689AD]"
                    />
                  </div>
                  <div data-clay-layer="detail"
                    className="absolute left-1.5 w-11 h-11 rounded-full flex items-center justify-center"
                    style={{
                      background: materialBackground('linear-gradient(145deg, #B59BF9 0%, #8E6FE8 100%)'),
                      boxShadow:
                        computeLayerShadow('detail', {shadowRgb:'98,66,189',edge:'#5E3EC4'}, 1),
                    }}
                  >
                    <User className="w-5 h-5 text-white fill-white clay-icon-3d" />
                  </div>
                </div>

                {/* Input 2: Password with Left 3D Padlock Medallion */}
                <div
                  onClick={() => onSelectForGenerator?.('icon-input', 'padlock')}
                  className="relative flex items-center cursor-pointer"
                >
                  <div className="w-full clay-recessed-input rounded-full pl-16 pr-11 py-3.5">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full bg-transparent border-none outline-none text-sm font-bold text-[#2E2540] placeholder:text-[#9689AD]"
                    />
                  </div>
                  <div data-clay-layer="detail"
                    className="absolute left-1.5 w-11 h-11 rounded-full flex items-center justify-center"
                    style={{
                      background: materialBackground('linear-gradient(145deg, #B59BF9 0%, #8E6FE8 100%)'),
                      boxShadow:
                        computeLayerShadow('detail', {shadowRgb:'98,66,189',edge:'#5E3EC4'}, 1),
                    }}
                  >
                    <img
                      src={resolveClayAssetPath('/assets/aistudio/icon_padlock_e2e3dd3f.png')}
                      alt="Padlock"
                      className="w-7 h-7 object-contain clay-icon-3d"
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPassword((v) => !v);
                    }}
                    className="absolute right-4 text-[#8E7FAD] hover:text-[#5E4B8B] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-end">
                  <span className="text-xs font-extrabold text-[#7B62D9] hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                </div>

                {/* Big 3D Purple Pill Login Button */}
                <button
                  type="button"
                  onClick={() => onSelectForGenerator?.('pill-button', 'telegram_plane')}
                  className="w-full py-3.5 rounded-full clay-btn-purple text-base font-black tracking-wide cursor-pointer"
                >
                  <span className="clay-sidebar-text-3d">Login</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-[1.5px] bg-[#E3D8CD]" />
                  <span className="text-xs font-bold text-[#8A7DA6]">or continue with</span>
                  <div className="flex-1 h-[1.5px] bg-[#E3D8CD]" />
                </div>

                {/* 3 Circular 3D Clay Social Buttons */}
                <div className="flex items-center justify-center gap-5 pt-1">
                  {[
                    { label: 'G', color: '#EA4335' },
                    { label: '', color: '#2E2540' },
                    { label: 'f', color: '#1877F2' },
                  ].map((soc) => (
                    <button
                      key={soc.label}
                      type="button"
                      className="w-12 h-12 rounded-full clay-card-cream flex items-center justify-center text-lg font-black cursor-pointer clay-squish"
                      style={{ color: soc.color }}
                    >
                      <span className="clay-icon-3d">{soc.label}</span>
                    </button>
                  ))}
                </div>

                <p className="text-center text-xs font-bold text-[#7A6F8E] pt-2">
                  Don&apos;t have an account?{' '}
                  <span className="font-black text-[#7B62D9] underline cursor-pointer">
                    Sign Up
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SCENE 3: 3D CLAY ICON & MASCOT ASSET PACK STUDIO
         ===================================================================== */}
      {activeScene === 'icons' && (
        <div data-clay-layer="foundation" className="clay-board rounded-[36px] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#7C5CE0]">
                Библиотека 3D-ассетов
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2E2540] font-display mt-1">
                Пак 3D-иконок и маскотов на объёмных плитках
              </h2>
            </div>
            <p className="text-xs font-bold text-[#7A6F8E] max-w-md">
              Нажмите на любую карточку, чтобы открыть этот 3D-ассет в генераторе кода.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {UPLOADED_CLAY_ASSETS.filter((a) => a.category !== 'reference').map((asset) => (
              <div
                key={asset.id}
                onClick={() =>
                  onSelectForGenerator?.(
                    asset.category === 'mascot' ? 'peeking-card' : 'kpi-card',
                    asset.id
                  )
                }
                className="clay-card-cream rounded-[28px] p-5 flex flex-col justify-between items-center text-center cursor-pointer transition-transform hover:-translate-y-1.5 group"
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#EFE8FA] text-[#6E54C8]">
                    {asset.category === 'mascot' ? '3D Маскот' : '3D Иконка'}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-[#9E82F5] opacity-0 group-hover:opacity-100 transition-opacity clay-icon-3d" />
                </div>

                {/* Sculpted 3D Clay Square Tile holding the PNG with crisp 3D shadow */}
                <div data-clay-layer="control"
                  className="w-28 h-28 rounded-[26px] flex items-center justify-center my-3 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: materialBackground('linear-gradient(145deg, #F6F0FF 0%, #E2D4FA 100%)'),
                    boxShadow:
                      computeLayerShadow('control', {shadowRgb:'104,78,168',edge:'#C7B4EE'}, 1),
                  }}
                >
                  <img
                    src={resolveClayAssetPath(asset.path)}
                    alt={asset.ruName}
                    className="w-20 h-20 object-contain clay-icon-3d"
                  />
                </div>

                <div className="w-full text-left mt-2">
                  <h3 className="text-sm font-black text-[#2E2540] font-display leading-snug">
                    {asset.ruName}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#7A6F8E] mt-1 line-clamp-2">
                    {asset.usageHint}
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full py-2 rounded-full text-xs font-extrabold clay-btn-purple cursor-pointer"
                >
                  В генератор →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
