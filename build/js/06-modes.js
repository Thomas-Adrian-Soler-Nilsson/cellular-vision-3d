import * as THREE from 'three';
import {
  state, allMaterials, membraneMaterials, matState, pickables,
  registry, cellRoot, ORGANELLE_NODES, ORGANELLE_INDEX, HUB_SET, RENDER
} from './03-state.js';
import { groups, setCellType } from './04-cell.js';
import { anim } from './05-anim.js';

/* =====================================================================
   PARTE 6 — MODOS DE VISUALIZAÇÃO E SISTEMA DE SELEÇÃO
   ===================================================================== */

/* ---- snapshot do estado base de cada material ---- */
export function snapshotMaterials(){
  allMaterials.forEach(m => {
    if (matState.has(m)) return;
    matState.set(m, {
      opacity: m.opacity,
      transparent: m.transparent,
      depthWrite: m.depthWrite,
      wireframe: !!m.wireframe,
      emissiveIntensity: m.emissiveIntensity === undefined ? null : m.emissiveIntensity,
      visible: true
    });
  });
}

/* ---- associa cada material ao dono (organela ou animação) ---- */
export function tagMaterialsWithOwner(){
  const tag = (mat, owner) => { if (mat && mat.userData) mat.userData.__owner = owner; };
  cellRoot.traverse(o => {
    if ((o.isMesh || o.isInstancedMesh) && o.material){
      const id = o.userData.organelleId;
      if (!id) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => { if (m.userData && !m.userData.__owner) tag(m, id); });
    }
  });
  anim.vesicles.forEach(v => tag(v.mesh.material, '__anim'));
  anim.transports.forEach(v => tag(v.mesh.material, '__anim'));
  anim.atp.forEach(v => tag(v.material, '__anim'));
  anim.translations.forEach(t => t.segs.forEach(s => tag(s.material, '__anim')));
}

/* ---- helper: materiais pertencentes a uma estrutura ---- */
export function materialsOf(id){
  const out = [];
  allMaterials.forEach(m => { if (m.userData && m.userData.__owner === id) out.push(m); });
  return out;
}

/* ================== OPACIDADE DA MEMBRANA / DISSECÇÃO ============== */
export function applyMembraneOpacity(){
  /* 0 → membrana quase invisível | 1 → membrana bem visível */
  const k = 0.10 + state.membraneOpacity*1.5;
  const diss = 1 - state.dissection;

  membraneMaterials.forEach(m => {
    const base = matState.get(m);
    if (!base) return;
    m.transparent = true;
    m.opacity = Math.max(0, base.opacity * k);
    m.depthWrite = false;
  });

  /* a dissecação progressiva afasta e esmaece as camadas externas */
  if (groups.membraneGroup){
    groups.membraneGroup.scale.setScalar(1 + state.dissection*0.06);
  }
  if (groups.cytoGroup){
    groups.cytoGroup.visible = state.showCytosol && state.dissection < 0.94 && state.cellType !== 'procarionte';
    const base = matState.get(groups.cytoGroup.children[0] && groups.cytoGroup.children[0].material);
    if (base){
      const cm = groups.cytoGroup.children[0].material;
      cm.opacity = Math.max(0, base.opacity * (1 - state.dissection*0.9));
    }
  }
  if (groups.plantGroup && groups.plantGroup.visible){
    const wall = groups.plantGroup.children[0];
    const base = wall && matState.get(wall.material);
    if (base){
      wall.material.opacity = Math.max(0, base.opacity * (1 - state.dissection*0.85) * diss);
    }
  }
}

/* ============================ WIREFRAME ============================ */
export function applyWireframe(){
  allMaterials.forEach(m => {
    if (m.userData && m.userData.__owner === '__selection') return;  /* não afeta halo e anéis */
    if (m.wireframe !== state.wireframe){
      m.wireframe = state.wireframe;
      m.needsUpdate = true;
    }
  });
}

/* ============================ ISOLAMENTO =========================== */
export function applyIsolate(){
  const id = state.selectedId;
  allMaterials.forEach(m => {
    const base = matState.get(m);
    if (!base) return;
    const owner = m.userData ? m.userData.__owner : null;

    if (!state.isolate || !id){
      if (m.userData && m.userData.__dimmed){
        m.opacity = base.opacity;
        m.transparent = base.transparent;
        m.depthWrite = base.depthWrite;
        m.userData.__dimmed = false;
      }
      return;
    }

    const keep = (owner === id) || owner === '__selection';
    if (!keep && owner){
      m.transparent = true;
      m.opacity = Math.max(0.015, base.opacity*0.05);
      m.depthWrite = false;
      m.userData.__dimmed = true;
    } else if (m.userData && m.userData.__dimmed){
      m.opacity = base.opacity;
      m.transparent = base.transparent;
      m.depthWrite = base.depthWrite;
      m.userData.__dimmed = false;
    }
  });
  /* acessórios de animação também escurecem */
  if (state.isolate && id){
    registry.anim.forEach(o => { o.visible = false; });
  } else {
    registry.anim.forEach(o => { o.visible = true; });
  }
}

/* ============================== CORTE ============================== */
export function setSection(on, plane){
  state.section = on;
  /* o plano de corte global é aplicado pelo próprio renderer */
  if (RENDER.renderer){
    RENDER.renderer.clippingPlanes = (on && plane) ? [plane] : [];
  }
}

/* ================== SISTEMA DE ENDOMEMBRANAS (hub) ================= */
export function applyHub(){
  const on = state.hub;
  Object.keys(registry.root).forEach(id => {
    const isHub = HUB_SET.has(id);
    const boost = on && isHub ? 3.0 : 1.0;
    materialsOf(id).forEach(m => {
      const base = matState.get(m);
      if (!base || base.emissiveIntensity === null) return;
      if (m.userData.__selBoost) return;   /* não interfere no destaque de seleção */
      m.emissiveIntensity = base.emissiveIntensity * boost;
    });
  });
}

/* ================== APLICAÇÃO DO TIPO CELULAR ====================== */
export function applyCellTypeVisibility(){
  const type = state.cellType;
  const isProk = type === 'procarionte';
  const isPlant = type === 'vegetal';

  /* visibilidade coerente das camadas eucarióticas */
  if (groups.membraneGroup) groups.membraneGroup.visible = !isProk;
  if (groups.cytoGroup) groups.cytoGroup.visible = !isProk && state.showCytosol;
  if (groups.plantGroup) groups.plantGroup.visible = isPlant;
  if (groups.prokGroup) groups.prokGroup.visible = isProk;
  if (groups.junctionGroup) groups.junctionGroup.visible = false;

  /* remove do picking as estruturas ocultas */
  pickables.forEach(o => {
    const id = o.userData.organelleId;
    o.userData.__typeHidden = false;
    if (isProk && !['membrana','citoplasma','ribossomos','nucleoide','parede','virus'].includes(id)){
      o.userData.__typeHidden = true;
    }
    if (isPlant && id === 'centrossomo') o.userData.__typeHidden = true;
    if (!isPlant && ['parede','cloroplasto','vacuolo'].includes(id)) o.userData.__typeHidden = true;
    if (!isProk && id === 'nucleoide') o.userData.__typeHidden = true;
  });
}

/* ================== VISIBILIDADE GLOBAL DE GRUPOS ================== */
export function applyGroupVisibility(){
  if (groups.cyto2Group) groups.cyto2Group.visible = state.showCitoesqueleto;
  if (registry.molHeads){
    registry.molHeads.forEach(h => { h.visible = state.showMolecular; });
  }
  if (groups.scaleRings) groups.scaleRings.visible = RENDER.level <= 3;
}

/* =============== TRANSIÇÃO SUAVE ENTRE NÍVEIS DE ZOOM ============== */
export function distanceForLevel(lvl){
  return lvl === 1 ? 30 : lvl === 2 ? 18 : lvl === 3 ? 9 : 4.2;
}

/* ============== ESCALA: ajuste do raio efetivo da célula =========== */
export function setCellScale(k){
  RENDER.cellScaleK = k;
  cellRoot.scale.setScalar(k);
  RENDER.cellR = RENDER.baseCellR * k;
}