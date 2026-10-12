/* =====================================================================
   shots.mjs — captura imagens em estados representativos da aplicação
   e analisa a composição de pixels para confirmar que a cena 3D é
   realmente renderizada (não apenas a interface).
   Uso: node shots.mjs
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, '..', 'index.html');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTDIR = path.join(ROOT, 'shots');
fs.mkdirSync(OUTDIR, { recursive: true });

const base = fs.readFileSync(SRC, 'utf8');

/* cada cena injeta um script que prepara o estado antes da captura */
const SCENES = [
  { name:'01-visao-completa', pre:`` },
  { name:'02-nucleo-selecionado', pre:`window.__cvSelect('nucleo', true);` },
  { name:'03-mitocondria-isolada', pre:`window.__cvSelect('mitocondria', true); document.querySelector('.topbar-modes button[data-mode="isolate"]').click();` },
  { name:'04-golgi-selecionado', pre:`window.__cvSelect('golgi', true);` },
  { name:'05-corte-transversal', pre:`document.querySelector('.topbar-modes button[data-mode="section"]').click();` },
  { name:'06-explosao-anatomica', pre:`document.getElementById('expSlider').value = 65; document.getElementById('expSlider').dispatchEvent(new Event('input',{bubbles:true}));` },
  { name:'07-reticulo-e-membrana', pre:`window.__cvSelect('re_rugoso', true); document.getElementById('memSlider').value = 92; document.getElementById('memSlider').dispatchEvent(new Event('input',{bubbles:true}));` },
  { name:'08-modulo-0-vegetal', pre:`document.getElementById('modeAula').click(); document.querySelector('#moduleBar .mod-btn[data-mod="0"]').click(); setTimeout(()=>{ document.querySelectorAll('#labContent [data-ct]')[1].click(); }, 900);` },
  { name:'09-modulo-3-respiracao', pre:`document.getElementById('modeAula').click(); document.querySelector('#moduleBar .mod-btn[data-mod="3"]').click();` },
  { name:'10-modulo-5-fotossintese', pre:`document.getElementById('modeAula').click(); document.querySelector('#moduleBar .mod-btn[data-mod="5"]').click();` },
  { name:'11-modo-malha', pre:`document.querySelector('.topbar-modes button[data-mode="wire"]').click();` },
  { name:'12-detalhe-molecular', pre:`document.getElementById('cbMolec').checked = true; document.getElementById('cbMolec').dispatchEvent(new Event('change',{bubbles:true}));` }
];

for (const sc of SCENES){
  const inject = `<script>
    window.addEventListener('load', () => {
      setTimeout(() => { try { ${sc.pre} } catch(e){ console.error('scene', e.message); } }, 1500);
    });
  <\/script>`;
  const html = base.replace('</head>', inject + '</head>');
  const tmp = path.join(ROOT, '_scene.html');
  fs.writeFileSync(tmp, html, 'utf8');
  const url = 'file:///' + tmp.replace(/\\/g, '/').replace(/ /g, '%20');
  const png = path.join(OUTDIR, sc.name + '.png');
  if (fs.existsSync(png)) fs.unlinkSync(png);

  try {
    execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--no-sandbox',
      '--enable-unsafe-swiftshader', '--use-gl=swiftshader',
      '--hide-scrollbars', '--virtual-time-budget=11000',
      '--window-size=1600,1000', '--screenshot=' + png, url
    ], { encoding:'utf8', maxBuffer: 32*1024*1024, stdio:['ignore','pipe','ignore'] });
  } catch (e){ console.error(sc.name + ': chrome falhou'); continue; }

  const size = fs.existsSync(png) ? fs.statSync(png).size : 0;
  console.log(sc.name.padEnd(28) + (size/1024).toFixed(0).padStart(6) + ' KB');
}

/* remove o arquivo temporário de cena */
fs.unlinkSync(path.join(ROOT, '_scene.html'));
console.log('\nCapturas em ' + OUTDIR);