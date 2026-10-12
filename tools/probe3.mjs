/* =====================================================================
   probe3.mjs — verificação de layout responsivo e sobreposição de
   controles em três larguras de tela. Reporta o retângulo dos overlays
   e detecta colisões entre a barra de animação, o simulador, a escala e
   o rótulo de nível.
   Uso: node probe3.mjs
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, '..', 'index.html');
const PROBE = path.join(ROOT, '_probe3.html');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

let html = fs.readFileSync(SRC, 'utf8');

const harness = `
<script>
window.__L = { errors: [], sizes: [] };
window.addEventListener('error', e => window.__L.errors.push('ERROR: ' + (e.message||'') + ' @' + (e.lineno||'')));
window.addEventListener('unhandledrejection', e => window.__L.errors.push('REJECT: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason))));

function rect(sel){
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return { x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height),
           vis: cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.05 };
}
function overlap(a, b){
  if (!a || !b || !a.vis || !b.vis) return 0;
  const x = Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y+a.h, b.y+b.h) - Math.max(a.y, b.y));
  return x*y;
}
function area(r){ return r ? r.w*r.h : 0; }

setTimeout(() => {
  /* pior caso de layout: modo aula com o simulador do Módulo 7 (o mais alto) */
  document.getElementById('modeAula').dispatchEvent(new MouseEvent('click', { bubbles:true }));
  document.querySelector('#moduleBar .mod-btn[data-mod="7"]').dispatchEvent(new MouseEvent('click', { bubbles:true }));
}, 4000);

setTimeout(() => {
  const S = { w: innerWidth, h: innerHeight };
  const animBar = rect('#animBar');
  const lab = rect('#labControls');
  const scale = rect('#scaleBox');
  const info = rect('#topLeftInfo');
  const canvas = rect('#c');
  const left = rect('#left');
  const right = rect('#right');

  const appRect = document.querySelector('#app').getBoundingClientRect();
  const vpRect = document.querySelector('#viewport').getBoundingClientRect();

  window.__L.sizes.push({
    viewport: S,
    hasHScroll: document.documentElement.scrollWidth > innerWidth + 1,
    docH: Math.round(document.documentElement.scrollHeight),
    canvas, viewportBox:{ w:Math.round(vpRect.width), h:Math.round(vpRect.height) },
    animBar, lab, scale, info, leftPanel:left, rightPanel:right,
    overlaps: {
      anim_lab: Math.round(overlap(animBar, lab)),
      anim_scale: Math.round(overlap(animBar, scale)),
      lab_scale: Math.round(overlap(lab, scale)),
      lab_info: Math.round(overlap(lab, info)),
      anim_info: Math.round(overlap(animBar, info)),
      scale_info: Math.round(overlap(scale, info))
    },
    canvasPct: Math.round(area(canvas)/Math.max(1, area({x:0,y:0,w:Math.round(vpRect.width),h:Math.round(vpRect.height)}))*100),
    loadingHidden: document.getElementById('loading').classList.contains('hide'),
    modBarVisible: getComputedStyle(document.getElementById('moduleBar')).display !== 'none',
    labShown: document.getElementById('labControls').classList.contains('show'),
    panelOffscreen: {
      left: left ? left.x + left.w <= 2 || left.x >= 0 : null,
      right: right ? right.x >= innerWidth - 2 || right.x + right.w <= innerWidth : null
    }
  });

  const out = document.getElementById('__probe');
  out.textContent = JSON.stringify(window.__L);
}, 8000);
</script>
<div id="__probe" style="display:none"></div>
`;

html = html.replace('<body>', '<body>' + harness);
fs.writeFileSync(PROBE, html, 'utf8');
const url = 'file:///' + PROBE.replace(/\\/g, '/').replace(/ /g, '%20');

const SIZES = [
  { w:1680, h:1000, label:'desktop grande' },
  { w:1280, h:860,  label:'desktop padrão' },
  { w:1024, h:768,  label:'tablet paisagem' },
  { w:820,  h:1180, label:'tablet retrato' },
  { w:430,  h:900,  label:'celular' }
];

let bad = 0;
for (const s of SIZES){
  let dom = '';
  try {
    dom = execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--no-sandbox',
      '--enable-unsafe-swiftshader', '--use-gl=swiftshader',
      '--hide-scrollbars', '--virtual-time-budget=13000',
      '--window-size=' + s.w + ',' + s.h, '--dump-dom', url
    ], { encoding:'utf8', maxBuffer: 96*1024*1024, stdio:['ignore','pipe','ignore'] });
  } catch (e){ console.error(s.label + ': chrome falhou: ' + e.message); bad++; continue; }

  const m = dom.match(/<div id="__probe"[^>]*>([\s\S]*?)<\/div>/);
  if (!m){ console.error(s.label + ': sem dados'); bad++; continue; }
  const data = JSON.parse(m[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'));
  const r = data.sizes[0];

  console.log('\n=== ' + s.label + ' (' + s.w + '×' + s.h + ') ===');
  console.log('  canvas ' + r.canvas.w + '×' + r.canvas.h + '  (' + r.canvasPct + '% da viewport)');
  console.log('  #animBar      ' + JSON.stringify(r.animBar));
  console.log('  #labControls  ' + JSON.stringify(r.lab));
  console.log('  #scaleBox     ' + JSON.stringify(r.scale));
  console.log('  sobreposições ' + JSON.stringify(r.overlaps));
  console.log('  rolagem horizontal: ' + r.hasHScroll + ' | altura doc: ' + r.docH);
  console.log('  carregamento oculto: ' + r.loadingHidden + ' | simulador visível: ' + r.labShown);

  if (r.hasHScroll){ console.error('  >>> FALHA: rolagem horizontal indesejada'); bad++; }
  if (!r.loadingHidden){ console.error('  >>> FALHA: overlay de carregamento permaneceu'); bad++; }
  if (r.canvas.w < 200 || r.canvas.h < 200){ console.error('  >>> FALHA: canvas pequeno demais'); bad++; }
  if (r.overlaps.anim_lab > 500){ console.error('  >>> FALHA: barra de animação sobre o simulador (' + r.overlaps.anim_lab + ' px²)'); bad++; }
  if (r.overlaps.lab_scale > 500){ console.error('  >>> FALHA: simulador sobre a barra de escala (' + r.overlaps.lab_scale + ' px²)'); bad++; }
  if (r.overlaps.anim_info > 500){ console.error('  >>> FALHA: barra de animação sobre o painel de nível'); bad++; }
  if (r.overlaps.lab_info > 500){ console.error('  >>> FALHA: simulador sobre o painel de nível'); bad++; }
  if (r.lab && (r.lab.y < 0 || r.lab.y + r.lab.h > r.viewport.h + 1)){
    console.error('  >>> FALHA: simulador ultrapassa a viewport (' + JSON.stringify(r.lab) + ')'); bad++;
  }
  /* o simulador deve deixar espaço visível para o modelo 3D no modo aula */
  if (r.lab && r.lab.h > r.viewportBox.h*0.66){
    console.error('  >>> FALHA: simulador ocupa mais de 66% da viewport'); bad++;
  }
  if (data.errors.length){ console.error('  >>> ERROS: ' + data.errors.join(' | ')); bad++; }
}

if (bad){ console.error('\n>>> ' + bad + ' PROBLEMA(S) DE LAYOUT.'); process.exit(1); }
console.log('\n>>> LAYOUT OK EM TODOS OS TAMANHOS.');