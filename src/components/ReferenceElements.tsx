import React, { useState, useId } from 'react';
import { Bell, Bookmark, Check, ChevronLeft, ChevronRight, Clock, Download, Dumbbell, Heart, Home, Mail, MessageCircle, Plus, Search, Settings, ShoppingBag, Star, User, X } from 'lucide-react';

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
    {['Active', 'Pending', 'Archived'].map((status, i) => <span className={`ref-surface ref-status ${['mint', 'butter', 'lavender'][i]}`} key={status}><i aria-hidden="true" />{status}</span>)}
  </div>;

  if (kind === 'action-rows') return <div className="ref-action-stack">
    {[{ label: 'Messages', icon: Mail, color: 'butter', text: 'You’re all caught up · 3 messages' }, { label: 'Bookmarks', icon: Bookmark, color: 'butter', text: 'Your collection · 12 bookmarks' }, { label: 'Download', icon: Download, color: 'mint', text: 'Your clay kit is ready to export in the generator' }].map(({ label, icon: Icon, color, text }) => <button type="button" className={`ref-surface ref-action ${color}`} key={label} onClick={() => setMessage(text)}><span className={`ref-surface ref-medallion ${color}`}><Icon /></span><b>{label}</b><ChevronRight size={22}/></button>)}
    <span role="status" className="ref-feedback">{message || 'A little order. A lot of softness.'}</span>
  </div>;

  if (kind === 'clay-calendar') {
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const monthName = new Date(year, month, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' });
    return <section className="ref-surface cream ref-calendar">
      <div className="ref-between"><h3>{title || monthName}</h3><div className="ref-inline"><button type="button" className="ref-icon-button" aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)}><ChevronLeft size={18}/></button><button type="button" className="ref-icon-button" aria-label="Следующий месяц" onClick={() => changeMonth(1)}><ChevronRight size={18}/></button></div></div>
      <div className="ref-days">{['M','T','W','T','F','S','S'].map((d,i)=><span key={`week-${i}`} className="ref-weekday">{d}</span>)}{Array.from({length:firstDay},(_,i)=><span key={`blank-${i}`}/>)}{Array.from({length:days},(_,i)=>{ const key = `${year}-${String(month+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`; return <button type="button" aria-label={key} aria-pressed={selectedDay===key} key={key} className={selectedDay===key ? 'ref-surface coral' : ''} onClick={()=>setSelectedDay(key)}>{i+1}</button>; })}</div>
      <div className="ref-calendar-note"><i/> <span role="status">Selected · {selectedDay}</span></div>
    </section>;
  }

  if (kind === 'product-card') return <article className="ref-surface mint ref-product">
    <div className="ref-between"><span className="ref-eyebrow">THE SOFT COLLECTION</span><button type="button" className="ref-surface cream ref-icon-button" aria-label="Добавить в избранное" aria-pressed={liked} onClick={()=>setLiked(!liked)}><Heart size={19} fill={liked ? '#a18bd9' : 'none'}/></button></div>
    <div className="ref-bag" role="img" aria-label="Объёмная персиковая сумка"><div className="ref-bag-handle"/><div className="ref-bag-body"><i/><i/></div></div>
    <h3>{title || 'Clay Tote'}</h3><div className="ref-rating" aria-label="Рейтинг 4 из 5">{[0,1,2,3,4].map(i=><Star key={i} size={15} fill={i<4?'#ffe17c':'#fff'} strokeWidth={0}/>)}<span>(98)</span></div>
    <div className="ref-between"><strong className="ref-price">$67 <del>$110</del></strong><button type="button" className="ref-surface cream ref-small-button" aria-pressed={added} onClick={()=>setAdded(!added)}>{added?<Check size={15}/>:<Plus size={15}/>} {added?'Added':'Add'}</button></div>
    <span className="ref-sr-only" role="status">{added ? 'Товар добавлен в демо-корзину' : ''}</span>
  </article>;

  if (kind === 'workout-card') return <article className="ref-surface lavender ref-workout">
    <div className="ref-between"><span className="ref-eyebrow">A LITTLE STRONGER</span><span className="ref-surface cream ref-time"><Clock size={13}/> 35 min</span></div>
    <div className="ref-dumbbell" role="img" aria-label="Объёмная сиреневая гантель"><i/><i/><i/><i/><i/></div>
    <h3>{title || 'Upper body'}</h3><p>Find your strength.<br/>At your own pace.</p>
    <button type="button" className="ref-surface coral ref-button" aria-pressed={running} onClick={()=>setRunning(!running)}>{running?<Check size={17}/>:<Dumbbell size={17}/>} {running ? 'Session started' : 'Start workout'}</button>
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
              <feGaussianBlur in="core" stdDeviation="4.5" result="dome"/>
              <feMorphology in="SourceAlpha" operator="erode" radius="3.2" result="crest"/>
              <feMorphology in="SourceAlpha" operator="erode" radius="1.8" result="innerRaw"/>
              <feGaussianBlur in="innerRaw" stdDeviation="1.6" result="innerMask"/>
              <feOffset in="crest" dx="-1.6" dy="-2.2" result="highlightShift"/>
              <feGaussianBlur in="highlightShift" stdDeviation="2.6" result="highlightBlur"/>
              <feFlood floodColor="#FFFFFF" floodOpacity="0.44" result="highlightColor"/>
              <feComposite in="highlightColor" in2="highlightBlur" operator="in" result="highlightUnmasked"/>
              <feComposite in="highlightUnmasked" in2="innerMask" operator="in" result="innerHighlight"/>
              <feOffset in="SourceAlpha" dx="-3.2" dy="-3.8" result="lightShift"/>
              <feGaussianBlur in="lightShift" stdDeviation="4.4" result="lightSide"/>
              <feComposite in="SourceAlpha" in2="lightSide" operator="out" result="shadeShape"/>
              <feFlood floodColor="#6E4F66" floodOpacity="0.11" result="shadeColor"/>
              <feComposite in="shadeColor" in2="shadeShape" operator="in" result="shadeUnmasked"/>
              <feComposite in="shadeUnmasked" in2="innerMask" operator="in" result="innerShade"/>
              <feComposite in="innerShade" in2="SourceGraphic" operator="over" result="shadedBody"/>
              <feComposite in="innerHighlight" in2="shadedBody" operator="over" result="clayBody"/>
              <feDropShadow in="clayBody" dx="1.5" dy="3.8" stdDeviation="3.5" floodColor="#785A72" floodOpacity="0.18"/>
            </filter>
            <filter id={`${ringId}-track`} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="erode" radius="1.8" result="tInnerRaw"/>
              <feGaussianBlur in="tInnerRaw" stdDeviation="1.6" result="tInnerMask"/>
              <feOffset in="SourceAlpha" dx="2.4" dy="3.0" result="tLitShift"/>
              <feGaussianBlur in="tLitShift" stdDeviation="3.6" result="tLitBlur"/>
              <feComposite in="SourceAlpha" in2="tLitBlur" operator="out" result="tUpperGroove"/>
              <feFlood floodColor="#7D6278" floodOpacity="0.07" result="tGrooveTint"/>
              <feComposite in="tGrooveTint" in2="tUpperGroove" operator="in" result="tGrooveRaw"/>
              <feComposite in="tGrooveRaw" in2="tInnerMask" operator="in" result="tGroove"/>
              <feOffset in="SourceAlpha" dx="-2.2" dy="-2.8" result="tHighShift"/>
              <feGaussianBlur in="tHighShift" stdDeviation="3.4" result="tHighBlur"/>
              <feComposite in="SourceAlpha" in2="tHighBlur" operator="out" result="tLowerGlow"/>
              <feFlood floodColor="#FFFFFF" floodOpacity="0.50" result="tGlowTint"/>
              <feComposite in="tGlowTint" in2="tLowerGlow" operator="in" result="tGlowRaw"/>
              <feComposite in="tGlowRaw" in2="tInnerMask" operator="in" result="tGlow"/>
              <feComposite in="tGroove" in2="SourceGraphic" operator="over" result="tTrackBody"/>
              <feComposite in="tGlow" in2="tTrackBody" operator="over"/>
            </filter>
            {rings.map(({r,top,color,edge})=><linearGradient key={r} id={`${ringId}-ring-${r}`} x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stopColor={top}/><stop offset=".48" stopColor={color}/><stop offset="1" stopColor={edge}/></linearGradient>)}
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
      <button type="button" className="ref-surface cream ref-small-button" onClick={()=>setGoal(!goal)}>{goal?'Reset demo':'Complete daily goal'}<Check size={14}/></button>
    </section>;
  }

  if (kind === 'filter-chips') return <section className="ref-filter">
    <label className="ref-surface sky ref-search"><Search size={22}/><input aria-label="Поиск категории" placeholder="Find your soft spot…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button type="button" className="ref-icon-button" aria-label="Очистить поиск" onClick={()=>setQuery('')}><X size={16}/></button>}</label>
    <div className="ref-chips">{['All','Shoes','Bags','Accessories'].filter(c=>c==='All'||c.toLowerCase().includes(query.toLowerCase())).map((c,i)=><button type="button" key={c} aria-pressed={c===category} onClick={()=>setCategory(c)} className={`ref-surface ref-small-button ${c===category?'coral':['cream','lavender','mint','butter'][i]}`}>{c}</button>)}</div>
    <div className="ref-between"><b>Price range</b><output htmlFor="ref-price">$20 — ${price}</output></div><input id="ref-price" aria-label="Максимальная цена" className="ref-range" type="range" min="20" max="180" value={price} onChange={e=>setPrice(Number(e.target.value))}/>
    <button type="button" className="ref-surface coral ref-button" onClick={()=>setMessage(`${category} · up to $${price}`)}>Apply filters <Check size={16}/></button><span className="ref-feedback" role="status">{message || 'Pick a color. Find a favorite.'}</span>
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
    <label className="ref-surface peach ref-search ref-main-search"><Search/><input aria-label="Поиск по демо-панели" placeholder="Search…"/></label>
    <div className="ref-left-controls"><button type="button" aria-label="Нравится" aria-pressed={liked} className={`ref-surface coral ref-heart ${liked?'is-liked':''}`} onClick={()=>setLiked(!liked)}><Heart fill="white" stroke="white"/></button><label className="ref-surface mint ref-vertical-control"><input aria-label="Громкость" type="range" min="0" max="100" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label></div>
    <div className="ref-surface lavender ref-confirm-card"><div className="ref-profile"><span className="ref-surface mint ref-profile-dot"/><div><i className="ref-surface lavender"/><i className="ref-surface lavender"/></div></div><button type="button" className="ref-surface coral ref-confirm" onClick={()=>setConfirmed(!confirmed)}>{confirmed?<><Check/> Confirmed</>:'Confirm'}</button><button type="button" role="switch" aria-label="Включить уведомления" aria-checked={enabled} className={`ref-surface sky ref-switch ${enabled?'is-on':''}`} onClick={()=>setEnabled(!enabled)}><span className="ref-surface cream"/></button></div>
    <div className="ref-utility-buttons"><button type="button" aria-label="Уведомления" aria-pressed={bell} className={`ref-surface cream ref-square ${bell?'ref-bell-active':''}`} onClick={()=>setBell(!bell)}><Bell fill="#aa8be5"/></button><button type="button" aria-label="Настройки" aria-pressed={settings} className="ref-surface lavender ref-square" onClick={()=>setSettings(!settings)}><Settings style={{transform:`rotate(${settings?90:0}deg)`}}/></button></div>
    <nav className="ref-surface cream ref-segmented" aria-label="Демо-навигация">{[{label:'Home',icon:Home},{label:'Stats',icon:ShoppingBag},{label:'Profile',icon:User}].map(({label,icon:Icon})=><button type="button" key={label} aria-current={tab===label?'page':undefined} onClick={()=>setTab(label)} className={tab===label?'ref-surface sky':'ref-surface cream'}><Icon fill={tab===label?'#7160a4':'none'}/><span>{label}</span></button>)}</nav>
    <div className="ref-board-feedback" role="status">{settings ? 'Settings are open · try the generator to customize this kit' : bell ? 'You’re all caught up. Have a lovely day!' : `${tab} · ${enabled?'Notifications on':'Quiet mode'}`}</div>
  </div>;
}
