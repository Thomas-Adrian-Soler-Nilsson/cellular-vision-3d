/* =====================================================================
   registro.js — gerenciador de cenas

   O laboratório tem quatro cenas 3D independentes, todas penduradas na
   mesma THREE.Scene:

     celula         — o modelo de citologia (cellRoot)
     ecossistema    — paisagem de Ecologia, Botânica, Zoologia e Evolução
     sistema-humano — corpo humano esquemático de Fisiologia
     moleculas      — cenas químicas (estequiometria, soluções, equilíbrio...)

   Apenas uma fica visível por vez. Cada cena declara como é construída,
   como aplicar seus parâmetros e como atualizar por quadro, e o contrato
   é sempre o mesmo, o que permite trocar de trilha sem caso especial.
   ===================================================================== */

import * as THREE from 'three';
import { state } from './estado.js';
import { cellRoot, groups, buildCell } from './celula.js';
import { ecoRoot, buildEcossistema, ecoApply, updateEcossistema, ecoParams } from './ecossistema.js';
import { humRoot, buildSistemaHumano, humApply, updateSistemaHumano, humParams } from './sistema-humano.js';
import { molRoot, buildMoleculas, molApply, updateMoleculas, molParams, setMolCena, molCenaAtual } from './moleculas.js';

/* ---------------------------------------------------------------
   Catálogo das cenas.
   `roots` são os grupos que ligam/desligam; `params` é o objeto de
   parâmetros editável; `tick` é opcional.
   --------------------------------------------------------------- */
export const CENAS = {
  'celula': {
    id: 'celula',
    nome: 'Célula',
    roots: [cellRoot],
    build: null,          /* construída no boot pelo motor, com buildCell() */
    apply: null,
    params: null
  },
  'ecossistema': {
    id: 'ecossistema',
    nome: 'Ecossistema',
    roots: [ecoRoot],
    build: buildEcossistema,
    apply: ecoApply,
    tick: updateEcossistema,
    params: ecoParams
  },
  'sistema-humano': {
    id: 'sistema-humano',
    nome: 'Corpo humano',
    roots: [humRoot],
    build: buildSistemaHumano,
    apply: humApply,
    tick: updateSistemaHumano,
    params: humParams
  },
  'moleculas': {
    id: 'moleculas',
    nome: 'Cenas moleculares',
    roots: [molRoot],
    build: buildMoleculas,
    apply: molApply,
    tick: updateMoleculas,
    params: molParams,
    submode: true        /* aceita setMolCena para escolher a sub-cena */
  }
};

export const CENA_ORDER = ['celula', 'ecossistema', 'sistema-humano', 'moleculas'];

/* cena atualmente em exibição */
export const cenaState = { atual: 'celula', construidas: new Set() };

/* ---------------------------------------------------------------
   Prepara (constrói na primeira vez) uma cena, sem exibi-la.
   --------------------------------------------------------------- */
export function prepareCena(id){
  const c = CENAS[id];
  if (!c) return null;
  if (!cenaState.construidas.has(id)){
    if (typeof c.build === 'function'){
      try { c.build(); } catch (e){ console.error('falha ao construir a cena ' + id, e); }
    }
    cenaState.construidas.add(id);
  }
  return c;
}

/* ---------------------------------------------------------------
   Troca a cena visível. Desliga todas, liga a pedida, aplica os
   parâmetros guardados e devolve a cena ativa.
   --------------------------------------------------------------- */
export function setCena(id){
  const alvo = CENAS[id] ? id : 'celula';

  CENA_ORDER.forEach(k => {
    const c = CENAS[k];
    c.roots.forEach(r => { if (r) r.visible = (k === alvo); });
  });

  if (alvo !== 'celula') prepareCena(alvo);

  cenaState.atual = alvo;
  state.cena = alvo;

  const c = CENAS[alvo];

  /* a célula tem grupos internos com visibilidade própria */
  if (alvo === 'celula') restaurarGruposCelula();

  if (typeof c.apply === 'function'){
    try { c.apply(); } catch (e){ console.error('falha ao aplicar parâmetros da cena ' + alvo, e); }
  }

  return c;
}

/* ---------------------------------------------------------------
   Esconde tudo que não é a célula (usado quando a trilha sai da
   citologia e a célula precisa sair de cena por completo).
   --------------------------------------------------------------- */
export function esconderCelula(){
  cellRoot.visible = false;
}

/* Reaplica a visibilidade normal dos grupos internos da célula. */
export function restaurarGruposCelula(){
  cellRoot.visible = true;
  if (groups.membraneGroup) groups.membraneGroup.visible = state.cellType !== 'procarionte';
  if (groups.cytoGroup) groups.cytoGroup.visible = state.cellType !== 'procarionte';
}

/* ---------------------------------------------------------------
   Aplica os parâmetros de uma cena a partir de um objeto simples.
   Aceita apenas as chaves que a cena declara, ignorando o resto —
   é assim que os temas das trilhas alimentam os simuladores.
   --------------------------------------------------------------- */
export function aplicarParametros(id, valores){
  const c = CENAS[id];
  if (!c || !c.params || !valores) return;
  Object.keys(valores).forEach(k => {
    if (k in c.params) c.params[k] = valores[k];
  });
  if (typeof c.apply === 'function') c.apply();
}

/* ---------------------------------------------------------------
   Atualização por quadro. O motor chama uma vez por quadro e o
   gerenciador decide o que animar; cenas ocultas não gastam tempo.
   --------------------------------------------------------------- */
export function tickCenas(dt){
  const c = CENAS[cenaState.atual];
  if (!c) return;

  /* a célula é animada pelo próprio motor (updateAnimations) */
  if (cenaState.atual === 'celula') return;

  if (typeof c.tick === 'function'){
    try { c.tick(dt); } catch (e){ /* protege o loop de renderização */ }
  }
}

/* ---------------------------------------------------------------
   Escolhe a sub-cena química, quando houver.
   --------------------------------------------------------------- */
export function setCenaQuimica(nome){
  if (typeof setMolCena === 'function') setMolCena(nome);
} 

/* ---------------------------------------------------------------
   Mapeia o tipo de simulação de um tema para a cena 3D correta.
   --------------------------------------------------------------- */
const SIM_PARA_CENA = {
  'celula': 'celula',
  'photosynthesis': 'celula',
  'respiration': 'celula',
  'cell-cycle': 'celula',
  'osmosis': 'celula',
  'organelle-click': 'celula',
  'junctions': 'celula',
  'differentiation': 'celula',
  'virus': 'celula',
  'cell-compare': 'celula',
  'molecular': 'celula',

  'ecossistema': 'ecossistema',
  'zoologia': 'ecossistema',
  'evolucao': 'ecossistema',
  'botanica': 'ecossistema',
  'ambiental': 'ecossistema',

  'sistema-humano': 'sistema-humano',

  'genetica': 'moleculas',
  'estequiometria': 'moleculas',
  'solucoes': 'moleculas',
  'equilibrio': 'moleculas',
  'cinetica': 'moleculas',
  'eletroquimica': 'moleculas',
  'organica': 'moleculas'
};

/* Sub-cena química sugerida por cada tipo de simulação */
const SIM_PARA_SUBCENA = {
  'genetica': 'genetica',
  'estequiometria': 'estequiometria',
  'solucoes': 'solucoes',
  'equilibrio': 'equilibrio',
  'cinetica': 'cinetica',
  'eletroquimica': 'eletroquimica',
  'organica': 'organica'
};

export function cenaParaSim(tipoSim){
  return SIM_PARA_CENA[tipoSim] || 'celula';
}

export function subCenaParaSim(tipoSim){
  return SIM_PARA_SUBCENA[tipoSim] || null;
}

/* ---------------------------------------------------------------
   Atalho usado pelo motor: prepara e exibe a cena de um tipo de
   simulação, escolhendo também a sub-cena química quando aplicável.
   --------------------------------------------------------------- */
export function ativarCenaDoSim(tipoSim){
  const id = cenaParaSim(tipoSim);
  setCena(id);
  if (id === 'moleculas'){
    const sub = subCenaParaSim(tipoSim);
    if (sub) setCenaQuimica(sub);
  }
  return id;
}

/* ---------------------------------------------------------------
   Parâmetros declarados por um tema no campo `sim.parametros`.
   Cada item é { id, rotulo, min, max, valor }. O motor usa isso para
   gerar controles automaticamente, sem código específico por tema.
   --------------------------------------------------------------- */
export function aplicarParametrosDoTema(tipoSim, parametros){
  const id = cenaParaSim(tipoSim);
  if (!parametros || !parametros.length) return;
  const valores = {};
  parametros.forEach(p => { valores[p.id] = p.valor; });
  aplicarParametros(id, valores);
}

/* Estado interno exposto para depuração e para os testes automatizados */
window.__cvCena = {
  atual: () => cenaState.atual,
  set: setCena,
  sub: () => molCenaAtual,
  params: () => ({
    eco: ecoParams,
    hum: humParams,
    mol: molParams
  }),
  /* diagnóstico usado pelas sondagens: visibilidade, contagem e volume */
  diag: () => {
    const rel = {};
    CENA_ORDER.forEach(k => {
      const c = CENAS[k];
      let vis = 0, mesh = 0;
      c.roots.forEach(r => {
        if (r) r.traverse(o => {
          if ((o.isMesh || o.isInstancedMesh) && o.visible) mesh++;
          if (o.visible) vis++;
        });
      });
      const box = new THREE.Box3();
      c.roots.forEach(r => { if (r) box.expandByObject(r); });
      rel[k] = {
        visivel: c.roots.every(r => r && r.visible),
        objetosVisiveis: vis,
        malhasVisiveis: mesh,
        caixa: box.isEmpty() ? null : {
          min: [box.min.x.toFixed(2), box.min.y.toFixed(2), box.min.z.toFixed(2)],
          max: [box.max.x.toFixed(2), box.max.y.toFixed(2), box.max.z.toFixed(2)]
        }
      };
    });
    return rel;
  }
};