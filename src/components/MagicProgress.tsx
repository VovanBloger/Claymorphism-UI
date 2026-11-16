import React, { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { advanceMagicProgress, getCheckpointPositions, getCompletedCount, getMagicDurationMs, getStarLevels } from '../utils/magicProgress';
import { resolveClayAssetPath } from '../utils/clayEngine';
import './magic-progress.css';
import { useMaterialSettings } from './MaterialSettings';

const STARS = [
  { name: 'Искорка', crop: '65 260 300 283' },
  { name: 'Очарование', crop: '428 232 335 311' },
  { name: 'Сияние', crop: '815 207 362 336' },
  { name: 'Орбита', crop: '1213 179 441 369' },
  { name: 'Величие', crop: '1658 119 488 435' },
];
const STAR_PATH = 'M50 5 C56 5 61 24 67 28 C73 32 94 31 95 40 C97 48 79 59 77 66 C75 74 83 92 75 96 C68 100 56 86 50 85 C43 85 29 100 22 95 C15 90 24 73 22 66 C20 59 3 49 5 40 C7 32 27 32 33 28 C39 24 43 5 50 5Z';

/** Original reference characters, extracted onto a transparent atlas. */
function StarSprite({ level }: { level: number }) {
  return <svg className="magic-star-sprite" viewBox={STARS[level].crop} aria-hidden="true">
    <image href={resolveClayAssetPath('/assets/magic-progress/stars.png')} width="2172" height="724" />
  </svg>;
}

export function MagicProgress() {
  const id = useId().replace(/:/g, '');
  const { settings: material } = useMaterialSettings();
  const lightX = material.light.includes('right') ? -1 : 1;
  const lightY = material.light.includes('bottom') ? -1 : 1;
  const reduced = useReducedMotion();
  const [count, setCount] = useState(5);
  const [speed, setSpeed] = useState(1);
  const [thickness, setThickness] = useState(72);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const elapsedRef = useRef(0);
  const playback = useRef({ targetProgress: 1, rate: 1 });
  const duration = getMagicDurationMs(count);
  const progress = Math.min(1, elapsed / duration);
  const completed = getCompletedCount(progress, count);
  const positions = getCheckpointPositions(count);
  const levels = getStarLevels(count);

  const reset = (nextCount = count) => {
    setPlaying(false);
    setPreviewIndex(null);
    playback.current = { targetProgress: 1, rate: 1 };
    elapsedRef.current = 0;
    setElapsed(0);
    setCount(nextCount);
  };

  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      elapsedRef.current = playback.current.targetProgress * duration;
      setElapsed(elapsedRef.current);
      setPlaying(false);
      return;
    }
    let frame: number;
    let previous = performance.now();
    const tick = (now: number) => {
      // Background tabs and long stalls should not skip the little celebrations.
      const deltaMs = document.hidden ? 0 : Math.min(64, now - previous);
      previous = now;
      const next = advanceMagicProgress({ elapsedMs: elapsedRef.current, deltaMs: deltaMs * playback.current.rate, stageCount: count, speed, targetProgress: playback.current.targetProgress });
      elapsedRef.current = next.elapsedMs;
      setElapsed(next.elapsedMs);
      if (next.finished) setPlaying(false);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, count, duration, reduced]);

  const toggle = () => {
    if (progress >= 1) { elapsedRef.current = 0; setElapsed(0); setPreviewIndex(null); }
    if (!playing && (progress >= 1 || elapsedRef.current >= playback.current.targetProgress * duration)) {
      playback.current = { targetProgress: 1, rate: 1 };
    }
    setPlaying(value => !value);
  };

  const previewStage = (index: number) => {
    const start = index === 0 ? 0 : positions[index - 1];
    const targetProgress = index === count - 1 ? 1 : positions[index];
    // Every individual preview travels in 900 ms at 1x, regardless of stage count.
    playback.current = { targetProgress, rate: (targetProgress - start) * duration / 900 };
    elapsedRef.current = (reduced ? targetProgress : start) * duration;
    setElapsed(elapsedRef.current);
    setPreviewIndex(index);
    setPlaying(!reduced);
  };

  return <section className="magic-progress ref-playground" aria-labelledby={`${id}-title`}>
    <div className="ref-stage-label"><span>04 / A LITTLE COSMIC MAGIC</span><span>От искры до целой вселенной</span></div>
    <div className="magic-heading">
      <div><span className="magic-eyebrow"><Sparkles size={14} /> КОЛЛЕКЦИЯ ДОСТИЖЕНИЙ</span><h2 id={`${id}-title`}>Маленькие шаги. Большая магия.</h2><p>Нажмите на любую звезду или её название, чтобы посмотреть, как космос пробуждает этот этап.</p></div>
      <div className="magic-counter"><strong>{completed}<span> / {count}</span></strong><span>звёзд зажжено</span></div>
    </div>

    <div style={{ '--track-height': `${thickness}px`, '--spark-time': `${850/speed}ms`, '--nebula-time': `${6/speed}s`, '--twinkle-time': `${2.2/speed}s` } as React.CSSProperties} className={`magic-stage${playing ? ' is-playing' : ''}${progress === 1 ? ' is-complete' : ''}`}>
      <div className="magic-stage-caption"><span>{progress === 1 ? 'ВАША ВСЕЛЕННАЯ ЗАЖГЛАСЬ' : playing ? 'МАГИЯ УЖЕ В ПУТИ' : progress > 0 ? 'ПРОДОЛЖИМ ПУТЕШЕСТВИЕ?' : 'КАЖДАЯ ЗВЕЗДА — НОВАЯ ИСТОРИЯ'}</span><span>{Math.round(progress * 100)}%</span></div>
      <div className="magic-track-space">
        <div className="magic-track" role="progressbar" aria-label="Космический прогресс" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-valuetext={`${completed} из ${count} звёзд`}>
          <div className="magic-cosmos" style={{ clipPath: `inset(0 ${(1-progress)*100}% 0 0)` }}>
            <svg className="magic-nebula" viewBox="0 0 900 100" preserveAspectRatio="none" aria-hidden="true">
              <defs><filter id={`${id}-mist`}><feGaussianBlur stdDeviation="9"/></filter></defs>
              <g fill="none" filter={`url(#${id}-mist)`} opacity=".9"><path d="M-40 80 Q70 -20 160 60 T370 40 T580 60 T940 5" stroke="#fe83f1" strokeWidth="22"/><path d="M0 20 Q120 120 230 45 T480 50 T710 60 T920 10" stroke="#37cfff" strokeWidth="15"/></g>
              <path d="M-40 80 Q70 -20 160 60 T370 40 T580 60 T940 5" fill="none" stroke="#ffb4ff" strokeWidth="2" opacity=".7"/>
            </svg>
            {Array.from({ length: 34 }, (_, i) => <i className="magic-dust" key={i} style={{ left: `${(i*29.7)%100}%`, top: `${12+(i*37)%76}%`, '--delay': `${-(i%7)*.4}s`, '--dot': `${i%4 === 0 ? 4 : 2}px` } as React.CSSProperties}/>)}
          </div>
          {progress > 0 && progress < 1 && <div className="magic-front" style={{ left: `${progress*100}%` }}/ >}
        </div>
        {levels.map((level, index) => {
          const lit = index < completed;
          return <button type="button" key={`${count}-${index}`} aria-label={`Посмотреть этап ${index + 1}: ${STARS[level].name}`} aria-pressed={previewIndex === index} onClick={() => previewStage(index)} className={`magic-checkpoint${lit ? ' is-lit' : ''}${previewIndex !== null && index < previewIndex ? ' is-previous' : ''}`} data-level={level} style={{ left: `${positions[index]*100}%`, '--star-size': `clamp(${28+level*3}px, ${8.8+level*1.5}cqw, ${76+level*14}px)`, '--celebrate': `${(680+level*100)/speed}ms` } as React.CSSProperties}>
            <svg className="magic-slot" viewBox="0 0 100 102" aria-hidden="true"><defs><linearGradient id={`${id}-slot-${index}`} x1={lightX < 0 ? 1 : 0} y1={lightY < 0 ? 1 : 0} x2={lightX < 0 ? 0 : 1} y2={lightY < 0 ? 0 : 1}><stop stopColor="#bba3d6"/><stop offset="1" stopColor="#e8daf5"/></linearGradient><filter id={`${id}-inset-${index}`} x="-20%" y="-20%" width="140%" height="140%"><feOffset in="SourceAlpha" dx={2 * lightX * material.volume} dy={4 * lightY * material.volume} result="offset"/><feGaussianBlur in="offset" stdDeviation={3 * material.shadowSoftness} result="blur"/><feComposite in="SourceAlpha" in2="blur" operator="out" result="shadow"/><feFlood floodColor="#72518d" floodOpacity={.4 * material.shadowStrength}/><feComposite in2="shadow" operator="in"/><feComposite in2="SourceGraphic" operator="over"/></filter></defs><path d={STAR_PATH} fill={`url(#${id}-slot-${index})`} filter={`url(#${id}-inset-${index})`}/><path d={STAR_PATH} fill="none" stroke="#fff5ff" strokeWidth="2" opacity=".5" transform="translate(0 1)"/></svg>
            <span className="magic-aura"/>
            <span className="magic-character"><StarSprite level={level}/></span>
            <span className="magic-burst" aria-hidden="true">{Array.from({ length: 5+level*2 }, (_, n) => <i key={n} style={{ '--angle': `${n*360/(5+level*2)}deg`, '--distance': `${45+level*9}px` } as React.CSSProperties}>✦</i>)}</span>
            <span className="magic-checkpoint-label"><small>0{index+1}</small>{STARS[level].name}</span>
          </button>;
        })}
      </div>
      <div className="magic-stage-bottom"><span className="magic-live" role="status">{completed ? `${STARS[levels[completed-1]].name} ${completed === count ? '— финальная звезда ваша!' : 'зажглась. Дальше — ещё чудеснее.'}` : 'Нажмите «Запустить магию», чтобы разбудить звёзды.'}</span><span>✧ SOFT CLAY / DEEP SPACE</span></div>
    </div>

    <div className="magic-controls">
      <fieldset><legend>Количество этапов</legend><div className="magic-count-options">{[2,3,4,5].map(value => <button type="button" key={value} aria-pressed={count === value} aria-label={`${value} ${value === 5 ? 'этапов' : 'этапа'}`} onClick={() => reset(value)}>{value}</button>)}</div></fieldset>
      <label className="magic-range" htmlFor={`${id}-speed`}><span>Скорость <output>{speed.toLocaleString('ru-RU')}×</output></span><input id={`${id}-speed`} type="range" min="0.5" max="2" step="0.25" value={speed} onChange={event => setSpeed(Number(event.target.value))}/><span className="magic-range-limits"><span>Мечтательно</span><span>Стремительно</span></span></label>
      <label className="magic-range magic-thickness" htmlFor={`${id}-thickness`}><span>Толщина <output>{thickness} px</output></span><input id={`${id}-thickness`} type="range" min="24" max="112" step="2" value={thickness} aria-label="Толщина прогресс-бара" aria-valuetext={`${thickness} пикселей`} onChange={event => setThickness(Number(event.target.value))}/><span className="magic-range-limits"><span>Тоньше</span><span>Толще</span></span></label>
      <div className="magic-actions"><button type="button" className="magic-play" onClick={toggle}>{playing ? <Pause size={16}/> : <Play size={16}/ >}{playing ? 'Пауза' : progress >= 1 ? 'Ещё раз' : progress > 0 ? 'Продолжить' : 'Запустить магию'}</button><button type="button" className="magic-reset" onClick={() => reset()} aria-label="Сбросить магический прогресс"><RotateCcw size={18}/></button></div>
    </div>
    <p className="magic-footnote">Пять характеров из референса. Выберите от двух до пяти этапов — финал всегда достанется звезде с короной.</p>
  </section>;
}
