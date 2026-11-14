import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Sparkles, Layers, MessageCircle, Compass } from 'lucide-react';
import { buildSymmetricalNotch, getTabCenterX, calculateTransitDuration, computeFramePhysics } from '../utils/notchMath';
import './sticker-notch-nav.css';

// Visual/physics source: TG_Sticker_Studio/components/AdaptiveNotchNav.tsx,
// clay-lavender theme. No Telegram, sound, or haptics dependency in this adapter.
const STICKER_TABS = [
  { id: 'create', label: 'Создать', icon: Sparkles },
  { id: 'packs', label: 'Мои паки', icon: Layers, badge: 3 },
  { id: 'chat', label: 'Чат', icon: MessageCircle },
  { id: 'explore', label: 'Лента', icon: Compass },
] as const;

export type StickerTabId = typeof STICKER_TABS[number]['id'];

export function StickerNotchNav({activeId, onSelect, speed = .6}: {
  activeId: StickerTabId;
  onSelect: (id: StickerTabId) => void;
  speed?: number;
}) {
  const uid = useId().replace(/:/g, '');
  const reduced = useReducedMotion();
  const host = useRef<HTMLElement>(null);
  const panel = useRef<SVGPathElement>(null);
  const rim = useRef<SVGPathElement>(null);
  const orb = useRef<HTMLDivElement>(null);
  const orbIcon = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const position = useRef<number | null>(null);
  const previousWidth = useRef(0);
  const [width, setWidth] = useState(360);
  const [ready, setReady] = useState(false);
  const [displayedId, setDisplayedId] = useState(activeId);
  const activeIndex = Math.max(0, STICKER_TABS.findIndex(tab => tab.id === activeId));
  const displayedTab = STICKER_TABS.find(tab => tab.id === displayedId) || STICKER_TABS[0];
  const OrbIcon = displayedTab.icon;
  const target = getTabCenterX(activeIndex, width, STICKER_TABS.length);
  // Keep the first/last cradle centered even inside narrow generator previews.
  const gap = Math.max(3, Math.min(8.5, getTabCenterX(0,width,STICKER_TABS.length)-29));
  const path = (x: number) => buildSymmetricalNotch({width, centerX:x, gap, bottomCornerRadius:28});

  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    const measure = () => { if (el.clientWidth > 0) { setWidth(el.clientWidth); setReady(true); } };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!ready || !orb.current || !panel.current) return;
    const paint = (x: number, y = 0, sx = 1, sy = 1, opacity = 1, iconScale = 1) => {
      position.current = x;
      const d = path(x);
      panel.current?.setAttribute('d', d);
      rim.current?.setAttribute('d', d);
      if (orb.current) {
        orb.current.style.left = `${x}px`;
        orb.current.style.top = `${22-y}px`;
        orb.current.style.transform = `translate(-50%,-50%) scale(${sx},${sy})`;
      }
      if (orbIcon.current) {
        orbIcon.current.style.opacity = String(opacity);
        orbIcon.current.style.transform = `scale(${iconScale})`;
      }
    };
    const start = position.current;
    const resized = previousWidth.current !== width;
    previousWidth.current = width;
    if (start === null || resized || reduced || Math.abs(target-start) < .5) {
      paint(target);
      setDisplayedId(activeId);
      host.current?.setAttribute('data-phase', 'idle');
      return;
    }
    const duration = calculateTransitDuration(target-start, Math.max(.25, Math.min(2.5, speed)));
    const began = performance.now();
    let switched = false;
    host.current?.setAttribute('data-phase', 'in-flight');
    const step = (now: number) => {
      const t = Math.min(1, (now-began)/duration);
      const state = computeFramePhysics(t, start, target-start);
      paint(state.x,state.arcY,state.scaleX,state.scaleY,state.iconOpacity,state.iconScale);
      if (state.shouldSwitchIcon && !switched) { switched = true; setDisplayedId(activeId); }
      if (t < 1) frame.current = requestAnimationFrame(step);
      else { paint(target); setDisplayedId(activeId); host.current?.setAttribute('data-phase', 'idle'); }
    };
    frame.current = requestAnimationFrame(step);
    return () => { if (frame.current !== null) cancelAnimationFrame(frame.current); };
  }, [activeId, target, width, ready, reduced, speed]);

  const onKey = (event: React.KeyboardEvent, index: number) => {
    let next: number;
    if (event.key === 'ArrowRight') next = (index+1)%STICKER_TABS.length;
    else if (event.key === 'ArrowLeft') next = (index-1+STICKER_TABS.length)%STICKER_TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = STICKER_TABS.length-1;
    else return;
    event.preventDefault();
    onSelect(STICKER_TABS[next].id);
    host.current?.querySelectorAll('button')[next]?.focus();
  };

  return <nav ref={host} className="sticker-notch" aria-label="Нижнее меню с пластилиновой выемкой" style={{opacity:ready?1:0}}>
    <svg className="sticker-notch-panel" viewBox={`0 0 ${width} 90`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-fill`} x1="0" y1="22" x2={width*.28} y2="90" gradientUnits="userSpaceOnUse"><stop stopColor="#C7ACF0"/><stop offset="1" stopColor="#AA86DF"/></linearGradient>
        <filter id={`${uid}-bevel`} x="-10%" y="-20%" width="120%" height="150%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="lightBlur"/><feOffset in="lightBlur" dx="2" dy="4" result="lightOffset"/><feComposite in="SourceAlpha" in2="lightOffset" operator="out" result="lightMask"/><feFlood floodColor="#FFFFFF" floodOpacity=".6" result="lightColor"/><feComposite in="lightColor" in2="lightMask" operator="in" result="light"/>
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.6" result="shadeBlur"/><feOffset in="shadeBlur" dx="-2" dy="-5" result="shadeOffset"/><feComposite in="SourceAlpha" in2="shadeOffset" operator="out" result="shadeMask"/><feFlood floodColor="#6947AE" floodOpacity=".34" result="shadeColor"/><feComposite in="shadeColor" in2="shadeMask" operator="in" result="shade"/>
          <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/><feMergeNode in="light"/></feMerge>
        </filter>
      </defs>
      <path ref={rim} d={path(target)} transform="translate(0 3.5)" fill="#8A67CC" opacity=".82"/>
      <path ref={panel} d={path(target)} fill={`url(#${uid}-fill)`} filter={`url(#${uid}-bevel)`}/>
    </svg>
    <div ref={orb} className="sticker-notch-orb" style={{left:target}} aria-hidden="true"><div ref={orbIcon} className="sticker-notch-orb-icon"><OrbIcon size={23} strokeWidth={2.2}/>{'badge' in displayedTab && <span className="sticker-notch-badge">{displayedTab.badge}</span>}</div></div>
    <div className="sticker-notch-items">
      {STICKER_TABS.map((tab,index) => { const Icon = tab.icon; const active = activeId===tab.id; return <button key={tab.id} type="button" aria-label={tab.label} aria-current={active?'page':undefined} tabIndex={active?0:-1} onKeyDown={event=>onKey(event,index)} onClick={()=>onSelect(tab.id)}>
        <span className="sticker-notch-dock-icon" style={{opacity:active?0:1}} aria-hidden="true"><Icon size={21} strokeWidth={2}/>{'badge' in tab && <span className="sticker-notch-badge">{tab.badge}</span>}</span>
        <span className="sticker-notch-label" style={{opacity:active?1:0}}>{tab.label}</span>
      </button>;})}
    </div>
  </nav>;
}

export function StickerNotchNavDemo() {
  const [active, setActive] = useState<StickerTabId>('create');
  return <div className="sticker-notch-demo"><StickerNotchNav activeId={active} onSelect={setActive}/><p role="status">{STICKER_TABS.find(tab=>tab.id===active)?.label}</p></div>;
}
