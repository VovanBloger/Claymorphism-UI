import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Palette,
  Sparkles,
  Sun,
  Check,
  Copy,
  Maximize2,
  Eye,
  Activity,
} from 'lucide-react';
import { CLAY_COLOR_PRESETS, ClayColorPresetId, UPLOADED_CLAY_ASSETS, resolveClayAssetPath } from '../utils/clayEngine';

interface DesignSystemGuideProps {
  onSelectPresetForGenerator?: (presetId: ClayColorPresetId) => void;
}

export function DesignSystemGuide({ onSelectPresetForGenerator }: DesignSystemGuideProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [explodedView, setExplodedView] = useState<boolean>(true);

  const copyColor = (hex: string, presetId?: ClayColorPresetId) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1600);
    if (presetId && onSelectPresetForGenerator) {
      onSelectPresetForGenerator(presetId);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <section className="clay-card-cream rounded-[30px] p-6 sm:p-8">
        <span className="text-xs font-extrabold tracking-wider text-[#8C6AAB]">КАЛИБРОВКА ПО РЕФЕРЕНСАМ · 14.11.2026</span>
        <h2 className="text-2xl font-black mt-3 mb-5">Мягкий объём, спокойное движение</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-sm">
          <div><b>Свет и тень</b><p className="mt-2 text-[#796A88] leading-relaxed">Один источник сверху слева. Цветная тень 3 × 7 px, контактный слой 0 × 2 px, белая верхняя кромка и нижняя фаска 4–5 px. Тень короткая: элемент лежит на поверхности.</p></div>
          <div><b>Геометрия</b><p className="mt-2 text-[#796A88] leading-relaxed">Карточки 26–48 px, кнопки 22–30 px или капсула. Большие цветовые плоскости, округлая Nunito и тёмные чернильные иконки. Белый фон сохраняет воздух между объектами.</p></div>
          <div><b>Микродвижение</b><p className="mt-2 text-[#796A88] leading-relaxed">Hover: подъём 2 px за 220 ms. Press: вниз 2 px, scaleX 1.025 / scaleY 0.965. Тумблер: 340 ms. Сердце и колокольчик реагируют один раз на действие, без постоянной пульсации.</p></div>
          <div><b>Доступность</b><p className="mt-2 text-[#796A88] leading-relaxed">Состояние передаётся текстом и aria-атрибутами. Видимый focus-ring, клавиатура и нативные range. При prefers-reduced-motion анимации отключаются, конечные состояния сохраняются.</p></div>
        </div>
        <p className="text-xs mt-5 text-[#8B799C]">Новые элементы: статусы, списки действий, календарь, товар, тренировка, кольца активности и фильтры. React-экспорт требует react и lucide-react; CSS экспортируется соседней вкладкой. Палитра и физика генератора управляют внешней подложкой новых составных элементов; внутренние детали сохраняют референсные цвета.</p>
      </section>
      <section className="clay-card-cream rounded-[30px] p-6 sm:p-8 space-y-5">
        <div><span className="text-xs font-extrabold tracking-wider text-[#8C6AAB]">КОМПОНЕНТ · CLAY SCROLLBAR</span><h2 className="text-2xl font-black mt-3">Прокрутка с мягким рельефом</h2><p className="text-sm text-[#796A88] mt-2 leading-relaxed">Сиреневый бегунок с верхним бликом движется внутри светлого вдавленного трека. Прокрутите пример колёсиком, пальцем или стрелками после фокуса.</p></div>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div role="region" aria-label="Демонстрация Clay-прокрутки" tabIndex={0} className="clay-scroll-demo">
            {['Dashboard','Генератор UI','Дизайн-система','Экран входа','Пак 3D-иконок и маскотов','Библиотека'].map((label,i)=><div key={label} className="clay-card-lavender rounded-[18px] px-4 py-4"><span className="text-[10px] font-black text-[#8D70A8]">0{i+1}</span><h3 className="text-sm font-extrabold text-[#413054] mt-1">{label}</h3><p className="text-xs text-[#7E688E] mt-1">Мягкая поверхность и единый источник света.</p></div>)}
          </div>
          <div className="text-sm text-[#796A88] leading-relaxed space-y-3"><p><b className="text-[#413054]">Геометрия:</b> канал 14 px, бегунок 8 px с отступом 3 px, закругления 999 px. Минимальная длина бегунка 44 px.</p><p><b className="text-[#413054]">Материал:</b> трек #F1E8F8, бегунок #B598DC; светлая верхняя кромка и затемнённая нижняя фаска. Hover и нажатие слегка затемняют материал.</p><p><b className="text-[#413054]">Поведение:</b> нативная прокрутка сохраняет клавиатуру, touch и системную инерцию. Firefox получает однотонный вариант той же палитры. В режиме высокой контрастности используются системные цвета.</p><p>В компактном боковом меню прокрутки нет на обычных размерах окна. Этот стиль применяется к длинным страницам, коду генератора и прокручиваемым областям.</p></div>
        </div>
        <pre className="rounded-[18px] bg-[#F1EAF6] p-4 overflow-auto text-xs text-[#645079]"><code>{`:root {
  --clay-scroll-size: 14px;
  --clay-scroll-track: #F1E8F8;
  --clay-scroll-thumb: #B598DC;
}
/* Градиенты, фаски и состояния — в src/index.css. */
/* Реальная нативная полоса, без подмены отдельным div. */`}</code></pre>
      </section>



      {/* HERO BANNER */}
      <div className="clay-card-lavender rounded-[38px] p-7 lg:p-10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full clay-card-cream text-xs font-extrabold text-[#6E52C7] tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#8E6FE8] clay-icon-3d" />
              Анатомия стиля · Soft 3D Claymorphism
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-[#2D264B] leading-[1.15]">
              Тактильный 3D-пластилин: объём, свет и многослойность
            </h1>
            <p className="text-[#5C537A] text-base leading-relaxed font-semibold">
              Каждый интерфейс строится как физический макет из матового полимерного пластилина с мягким верхним светом, пухлыми фасками и цветными контактными тенями.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { label: 'Свет', value: '135° сверху-слева', sub: 'Двойной внутренний блик' },
                { label: 'Скругления', value: '24px — 44px', sub: 'Вложенная концентричность' },
                { label: 'Тени', value: '4 слоя', sub: 'Цветные + направленные' },
                { label: 'Многослойность', value: '5 уровней Z', sub: 'От желоба до 3D-маскота' },
              ].map((stat, idx) => (
                <div key={idx} className="clay-card-cream rounded-[22px] p-3.5">
                  <div className="text-[11px] font-bold text-[#8E6FE8] uppercase tracking-wider">{stat.label}</div>
                  <div className="text-base font-black text-[#2D264B] mt-0.5">{stat.value}</div>
                  <div className="text-[11px] font-semibold text-[#7E749C] mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Hero Showcase Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="clay-card-cream rounded-[32px] p-6 w-full max-w-md relative">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#8E6FE8]">
                    Формула объёма
                  </span>
                  <h3 className="text-lg font-black text-[#2D264B]">4 слоя пластилиновой тени</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setExplodedView(!explodedView)}
                  className="clay-btn-purple w-[196px] h-[36px] justify-center rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 clay-icon-3d shrink-0" />
                  <span className="clay-sidebar-text-3d">
                    {explodedView ? 'Собрать слои воедино' : 'Разложить на 4 слоя'}
                  </span>
                </button>
              </div>

              {/* Interactive Exploded Layer Stack that genuinely converges into 1 card when assembled */}
              <motion.div
                animate={{ height: explodedView ? 268 : 108 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="relative flex items-center justify-center px-2"
              >
                {/* Layer 4: Outer Ambient & Contact Shadow (Bottom-most) */}
                <motion.div
                  animate={{
                    y: explodedView ? 88 : 0,
                    scale: explodedView ? 0.98 : 1,
                    opacity: explodedView ? 1 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="w-full rounded-[22px] p-3.5 border border-[#8E6FE8]/30 bg-[#DCD0FF]/65 text-xs font-bold text-[#4D3598] flex items-center justify-between"
                  style={{
                    position: 'absolute',
                    zIndex: 10,
                    boxShadow: '6px 18px 34px rgba(104, 79, 179, 0.28), 3px 8px 14px rgba(104, 79, 179, 0.16)',
                    pointerEvents: explodedView ? 'auto' : 'none',
                  }}
                >
                  <span>4. Направленная внешняя 3D-тень</span>
                  <span className="font-mono text-[11px] bg-white/75 px-2.5 py-0.5 rounded-full font-extrabold">
                    Слой 4
                  </span>
                </motion.div>

                {/* Layer 3: Inner Bottom Bevel */}
                <motion.div
                  animate={{
                    y: explodedView ? 30 : 0,
                    scale: explodedView ? 0.97 : 1,
                    opacity: explodedView ? 1 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="w-full rounded-[22px] p-3.5 bg-[#E7DCFF] text-xs font-bold text-[#4D3598] flex items-center justify-between"
                  style={{
                    position: 'absolute',
                    zIndex: 20,
                    boxShadow: 'inset -4px -8px 14px rgba(114, 84, 198, 0.38)',
                    pointerEvents: explodedView ? 'auto' : 'none',
                  }}
                >
                  <span>3. Нижняя внутренняя фаска</span>
                  <span className="font-mono text-[11px] bg-white/75 px-2.5 py-0.5 rounded-full font-extrabold">
                    Слой 3
                  </span>
                </motion.div>

                {/* Layer 2: Inner Top-Left Specular Rim */}
                <motion.div
                  animate={{
                    y: explodedView ? -28 : 0,
                    scale: explodedView ? 0.99 : 1,
                    opacity: explodedView ? 1 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="w-full rounded-[22px] p-3.5 bg-[#F4EEFF] text-xs font-bold text-[#4D3598] flex items-center justify-between"
                  style={{
                    position: 'absolute',
                    zIndex: 30,
                    boxShadow: 'inset 4px 5px 10px rgba(255, 255, 255, 0.96)',
                    pointerEvents: explodedView ? 'auto' : 'none',
                  }}
                >
                  <span>2. Верхний световой блик 135°</span>
                  <span className="font-mono text-[11px] bg-white/80 px-2.5 py-0.5 rounded-full font-extrabold">
                    Слой 2
                  </span>
                </motion.div>

                {/* Layer 1: Unified / Top Sculpted Clay Card */}
                <motion.div
                  animate={{
                    y: explodedView ? -86 : 0,
                    scale: 1,
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="w-full rounded-[24px] p-4 flex items-center justify-between text-white"
                  style={{
                    position: 'absolute',
                    zIndex: 40,
                    background: 'linear-gradient(145deg, #B59BFF 0%, #8E6FE8 52%, #7554D3 100%)',
                    boxShadow: explodedView
                      ? '0 8px 18px rgba(117, 84, 211, 0.25), inset 2px 3px 6px rgba(255,255,255,0.45)'
                      : '6px 18px 34px rgba(96, 68, 175, 0.36), 3px 8px 14px rgba(96, 68, 175, 0.22), inset 3px 4px 8px rgba(255, 255, 255, 0.56), inset -4px -7px 14px rgba(68, 42, 146, 0.52)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-[15px] bg-[#FAF4EC] flex items-center justify-center shrink-0"
                      style={{
                        boxShadow:
                          '3px 6px 12px rgba(56, 33, 120, 0.32), inset 2px 2px 4px rgba(255, 255, 255, 0.98), inset -2px -3px 5px rgba(212, 198, 180, 0.65)',
                      }}
                    >
                      <img src={resolveClayAssetPath(UPLOADED_CLAY_ASSETS[0].path)} alt="Star" className="w-8 h-8 object-contain clay-icon-3d" />
                    </div>
                    <div>
                      <div className="text-sm font-black tracking-tight clay-sidebar-text-3d">
                        {explodedView ? '1. Базовый 3D-градиент' : 'Собранная 3D Clay-карточка'}
                      </div>
                      <div className="text-[11px] text-white/90 font-semibold">
                        {explodedView
                          ? 'Мягкий переход света 145°'
                          : 'Все 4 слоя света, фаски и тени работают одновременно'}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] bg-white/20 px-2.5 py-1 rounded-full font-extrabold shrink-0">
                    {explodedView ? 'Слой 1' : '4 в 1'}
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: COLOR SYSTEM */}
      <section className="clay-board rounded-[38px] p-7 lg:p-9 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#8E6FE8] font-extrabold text-xs uppercase tracking-wider">
              <Palette className="w-4 h-4 clay-icon-3d" />
              Раздел 1 · Цветовая палитра
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-[#2D264B] mt-1">
              Пастельная температура и цветные тени
            </h2>
          </div>
          <p className="text-xs font-bold text-[#6E648B]">
            Нажмите на карточку цвета, чтобы скопировать HEX
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(CLAY_COLOR_PRESETS).map(([key, preset]) => (
            <div
              key={key}
              onClick={() => copyColor(preset.gradEnd)}
              className="clay-card-cream rounded-[28px] p-4 cursor-pointer group transition-transform hover:-translate-y-1"
            >
              <div
                className="h-24 rounded-[20px] mb-3.5 flex items-end justify-between p-3 relative overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, ${preset.gradStart} 0%, ${preset.gradEnd} 100%)`,
                  boxShadow: `
                    4px 10px 20px rgba(${preset.outerShadowRgb}, 0.28),
                    inset 3px 3px 6px rgba(255,255,255,0.78),
                    inset -3px -5px 9px ${preset.innerDarkHex}
                  `,
                }}
              >
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-full backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.82)',
                    color: '#2D264B',
                  }}
                >
                  {preset.gradEnd}
                </span>
                <div className="w-7 h-7 rounded-full bg-white/85 flex items-center justify-center text-[#2D264B] shadow-sm">
                  {copiedHex === preset.gradEnd ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                  )}
                </div>
              </div>

              <div className="font-extrabold text-sm text-[#2D264B]">{preset.ruName}</div>
              <div className="mt-2 pt-2 border-t border-[#E8DEC8]/70 flex items-center justify-between text-[11px] font-mono text-[#7E749C]">
                <span>Блик: {preset.gradStart}</span>
                <span>Фаска: {preset.innerDarkHex}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: SHADOWS, LIGHTING & BORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 4-Layer Shadow Anatomy */}
        <div className="lg:col-span-7 clay-board rounded-[38px] p-7 space-y-5">
          <div className="flex items-center gap-2 text-[#8E6FE8] font-extrabold text-xs uppercase tracking-wider">
            <Sun className="w-4 h-4 clay-icon-3d" />
            Раздел 2 · Система теней и освещения
          </div>
          <h2 className="text-2xl font-black text-[#2D264B]">
            Выпуклый и вдавленный 3D-рельеф
          </h2>
          <p className="text-sm text-[#5C537A] font-semibold leading-relaxed">
            Обычный <code className="bg-[#EFE6FA] px-1.5 py-0.5 rounded text-[#6E52C7]">box-shadow</code> даёт плоскую бумажную карточку. Чтобы получить <strong>пухлый пластилин</strong>, мы комбинируем 2 внешних направленных слоя и 2 внутренних скоса:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Convex Card */}
            <div className="clay-card-lavender rounded-[26px] p-5 space-y-2.5">
              <div className="inline-block px-3 py-1 rounded-full bg-white/80 text-[#6E52C7] text-xs font-black">
                Выпуклый элемент
              </div>
              <h3 className="text-base font-black text-[#2D264B]">Карточки, кнопки, 3D-бейджи</h3>
              <ul className="text-xs text-[#4D446A] space-y-1.5 font-semibold">
                <li>• <strong>Внешняя рассеянная:</strong> 6px 18px 34px</li>
                <li>• <strong>Контактная:</strong> 3px 7px 14px</li>
                <li>• <strong>Верхний блик:</strong> inset 3px 4px 7px #FFF</li>
                <li>• <strong>Нижняя фаска:</strong> inset -3px -6px 11px</li>
              </ul>
            </div>

            {/* Concave / Recessed Well */}
            <div className="clay-recessed-input rounded-[26px] p-5 space-y-2.5">
              <div className="inline-block px-3 py-1 rounded-full bg-[#EAE0F8] text-[#6E52C7] text-xs font-black">
                Вдавленный желоб
              </div>
              <h3 className="text-base font-black text-[#2D264B]">Поля поиска, инпуты, треки</h3>
              <ul className="text-xs text-[#5C537A] space-y-1.5 font-semibold">
                <li>• <strong>Тень сверху-слева:</strong> inset 4px 5px 10px</li>
                <li>• <strong>Свет снизу-справа:</strong> inset -3px -3px 8px #FFF</li>
                <li>• Создаёт ощущение вырезанного в кремовой плите углубления</li>
              </ul>
            </div>
          </div>

          <div className="clay-card-cream rounded-[24px] p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-block px-3 py-1 rounded-full bg-[#EFE6FA] text-[#6E52C7] text-xs font-black">
                Анти-контур · SVG-трубки и кольца
              </span>
              <span className="text-[11px] font-mono text-[#8B799C]">ReferenceElements · activity-rings</span>
            </div>
            <p className="text-xs text-[#5C537A] font-semibold leading-relaxed">
              Прямое освещение от края <code className="bg-[#EFE6FA] px-1.5 py-0.5 rounded text-[#6E52C7]">SourceAlpha</code> даёт максимальный перепад нормали на внешней границе и рисует жёсткую 1–2 px обводку. Для пухлых цилиндров и колец ядро блика сжимается через <code className="bg-[#EFE6FA] px-1.5 py-0.5 rounded text-[#6E52C7]">feMorphology(erode)</code>, оба светотеневых слоя отсекаются мягкой внутренней маской <code className="bg-[#EFE6FA] px-1.5 py-0.5 rounded text-[#6E52C7]">innerMask</code> от внешней кромки, а объём дополняют тёплые градиенты в тон материала и короткая цветная тень <code className="bg-[#EFE6FA] px-1.5 py-0.5 rounded text-[#6E52C7]">feDropShadow</code>.
            </p>
          </div>
        </div>

        {/* Concentric Radii & Multi-layer Z-hierarchy */}
        <div className="lg:col-span-5 clay-board rounded-[38px] p-7 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#8E6FE8] font-extrabold text-xs uppercase tracking-wider">
              <Maximize2 className="w-4 h-4 clay-icon-3d" />
              Раздел 3 · Закругления и 5 слоёв глубины
            </div>
            <h2 className="text-2xl font-black text-[#2D264B]">
              Вложенная геометрия углов
            </h2>
            <p className="text-sm text-[#5C537A] font-semibold leading-relaxed">
              Чем глубже вложен элемент, тем меньше его радиус скругления, сохраняя мягкую пухлость углов:
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { level: 'Z-0 · Внешняя доска', radius: '42px', desc: 'Главный корпус приложения' },
              { level: 'Z-1 · Боковая 3D-панель', radius: '36px', desc: 'Выступающая фиолетовая плита меню' },
              { level: 'Z-2 · Внутренние карточки', radius: '26px — 30px', desc: 'Карточки метрик и графиков' },
              { level: 'Z-3 · Квадратные 3D-плитки', radius: '16px — 18px', desc: 'Подложки под иконки с тенью' },
              { level: 'Z-4 · 3D-аватар и маскоты', radius: 'Выход за рамку', desc: 'Нависание над краем карточки' },
            ].map((item, i) => (
              <div
                key={i}
                className="clay-card-cream rounded-[20px] px-4 py-2.5 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-black text-[#2D264B]">{item.level}</div>
                  <div className="text-[11px] font-semibold text-[#7E749C]">{item.desc}</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#EFE6FA] text-[#6E52C7] font-mono text-xs font-extrabold">
                  {item.radius}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: NON-UNIFORM VISCOUS CLAY PHYSICS */}
      <section className="clay-board rounded-[38px] p-7 lg:p-9 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#8E6FE8] font-extrabold text-xs uppercase tracking-wider">
              <Activity className="w-4 h-4 clay-icon-3d" />
              Раздел 4 · Физика анимаций в стиле CLAY
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-[#2D264B] mt-1">
              Переключение цвета на месте с усадкой пластилина
            </h2>
          </div>
          <p className="text-xs font-bold text-[#5C537A] max-w-md">
            Габариты кнопки и подложки остаются неизменными, а активная и неактивная плашки плавно меняют свой цвет и светотень на месте.
          </p>
        </div>

        {/* 4 Phase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              phase: 'Фаза 1 · 0–22%',
              title: 'Мягкое нажатие',
              desc: 'При клике новая плашка чуть вдавливается в кремовое ложе и набирает лавандовый градиент.',
            },
            {
              phase: 'Фаза 2 · 22–58%',
              title: 'Смена цвета на месте',
              desc: 'Предыдущая кнопка плавно гасит фиолетовую подсветку, возвращаясь в кремовый оттенок.',
            },
            {
              phase: 'Фаза 3 · 58–84%',
              title: 'Упругий подъём',
              desc: 'Активная плашка поднимается с чёткой направленной 3D-тенью и верхним бликом.',
            },
            {
              phase: 'Фаза 4 · 84–100%',
              title: 'Отскок медальона',
              desc: 'Внутренний квадратный бейдж с иконкой делает мягкий пластилиновый импульс.',
            },
          ].map((item, idx) => (
            <div key={idx} className="clay-card-cream rounded-[26px] p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EFE6FA] text-[#6E52C7] text-[11px] font-black">
                  {item.phase}
                </span>
                <h3 className="text-base font-black text-[#2D264B]">{item.title}</h3>
                <p className="text-xs text-[#5C537A] font-semibold leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}

export default DesignSystemGuide;
