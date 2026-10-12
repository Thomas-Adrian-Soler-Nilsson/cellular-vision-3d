/* =====================================================================
   probe.mjs — valida o index.html em navegador headless
   Captura erros de console/página, o estado do overlay #loading e a
   presença dos elementos de UI preenchidos pelo JavaScript.
   Uso: node probe.mjs
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.join(ROOT, '..');
const SRC = path.join(PROJECT, 'index.html');
const PROBE = path.join(ROOT, '_probe.html');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

let html = fs.readFileSync(SRC, 'utf8');

/* injeta o capturador antes do módulo principal */
const capture = `
<div id="__probe" style="position:fixed;left:0;top:0;z-index:99999;display:none"></div>
<script>
window.__probeErrors = [];
window.addEventListener('error', e => {
  window.__probeErrors.push('ERROR: ' + (e.message || e.type) + ' @ ' + (e.filename||'') + ':' + (e.lineno||''));
});
window.addEventListener('unhandledrejection', e => {
  window.__probeErrors.push('REJECT: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)));
});
const _ce = console.error, _cw = console.warn;
console.error = function(){ window.__probeErrors.push('CONSOLE.ERROR: ' + [...arguments].map(String).join(' ')); _ce.apply(console, arguments); };
console.warn  = function(){ window.__probeErrors.push('CONSOLE.WARN: '  + [...arguments].map(String).join(' ')); _cw.apply(console, arguments); };
setTimeout(() => {
  const d = document.getElementById('__probe');
  if (!d) return;
  const loading = document.getElementById('loading');
  d.textContent = JSON.stringify({
    errors: window.__probeErrors,
    loadingHidden: loading ? loading.classList.contains('hide') : null,
    loadingHTML: loading ? loading.innerHTML.slice(0, 400) : null,
    orgItems: document.querySelectorAll('#orgList .org-item').length,
    moduleBtns: document.querySelectorAll('#moduleBar .mod-btn').length,
    fichaHTML: (document.getElementById('ficha') || {}).innerHTML ? document.getElementById('ficha').innerHTML.slice(0,120) : null,
    canvas: (() => { const c = document.getElementById('c'); return c ? c.width + 'x' + c.height : null; })(),
    hasSelect: typeof window.__cvSelect,
    stateCell: window.__cvState ? window.__cvState.cellType : null
  });
}, 9000);
</script>`;

html = html.replace('<body>', '<body>' + capture);
fs.writeFileSync(PROBE, html, 'utf8');

const url = 'file:///' + PROBE.replace(/\\/g, '/').replace(/ /g, '%20');

let dom = '';
try {
  dom = execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    '--enable-unsafe-swiftshader', '--use-gl=swiftshader',
    '--hide-scrollbars', '--virtual-time-budget=14000',
    '--window-size=1600,1000', '--dump-dom', url
  ], { encoding:'utf8', maxBuffer: 64*1024*1024, stdio:['ignore','pipe','ignore'] });
} catch (e){
  console.error('Falha ao executar o Chrome:', e.message);
  process.exit(2);
}

const m = dom.match(/<div id="__probe"[^>]*>([\s\S]*?)<\/div>/);
if (!m){
  console.error('Não foi possível ler o resultado da sondagem.');
  process.exit(3);
}

/* desfaz o escape de HTML feito pelo dump-dom */
let payload = m[1]
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>');

let data;
try { data = JSON.parse(payload); }
catch (e){ console.error('JSON inválido:', payload.slice(0, 600)); process.exit(4); }

console.log(JSON.stringify(data, null, 2));

const fatal = (data.errors || []).filter(x => x.startsWith('ERROR:') || x.startsWith('REJECT:'));
if (!data.loadingHidden) { console.error('\n>>> FALHA: o overlay de carregamento não foi removido (boot incompleto).'); process.exit(1); }
if (fatal.length) { console.error('\n>>> FALHA: erros não capturados durante a execução.'); process.exit(1); }
if (!data.orgItems || data.orgItems < 10) { console.error('\n>>> FALHA: lista de estruturas não foi construída.'); process.exit(1); }
console.log('\nOK: aplicação inicializada sem erros fatais.');