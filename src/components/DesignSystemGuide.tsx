import { materialBackground, materialShadow } from '../utils/materialStyle';
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
  Search,
} from 'lucide-react';
import { CLAY_COLOR_PRESETS, ClayColorPresetId, UPLOADED_CLAY_ASSETS, resolveClayAssetPath } from '../utils/clayEngine';
import { MaterialSettingsPanel } from './MaterialSettings';
import { ClaySculptedIcon } from './ReferenceElements';
import { CLAY_LAYERS, CLAY_LAYER_IDS } from '../utils/clayLayers';
import { CLAY_TEXTURE_TILE_SIZE, DEFAULT_CLAY_TEXTURE_INTENSITY, MAX_CLAY_TEXTURE_INTENSITY } from '../utils/clayTexture';

interface DesignSystemGuideProps {
  onSelectPresetForGenerator?: (presetId: ClayColorPresetId) => void;
}

const NEW_CLAY_ELEMENT_RECIPE = `import { useState } from 'react';
import { ClaySculptedIcon } from './ReferenceElements';
import './NewClayElement.css';

// Общие стили и MaterialProvider уже подключены в приложении.
export function NewClayElement() {
  const [saved, setSaved] = useState(false);

  return (
    <section className="ref-library ref-surface lavender new-clay-panel"
      data-clay-layer="foundation" aria-label="Карточка вдохновения">
      <h3>Мягкая коллекция</h3>
      <p>Основной текст остаётся чётким, без рельефа.</p>
      <button type="button" className="ref-surface coral new-clay-action"
        data-clay-layer="control" aria-pressed={saved}
        onClick={() => setSaved(!saved)}>
        <ClaySculptedIcon name="bookmark" size={28} />
        <span data-clay-layer="detail" data-clay-text="raised">
          {saved ? 'Сохранено' : 'Сохранить'}
        </span>
      </button>
    </section>
  );
}`;

const NEW_CLAY_ELEMENT_STYLES = `/* Только компоновка: материал уже задают ref-surface и уровень. */
.new-clay-panel {
  display: grid;
  padding: var(--clay-layer-inset);
  gap: var(--clay-layer-gap);
  border-radius: var(--clay-layer-radius);
}
.new-clay-action {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: var(--clay-layer-min-target);
  min-height: var(--clay-layer-min-target);
  padding: var(--clay-layer-inset);
  gap: var(--clay-layer-gap);
  border-radius: var(--clay-layer-radius);
  font: 800 1rem var(--font-display);
}
/* ref-library сохраняет focus-visible, hover/press и reduced-motion. */`;

function ClayElementRecipe() {
  return <details className="mt-7 border-t border-[#E9DFEE] pt-5">
    <summary className="cursor-pointer text-sm font-extrabold text-[#654583] rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7151a9]">Как создать новый элемент · рецепт, размеры и код</summary>
    <div className="mt-5 space-y-6 text-sm text-[#796A88] leading-relaxed">
      <ol className="list-decimal pl-5 space-y-3">
        <li><b className="text-[#413054]">Выберите опору и роли.</b> Большому контейнеру задайте <code>data-clay-layer="foundation"</code>, самостоятельному объекту на нём — <code>control</code>, значку или бусине — <code>detail</code>. Это контакт с ближайшей опорой, а не произвольный <code>z-index</code>. Служебный flex/grid-контейнер не получает новую тень.</li>
        <li><b className="text-[#413054]">Оставьте видимую полку.</b> Начните с inset, gap и radius из таблицы. Вложенный объект должен помещаться внутри основания с ровным отступом. Если он повторяет внешний прямоугольный контур, ориентир его радиуса — внешний радиус минус отступ. Круг, капсула и сердце сохраняют свой силуэт. Размер детали не диктует размер зоны нажатия.</li>
        <li><b className="text-[#413054]">Назначьте общий материал.</b> Используйте <code>ref-surface</code> и одну палитру: <code>cream</code>, <code>lavender</code>, <code>coral</code>, <code>mint</code>, <code>sky</code>, <code>butter</code> или <code>peach</code>. Тело непрозрачное и пластичное. Тонкий яркий блик, широкая мягкая фаска и более плотный нижний торец дают объём; внешняя тень только обозначает контакт.</li>
        <li><b className="text-[#413054]">Разделите текст и форму.</b> Для короткой рельефной надписи используйте <code>data-clay-text="raised"</code>: свет и тень идут по буквам. Не добавляйте к ней <code>ref-surface</code> или прямоугольный <code>box-shadow</code>. Основной текст не тисним. SVG-иконка получает собственный силуэт и локальный контакт; квадратная плитка под каждым значком не требуется.</li>
        <li><b className="text-[#413054]">Подключите общий свет.</b> Не фиксируйте угол и направление в новом компоненте: поверхности используют <code>--clay-light-*</code>, а объём и тени — общие настройки материала. Готовый <code>ClaySculptedIcon</code> уже обновляет SVG по этому свету. Внутренние блики растровых PNG остаются частью изображения.</li>
        <li><b className="text-[#413054]">Сохраните поведение.</b> Нативная кнопка, понятное имя и <code>aria-pressed</code> для переключателя; цель нажатия минимум {CLAY_LAYERS.control.placement.minTouchTarget} × {CLAY_LAYERS.control.placement.minTouchTarget} px. Для маленького значка увеличьте прозрачную область кнопки. Клавиатурный focus остаётся видимым, а <code>prefers-reduced-motion</code> убирает движение, сохраняя выбранное состояние.</li>
      </ol>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left leading-relaxed min-w-[440px]">
          <caption className="text-left font-extrabold text-[#413054] mb-3">Стартовые профили из CLAY_LAYERS · объём и тени 100%</caption>
          <thead className="border-b border-[#E9DFEE] text-[#8B799C]"><tr><th scope="col" className="pb-3 pr-4">Уровень</th><th scope="col" className="pb-3 pr-4">Компоновка, px</th><th scope="col" className="pb-3">Профиль рельефа, px</th></tr></thead>
          <tbody>
            {CLAY_LAYER_IDS.map(id => {
              const layer = CLAY_LAYERS[id];
              return <tr key={id} className="border-b border-[#E9DFEE] last:border-0">
                <th scope="row" className="py-3 pr-4 align-top font-extrabold text-[#413054]">0{layer.level} · {layer.label}<code className="block font-normal text-[#8B799C] mt-1">{layer.id}</code></th>
                <td className="py-3 pr-4 align-top">Inset {layer.placement.inset} · gap {layer.placement.gap}<br/>Радиус {layer.placement.radius}{layer.placement.minTouchTarget > 0 && <><br/>Цель ≥ {layer.placement.minTouchTarget} × {layer.placement.minTouchTarget}</>}</td>
                <td className="py-3 align-top">Фаска {layer.surface.bevelWidth} · подъём {layer.surface.rise}<br/>Локальная фаска → плоское лицо; <code>sphere</code> задаётся отдельно<br/>Контакт {layer.contact.x} / {layer.contact.y} / {layer.contact.blur}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#8B799C]">Тройка контакта — смещение X / Y / размытие при свете сверху слева. Фаска ограничена радиусом и размером элемента: у маленькой кнопки она не может занять всё лицо. Глобальный объём масштабирует ширину и высоту согласованно.</p>

      <div className="space-y-3">
        <h3 className="font-extrabold text-[#413054]">Шар и диск — разные формы</h3>
        <p>Уровень глубины не определяет форму. <code>data-clay-shape="disc"</code> — плоское спокойное лицо, округлый край и небольшой торец: мятный кружок, бегунок, медальон. <code>sphere</code> — непрерывный купол для маленьких бусин. По умолчанию <code>cushion</code> сохраняет плоскую середину и мягкую фаску. Один круглый CSS-контур не превращает предмет в шар.</p>
        <p>Глина и пластилин дают приглушённый широкий блик. Не повышайте белизну ради объёма: его задают форма, цветной склон и контакт. Яркие точечные засветки и белая полоса по всему периметру делают материал лакированным.</p>
        <h3 className="font-extrabold text-[#413054]">Почему форма выглядит толстой</h3>
        <p>У референса между силуэтом и самым ярким бликом остаётся цветной склон. На кнопке гребень находится примерно в 5 px от края, на большой подложке — около 10 px. Если белый блик приклеен к самому контуру, поверхность читается как плоская плашка. Увеличение внешней тени этого не исправляет.</p>
        <p><code>clayReliefRenderer.ts</code> вычисляет расстояние до округлого контура и высоту его склона: <code>u = clamp(d / w, 0, 1)</code>, <code>h = H · √(2u − u²)</code>. Нормаль этой поверхности определяет свет, цвет боковины и мягкий блик. Верхнее лицо остаётся спокойного цвета; нижний правый торец показывает толщину, а отдельная короткая тень — контакт с опорой.</p>
        <p>Для новой палитры задайте <code>--clay-relief-face</code> и <code>--clay-relief-edge</code>. Торец — более плотный оттенок того же материала. Не затемняйте весь фон и не рисуйте чёрный бордер. Для опоры другого цвета можно изменить <code>--clay-shadow</code>: например, коралловая кнопка на сиреневой панели отбрасывает сиреневую контактную тень.</p>
        <p>В приложении <code>MaterialProvider</code> подключает <code>ClayRelief</code>. Результат расчёта становится только фоном элемента: DOM, текст, SVG-иконки и их анимация остаются самостоятельными. Размер, роль, палитра или свет меняют фон; перелёт через <code>transform</code> не запускает пересчёт в каждом кадре. Кеш ограничен, а при отсутствии Canvas работает CSS-профиль.</p>
        <p>Углубления обозначайте <code>data-clay-surface="recessed"</code>, особые силуэты — <code>data-clay-relief="off"</code>. Фотографии, PNG-маскоты, SVG, текст, маски и разные радиусы углов не получают прямоугольный фон. Для выемок и скульптурных значков нужен материал по их собственному контуру. Экспорт из генератора включает необходимый код автоматически.</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-extrabold text-[#413054]">Математическая фактура мягкого пластилина</h3>
        <p>Утверждённая фактура сохранена: слабые плавные неоднородности и мягкая пятнистость. Её масштаб и интенсивность не участвуют в усилении объёма. Фактура не добавляет прозрачность всему объекту и не размывает надписи.</p>
        <p>Общий слой <code>--clay-texture-image</code> строится из периодической карты высот. Её наклоны освещаются тем же источником, что и фаски. Нейтрально-серый результат накладывается через <code>soft-light</code>; размер повторяющегося фрагмента — {CLAY_TEXTURE_TILE_SIZE} × {CLAY_TEXTURE_TILE_SIZE} px. Масштаб текстуры сохраняется при изменении размера кнопки.</p>
        <p>Исходная непрозрачность слоя — {Math.round(DEFAULT_CLAY_TEXTURE_INTENSITY * 100)}%, предел — {Math.round(MAX_CLAY_TEXTURE_INTENSITY * 100)}%. В общей панели шкала 0–100% управляет этим ограниченным диапазоном; ноль полностью выключает фактуру. У деталей пятнистость остаётся деликатной, а основной текст обходится без неё.</p>
        <p>Шум использует постоянные seed: рисунок не меняется при React-render, нажатии или в кадрах анимации. Смена света меняет освещение этого же рельефа. Силуэт кнопки, форма значка и геометрия букв сохраняются; отдельно деформировать их ради фактуры не нужно.</p>
        <details>
          <summary className="cursor-pointer text-xs font-extrabold text-[#654583] rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7151a9]">Как рассчитывается микрорельеф</summary>
          <div className="mt-3 text-xs leading-relaxed space-y-3">
            <p><code>clayTexture.ts</code> генерирует встроенный SVG без внешних файлов. Две октавы плавного <code>fractalNoise</code> создают карту высот; <code>stitchTiles</code> и <code>feTile</code> сохраняют соседей на границах. <code>feDiffuseLighting</code> вычисляет свет по наклону поверхности. Второе, более крупное шумовое поле добавляет слабую тональную неоднородность.</p>
            <p>Освещение ровного участка переводится в нейтральный серый, поэтому <code>soft-light</code> не выбеливает материал. Смесь размытого рельефа и широких мягких пятен получает ограниченную альфу. Фактура ложится на основания и кнопки, а маленькие детали сохраняют чистую поверхность. Масштаб, фаски и контактные тени задают <code>CLAY_LAYERS</code>.</p>
            <p>При создании элемента достаточно взять <code>ref-surface</code>. Не генерируйте отдельный случайный рисунок в <code>render</code> или <code>requestAnimationFrame</code> и не растягивайте фрагмент через <code>background-size: cover</code>.</p>
          </div>
        </details>
      </div>

      <details>
        <summary className="cursor-pointer text-sm font-extrabold text-[#654583] rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7151a9]">Показать пример React + CSS</summary>
        <p className="text-xs font-extrabold mt-4">src/components/NewClayElement.tsx</p>
        <pre className="mt-2 rounded-[18px] bg-[#F1EAF6] p-4 overflow-auto text-xs text-[#645079] leading-relaxed"><code>{NEW_CLAY_ELEMENT_RECIPE}</code></pre>
        <p className="text-xs font-extrabold mt-4">src/components/NewClayElement.css</p>
        <pre className="mt-2 rounded-[18px] bg-[#F1EAF6] p-4 overflow-auto text-xs text-[#645079] leading-relaxed"><code>{NEW_CLAY_ELEMENT_STYLES}</code></pre>
      </details>
    </div>
  </details>;
}

/** Three physical roles, independent of DOM nesting and CSS z-index. */
function ClayDepthRules() {
  const [liked, setLiked] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return <section className="clay-card-cream rounded-[30px] p-6 sm:p-8" aria-labelledby="clay-depth-title">
    <span className="text-xs font-extrabold tracking-wider text-[#8C6AAB]">ПРАВИЛО КОМПОЗИЦИИ · ТРИ ФИЗИЧЕСКИХ УРОВНЯ</span>
    <h2 id="clay-depth-title" className="text-2xl font-black mt-3">Основание → управление → детали</h2>
    <p className="text-sm text-[#796A88] leading-relaxed mt-3 max-w-3xl">Большая подложка держит композицию, на ней лежат элементы управления, а на них — значки, буквы и маленькие украшения. Объём есть у каждого уровня; размер фаски и пятна контакта уменьшается вместе с объектом. Уровень определяет масштаб рельефа, а форма задаётся отдельно: круглая деталь по умолчанию остаётся диском; полный купол включается только явно через <code>sphere</code>.</p>

    <div className="grid xl:grid-cols-2 gap-7 mt-7 items-start">
      <figure className="min-w-0">
        <div className="ref-library ref-surface lavender rounded-[32px] p-5 sm:p-7" data-clay-layer="foundation">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <span className="text-[10px] font-black tracking-wider text-[#654583]">01 · ОСНОВАНИЕ</span>
              <h3 className="text-xl font-black text-[#3E2D5D] mt-1">Мягкий макет</h3>
            </div>
            <span className="text-[11px] text-[#654583] font-bold">Большая плита</span>
          </div>

          <div className="space-y-5">
            <p className="text-[10px] font-black tracking-wider text-[#654583]">02 · УПРАВЛЕНИЕ</p>
            <label className="ref-surface peach ref-search" data-clay-layer="control">
              <Search size={23} className="clay-icon-3d" data-clay-layer="detail" aria-hidden="true" />
              <input aria-label="Поиск в примере трёх уровней" placeholder="Найти идею…" />
            </label>

            <div className="flex flex-wrap items-center gap-5">
              <span className="ref-surface mint ref-status" data-clay-layer="control">
                <i data-clay-layer="detail" data-clay-shape="sphere" aria-hidden="true" />
                <span className="clay-detail-text" data-clay-layer="detail" data-clay-text="raised">Активен</span>
              </span>
              <button
                type="button"
                aria-label="Нравится пример"
                aria-pressed={liked}
                onClick={() => setLiked(!liked)}
                className={`ref-surface coral ref-heart ${liked ? 'is-liked' : ''}`}
                data-clay-layer="control"
              ><ClaySculptedIcon name="heart" size={40} /></button>
            </div>

            <button
              type="button"
              aria-pressed={confirmed}
              onClick={() => setConfirmed(!confirmed)}
              className="ref-surface coral w-full min-h-[64px] rounded-[24px] flex items-center justify-center gap-3 px-5 py-4 text-xl font-black"
              data-clay-layer="control"
            >
              <ClaySculptedIcon name={confirmed ? 'bookmark' : 'download'} size={28} />
              <span className="clay-detail-text" data-clay-layer="detail" data-clay-text="raised">{confirmed ? 'Сохранено' : 'Сохранить'}</span>
            </button>
          </div>

          <p className="text-[10px] font-black tracking-wider text-[#654583] mt-6">03 · ЗНАЧОК, НАДПИСЬ И БУСИНА</p>
          <p className="text-xs text-[#654583] leading-relaxed mt-2">Детали выступают над своими плашками. Сердце — отдельная мягкая форма; надпись сохраняет чёткий силуэт.</p>
        </div>
        <figcaption className="text-xs text-[#8B799C] leading-relaxed mt-4" aria-live="polite">
          {liked ? 'Сердце выбрано. ' : ''}Нажмите кнопки и поменяйте общий свет выше: вся композиция использует один материал.
        </figcaption>
      </figure>

      <div className="min-w-0 space-y-5">
        <table className="w-full text-left text-xs leading-relaxed table-fixed">
          <caption className="text-left text-sm font-extrabold text-[#413054] mb-3">Роль определяет рельеф, а не глубина вложенности</caption>
          <thead className="text-[#8B799C] border-b border-[#E9DFEE]">
            <tr><th scope="col" className="w-[36%] pb-3 pr-4 font-bold">Уровень</th><th scope="col" className="pb-3 font-bold">Правило материала</th></tr>
          </thead>
          <tbody className="text-[#796A88]">
            <tr className="border-b border-[#E9DFEE]">
              <th scope="row" className="py-4 pr-4 align-top text-[#413054] font-extrabold">01 · Основание<span className="block font-normal text-[#8B799C] mt-1">Панель, карточка, подиум меню</span></th>
              <td className="py-4 align-top">Широкая округлая фаска и видимый нижний торец. Одна мягкая внешняя тень связывает всю опору с фоном.</td>
            </tr>
            <tr className="border-b border-[#E9DFEE]">
              <th scope="row" className="py-4 pr-4 align-top text-[#413054] font-extrabold">02 · Управление<span className="block font-normal text-[#8B799C] mt-1">Кнопка, поле, капсула, корпус трека</span></th>
              <td className="py-4 align-top">Свой выпуклый профиль на основании: узкий верхний блик, мягкая фаска и короткая контактная тень. У желоба тень направлена внутрь.</td>
            </tr>
            <tr>
              <th scope="row" className="py-4 pr-4 align-top text-[#413054] font-extrabold">03 · Детали<span className="block font-normal text-[#8B799C] mt-1">Иконка, надпись, бусина, сердце</span></th>
              <td className="py-4 align-top">Самая маленькая фаска и локальная тень непосредственно под формой. Объём следует контуру значка; вокруг текста не появляется прямоугольная подложка.</td>
            </tr>
          </tbody>
        </table>
        <div className="text-xs leading-relaxed text-[#796A88] space-y-3">
          <p><b className="text-[#413054]">Тень уменьшается:</b> каждый следующий уровень ближе к своей опоре и меньше по размеру. Глубину создают торец, фаска и контакт, а не всё более крупный размытый ореол.</p>
          <p><b className="text-[#413054]">Текст остаётся читаемым:</b> у коротких надписей допустим едва заметный рельеф. Основной текст, значения и длинные подписи остаются чёткими, без тяжёлой тени.</p>
          <p><b className="text-[#413054]">Один свет и одна палитра:</b> направление бликов и теней общее для всех уровней. Тени окрашены в тон поверхности; кремовый, лаванда, коралл, мята, голубой и жёлтый берутся из общих пресетов.</p>
        </div>
      </div>
    </div>
    <ClayElementRecipe />
  </section>;
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
      <MaterialSettingsPanel />
      <ClayDepthRules />
      <section className="clay-card-cream rounded-[30px] p-6 sm:p-8">
        <span className="text-xs font-extrabold tracking-wider text-[#8C6AAB]">КАЛИБРОВКА ПО РЕФЕРЕНСАМ · 17.11.2026</span>
        <h2 className="text-2xl font-black mt-3 mb-5">Мягкий объём, спокойное движение</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-sm">
          <div><b>Свет и тень</b><p className="mt-2 text-[#796A88] leading-relaxed">Общий источник света; эталон — сверху слева. Узкий блик лежит на широкой мягкой фаске, снизу читается цветной торец. Тень под основанием шире, под кнопкой короче, под деталью — совсем локальная.</p></div>
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
                { label: 'Свет', value: 'Один источник', sub: 'Эталон: сверху слева' },
                { label: 'Скругления', value: '24px — 44px', sub: 'Вложенная концентричность' },
                { label: 'Материал', value: '4 составляющих', sub: 'Цвет, блик, фаска, тень' },
                { label: 'Многослойность', value: '3 уровня', sub: 'Основание → детали' },
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
                  <h3 className="text-lg font-black text-[#2D264B]">Материал одной поверхности</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setExplodedView(!explodedView)}
                  className="clay-btn-purple w-[196px] h-[36px] justify-center rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 clay-icon-3d shrink-0" />
                  <span className="clay-sidebar-text-3d">
                    {explodedView ? 'Собрать материал' : 'Разложить материал'}
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
                    boxShadow: materialShadow('3px 7px 10px -3px rgba(104, 79, 179, 0.24), 1px 2px 3px rgba(104, 79, 179, 0.14)'),
                    pointerEvents: explodedView ? 'auto' : 'none',
                  }}
                >
                  <span>4. Короткая внешняя тень</span>
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
                    boxShadow: materialShadow('inset -1px -3px 3px rgba(114, 84, 198, 0.52), inset -3px -5px 7px rgba(114, 84, 198, 0.24)'),
                    pointerEvents: explodedView ? 'auto' : 'none',
                  }}
                >
                  <span>3. Цветной торец</span>
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
                    boxShadow: materialShadow('inset 1px 2px 2px rgba(255, 255, 255, 0.9), inset 3px 5px 6px rgba(255, 255, 255, 0.32)'),
                    pointerEvents: explodedView ? 'auto' : 'none',
                  }}
                >
                  <span>2. Блик со стороны света</span>
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
                    background: materialBackground('linear-gradient(145deg, #B59BFF 0%, #8E6FE8 52%, #7554D3 100%)'),
                    boxShadow: materialShadow(explodedView
                      ? '3px 7px 10px -3px rgba(117, 84, 211, 0.24), inset 1px 2px 2px rgba(255,255,255,0.7)'
                      : '3px 7px 10px -3px rgba(96, 68, 175, 0.24), 1px 2px 3px rgba(96, 68, 175, 0.14), inset 1px 2px 2px rgba(255,255,255,0.85), inset 3px 5px 6px rgba(255,255,255,0.28), inset -1px -3px 3px rgba(68,42,146,0.48), inset -3px -5px 7px rgba(68,42,146,0.22)'),
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-[15px] bg-[#FAF4EC] flex items-center justify-center shrink-0"
                      style={{
                        boxShadow:
                          materialShadow('1px 2px 3px rgba(56, 33, 120, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -2px 3px rgba(212, 198, 180, 0.65)'),
                      }}
                    >
                      <img src={resolveClayAssetPath(UPLOADED_CLAY_ASSETS[0].path)} alt="Star" className="w-8 h-8 object-contain clay-icon-3d" />
                    </div>
                    <div>
                      <div className="text-sm font-black tracking-tight clay-sidebar-text-3d">
                        {explodedView ? '1. Спокойный цвет поверхности' : 'Собранная 3D Clay-карточка'}
                      </div>
                      <div className="text-[11px] text-white/90 font-semibold">
                        {explodedView
                          ? 'Отдельный профиль округлого края'
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
                  background: materialBackground(`linear-gradient(145deg, ${preset.gradStart} 0%, ${preset.gradEnd} 100%)`),
                  boxShadow: materialShadow(`
                    4px 10px 20px rgba(${preset.outerShadowRgb}, 0.28),
                    inset 3px 3px 6px rgba(255,255,255,0.78),
                    inset -3px -5px 9px ${preset.innerDarkHex}
                  `),
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
            Одна внешняя тень не описывает округлый профиль. <strong>Пухлый пластилин</strong> складывается из цвета тела, верхнего блика, мягкой фаски с нижним торцом и короткой тени контакта. Это составляющие материала каждого объекта; физические уровни композиции — основание, управление и детали.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Convex Card */}
            <div className="clay-card-lavender rounded-[26px] p-5 space-y-2.5">
              <div className="inline-block px-3 py-1 rounded-full bg-white/80 text-[#6E52C7] text-xs font-black">
                Выпуклый элемент
              </div>
              <h3 className="text-base font-black text-[#2D264B]">Карточки, кнопки, 3D-бейджи</h3>
              <ul className="text-xs text-[#4D446A] space-y-1.5 font-semibold">
                <li>• <strong>Тело:</strong> насыщенная пастель без белёсой дымки</li>
                <li>• <strong>Блик:</strong> узкий светлый гребень на широкой фаске</li>
                <li>• <strong>Нижний торец:</strong> плотнее и темнее основного цвета</li>
                <li>• <strong>Контакт:</strong> короткая цветная тень в масштабе объекта</li>
              </ul>
            </div>

            {/* Concave / Recessed Well */}
            <div className="clay-recessed-input rounded-[26px] p-5 space-y-2.5">
              <div className="inline-block px-3 py-1 rounded-full bg-[#EAE0F8] text-[#6E52C7] text-xs font-black">
                Вдавленный желоб
              </div>
              <h3 className="text-base font-black text-[#2D264B]">Треки и внутренние каналы</h3>
              <ul className="text-xs text-[#5C537A] space-y-1.5 font-semibold">
                <li>• <strong>Внутренняя тень:</strong> под стенкой со стороны источника</li>
                <li>• <strong>Ответный блик:</strong> на противоположной внутренней стенке</li>
                <li>• Канал утоплен в корпус, а бегунок выступает над ним</li>
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
              Раздел 3 · Геометрия трёх уровней
            </div>
            <h2 className="text-2xl font-black text-[#2D264B]">
              Радиусы следуют форме
            </h2>
            <p className="text-sm text-[#5C537A] font-semibold leading-relaxed">
              У вложенных прямоугольных поверхностей радиусы согласованы с отступом. Капсулы, круги и фигурные значки сохраняют собственный силуэт; дополнительная обёртка не создаёт новый физический уровень.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { level: '01 · Основание', radius: '26–48 px', desc: 'Большая панель, карточка или подиум' },
              { level: '02 · Управление', radius: '22–30 px / ∞', desc: 'Кнопка, поле или капсула на опоре' },
              { level: '03 · Детали', radius: 'По силуэту', desc: 'Значок, буквы, бусина и мягкое сердце' },
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
