/* =====================================================================
   build.mjs — inline dos módulos JS no index.html autocontido
   Uso: node build.mjs
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(ROOT, '..', 'src');
const TEMPLATE = path.join(ROOT, 'template.html');
const OUT = path.join(ROOT, '..', 'index.html');

/* Ordem de dependência: cada arquivo só referencia o que já foi declarado antes.
   dados -> estado -> cenas -> núcleo -> interface -> motor */
const FILES = [
  'dados/citologia.js',        // catálogo científico das organelas
  'dados/modulos.js',          // módulos de estudo do núcleo original
  'dados/biologia.js',         // trilhas de Biologia para ENEM/Unicamp
  'dados/quimica.js',          // trilhas de Química para ENEM/Unicamp
  'dados/trilhas.js',          // registro unificado das trilhas
  'nucleo/estado.js',          // estado global e utilidades
  'cenas/celula.js',           // geometria 3D da célula
  'cenas/animacoes.js',        // animações de processos celulares
  'cenas/ecossistema.js',      // cena 3D de Ecologia
  'cenas/sistema-humano.js',   // cena 3D de Fisiologia Humana
  'cenas/moleculas.js',        // cenas moleculares de Química
  'cenas/registro.js',          // gerenciador de cenas (troca entre célula, ecossistema, corpo e moléculas)
  'nucleo/visualizacao.js',    // modos de visualização
  'nucleo/selecao.js',         // seleção e identificação visual
  'interface/ui.js',           // interface, fichas e questões
  'interface/simuladores.js',  // simuladores interativos
  'nucleo/motor.js'            // renderer, câmera, loop e boot
];

const IMPORT_RE = /^\s*import\s+[^;]*?from\s*['"]([^'"]+)['"]\s*;?\s*$/gm;
const DECL_RE = /^(?:export\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm;
const DECL_LIST_RE = /^(?:export\s+)?(?:const|let|var)\s*\{([^}]*)\}/gm;

let body = '';
const declared = new Map();   // nome -> arquivo que declarou primeiro
const conflicts = [];

for (const f of FILES){
  const raw = fs.readFileSync(path.join(SRC_DIR, f), 'utf8');

  /* 1. remove imports relativos (o bundle é um único módulo) */
  let code = raw.replace(IMPORT_RE, (m, spec) => {
    if (spec.startsWith('.')) return '';
    return m;                     // mantém 'three' e 'three/addons/...'
  });

  /* 2. remove a palavra-chave export */
  code = code.replace(/^export\s+(?=(const|let|var|function|class|async))/gm, '');
  code = code.replace(/^export\s*\{[^}]*\}\s*;?\s*$/gm, '');

  /* 3. detecta declarações duplicadas no escopo do módulo */
  const names = [];
  let m;
  DECL_RE.lastIndex = 0;
  while ((m = DECL_RE.exec(code))) names.push(m[1]);
  DECL_LIST_RE.lastIndex = 0;
  while ((m = DECL_LIST_RE.exec(code))){
    m[1].split(',').forEach(part => {
      const nm = part.trim().split(/[:\s]/)[0].trim();
      if (nm) names.push(nm);
    });
  }
  for (const n of names){
    if (declared.has(n) && declared.get(n) !== f){
      conflicts.push(`${n}: ${declared.get(n)} -> ${f}`);
    } else if (!declared.has(n)){
      declared.set(n, f);
    }
  }

  body += `\n/* ===== ${f} ===== */\n` + code.trim() + '\n';
}

if (conflicts.length){
  console.error('CONFLITOS DE DECLARAÇÃO NO ESCOPO DO MÓDULO:\n' + conflicts.map(c => ' - ' + c).join('\n'));
  process.exit(1);
}

/* import único de THREE no topo + addons */
const head = `import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
`;

body = body.replace(/^\s*import \* as THREE from 'three';\s*$/gm, '');
body = body.replace(/^\s*import \{ OrbitControls \}[^;]*;\s*$/gm, '');
body = body.replace(/^\s*import \{ RoomEnvironment \}[^;]*;\s*$/gm, '');

const finalJs = head + body;

const tpl = fs.readFileSync(TEMPLATE, 'utf8');
if (!tpl.includes('/*__JS__*/')){
  console.error('template.html não contém o marcador /*__JS__*/');
  process.exit(1);
}

const html = tpl.replace('/*__JS__*/', finalJs);
fs.writeFileSync(OUT, html, 'utf8');

/* arquivo auxiliar apenas para validação de sintaxe (node --check) */
fs.writeFileSync(path.join(ROOT, 'bundle.check.mjs'), finalJs, 'utf8');

console.log('OK  ->', OUT);
console.log('    tamanho:', (html.length/1024).toFixed(1), 'KB');
console.log('    módulos inline:', FILES.length);