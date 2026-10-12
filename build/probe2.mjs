/* =====================================================================
   probe2.mjs — teste de interação completo em navegador headless
   Exercita: seleção de organelas, fichas, os 9 módulos (teoria +
   simulador + questão), modos de visualização, tipos celulares e
   controles de animação. Reporta erros e resultados das asserções.
   Uso: node probe2.mjs
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.join(ROOT, '..');
const SRC = path.join(PROJECT, 'index.html');
const PROBE = path.join(ROOT, '_probe2.html');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

let html = fs.readFileSync(SRC, 'utf8');

const harness = `
<script>
window.__P = { errors: [], log: [], fails: [] };
window.addEventListener('error', e => window.__P.errors.push('ERROR: ' + (e.message||e.type) + ' @' + (e.lineno||'')));
window.addEventListener('unhandledrejection', e => window.__P.errors.push('REJECT: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason))));
const _ce = console.error; console.error = function(){ window.__P.errors.push('CONSOLE.ERROR: ' + [...arguments].map(String).join(' ')); _ce.apply(console, arguments); };

function ok(name, cond, extra){
  if (cond) window.__P.log.push('PASS  ' + name);
  else { window.__P.log.push('FAIL  ' + name + (extra ? ' :: ' + extra : '')); window.__P.fails.push(name); }
}
function click(sel){
  const el = document.querySelector(sel);
  if (!el) { window.__P.fails.push('missing ' + sel); return false; }
  el.dispatchEvent(new MouseEvent('click', { bubbles:true }));
  return true;
}
function setRange(sel, val){
  const el = document.querySelector(sel);
  if (!el) { window.__P.fails.push('missing range ' + sel); return false; }
  el.value = String(val);
  el.dispatchEvent(new Event('input', { bubbles:true }));
  return true;
}

const STEPS = [];

/* 1 — seleção de cada estrutura disponível */
STEPS.push(() => {
  const ids = ['membrana','citoplasma','juncoes','nucleo','mitocondria','re_rugoso','re_liso','golgi',
               'ribossomos','lisossomos','peroxissomos','vesiculas','centrossomo','citoesqueleto'];
  let done = 0;
  ids.forEach(id => {
    window.__cvSelect(id, false);
    const f = document.getElementById('ficha');
    const has = f && f.innerHTML.includes('ficha-sec') && f.innerHTML.includes('Escala');
    if (has) done++;
    else window.__P.log.push('      ficha incompleta: ' + id);
  });
  ok('fichas das 14 estruturas animais renderizadas', done === ids.length, done + '/14');
  const lbl = document.getElementById('worldLabelText');
  ok('etiqueta flutuante atualizada', lbl && lbl.textContent.length > 2, lbl && lbl.textContent);
  ok('lista marca item ativo', !!document.querySelector('#orgList .org-item.active'));
});

/* 2 — busca filtra a lista */
STEPS.push(() => {
  setRange('#searchInput', 0);
  const inp = document.getElementById('searchInput');
  inp.value = 'mitoc';
  inp.dispatchEvent(new Event('input', { bubbles:true }));
  const vis = [...document.querySelectorAll('#orgList .org-item')].filter(b => b.style.display !== 'none');
  ok('busca "mitoc" reduz a lista', vis.length >= 1 && vis.length <= 4, vis.length + ' visíveis');
  inp.value = '';
  inp.dispatchEvent(new Event('input', { bubbles:true }));
  const all = [...document.querySelectorAll('#orgList .org-item')].filter(b => b.style.display !== 'none');
  ok('limpar busca restaura a lista', all.length === 14, all.length + ' visíveis');
});

/* 3 — modos de visualização */
STEPS.push(() => {
  const before = document.getElementById('memSlider').value;
  click('.topbar-modes button[data-mode="transparent"]');
  ok('modo transparente altera a membrana', document.getElementById('memSlider').value !== before);
  click('.topbar-modes button[data-mode="section"]');
  ok('modo corte ativa o corte', window.__cvState.section === true);
  click('.topbar-modes button[data-mode="section"]');
  ok('modo corte desativa', window.__cvState.section === false);
  click('.topbar-modes button[data-mode="wire"]');
  ok('modo malha ativa wireframe', window.__cvState.wireframe === true);
  click('.topbar-modes button[data-mode="wire"]');
  click('.topbar-modes button[data-mode="isolate"]');
  ok('modo isolar ativa isolamento', window.__cvState.isolate === true);
  click('.topbar-modes button[data-mode="isolate"]');
  ok('modo isolar desativa', window.__cvState.isolate === false);
  click('.topbar-modes button[data-mode="explode"]');
  ok('modo explosão aplica deslocamento', window.__cvState.explode > 0);
  click('.topbar-modes button[data-mode="full"]');
  ok('modo completo zera a explosão', window.__cvState.explode === 0);
});

/* 4 — sliders e toggles */
STEPS.push(() => {
  setRange('#memSlider', 0);
  setRange('#dissSlider', 100);
  setRange('#expSlider', 50);
  const dv = document.getElementById('dissVal').textContent;
  ok('rótulo de dissecação atualiza', dv === '100%', dv);
  setRange('#memSlider', 55); setRange('#dissSlider', 0); setRange('#expSlider', 0);
  ['#cbCito','#cbCitoesq','#cbMolec','#cbLabels','#anVes','#anTrans','#anATP','#anTradu'].forEach(s => {
    const el = document.querySelector(s);
    el.checked = !el.checked;
    el.dispatchEvent(new Event('change', { bubbles:true }));
    el.checked = !el.checked;
    el.dispatchEvent(new Event('change', { bubbles:true }));
  });
  ok('toggles de visualização e animação sem erro', true);
  click('#hubBtn');
  ok('botão de endomembranas ativa', window.__cvState.hub === true);
  click('#hubBtn');
});

/* 5 — barra de animação */
STEPS.push(() => {
  click('#playBtn');
  ok('pausa das animações', document.getElementById('playBtn').textContent.includes('Reproduzir'));
  click('#playBtn');
  ok('retomada das animações', document.getElementById('playBtn').textContent.includes('Pausar'));
  setRange('#speedSlider', 250);
  ok('velocidade atualiza rótulo', document.getElementById('speedVal').textContent.startsWith('2.5'));
  setRange('#speedSlider', 100);
  click('#restartBtn');
  ok('reinício das animações sem erro', true);
});

/* 6 — níveis de observação */
STEPS.push(() => {
  [1,2,3,4].forEach(l => click('#levelList .org-item[data-level="' + l + '"]'));
  ok('quatro níveis de observação acionáveis', true);
});

/* 7 — os nove módulos: teoria, simulador e questão */
STEPS.push(() => {
  window.__P.moduleResults = [];
  for (let i = 0; i <= 8; i++){
    click('#moduleBar .mod-btn[data-mod="' + i + '"]');
    const theory = document.getElementById('aulaTheory');
    const lab = document.getElementById('labContent');
    const q = document.getElementById('qAlts');
    const r = {
      mod: i,
      theory: theory ? theory.querySelectorAll('.theory-block').length : 0,
      labHTML: lab ? lab.innerHTML.length : 0,
      labVisible: document.getElementById('labControls').classList.contains('show'),
      alts: q ? q.children.length : 0,
      qText: (document.getElementById('qText') || {}).textContent || ''
    };
    window.__P.moduleResults.push(r);
    ok('módulo ' + i + ' com teoria', r.theory >= 2, 'blocos=' + r.theory);
    ok('módulo ' + i + ' com questão de 4 alternativas', r.alts === 4, 'alts=' + r.alts);
  }
  /* módulos com simulador interativo */
  const withSim = [1,3,4,5,6,7,8,0,2];
  const noLab = window.__P.moduleResults.filter(r => r.labHTML === 0).map(r => r.mod);
  ok('todos os módulos montam simulador', noLab.length === 0, 'sem simulador: ' + noLab.join(','));
});

/* 8 — respondendo questões (certa e errada) */
STEPS.push(() => {
  click('#moduleBar .mod-btn[data-mod="3"]');
  const alts = document.querySelectorAll('#qAlts .alt-btn');
  ok('alternativas clicáveis', alts.length === 4);
  alts[0].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  const fb = document.getElementById('qFeedback').innerHTML;
  ok('feedback de resposta incorreta + gabarito', fb.includes('incorreta') && fb.includes('correta'));
  const reset = document.getElementById('qReset');
  ok('botão de tentar novamente aparece', !!reset);
  if (reset) reset.dispatchEvent(new MouseEvent('click', { bubbles:true }));
  const alts2 = document.querySelectorAll('#qAlts .alt-btn');
  alts2[1].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  ok('feedback de resposta correta', document.getElementById('qFeedback').innerHTML.includes('correta'));
});

/* 9 — simuladores específicos */
STEPS.push(() => {
  /* M0 — troca de tipo celular */
  click('#moduleBar .mod-btn[data-mod="0"]');
  const ct = document.querySelectorAll('#labContent [data-ct]');
  ok('M0 tem 3 tipos celulares', ct.length === 3);
  ct[1].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  ok('M0 alterna para vegetal', window.__cvState.cellType === 'vegetal');
  ok('lista mostra estruturas vegetais', [...document.querySelectorAll('#orgList .org-item')].some(b => b.dataset.id === 'cloroplasto' && b.style.display !== 'none'));
  ct[2].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  ok('M0 alterna para procarionte', window.__cvState.cellType === 'procarionte');
  const visProk = [...document.querySelectorAll('#orgList .org-item')].filter(b => b.style.display !== 'none').length;
  ok('procarionte lista apenas 4 estruturas', visProk === 4, visProk + ' visíveis');
  ct[0].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  ok('M0 volta para animal', window.__cvState.cellType === 'animal');

  /* M1 — osmose */
  click('#moduleBar .mod-btn[data-mod="1"]');
  setRange('#osmSlider', -100);
  ok('M1 hipotônico detectado', document.getElementById('osmStatus').textContent.length > 3, document.getElementById('osmStatus').textContent);
  setRange('#osmSlider', 100);
  ok('M1 hipertônico → crenação', /Crenação|Plasmólise/.test(document.getElementById('osmStatus').textContent), document.getElementById('osmStatus').textContent);
  setRange('#osmSlider', 0);
  ok('M1 isotônico', document.getElementById('osmStatus').textContent === 'Isotônico');

  /* M3 — respiração */
  click('#moduleBar .mod-btn[data-mod="3"]');
  setRange('#o2Slider', 100);
  const atpMax = Number(document.getElementById('atpNum').textContent);
  setRange('#o2Slider', 0);
  const atpMin = Number(document.getElementById('atpNum').textContent);
  ok('M3 ATP aeróbio = 38', atpMax === 38, String(atpMax));
  ok('M3 ATP anaeróbio = 2', atpMin === 2, String(atpMin));
  ok('M3 estado anaeróbio', /Anaeróbia/.test(document.getElementById('respStatus').textContent));
  setRange('#o2Slider', 60);

  /* M4 — ciclo celular */
  click('#moduleBar .mod-btn[data-mod="4"]');
  setRange('#cycSlider', 0);
  const g1 = document.getElementById('cycVal').textContent;
  setRange('#cycSlider', 78);
  const meta = document.getElementById('cycVal').textContent;
  ok('M4 fase G1 correta', g1 === 'G1', g1);
  ok('M4 metáfase correta', meta === 'Metáfase', meta);
  setRange('#cycSlider', 0);

  /* M5 — fotossíntese */
  click('#moduleBar .mod-btn[data-mod="5"]');
  ok('M5 força célula vegetal', window.__cvState.cellType === 'vegetal', window.__cvState.cellType);
  setRange('#lightSlider', 0);
  ok('M5 sem luz', /Sem luz/.test(document.getElementById('photoStatus').textContent));
  setRange('#lightSlider', 100); setRange('#co2Slider', 100);
  ok('M5 fotossíntese plena', /plena/.test(document.getElementById('photoStatus').textContent));
  setRange('#lightSlider', 100); setRange('#co2Slider', 0);
  ok('M5 limitação por CO₂', /CO₂/.test(document.getElementById('photoStatus').textContent));

  /* M6 — junções */
  click('#moduleBar .mod-btn[data-mod="6"]');
  const js = document.querySelectorAll('#labContent [data-j]');
  ok('M6 tem 4 opções de junção', js.length === 4);
  js[1].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  ok('M6 seleciona junção gap', window.__cvState.junctionType === 'gap');
  js[3].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  ok('M6 oculta junções', window.__cvState.junctionType === null);

  /* M7 — diferenciação e apoptose */
  click('#moduleBar .mod-btn[data-mod="7"]');
  setRange('#apoSlider', 100);
  ok('M7 apoptose em 100%', /Apoptose/.test(document.getElementById('apoStatus').textContent));
  setRange('#apoSlider', 0);
  ok('M7 célula viável', /viável/.test(document.getElementById('apoStatus').textContent));

  /* M8 — vírus */
  click('#moduleBar .mod-btn[data-mod="8"]');
  const vs = document.querySelectorAll('#labContent [data-v]');
  ok('M8 tem 3 opções virais', vs.length === 3);
  vs[1].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  ok('M8 ciclo lisogênico', window.__cvState.virus === 'lisogenic');
  vs[2].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  ok('M8 oculta vírus', window.__cvState.virus === null);
});

/* 10 — reset e volta ao modo explorar */
STEPS.push(() => {
  click('#modeExplore');
  ok('volta ao modo explorar', window.__cvState.mode === 'explore');
  ok('restaura célula animal', window.__cvState.cellType === 'animal');
  window.__cvSelect('golgi', false);
  click('#resetBtn');
  ok('reset limpa a seleção', window.__cvState.selectedId === null);
  ok('reset zera a explosão', window.__cvState.explode === 0);
  ok('ficha volta ao estado vazio', document.getElementById('ficha').innerHTML.includes('empty-ficha'));
  click('#modeAula');
  ok('modo aula reaplica o módulo', document.getElementById('aulaTheory').innerHTML.length > 200);
  click('#modeExplore');
  click('#studyBtn');
  ok('modo estudo alterna', document.body.classList.contains('study'));
  click('#studyBtn');
});

/* 11 — aciona todos os módulos mais uma vez para pegar erros tardios */
STEPS.push(() => {
  for (let i = 0; i <= 8; i++){
    click('#moduleBar .mod-btn[data-mod="' + i + '"]');
  }
  click('#modeExplore');
  ok('segunda passagem por todos os módulos sem falhas', true);
});

/* 12 — comparação estrutural */
STEPS.push(() => {
  window.__cvSelect('mitocondria', false);
  const pin = document.getElementById('cmpPin');
  ok('botão de fixar aparece na ficha', !!pin);
  pin.dispatchEvent(new MouseEvent('click', { bubbles:true }));
  ok('estrutura fixada', window.__cvState.compareWith === 'mitocondria');
  window.__cvSelect('golgi', false);
  const f = document.getElementById('ficha').innerHTML;
  ok('tabela de comparação renderizada', f.includes('cmp-grid') && f.includes('Comparação estrutural'));
  ok('comparação contrasta as duas estruturas', f.includes('Mitocôndria') && f.includes('Complexo de Golgi'));
  const clear = document.getElementById('cmpClear');
  clear.dispatchEvent(new MouseEvent('click', { bubbles:true }));
  ok('comparação limpa', window.__cvState.compareWith === null);
  click('.topbar-modes button[data-mode="compare"]');
  ok('botão Comparar fixa a seleção atual', window.__cvState.compareWith === 'golgi');
  click('.topbar-modes button[data-mode="compare"]');
  ok('botão Comparar desfaz a fixação', window.__cvState.compareWith === null);
  window.__cvSelect(null, false);
  ok('deseleção funciona', window.__cvState.selectedId === null);
});

/* 13 — todas as 18 estruturas renderizam ficha no tipo celular em que existem */
STEPS.push(() => {
  /* estruturas animais (exclui as exclusivas de vegetais/procariontes) */
  const animal = ['membrana','citoplasma','juncoes','nucleo','mitocondria','re_rugoso','re_liso','golgi',
                  'ribossomos','lisossomos','peroxissomos','vesiculas','centrossomo','citoesqueleto'];
  const SECTIONS = ['Descrição anatômica','Localização celular','Características estruturais','Composição','Função biológica',
                    'Processos celulares','Relação com outras','Curiosidades','Consequências','Escala'];
  const missing = [];
  const check = (id, tag) => {
    window.__cvSelect(id, false);
    const html = document.getElementById('ficha').innerHTML;
    if (!html.includes('ficha-sec')) { missing.push(tag + ':' + id + '(vazia)'); return; }
    SECTIONS.forEach(sec => { if (!html.includes(sec)) missing.push(tag + ':' + id + ':' + sec); });
  };
  animal.forEach(id => check(id, 'animal'));
  ok('14 estruturas animais com as 10 seções científicas obrigatórias', missing.length === 0, missing.join(', '));

  /* estruturas vegetais com o tipo vegetal ativo */
  const missV = [];
  window.__cvApplyModule('0');
  const ct = document.querySelectorAll('#labContent [data-ct]');
  ct[1].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  ['parede','cloroplasto','vacuolo'].forEach(id => {
    window.__cvSelect(id, false);
    const html = document.getElementById('ficha').innerHTML;
    if (!html.includes('ficha-sec')) missV.push(id + '(vazia)');
    SECTIONS.forEach(sec => { if (!html.includes(sec)) missV.push(id + ':' + sec); });
  });
  ok('3 estruturas vegetais exclusivas com ficha completa', missV.length === 0, missV.join(','));

  /* estruturas exclusivas ficam indisponíveis fora do seu tipo celular */
  ct[0].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  window.__cvSelect('parede', false);
  ok('estrutura vegetal não abre ficha em célula animal', window.__cvState.selectedId === null);
  ct[2].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  const missP = [];
  ['membrana','citoplasma','ribossomos','nucleoide'].forEach(id => {
    window.__cvSelect(id, false);
    const html = document.getElementById('ficha').innerHTML;
    if (!html.includes('ficha-sec')) missP.push(id + '(vazia)');
    SECTIONS.forEach(sec => { if (!html.includes(sec)) missP.push(id + ':' + sec); });
  });
  ok('nucleoide com ficha completa no procarionte', missP.length === 0, missP.join(','));
  ct[0].dispatchEvent(new MouseEvent('click', { bubbles:true }));
  click('#modeExplore');
});

let si = 0;
function run(){
  if (si >= STEPS.length){
    const out = document.getElementById('__probe');
    out.textContent = JSON.stringify(window.__P);
    return;
  }
  try { STEPS[si](); }
  catch (e){ window.__P.errors.push('STEP' + si + ': ' + e.message); window.__P.fails.push('step' + si); }
  si++;
  setTimeout(run, 320);
}
setTimeout(run, 4200);
</script>
<div id="__probe" style="display:none"></div>
`;

html = html.replace('<body>', '<body>' + harness);
fs.writeFileSync(PROBE, html, 'utf8');

const url = 'file:///' + PROBE.replace(/\\/g, '/').replace(/ /g, '%20');

let dom = '';
try {
  dom = execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    '--enable-unsafe-swiftshader', '--use-gl=swiftshader',
    '--hide-scrollbars', '--virtual-time-budget=30000',
    '--window-size=1600,1000', '--dump-dom', url
  ], { encoding:'utf8', maxBuffer: 96*1024*1024, stdio:['ignore','pipe','ignore'] });
} catch (e){
  console.error('Falha ao executar o Chrome:', e.message);
  process.exit(2);
}

const m = dom.match(/<div id="__probe"[^>]*>([\s\S]*?)<\/div>/);
if (!m){ console.error('Sem resultado da sondagem.'); process.exit(3); }

let payload = m[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
let data;
try { data = JSON.parse(payload); }
catch (e){ console.error('JSON inválido:', payload.slice(0, 1200)); process.exit(4); }

console.log(data.log.join('\n'));
console.log('\n----- erros capturados (' + data.errors.length + ') -----');
console.log(data.errors.length ? data.errors.join('\n') : '(nenhum)');
console.log('\n----- simuladores -----');
console.log(JSON.stringify(data.moduleResults, null, 1));

if (data.fails.length){
  console.error('\n>>> ' + data.fails.length + ' FALHA(S): ' + data.fails.join(' | '));
  process.exit(1);
}
if (data.errors.length){
  console.error('\n>>> ERROS DE RUNTIME DURANTE A INTERAÇÃO.');
  process.exit(1);
}
console.log('\n>>> TODAS AS VERIFICAÇÕES PASSARAM.');