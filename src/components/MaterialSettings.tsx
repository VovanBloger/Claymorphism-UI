import React, { createContext, useCallback, useContext, useId, useLayoutEffect, useMemo, useState } from 'react';
import { RotateCcw, Sun } from 'lucide-react';
import { MAX_CLAY_TEXTURE_INTENSITY } from '../utils/clayTexture';
import { ClayRelief } from './ClayRelief';
import {
  CLAY_LIGHT_DIRECTIONS,
  DEFAULT_MATERIAL_SETTINGS,
  getBrowserMaterialStorage,
  getMaterialVariables,
  MaterialSettings,
  normalizeMaterialSettings,
  readMaterialSettings,
  saveMaterialSettings,
} from '../utils/materialSettings';

interface MaterialContextValue {
  settings: MaterialSettings;
  update: (patch: Partial<MaterialSettings>) => void;
  reset: () => void;
  saved: boolean;
}

const MaterialContext = createContext<MaterialContextValue | null>(null);

export function MaterialProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(() => readMaterialSettings(getBrowserMaterialStorage()));
  const [saved, setSaved] = useState(false);
  const update = useCallback((patch: Partial<MaterialSettings>) => {
    setSettings(previous => normalizeMaterialSettings({ ...previous, ...patch }));
  }, []);
  const reset = useCallback(() => setSettings({ ...DEFAULT_MATERIAL_SETTINGS }), []);

  useLayoutEffect(() => {
    for (const [name, value] of Object.entries(getMaterialVariables(settings))) {
      document.documentElement.style.setProperty(name, value);
    }
    document.documentElement.dataset.clayLight = settings.light;
    window.dispatchEvent(new CustomEvent('clay-material-change'));
    setSaved(saveMaterialSettings(settings, getBrowserMaterialStorage()));
  }, [settings]);

  const value = useMemo(() => ({ settings, update, reset, saved }), [settings, update, reset, saved]);
  return <MaterialContext.Provider value={value}><ClayRelief />{children}</MaterialContext.Provider>;
}

export function useMaterialSettings() {
  const value = useContext(MaterialContext);
  if (!value) throw new Error('Material settings require MaterialProvider.');
  return value;
}

export function MaterialSettingsPanel() {
  const { settings, update, reset, saved } = useMaterialSettings();
  const id = useId();
  const sliders = [
    { key: 'volume' as const, label: 'Объём', min: 0.6, max: 1.5, step: .05, displayScale: 100, low: 'Деликатный', high: 'Пухлый' },
    { key: 'shadowSoftness' as const, label: 'Мягкость теней', min: 0.6, max: 1.5, step: .05, displayScale: 100, low: 'Собранные', high: 'Рассеянные' },
    { key: 'shadowStrength' as const, label: 'Сила теней', min: 0.5, max: 1.5, step: .05, displayScale: 100, low: 'Лёгкие', high: 'Выразительные' },
    { key: 'textureIntensity' as const, label: 'Фактура', min: 0, max: MAX_CLAY_TEXTURE_INTENSITY, step: .005, displayScale: 100 / MAX_CLAY_TEXTURE_INTENSITY, low: 'Гладкая', high: 'Заметная' },
  ];
  return <section className="material-settings clay-card-cream rounded-[30px] p-6 sm:p-8" aria-labelledby={`${id}-title`}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <span className="text-xs font-extrabold tracking-wider text-[#8C6AAB] flex items-center gap-2"><Sun size={16} aria-hidden="true"/> ОБЩИЙ МАТЕРИАЛ СТУДИИ</span>
        <h2 id={`${id}-title`} className="text-2xl font-black mt-3">Один свет. Общий объём.</h2>
        <p className="mt-3 text-sm text-[#796A88] leading-relaxed max-w-xl">Настройте глубину, фактуру, мягкость теней и направление света для всех разделов. Кнопки и карточки будут выглядеть частью одного мира.</p>
      </div>
      <button type="button" onClick={reset} className="ref-surface cream material-reset inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7151a9] motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 active:scale-[.97]"><RotateCcw size={14} aria-hidden="true"/>Вернуть эталон</button>
    </div>

    <div className="grid min-[640px]:grid-cols-2 gap-6 mt-7">
      <fieldset className="min-w-0">
        <legend className="text-sm font-extrabold text-[#4B365F] mb-3">Откуда падает свет</legend>
        <div className="grid grid-cols-2 gap-3">
          {CLAY_LIGHT_DIRECTIONS.map(direction => <button
            type="button"
            key={direction.value}
            aria-pressed={settings.light === direction.value}
            onClick={() => update({ light: direction.value })}
            className={`ref-surface material-light-option rounded-[20px] px-3 py-4 text-xs font-extrabold flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7151a9] motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 active:scale-[.97] ${settings.light === direction.value ? 'lavender' : 'cream'}`}
          ><span className="text-xl leading-none" aria-hidden="true">{direction.arrow}</span>{direction.label}</button>)}
        </div>
      </fieldset>
      <div className="space-y-5 min-w-0">
        {sliders.map(({ key, label, min, max, step, displayScale, low, high }) => <label key={key} htmlFor={`${id}-${key}`} className="material-range block">
          <span className="flex justify-between gap-3 text-xs font-extrabold text-[#4B365F]"><span>{label}</span><output htmlFor={`${id}-${key}`} className="text-[#9B79BF] tabular-nums">{Math.round(settings[key] * displayScale)}%</output></span>
          <input id={`${id}-${key}`} aria-label={label} aria-valuetext={`${Math.round(settings[key] * displayScale)} процентов`} type="range" min={min} max={max} step={step} value={settings[key]} onChange={event => update({ [key]: Number(event.target.value) })} className="w-full h-2.5 mt-3 mb-1 rounded-full accent-[#A688D5] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7151a9]"/>
          <span className="flex justify-between gap-3 text-[10px] text-[#A18DAC]"><span>{low}</span><span>{high}</span></span>
        </label>)}
      </div>
    </div>
    <p className="text-xs text-[#8B799C] mt-6 leading-relaxed">Свет меняет поверхности и внешние тени. Блики внутри PNG-персонажей запечены в изображениях.</p>
    <p className="text-[10px] text-[#A18DAC] mt-2">{saved ? 'Настройки сохраняются в этом браузере.' : 'Настройки действуют до обновления страницы.'}</p>
  </section>;
}
