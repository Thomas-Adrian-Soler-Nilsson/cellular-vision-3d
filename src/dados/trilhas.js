/* =====================================================================
   trilhas.js — registro unificado das trilhas de estudo

   Três trilhas compõem o laboratório:

     citologia  — os 9 módulos originais sobre a célula (MODULES)
     biologia   — 7 temas de Biologia para ENEM/Unicamp
     quimica    — 7 temas de Química para ENEM/Unicamp

   Este arquivo resolve qualquer unidade de estudo por uma chave única,
   de modo que a interface e o motor tratem as três trilhas da mesma
   forma, sem ramificações espalhadas pelo código.
   ===================================================================== */

import { MODULES } from './modulos.js';
import { TRILHA_BIOLOGIA } from './biologia.js';
import { TRILHA_QUIMICA } from './quimica.js';

export const TRILHAS = {
  citologia: {
    id: 'citologia',
    nome: 'Citologia',
    icone: '🔬',
    cor: '#5ec8ff',
    descricao: 'Nove módulos sobre a célula eucariótica: da membrana ao ciclo celular, ' +
               'com modelo 3D navegável e simuladores.'
  },
  biologia: TRILHA_BIOLOGIA,
  quimica: TRILHA_QUIMICA
};

export const TRILHA_ORDER = ['citologia', 'biologia', 'quimica'];

/* ---------------------------------------------------------------
   Tabela de incidência levantada nas duas provas.
   Usada no painel de comparação da interface.
   --------------------------------------------------------------- */
export const INCIDENCIA_BIOLOGIA = [
  { tema:'Ecologia',                   enem:'25% a 29%', unicamp:'21%',     nota:'Tema mais cobrado nas duas provas' },
  { tema:'Fisiologia Humana',          enem:'12% a 15%', unicamp:'recorrente', nota:'No ENEM aparece ligada à saúde pública' },
  { tema:'Genética e Biotecnologia',   enem:'10% a 12%', unicamp:'10%',     nota:'Leis de Mendel e heredogramas' },
  { tema:'Biologia Celular / Citologia', enem:'10% a 12%', unicamp:'5%',    nota:'Na UNICAMP inclui microscopia' },
  { tema:'Zoologia',                   enem:'13% a 15%', unicamp:'10%',     nota:'UNICAMP enfatiza Arthropoda e mamíferos' },
  { tema:'Evolução',                   enem:'menor',     unicamp:'11,5%',   nota:'Peso bem maior na UNICAMP' },
  { tema:'Botânica',                   enem:'7,7%',      unicamp:'recorrente', nota:'Fisiologia vegetal e fitocromo' }
];

export const INCIDENCIA_QUIMICA = [
  { tema:'Físico-Química',       enem:'28,4%', unicamp:'18,8%', nota:'Área mais ampla das duas provas' },
  { tema:'Química Orgânica',     enem:'28,4%', unicamp:'relevante', nota:'Funções e reações orgânicas' },
  { tema:'Química Ambiental',    enem:'18,5%', unicamp:'12,9%', nota:'Química verde e poluição' },
  { tema:'Estequiometria',       enem:'8%',    unicamp:'11,9%', nota:'Peso maior na UNICAMP' },
  { tema:'Soluções',             enem:'6,6%',  unicamp:'9,3%',  nota:'Concentração e diluição' },
  { tema:'Eletroquímica',        enem:'6,6%',  unicamp:'recorrente', nota:'Pilhas e eletrólise' },
  { tema:'Equilíbrio Químico',   enem:'8,9%',  unicamp:'9,3%',  nota:'Inclui pH e pOH' }
];

export const INCIDENCIA = { biologia: INCIDENCIA_BIOLOGIA, quimica: INCIDENCIA_QUIMICA };

/* ---------------------------------------------------------------
   Índice de temas: id do tema -> { tema, trilha }
   --------------------------------------------------------------- */
export const TEMA_INDEX = {};
['biologia', 'quimica'].forEach(tid => {
  TRILHAS[tid].temas.forEach(t => { TEMA_INDEX[t.id] = { tema: t, trilha: tid }; });
});

/* ---------------------------------------------------------------
   Resolução de uma unidade de estudo.

   Chave aceita:
     '0'..'8'          -> módulo de citologia
     id de tema        -> tema de biologia ou química
     'biologia:ecologia' -> forma explícita, também aceita

   Devolve sempre um objeto normalizado:
     { key, trilha, titulo, subtitulo, teoria, questao, sim, cena, incidencia }
   ou null se a chave não existir.
   --------------------------------------------------------------- */
export function resolveUnidade(key){
  if (key === null || key === undefined) return null;
  let k = String(key);

  /* forma explícita trilha:tema */
  if (k.includes(':')){
    const [tid, temaId] = k.split(':');
    if (TRILHAS[tid] && TRILHAS[tid].temas){
      const t = TRILHAS[tid].temas.find(x => x.id === temaId);
      if (t) return temaParaUnidade(tid, t);
    }
    return null;
  }

  /* módulo de citologia */
  if (MODULES[k]){
    const m = MODULES[k];
    return {
      key: k,
      trilha: 'citologia',
      titulo: m.titulo,
      subtitulo: m.subtitulo,
      teoria: m.teoria,
      questao: m.questao,
      sim: m.sim || {},
      cena: 'celula',
      incidencia: null,
      rotulo: 'Módulo ' + k
    };
  }

  /* tema das trilhas de biologia ou química */
  const hit = TEMA_INDEX[k];
  if (hit) return temaParaUnidade(hit.trilha, hit.tema);

  return null;
}

function temaParaUnidade(trilhaId, t){
  return {
    key: t.id,
    trilha: trilhaId,
    titulo: t.titulo,
    subtitulo: t.resumo,
    teoria: t.teoria,
    questao: t.questao,
    sim: t.sim || {},
    cena: t.cena || 'celula',
    incidencia: t.incidencia || null,
    icone: t.icone || '',
    rotulo: TRILHAS[trilhaId].nome
  };
}

/* Lista plana de todas as unidades de uma trilha, para montar menus */
export function unidadesDaTrilha(trilhaId){
  if (trilhaId === 'citologia'){
    return Object.keys(MODULES)
      .sort((a, b) => Number(a) - Number(b))
      .map(k => resolveUnidade(k));
  }
  const tr = TRILHAS[trilhaId];
  if (!tr || !tr.temas) return [];
  return tr.temas.map(t => resolveUnidade(t.id));
}