import React, { useState, useId, useSyncExternalStore } from 'react';
import { Check, ChevronLeft, ChevronRight, Clock, Dumbbell, Heart, Plus, Search, Star, X } from 'lucide-react';

type ClaySculptedIconName = 'bell' | 'settings' | 'home' | 'stats' | 'profile' | 'mail' | 'bookmark' | 'download' | 'heart';

const CLAY_SVG_MATERIAL_DEFAULT = '1|1|1|1|1';
const CLAY_SVG_MATERIAL_VARIABLES = ['--clay-volume', '--clay-shadow-softness', '--clay-shadow-strength', '--clay-light-x', '--clay-light-y'];
const getClaySvgServerSnapshot = () => CLAY_SVG_MATERIAL_DEFAULT;
function getClaySvgSnapshot() {
  if (typeof document === 'undefined') return CLAY_SVG_MATERIAL_DEFAULT;
  const style = getComputedStyle(document.documentElement);
  return CLAY_SVG_MATERIAL_VARIABLES.map(name => style.getPropertyValue(name).trim() || '1').join('|');
}
function subscribeClaySvgMaterial(onChange: () => void) {
  window.addEventListener('clay-material-change', onChange);
  return () => window.removeEventListener('clay-material-change', onChange);
}

// Keep this bridge local: the raw React export also works without the studio provider.
function useClaySvgMaterial() {
  const snapshot = useSyncExternalStore(subscribeClaySvgMaterial, getClaySvgSnapshot, getClaySvgServerSnapshot);
  const values = snapshot.split('|').map(Number);
  const bounded = (index: number, min: number, max: number) => Number.isFinite(values[index]) ? Math.min(max, Math.max(min, values[index])) : 1;
  return { volume: bounded(0, .6, 1.5), softness: bounded(1, .6, 1.5), strength: bounded(2, .5, 1.5), x: bounded(3, -1, 1), y: bounded(4, -1, 1) };
}

function clayMaterialColor(base: string, surface: string, volume: number) {
  const channels = [1, 3, 5].map(index => {
    const start = parseInt(base.slice(index, index + 2), 16);
    const end = parseInt(surface.slice(index, index + 2), 16);
    return Math.round(Math.min(255, Math.max(0, start + (end - start) * volume)));
  });
  return `rgb(${channels.join(',')})`;
}

// Closed silhouettes keep their soft material at every size and in the standalone export.
const CLAY_ICON_SHAPES: Record<ClaySculptedIconName, string> = {
  bell: 'M28 8C28 3 36 3 36 8V10C45 12 49 19 49 31V37C49 41 54 42 54 46C54 49 51 51 47 51H17C13 51 10 49 10 46C10 42 15 41 15 37V31C15 19 19 12 28 10Z M25 54H39C38 62 26 62 25 54Z',
  settings: 'M23.15 13.03Q23.96 12.60 24.84 12.33L26.75 11.73Q27.63 11.46 27.51 9.77L27.26 6.11Q27.14 4.43 29.47 4.43L34.53 4.43Q36.86 4.43 36.74 6.11L36.49 9.77Q36.37 11.46 37.25 11.73L39.16 12.33Q40.04 12.60 40.85 13.03L42.62 13.96Q43.44 14.39 44.55 13.11L46.95 10.34Q48.06 9.06 49.71 10.71L53.29 14.29Q54.94 15.94 53.66 17.05L50.89 19.45Q49.61 20.56 50.04 21.38L50.97 23.15Q51.40 23.96 51.67 24.84L52.27 26.75Q52.54 27.63 54.23 27.51L57.89 27.26Q59.57 27.14 59.57 29.47L59.57 34.53Q59.57 36.86 57.89 36.74L54.23 36.49Q52.54 36.37 52.27 37.25L51.67 39.16Q51.40 40.04 50.97 40.85L50.04 42.62Q49.61 43.44 50.89 44.55L53.66 46.95Q54.94 48.06 53.29 49.71L49.71 53.29Q48.06 54.94 46.95 53.66L44.55 50.89Q43.44 49.61 42.62 50.04L40.85 50.97Q40.04 51.40 39.16 51.67L37.25 52.27Q36.37 52.54 36.49 54.23L36.74 57.89Q36.86 59.57 34.53 59.57L29.47 59.57Q27.14 59.57 27.26 57.89L27.51 54.23Q27.63 52.54 26.75 52.27L24.84 51.67Q23.96 51.40 23.15 50.97L21.38 50.04Q20.56 49.61 19.45 50.89L17.05 53.66Q15.94 54.94 14.29 53.29L10.71 49.71Q9.06 48.06 10.34 46.95L13.11 44.55Q14.39 43.44 13.96 42.62L13.03 40.85Q12.60 40.04 12.33 39.16L11.73 37.25Q11.46 36.37 9.77 36.49L6.11 36.74Q4.43 36.86 4.43 34.53L4.43 29.47Q4.43 27.14 6.11 27.26L9.77 27.51Q11.46 27.63 11.73 26.75L12.33 24.84Q12.60 23.96 13.03 23.15L13.96 21.38Q14.39 20.56 13.11 19.45L10.34 17.05Q9.06 15.94 10.71 14.29L14.29 10.71Q15.94 9.06 17.05 10.34L19.45 13.11Q20.56 14.39 21.38 13.96Z M42 32A10 10 0 1 0 22 32A10 10 0 1 0 42 32Z',
  home: 'M8 27L26 11Q32 6 38 11L56 27Q60 30 57 34Q55 37 51 34V49Q51 54 46 54H39V40Q39 36 35 36H29Q25 36 25 40V54H18Q13 54 13 49V34Q9 37 7 34Q4 30 8 27Z',
  stats: 'M10 33Q10 29 14 29H18Q22 29 22 33V52Q22 56 18 56H14Q10 56 10 52Z M27 22Q27 18 31 18H35Q39 18 39 22V52Q39 56 35 56H31Q27 56 27 52Z M44 11Q44 7 48 7H52Q56 7 56 11V52Q56 56 52 56H48Q44 56 44 52Z',
  profile: 'M43 19A11 11 0 1 1 21 19A11 11 0 1 1 43 19Z M11 49C11 39 20 33 32 33C44 33 53 39 53 49V51Q53 55 48 55H16Q11 55 11 51Z',
  mail: 'M11 14H53Q58 14 58 19V45Q58 50 53 50H11Q6 50 6 45V19Q6 14 11 14Z M15 21L32 34L49 21Z M13 27V41Q13 43 15 43H49Q51 43 51 41V27L35 39Q32 41 29 39Z',
  bookmark: 'M18 7H46Q51 7 51 12V53Q51 59 46 56L34 48Q32 47 30 48L18 56Q13 59 13 53V12Q13 7 18 7Z',
  download: 'M32 5Q37 5 37 10V31L43 25Q47 22 50 26Q53 29 50 32L36 46Q32 50 28 46L14 32Q11 29 14 26Q17 22 21 25L27 31V10Q27 5 32 5Z M13 51H51Q55 51 55 55Q55 59 51 59H13Q9 59 9 55Q9 51 13 51Z',
  heart: 'M32 14C25 3 9 7 7 20C4 34 18 46 28 55Q32 59 36 55C46 46 60 34 57 20C55 7 39 3 32 14Z',
};

export function ClaySculptedIcon({ name, size = 32, className = '', style }: {
  name: ClaySculptedIconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const id = `clay-icon-${useId().replace(/:/g, '')}`;
  const { volume, softness, strength, x, y } = useClaySvgMaterial();
  const hasDomeHighlight = name === 'heart' || name === 'bell';
  const highlightX = 32 - (name === 'heart' ? 10 : 8) * x;
  const highlightY = name === 'heart' ? (y > 0 ? 17 : 40) : (y > 0 ? 20 : 41);
  const palette = name === 'bell'
    ? ['#DEC9FF', '#B58CF0', '#9569D3', '#7950B4', '#7145A7']
    : name === 'heart'
      ? ['#FFFFFF', '#FFFDF8', '#F7EEE7', '#EBD9D0', '#CEAAA2']
      : ['#939DD1', '#626FA9', '#414F88', '#2A3566', '#222B55'];

  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 64 64" overflow="visible" aria-hidden="true" focusable="false" data-clay-layer="detail" className={`ref-sculpted-icon ref-sculpted-icon--${name} ${className}`.trim()} style={style}>
    <defs>
      <path id={`${id}-shape`} d={CLAY_ICON_SHAPES[name]} fillRule="evenodd" clipRule="evenodd" stroke="none"/>
      <clipPath id={`${id}-clip`}><use href={`#${id}-shape`}/></clipPath>
      <linearGradient id={`${id}-material`} x1={32 - 20 * x} y1={32 - 27 * y} x2={32 + 13 * x} y2={32 + 27 * y} gradientUnits="userSpaceOnUse">
        <stop stopColor={clayMaterialColor(palette[2], palette[0], volume)}/><stop offset=".24" stopColor={clayMaterialColor(palette[2], palette[1], volume)}/><stop offset=".63" stopColor={palette[2]}/><stop offset="1" stopColor={clayMaterialColor(palette[2], palette[3], volume)}/>
      </linearGradient>
      <radialGradient id={`${id}-shine`} cx={.5 - .15 * x} cy={.5 - .4 * y} r=".75">
        <stop stopColor="#FFFFFF" stopOpacity={Math.min(1, (name === 'heart' ? .18 : name === 'bell' ? .22 : .32) * volume)}/><stop offset="1" stopColor="#FFFFFF" stopOpacity="0"/>
      </radialGradient>
      {hasDomeHighlight && <filter id={`${id}-catchlight`} x="-45%" y="-25%" width="190%" height="150%">
        <feGaussianBlur stdDeviation={.5 * Math.min(1.15, Math.max(.8, softness))}/>
      </filter>}
      <filter id={`${id}-contact`} x="-35%" y="-30%" width="180%" height="190%" colorInterpolationFilters="sRGB">
        <feDropShadow dx={x * volume} dy={3 * y * volume} stdDeviation={1.9 * softness} floodColor={name === 'heart' ? '#AD6265' : '#342D60'} floodOpacity={.3 * strength * volume}/>
      </filter>
      <filter id={`${id}-soft-edge`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation={(hasDomeHighlight ? 2.2 : 1.6) * softness} result="softShape"/>
        <feOffset in="softShape" dx={1.4 * x * volume} dy={(hasDomeHighlight ? 2.5 : 2) * y * volume} result="lightShift"/>
        <feComposite in="SourceAlpha" in2="lightShift" operator="out" result="upperEdge"/>
        <feFlood floodColor="#FFFFFF" floodOpacity={(hasDomeHighlight ? .35 : .48) * volume} result="lightColor"/>
        <feComposite in="lightColor" in2="upperEdge" operator="in" result="upperLight"/>
        <feOffset in="softShape" dx={-x * volume} dy={-(hasDomeHighlight ? 3.4 : 2) * y * volume} result="shadeShift"/>
        <feComposite in="SourceAlpha" in2="shadeShift" operator="out" result="lowerEdge"/>
        <feFlood floodColor={palette[4]} floodOpacity={(hasDomeHighlight ? .32 : .4) * strength * volume} result="shadeColor"/>
        <feComposite in="shadeColor" in2="lowerEdge" operator="in" result="lowerShade"/>
        <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="lowerShade"/><feMergeNode in="upperLight"/></feMerge>
      </filter>
    </defs>
    <g stroke="none" filter={`url(#${id}-contact)`}>
      <use href={`#${id}-shape`} fill={palette[4]} transform={`translate(${.5 * x * volume} ${1.2 * y * volume})`}/>
      <use href={`#${id}-shape`} fill={`url(#${id}-material)`} filter={`url(#${id}-soft-edge)`}/>
      <ellipse cx={32 - 8 * x} cy={32 - 14 * y} rx="24" ry="19" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`}/>
      {hasDomeHighlight && <g clipPath={`url(#${id}-clip)`}>
        <ellipse cx={highlightX} cy={highlightY} rx={name === 'heart' ? 3.3 : 2.4} ry={name === 'heart' ? 6 : 6.5} transform={`rotate(${35 * x * y} ${highlightX} ${highlightY})`} fill="#FFFFFF" opacity={Math.min(.88, .76 * volume)} filter={`url(#${id}-catchlight)`}/>
      </g>}
    </g>
  </svg>;
}

export type ReferenceElementKind = 'status-pills' | 'action-rows' | 'clay-calendar' | 'product-card' | 'workout-card' | 'activity-rings' | 'filter-chips';
export const REFERENCE_ELEMENTS: { id: ReferenceElementKind; label: string; description: string }[] = [
  { id: 'status-pills', label: 'Статусные плашки', description: 'Светящийся объёмный индикатор и мягкая капсула' },
  { id: 'action-rows', label: 'Список действий', description: 'Медальон, стрелка и счётчик сообщений' },
  { id: 'clay-calendar', label: 'Календарь', description: 'Переключение месяцев и выбор дня' },
  { id: 'product-card', label: 'Карточка товара', description: 'Сумка из CSS-пластилина, избранное и корзина' },
  { id: 'workout-card', label: 'Карточка тренировки', description: 'Объёмная гантель и запуск тренировки' },
  { id: 'activity-rings', label: 'Кольца активности', description: 'Три скруглённых прогресса и цель дня' },
  { id: 'filter-chips', label: 'Фильтры и поиск', description: 'Поиск, категории и диапазон цены' },
];

export function ReferenceElement({ kind, title }: { kind: ReferenceElementKind; title?: string }) {
  const ringId = useId().replace(/:/g, '');
  const { volume, softness, strength, x, y } = useClaySvgMaterial();
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedDay, setSelectedDay] = useState('2026-11-14');
  const [month, setMonth] = useState(10);
  const [year, setYear] = useState(2026);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [price, setPrice] = useState(120);
  const [message, setMessage] = useState('');
  const [goal, setGoal] = useState(false);
  const changeMonth = (offset: number) => {
    const date = new Date(year, month + offset, 1);
    setMonth(date.getMonth()); setYear(date.getFullYear());
  };

  if (kind === 'status-pills') return <div className="ref-status-stack" aria-label="Статусы">
    {['Active', 'Pending', 'Archived'].map((status, i) => <span data-clay-layer="control" data-clay-text="raised" className={`ref-surface ref-status ${['mint', 'butter', 'lavender'][i]}`} key={status}><i data-clay-layer="detail" data-clay-shape="sphere" aria-hidden="true" />{status}</span>)}
  </div>;

  if (kind === 'action-rows') return <div className="ref-action-stack">
    {([{ label: 'Messages', icon: 'mail', color: 'butter', text: 'You’re all caught up · 3 messages' }, { label: 'Bookmarks', icon: 'bookmark', color: 'butter', text: 'Your collection · 12 bookmarks' }, { label: 'Download', icon: 'download', color: 'mint', text: 'Your clay kit is ready to export in the generator' }] as const).map(({ label, icon, color, text }) => <button type="button" data-clay-layer="control" className={`ref-surface ref-action ${color}`} key={label} onClick={() => setMessage(text)}><span data-clay-layer="detail" data-clay-shape="disc" className={`ref-surface ref-medallion ${color}`}><ClaySculptedIcon name={icon}/></span><b data-clay-text="raised">{label}</b><ChevronRight data-clay-layer="detail" size={22}/></button>)}
    <span role="status" className="ref-feedback">{message || 'A little order. A lot of softness.'}</span>
  </div>;

  if (kind === 'clay-calendar') {
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const monthName = new Date(year, month, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' });
    return <section data-clay-layer="foundation" className="ref-surface cream ref-calendar">
      <div className="ref-between"><h3>{title || monthName}</h3><div className="ref-inline"><button type="button" className="ref-icon-button" aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)}><ChevronLeft size={18}/></button><button type="button" className="ref-icon-button" aria-label="Следующий месяц" onClick={() => changeMonth(1)}><ChevronRight size={18}/></button></div></div>
      <div className="ref-days">{['M','T','W','T','F','S','S'].map((d,i)=><span key={`week-${i}`} className="ref-weekday">{d}</span>)}{Array.from({length:firstDay},(_,i)=><span key={`blank-${i}`}/>)}{Array.from({length:days},(_,i)=>{ const key = `${year}-${String(month+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`; return <button type="button" aria-label={key} aria-pressed={selectedDay===key} key={key} data-clay-layer={selectedDay===key ? 'control' : undefined} data-clay-text={selectedDay===key ? 'raised' : undefined} className={selectedDay===key ? 'ref-surface coral' : ''} onClick={()=>setSelectedDay(key)}>{i+1}</button>; })}</div>
      <div className="ref-calendar-note"><i/> <span role="status">Selected · {selectedDay}</span></div>
    </section>;
  }

  if (kind === 'product-card') return <article data-clay-layer="foundation" className="ref-surface mint ref-product">
    <div className="ref-between"><span className="ref-eyebrow">THE SOFT COLLECTION</span><button type="button" data-clay-layer="control" className="ref-surface cream ref-icon-button" aria-label="Добавить в избранное" aria-pressed={liked} onClick={()=>setLiked(!liked)}><Heart data-clay-layer="detail" size={19} fill={liked ? '#a18bd9' : 'none'}/></button></div>
    <div className="ref-bag" role="img" aria-label="Объёмная персиковая сумка"><div className="ref-bag-handle"/><div className="ref-bag-body"><i/><i/></div></div>
    <h3>{title || 'Clay Tote'}</h3><div className="ref-rating" aria-label="Рейтинг 4 из 5">{[0,1,2,3,4].map(i=><Star key={i} size={15} fill={i<4?'#ffe17c':'#fff'} strokeWidth={0}/>)}<span>(98)</span></div>
    <div className="ref-between"><strong className="ref-price">$67 <del>$110</del></strong><button type="button" data-clay-layer="control" data-clay-text="raised" className="ref-surface cream ref-small-button" aria-pressed={added} onClick={()=>setAdded(!added)}>{added?<Check data-clay-layer="detail" size={15}/>:<Plus data-clay-layer="detail" size={15}/>} {added?'Added':'Add'}</button></div>
    <span className="ref-sr-only" role="status">{added ? 'Товар добавлен в демо-корзину' : ''}</span>
  </article>;

  if (kind === 'workout-card') return <article data-clay-layer="foundation" className="ref-surface lavender ref-workout">
    <div className="ref-between"><span className="ref-eyebrow">A LITTLE STRONGER</span><span data-clay-layer="control" data-clay-text="raised" className="ref-surface cream ref-time"><Clock data-clay-layer="detail" size={13}/> 35 min</span></div>
    <div className="ref-dumbbell" role="img" aria-label="Объёмная сиреневая гантель"><i/><i/><i/><i/><i/></div>
    <h3>{title || 'Upper body'}</h3><p>Find your strength.<br/>At your own pace.</p>
    <button type="button" data-clay-layer="control" data-clay-text="raised" className="ref-surface coral ref-button" aria-pressed={running} onClick={()=>setRunning(!running)}>{running?<Check data-clay-layer="detail" size={17}/>:<Dumbbell data-clay-layer="detail" size={17}/>} {running ? 'Session started' : 'Start workout'}</button>
    <span className="ref-sr-only" role="status">{running ? 'Демонстрация тренировки запущена' : ''}</span>
  </article>;

  if (kind === 'activity-rings') {
    const arc = (radius: number) => `M 120 ${120-radius} A ${radius} ${radius} 0 1 1 120 ${120+radius} A ${radius} ${radius} 0 1 1 120 ${120-radius}`;
    const rings = [
      {r:101,p:goal?1:.78,top:'#FFC8C0',color:'#FF978E',edge:'#EE7A72',track:'#FCE8E6'},
      {r:76,p:.52,top:'#D6FAE8',color:'#9EE2C4',edge:'#7AC6A7',track:'#E6F7EF'},
      {r:51,p:.9,top:'#D8F4FE',color:'#9DD8F0',edge:'#79BDDD',track:'#E7F5FB'},
    ];
    return <section className="ref-activity">
      <div className="ref-ring-wrap">
        <svg viewBox="0 0 240 240" role="img" aria-label={`Активность: движение ${goal?100:78}%, упражнения 52%, разминка 90%`}>
          <defs>
            <filter id={`${ringId}-clay`} x="-25%" y="-25%" width="150%" height="160%" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="erode" radius="2.2" result="core"/>
              <feGaussianBlur in="core" stdDeviation={4.5 * softness} result="dome"/>
              <feMorphology in="SourceAlpha" operator="erode" radius="3.2" result="crest"/>
              <feMorphology in="SourceAlpha" operator="erode" radius="1.8" result="innerRaw"/>
              <feGaussianBlur in="innerRaw" stdDeviation={1.6 * softness} result="innerMask"/>
              <feOffset in="crest" dx={-1.6 * x * volume} dy={-2.2 * y * volume} result="highlightShift"/>
              <feGaussianBlur in="highlightShift" stdDeviation={2.6 * softness} result="highlightBlur"/>
              <feFlood floodColor="#FFFFFF" floodOpacity={.44 * volume} result="highlightColor"/>
              <feComposite in="highlightColor" in2="highlightBlur" operator="in" result="highlightUnmasked"/>
              <feComposite in="highlightUnmasked" in2="innerMask" operator="in" result="innerHighlight"/>
              <feOffset in="SourceAlpha" dx={-3.2 * x * volume} dy={-3.8 * y * volume} result="lightShift"/>
              <feGaussianBlur in="lightShift" stdDeviation={4.4 * softness} result="lightSide"/>
              <feComposite in="SourceAlpha" in2="lightSide" operator="out" result="shadeShape"/>
              <feFlood floodColor="#6E4F66" floodOpacity={.11 * strength * volume} result="shadeColor"/>
              <feComposite in="shadeColor" in2="shadeShape" operator="in" result="shadeUnmasked"/>
              <feComposite in="shadeUnmasked" in2="innerMask" operator="in" result="innerShade"/>
              <feComposite in="innerShade" in2="SourceGraphic" operator="over" result="shadedBody"/>
              <feComposite in="innerHighlight" in2="shadedBody" operator="over" result="clayBody"/>
              <feDropShadow in="clayBody" dx={1.5 * x * volume} dy={3.8 * y * volume} stdDeviation={3.5 * softness} floodColor="#785A72" floodOpacity={.18 * strength * volume}/>
            </filter>
            <filter id={`${ringId}-track`} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="erode" radius="1.8" result="tInnerRaw"/>
              <feGaussianBlur in="tInnerRaw" stdDeviation={1.6 * softness} result="tInnerMask"/>
              <feOffset in="SourceAlpha" dx={2.4 * x * volume} dy={3 * y * volume} result="tLitShift"/>
              <feGaussianBlur in="tLitShift" stdDeviation={3.6 * softness} result="tLitBlur"/>
              <feComposite in="SourceAlpha" in2="tLitBlur" operator="out" result="tUpperGroove"/>
              <feFlood floodColor="#7D6278" floodOpacity={.07 * strength * volume} result="tGrooveTint"/>
              <feComposite in="tGrooveTint" in2="tUpperGroove" operator="in" result="tGrooveRaw"/>
              <feComposite in="tGrooveRaw" in2="tInnerMask" operator="in" result="tGroove"/>
              <feOffset in="SourceAlpha" dx={-2.2 * x * volume} dy={-2.8 * y * volume} result="tHighShift"/>
              <feGaussianBlur in="tHighShift" stdDeviation={3.4 * softness} result="tHighBlur"/>
              <feComposite in="SourceAlpha" in2="tHighBlur" operator="out" result="tLowerGlow"/>
              <feFlood floodColor="#FFFFFF" floodOpacity={.5 * volume} result="tGlowTint"/>
              <feComposite in="tGlowTint" in2="tLowerGlow" operator="in" result="tGlowRaw"/>
              <feComposite in="tGlowRaw" in2="tInnerMask" operator="in" result="tGlow"/>
              <feComposite in="tGroove" in2="SourceGraphic" operator="over" result="tTrackBody"/>
              <feComposite in="tGlow" in2="tTrackBody" operator="over"/>
            </filter>
            {rings.map(({r,top,color,edge})=><linearGradient key={r} id={`${ringId}-ring-${r}`} x1={.5 - .5 * x} y1={.5 - .5 * y} x2={.5 + .3 * x} y2={.5 + .5 * y}><stop offset="0" stopColor={clayMaterialColor(color, top, volume)}/><stop offset=".48" stopColor={color}/><stop offset="1" stopColor={clayMaterialColor(color, edge, volume)}/></linearGradient>)}
          </defs>
          {rings.map(({r,p,track})=><g key={r} fill="none" strokeWidth="20" strokeLinecap="round">
            <circle cx="120" cy="120" r={r} stroke={track} filter={`url(#${ringId}-track)`}/>
            <path className="ref-ring-progress" pathLength="100" strokeDasharray={`${p*100} 100`} d={arc(r)} stroke={`url(#${ringId}-ring-${r})`} filter={`url(#${ringId}-clay)`}/>
          </g>)}
          <g className="ref-ring-center" textAnchor="middle">
            <text className="ref-ring-number" x="120" y="113" dominantBaseline="middle">{goal?'950':'742'}</text>
            <text className="ref-ring-caption" x="120" y="129"><tspan x="120">kcal burned</tspan><tspan x="120" dy="11">today</tspan></text>
          </g>
        </svg>
      </div>
      <div className="ref-ring-legend"><span><i className="coral"/>Move {goal?'100':'78'}%</span><span><i className="mint"/>Exercise 52%</span><span><i className="sky"/>Stand 90%</span></div>
      <button type="button" data-clay-layer="control" data-clay-text="raised" className="ref-surface cream ref-small-button" onClick={()=>setGoal(!goal)}>{goal?'Reset demo':'Complete daily goal'}<Check data-clay-layer="detail" size={14}/></button>
    </section>;
  }

  if (kind === 'filter-chips') return <section className="ref-filter">
    <label data-clay-layer="control" className="ref-surface sky ref-search"><Search data-clay-layer="detail" size={22}/><input aria-label="Поиск категории" placeholder="Find your soft spot…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button type="button" className="ref-icon-button" aria-label="Очистить поиск" onClick={()=>setQuery('')}><X data-clay-layer="detail" size={16}/></button>}</label>
    <div className="ref-chips">{['All','Shoes','Bags','Accessories'].filter(c=>c==='All'||c.toLowerCase().includes(query.toLowerCase())).map((c,i)=><button type="button" data-clay-layer="control" data-clay-text="raised" key={c} aria-pressed={c===category} onClick={()=>setCategory(c)} className={`ref-surface ref-small-button ${c===category?'coral':['cream','lavender','mint','butter'][i]}`}>{c}</button>)}</div>
    <div className="ref-between"><b>Price range</b><output htmlFor="ref-price">$20 — ${price}</output></div><input id="ref-price" aria-label="Максимальная цена" className="ref-range" type="range" min="20" max="180" value={price} onChange={e=>setPrice(Number(e.target.value))}/>
    <button type="button" data-clay-layer="control" data-clay-text="raised" className="ref-surface coral ref-button" onClick={()=>setMessage(`${category} · up to $${price}`)}>Apply filters <Check data-clay-layer="detail" size={16}/></button><span className="ref-feedback" role="status">{message || 'Pick a color. Find a favorite.'}</span>
  </section>;
  return null;
}

export function ClayControlBoard() {
  const [liked,setLiked]=useState(false);
  const [confirmed,setConfirmed]=useState(false);
  const [enabled,setEnabled]=useState(true);
  const [tab,setTab]=useState('Home');
  const [volume,setVolume]=useState(55);
  const [bell,setBell]=useState(false);
  const [settings,setSettings]=useState(false);
  return <div className="ref-control-board">
    <label data-clay-layer="control" className="ref-surface peach ref-search ref-main-search"><Search data-clay-layer="detail"/><input aria-label="Поиск по демо-панели" placeholder="Search…"/></label>
    <div className="ref-left-controls"><button type="button" data-clay-layer="control" aria-label="Нравится" aria-pressed={liked} className={`ref-surface coral ref-heart ${liked?'is-liked':''}`} onClick={()=>setLiked(!liked)}><ClaySculptedIcon name="heart"/></button><label data-clay-layer="control" className="ref-surface mint ref-vertical-control"><input aria-label="Громкость" type="range" min="0" max="100" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label></div>
    <div data-clay-layer="foundation" className="ref-surface lavender ref-confirm-card"><div className="ref-profile"><span data-clay-layer="detail" data-clay-shape="disc" className="ref-surface mint ref-profile-dot"/><div><i data-clay-layer="detail" className="ref-surface lavender"/><i data-clay-layer="detail" className="ref-surface lavender"/></div></div><button type="button" data-clay-layer="control" data-clay-text="raised" className="ref-surface coral ref-confirm" onClick={()=>setConfirmed(!confirmed)}>{confirmed?<><Check data-clay-layer="detail"/> Confirmed</>:'Confirm'}</button><button type="button" data-clay-layer="control" role="switch" aria-label="Включить уведомления" aria-checked={enabled} className={`ref-surface sky ref-switch ${enabled?'is-on':''}`} onClick={()=>setEnabled(!enabled)}><span data-clay-layer="detail" data-clay-shape="disc" className="ref-surface cream"/></button></div>
    <div className="ref-utility-buttons"><button type="button" data-clay-layer="control" aria-label="Уведомления" aria-pressed={bell} className={`ref-surface cream ref-square ${bell?'ref-bell-active':''}`} onClick={()=>setBell(!bell)}><ClaySculptedIcon name="bell"/></button><button type="button" data-clay-layer="control" aria-label="Настройки" aria-pressed={settings} className="ref-surface lavender ref-square" onClick={()=>setSettings(!settings)}><ClaySculptedIcon name="settings" style={{transform:`rotate(${settings?90:0}deg)`}}/></button></div>
    <nav data-clay-layer="foundation" className="ref-surface cream ref-segmented" aria-label="Демо-навигация">{([{label:'Home',icon:'home'},{label:'Stats',icon:'stats'},{label:'Profile',icon:'profile'}] as const).map(({label,icon})=><button type="button" data-clay-layer="control" key={label} aria-current={tab===label?'page':undefined} onClick={()=>setTab(label)} className={tab===label?'ref-surface sky':'ref-surface cream'}><ClaySculptedIcon name={icon}/><span data-clay-text="raised">{label}</span></button>)}</nav>
    <div className="ref-board-feedback" role="status">{settings ? 'Settings are open · try the generator to customize this kit' : bell ? 'You’re all caught up. Have a lovely day!' : `${tab} · ${enabled?'Notifications on':'Quiet mode'}`}</div>
  </div>;
}
