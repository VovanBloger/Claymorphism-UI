import { materialBackground } from './utils/materialStyle';
import React, { useState } from 'react';
import { MotionConfig } from 'motion/react';
import { ClayColorPresetId, GeneratorComponentType, GeneratorConfig } from './utils/clayEngine';
import { DashboardSection, ReferenceShowcases } from './components/ReferenceShowcases';
import { MaterialProvider } from './components/MaterialSettings';

export default function App() {
  const [activeScene, setActiveScene] = useState<DashboardSection>('dashboard');
  const [generatorConfig, setGeneratorConfig] = useState<GeneratorConfig>({
    componentType: 'clay-avatar',
    physics: {
      presetId: 'purple-cta',
      surfaceMode: 'raised',
      borderRadius: 48,
      depth: 15,
      blurSoftness: 28,
      specularIntensity: 0.975,
      padding: 28,
    },
    selectedAssetId: 'girl_cat_mascot',
    titleText: 'Hi, Mia!',
    subtitleText: 'Вдавленная подложка с внутренней тенью, объёмная 3D-рамка и выход за края',
    metricValue: '1,248',
    metricDelta: '+18% this week',
    ctaLabel: 'Play Something',
  });

  const handleSelectPresetFromGuide = (presetId: ClayColorPresetId) => {
    setGeneratorConfig((prev) => ({
      ...prev,
      physics: {
        ...prev.physics,
        presetId,
      },
    }));
    setActiveScene('generator');
  };

  const handleInspectFromReference = (params: {
    componentType: GeneratorComponentType;
    presetId: ClayColorPresetId;
    assetId: string;
    titleText: string;
    subtitleText: string;
    metricValue?: string;
  }) => {
    setGeneratorConfig((prev) => ({
      ...prev,
      componentType: params.componentType,
      selectedAssetId: params.assetId,
      titleText: params.titleText,
      subtitleText: params.subtitleText,
      metricValue: params.metricValue || prev.metricValue,
      physics: {
        ...prev.physics,
        presetId: params.presetId,
        surfaceMode: params.componentType === 'icon-input' ? 'recessed' : 'raised',
      },
    }));
    setActiveScene('generator');
  };


  return <MaterialProvider><MotionConfig reducedMotion="user">
    <div id="top" className="studio-shell min-h-screen flex flex-col pb-8" style={{background:materialBackground('#F8F5FA')}}>
      <header className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 pt-5 pb-2">
        <div className="studio-header rounded-[27px] px-6 sm:px-8 py-5 flex items-center justify-between gap-4">
          <a href="#top" onClick={() => setActiveScene('dashboard')} className="text-xl font-black tracking-tight text-[#2E2540] font-display">ClayCraft Studio</a>
          <span className="hidden sm:block text-xs font-bold text-[#7B6598]">Soft shapes. One creative space.</span>
        </div>
      </header>
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-5 flex-1">
        <ReferenceShowcases
          activeScene={activeScene}
          onSelectScene={setActiveScene}
          generatorConfig={generatorConfig}
          onChangeGeneratorConfig={setGeneratorConfig}
          onSelectPresetForGenerator={handleSelectPresetFromGuide}
          onInspectInGenerator={handleInspectFromReference}
          onSelectForGenerator={(componentType, assetId='star_mascot') => handleInspectFromReference({componentType,assetId,presetId:'lavender',titleText:'',subtitleText:''})}
        />
      </main>
      <footer className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-4 text-center text-xs font-bold text-[#7B6B8C]">ClayCraft UI · Дизайн-система Soft 3D Tactile Claymorphism и генератор компонентов</footer>
    </div>
  </MotionConfig></MaterialProvider>;
}
