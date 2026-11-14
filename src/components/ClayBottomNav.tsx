import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

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
        className="absolute inset-0 rounded-[26px] -z-20 transition-opacity duration-300"
        style={{
          opacity: active ? 0 : 1,
          background: 'linear-gradient(145deg, rgba(255,253,251,0.55) 0%, rgba(244,236,225,0.55) 100%)',
          boxShadow:
            'inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(216,200,184,0.45)',
        }}
      />

      {/* Active 3D Purple Clay Layer (Morphs in place without flying across buttons) */}
      <motion.div
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
          background: 'linear-gradient(145deg, #B49BF9 0%, #8B6CE6 58%, #7A58DB 100%)',
          boxShadow:
            '0 5px 9px -3px rgba(98, 66, 189, 0.28), 0 2px 4px rgba(84, 54, 168, 0.15), inset 0 3.5px 6px rgba(255, 255, 255, 0.72), inset 0 -5px 9px #5B3BC0',
        }}
      />

      {/* 3D Clay Icon Medallion that squishes & morphs color in place */}
      <motion.div
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
          background: active
            ? 'linear-gradient(145deg, #FFFDFB 0%, #F2E8DE 100%)'
            : `linear-gradient(145deg, ${item.badgeColor} 0%, #DECFFA 100%)`,
          boxShadow: active
            ? '3px 6px 12px -2px rgba(56, 34, 115, 0.42), inset 2px 2.5px 4px #FFFFFF, inset -2px -3px 5px #D8C7B8'
            : '2px 5px 10px -2px rgba(95, 75, 140, 0.24), inset 2px 2px 3px rgba(255,255,255,0.9), inset -2px -2.5px 4px rgba(120,95,175,0.22)',
        }}
      >
        <img
          src={item.assetPath}
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
      aria-label={variant === 'floating-dock' ? 'Нижнее Clay-меню проекта' : 'Образец нижнего Clay-меню'}
      className={`relative grid ${items.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'} items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-[34px] select-none w-full max-w-4xl mx-auto`}
      style={{
        background: 'linear-gradient(145deg, #FFFDFB 0%, #F4ECE1 100%)',
        boxShadow:
          '3px 8px 14px -4px rgba(105, 81, 130, 0.24), 1px 3px 5px -1px rgba(105, 81, 130, 0.12), inset 2px 3px 5px rgba(255, 255, 255, 0.98), inset -2px -4px 6px #E0D5E1',
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
