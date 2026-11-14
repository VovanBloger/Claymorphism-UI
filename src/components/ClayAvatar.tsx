import React from 'react';
import { CLAY_COLOR_PRESETS, ClayColorPresetId, resolveClayAssetPath } from '../utils/clayEngine';

export interface ClayAvatarProps {
  src: string;
  alt?: string;
  size?: 'md' | 'lg' | 'xl';
  presetId?: ClayColorPresetId;
  borderRadiusPx?: number;
  depth?: number;
  onClick?: () => void;
  badgeText?: string;
}

export function ClayAvatar({
  src,
  alt = '3D Avatar',
  size = 'md',
  presetId = 'purple-cta',
  borderRadiusPx = 48,
  depth = 14,
  onClick,
  badgeText,
}: ClayAvatarProps) {
  const preset = CLAY_COLOR_PRESETS[presetId] || CLAY_COLOR_PRESETS['purple-cta'];
  const isGirlCat = src.includes('ChatGPT_14') || src.includes('girl_cat_mascot');

  // Exact sill-aligned dimensions so Mia's elbows rest on the inner sill (92.6%),
  // her 4 hands & cat paws hang over the bottom 3D frame rim, and the top ~28% of
  // her head & hair bun pops high out above the top 3D frame rim without clipping.
  const cfg =
    size === 'xl'
      ? {
          frameW: 248,
          frameH: 172,
          rimPx: 15,
          imgSize: 220,
          imgBottom: -4,
          topAllowance: 44,
          defaultTopRadius: 64,
          defaultBottomRadius: 38,
        }
      : size === 'lg'
        ? {
            frameW: 200,
            frameH: 140,
            rimPx: 13,
            imgSize: 178,
            imgBottom: -3,
            topAllowance: 36,
            defaultTopRadius: 52,
            defaultBottomRadius: 32,
          }
        : {
            frameW: 168,
            frameH: 118,
            rimPx: 11,
            imgSize: 150,
            imgBottom: -3,
            topAllowance: 30,
            defaultTopRadius: 44,
            defaultBottomRadius: 26,
          };

  const topR =
    borderRadiusPx >= 999
      ? cfg.defaultTopRadius + 18
      : Math.max(20, Math.round((borderRadiusPx / 34) * cfg.defaultTopRadius));
  const bottomR =
    borderRadiusPx >= 999
      ? cfg.defaultBottomRadius + 10
      : Math.max(16, Math.round((borderRadiusPx / 34) * cfg.defaultBottomRadius));

  const outerBorderRadius = `${topR}px ${topR}px ${bottomR}px ${bottomR}px`;
  const innerTopR = Math.max(12, topR - cfg.rimPx);
  const innerBottomR = Math.max(10, bottomR - cfg.rimPx);
  const innerBorderRadius = `${innerTopR}px ${innerTopR}px ${innerBottomR}px ${innerBottomR}px`;

  const dropY = Math.round(depth * 1.3);
  const dropBlur = Math.round(depth * 2.15);
  const insetDepth = Math.max(8, Math.round(depth * 0.78));

  return (
    <div
      onClick={onClick}
      style={{ paddingTop: `${cfg.topAllowance}px` }}
      className={`relative inline-flex flex-col items-center justify-center pb-2 select-none overflow-visible ${
        onClick ? 'cursor-pointer group' : ''
      }`}
    >
      {/* LAYER 1: Raised 3D Clay Outer Frame (Подложка-рамка с 4-слойным 3D-объёмом) */}
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 overflow-visible ${
          onClick ? 'group-hover:scale-[1.03]' : ''
        }`}
        style={{
          width: `${cfg.frameW}px`,
          height: `${cfg.frameH}px`,
          padding: `${cfg.rimPx}px`,
          borderRadius: outerBorderRadius,
          background:
            presetId === 'purple-cta'
              ? 'linear-gradient(145deg, #F5EEFF 0%, #B89EFA 44%, #7A58DE 100%)'
              : `linear-gradient(145deg, ${preset.gradStart} 0%, ${preset.gradEnd} 100%)`,
          boxShadow: `
            8px ${dropY}px ${dropBlur}px -4px rgba(${preset.outerShadowRgb}, 0.56),
            3px 6px 12px -1px rgba(${preset.outerShadowRgb}, 0.36),
            inset 3.5px 4.5px 7px rgba(255, 255, 255, 0.975),
            inset -4px -7px 12px ${preset.innerDarkHex}
          `,
        }}
      >
        {/* LAYER 2: Deep Recessed Inner Substrate (Вдавленная подложка с глубокой внутренней тенью inset) */}
        <div
          className="w-full h-full relative overflow-hidden"
          style={{
            borderRadius: innerBorderRadius,
            background:
              'linear-gradient(155deg, #CFBBEF 0%, #E7DAFF 42%, #FCF9FF 100%)',
            boxShadow: `
              inset ${insetDepth}px ${insetDepth + 4}px ${Math.round(insetDepth * 2.2)}px rgba(38, 16, 102, 0.64),
              inset 3px 5px 9px rgba(38, 16, 102, 0.42),
              inset -5px -6px 12px rgba(255, 255, 255, 0.96)
            `,
            border: '1.5px solid rgba(255, 255, 255, 0.68)',
          }}
        >
          {/* Ambient inner depth groove inside the recessed well */}
          <div
            className="absolute inset-2 pointer-events-none opacity-65"
            style={{
              borderRadius: `${Math.max(8, innerTopR - 7)}px ${Math.max(8, innerTopR - 7)}px ${Math.max(6, innerBottomR - 7)}px ${Math.max(6, innerBottomR - 7)}px`,
              boxShadow: 'inset 3px 4px 8px rgba(72, 42, 152, 0.24)',
            }}
          />
        </div>

        {/* LAYER 3: 3D Avatar Popping Out Beyond the Container (Макушка высоко выходит сверху, лапки свисают через нижнюю рамку) */}
        <div
          className="absolute inset-x-0 z-20 pointer-events-none flex justify-center overflow-visible"
          style={{
            bottom: isGirlCat ? `${cfg.imgBottom}px` : `${Math.round(cfg.rimPx * 0.4)}px`,
          }}
        >
          <img
            src={resolveClayAssetPath(src)}
            alt={alt}
            referrerPolicy="no-referrer"
            style={{
              width: `${cfg.imgSize}px`,
              height: `${cfg.imgSize}px`,
              filter:
                'drop-shadow(3px 9px 9px rgba(34, 16, 84, 0.46)) drop-shadow(0px 3px 4px rgba(34, 16, 84, 0.32))',
            }}
            className={`max-w-none object-contain transition-transform duration-300 ${
              isGirlCat ? '' : 'scale-110 -translate-y-2'
            } ${onClick ? 'group-hover:scale-[1.04]' : ''}`}
          />
        </div>

        {/* Optional 3D Badge */}
        {badgeText && (
          <div
            className="absolute -bottom-2 -right-2 z-30 px-2.5 py-0.5 rounded-full text-[10px] font-black text-white tracking-wide"
            style={{
              background: 'linear-gradient(145deg, #62C4B2 0%, #46A896 100%)',
              boxShadow:
                '2px 5px 10px rgba(32, 92, 80, 0.45), inset 1.5px 2px 3px rgba(255, 255, 255, 0.8), inset -2px -3px 4px #2E7D6E',
            }}
          >
            {badgeText}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClayAvatar;
