import { materialBackground } from '../utils/materialStyle';
import { computeLayerShadow, computeLayerShadowLayers } from '../utils/clayLayers';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { resolveClayAssetPath } from '../utils/clayEngine';

export interface ClayNavItem {
  id: string;
  label: string;
  assetPath: string;
  badgeColor: string;
}

interface ClayBottomNavProps {
  items: ClayNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  layoutNamespace?: string;
  variant?: 'floating-dock' | 'embedded-sample';
}

function ClayBottomNavButton({
  item,
  active,
  onSelect,
}: {
  item: ClayNavItem;
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
      data-clay-layer="control"
      type="button"
      onClick={onSelect}
      animate={
        phase === 'activating'
          ? {
              scaleX: [1, 1.035, 0.975, 1.03, 1],
              scaleY: [1, 0.97, 1.03, 0.98, 1],
              y: [0, 2.5, -2, 0],
            }
          : phase === 'deactivating'
            ? {
                scaleX: [1, 0.975, 1.04, 0.99, 1],
                scaleY: [1, 1.03, 0.96, 1.01, 1],
                y: [0, 1.5, -0.5, 0],
              }
            : { scaleX: 1, scaleY: 1, y: 0 }
      }
      transition={{
        duration: 0.48,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative z-10 w-full h-[52px] min-w-0 flex items-center justify-center gap-2.5 px-3 sm:px-4 rounded-[26px] text-xs sm:text-sm font-black focus:outline-none cursor-pointer overflow-hidden"
      style={{
        color: active ? '#FFFFFF' : '#4A3D66',
        transition: 'color 280ms ease',
      }}
    >
      {/* Inactive Subtle Hover/Base Layer */}
      <div
        data-clay-layer="control"
        className="absolute inset-0 rounded-[26px] -z-20 transition-opacity duration-300"
        style={{
          opacity: active ? 0 : 1,
          background: materialBackground('linear-gradient(145deg, rgba(255,253,251,0.55) 0%, rgba(244,236,225,0.55) 100%)'),
          boxShadow:
            computeLayerShadowLayers('control', {shadowRgb:'95,75,140',edge:'#D8C8B8'}, .8).slice(2).join(', '),
        }}
      />

      {/* Active 3D Purple Clay Layer (Morphs in place without flying across buttons) */}
      <motion.div
        data-clay-layer="control"
        initial={false}
        animate={{
          opacity: active ? 1 : 0,
          scale: active ? 1 : 0.92,
        }}
        transition={{
          duration: 0.34,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-0 rounded-[26px] -z-10 pointer-events-none"
        style={{
          background: materialBackground('linear-gradient(145deg, #B49BF9 0%, #8B6CE6 58%, #7A58DB 100%)'),
          boxShadow:
            computeLayerShadow('control', {shadowRgb:'98,66,189',edge:'#5B3BC0'}),
        }}
      />

      {/* 3D Clay Icon Medallion that squishes & morphs color in place */}
      <motion.div
        data-clay-layer="detail"
          data-clay-shape="disc"
        animate={
          phase === 'activating'
            ? {
                scaleX: [1, 0.97, 1.03, 1],
                scaleY: [1, 1.035, 0.92, 1],
                rotate: [0, -6, 4, 0],
              }
            : phase === 'deactivating'
              ? {
                  scaleX: [1, 1.035, 0.96, 1],
                  scaleY: [1, 0.92, 1.04, 1],
                  rotate: [0, 4, -2, 0],
                }
              : { scaleX: 1, scaleY: 1, rotate: 0 }
        }
        transition={{
          duration: 0.46,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-300"
        style={{
          background: materialBackground(active
            ? 'linear-gradient(145deg, #FFFDFB 0%, #F2E8DE 100%)'
            : `linear-gradient(145deg, ${item.badgeColor} 0%, #DECFFA 100%)`),
          boxShadow: computeLayerShadow('detail', active
            ? {shadowRgb:'56,34,115',edge:'#D8C7B8'}
            : {shadowRgb:'95,75,140',edge:'#BCA9D4'}),
        }}
      >
        <img
          src={resolveClayAssetPath(item.assetPath)}
          alt=""
          referrerPolicy="no-referrer"
          className="w-6 h-6 object-contain clay-icon-3d"
        />
      </motion.div>

      <span className={`whitespace-nowrap truncate font-display tracking-tight ${active ? 'clay-sidebar-text-3d' : ''}`}>
        {item.label}
      </span>
    </motion.button>
  );
}

export function ClayBottomNav({
  items,
  activeId,
  onSelect,
  variant = 'floating-dock',
}: ClayBottomNavProps) {
  return (
    <nav
      data-clay-layer="foundation"
      aria-label={variant === 'floating-dock' ? 'Нижнее Clay-меню проекта' : 'Образец нижнего Clay-меню'}
      className={`relative grid ${items.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'} items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-[34px] select-none w-full max-w-4xl mx-auto`}
      style={{
        background: `var(--clay-texture-image, none), ${materialBackground('linear-gradient(145deg, #FFFDFB 0%, #F4ECE1 100%)')}`,
        backgroundBlendMode: 'soft-light, normal',
        boxShadow:
          computeLayerShadow('foundation', {shadowRgb:'105,81,130',edge:'#E0D5E1'}, .85),
      }}
    >
      {items.map((item) => (
        <ClayBottomNavButton
          key={item.id}
          item={item}
          active={item.id === activeId}
          onSelect={() => onSelect(item.id)}
        />
      ))}
    </nav>
  );
}
