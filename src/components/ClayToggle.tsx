import { materialBackground, materialShadow } from '../utils/materialStyle';
import React from 'react';
import { motion } from 'motion/react';
import { resolveClayAssetPath } from '../utils/clayEngine';

export type ClayToggleAccent = 'purple' | 'mint' | 'rose' | 'butter';

interface ClayToggleProps {
  id?: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  accent?: ClayToggleAccent;
  mode?: 'switch-track' | 'push-button';
  iconSrc?: string;
}

const ACCENT_PALETTES: Record<
  ClayToggleAccent,
  {
    trackOnBg: string;
    trackOnShadow: string;
    knobOnBg: string;
    knobOnShadow: string;
    buttonLatchedBg: string;
    buttonLatchedShadow: string;
    statusText: string;
  }
> = {
  purple: {
    trackOnBg: 'linear-gradient(145deg, #9B7EF2 0%, #B8A0FA 100%)',
    trackOnShadow:
      'inset 0 5px 10px rgba(74, 46, 156, 0.55), inset 0 -3px 6px rgba(255, 255, 255, 0.65), 0 2px 4px rgba(255, 255, 255, 0.8)',
    knobOnBg: 'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #F5EEFF 58%, #DFD1FA 100%)',
    knobOnShadow:
      '0 6px 12px -2px rgba(68, 42, 148, 0.45), inset 0 4px 6px #FFFFFF, inset 0 -5px 8px #C2ADEB',
    buttonLatchedBg: 'linear-gradient(145deg, #8E6FE8 0%, #A98FF7 100%)',
    buttonLatchedShadow:
      '0 2px 4px rgba(98, 66, 189, 0.25), inset 0 5px 10px rgba(58, 34, 130, 0.62), inset 0 -3px 6px rgba(255, 255, 255, 0.5)',
    statusText: '#6A4BE0',
  },
  mint: {
    trackOnBg: 'linear-gradient(145deg, #62C4B2 0%, #8FE3D3 100%)',
    trackOnShadow:
      'inset 0 5px 10px rgba(36, 110, 96, 0.5), inset 0 -3px 6px rgba(255, 255, 255, 0.7), 0 2px 4px rgba(255, 255, 255, 0.8)',
    knobOnBg: 'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #EBFBF7 58%, #C6EFE4 100%)',
    knobOnShadow:
      '0 6px 12px -2px rgba(42, 122, 108, 0.42), inset 0 4px 6px #FFFFFF, inset 0 -5px 8px #9FD9CA',
    buttonLatchedBg: 'linear-gradient(145deg, #5BBAA7 0%, #82DEC9 100%)',
    buttonLatchedShadow:
      '0 2px 4px rgba(56, 145, 128, 0.25), inset 0 5px 10px rgba(30, 96, 84, 0.58), inset 0 -3px 6px rgba(255, 255, 255, 0.55)',
    statusText: '#2A8568',
  },
  rose: {
    trackOnBg: 'linear-gradient(145deg, #E87690 0%, #FAA4B7 100%)',
    trackOnShadow:
      'inset 0 5px 10px rgba(156, 52, 76, 0.5), inset 0 -3px 6px rgba(255, 255, 255, 0.7), 0 2px 4px rgba(255, 255, 255, 0.8)',
    knobOnBg: 'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #FFF0F3 58%, #FAD4DD 100%)',
    knobOnShadow:
      '0 6px 12px -2px rgba(168, 62, 86, 0.42), inset 0 4px 6px #FFFFFF, inset 0 -5px 8px #E6AEBC',
    buttonLatchedBg: 'linear-gradient(145deg, #E36B86 0%, #F794AA 100%)',
    buttonLatchedShadow:
      '0 2px 4px rgba(184, 78, 104, 0.25), inset 0 5px 10px rgba(138, 42, 65, 0.58), inset 0 -3px 6px rgba(255, 255, 255, 0.55)',
    statusText: '#C74E6B',
  },
  butter: {
    trackOnBg: 'linear-gradient(145deg, #E8B53E 0%, #FCD678 100%)',
    trackOnShadow:
      'inset 0 5px 10px rgba(140, 102, 24, 0.48), inset 0 -3px 6px rgba(255, 255, 255, 0.75), 0 2px 4px rgba(255, 255, 255, 0.8)',
    knobOnBg: 'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #FFF9E6 58%, #FCE8BC 100%)',
    knobOnShadow:
      '0 6px 12px -2px rgba(150, 114, 38, 0.4), inset 0 4px 6px #FFFFFF, inset 0 -5px 8px #E6CB92',
    buttonLatchedBg: 'linear-gradient(145deg, #E3AD36 0%, #F7CC65 100%)',
    buttonLatchedShadow:
      '0 2px 4px rgba(166, 134, 68, 0.25), inset 0 5px 10px rgba(122, 88, 18, 0.55), inset 0 -3px 6px rgba(255, 255, 255, 0.55)',
    statusText: '#9E741B',
  },
};

export function ClayToggle({
  id,
  label,
  description,
  checked,
  onChange,
  accent = 'mint',
  mode = 'switch-track',
  iconSrc,
}: ClayToggleProps) {
  const palette = ACCENT_PALETTES[accent] || ACCENT_PALETTES.mint;

  const handleToggle = () => {
    onChange(!checked);
  };

  if (mode === 'push-button') {
    // Physical Latching 3D Clay Button Switch: constant button & socket dimensions in both states
    return (
      <div className="flex items-center justify-between gap-4 p-3.5 rounded-[24px] clay-card-cream select-none min-h-[82px]">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {iconSrc && (
            <img
              src={resolveClayAssetPath(iconSrc)}
              alt=""
              referrerPolicy="no-referrer"
              className="w-11 h-11 object-contain clay-icon-3d shrink-0"
            />
          )}
          <div className="min-w-0">
            <div className="text-sm font-black text-[#2E2540] font-display truncate">{label}</div>
            {description && (
              <div className="text-xs font-bold text-[#7A6F8E] mt-0.5 line-clamp-2">{description}</div>
            )}
          </div>
        </div>

        {/* Fixed-Size Recessed Socket Framing the Fixed-Size Physical Clay Push-Button */}
        <div
          className="w-[156px] h-[52px] p-1.5 rounded-[20px] flex items-center justify-center shrink-0"
          style={{
            background: materialBackground('linear-gradient(145deg, #E8DFD5 0%, #F7F0E8 100%)'),
            boxShadow:
              materialShadow('inset 3px 4px 8px rgba(145, 130, 118, 0.45), inset -2px -2px 4px rgba(255,255,255,0.9)'),
          }}
        >
          <motion.button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={handleToggle}
            animate={{
              y: checked ? 1.5 : -1,
            }}
            transition={{
              type: 'spring',
              stiffness: 360,
              damping: 25,
            }}
            className="w-full h-full rounded-[15px] flex items-center justify-center text-xs font-black tracking-wide cursor-pointer focus:outline-none whitespace-nowrap"
            style={
              checked
                ? {
                    background: materialBackground(palette.buttonLatchedBg),
                    color: '#FFFFFF',
                    boxShadow: materialShadow(palette.buttonLatchedShadow),
                  }
                : {
                    background: materialBackground('linear-gradient(145deg, #FFFDFB 0%, #F2EAE1 100%)'),
                    color: '#5A4D73',
                    boxShadow:
                      materialShadow('3px 6px 12px -2px rgba(95, 75, 140, 0.28), inset 2px 3px 5px #FFFFFF, inset -2px -4px 7px #D6C7B8'),
                  }
            }
          >
            <span className={checked ? 'clay-sidebar-text-3d' : ''}>
              {checked ? 'ВКЛЮЧЕНО' : 'ВЫКЛЮЧЕНО'}
            </span>
          </motion.button>
        </div>
      </div>
    );
  }

  // Default: Tactile 3D Clay Switch Track with Constant Track & Spherical Thumb Size
  return (
    <div className="flex items-center justify-between gap-4 p-3.5 rounded-[24px] clay-card-cream select-none min-h-[82px]">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {iconSrc && (
          <img
            src={resolveClayAssetPath(iconSrc)}
            alt=""
            referrerPolicy="no-referrer"
            className="w-10 h-10 object-contain clay-icon-3d shrink-0"
          />
        )}
        <div className="min-w-0">
          <div className="text-sm font-black text-[#2E2540] font-display truncate">{label}</div>
          <div
            className="text-xs font-extrabold transition-colors mt-0.5 line-clamp-2"
            style={{ color: checked ? palette.statusText : '#8A7DA6' }}
          >
            {description || (checked ? 'Активно' : 'Выключено')}
          </div>
        </div>
      </div>

      {/* Fixed-Size Physical Clay Switch Well (84px x 44px) */}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={handleToggle}
        className="relative w-[84px] h-[44px] rounded-full p-1.5 transition-colors duration-300 cursor-pointer focus:outline-none shrink-0 flex items-center"
        style={{
          background: materialBackground(checked
            ? palette.trackOnBg
            : 'linear-gradient(145deg, #E8DFD6 0%, #F9F3EC 100%)'),
          boxShadow: materialShadow(checked
            ? palette.trackOnShadow
            : 'inset 0 5px 9px rgba(156, 140, 128, 0.48), inset 0 -3px 6px rgba(255, 255, 255, 0.92), 0 2px 4px rgba(255, 255, 255, 0.85)'),
        }}
      >
        {/* Fixed-Size 3D Clay Spherical Thumb (32px x 32px) */}
        <motion.div
          style={{
            background: materialBackground(checked
              ? palette.knobOnBg
              : 'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #F7EFE6 55%, #E0D3C5 100%)'),
            boxShadow: materialShadow(checked
              ? palette.knobOnShadow
              : '0 6px 12px -2px rgba(95, 75, 140, 0.32), inset 0 4px 5px #FFFFFF, inset 0 -5px 7px #C9B9A8'),
          }}
          animate={{
            x: checked ? 40 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 340,
            damping: 24,
            mass: 0.97,
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center relative shrink-0"
        >
          {/* Inner tactile dimple inside the clay thumb */}
          <span
            className="w-3 h-3 rounded-full transition-colors duration-300"
            style={{
              background: materialBackground(checked ? palette.trackOnBg : '#E8DFD6'),
              boxShadow: materialShadow(checked
                ? 'inset 0 2px 3px rgba(0,0,0,0.28)'
                : 'inset 0 1.5px 2px rgba(120,105,95,0.35)'),
            }}
          />
        </motion.div>
      </button>
    </div>
  );
}
