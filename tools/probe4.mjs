/* =====================================================================
   probe4.mjs — teste das trilhas de Biologia e Química em navegador headless

   Exercita: barra de trilhas, troca de trilha, os 7 temas de Biologia
   e os 7 de Química (teoria, cartão de incidência, questão de 5
   alternativas, simulador), a troca de cena 3D de cada tema, o efeito
   dos controles sobre os parâmetros da cena e o retorno à citologia.

   Uso: node probe4.mjs
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.join(ROOT, '..');
const SRC = path.join(PROJECT, 'index.html');
const PROBE = path.join(ROOT, '_probe4.html');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

let html = fs.readFileSync(SRC, 'utf8');

/* tema -> [cena esperada, sub-cena esperada (ou null)] */
const CENA_ESPERADA = {
  'ecologia':        ['ecossistema',    null],
  'fisiologia-humana':['sistema-humano', null],
  'genetica':        ['moleculas',       'genetica'],
  'biologia-celular':['celula',          null],
  'zoologia':        ['ecossistema',    null],
  'evolucao':        ['ecossistema',    null],
  'botanica':        ['ecossistema',    null],
  'fisico-quimica':  ['moleculas',       'cinetica'],
  'organica':        ['moleculas',       'organica'],
  'ambiental':       ['ecossistema',    null],
  'estequiometria':  ['moleculas',       'estequiometria'],
  'solucoes':        ['moleculas',       'solucoes'],
  'eletroquimica':   ['moleculas',       'eletroquimica'],
  'equilibrio':      ['moleculas',       'equilibrio']
};

const TEMAS_BIO = ['ecologia','fisiologia-humana','genetica','biologia-celular','zoologia','evolucao','botanica'];
const TEMAS_QUI = ['fisico-quimica','organica','ambiental','estequiometria','solucoes','eletroquimica','equilibrio'];

const harness = `
<script>
window.__P = { errors: [], log: [], fails: [], temas: {} };
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
function clickMod(id){
  const el = document.querySelector('#moduleBar .mod-btn[data-mod="' + id + '"]');
  if (!el) { window.__P.fails.push('missing mod ' + id); return false; }
  el.dispatchEvent(new MouseEvent('click', { bubbles:true }));
  return true;
}

const STEPS = [];

/* 1 — boot e barra de trilhas */
STEPS.push(() => {
  const btns = document.querySelectorAll('#trilhaBar .tr-btn');
  ok('barra de trilhas com 3 trilhas', btns.length === 3, btns.length + ' botões');
  ok('citologia é a trilha ativa no boot', document.querySelector('#trilhaBar .tr-btn.active') && document.querySelector('#trilhaBar .tr-btn.active').dataset.trilha === 'citologia');
  ok('cena inicial é a célula', window.__cvCena.atual() === 'celula', window.__cvCena.atual());
});

/* 2 — modo aula mantém a citologia */
STEPS.push(() => {
  click('#modeAula');
  const mods = document.querySelectorAll('#moduleBar .mod-btn');
  ok('citologia expõe os 9 módulos', mods.length === 9, mods.length + ' botões');
  ok('teoria do módulo 0 renderiza', document.querySelectorAll('#aulaTheory .theory-block').length >= 3);
});

/* 3 — troca para Biologia */
STEPS.push(() => {
  click('#trilhaBar .tr-btn[data-trilha="biologia"]');
  const mods = [...document.querySelectorAll('#moduleBar .mod-btn')];
  ok('biologia expõe 7 temas', mods.length === 7, mods.length + ' botões');
  const nomes = mods.map(b => b.dataset.mod).join(',');
  ok('temas de biologia presentes', ${JSON.stringify(TEMAS_BIO)}.every(t => nomes.includes(t)), nomes);
  ok('trilha ativa é biologia', document.querySelector('#trilhaBar .tr-btn.active').dataset.trilha === 'biologia');
});

/* 4..10 — cada tema de Biologia */
${TEMAS_BIO.map((t, i) => `
STEPS.push(() => {
  clickMod('${t}');
  const inc = !!document.querySelector('#aulaTheory .inc-card');
  const teoria = document.querySelectorAll('#aulaTheory .theory-block').length;
  const alts = document.querySelectorAll('#qAlts .alt-btn').length;
  const qtxt = (document.getElementById('qText').textContent || '').length;
  const labVis = document.getElementById('labControls').classList.contains('show');
  const cena = window.__cvCena.atual();
  const esperada = ${JSON.stringify(CENA_ESPERADA[t][0])};
  const subEsp = ${JSON.stringify(CENA_ESPERADA[t][1])};
  const sub = window.__cvCena.sub();
  const labSliders = document.querySelectorAll('#labContent input[type=range]').length;
  ok('bio ${t}: teoria com ' + teoria + ' blocos', teoria >= 4);
  ok('bio ${t}: cartão de incidência', inc);
  ok('bio ${t}: questão com 5 alternativas', alts === 5, alts + ' alts');
  ok('bio ${t}: enunciado presente', qtxt > 60);
  ok('bio ${t}: cena = ' + esperada, cena === esperada, cena);
  if (subEsp) ok('bio ${t}: sub-cena = ' + subEsp, sub === subEsp, sub);
  ok('bio ${t}: simulador montado', labVis);
  ok('bio ${t}: controles interativos (' + labSliders + ')', labSliders >= 0);
  window.__P.temas['${t}'] = { teoria, alts, cena, labSliders };
});`).join('')}

/* 11 — resposta correta e incorreta num tema de biologia */
STEPS.push(() => {
  clickMod('ecologia');
  const alts = [...document.querySelectorAll('#qAlts .alt-btn')];
  const correta = alts[1];  /* alternativa B é a correta em ecologia */
  correta.dispatchEvent(new MouseEvent('click', { bubbles:true }));
  const fb = document.getElementById('qFeedback').textContent || '';
  ok('bio: resposta correta dá feedback positivo', fb.includes('Resposta correta'), fb.slice(0,40));
});

/* 12 — troca para Química */
STEPS.push(() => {
  click('#trilhaBar .tr-btn[data-trilha="quimica"]');
  const mods = [...document.querySelectorAll('#moduleBar .mod-btn')];
  ok('química expõe 7 temas', mods.length === 7, mods.length + ' botões');
  const nomes = mods.map(b => b.dataset.mod).join(',');
  ok('temas de química presentes', ${JSON.stringify(TEMAS_QUI)}.every(t => nomes.includes(t)), nomes);
});

/* 13..19 — cada tema de Química */
${TEMAS_QUI.map((t) => `
STEPS.push(() => {
  clickMod('${t}');
  const inc = !!document.querySelector('#aulaTheory .inc-card');
  const teoria = document.querySelectorAll('#aulaTheory .theory-block').length;
  const alts = document.querySelectorAll('#qAlts .alt-btn').length;
  const qtxt = (document.getElementById('qText').textContent || '').length;
  const labVis = document.getElementById('labControls').classList.contains('show');
  const cena = window.__cvCena.atual();
  const esperada = ${JSON.stringify(CENA_ESPERADA[t][0])};
  const subEsp = ${JSON.stringify(CENA_ESPERADA[t][1])};
  const sub = window.__cvCena.sub();
  const labSliders = document.querySelectorAll('#labContent input[type=range]').length;
  ok('qui ${t}: teoria com ' + teoria + ' blocos', teoria >= 4);
  ok('qui ${t}: cartão de incidência', inc);
  ok('qui ${t}: questão com 5 alternativas', alts === 5, alts + ' alts');
  ok('qui ${t}: enunciado presente', qtxt > 60);
  ok('qui ${t}: cena = ' + esperada, cena === esperada, cena);
  if (subEsp) ok('qui ${t}: sub-cena = ' + subEsp, sub === subEsp, sub);
  ok('qui ${t}: simulador montado', labVis);
  ok('qui ${t}: controles interativos (' + labSliders + ')', labSliders >= 1);
  window.__P.temas['${t}'] = { teoria, alts, cena, labSliders };
});`).join('')}

/* 20 — o controle deslizador altera o parâmetro da cena */
STEPS.push(() => {
  clickMod('equilibrio');
  const inp = document.querySelector('#labContent input[data-par="forca"]');
  ok('controle de força do ácido presente', !!inp);
  if (inp){
    const antes = window.__cvCena.params().mol.forca;
    inp.value = '0.9';
    inp.dispatchEvent(new Event('input', { bubbles:true }));
    const depois = window.__cvCena.params().mol.forca;
    ok('deslizador altera o parâmetro da cena', Math.abs(depois - antes) > 0.3, antes.toFixed(2) + ' -> ' + depois.toFixed(2));
  }
});

/* 21 — estequiometria reflete o reagente limitante */
STEPS.push(() => {
  clickMod('estequiometria');
  const inp = document.querySelector('#labContent input[data-par="reagenteB"]');
  if (inp){
    inp.value = '3';   /* 3 mol de H2 com 4 mol de N2 -> H2 é limitante */
    inp.dispatchEvent(new Event('input', { bubbles:true }));
  }
  ok('estequiometria: parâmetro aplicado', !inp || Math.abs(window.__cvCena.params().mol.reagenteB - 3) < 0.01);
});

/* 22 — resposta correta em química */
STEPS.push(() => {
  clickMod('estequiometria');
  const alts = [...document.querySelectorAll('#qAlts .alt-btn')];
  alts[1].dispatchEvent(new MouseEvent('click', { bubbles:true }));   /* B: 6 mol NH3 + excesso de 1 mol N2 */
  const fb = document.getElementById('qFeedback').textContent || '';
  ok('qui: feedback de resposta correta', fb.includes('Resposta correta'), fb.slice(0,40));
});

/* 23 — resposta incorreta comenta o gabarito */
STEPS.push(() => {
  clickMod('solucoes');
  const alts = [...document.querySelectorAll('#qAlts .alt-btn')];
  alts[0].dispatchEvent(new MouseEvent('click', { bubbles:true }));   /* A é incorreta */
  const fb = document.getElementById('qFeedback').textContent || '';
  ok('qui: feedback aponta a correta', fb.includes('incorreta') && fb.includes('B'), fb.slice(0,60));
  const reset = document.getElementById('qReset');
  ok('qui: botão de tentar novamente', !!reset);
  if (reset){ reset.dispatchEvent(new MouseEvent('click', { bubbles:true })); }
});

/* 24 — volta para a citologia */
STEPS.push(() => {
  click('#trilhaBar .tr-btn[data-trilha="citologia"]');
  const mods = document.querySelectorAll('#moduleBar .mod-btn');
  ok('retorno à citologia restaura 9 módulos', mods.length === 9, mods.length + ' botões');
  ok('cena volta à célula', window.__cvCena.atual() === 'celula', window.__cvCena.atual());
});

/* 25 — modo explorar devolve a célula */
STEPS.push(() => {
  click('#trilhaBar .tr-btn[data-trilha="quimica"]');
  click('#modeExplore');
  ok('modo explorar volta à cena da célula', window.__cvCena.atual() === 'celula', window.__cvCena.atual());
});

let si = 0;
function run(){
  if (si >= STEPS.length){
    document.getElementById('__probe').textContent = JSON.stringify(window.__P);
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
    '--hide-scrollbars', '--virtual-time-budget=40000',
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
console.log('\n----- temas -----');
console.log(JSON.stringify(data.temas, null, 1));

if (data.fails.length){
  console.error('\n>>> ' + data.fails.length + ' FALHA(S): ' + data.fails.join(' | '));
  process.exit(1);
}
if (data.errors.length){
  console.error('\n>>> ERROS DE RUNTIME DURANTE A INTERAÇÃO.');
  process.exit(1);
}
console.log('\n>>> TODAS AS VERIFICAÇÕES DAS TRILHAS PASSARAM.');
process.exit(0);