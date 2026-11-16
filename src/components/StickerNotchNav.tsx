import React, { useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useReducedMotion } from 'motion/react';
import { buildSymmetricalNotch, getTabCenterX, calculateTransitDuration, computeFramePhysics } from '../utils/notchMath';
import './sticker-notch-nav.css';

// Visual/physics source: TG_Sticker_Studio/components/AdaptiveNotchNav.tsx,
// clay-lavender theme. No Telegram, sound, or haptics dependency in this adapter.
const STICKER_TABS = [
  { id: 'create', label: 'Создать', icon: './assets/aistudio/icon_magic_wand_7de955e9.png' },
  { id: 'packs', label: 'Мои паки', icon: './assets/aistudio/welcome_gift_d09e2000.png', badge: 3 },
  { id: 'chat', label: 'Чат', icon: './assets/aistudio/icon_speech_bubbles_62f65106.png' },
  { id: 'explore', label: 'Лента', icon: './assets/aistudio/icon_telegram_plane_dd1b14fc.png' },
] as const;

export type StickerTabId = typeof STICKER_TABS[number]['id'];

// Self-contained bridge keeps the raw component export usable outside the studio.
const NOTCH_MATERIAL_DEFAULT = '1|1|1|1';
const getNotchServerMaterial = () => NOTCH_MATERIAL_DEFAULT;
function getNotchMaterialSnapshot() {
  if (typeof document === 'undefined') return NOTCH_MATERIAL_DEFAULT;
  const style = getComputedStyle(document.documentElement);
  return ['--clay-volume', '--clay-shadow-softness', '--clay-light-x', '--clay-light-y']
    .map(name => style.getPropertyValue(name).trim() || '1').join('|');
}
function subscribeNotchMaterial(onChange: () => void) {
  window.addEventListener('clay-material-change', onChange);
  return () => window.removeEventListener('clay-material-change', onChange);
}

export function StickerNotchNav({activeId, onSelect, speed = .6}: {
  activeId: StickerTabId;
  onSelect: (id: StickerTabId) => void;
  speed?: number;
}) {
  const uid = useId().replace(/:/g, '');
  const reduced = useReducedMotion();
  const materialSnapshot = useSyncExternalStore(subscribeNotchMaterial, getNotchMaterialSnapshot, getNotchServerMaterial);
  const materialValues = materialSnapshot.split('|').map(Number);
  const bounded = (index: number, low: number, high: number) => Number.isFinite(materialValues[index]) ? Math.min(high, Math.max(low, materialValues[index])) : 1;
  const material = { volume: bounded(0, .6, 1.5), softness: bounded(1, .6, 1.5), x: bounded(2, -1, 1), y: bounded(3, -1, 1) };
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
      // Begin the same 260ms growth halfway through the flight.
      const grow = Math.max(0, Math.min(1, (now-began-duration*.5)/260));
      const eased = 1-Math.pow(1-grow,3);
      if (t < 1) {
        paint(state.x,state.arcY,state.scaleX,state.scaleY,state.shouldSwitchIcon?Math.min(1,grow*3):state.iconOpacity,state.shouldSwitchIcon?eased:state.iconScale);
        if (state.shouldSwitchIcon && !switched) { switched = true; setDisplayedId(activeId); }
        frame.current = requestAnimationFrame(step);
      } else {
        host.current?.setAttribute('data-phase', 'settling');
        paint(target,0,1,1,Math.min(1,grow*3),eased);
        setDisplayedId(activeId);
        if (grow < 1) frame.current = requestAnimationFrame(step);
        else { paint(target); host.current?.setAttribute('data-phase', 'idle'); }
      }
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
        <linearGradient id={`${uid}-fill`} x1={material.x > 0 ? 0 : width} y1={material.y > 0 ? 22 : 90} x2={width*(material.x > 0 ? .28 : .72)} y2={material.y > 0 ? 90 : 22} gradientUnits="userSpaceOnUse"><stop stopColor="#BFA0E9"/><stop offset=".55" stopColor="#BB9DE6"/><stop offset="1" stopColor="#B79BE2"/></linearGradient>
        <linearGradient id={`${uid}-side`} x1="0" y1="22" x2="0" y2="94" gradientUnits="userSpaceOnUse"><stop stopColor="#AE8DD9"/><stop offset="1" stopColor="#9270C6"/></linearGradient>
        <filter id={`${uid}-bevel`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          {/* The unblurred silhouette stays pigmented; the rounded light crest sits inside it. */}
          <feMorphology in="SourceAlpha" operator="erode" radius={.8*material.volume} result="edgeGuard"/>
          <feMorphology in="SourceAlpha" operator="erode" radius={4*material.volume} result="faceCore"/>
          <feGaussianBlur in="faceCore" stdDeviation={1.8*material.volume*material.softness} result="shoulderBlur"/>
          <feOffset in="shoulderBlur" dx={2.5*material.x*material.volume} dy={3.8*material.y*material.volume} result="shoulderOffset"/>
          <feComposite in="shoulderBlur" in2="shoulderOffset" operator="out" result="shoulderBand"/>
          <feComposite in="shoulderBand" in2="edgeGuard" operator="in" result="shoulderMask"/>
          <feFlood floodColor="#FFFFFF" floodOpacity=".28" result="shoulderColor"/>
          <feComposite in="shoulderColor" in2="shoulderMask" operator="in" result="shoulder"/>
          <feGaussianBlur in="faceCore" stdDeviation={1.2*material.volume*Math.sqrt(material.softness)} result="crestBlur"/>
          <feOffset in="crestBlur" dx={1.4*material.x*material.volume} dy={2.2*material.y*material.volume} result="crestOffset"/>
          <feComposite in="crestBlur" in2="crestOffset" operator="out" result="crestBand"/>
          <feComposite in="crestBand" in2="edgeGuard" operator="in" result="crestMask"/>
          <feFlood floodColor="#FFF9FF" floodOpacity=".35" result="crestColor"/>
          <feComposite in="crestColor" in2="crestMask" operator="in" result="crest"/>
          <feOffset in="shoulderBlur" dx={-2*material.x*material.volume} dy={-3.5*material.y*material.volume} result="shadeOffset"/>
          <feComposite in="shoulderBlur" in2="shadeOffset" operator="out" result="shadeBand"/>
          <feComposite in="shadeBand" in2="edgeGuard" operator="in" result="shadeMask"/>
          <feFlood floodColor="#7852B6" floodOpacity=".2" result="shadeColor"/>
          <feComposite in="shadeColor" in2="shadeMask" operator="in" result="shade"/>
          <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/><feMergeNode in="shoulder"/><feMergeNode in="crest"/></feMerge>
        </filter>
      </defs>
      {/* Extrusion follows the fixed camera, while illumination follows the shared light. */}
      <path ref={rim} d={path(target)} transform={`translate(0 ${3.5*material.volume})`} fill={`url(#${uid}-side)`}/>
      <path ref={panel} d={path(target)} fill={`url(#${uid}-fill)`} filter={`url(#${uid}-bevel)`}/>
    </svg>
    <div ref={orb} className="sticker-notch-orb" style={{left:target}} aria-hidden="true"><div ref={orbIcon} className="sticker-notch-orb-icon"><img className="sticker-notch-clay-icon" src={displayedTab.icon} alt="" draggable={false}/>{'badge' in displayedTab && <span className="sticker-notch-badge">{displayedTab.badge}</span>}</div></div>
    <div className="sticker-notch-items">
      {STICKER_TABS.map((tab,index) => { const active = activeId===tab.id; return <button key={tab.id} type="button" aria-label={tab.label} aria-current={active?'page':undefined} tabIndex={active?0:-1} onKeyDown={event=>onKey(event,index)} onClick={()=>onSelect(tab.id)}>
        <span className={`sticker-notch-dock-icon${active?' is-selected':''}`} aria-hidden="true"><img className="sticker-notch-clay-icon" src={tab.icon} alt="" draggable={false}/>{'badge' in tab && <span className="sticker-notch-badge">{tab.badge}</span>}</span>
        <span className="sticker-notch-label" style={{opacity:active?1:0}}>{tab.label}</span>
      </button>;})}
    </div>
  </nav>;
}

export function StickerNotchNavDemo() {
  const [active, setActive] = useState<StickerTabId>('create');
  return <div className="sticker-notch-demo"><StickerNotchNav activeId={active} onSelect={setActive}/><p role="status">{STICKER_TABS.find(tab=>tab.id===active)?.label}</p></div>;
}
