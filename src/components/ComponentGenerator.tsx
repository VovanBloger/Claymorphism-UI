import { materialBackground, materialShadow } from '../utils/materialStyle';
import notchSource from './StickerNotchNav.tsx?raw';
import notchMathSource from '../utils/notchMath.ts?raw';
import notchCss from './sticker-notch-nav.css?raw';
import referenceSource from './ReferenceElements.tsx?raw';
import referenceCss from './reference-clay.css?raw';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  CLAY_COLOR_PRESETS,
  ClayColorPresetId,
  GeneratorComponentType,
  GeneratorConfig,
  UPLOADED_CLAY_ASSETS,
  computeClayStyles,
  generateComponentCode,
  resolveClayAssetPath,
} from '../utils/clayEngine';
import { ClaySlider } from './ClaySlider';
import { ClayBottomNav } from './ClayBottomNav';
import { StickerNotchNavDemo } from './StickerNotchNav';
import { ClayToggle } from './ClayToggle';
import { ClayAvatar } from './ClayAvatar';
import { REFERENCE_ELEMENTS, ReferenceElement, ReferenceElementKind } from './ReferenceElements';
import './reference-clay.css';
import { Check, Copy, RotateCcw } from 'lucide-react';

interface ComponentGeneratorProps {
  config: GeneratorConfig;
  onChangeConfig: React.Dispatch<React.SetStateAction<GeneratorConfig>>;
}

interface ArchetypeItem {
  id: GeneratorComponentType;
  label: string;
  desc: string;
  defaultPreset: ClayColorPresetId;
  defaultAsset: string;
  defaultMode: 'raised' | 'recessed' | 'floating-pill';
  defaultRadius: number;
}

const COMPONENT_ARCHETYPES: ArchetypeItem[] = [
  {id:'sticker-notch-nav',label:'Нижнее меню · Sticker Notch',desc:'Меню из генератора стикеров: летающий шар и плавная пластилиновая выемка',defaultPreset:'lavender',defaultAsset:'magic_wand',defaultMode:'raised',defaultRadius:28},
  ...REFERENCE_ELEMENTS.map(item => ({id:item.id,label:item.label,desc:item.description,defaultPreset:'lavender' as const,defaultAsset:'star_mascot',defaultMode:'raised' as const,defaultRadius:28})),
  {id:'pill-button',label:'Кнопка-капсула',desc:'Пухлая кнопка с короткой контактной тенью',defaultPreset:'rose',defaultAsset:'telegram_plane',defaultMode:'floating-pill',defaultRadius:999},
  {
    id: 'clay-avatar',
    label: '3D Аватарка с подложкой и рамкой',
    desc: 'Вдавленный колодец с внутренней тенью, объёмная рамка и выход персонажа за края',
    defaultPreset: 'purple-cta',
    defaultAsset: 'girl_cat_mascot',
    defaultMode: 'raised',
    defaultRadius: 48,
  },
  {
    id: 'peeking-card',
    label: 'Баннер с 3D-аватаром',
    desc: 'Карточка с 3D-рамкой под аватарку и свисающими через край лапками',
    defaultPreset: 'lavender',
    defaultAsset: 'girl_cat_mascot',
    defaultMode: 'raised',
    defaultRadius: 34,
  },
  {
    id: 'bottom-nav',
    label: 'Нижнее меню 3D Clay Dock',
    desc: 'Плавающий док навигации с объёмными медальонами и сменой цвета на месте',
    defaultPreset: 'cream',
    defaultAsset: 'magic_wand',
    defaultMode: 'raised',
    defaultRadius: 34,
  },
  {
    id: 'clay-slider',
    label: '3D Ползунки и Прогресс-бары',
    desc: 'Плавные ползунки с настройкой формы бегунка от кубика до сферы',
    defaultPreset: 'cream',
    defaultAsset: 'star_mascot',
    defaultMode: 'raised',
    defaultRadius: 30,
  },
  {
    id: 'clay-toggle',
    label: '3D Clay Переключатели',
    desc: 'Физический тумблер и фиксируемая кнопка с вдавленным ложем',
    defaultPreset: 'cream',
    defaultAsset: 'check_badge',
    defaultMode: 'raised',
    defaultRadius: 30,
  },
  {
    id: 'kpi-card',
    label: 'Карточка метрики с 3D-плиткой',
    desc: 'Статистическая карточка с выпуклой квадратной подложкой под иконку',
    defaultPreset: 'lavender',
    defaultAsset: 'magic_wand',
    defaultMode: 'raised',
    defaultRadius: 28,
  },
  {
    id: 'icon-input',
    label: 'Поле ввода с 3D-медальоном',
    desc: 'Вдавленный желоб ввода и выступающий круглый медальон слева',
    defaultPreset: 'cream',
    defaultAsset: 'padlock',
    defaultMode: 'recessed',
    defaultRadius: 999,
  },
  {
    id: 'bar-chart-card',
    label: '3D Столбчатый график',
    desc: 'График активности из объёмных пастельных цилиндров во вдавленных треках',
    defaultPreset: 'cream',
    defaultAsset: 'check_badge',
    defaultMode: 'raised',
    defaultRadius: 30,
  },
  {
    id: 'donut-chart-card',
    label: '3D Кольцевая диаграмма',
    desc: 'Объёмное кольцо жанров с внутренней тенью и выпуклыми маркерами',
    defaultPreset: 'cream',
    defaultAsset: 'star_mascot',
    defaultMode: 'raised',
    defaultRadius: 30,
  },
];

const THUMB_SHAPE_PRESETS = [
  { radius: 6, label: 'Кубик' },
  { radius: 10, label: 'Сквиркл' },
  { radius: 14, label: 'Подушка' },
  { radius: 18, label: 'Шар' },
];

function ClayArchetypeTile({
  arch,
  active,
  onSelect,
}: {
  arch: ArchetypeItem;
  active: boolean;
  onSelect: () => void;
}) {
  const prevActiveRef = useRef(active);
  const [phase, setPhase] = useState<'idle' | 'activating' | 'deactivating'>('idle');

  useEffect(() => {
    if (prevActiveRef.current !== active) {
      setPhase(active ? 'activating' : 'deactivating');
      prevActiveRef.current = active;
    }
  }, [active]);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      animate={
        phase === 'activating'
          ? {
              scaleX: [1, 1.03, 0.98, 1.02, 1],
              scaleY: [1, 0.97, 1.025, 0.98, 1],
              y: [0, 3, -2, 0],
            }
          : phase === 'deactivating'
            ? {
                scaleX: [1, 0.98, 1.03, 0.99, 1],
                scaleY: [1, 1.025, 0.97, 1.01, 1],
                y: [0, 1.5, -0.5, 0],
              }
            : { scaleX: 1, scaleY: 1, y: 0 }
      }
      transition={{
        duration: 0.48,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative z-10 text-left p-4 h-[94px] flex flex-col justify-center rounded-[22px] cursor-pointer overflow-hidden focus:outline-none"
      style={{
        color: active ? '#FFFFFF' : '#2E2540',
        transition: 'color 280ms ease',
      }}
    >
      {/* Base Warm Cream 3D Clay Surface */}
      <div
        className="absolute inset-0 rounded-[22px] -z-20 transition-opacity duration-300"
        style={{
          opacity: active ? 0 : 1,
          background: materialBackground('linear-gradient(145deg, #FFFDFB 0%, #F5EDE4 100%)'),
          boxShadow:
            materialShadow('3px 8px 16px -4px rgba(95, 75, 140, 0.18), inset 2px 3px 5px rgba(255,255,255,0.98), inset -3px -4px 7px #DACBBE'),
        }}
      />

      {/* Active Rich Purple 3D Clay Surface (Morphs in place) */}
      <motion.div
        initial={false}
        animate={{
          opacity: active ? 1 : 0,
        }}
        transition={{
          duration: 0.34,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-0 rounded-[22px] -z-10 pointer-events-none"
        style={{
          background: materialBackground('linear-gradient(145deg, #B49BF9 0%, #8E6FE8 100%)'),
          boxShadow:
            materialShadow('5px 14px 24px -5px rgba(98, 66, 189, 0.48), 2px 5px 10px rgba(98, 66, 189, 0.28), inset 3px 3.5px 6px rgba(255,255,255,0.74), inset -4px -5px 8px #6343C4'),
        }}
      />

      <div className={`text-sm font-black font-display truncate ${active ? 'clay-sidebar-text-3d' : ''}`}>
        {arch.label}
      </div>
      <div
        className="text-xs font-semibold mt-1 line-clamp-2 transition-colors duration-250"
        style={{ color: active ? 'rgba(255,255,255,0.92)' : '#6E6285' }}
      >
        {arch.desc}
      </div>
    </motion.button>
  );
}

function ClayInPlaceTabButton({
  label,
  active,
  onClick,
  heightClass = 'h-[40px]',
  radiusClass = 'rounded-[16px]',
  textClass = 'text-xs',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  heightClass?: string;
  radiusClass?: string;
  textClass?: string;
}) {
  const prevActiveRef = useRef(active);
  const [phase, setPhase] = useState<'idle' | 'activating' | 'deactivating'>('idle');

  useEffect(() => {
    if (prevActiveRef.current !== active) {
      setPhase(active ? 'activating' : 'deactivating');
      prevActiveRef.current = active;
    }
  }, [active]);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={
        phase === 'activating'
          ? {
              scaleX: [1, 1.09, 0.975, 1.03, 1],
              scaleY: [1, 0.88, 1.03, 0.98, 1],
              y: [0, 2, -1.5, 0],
            }
          : phase === 'deactivating'
            ? {
                scaleX: [1, 0.975, 1.03, 0.99, 1],
                scaleY: [1, 1.03, 0.96, 1.01, 1],
                y: [0, 1, 0],
              }
            : { scaleX: 1, scaleY: 1, y: 0 }
      }
      transition={{
        duration: 0.46,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative z-10 w-full ${heightClass} flex items-center justify-center px-2 ${radiusClass} ${textClass} font-extrabold whitespace-nowrap cursor-pointer overflow-hidden focus:outline-none`}
      style={{
        color: active ? '#FFFFFF' : '#5A4D73',
        transition: 'color 260ms ease',
      }}
    >
      <motion.span
        initial={false}
        animate={{
          opacity: active ? 1 : 0,
        }}
        transition={{
          duration: 0.32,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`absolute inset-0 ${radiusClass} -z-10 pointer-events-none`}
        style={{
          background: materialBackground('linear-gradient(145deg, #AD94F9 0%, #8E6FE8 100%)'),
          boxShadow:
            materialShadow('3px 8px 16px -3px rgba(114, 82, 209, 0.48), inset 2px 3px 5px rgba(255,255,255,0.7), inset -3px -4px 7px #5E3EBA'),
        }}
      />
      <span className={active ? 'clay-sidebar-text-3d' : ''}>{label}</span>
    </motion.button>
  );
}

export function ComponentGenerator({ config, onChangeConfig }: ComponentGeneratorProps) {
  const [codeTab, setCodeTab] = useState<'react' | 'css' | 'tokens'>('react');
  const [copied, setCopied] = useState(false);
  const [inputDemoValue, setInputDemoValue] = useState<string>('');
  const [activeBarIndex, setActiveBarIndex] = useState<number>(3);
  const [demoBottomNavId, setDemoBottomNavId] = useState<string>('home');
  const [demoSliderPink, setDemoSliderPink] = useState<number>(58);
  const [demoSliderBlue, setDemoSliderBlue] = useState<number>(32);
  const [demoSliderMint, setDemoSliderMint] = useState<number>(74);
  const [toggleMintOn, setToggleMintOn] = useState<boolean>(true);
  const [togglePurpleOn, setTogglePurpleOn] = useState<boolean>(false);
  const [toggleButtonPressed, setToggleButtonPressed] = useState<boolean>(true);

  const currentThumbRadius = config.physics.thumbRadius ?? 18;
  const computed = computeClayStyles(config.physics);
  const activePreset = CLAY_COLOR_PRESETS[config.physics.presetId] || CLAY_COLOR_PRESETS.cream;
  const selectedAsset =
    UPLOADED_CLAY_ASSETS.find((a) => a.id === config.selectedAssetId) ||
    UPLOADED_CLAY_ASSETS[0];

  const selectableAssets = UPLOADED_CLAY_ASSETS.filter((a) => a.category !== 'reference');

  const generatedCode = generateComponentCode(config, codeTab, {source:referenceSource,css:referenceCss,notch:{source:notchSource,math:notchMathSource,css:notchCss}});

  const handleSelectArchetype = (arch: ArchetypeItem) => {
    onChangeConfig((prev) => ({
      ...prev,
      componentType: arch.id,
      selectedAssetId: arch.defaultAsset,
      physics: {
        ...prev.physics,
        presetId: arch.defaultPreset,
        surfaceMode: arch.defaultMode,
        borderRadius: arch.defaultRadius,
      },
    }));
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      window.alert('Не удалось скопировать код. Выделите его и скопируйте вручную.');
    }
  };

  const handleResetPhysics = () => {
    onChangeConfig((prev) => ({
      ...prev,
      physics: {
        presetId: 'lavender',
        surfaceMode: 'raised',
        borderRadius: 34,
        depth: 14,
        blurSoftness: 28,
        specularIntensity: 0.975,
        padding: 24,
        thumbRadius: 18,
      },
    }));
  };

  const handleThumbRadiusChange = (val: number) => {
    onChangeConfig((prev) => ({
      ...prev,
      physics: {
        ...prev.physics,
        thumbRadius: val,
      },
    }));
  };

  return (
    <div className="space-y-8">
      {/* 1. Archetype Selector Bar */}
      <div className="clay-board rounded-[34px] p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-xl md:text-2xl font-black text-[#2E2540] font-display">
            Конструктор компонентов Soft 3D Claymorphism
          </h2>
          <button
            type="button"
            onClick={handleResetPhysics}
            className="w-[156px] h-[38px] justify-center rounded-full text-xs font-extrabold text-[#4D3F6B] clay-card-cream flex items-center gap-1.5 self-start shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 clay-icon-3d" />
            Сбросить физику
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMPONENT_ARCHETYPES.map((arch) => (
            <ClayArchetypeTile
              key={arch.id}
              arch={arch}
              active={config.componentType === arch.id}
              onSelect={() => handleSelectArchetype(arch)}
            />
          ))}
        </div>
      </div>

      {/* 2. Main Studio Split: Controls (Left) + Live Preview & Code Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Physics, Palette, Smooth 3D Clay Sliders, Icon Pack & Content Controls */}
        <div className="lg:col-span-5 clay-board rounded-[34px] p-6 space-y-6">
          {/* Palette Selection */}
          <div>
            <span className="text-xs font-extrabold text-[#7B5CE6] block mb-2.5">
              Цветовая палитра материала
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.keys(CLAY_COLOR_PRESETS) as ClayColorPresetId[]).map((presetKey) => {
                const p = CLAY_COLOR_PRESETS[presetKey];
                const isSelected = config.physics.presetId === presetKey;
                return (
                  <motion.button
                    key={presetKey}
                    type="button"
                    animate={
                      isSelected
                        ? {
                            scaleX: [1, 1.035, 0.98, 1.02, 1],
                            scaleY: [1, 0.97, 1.025, 0.99, 1],
                          }
                        : { scaleX: 1, scaleY: 1 }
                    }
                    transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() =>
                      onChangeConfig((prev) => ({
                        ...prev,
                        physics: { ...prev.physics, presetId: presetKey },
                      }))
                    }
                    className={`h-[66px] p-2.5 rounded-[18px] text-left flex flex-col justify-between cursor-pointer transition-shadow duration-250 ${
                      isSelected ? 'ring-2 ring-[#6D4CE3]' : ''
                    }`}
                    style={{
                      background: materialBackground(`linear-gradient(145deg, ${p.gradStart} 0%, ${p.gradEnd} 100%)`),
                      color: p.textHex,
                      boxShadow: materialShadow(`3px 8px 16px -3px rgba(${p.outerShadowRgb}, 0.28), inset 2px 2.5px 4px ${p.innerLightRgba}, inset -2px -3px 6px ${p.innerDarkHex}`),
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{
                          background: materialBackground(p.badgeBgHex),
                          boxShadow: materialShadow('inset 1px 1.5px 2px rgba(255,255,255,0.7), 1px 2px 4px rgba(0,0,0,0.15)'),
                        }}
                      />
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#6D4CE3]" aria-hidden="true" />
                      )}
                    </div>
                    <div className="text-xs font-black leading-tight truncate">
                      {p.shortLabel}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Surface Relief Mode */}
          <div>
            <span className="text-xs font-extrabold text-[#7B5CE6] block mb-2">
              Режим рельефа
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-[22px] clay-recessed-input relative">
              {(
                [
                  { id: 'raised', label: 'Выпуклый 3D' },
                  { id: 'recessed', label: 'Вдавленный' },
                  { id: 'floating-pill', label: 'Парящий' },
                ] as const
              ).map((m) => (
                <ClayInPlaceTabButton
                  key={m.id}
                  label={m.label}
                  active={config.physics.surfaceMode === m.id}
                  onClick={() =>
                    onChangeConfig((prev) => ({
                      ...prev,
                      physics: { ...prev.physics, surfaceMode: m.id },
                    }))
                  }
                />
              ))}
            </div>
          </div>

          {/* 3D Clay Progress Bars / Sliders */}
          <div
            className="space-y-4 p-4 rounded-[26px]"
            style={{
              background: materialBackground('linear-gradient(145deg, #FCF5F7 0%, #F2EBF8 100%)'),
              boxShadow:
                materialShadow('inset 2px 3px 7px rgba(140, 110, 170, 0.18), inset -2px -3px 6px rgba(255, 255, 255, 0.9)'),
            }}
          >
            <span className="text-xs font-extrabold text-[#7B5CE6] block">
              Геометрия, глубина и тени
            </span>

            {/* Thumb Corner Rounding Control + Quick Shape Presets */}
            <div className="p-3 rounded-[20px] bg-white/55 space-y-2.5">
              <ClaySlider
                id="slider-thumb-radius"
                label="Скругление шариков ползунков"
                valueDisplay={`${currentThumbRadius}px`}
                min={4}
                max={18}
                step={1}
                value={currentThumbRadius}
                thumbRadius={currentThumbRadius}
                variant="butter"
                onChange={handleThumbRadiusChange}
              />

              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {THUMB_SHAPE_PRESETS.map((preset) => (
                  <ClayInPlaceTabButton
                    key={preset.radius}
                    label={preset.label}
                    active={currentThumbRadius === preset.radius}
                    onClick={() => handleThumbRadiusChange(preset.radius)}
                    heightClass="h-[30px]"
                    radiusClass="rounded-[10px]"
                    textClass="text-[11px]"
                  />
                ))}
              </div>
            </div>

            <ClaySlider
              id="slider-radius"
              label="Скругление углов карточки"
              valueDisplay={
                config.physics.borderRadius >= 999
                  ? 'Капсула'
                  : `${config.physics.borderRadius}px`
              }
              min={12}
              max={60}
              value={Math.min(60, config.physics.borderRadius)}
              thumbRadius={currentThumbRadius}
              variant="pink"
              onChange={(val) =>
                onChangeConfig((prev) => ({
                  ...prev,
                  physics: {
                    ...prev.physics,
                    borderRadius: val >= 58 ? 999 : val,
                  },
                }))
              }
            />

            <ClaySlider
              id="slider-depth"
              label="Толщина пластилина и фаски"
              valueDisplay={`${config.physics.depth}px`}
              min={4}
              max={26}
              value={config.physics.depth}
              thumbRadius={currentThumbRadius}
              variant="blue"
              onChange={(val) =>
                onChangeConfig((prev) => ({
                  ...prev,
                  physics: { ...prev.physics, depth: val },
                }))
              }
            />

            <ClaySlider
              id="slider-blur"
              label="Мягкость внешней тени"
              valueDisplay={`${config.physics.blurSoftness}px`}
              min={8}
              max={48}
              value={config.physics.blurSoftness}
              thumbRadius={currentThumbRadius}
              variant="mint"
              onChange={(val) =>
                onChangeConfig((prev) => ({
                  ...prev,
                  physics: { ...prev.physics, blurSoftness: val },
                }))
              }
            />

            <ClaySlider
              id="slider-specular"
              label="Яркость верхнего блика"
              valueDisplay={`${Math.round(config.physics.specularIntensity * 100)}%`}
              min={35}
              max={100}
              value={Math.round(config.physics.specularIntensity * 100)}
              thumbRadius={currentThumbRadius}
              variant="lavender"
              onChange={(val) =>
                onChangeConfig((prev) => ({
                  ...prev,
                  physics: {
                    ...prev.physics,
                    specularIntensity: val / 100,
                  },
                }))
              }
            />
          </div>

          {/* 3D Icon & Mascot Picker */}
          <div>
            <span className="text-xs font-extrabold text-[#7B5CE6] block mb-2">
              3D-иконка или маскот
            </span>
            <div className="grid grid-cols-5 gap-2">
              {selectableAssets.map((asset) => {
                const isSelected = config.selectedAssetId === asset.id;
                return (
                  <motion.button
                    key={asset.id}
                    type="button"
                    animate={
                      isSelected
                        ? {
                            scaleX: [1, 1.1, 0.93, 1.03, 1],
                            scaleY: [1, 0.88, 1.035, 0.98, 1],
                            y: [0, 2, -1.5, 0],
                          }
                        : { scaleX: 1, scaleY: 1, y: 0 }
                    }
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() =>
                      onChangeConfig((prev) => ({ ...prev, selectedAssetId: asset.id }))
                    }
                    title={asset.ruName}
                    aria-label={asset.ruName}
                    className={`relative z-10 h-[56px] w-full p-2 rounded-[16px] flex items-center justify-center cursor-pointer overflow-hidden ${
                      isSelected ? 'ring-2 ring-[#5E3DC4]' : ''
                    }`}
                  >
                    <div
                      className="absolute inset-0 rounded-[16px] -z-20 transition-opacity duration-300 clay-card-cream"
                      style={{ opacity: isSelected ? 0 : 1 }}
                    />
                    <div
                      className="absolute inset-0 rounded-[16px] -z-10 transition-opacity duration-300 clay-btn-purple"
                      style={{ opacity: isSelected ? 1 : 0 }}
                    />
                    <img
                      src={resolveClayAssetPath(asset.path)}
                      alt={asset.ruName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 object-contain clay-icon-3d"
                    />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Text & Metric Customization Inputs */}
          <div className="space-y-3 pt-1">
            <span className="text-xs font-extrabold text-[#7B5CE6] block">
              Контент компонента
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="gen-title-input" className="text-[11px] font-extrabold text-[#5A4D73] block mb-1">
                  Заголовок
                </label>
                <input
                  id="gen-title-input"
                  type="text"
                  value={config.titleText}
                  onChange={(e) =>
                    onChangeConfig((prev) => ({ ...prev, titleText: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-[14px] clay-recessed-input text-xs font-bold text-[#2E2540] outline-none"
                />
              </div>
              <div>
                <label htmlFor="gen-subtitle-input" className="text-[11px] font-extrabold text-[#5A4D73] block mb-1">
                  Подзаголовок
                </label>
                <input
                  id="gen-subtitle-input"
                  type="text"
                  value={config.subtitleText}
                  onChange={(e) =>
                    onChangeConfig((prev) => ({ ...prev, subtitleText: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-[14px] clay-recessed-input text-xs font-bold text-[#2E2540] outline-none"
                />
              </div>
              <div>
                <label htmlFor="gen-metric-input" className="text-[11px] font-extrabold text-[#5A4D73] block mb-1">
                  Значение метрики
                </label>
                <input
                  id="gen-metric-input"
                  type="text"
                  value={config.metricValue}
                  onChange={(e) =>
                    onChangeConfig((prev) => ({ ...prev, metricValue: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-[14px] clay-recessed-input text-xs font-bold text-[#2E2540] outline-none"
                />
              </div>
              <div>
                <label htmlFor="gen-cta-input" className="text-[11px] font-extrabold text-[#5A4D73] block mb-1">
                  Текст кнопки
                </label>
                <input
                  id="gen-cta-input"
                  type="text"
                  value={config.ctaLabel}
                  onChange={(e) =>
                    onChangeConfig((prev) => ({ ...prev, ctaLabel: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-[14px] clay-recessed-input text-xs font-bold text-[#2E2540] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Stage + Instant Code Export */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive Stage */}
          <div className="clay-board rounded-[36px] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <h3 className="text-lg font-black text-[#2E2540] font-display">
                Интерактивное превью
              </h3>
              <span className="text-xs font-extrabold text-[#655A7C] px-3 py-1 rounded-full clay-card-cream">
                {activePreset.ruName}
              </span>
            </div>

            {/* Studio Canvas Backdrop */}
            <div
              className="rounded-[28px] p-6 md:p-10 min-h-[360px] flex items-center justify-center relative"
              style={{
                background: materialBackground('linear-gradient(145deg, #F6EFFA 0%, #E5DAFF 50%, #D5C4FA 100%)'),
                boxShadow:
                  materialShadow('inset 3px 6px 14px rgba(96, 70, 166, 0.22), inset -3px -4px 10px rgba(255, 255, 255, 0.8)'),
              }}
            >
              <div className="w-full flex justify-center">
                {REFERENCE_ELEMENTS.some(item=>item.id===config.componentType) && <div className="ref-element-wrapper" style={{background:materialBackground(computed.background),borderRadius:computed.borderRadius,padding:config.physics.padding,boxShadow:materialShadow(computed.boxShadow)}}><ReferenceElement key={config.componentType} kind={config.componentType as ReferenceElementKind} title={config.titleText || undefined}/></div>}
                {/* 0. 3D CLAY AVATAR WITH RECESSED INSET SUBSTRATE & POP-OUT OVERHANG */}
                {config.componentType === 'clay-avatar' && (
                  <div
                    className="w-full max-w-sm flex flex-col items-center text-center gap-3 select-none overflow-visible"
                    style={{
                      background: materialBackground(computed.background),
                      borderRadius: computed.borderRadius,
                      padding: `${config.physics.padding}px`,
                      color: computed.textColor,
                      boxShadow: materialShadow(computed.boxShadow),
                    }}
                  >
                    <ClayAvatar
                      src={resolveClayAssetPath(selectedAsset.path)}
                      alt={selectedAsset.ruName}
                      size="xl"
                      presetId={config.physics.presetId}
                      borderRadiusPx={config.physics.borderRadius}
                      depth={config.physics.depth}
                      badgeText="ONLINE"
                    />
                    <div className="pt-1">
                      <h4 className="text-2xl font-black font-display leading-tight clay-sidebar-text-3d">
                        {config.titleText}
                      </h4>
                      <p className="text-xs font-bold opacity-85 mt-1 max-w-xs">
                        {config.subtitleText}
                      </p>
                    </div>
                  </div>
                )}

                {/* 1. PEEKING / OVERHANGING PAWS CARD WITH 3D AVATAR SUBSTRATE */}
                {config.componentType === 'peeking-card' && (
                  <div className="w-full max-w-lg pb-6 pt-4">
                    <div
                      className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-visible"
                      style={{
                        background: materialBackground(computed.background),
                        borderRadius: computed.borderRadius,
                        padding: `${config.physics.padding}px`,
                        color: computed.textColor,
                        boxShadow: materialShadow(computed.boxShadow),
                      }}
                    >
                      <div className="relative z-30 shrink-0 -mt-8 -mb-7">
                        <ClayAvatar
                          src={resolveClayAssetPath(selectedAsset.path)}
                          alt={selectedAsset.ruName}
                          size="lg"
                          presetId={config.physics.presetId}
                          borderRadiusPx={config.physics.borderRadius}
                          depth={config.physics.depth}
                        />
                      </div>

                      <div className="flex-1 py-2 text-center sm:text-left space-y-3">
                        <h4 className="text-2xl font-black font-display leading-tight clay-text-3d">
                          {config.titleText}
                        </h4>
                        <p className="text-xs font-bold opacity-80 leading-relaxed">
                          {config.subtitleText}
                        </p>
                        <button
                          type="button"
                          className="h-[42px] px-6 rounded-full font-extrabold text-xs text-white clay-btn-purple cursor-pointer"
                        >
                          <span className="clay-sidebar-text-3d">{config.ctaLabel}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. 3D CLAY BOTTOM NAVIGATION DOCK SAMPLE */}
                {config.componentType === 'sticker-notch-nav' && <StickerNotchNavDemo/>}
                {config.componentType === 'bottom-nav' && (
                  <div className="w-full max-w-3xl">
                    <ClayBottomNav
                      variant="embedded-sample"
                      layoutNamespace="generator-preview-nav"
                      activeId={demoBottomNavId}
                      onSelect={setDemoBottomNavId}
                      items={[
                        {
                          id: 'home',
                          label: 'Главная',
                          assetPath: '/assets/aistudio/11111_21446bf1.png',
                          badgeColor: '#FFF3C4',
                        },
                        {
                          id: 'upload',
                          label: 'Облако',
                          assetPath: '/assets/aistudio/cloud_upload_bc9d95e9.png',
                          badgeColor: '#F2ECFF',
                        },
                        {
                          id: 'magic',
                          label: 'Магия',
                          assetPath: '/assets/aistudio/icon_magic_wand_7de955e9.png',
                          badgeColor: '#FFF9E6',
                        },
                        {
                          id: 'chat',
                          label: 'Чат',
                          assetPath: '/assets/aistudio/icon_speech_bubbles_62f65106.png',
                          badgeColor: '#EEF5FF',
                        },
                      ]}
                    />
                  </div>
                )}

                {/* 3. 3D CLAY SLIDERS / PROGRESS BARS SAMPLE */}
                {config.componentType === 'clay-slider' && (
                  <div
                    className="w-full max-w-md space-y-5"
                    style={{
                      background: materialBackground('linear-gradient(145deg, #FCEFF3 0%, #EFE8FA 100%)'),
                      borderRadius: computed.borderRadius,
                      padding: `${config.physics.padding}px`,
                      color: computed.textColor,
                      boxShadow: materialShadow(computed.boxShadow),
                    }}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-extrabold text-[#4A3B6E]">
                        <span>Форма шариков</span>
                        <span className="font-mono">{currentThumbRadius}px</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-[14px] clay-recessed-input">
                        {THUMB_SHAPE_PRESETS.map((preset) => (
                          <ClayInPlaceTabButton
                            key={preset.radius}
                            label={preset.label}
                            active={currentThumbRadius === preset.radius}
                            onClick={() => handleThumbRadiusChange(preset.radius)}
                            heightClass="h-[32px]"
                            radiusClass="rounded-[10px]"
                            textClass="text-[11px]"
                          />
                        ))}
                      </div>
                    </div>

                    <ClaySlider
                      id="demo-pink-slider"
                      label="Розовый ползунок"
                      valueDisplay={`${demoSliderPink}%`}
                      min={0}
                      max={100}
                      value={demoSliderPink}
                      thumbRadius={currentThumbRadius}
                      variant="pink"
                      onChange={setDemoSliderPink}
                    />
                    <ClaySlider
                      id="demo-blue-slider"
                      label="Голубой ползунок"
                      valueDisplay={`${demoSliderBlue}%`}
                      min={0}
                      max={100}
                      value={demoSliderBlue}
                      thumbRadius={currentThumbRadius}
                      variant="blue"
                      onChange={setDemoSliderBlue}
                    />
                    <ClaySlider
                      id="demo-mint-slider"
                      label="Мятный ползунок"
                      valueDisplay={`${demoSliderMint}%`}
                      min={0}
                      max={100}
                      value={demoSliderMint}
                      thumbRadius={currentThumbRadius}
                      variant="mint"
                      onChange={setDemoSliderMint}
                    />
                  </div>
                )}

                {/* 3B. 3D CLAY TOGGLE SWITCH & DEPRESSING BUTTON SAMPLE */}
                {config.componentType === 'clay-toggle' && (
                  <div
                    className="w-full max-w-lg space-y-3.5"
                    style={{
                      background: materialBackground(computed.background),
                      borderRadius: computed.borderRadius,
                      padding: `${config.physics.padding}px`,
                      color: computed.textColor,
                      boxShadow: materialShadow(computed.boxShadow),
                    }}
                  >
                    <ClayToggle
                      id="gen-toggle-mint"
                      checked={toggleMintOn}
                      onChange={setToggleMintOn}
                      label="Мятный 3D-тумблер"
                      description="Плавный ход шарика во вдавленном желобе"
                      accent="mint"
                      mode="switch-track"
                    />
                    <ClayToggle
                      id="gen-toggle-purple"
                      checked={togglePurpleOn}
                      onChange={setTogglePurpleOn}
                      label="Лавандовый 3D-переключатель"
                      description="Смена оттенка и внутренней светотени при включении"
                      accent="purple"
                      mode="switch-track"
                    />
                    <ClayToggle
                      id="gen-toggle-push"
                      checked={toggleButtonPressed}
                      onChange={setToggleButtonPressed}
                      label="Физическая 3D-кнопка с фиксацией"
                      description="Вдавливается в гнездо с сохранением габаритов"
                      accent="rose"
                      mode="push-button"
                      iconSrc={selectedAsset.path}
                    />
                  </div>
                )}

                {/* 4. KPI STAT CARD — Crisp 3D Square Tile & Dropped 3D Icon */}
                {config.componentType === 'kpi-card' && (
                  <div
                    className="w-full max-w-[240px] select-none"
                    style={{
                      background: materialBackground(computed.background),
                      borderRadius: computed.borderRadius,
                      padding: `${config.physics.padding}px`,
                      color: computed.textColor,
                      boxShadow: materialShadow(computed.boxShadow),
                    }}
                  >
                    <div
                      className="w-14 h-14 flex items-center justify-center mb-4"
                      style={{
                        background: materialBackground(`linear-gradient(145deg, ${activePreset.badgeBgHex} 0%, ${activePreset.innerDarkHex} 100%)`),
                        borderRadius: `${Math.min(18, computed.innerChildRadius)}px`,
                        boxShadow: materialShadow(`4px 10px 18px -3px rgba(${activePreset.outerShadowRgb}, 0.42), 2px 4px 8px rgba(${activePreset.outerShadowRgb}, 0.24), inset 2.5px 3px 5px rgba(255,255,255,0.78), inset -3px -4px 7px rgba(0,0,0,0.2)`),
                      }}
                    >
                      <img
                        src={resolveClayAssetPath(selectedAsset.path)}
                        alt={selectedAsset.ruName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-contain clay-icon-3d"
                      />
                    </div>
                    <div className="text-sm font-bold opacity-80">{config.titleText}</div>
                    <div className="text-3xl font-black font-display tracking-tight my-1 tabular-nums clay-text-3d">
                      {config.metricValue}
                    </div>
                    <div className="text-xs font-extrabold text-[#2A8568]">{config.metricDelta}</div>
                  </div>
                )}

                {/* 5. ICON INPUT */}
                {config.componentType === 'icon-input' && (
                  <div className="w-full max-w-md">
                    <label className="relative flex items-center w-full cursor-text">
                      <div
                        className="w-full flex items-center pl-16 pr-5 py-4"
                        style={{
                          background: materialBackground(computed.background),
                          borderRadius: computed.borderRadius,
                          color: computed.textColor,
                          boxShadow: materialShadow(computed.boxShadow),
                        }}
                      >
                        <input
                          type="text"
                          value={inputDemoValue}
                          onChange={(e) => setInputDemoValue(e.target.value)}
                          placeholder={config.titleText}
                          className="w-full bg-transparent border-none outline-none text-sm font-extrabold placeholder:opacity-60"
                          style={{ color: computed.textColor }}
                        />
                      </div>
                      <div
                        className="absolute left-1.5 w-12 h-12 rounded-full flex items-center justify-center pointer-events-none"
                        style={{
                          background: materialBackground('linear-gradient(145deg, #B298FA 0%, #8C6DE6 100%)'),
                          boxShadow:
                            materialShadow('3px 8px 14px -2px rgba(98, 66, 189, 0.48), inset 2px 3px 5px rgba(255,255,255,0.75), inset -3px -4px 6px rgba(79, 49, 166, 0.72)'),
                        }}
                      >
                        <img
                          src={resolveClayAssetPath(selectedAsset.path)}
                          alt={selectedAsset.ruName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 object-contain clay-icon-3d"
                        />
                      </div>
                    </label>
                  </div>
                )}

                {/* 6. BAR CHART CARD */}
                {config.componentType === 'bar-chart-card' && (
                  <div
                    className="w-full max-w-md"
                    style={{
                      background: materialBackground(computed.background),
                      borderRadius: computed.borderRadius,
                      padding: `${config.physics.padding}px`,
                      color: computed.textColor,
                      boxShadow: materialShadow(computed.boxShadow),
                    }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={resolveClayAssetPath(selectedAsset.path)}
                          alt={selectedAsset.ruName}
                          className="w-7 h-7 object-contain clay-icon-3d"
                        />
                        <h4 className="text-base font-black font-display">{config.titleText}</h4>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold clay-recessed-input">
                        This Week ▾
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-3 items-end h-36 pt-4 px-1">
                      {[
                        { day: 'Mon', h: '58%', grad: 'linear-gradient(145deg, #B79FFA 0%, #9476EB 100%)', shadow: '#6E4FD1' },
                        { day: 'Tue', h: '76%', grad: 'linear-gradient(145deg, #F9B8C6 0%, #EB8FA3 100%)', shadow: '#C9697E' },
                        { day: 'Wed', h: '64%', grad: 'linear-gradient(145deg, #F7B28B 0%, #E68A5C 100%)', shadow: '#C2673A' },
                        { day: 'Thu', h: '92%', grad: 'linear-gradient(145deg, #FCE394 0%, #F2C45A 100%)', shadow: '#CCA035' },
                        { day: 'Fri', h: '60%', grad: 'linear-gradient(145deg, #ACE094 0%, #86C46B 100%)', shadow: '#5FA344' },
                        { day: 'Sat', h: '80%', grad: 'linear-gradient(145deg, #9AC8F7 0%, #73A8E6 100%)', shadow: '#4B82C4' },
                        { day: 'Sun', h: '68%', grad: 'linear-gradient(145deg, #B79FFA 0%, #9476EB 100%)', shadow: '#6E4FD1' },
                      ].map((bar, idx) => (
                        <button
                          key={bar.day}
                          type="button"
                          onClick={() => setActiveBarIndex(idx)}
                          className="flex flex-col items-center h-full justify-end group focus:outline-none cursor-pointer"
                        >
                          <div className="w-full h-full rounded-full p-1 clay-recessed-input flex items-end">
                            <div
                              className={`w-full rounded-full ${
                                activeBarIndex === idx ? 'ring-2 ring-[#6D4CE3]' : ''
                              }`}
                              style={{
                                height: bar.h,
                                background: materialBackground(bar.grad),
                                boxShadow: materialShadow(`2px 6px 10px -2px rgba(90,70,130,0.3), inset 2px 3px 4px rgba(255,255,255,0.8), inset -2px -4px 6px ${bar.shadow}`),
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-extrabold mt-2 opacity-75">{bar.day}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. DONUT CHART CARD */}
                {config.componentType === 'donut-chart-card' && (
                  <div
                    className="w-full max-w-md"
                    style={{
                      background: materialBackground(computed.background),
                      borderRadius: computed.borderRadius,
                      padding: `${config.physics.padding}px`,
                      color: computed.textColor,
                      boxShadow: materialShadow(computed.boxShadow),
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-black font-display">{config.titleText}</h4>
                      <img
                        src={resolveClayAssetPath(selectedAsset.path)}
                        alt={selectedAsset.ruName}
                        className="w-7 h-7 object-contain clay-icon-3d"
                      />
                    </div>
                    <div className="flex items-center justify-around gap-6">
                      <div
                        className="w-36 h-36 rounded-full flex items-center justify-center relative shrink-0"
                        style={{
                          background:
                            materialBackground('conic-gradient(#9D82F2 0% 45%, #F294A8 45% 70%, #F7CE68 70% 85%, #95D17B 85% 95%, #79B4EC 95% 100%)'),
                          boxShadow:
                            materialShadow('6px 14px 24px -4px rgba(95, 75, 140, 0.34), inset 4px 5px 8px rgba(255, 255, 255, 0.8), inset -4px -7px 10px rgba(70, 50, 120, 0.38)'),
                        }}
                      >
                        <div
                          className="rounded-full flex items-center justify-center font-mono text-xs font-black"
                          style={{
                            width: '72px',
                            height: '72px',
                            background: materialBackground(computed.background),
                            boxShadow:
                              materialShadow('inset 3px 5px 8px rgba(95, 75, 140, 0.28), 0 3px 6px rgba(255, 255, 255, 0.9)'),
                          }}
                        >
                          100%
                        </div>
                      </div>

                      <div className="space-y-2 text-xs font-extrabold w-full max-w-[150px]">
                        {[
                          { label: 'Pop', pct: '45%', color: '#9D82F2' },
                          { label: 'Lo-fi', pct: '25%', color: '#F294A8' },
                          { label: 'Hip Hop', pct: '15%', color: '#F7CE68' },
                          { label: 'Rock', pct: '10%', color: '#95D17B' },
                          { label: 'Other', pct: '5%', color: '#79B4EC' },
                        ].map((g) => (
                          <div key={g.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full inline-block"
                                style={{
                                  background: materialBackground(g.color),
                                  boxShadow:
                                    materialShadow('1px 2px 4px rgba(0,0,0,0.18), inset 1px 1.5px 2px rgba(255,255,255,0.85), inset -1px -2px 3px rgba(0,0,0,0.22)'),
                                }}
                              />
                              <span>{g.label}</span>
                            </div>
                            <span className="font-mono tabular-nums opacity-80">{g.pct}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(config.componentType === 'promo-banner' ||
                  config.componentType === 'track-list-card' ||
                  config.componentType === 'pill-button') && (
                  <div
                    className="w-full max-w-md flex items-center justify-between gap-4"
                    style={{
                      background: materialBackground(computed.background),
                      borderRadius: computed.borderRadius,
                      padding: `${config.physics.padding}px`,
                      color: computed.textColor,
                      boxShadow: materialShadow(computed.boxShadow),
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={resolveClayAssetPath(selectedAsset.path)}
                        alt={selectedAsset.ruName}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-contain clay-icon-3d shrink-0"
                      />
                      <div>
                        <h4 className="text-lg font-black font-display">{config.titleText}</h4>
                        <p className="text-xs font-bold opacity-80 mt-0.5">{config.subtitleText}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="h-[42px] px-5 rounded-full font-extrabold text-xs text-white clay-btn-purple shrink-0 whitespace-nowrap cursor-pointer"
                    >
                      <span className="clay-sidebar-text-3d">{config.ctaLabel}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Code Output Panel */}
          <div className="clay-board rounded-[34px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-[18px] clay-recessed-input w-full sm:w-[430px] relative">
                {(
                  [
                    { id: 'react', label: 'React + JSX' },
                    { id: 'css', label: 'CSS Стили' },
                    { id: 'tokens', label: 'JSON Токены' },
                  ] as const
                ).map((tab) => (
                  <ClayInPlaceTabButton
                    key={tab.id}
                    label={tab.label}
                    active={codeTab === tab.id}
                    onClick={() => setCodeTab(tab.id)}
                    heightClass="h-[36px]"
                    radiusClass="rounded-[14px]"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="w-[176px] h-[40px] justify-center rounded-full text-xs font-extrabold text-white clay-btn-purple flex items-center gap-2 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 clay-icon-3d" /> : <Copy className="w-4 h-4 clay-icon-3d" />}
                <span className="clay-sidebar-text-3d">
                  {copied ? 'Код скопирован!' : 'Скопировать код'}
                </span>
              </button>
            </div>

            <pre className="p-5 rounded-[24px] bg-[#231B33] text-[#F4EEFF] font-mono text-xs overflow-x-auto leading-relaxed max-h-[300px] shadow-inner">
              <code>{generatedCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ComponentGenerator;
