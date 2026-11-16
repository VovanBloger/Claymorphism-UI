import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { generateComponentCode, UPLOADED_CLAY_ASSETS } from '../../../src/utils/clayEngine.ts';
import { CLAY_RELIEF_CSS } from '../../../src/utils/clayRelief.ts';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const read = (name) => readFile(resolve(repo, name), 'utf8');
const sources = {
  source: await read('src/components/ReferenceElements.tsx'),
  css: await read('src/components/reference-clay.css'),
  relief: {renderer:await read('src/utils/clayReliefRenderer.ts'),adapter:await read('src/utils/clayRelief.ts'),css:CLAY_RELIEF_CSS},
};
const config = {physics:{presetId:'lavender',surfaceMode:'raised',borderRadius:28,depth:18,blurSoftness:24,specularIntensity:.45,padding:20},titleText:'Standalone clay',subtitleText:'depth 18 · specular 45%',metricValue:'12',metricDelta:'+2',ctaLabel:'Try me',selectedAssetId:'star_mascot'};
for (const [file,componentType] of [['pill','pill-button'],['status','status-pills']]) {
  await writeFile(resolve(here,`${file}.source`),generateComponentCode({...config,componentType},'react',sources));
  await writeFile(resolve(here,file==='status'?'reference-clay.css':'pill.css'),generateComponentCode({...config,componentType},'css',sources));
}
const asset = UPLOADED_CLAY_ASSETS.find(item=>item.id===config.selectedAssetId);
if (asset) {
  const relative = asset.path.replace(/^(?:\.\/|\/)+/,'');
  await mkdir(dirname(resolve(here,relative)),{recursive:true});
  await copyFile(resolve(repo,'public',relative),resolve(here,relative));
}
await build({
  entryPoints:[resolve(here,'entry.js')],outfile:resolve(here,'app.js'),bundle:true,format:'esm',platform:'browser',jsx:'automatic',minify:true,
  define:{'process.env.NODE_ENV':'"production"'},
  plugins:[{name:'standalone-raw-tsx',setup(builder){builder.onLoad({filter:/\.source$/},async({path})=>({contents:await readFile(path,'utf8'),loader:'tsx'}));}}],
});
console.log('Standalone QA ready: /output/qa/standalone-relief/index.html');
