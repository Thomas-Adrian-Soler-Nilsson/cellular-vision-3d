import * as THREE from 'three';
import { SCIENCE } from '../dados/citologia.js';
import { state, ORGANELLE_INDEX, allMaterials, cellRoot } from './estado.js';

/* =====================================================================
   PARTE 7 — SISTEMA DE IDENTIFICAÇÃO VISUAL DA SELEÇÃO
   halo pulsante + anéis de mira + etiqueta flutuante + realce emissivo
   ===================================================================== */
export const sel = {
  haloGroup:new THREE.Group(),
  ringGroup:new THREE.Group(),
  currentId:null,
  originalEmissive:new Map(),
  dissolved:new Map(),
  t:0,
  meshScale:1,
  camera:null,
  viewport:null
};

/* estrutura fixada para comparação estrutural */
export const pinned = { group:new THREE.Group(), id:null, mat:null };

export function initSelection(scene, camera, viewportEl){
  sel.camera = camera;
  sel.viewport = viewportEl;
  scene.add(sel.haloGroup);
  scene.add(sel.ringGroup);
  scene.add(pinned.group);
}

export function setPinned(id){
  while (pinned.group.children.length) pinned.group.remove(pinned.group.children[0]);
  pinned.id = null;
  pinned.mat = null;
  if (!id) return;
  const entry = ORGANELLE_INDEX[id];
  const data = SCIENCE[id];
  if (!entry || !data) return;

  pinned.id = id;
  const color = new THREE.Color(data.cor);
  const R = effectiveRadius(id);
  const mat = new THREE.MeshBasicMaterial({
    color, transparent:true, opacity:0.5, side:THREE.DoubleSide,
    depthWrite:false, blending:THREE.AdditiveBlending
  });
  mat.userData.__owner = '__selection';
  allMaterials.push(mat);
  pinned.mat = mat;

  const ring = new THREE.Mesh(new THREE.TorusGeometry(R*1.68, Math.max(0.013, R*0.017), 8, 76), mat);
  ring.position.copy(entry.center);
  ring.rotation.x = Math.PI/2;
  pinned.group.add(ring);

  const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, R*2.9, 6), mat);
  axis.position.copy(entry.center);
  axis.position.y += R*1.45;
  pinned.group.add(axis);
}

function labelEl(){
  return document.getElementById('worldLabel');
}
function labelTextEl(){
  return document.getElementById('worldLabelText');
}

/* raio visual efetivo da estrutura selecionada */
function effectiveRadius(id){
  const entry = ORGANELLE_INDEX[id];
  if (!entry) return 1;
  /* limita o halo para estruturas muito grandes, evitando "bolha" exagerada */
  const r = entry.radius * sel.meshScale;
  return Math.max(0.75, Math.min(r, 4.2));
}

export function clearSelectionVisuals(){
  while (sel.haloGroup.children.length) sel.haloGroup.remove(sel.haloGroup.children[0]);
  while (sel.ringGroup.children.length) sel.ringGroup.remove(sel.ringGroup.children[0]);

  /* descarta os materiais transitórios de destaque para não acumular na lista global */
  for (let i = allMaterials.length - 1; i >= 0; i--){
    const m = allMaterials[i];
    if (m.userData && m.userData.__owner === '__selection') allMaterials.splice(i, 1);
  }

  /* restaura emissividade original */
  sel.originalEmissive.forEach((val, mat) => {
    if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = val;
    if (mat.userData) mat.userData.__selBoost = false;
  });
  sel.originalEmissive.clear();

  /* restaura materiais desvanecidos pelo destaque */
  sel.dissolved.forEach((base, mat) => {
    mat.opacity = base.opacity;
    mat.transparent = base.transparent;
    mat.depthWrite = base.depthWrite;
    if (mat.userData) mat.userData.__dissolved = false;
  });
  sel.dissolved.clear();

  sel.currentId = null;
  const le = labelEl();
  if (le) le.style.opacity = '0';
}

/* desvanece as estruturas vizinhas para destacar a selecionada */
function dissolveContext(id){
  const SOFT = new Set(['membrana','citoplasma','citoesqueleto','ribossomos','re_liso','re_rugoso','vesiculas']);

  allMaterials.forEach(m => {
    const baseOwner = m.userData ? m.userData.__owner : null;
    if (!baseOwner || baseOwner === '__selection') return;

    if (baseOwner === id) return;

    /* aplica desvanecimento apenas no grupo "de contexto" mais volumoso */
    if (!SOFT.has(baseOwner)) return;
    if (sel.dissolved.has(m)) return;

    sel.dissolved.set(m, { opacity:m.opacity, transparent:m.transparent, depthWrite:m.depthWrite });
    m.transparent = true;
    m.opacity = Math.max(0.008, (m.opacity === undefined ? 0.5 : m.opacity) * 0.22);
    m.depthWrite = false;
    if (m.userData) m.userData.__dissolved = true;
  });
}

export function applySelectionVisuals(id){
  clearSelectionVisuals();
  if (!id) return;

  const entry = ORGANELLE_INDEX[id];
  const data = SCIENCE[id];
  if (!entry || !data) return;

  sel.currentId = id;
  const color = new THREE.Color(data.cor);
  const R = effectiveRadius(id);

  /* ---------- halo esférico pulsante ---------- */
  const haloMat = new THREE.MeshBasicMaterial({
    color, transparent:true, opacity:0.14,
    side:THREE.BackSide, depthWrite:false,
    blending:THREE.AdditiveBlending
  });
  haloMat.userData.__owner = '__selection';
  allMaterials.push(haloMat);

  const halo = new THREE.Mesh(new THREE.SphereGeometry(R*1.34, 32, 24), haloMat);
  halo.position.copy(entry.center);
  halo.userData.__selection = true;
  sel.haloGroup.add(halo);

  /* ---------- anéis de mira perpendiculares (giram) ---------- */
  const ringMat = new THREE.MeshBasicMaterial({
    color, transparent:true, opacity:0.5,
    side:THREE.DoubleSide, depthWrite:false,
    blending:THREE.AdditiveBlending
  });
  ringMat.userData.__owner = '__selection';
  allMaterials.push(ringMat);

  const ringR = R*1.46;
  const thickness = Math.max(0.012, R*0.014);
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(ringR, thickness, 8, 84), ringMat);
  const r2 = new THREE.Mesh(new THREE.TorusGeometry(ringR, thickness, 8, 84), ringMat);
  const r3 = new THREE.Mesh(new THREE.TorusGeometry(ringR, thickness, 8, 84), ringMat);
  r1.rotation.x = Math.PI/2;
  r2.rotation.y = Math.PI/2;
  r3.rotation.z = Math.PI/2;

  const rgroup = new THREE.Group();
  rgroup.position.copy(entry.center);
  rgroup.add(r1, r2, r3);
  sel.ringGroup.add(rgroup);
  sel.ringGroup.userData.__rgroup = rgroup;

  /* ---------- realce emissivo nos materiais da estrutura ---------- */
  allMaterials.forEach(m => {
    if (!m.userData || m.userData.__owner !== id) return;
    if (m.emissiveIntensity === undefined) return;
    if (!sel.originalEmissive.has(m)) sel.originalEmissive.set(m, m.emissiveIntensity);
    m.emissiveIntensity = sel.originalEmissive.get(m) * 2.2;
    m.userData.__selBoost = true;
  });

  /* ---------- maior rigor: realce também em quem compartilha a estrutura ---------- */
  cellRoot.traverse(o => {
    if ((o.isMesh || o.isInstancedMesh) && o.userData.organelleId === id && o.material){
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => {
        if (m.emissiveIntensity === undefined) return;
        if (!sel.originalEmissive.has(m)) sel.originalEmissive.set(m, m.emissiveIntensity);
        m.emissiveIntensity = sel.originalEmissive.get(m) * 2.2;
        m.userData.__selBoost = true;
      });
    }
  });

  /* ---------- etiqueta flutuante ---------- */
  const lte = labelTextEl();
  if (lte) lte.textContent = data.nome;
  const le = labelEl();
  if (le) le.style.opacity = '1';

  /* ---------- contexto atenuado (identificação mais fácil) ---------- */
  dissolveContext(id);
}

export function updateSelectionVisuals(dt){
  const id = sel.currentId;
  const le = labelEl();
  if (!id || !sel.camera){
    if (le) le.style.opacity = '0';
    return;
  }
  const entry = ORGANELLE_INDEX[id];
  if (!entry) return;

  sel.t += dt;
  const pulse = 0.5 + 0.5*Math.sin(sel.t*3.0);

  /* halo */
  const halo = sel.haloGroup.children[0];
  if (halo){
    halo.material.opacity = 0.07 + pulse*0.13;
    halo.scale.setScalar(1 + pulse*0.035);
    halo.position.copy(entry.center);
  }

  /* anéis */
  const rg = sel.ringGroup.userData.__rgroup;
  if (rg){
    rg.position.copy(entry.center);
    rg.rotation.y += dt*0.75;
    rg.rotation.x = Math.sin(sel.t*0.45)*0.30;
    rg.children[0].material.opacity = 0.30 + pulse*0.35;
  }

  /* etiqueta ancorada acima da estrutura */
  if (state.showLabels && le){
    const R = effectiveRadius(id);
    const pos = entry.center.clone();
    pos.y += R*1.30;
    const screen = pos.clone().project(sel.camera);
    const w = sel.viewport.clientWidth || 1;
    const h = sel.viewport.clientHeight || 1;
    const x = (screen.x*0.5 + 0.5)*w;
    const y = (-screen.y*0.5 + 0.5)*h;
    const onScreen = screen.z < 1 && screen.z > -1;
    le.style.left = x + 'px';
    le.style.top = y + 'px';
    le.style.opacity = onScreen ? '1' : '0';
  } else if (le){
    le.style.opacity = '0';
  }
}

/* Permite que o sistema de corte reduza o halo (evita bolha atravessando o plano) */
export function setSelectionMeshScale(k){
  sel.meshScale = k;
  if (sel.currentId) applySelectionVisuals(sel.currentId);
}