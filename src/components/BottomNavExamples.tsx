import React, { useState } from 'react';
import { ClayBottomNav, ClayNavItem } from './ClayBottomNav';
import { StickerNotchNavDemo } from './StickerNotchNav';
import { UPLOADED_CLAY_ASSETS } from '../utils/clayEngine';

const PHYSICS_DEMO_ITEMS: ClayNavItem[] = [
  {
    id: 'stretch',
    label: '1. Нажатие',
    assetPath: UPLOADED_CLAY_ASSETS[0].path,
    badgeColor: '#FFF3C4',
  },
  {
    id: 'snap',
    label: '2. Смена цвета',
    assetPath: UPLOADED_CLAY_ASSETS[5].path,
    badgeColor: '#F2ECFF',
  },
  {
    id: 'squish',
    label: '3. Упругий подъём',
    assetPath: UPLOADED_CLAY_ASSETS[4].path,
    badgeColor: '#E8FBF6',
  },
  {
    id: 'pop',
    label: '4. 3D Отскок',
    assetPath: UPLOADED_CLAY_ASSETS[2].path,
    badgeColor: '#FFF0EA',
  },
];

export function BottomNavExamples() {
  const [activePhase, setActivePhase] = useState('stretch');

  return (
    <section className="ref-playground mt-8" aria-labelledby="bottom-nav-examples-title">
      <div className="ref-stage-label"><span>03 / BOTTOM NAVIGATION</span><span>Два характера движения</span></div>
      <h2 id="bottom-nav-examples-title" className="text-2xl sm:text-3xl font-black mt-5 text-[#2D264B]">Интерактивный стенд нижнего 3D-меню</h2>
      <p className="text-sm text-[#796A88] mt-3 leading-relaxed max-w-2xl">Два варианта одной мягкой навигации. Переключайте пункты и сравнивайте, как материал реагирует на выбор.</p>

      <div className="mt-7 space-y-6">
        <article className="clay-card-cream rounded-[26px] p-4 sm:p-6" aria-labelledby="clay-dock-title">
          <div className="flex items-start gap-3"><span className="text-xs font-black text-[#9A81B1] pt-1">01</span><div><h3 id="clay-dock-title" className="text-lg font-black text-[#413054]">Clay Dock · мягкое нажатие</h3><p className="text-sm text-[#796A88] mt-2 leading-relaxed">Плашки меняют цвет на месте, слегка вдавливаются и поднимаются. Медальон отвечает коротким упругим отскоком.</p></div></div>
          <div className="rounded-[22px] bg-[#EDE4FA] px-3 py-6 sm:p-7 mt-5">
            <ClayBottomNav items={PHYSICS_DEMO_ITEMS} activeId={activePhase} onSelect={setActivePhase} variant="embedded-sample"/>
          </div>
        </article>

        <article className="clay-card-cream rounded-[26px] p-4 sm:p-6" aria-labelledby="sticker-notch-title">
          <div className="flex items-start gap-3"><span className="text-xs font-black text-[#9A81B1] pt-1">02</span><div><span className="text-[10px] font-extrabold tracking-wider text-[#8C6AAB] uppercase">Из Генератора стикеров</span><h3 id="sticker-notch-title" className="text-lg font-black text-[#413054] mt-1">Sticker Notch · пластилиновая выемка</h3><p className="text-sm text-[#796A88] mt-2 leading-relaxed">Белый медальон перелетает между вкладками, а лавандовая панель подстраивает выемку под него. Попробуйте соседний пункт или перескочите через несколько.</p></div></div>
          <div className="rounded-[22px] bg-[#EDE4FA] px-3 py-6 sm:p-7 mt-5 flex justify-center"><StickerNotchNavDemo/></div>
          <p className="text-xs text-[#796A88] leading-relaxed mt-4">Медальон и выемка движутся вместе: небольшой подъём, мягкое растяжение и сжатие при посадке. Стрелки и Home/End тоже переключают вкладки.</p>
        </article>
      </div>
      <p className="text-xs text-[#8B799C] leading-relaxed mt-5">При уменьшении движения в настройках системы переходы отключаются. Это интерактивные образцы: они меняют выбранный пункт, сохраняя раздел библиотеки открытым.</p>
    </section>
  );
}
