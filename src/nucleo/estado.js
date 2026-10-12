import * as THREE from 'three';

/* =====================================================================
   PARTE 3 — ESTADO COMPARTILHADO E UTILITÁRIOS
   ===================================================================== */
export const RENDER = { baseCellR:10, level:1, cellR:10, cellScaleK:1, renderer:null };

export const state = {
  mode:'explore', currentModule:'0',
  trilha:'citologia',        /* citologia | biologia | quimica */
  cena:'celula',             /* cena 3D ativa */
  membraneOpacity:0.55, dissection:0, explode:0,
  isolate:false, section:false, wireframe:false, hub:false,
  selectedId:null, hoverId:null,
  showCytosol:true, showMolecular:false, showLabels:true, showCitoesqueleto:true,
  cellType:'animal',
  osmosis:0, o2:0.6, light:0.5, co2:0.5, cycle:0,
  atp:0, atpRunning:false,
  apoptosis:0, virus:null, junctionType:null, quality:'high',
  compareWith:null
};

export const HUB_SET = new Set(['membrana','nucleo','re_rugoso','re_liso','golgi','vesiculas','lisossomos']);
export const CELL_R = 10;
export const NUC_POS = new THREE.Vector3(-1.6, 1.4, 0.6);
export const NUC_R = 3.3;
export const golden = Math.PI * (3 - Math.sqrt(5));
export const dummy = new THREE.Object3D();

export const cellRoot = new THREE.Group();

export const ORGANELLE_NODES = [];
export const ORGANELLE_INDEX = {};
export const membraneMaterials = [];
export const allMaterials = [];
export const pickables = [];
export const matState = new Map();
export const registry = { root:{}, anim:[], molHeads:[], chloroRefs:[], chromatin:[], mitoRefs:[], junctionRefs:[], virus:[] };

export function reg(mat){ allMaterials.push(mat); return mat; }

export function cellNoise(v){ return Math.sin(v.x*0.62)*Math.cos(v.y*0.55)*Math.sin(v.z*0.71); }
export function deformVec(v){ return v.clone().multiplyScalar(1 + cellNoise(v)*0.035); }

export function makeBlobGeometry(radius, detail, noiseAmp){
  const g = new THREE.IcosahedronGeometry(radius, detail);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  const amp = noiseAmp === undefined ? 0.035 : noiseAmp;
  for (let i = 0; i < pos.count; i++){
    v.fromBufferAttribute(pos, i);
    v.multiplyScalar(1 + cellNoise(v)*amp);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export function registerOrganelle(id, group, opts){
  opts = opts || {};
  group.userData.organelleId = id;
  group.traverse(o => {
    if (o.isMesh || o.isInstancedMesh){
      o.userData.organelleId = id;
      if (!o.userData.noPick) pickables.push(o);
    }
  });
  const node = { id, group, base: group.position.clone(), noExplode: !!opts.noExplode };
  ORGANELLE_NODES.push(node);
  if (!ORGANELLE_INDEX[id]) ORGANELLE_INDEX[id] = { id, nodes:[], center:new THREE.Vector3(), radius:2 };
  ORGANELLE_INDEX[id].nodes.push(node);
  if (!registry.root[id]) registry.root[id] = [];
  registry.root[id].push(group);
}

/* Marca uma malha/instância como pertencente a uma estrutura sem criar nó de explosão */
export function tagOrganelle(id, obj){
  obj.userData.organelleId = id;
  if ((obj.isMesh || obj.isInstancedMesh) && !obj.userData.noPick) pickables.push(obj);
  obj.traverse(o => {
    if (o.isMesh || o.isInstancedMesh){
      o.userData.organelleId = id;
      if (!o.userData.noPick && pickables.indexOf(o) === -1) pickables.push(o);
    }
  });
  if (!registry.root[id]) registry.root[id] = [];
  registry.root[id].push(obj);
}

export function computeOrganelleBounds(){
  for (const id in ORGANELLE_INDEX){
    const e = ORGANELLE_INDEX[id];
    const box = new THREE.Box3();
    e.nodes.forEach(n => box.expandByObject(n.group));
    if (box.isEmpty() || !isFinite(box.min.x)) continue;
    box.getCenter(e.center);
    e.radius = Math.max(0.8, box.getSize(new THREE.Vector3()).length()*0.5);
  }
}