import React, { useState, useEffect } from 'react';

export type ClayThumbVariant = 'pink' | 'blue' | 'mint' | 'lavender' | 'butter';

interface ClaySliderProps {
  id: string;
  label: string;
  valueDisplay: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  variant?: ClayThumbVariant;
  thumbRadius?: number; // px: 4 (angular cube) to 18 (perfect sphere)
}

const THUMB_STYLES: Record<
  ClayThumbVariant,
  {
    thumbBgSphere: string;
    thumbBgAngular: string;
    thumbShadow: string;
    fillBg: string;
    fillBevel: string;
  }
> = {
  pink: {
    thumbBgSphere: 'radial-gradient(circle at 32% 28%, #FFE0E8 0%, #F7A3B8 52%, #E37892 100%)',
    thumbBgAngular: 'linear-gradient(145deg, #FFD8E2 0%, #F7A3B8 55%, #E37892 100%)',
    thumbShadow:
      '0 10px 18px -3px rgba(184, 78, 104, 0.45), 0 4px 7px rgba(184, 78, 104, 0.26), inset 0 4px 6px rgba(255, 255, 255, 0.92), inset 0 -5px 8px #C25570',
    fillBg: 'linear-gradient(180deg, #FFE8EE 0%, #F9C2D0 100%)',
    fillBevel: '#E59EB0',
  },
  blue: {
    thumbBgSphere: 'radial-gradient(circle at 32% 28%, #D6E6FF 0%, #85ACF7 52%, #648BE0 100%)',
    thumbBgAngular: 'linear-gradient(145deg, #D2E4FF 0%, #85ACF7 55%, #648BE0 100%)',
    thumbShadow:
      '0 10px 18px -3px rgba(72, 105, 184, 0.45), 0 4px 7px rgba(72, 105, 184, 0.26), inset 0 4px 6px rgba(255, 255, 255, 0.92), inset 0 -5px 8px #476EC2',
    fillBg: 'linear-gradient(180deg, #E3EEFF 0%, #BDD4FA 100%)',
    fillBevel: '#96B5E8',
  },
  mint: {
    thumbBgSphere: 'radial-gradient(circle at 32% 28%, #D4FAF0 0%, #7ED9C6 52%, #58B8A4 100%)',
    thumbBgAngular: 'linear-gradient(145deg, #CFF8EE 0%, #7ED9C6 55%, #58B8A4 100%)',
    thumbShadow:
      '0 10px 18px -3px rgba(56, 145, 128, 0.45), 0 4px 7px rgba(56, 145, 128, 0.26), inset 0 4px 6px rgba(255, 255, 255, 0.92), inset 0 -5px 8px #3B9683',
    fillBg: 'linear-gradient(180deg, #E3FBF5 0%, #B6EDE0 100%)',
    fillBevel: '#8CD1C1',
  },
  lavender: {
    thumbBgSphere: 'radial-gradient(circle at 32% 28%, #EAE0FF 0%, #AC92FA 52%, #8768E3 100%)',
    thumbBgAngular: 'linear-gradient(145deg, #E6DAFF 0%, #AC92FA 55%, #8768E3 100%)',
    thumbShadow:
      '0 10px 18px -3px rgba(104, 78, 168, 0.45), 0 4px 7px rgba(104, 78, 168, 0.26), inset 0 4px 6px rgba(255, 255, 255, 0.92), inset 0 -5px 8px #6445C2',
    fillBg: 'linear-gradient(180deg, #F0E8FF 0%, #D5C4FA 100%)',
    fillBevel: '#B39CE8',
  },
  butter: {
    thumbBgSphere: 'radial-gradient(circle at 32% 28%, #FFF3C4 0%, #F7CE68 52%, #E3B03B 100%)',
    thumbBgAngular: 'linear-gradient(145deg, #FFF1BA 0%, #F7CE68 55%, #E3B03B 100%)',
    thumbShadow:
      '0 10px 18px -3px rgba(166, 134, 68, 0.45), 0 4px 7px rgba(166, 134, 68, 0.26), inset 0 4px 6px rgba(255, 255, 255, 0.92), inset 0 -5px 8px #C28F1F',
    fillBg: 'linear-gradient(180deg, #FFF8DE 0%, #FCE29C 100%)',
    fillBevel: '#E3C376',
  },
};

export function ClaySlider({
  id,
  label,
  valueDisplay,
  min,
  max,
  step = 1,
  value,
  onChange,
  variant = 'pink',
  thumbRadius = 18,
}: ClaySliderProps) {
  const [isPressed, setIsPressed] = useState(false);
  // Continuous floating-point drag value prevents jerky stepping on small min..max ranges
  const [dragValue, setDragValue] = useState<number>(value);

  useEffect(() => {
    if (!isPressed) {
      setDragValue(value);
    }
  }, [value, isPressed]);

  const activeNumericValue = isPressed ? dragValue : value;
  const clampedPct = Math.max(
    0,
    Math.min(100, ((activeNumericValue - min) / (max - min || 1)) * 100)
  );

  const theme = THUMB_STYLES[variant] || THUMB_STYLES.pink;
  const resolvedThumbRadius = Math.max(4, Math.min(18, thumbRadius));
  const isAngular = resolvedThumbRadius < 14;

  const handleRangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFloat = parseFloat(e.target.value);
    setDragValue(rawFloat);

    const snapped =
      step >= 1
        ? min + Math.round((rawFloat - min) / step) * step
        : Number((min + Math.round((rawFloat - min) / step) * step).toFixed(2));
    const clampedSnapped = Math.max(min, Math.min(max, snapped));

    if (clampedSnapped !== value) {
      onChange(clampedSnapped);
    }
  };

  return (
    <div className="space-y-2 select-none">
      <div className="flex justify-between items-center gap-2 text-xs font-extrabold text-[#3E3259]">
        <label htmlFor={id} className="cursor-pointer truncate">
          {label}
        </label>
        <span className="font-mono tabular-nums px-2.5 py-0.5 rounded-full text-[11px] bg-white/75 text-[#5B459E] shadow-xs shrink-0 min-w-[54px] text-center">
          {valueDisplay}
        </span>
      </div>

      {/* 3D Clay Slider Container */}
      <div
        className="relative h-10 flex items-center cursor-pointer"
        onMouseLeave={() => setIsPressed(false)}
      >
        {/* Plump 3D Cylindrical Cream Clay Track */}
        <div
          className="w-full h-4 rounded-full relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F7EFE6 58%, #E6DBD0 100%)',
            boxShadow:
              '0 6px 12px -2px rgba(95, 75, 140, 0.18), 0 2px 4px rgba(95, 75, 140, 0.10), inset 0 3px 4px rgba(255, 255, 255, 1), inset 0 -3px 5px #D5C7B8',
          }}
        >
          {/* Lockstep Pastel Clay Progress Fill (zero lag behind thumb) */}
          <div
            className="h-full rounded-full"
            style={{
              width: `${clampedPct}%`,
              background: theme.fillBg,
              boxShadow: `inset 0 2px 3px rgba(255, 255, 255, 0.9), inset 0 -2px 4px ${theme.fillBevel}`,
              willChange: 'width',
            }}
          />
        </div>

        {/* 3D Clay Thumb with Customizable Corner Rounding (from Angular Cube 4px to Sphere 18px) */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 pointer-events-none"
          style={{
            width: '34px',
            height: '34px',
            left: `calc(${clampedPct}% - ${(clampedPct / 100) * 34}px)`,
            borderRadius: `${resolvedThumbRadius}px`,
            background: isAngular ? theme.thumbBgAngular : theme.thumbBgSphere,
            boxShadow: theme.thumbShadow,
            transform: isPressed
              ? 'translate3d(0, -50%, 0) scaleX(1.12) scaleY(0.90)'
              : 'translate3d(0, -50%, 0) scaleX(1) scaleY(1)',
            transition: 'transform 140ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 160ms ease',
            willChange: 'left, transform',
          }}
        >
          {/* Specular top-left clay shine that adapts to angular or spherical shape */}
          <span
            className="absolute top-1.5 left-2 bg-white/70 blur-[0.4px]"
            style={{
              width: isAngular ? '12px' : '10px',
              height: isAngular ? '4px' : '6px',
              borderRadius: `${Math.max(2, Math.round(resolvedThumbRadius * 0.4))}px`,
              transform: isAngular ? 'rotate(-8deg)' : 'rotate(-25deg)',
            }}
          />
        </div>

        {/* Native accessible range input with step="any" for sub-pixel 60fps dragging */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step="any"
          value={activeNumericValue}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          onBlur={() => setIsPressed(false)}
          onChange={handleRangeInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 m-0"
        />
      </div>
    </div>
  );
}
