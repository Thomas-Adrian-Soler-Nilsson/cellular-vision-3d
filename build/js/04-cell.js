import * as THREE from 'three';
import {
  state, RENDER, CELL_R, NUC_POS, NUC_R, golden, dummy, cellRoot,
  membraneMaterials, reg, deformVec, makeBlobGeometry, registerOrganelle,
  tagOrganelle, registry, ORGANELLE_INDEX
} from './03-state.js';

/* =====================================================================
   PARTE 4 — CONSTRUÇÃO DO MODELO CELULAR
   ===================================================================== */
export const groups = {};

const MT_PLACES = [
  { p:[ 4.4, 2.4,-1.2], r:[ 0.40, 0.60, 0.20], s:1.20 },
  { p:[ 2.6,-3.6, 2.4], r:[ 1.20,-0.30, 0.70], s:0.95 },
  { p:[-4.6,-2.2,-2.6], r:[-0.50, 0.90,-0.40], s:1.10 },
  { p:[ 5.4,-1.4, 1.8], r:[ 0.90, 0.20,-0.60], s:0.85 },
  { p:[-2.4, 4.6,-2.0], r:[ 0.20,-0.80, 0.50], s:0.92 },
  { p:[ 0.6,-1.2,-4.8], r:[ 1.40, 0.50, 0.30], s:1.05 },
  { p:[-5.6, 0.2, 1.2], r:[ 0.70, 0.40, 1.00], s:0.88 },
  { p:[ 3.2, 4.4, 0.6], r:[-0.40, 0.60, 0.50], s:0.95 },
  { p:[-3.4,-4.0, 1.4], r:[ 0.60, 0.90,-0.30], s:0.80 },
  { p:[ 4.8, 0.4,-3.6], r:[ 0.30,-0.50, 0.80], s:0.90 }
];

const RER_CENTERS = [
  { pos:[-4.9, 0.6, 1.9], rot:[ 0.20, 0.60,-0.15], R:2.5, h:1.7 },
  { pos:[-4.0,-2.6, 0.4], rot:[-0.50, 0.90, 0.30], R:2.2, h:1.5 },
  { pos:[-2.2, 3.6, 2.6], rot:[ 0.60,-0.40, 0.50], R:2.0, h:1.4 },
  { pos:[ 1.8, 4.2,-1.8], rot:[-0.30, 0.30,-0.60], R:2.1, h:1.5 },
  { pos:[-3.2, 1.0,-3.4], rot:[ 0.80, 0.20, 0.20], R:2.0, h:1.3 }
];

const LYSO_PLACES = [
  [ 2.2,-3.0,-2.4, 0.36],
  [-4.2, 2.9,-1.9, 0.30],
  [ 4.9, 1.5, 2.9, 0.26],
  [-1.4,-4.4,-2.0, 0.33],
  [ 5.6,-3.0, 0.6, 0.28],
  [-3.8,-3.6, 2.4, 0.24]
];

const PEROX_PLACES = [
  [-2.6,-3.2, 2.8, 0.30],
  [ 5.0,-0.4,-2.2, 0.27],
  [-5.4,-1.2, 0.9, 0.29],
  [ 1.2, 4.6, 2.0, 0.25],
  [ 4.0,-4.4,-0.8, 0.23]
];

export let membraneBoundary = null;
export let nucleolusMesh = null;
export let prokCapsule = null;

export function buildCell(){
  buildMembrane();
  buildCytosol();
  buildNucleus();
  buildRoughER();
  buildSmoothER();
  buildGolgi();
  buildMitochondria();
  buildRibosomes();
  buildLysosomes();
  buildPeroxisomes();
  buildVesicles();
  buildCentrosome();
  buildCytoskeleton();
  buildPlantCell();
  buildProkaryote();
  buildJunctions();
  buildScaleRings();
}

/* ----------------------------- MEMBRANA ----------------------------- */
function buildMembrane(){
  const mg = new THREE.Group();
  groups.membraneGroup = mg;
  cellRoot.add(mg);

  const blobGeo = makeBlobGeometry(CELL_R, 4);

  const outerMat = reg(new THREE.MeshPhysicalMaterial({
    color:0x7fd4ff, roughness:0.18, metalness:0.0,
    transparent:true, opacity:0.16, side:THREE.DoubleSide,
    depthWrite:false, clearcoat:1, clearcoatRoughness:0.25,
    emissive:0x0a2b45, emissiveIntensity:0.6
  }));
  const innerMat = reg(new THREE.MeshPhysicalMaterial({
    color:0x4fa8d8, roughness:0.25, metalness:0.0,
    transparent:true, opacity:0.11, side:THREE.DoubleSide,
    depthWrite:false, clearcoat:1
  }));
  membraneMaterials.push(outerMat, innerMat);

  mg.add(new THREE.Mesh(blobGeo, outerMat));
  const innerMesh = new THREE.Mesh(blobGeo, innerMat);
  innerMesh.scale.setScalar(0.972);
  mg.add(innerMesh);

  /* silhueta: reforça a leitura da forma celular */
  membraneBoundary = new THREE.Mesh(
    makeBlobGeometry(CELL_R*1.001, 3, 0.035),
    new THREE.MeshBasicMaterial({ color:0x8fdcff, transparent:true, opacity:0.13, wireframe:true, depthWrite:false })
  );
  mg.add(membraneBoundary);

  /* cabeças de fosfolipídio (detalhe molecular) */
  const headGeo = new THREE.IcosahedronGeometry(0.062, 0);
  const headOuter = reg(new THREE.MeshStandardMaterial({ color:0x9fe4ff, roughness:0.35, transparent:true, opacity:0.5, depthWrite:false }));
  const headInner = reg(new THREE.MeshStandardMaterial({ color:0x4f9fd0, roughness:0.40, transparent:true, opacity:0.4, depthWrite:false }));
  membraneMaterials.push(headOuter, headInner);

  const HEAD_COUNT = 1400;
  const headsOuter = new THREE.InstancedMesh(headGeo, headOuter, HEAD_COUNT);
  const headsInner = new THREE.InstancedMesh(headGeo, headInner, HEAD_COUNT);
  headsOuter.raycast = () => {}; headsInner.raycast = () => {};
  for (let i = 0; i < HEAD_COUNT; i++){
    const y = 1 - (i/(HEAD_COUNT-1))*2;
    const r = Math.sqrt(Math.max(0, 1-y*y));
    const th = golden*i;
    const dir = new THREE.Vector3(Math.cos(th)*r, y, Math.sin(th)*r);
    dummy.position.copy(deformVec(dir.clone().multiplyScalar(CELL_R)));
    dummy.rotation.set(0,0,0); dummy.scale.setScalar(1); dummy.updateMatrix();
    headsOuter.setMatrixAt(i, dummy.matrix);
    dummy.position.copy(deformVec(dir.clone().multiplyScalar(CELL_R*0.972)));
    dummy.updateMatrix(); headsInner.setMatrixAt(i, dummy.matrix);
  }
  headsOuter.instanceMatrix.needsUpdate = true;
  headsInner.instanceMatrix.needsUpdate = true;
  mg.add(headsOuter, headsInner);
  registry.molHeads = [headsOuter, headsInner];

  /* proteínas integrais de membrana */
  const protMat = reg(new THREE.MeshStandardMaterial({ color:0xffb56b, roughness:0.45, metalness:0.15, transparent:true, opacity:0.85 }));
  const proteins = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.11, 0.26, 4, 8), protMat, 64);
  const up = new THREE.Vector3(0,1,0);
  for (let i = 0; i < 64; i++){
    const y = 1 - (i/63)*2;
    const r = Math.sqrt(Math.max(0, 1-y*y));
    const th = golden*i*1.7;
    const dir = new THREE.Vector3(Math.cos(th)*r, y, Math.sin(th)*r).normalize();
    dummy.position.copy(deformVec(dir.clone().multiplyScalar(CELL_R*0.99)));
    dummy.quaternion.setFromUnitVectors(up, dir);
    dummy.scale.setScalar(0.75 + Math.random()*0.7);
    dummy.updateMatrix();
    proteins.setMatrixAt(i, dummy.matrix);
  }
  proteins.instanceMatrix.needsUpdate = true;
  mg.add(proteins);

  registerOrganelle('membrana', mg);
}

/* ------------------------------ CITOSOL ----------------------------- */
function buildCytosol(){
  const cg = new THREE.Group();
  groups.cytoGroup = cg;
  cellRoot.add(cg);
  const cytoMat = reg(new THREE.MeshPhysicalMaterial({
    color:0x2f7fa8, roughness:0.9, transparent:true, opacity:0.055,
    side:THREE.BackSide, depthWrite:false
  }));
  membraneMaterials.push(cytoMat);
  cg.add(new THREE.Mesh(makeBlobGeometry(CELL_R*0.955, 3), cytoMat));
  registerOrganelle('citoplasma', cg);
}

/* ------------------------------- NÚCLEO ----------------------------- */
function buildNucleus(){
  const ng = new THREE.Group();
  groups.nucleusGroup = ng;
  ng.position.copy(NUC_POS);
  cellRoot.add(ng);

  const envOuterMat = reg(new THREE.MeshPhysicalMaterial({
    color:0x9b7bff, roughness:0.22, metalness:0.05,
    transparent:true, opacity:0.20, side:THREE.DoubleSide,
    depthWrite:false, clearcoat:1, emissive:0x1a0f3d, emissiveIntensity:0.6
  }));
  const envInnerMat = reg(new THREE.MeshPhysicalMaterial({
    color:0x7a5ce0, roughness:0.30, metalness:0.05,
    transparent:true, opacity:0.16, side:THREE.DoubleSide,
    depthWrite:false, clearcoat:1
  }));
  const nucSphere = new THREE.SphereGeometry(1, 40, 28);
  const envOuter = new THREE.Mesh(nucSphere, envOuterMat); envOuter.scale.setScalar(NUC_R);
  const envInner = new THREE.Mesh(nucSphere, envInnerMat); envInner.scale.setScalar(NUC_R*0.94);
  ng.add(envOuter, envInner);

  /* poros do envelope nuclear (anáforas de nucleoporinas) */
  const poreMat = reg(new THREE.MeshStandardMaterial({ color:0xd8c8ff, roughness:0.4, metalness:0.2, emissive:0x3a2a7a, emissiveIntensity:0.9 }));
  const PORE_COUNT = 76;
  const pores = new THREE.InstancedMesh(new THREE.TorusGeometry(0.135, 0.05, 6, 14), poreMat, PORE_COUNT);
  for (let i = 0; i < PORE_COUNT; i++){
    const y = 1 - (i/(PORE_COUNT-1))*2;
    const r = Math.sqrt(Math.max(0, 1-y*y));
    const th = golden*i*1.31;
    const dir = new THREE.Vector3(Math.cos(th)*r, y, Math.sin(th)*r).normalize();
    dummy.position.copy(dir.clone().multiplyScalar(NUC_R));
    dummy.lookAt(0,0,0); dummy.scale.setScalar(1); dummy.updateMatrix();
    pores.setMatrixAt(i, dummy.matrix);
  }
  pores.instanceMatrix.needsUpdate = true;
  ng.add(pores);

  /* cromatina: filamentos de DNA + histonas */
  const chromatinGroup = new THREE.Group();
  groups.chromatinGroup = chromatinGroup;
  ng.add(chromatinGroup);
  const cMat1 = reg(new THREE.MeshStandardMaterial({ color:0xb07bff, roughness:0.60, metalness:0.05, emissive:0x2a1050, emissiveIntensity:0.75 }));
  const cMat2 = reg(new THREE.MeshStandardMaterial({ color:0x8a5cf0, roughness:0.65, metalness:0.05, emissive:0x200a40, emissiveIntensity:0.65 }));
  for (let i = 0; i < 26; i++){
    const pts = [];
    const baseR = 0.9 + Math.random()*1.6;
    const a0 = Math.random()*Math.PI*2;
    for (let j = 0; j < 7; j++){
      const t = j/6;
      const a = a0 + t*(1.2 + Math.random()*2.4);
      const rr = baseR*(0.75 + Math.random()*0.5)*(1 - t*0.15);
      pts.push(new THREE.Vector3(
        Math.cos(a)*rr*(0.8 + Math.random()*0.4),
        (Math.random()-0.5)*NUC_R*1.35*(0.4 + Math.random()*0.7),
        Math.sin(a)*rr*(0.8 + Math.random()*0.4)
      ));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const m = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 34, 0.045 + Math.random()*0.04, 6, false),
      i % 2 ? cMat1 : cMat2
    );
    m.userData.__pts = pts.map(p => p.clone());
    chromatinGroup.add(m);
  }
  registry.chromatin = chromatinGroup.children.slice();

  /* nucléolo */
  const nucleolusGeo = new THREE.IcosahedronGeometry(0.95, 3);
  {
    const pos = nucleolusGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++){
      v.fromBufferAttribute(pos, i);
      v.multiplyScalar(1 + (Math.sin(v.x*3.1)*Math.cos(v.y*2.7)*Math.sin(v.z*2.3))*0.14);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    nucleolusGeo.computeVertexNormals();
  }
  const nucleolusMat = reg(new THREE.MeshStandardMaterial({ color:0xff9ad5, roughness:0.55, metalness:0.05, emissive:0x661a44, emissiveIntensity:0.85 }));
  nucleolusMesh = new THREE.Mesh(nucleolusGeo, nucleolusMat);
  nucleolusMesh.position.set(0.85, -0.55, 0.45);
  nucleolusMesh.userData.__base = nucleolusMesh.position.clone();
  ng.add(nucleolusMesh);

  registerOrganelle('nucleo', ng);
}

/* --------------------------- RE RUGOSO + pontes ---------------------- */
function buildRoughER(){
  /* pontes visíveis de continuidade envelope nuclear ↔ RE rugoso */
  const bg = new THREE.Group();
  groups.bridgeGroup = bg;
  bg.position.copy(NUC_POS);
  cellRoot.add(bg);
  const bridgeMat = reg(new THREE.MeshStandardMaterial({
    color:0x4fd1c5, roughness:0.48, metalness:0.05, side:THREE.DoubleSide,
    transparent:true, opacity:0.7, emissive:0x0a3b38, emissiveIntensity:0.5
  }));
  for (let i = 0; i < 5; i++){
    const a = (i/5)*Math.PI*2;
    const start = new THREE.Vector3(Math.cos(a), (i-2)*0.5, Math.sin(a)).normalize().multiplyScalar(NUC_R*0.98);
    const end = start.clone().multiplyScalar(1.45).add(new THREE.Vector3(
      (Math.random()-0.5)*1.2, (Math.random()-0.5)*1.2, (Math.random()-0.5)*1.2
    ));
    const mid = start.clone().lerp(end, 0.5);
    bg.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([start, mid, end]), 22, 0.14, 6, false),
      bridgeMat
    ));
  }
  registerOrganelle('re_rugoso', bg, { noExplode:true });

  const all = new THREE.Group();
  groups.rerGroup = all;
  cellRoot.add(all);
  const rerMat = reg(new THREE.MeshStandardMaterial({
    color:0x4fd1c5, roughness:0.48, metalness:0.05, side:THREE.DoubleSide,
    transparent:true, opacity:0.78, emissive:0x0a3b38, emissiveIntensity:0.55
  }));
  const riboMat = reg(new THREE.MeshStandardMaterial({ color:0xeef7ff, roughness:0.45, metalness:0.0, emissive:0x335577, emissiveIntensity:0.4 }));

  RER_CENTERS.forEach((c, ci) => {
    const g = new THREE.Group();
    g.position.set(c.pos[0], c.pos[1], c.pos[2]);
    g.rotation.set(c.rot[0], c.rot[1], c.rot[2]);
    all.add(g);
    const nSheets = 3 + (ci % 2);
    for (let i = 0; i < nSheets; i++){
      const start = i*1.05 + 0.15;
      const span = 1.15;
      const rad = c.R - i*0.16;
      const hh = c.h*(1 - i*0.12);
      const sheet = new THREE.Mesh(
        new THREE.CylinderGeometry(rad, rad, hh, 34, 1, true, start, span),
        rerMat
      );
      sheet.position.y = i*0.30 - 0.3;
      g.add(sheet);

      const nR = 18;
      const inst = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.085, 0), riboMat, nR*2);
      let k = 0;
      for (let j = 0; j < nR; j++){
        const a = start + Math.random()*span;
        const y = (Math.random()-0.5)*hh*0.92;
        for (const side of [1, -1]){
          dummy.position.set(Math.cos(a)*rad + side*0.07, y + i*0.30 - 0.3, Math.sin(a)*rad);
          dummy.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3);
          dummy.scale.setScalar(0.85 + Math.random()*0.5);
          dummy.updateMatrix();
          inst.setMatrixAt(k++, dummy.matrix);
        }
      }
      inst.instanceMatrix.needsUpdate = true;
      g.add(inst);
    }
    registerOrganelle('re_rugoso', g);
  });
}

/* ------------------------------ RE LISO ----------------------------- */
function buildSmoothER(){
  const all = new THREE.Group();
  groups.relGroup = all;
  cellRoot.add(all);
  const mat = reg(new THREE.MeshStandardMaterial({
    color:0x63e6be, roughness:0.40, metalness:0.08,
    emissive:0x0d4438, emissiveIntensity:0.6
  }));

  function network(center, count, spread, tubeR){
    for (let i = 0; i < count; i++){
      const pts = [];
      const dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
      const cur = center.clone().add(dir.clone().multiplyScalar(-spread*(0.4 + Math.random()*0.6)));
      for (let j = 0; j < 5; j++){
        pts.push(cur.clone());
        cur.add(new THREE.Vector3(
          (Math.random()-0.5)*spread*0.75,
          (Math.random()-0.5)*spread*0.75,
          (Math.random()-0.5)*spread*0.75
        ));
      }
      pts.forEach(p => { if (p.length() > 8.4) p.setLength(8.4); });
      all.add(new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 34, tubeR, 6, false), mat
      ));
    }
  }
  network(new THREE.Vector3( 3.4, 3.2, 2.2), 7, 1.6, 0.075);
  network(new THREE.Vector3(-0.6,-4.0, 1.6), 6, 1.4, 0.075);
  network(new THREE.Vector3(-5.2, 1.8,-1.6), 6, 1.4, 0.070);

  registerOrganelle('re_liso', all, { noExplode:true });
}

/* --------------------------- COMPLEXO DE GOLGI ---------------------- */
function buildGolgi(){
  const all = new THREE.Group();
  groups.golgiGroup = all;
  cellRoot.add(all);

  const mats = [
    reg(new THREE.MeshStandardMaterial({ color:0xffd166, roughness:0.40, metalness:0.08, side:THREE.DoubleSide, transparent:true, opacity:0.90, emissive:0x4a3405, emissiveIntensity:0.55 })),
    reg(new THREE.MeshStandardMaterial({ color:0xffc04d, roughness:0.42, metalness:0.08, side:THREE.DoubleSide, transparent:true, opacity:0.88, emissive:0x3f2c04, emissiveIntensity:0.55 })),
    reg(new THREE.MeshStandardMaterial({ color:0xffab33, roughness:0.45, metalness:0.08, side:THREE.DoubleSide, transparent:true, opacity:0.86, emissive:0x332200, emissiveIntensity:0.55 }))
  ];
  const vMat = reg(new THREE.MeshStandardMaterial({ color:0xffe066, roughness:0.35, metalness:0.10, emissive:0x4a3a05, emissiveIntensity:0.7, transparent:true, opacity:0.95 }));

  function stack(scale){
    const g = new THREE.Group();
    const N = 6;
    for (let i = 0; i < N; i++){
      const t = i/(N-1);
      const rad = (1.05 - t*0.34)*scale;
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(rad, rad, 0.085*scale, 30, 1, false),
        mats[i % 3]
      );
      m.position.y = (0.5 - t)*1.15*scale;
      m.rotation.y = (Math.random()-0.5)*0.1;
      m.scale.set(1, 1, 0.82);
      g.add(m);
    }
    for (let i = 0; i < 12; i++){
      const s = (0.11 + Math.random()*0.08)*scale;
      const v = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), vMat);
      const a = Math.random()*Math.PI*2;
      const rr = (1.0 + Math.random()*0.9)*scale;
      v.position.set(Math.cos(a)*rr, (Math.random()-0.5)*1.7*scale, Math.sin(a)*rr*0.8);
      g.add(v);
    }
    return g;
  }

  const a = stack(1.0); a.position.set( 3.6,-2.0, 1.4); a.rotation.set( 0.35, 0.7, 0.2); all.add(a); registerOrganelle('golgi', a);
  const b = stack(0.7); b.position.set( 2.2,-3.4,-1.6); b.rotation.set(-0.40,-0.5, 0.6); all.add(b); registerOrganelle('golgi', b);
  const c = stack(0.6); c.position.set( 4.4, 0.4, 2.4); c.rotation.set( 0.80, 1.2,-0.3); all.add(c); registerOrganelle('golgi', c);
}

/* ---------------------------- MITOCÔNDRIAS -------------------------- */
function buildMitochondria(){
  const all = new THREE.Group();
  groups.mitoGroup = all;
  cellRoot.add(all);

  function makeMito(len, rad){
    const g = new THREE.Group();
    const oMat = reg(new THREE.MeshStandardMaterial({ color:0xff8a5c, roughness:0.42, metalness:0.06, transparent:true, opacity:0.42, side:THREE.DoubleSide, depthWrite:false }));
    const iMat = reg(new THREE.MeshStandardMaterial({ color:0xffb08a, roughness:0.50, metalness:0.04, transparent:true, opacity:0.32, side:THREE.DoubleSide, depthWrite:false }));
    const cMat = reg(new THREE.MeshStandardMaterial({ color:0xffd9a0, roughness:0.42, metalness:0.10, side:THREE.DoubleSide, emissive:0x552200, emissiveIntensity:0.55 }));
    const mMat = reg(new THREE.MeshStandardMaterial({ color:0xff9a6a, roughness:0.75, transparent:true, opacity:0.16, depthWrite:false }));
    const dMat = reg(new THREE.MeshStandardMaterial({ color:0xfff2b0, roughness:0.40, metalness:0.10, emissive:0x664400, emissiveIntensity:0.8 }));

    const sph = new THREE.SphereGeometry(1, 32, 24);
    const outer = new THREE.Mesh(sph, oMat);  outer.scale.set(len, rad, rad);
    const inner = new THREE.Mesh(sph, iMat);  inner.scale.set(len*0.93, rad*0.90, rad*0.90);
    const matrix = new THREE.Mesh(sph, mMat); matrix.scale.set(len*0.84, rad*0.78, rad*0.78);
    g.add(outer, inner, matrix);

    /* cristas mitocondriais */
    const NC = 10 + Math.floor(Math.random()*4);
    for (let i = 0; i < NC; i++){
      const t = (i + 0.5)/NC;
      const x = (t*2 - 1)*len*0.80;
      const rel = 1 - Math.pow(x/(len*0.96), 2);
      const rr = rad*0.82*Math.sqrt(Math.max(0.06, rel));
      const torus = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.036, 6, 26), cMat);
      torus.rotation.y = Math.PI/2;
      torus.rotation.z = (Math.random()-0.5)*0.2;
      torus.position.x = x;
      torus.scale.x = 0.40;
      g.add(torus);
    }

    /* DNA mitocondrial circular na matriz */
    const dna = new THREE.Mesh(new THREE.TorusGeometry(rad*0.26, 0.021, 6, 16), dMat);
    dna.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    g.add(dna);

    g.userData.__mitoMats = [oMat, iMat, cMat, mMat];
    return g;
  }

  MT_PLACES.forEach(mp => {
    const m = makeMito(1.15*mp.s, 0.46*mp.s);
    m.position.set(mp.p[0], mp.p[1], mp.p[2]);
    m.rotation.set(mp.r[0], mp.r[1], mp.r[2]);
    all.add(m);
    registry.mitoRefs.push(m);
    registerOrganelle('mitocondria', m);
  });
}

/* ----------------------------- RIBOSSOMOS --------------------------- */
function buildRibosomes(){
  const all = new THREE.Group();
  groups.riboGroup = all;
  cellRoot.add(all);

  const mat = reg(new THREE.MeshStandardMaterial({ color:0xdfeaf5, roughness:0.45, metalness:0.0, emissive:0x2a3f55, emissiveIntensity:0.45 }));
  const COUNT = 360;
  const inst = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.095, 0), mat, COUNT);
  let k = 0, guard = 0;
  while (k < COUNT && guard < COUNT*40){
    guard++;
    const u = Math.random()*2 - 1;
    const th = Math.random()*Math.PI*2;
    const r = Math.cbrt(Math.random())*8.4;
    const s = Math.sqrt(1 - u*u);
    const p = new THREE.Vector3(Math.cos(th)*s, u, Math.sin(th)*s).multiplyScalar(r);
    if (p.distanceTo(NUC_POS) < NUC_R + 0.35) continue;
    dummy.position.copy(p);
    dummy.rotation.set(Math.random()*6, Math.random()*6, Math.random()*6);
    dummy.scale.setScalar(0.8 + Math.random()*0.6);
    dummy.updateMatrix();
    inst.setMatrixAt(k++, dummy.matrix);
  }
  for (; k < COUNT; k++){
    dummy.position.set(0,0,0); dummy.scale.setScalar(0); dummy.updateMatrix();
    inst.setMatrixAt(k, dummy.matrix);
  }
  inst.instanceMatrix.needsUpdate = true;
  all.add(inst);
  registerOrganelle('ribossomos', all, { noExplode:true });
}

/* ----------------------------- LISOSSOMOS --------------------------- */
function buildLysosomes(){
  const all = new THREE.Group();
  groups.lysoGroup = all;
  cellRoot.add(all);

  const mats = [
    reg(new THREE.MeshStandardMaterial({ color:0xff6b9d, roughness:0.35, metalness:0.08, transparent:true, opacity:0.86, emissive:0x4a0d2a, emissiveIntensity:0.65 })),
    reg(new THREE.MeshStandardMaterial({ color:0xff85b0, roughness:0.38, metalness:0.08, transparent:true, opacity:0.86, emissive:0x40081f, emissiveIntensity:0.65 })),
    reg(new THREE.MeshStandardMaterial({ color:0xff5c8a, roughness:0.42, metalness:0.08, transparent:true, opacity:0.86, emissive:0x40081f, emissiveIntensity:0.65 }))
  ];
  const innerMat = reg(new THREE.MeshStandardMaterial({ color:0xffd0e2, roughness:0.50, metalness:0.10, emissive:0x552233, emissiveIntensity:0.55 }));

  LYSO_PLACES.forEach((p, i) => {
    const g = new THREE.Group();
    g.position.set(p[0], p[1], p[2]);
    const r = p[3];

    /* forma levemente deformada: cada lisossomo é único */
    const shell = new THREE.SphereGeometry(r, 22, 16);
    const pos = shell.attributes.position;
    const v = new THREE.Vector3();
    const seed = i*1.7;
    for (let j = 0; j < pos.count; j++){
      v.fromBufferAttribute(pos, j);
      v.multiplyScalar(1 + Math.sin(v.x*4 + seed)*Math.cos(v.y*3.5)*Math.sin(v.z*4.2)*0.09);
      pos.setXYZ(j, v.x, v.y, v.z);
    }
    shell.computeVertexNormals();
    g.add(new THREE.Mesh(shell, mats[i % 3]));

    for (let j = 0; j < 6; j++){
      const gr = new THREE.Mesh(new THREE.IcosahedronGeometry(r*0.22, 1), innerMat);
      const a = Math.random()*Math.PI*2;
      const b = Math.random()*Math.PI - Math.PI/2;
      const rr = r*0.5*Math.random();
      gr.position.set(Math.cos(a)*Math.cos(b)*rr, Math.sin(b)*rr, Math.sin(a)*Math.cos(b)*rr);
      g.add(gr);
    }
    all.add(g);
    registerOrganelle('lisossomos', g);
  });
}

/* ---------------------------- PEROXISSOMOS -------------------------- */
function buildPeroxisomes(){
  const all = new THREE.Group();
  groups.peroxGroup = all;
  cellRoot.add(all);
  const mat = reg(new THREE.MeshStandardMaterial({ color:0x8ce99a, roughness:0.40, metalness:0.08, transparent:true, opacity:0.74, emissive:0x0e3a18, emissiveIntensity:0.65 }));
  const coreMat = reg(new THREE.MeshStandardMaterial({ color:0xd6ffe0, roughness:0.25, metalness:0.30, emissive:0x225533, emissiveIntensity:0.75 }));

  PEROX_PLACES.forEach(p => {
    const g = new THREE.Group();
    g.position.set(p[0], p[1], p[2]);
    const r = p[3];
    g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat));
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(r*0.55, 1), coreMat);
    core.rotation.set(Math.random(), Math.random(), Math.random());
    g.add(core);
    all.add(g);
    registerOrganelle('peroxissomos', g);
  });
}

/* ------------------------------ VESÍCULAS --------------------------- */
function buildVesicles(){
  const all = new THREE.Group();
  groups.vesGroup = all;
  cellRoot.add(all);
  const mat = reg(new THREE.MeshStandardMaterial({ color:0xffe066, roughness:0.30, metalness:0.10, transparent:true, opacity:0.92, emissive:0x4a3a00, emissiveIntensity:0.65 }));

  for (let i = 0; i < 28; i++){
    const s = 0.10 + Math.random()*0.11;
    const v = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), mat);
    const u = Math.random()*2 - 1;
    const th = Math.random()*Math.PI*2;
    const r = 2.5 + Math.random()*5.5;
    const sq = Math.sqrt(1 - u*u);
    v.position.set(Math.cos(th)*sq*r, u*r, Math.sin(th)*sq*r);
    all.add(v);
  }
  registerOrganelle('vesiculas', all, { noExplode:true });
}

/* --------------------- CENTROSSOMO E CENTRÍOLOS --------------------- */
function buildCentrosome(){
  const g = new THREE.Group();
  groups.centGroup = g;
  g.position.set(-3.6,-1.6, 2.6);
  cellRoot.add(g);

  const mat = reg(new THREE.MeshStandardMaterial({ color:0xd0bfff, roughness:0.35, metalness:0.35, emissive:0x2a1f55, emissiveIntensity:0.7 }));

  function centriole(){
    const c = new THREE.Group();
    const inst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.028, 0.028, 0.46, 6), mat, 27);
    let k = 0;
    for (let i = 0; i < 9; i++){
      const a = (i/9)*Math.PI*2;
      for (let j = 0; j < 3; j++){
        const rr = 0.095 + j*0.035;
        dummy.position.set(Math.cos(a)*rr, 0, Math.sin(a)*rr);
        dummy.rotation.set(0, -a, 0); dummy.scale.setScalar(1); dummy.updateMatrix();
        inst.setMatrixAt(k++, dummy.matrix);
      }
    }
    inst.instanceMatrix.needsUpdate = true;
    c.add(inst);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 5, 20), mat);
    ring.rotation.x = Math.PI/2; ring.position.y = 0.22;
    c.add(ring);
    return c;
  }

  const c1 = centriole(); c1.position.set(-0.16, 0, 0);
  const c2 = centriole(); c2.position.set( 0.16, 0, 0); c2.rotation.z = Math.PI/2;
  g.add(c1, c2);
  registerOrganelle('centrossomo', g);
}

/* ---------------------------- CITOESQUELETO ------------------------- */
function buildCytoskeleton(){
  const all = new THREE.Group();
  groups.cyto2Group = all;
  cellRoot.add(all);

  const mtMat = reg(new THREE.MeshStandardMaterial({ color:0x7ea8ff, roughness:0.42, metalness:0.15, transparent:true, opacity:0.72, emissive:0x142a55, emissiveIntensity:0.65 }));
  const actMat = reg(new THREE.MeshStandardMaterial({ color:0xff9f7a, roughness:0.50, metalness:0.10, transparent:true, opacity:0.62, emissive:0x4a1a0a, emissiveIntensity:0.6 }));
  const ifMat = reg(new THREE.MeshStandardMaterial({ color:0xa0a8c0, roughness:0.65, metalness:0.10, transparent:true, opacity:0.45 }));

  const CENT = groups.centGroup.position.clone();

  /* microtúbulos irradiando do centrossomo */
  for (let i = 0; i < 18; i++){
    const dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
    const end = CENT.clone().add(dir.multiplyScalar(6.0 + Math.random()*2.0));
    if (end.length() > 8.6) end.setLength(8.6);
    const mid = CENT.clone().lerp(end, 0.5).add(new THREE.Vector3(
      (Math.random()-0.5)*0.7, (Math.random()-0.5)*0.7, (Math.random()-0.5)*0.7
    ));
    all.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([CENT.clone(), mid, end]), 24, 0.042, 6, false), mtMat
    ));
  }

  /* filamentos de actina (córtex) */
  for (let i = 0; i < 28; i++){
    const pts = [];
    const u = Math.random()*2 - 1;
    const th = Math.random()*Math.PI*2;
    const sq = Math.sqrt(1 - u*u);
    const base = new THREE.Vector3(Math.cos(th)*sq, u, Math.sin(th)*sq).multiplyScalar(8.0 + Math.random()*0.8);
    const tan = new THREE.Vector3(-Math.sin(th), 0, Math.cos(th)).normalize();
    const cur = base.clone();
    for (let j = 0; j < 5; j++){
      pts.push(cur.clone());
      cur.add(tan.clone().multiplyScalar(0.5 + Math.random()*0.5));
      cur.add(new THREE.Vector3((Math.random()-0.5)*0.4, (Math.random()-0.5)*0.4, (Math.random()-0.5)*0.4));
      if (cur.length() > 8.9) cur.setLength(8.9);
    }
    all.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 26, 0.022, 5, false), actMat
    ));
  }

  /* filamentos intermediários */
  for (let i = 0; i < 16; i++){
    const dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
    const cur = dir.clone().multiplyScalar(-6.5);
    const pts = [cur.clone()];
    const step = dir.clone().multiplyScalar(1.4);
    for (let j = 0; j < 9; j++){
      cur.add(step);
      cur.add(new THREE.Vector3((Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8));
      if (cur.length() > 8.5) cur.setLength(8.5);
      pts.push(cur.clone());
    }
    all.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.026, 5, false), ifMat
    ));
  }

  registerOrganelle('citoesqueleto', all, { noExplode:true });
}

/* ------------------ CÉLULA VEGETAL: parede, cloroplastos, vacúolo --- */
function buildPlantCell(){
  const pg = new THREE.Group();
  groups.plantGroup = pg;
  pg.visible = false;
  cellRoot.add(pg);

  /* parede celular de celulose */
  const wallMat = reg(new THREE.MeshPhysicalMaterial({
    color:0xa8d8a0, roughness:0.55, transparent:true, opacity:0.30,
    side:THREE.DoubleSide, depthWrite:false, clearcoat:0.4
  }));
  const wall = new THREE.Mesh(makeBlobGeometry(CELL_R*1.09, 3), wallMat);
  wall.userData.noPick = true;
  pg.add(wall);
  tagOrganelle('parede', wall);

  /* malha da parede (fibrilas de celulose) — leitura estrutural */
  const fibrilMat = reg(new THREE.MeshBasicMaterial({ color:0x9fd48f, transparent:true, opacity:0.16, wireframe:true, depthWrite:false }));
  const fibril = new THREE.Mesh(makeBlobGeometry(CELL_R*1.075, 3), fibrilMat);
  fibril.userData.noPick = true;
  pg.add(fibril);
  tagOrganelle('parede', fibril);

  /* cloroplastos */
  const chloroOuter = reg(new THREE.MeshStandardMaterial({ color:0x4caf50, roughness:0.40, transparent:true, opacity:0.85, emissive:0x0a3d10, emissiveIntensity:0.6 }));
  const thylakoidMat = reg(new THREE.MeshStandardMaterial({ color:0x9ccc65, roughness:0.50, emissive:0x2a5a1a, emissiveIntensity:0.9 }));
  const stromaMat = reg(new THREE.MeshStandardMaterial({ color:0x2e7d32, roughness:0.6, transparent:true, opacity:0.30, depthWrite:false }));

  const PLACES = [
    [ 5.8, 2.0, 1.2], [-5.2, 3.2,-1.8], [ 4.4,-3.6, 2.6],
    [-4.8,-2.4, 3.0], [ 1.2, 5.2, 1.8], [-1.6,-5.4,-1.6]
  ];
  PLACES.forEach(p => {
    const g = new THREE.Group();
    g.position.set(p[0], p[1], p[2]);
    g.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3);

    const outer = new THREE.Mesh(new THREE.SphereGeometry(0.85, 22, 16), chloroOuter);
    outer.scale.set(1.5, 0.7, 0.9);
    g.add(outer);

    const stroma = new THREE.Mesh(new THREE.SphereGeometry(0.80, 18, 12), stromaMat);
    stroma.scale.set(1.5, 0.7, 0.9);
    g.add(stroma);

    /* grana: pilhas de tilacoides */
    for (let s = 0; s < 4; s++){
      const granum = new THREE.Group();
      granum.position.x = (s - 1.5)*0.48;
      for (let i = 0; i < 5; i++){
        const t = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.035, 14), thylakoidMat);
        t.position.y = (i - 2)*0.075;
        granum.add(t);
      }
      granum.rotation.z = Math.PI/2;
      g.add(granum);
    }

    g.userData.__chloroMats = [chloroOuter, thylakoidMat];
    pg.add(g);
    registry.chloroRefs.push(g);
    registerOrganelle('cloroplasto', g);
  });

  /* vacúolo central */
  const vacMat = reg(new THREE.MeshPhysicalMaterial({
    color:0xbbe8d0, roughness:0.15, metalness:0.0, transparent:true, opacity:0.14,
    clearcoat:1, clearcoatRoughness:0.08, depthWrite:false, side:THREE.DoubleSide
  }));
  const vac = new THREE.Mesh(makeBlobGeometry(4.7, 3), vacMat);
  vac.position.set(0.9, -0.5, -0.3);
  vac.userData.__base = vac.position.clone();
  pg.add(vac);
  registerOrganelle('vacuolo', vac);
}

/* ------------------ PROCARIONTE: cápsula + nucleoide --------------- */
function buildProkaryote(){
  const pg = new THREE.Group();
  groups.prokGroup = pg;
  pg.visible = false;
  cellRoot.add(pg);

  const capMat = reg(new THREE.MeshPhysicalMaterial({
    color:0x9ad3d8, roughness:0.30, transparent:true, opacity:0.30,
    clearcoat:1, side:THREE.DoubleSide, depthWrite:false
  }));
  prokCapsule = new THREE.Mesh(new THREE.CapsuleGeometry(3.2, 4.6, 12, 32), capMat);
  prokCapsule.rotation.z = Math.PI/2;
  pg.add(prokCapsule);
  tagOrganelle('membrana', prokCapsule);

  const wallMat = reg(new THREE.MeshPhysicalMaterial({
    color:0xb8d8c0, roughness:0.60, transparent:true, opacity:0.20,
    side:THREE.DoubleSide, depthWrite:false
  }));
  const wall = new THREE.Mesh(new THREE.CapsuleGeometry(3.42, 4.6, 12, 32), wallMat);
  wall.rotation.z = Math.PI/2;
  wall.raycast = () => {};
  pg.add(wall);
  tagOrganelle('parede', wall);

  /* nucleoide: DNA circular superenrolado */
  const nMat = reg(new THREE.MeshStandardMaterial({ color:0xffb56b, roughness:0.35, metalness:0.05, emissive:0x6a3a05, emissiveIntensity:1.0 }));
  const pts = [];
  for (let i = 0; i < 26; i++){
    const t = (i/25)*Math.PI*6;
    pts.push(new THREE.Vector3(
      Math.cos(t)*1.4 + Math.sin(t*0.7)*0.55,
      Math.sin(t*0.9)*0.85 + Math.cos(t*0.4)*0.45,
      Math.sin(t)*0.95
    ));
  }
  const nucleoid = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.115, 6, true),
    nMat
  );
  pg.add(nucleoid);
  registerOrganelle('nucleoide', nucleoid);

  /* ribossomos 70S */
  const rMat = reg(new THREE.MeshStandardMaterial({ color:0xeaf2fa, roughness:0.50, metalness:0.0, emissive:0x2a3f55, emissiveIntensity:0.5 }));
  const COUNT = 190;
  const inst = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.14, 0), rMat, COUNT);
  let k = 0, guard = 0;
  while (k < COUNT && guard < COUNT*60){
    guard++;
    const p = new THREE.Vector3(
      (Math.random()-0.5)*9.0,
      (Math.random()-0.5)*5.6,
      (Math.random()-0.5)*5.6
    );
    if (p.length() > 5.6) continue;
    dummy.position.copy(p);
    dummy.rotation.set(Math.random()*6, Math.random()*6, Math.random()*6);
    dummy.scale.setScalar(0.7 + Math.random()*0.5);
    dummy.updateMatrix();
    inst.setMatrixAt(k++, dummy.matrix);
  }
  for (; k < COUNT; k++){
    dummy.position.set(0,0,0); dummy.scale.setScalar(0); dummy.updateMatrix();
    inst.setMatrixAt(k, dummy.matrix);
  }
  inst.instanceMatrix.needsUpdate = true;
  pg.add(inst);
  registerOrganelle('ribossomos', inst, { noExplode:true });
}

/* ------------- JUNÇÕES CELULARES (reveladas pelo Módulo 6) ---------- */
function buildJunctions(){
  const jg = new THREE.Group();
  groups.junctionGroup = jg;
  jg.position.copy(NUC_POS).multiplyScalar(0.15);
  jg.visible = false;
  cellRoot.add(jg);

  const desmoMat = reg(new THREE.MeshStandardMaterial({ color:0x66e0ff, roughness:0.35, metalness:0.20, emissive:0x0a4a5c, emissiveIntensity:0.9 }));
  const gapMat = reg(new THREE.MeshStandardMaterial({ color:0x7ef0c8, roughness:0.25, metalness:0.25, emissive:0x14604a, emissiveIntensity:1.1 }));
  const tightMat = reg(new THREE.MeshStandardMaterial({ color:0xffcc66, roughness:0.40, metalness:0.15, emissive:0x5c3d05, emissiveIntensity:0.9 }));

  const SPECS = [
    { t:'desmossomo', mat:desmoMat, a:[ 1.6, 8.6, 2.2], b:[-1.8, 8.10, 2.6] },
    { t:'gap',        mat:gapMat,   a:[-3.0,-8.4, 1.6], b:[-3.4,-8.9, 2.0] },
    { t:'tight',      mat:tightMat, a:[ 8.4, 1.2,-2.4], b:[ 8.9, 1.5,-2.8] }
  ];

  SPECS.forEach(sp => {
    const A = new THREE.Vector3(sp.a[0], sp.a[1]/8.6*CELL_R*0.96, sp.a[2]/8.6*CELL_R*0.96);
    const B = new THREE.Vector3(sp.b[0], sp.b[1]/8.6*CELL_R*1.06, sp.b[2]/8.6*CELL_R*1.06);
    const g = new THREE.Group();
    g.userData.__junctionType = sp.t;

    /* as duas membranas justapostas */
    [A, B].forEach(P => {
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.85, 24), sp.mat);
      disc.lookAt(P.clone().normalize());
      disc.position.copy(P);
      g.add(disc);
    });

    if (sp.t === 'desmossomo'){
      for (let i = 0; i < 9; i++){
        const a = (i/9)*Math.PI*2;
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 6), sp.mat);
        rod.position.copy(A).lerp(B, 0.5).add(new THREE.Vector3(Math.cos(a)*0.45, 0.45, Math.sin(a)*0.45));
        rod.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), B.clone().sub(A).normalize());
        g.add(rod);
      }
    } else if (sp.t === 'gap'){
      for (let i = 0; i < 7; i++){
        const a = (i/7)*Math.PI*2;
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8), sp.mat);
        tube.position.copy(A).lerp(B, 0.5).add(new THREE.Vector3(Math.cos(a)*0.35, Math.cos(a)*0.30, Math.sin(a)*0.35));
        tube.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), B.clone().sub(A).normalize());
        g.add(tube);
      }
    } else {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.07, 8, 32), sp.mat);
      band.position.copy(A).lerp(B, 0.5);
      band.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), B.clone().sub(A).normalize());
      g.add(band);
    }

    jg.add(g);
    registry.junctionRefs.push(g);
    registerOrganelle('juncoes', g);
  });
}

/* --------------- VÍRUS (revelado pelo Módulo 8) -------------------- */
export function buildVirus(){
  const vg = new THREE.Group();
  groups.virusGroup = vg;
  vg.visible = false;
  cellRoot.add(vg);

  const capMat = reg(new THREE.MeshStandardMaterial({ color:0xff7e7e, roughness:0.35, metalness:0.15, emissive:0x4a0d0d, emissiveIntensity:0.9 }));
  const genMat = reg(new THREE.MeshStandardMaterial({ color:0xfff0a0, roughness:0.30, metalness:0.10, emissive:0x6a5200, emissiveIntensity:1.1 }));
  const envMat = reg(new THREE.MeshPhysicalMaterial({ color:0xff9e9e, roughness:0.30, transparent:true, opacity:0.35, clearcoat:1, depthWrite:false, side:THREE.DoubleSide }));

  for (let v = 0; v < 6; v++){
    const g = new THREE.Group();
    const a = (v/6)*Math.PI*2;
    g.position.set(Math.cos(a)*11.5, (v % 2 ? 1 : -1)*1.6, Math.sin(a)*11.5);

    /* capsídeo icosaédrico */
    const cap = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), capMat);
    g.add(cap);
    /* envelope lipídico */
    const env = new THREE.Mesh(new THREE.SphereGeometry(0.72, 20, 14), envMat);
    g.add(env);
    /* material genético interno */
    const gen = new THREE.Mesh(new THREE.TorusKnotGeometry(0.22, 0.055, 42, 8), genMat);
    g.add(gen);
    /* espículas glicoproteicas */
    for (let s = 0; s < 12; s++){
      const t = (s/12)*Math.PI*2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), capMat);
      spike.position.set(Math.cos(t)*0.72, Math.sin(t*1.7)*0.5, Math.sin(t)*0.72);
      spike.lookAt(g.position.clone().multiplyScalar(2));
      g.add(spike);
    }

    vg.add(g);
    registry.virus.push({ group:g, phase:v/6, base:g.position.clone() });
    registerOrganelle('virus', g, { noExplode:true });
  }
  return vg;
}

/* --------------------- ANÉIS DE REFERÊNCIA DE ESCALA ---------------- */
function buildScaleRings(){
  const mat = new THREE.MeshBasicMaterial({ color:0x3d6f96, transparent:true, opacity:0.14, side:THREE.DoubleSide, depthWrite:false });
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++){
    const ring = new THREE.Mesh(new THREE.TorusGeometry(11 + i*1.5, 0.012, 4, 96), mat);
    ring.rotation.x = Math.PI/2;
    ring.rotation.z = i*Math.PI/3;
    ring.raycast = () => {};
    g.add(ring);
  }
  g.userData.__scaleRings = true;
  cellRoot.add(g);
  groups.scaleRings = g;
}

/* --------------------- APLICAÇÃO DO TIPO CELULAR -------------------- */
export function setCellType(type){
  state.cellType = type;
  const isPlant = type === 'vegetal';
  const isProk = type === 'procarionte';

  groups.plantGroup.visible = isPlant;
  groups.prokGroup.visible = isProk;

  /* no procarionte a membrana e o citosol eucarióticos dão lugar à cápsula bacteriana */
  if (groups.membraneGroup) groups.membraneGroup.visible = !isProk;
  if (groups.cytoGroup) groups.cytoGroup.visible = !isProk;

  /* esconde as estruturas eucarióticas no modo procarionte */
  const eukGroups = [
    groups.nucleusGroup, groups.rerGroup, groups.relGroup, groups.golgiGroup,
    groups.mitoGroup, groups.lysoGroup, groups.peroxGroup, groups.vesGroup,
    groups.centGroup, groups.cyto2Group, groups.bridgeGroup, groups.riboGroup
  ];
  eukGroups.forEach(g => {
    if (!g) return;
    if (isProk){
      if (g.userData.__hiddenByType === undefined) g.userData.__hiddenByType = g.visible;
      g.visible = false;
    } else if (g.userData.__hiddenByType !== undefined){
      g.visible = g.userData.__hiddenByType;
      delete g.userData.__hiddenByType;
    }
  });

  /* esconde centrossomo na célula vegetal */
  if (groups.centGroup && !isProk) groups.centGroup.visible = !isPlant;

  /* esconde parede/cloroplastos/vacúolo quando não for vegetal (já tratado por plantGroup) */
  if (groups.junctionGroup) groups.junctionGroup.visible = false;
}