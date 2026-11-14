import React, { useState } from 'react';
import { ArrowUpRight, Code2, Sparkles } from 'lucide-react';
import { ClayControlBoard, REFERENCE_ELEMENTS, ReferenceElement, ReferenceElementKind } from './ReferenceElements';
import { resolveClayAssetPath } from '../utils/clayEngine';
import './reference-clay.css';
import { BottomNavExamples } from './BottomNavExamples';

export function ReferenceLibrary({onInspect}:{onInspect:(kind:ReferenceElementKind)=>void}) {
 const [showReferences,setShowReferences]=useState(false);
 return <div className="ref-library">
  <div className="ref-intro"><div><span className="ref-kicker"><Sparkles size={14}/> SOFT SHAPES. HAPPY INTERFACES.</span><h1>A softer kind of UI<span>.</span></h1><p>Чуть больше объёма. Чуть больше тепла.<br/>Компоненты, которые хочется потрогать.</p></div><div className="ref-edition">THE CLAY COLLECTION<span>01 — INTERACTIVE PLAYGROUND</span></div></div>
  <section className="ref-playground" aria-label="Интерактивный набор по первому референсу"><div className="ref-stage-label"><span>01 / THE ESSENTIALS</span><span>Нажимайте. Переключайте. Исследуйте. <ArrowUpRight size={14}/></span></div><div className="ref-kit-grid"><ClayControlBoard/><div className="ref-kit-side"><ReferenceElement kind="status-pills"/><ReferenceElement kind="action-rows"/></div></div><div className="ref-stage-foot"><span><i/> Handmade feel. Built for the web.</span><button type="button" className="ref-reference-toggle" aria-expanded={showReferences} onClick={()=>setShowReferences(!showReferences)}>{showReferences?'Скрыть референсы':'Сравнить с референсами'} ↗</button></div>{showReferences&&<div className="ref-originals">{[{src:'ui-kit.webp',label:'01 · UI Kit'},{src:'shop.webp',label:'02 · Clayshop'},{src:'music.jpg',label:'03 · Music'},{src:'fitness.webp',label:'04 · Fitness'}].map(ref=><figure key={ref.src}><img src={resolveClayAssetPath(`/assets/references/${ref.src}`)} alt={`Оригинальный референс ${ref.label}`}/><figcaption>{ref.label}</figcaption></figure>)}</div>}</section>
  <div className="ref-section-heading"><div><span className="ref-kicker">02 / LITTLE THINGS, BIG PERSONALITY</span><h2>Больше, чем просто кнопки</h2></div><p>Новые формы из ваших референсов.<br/>Каждая — с собственным характером движения.</p></div>
  <div className="ref-component-grid">{(['product-card','workout-card','activity-rings','clay-calendar','filter-chips'] as ReferenceElementKind[]).map((kind,i)=><section className="ref-component-cell" key={kind}><div className="ref-component-caption"><span>0{i+1}</span><b>{REFERENCE_ELEMENTS.find(e=>e.id===kind)?.label}</b><button type="button" aria-label={`Открыть в генераторе: ${REFERENCE_ELEMENTS.find(e=>e.id===kind)?.label}`} onClick={()=>onInspect(kind)}><Code2 size={17}/></button></div><div className="ref-component-preview"><ReferenceElement kind={kind}/></div><p>{REFERENCE_ELEMENTS.find(e=>e.id===kind)?.description}</p></section>)}</div>
  <BottomNavExamples/>
  <div className="ref-library-note"><Sparkles size={20}/><div><b>Мягкость — это система.</b><p>Единый источник света, согласованные радиусы, короткие тени и спокойная упругость. Все новые элементы доступны в генераторе с React, CSS и токенами.</p></div></div>
 </div>;
}
