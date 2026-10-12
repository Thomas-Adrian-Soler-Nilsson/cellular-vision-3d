import * as THREE from 'three';
import { state, reg, registry, cellRoot, pickables } from '../nucleo/estado.js';

/* =====================================================================
   PARTE 5 — ANIMAÇÕES DOS PROCESSOS CELULARES
   ===================================================================== */
export const anim = {
  playing:true, speed:1, time:0,
  vesicles:[], transports:[], atp:[], translations:[], virusParticles:[],
  enabled:{ vesicles:true, transport:true, atp:true, translation:true }
};

export function buildAnimations(){
  buildVesicleTraffic();
  buildMembraneTransport();
  buildATP();
  buildTranslation();
  buildVirusDynamics();
  /* registro para o modo "isolar": esconde os elementos de animação */
  registry.anim = []
    .concat(anim.vesicles.map(v => v.mesh))
    .concat(anim.transports.map(t => t.mesh))
    .concat(anim.atp)
    .concat(anim.translations.map(t => t.group));
}

/* --------- tráfego de vesículas: RE → Golgi → membrana -------------- */
function buildVesicleTraffic(){
  const mat = reg(new THREE.MeshStandardMaterial({
    color:0xffe066, roughness:0.28, metalness:0.12,
    emissive:0x6a5200, emissiveIntensity:0.95, transparent:true, opacity:0.95
  }));

  /* cada rota parte do RE rugoso, passa pelo Golgi e segue à membrana */
  const PATHS = [
    [[-4.9, 0.6, 1.9], [-2.4, 0.4, 2.0], [ 0.6,-1.0, 1.8], [ 3.0,-1.8, 1.6], [ 6.4,-2.6, 2.4], [ 9.0,-3.0, 3.2]],
    [[-4.0,-2.6, 0.4], [-2.0,-2.6, 1.0], [ 1.2,-2.5, 1.4], [ 3.2,-2.2, 1.5], [ 6.6,-2.9, 1.0], [ 9.2,-3.6, 0.6]],
    [[-2.2, 3.6, 2.6], [-0.4, 2.8, 2.8], [ 1.8, 1.5, 2.6], [ 4.2, 0.8, 2.6], [ 7.2, 0.6, 3.0], [ 9.4, 0.4, 3.4]],
    [[ 1.8, 4.2,-1.8], [ 2.6, 2.2,-0.6], [ 3.6,-0.4, 0.8], [ 4.2,-1.4, 1.4], [ 5.6,-2.6,-0.6], [ 7.6,-4.0,-2.4]],
    [[-3.2, 1.0,-3.4], [-1.6,-1.2,-3.0], [ 0.8,-2.2,-2.2], [ 2.6,-3.0,-1.6], [ 4.0,-4.4,-3.0], [ 5.6,-5.6,-4.2]]
  ];

  PATHS.forEach((p, pi) => {
    const curve = new THREE.CatmullRomCurve3(p.map(a => new THREE.Vector3(a[0], a[1], a[2])));
    const n = pi < 2 ? 3 : 2;
    for (let i = 0; i < n; i++){
      const s = 0.10 + Math.random()*0.07;
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), mat);
      mesh.userData.organelleId = 'vesiculas';
      cellRoot.add(mesh);
      anim.vesicles.push({ mesh, curve, offset:Math.random(), speed:0.045 + Math.random()*0.035 });
    }
  });
}

/* --------- transporte através da membrana (difusão + bomba) --------- */
function buildMembraneTransport(){
  const difMat = reg(new THREE.MeshStandardMaterial({
    color:0x7ef0c8, roughness:0.25, metalness:0.15,
    emissive:0x1a6a50, emissiveIntensity:1.05, transparent:true, opacity:0.95
  }));
  const pumpMat = reg(new THREE.MeshStandardMaterial({
    color:0xffcc66, roughness:0.30, metalness:0.20,
    emissive:0x6a4a05, emissiveIntensity:1.15, transparent:true, opacity:0.95
  }));

  /* pontos sobre a membrana por onde as moléculas entram/saem */
  const SPOTS = [
    { a:[ 8.6, 4.2, 2.2], kind:'diff' },
    { a:[-8.2, 4.8, 3.0], kind:'diff' },
    { a:[ 6.2,-7.0, 2.4], kind:'pump' },
    { a:[-8.4,-3.4,-3.2], kind:'pump' },
    { a:[ 2.4, 8.4,-3.6], kind:'diff' },
    { a:[-2.6,-8.6, 2.8], kind:'pump' }
  ];

  SPOTS.forEach(sp => {
    const surface = new THREE.Vector3(sp.a[0], sp.a[1], sp.a[2]);
    if (surface.length() > 9.4) surface.setLength(9.4);
    /* normal aproximada = direção radial */
    const nrm = surface.clone().normalize();

    if (sp.kind === 'pump'){
      /* proteína carreadora visível na membrana */
      const carrier = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 1.0, 12), pumpMat);
      carrier.position.copy(surface);
      carrier.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), nrm);
      carrier.userData.organelleId = 'membrana';
      cellRoot.add(carrier);
    }

    for (let i = 0; i < 4; i++){
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), sp.kind === 'pump' ? pumpMat : difMat);
      m.userData.organelleId = 'membrana';
      cellRoot.add(m);
      anim.transports.push({
        mesh:m,
        from: surface.clone().add(nrm.clone().multiplyScalar(sp.kind === 'pump' ? 0.75 : 1.5)),
        to:   surface.clone().add(nrm.clone().multiplyScalar(sp.kind === 'pump' ? -0.75 : -1.5)),
        kind: sp.kind,
        offset:Math.random(),
        speed: (sp.kind === 'pump' ? 0.22 : 0.34) + Math.random()*0.12
      });
    }
  });
}

/* ------------------- produção de ATP nas mitocôndrias --------------- */
function buildATP(){
  const mat = reg(new THREE.MeshStandardMaterial({
    color:0xfff2b0, roughness:0.20, metalness:0.20,
    emissive:0xffbb33, emissiveIntensity:1.3, transparent:true, opacity:0.92
  }));

  registry.mitoRefs.forEach(group => {
    for (let i = 0; i < 6; i++){
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), mat);
      m.position.set(
        (Math.random()-0.5)*1.4,
        (Math.random()-0.5)*0.5,
        (Math.random()-0.5)*0.5
      );
      m.userData.organelleId = 'mitocondria';
      m.userData.base = m.position.clone();
      m.userData.phase = Math.random()*Math.PI*2;
      group.add(m);
      anim.atp.push(m);
    }
  });
}

/* --------------- tradução ribossômica (esquemática) ----------------- */
function buildTranslation(){
  const mrnaMat = reg(new THREE.MeshStandardMaterial({
    color:0x8fd8ff, roughness:0.40, metalness:0.05,
    emissive:0x1a4a60, emissiveIntensity:0.7
  }));
  const aaMat = reg(new THREE.MeshStandardMaterial({
    color:0xffc9a0, roughness:0.45, metalness:0.05,
    emissive:0x5a2a10, emissiveIntensity:0.7
  }));

  for (let t = 0; t < 8; t++){
    const holder = new THREE.Group();

    /* fita de mRNA */
    const n = 14;
    const mrna = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 6), mrnaMat, n);
    const d = new THREE.Object3D();
    for (let i = 0; i < n; i++){
      d.position.set(i*0.14 - n*0.07, 0, 0);
      d.rotation.set(0, 0, Math.PI/2);
      d.updateMatrix();
      mrna.setMatrixAt(i, d.matrix);
    }
    mrna.instanceMatrix.needsUpdate = true;
    holder.add(mrna);

    /* cadeia polipeptídica em crescimento */
    const chain = new THREE.Group();
    const segs = [];
    for (let i = 0; i < 7; i++){
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), aaMat);
      s.position.set(0, 0.14 + i*0.115, 0);
      chain.add(s);
      segs.push(s);
    }
    holder.add(chain);

    /* posiciona: alguns no citosol (livres), alguns sobre o RE (aderidos) */
    let pos;
    if (t < 5){
      const u = Math.random()*2 - 1;
      const th = Math.random()*Math.PI*2;
      const r = 4.0 + Math.random()*4.2;
      const sq = Math.sqrt(1 - u*u);
      pos = new THREE.Vector3(Math.cos(th)*sq*r, u*r, Math.sin(th)*sq*r);
    } else {
      const c = [ [-4.9, 1.4, 2.6], [-4.0,-2.0, 1.2], [ 1.8, 4.0,-0.9] ][t - 5];
      pos = new THREE.Vector3(c[0], c[1], c[2]);
    }
    holder.position.copy(pos);
    holder.rotation.set(Math.random()*0.6 - 0.3, Math.random()*Math.PI*2, Math.random()*0.6 - 0.3);
    holder.userData.organelleId = 'ribossomos';
    cellRoot.add(holder);

    anim.translations.push({ group:holder, chain, segs, offset:Math.random(), speed:0.22 + Math.random()*0.16 });
  }
}

/* ------------- dinâmica viral (Módulo 8) ---------------------------- */
function buildVirusDynamics(){
  const mat = reg(new THREE.MeshStandardMaterial({
    color:0xff7e7e, roughness:0.30, metalness:0.15,
    emissive:0x5c0d0d, emissiveIntensity:1.1, transparent:true, opacity:0.95
  }));
  for (let i = 0; i < 10; i++){
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), mat);
    m.userData.organelleId = 'virus';
    m.visible = false;
    cellRoot.add(m);
    anim.virusParticles.push({ mesh:m, offset:Math.random(), speed:0.10 + Math.random()*0.10, seed:Math.random() });
  }
}

/* ------------------------- atualização por quadro ------------------- */
export function updateAnimations(dt){
  if (!anim.playing) return;
  anim.time += dt * anim.speed;

  /* --- vesículas --- */
  anim.vesicles.forEach(v => {
    if (!anim.enabled.vesicles){ v.mesh.visible = false; return; }
    v.mesh.visible = true;
    const t = (anim.time*v.speed + v.offset) % 1;
    v.mesh.position.copy(v.curve.getPointAt(t));
    v.mesh.scale.setScalar(1 + Math.sin(anim.time*3 + v.offset*10)*0.08);
  });

  /* --- transporte de membrana --- */
  anim.transports.forEach(t => {
    if (!anim.enabled.transport){ t.mesh.visible = false; return; }
    t.mesh.visible = true;
    const k = (anim.time*t.speed + t.offset) % 1;
    t.mesh.position.lerpVectors(t.from, t.to, k);
    t.mesh.scale.setScalar(0.75 + Math.sin(k*Math.PI)*0.55);
  });

  /* --- ATP: só é produzido se houver O2 suficiente (Módulo 3) --- */
  const o2 = state.o2;
  anim.atp.forEach(m => {
    if (!anim.enabled.atp || o2 < 0.12){ m.visible = false; return; }
    m.visible = true;
    const b = m.userData.base;
    const ph = m.userData.phase + anim.time*(1.2 + o2*1.4);
    m.position.set(
      b.x + Math.sin(ph)*0.16,
      b.y + Math.cos(ph*1.3)*0.12,
      b.z + Math.sin(ph*0.8)*0.16
    );
    m.scale.setScalar((0.5 + (Math.sin(ph*1.8)*0.5 + 0.5)*0.9) * (0.55 + o2*0.65));
  });

  /* --- tradução --- */
  anim.translations.forEach(t => {
    if (!anim.enabled.translation){ t.group.visible = false; return; }
    t.group.visible = true;
    const k = (anim.time*t.speed + t.offset) % 1;
    const grow = Math.min(1, k*2.4);
    t.segs.forEach((s, i) => {
      s.visible = (i/t.segs.length) < grow;
      s.scale.setScalar(0.85 + Math.sin(anim.time*4 + i)*0.12);
    });
    t.chain.rotation.y = anim.time*0.6 + t.offset*6;
  });

  /* --- partículas virais (Módulo 8) --- */
  const virusOn = state.currentModule === '8' && state.virus !== null;
  anim.virusParticles.forEach(p => {
    if (!virusOn){ p.mesh.visible = false; return; }
    p.mesh.visible = true;
    const k = (anim.time*p.speed + p.offset) % 1;
    const a = p.seed*Math.PI*2 + k*0.6;
    const r = 11.6 - k*3.4;
    const y = (p.seed - 0.5)*7.0;
    p.mesh.position.set(Math.cos(a)*r, y, Math.sin(a)*r);
    p.mesh.rotation.x += dt*1.4;
    p.mesh.rotation.y += dt*1.1;
    p.mesh.scale.setScalar(0.7 + k*0.9);
  });
}

/* -------------- animação da célula em apoptose (Módulo 7) ----------- */
export function getApoptosisTransform(){
  /* retorna escala e deslocamento para o modo apoptose */
  const a = state.apoptosis;
  return {
    scale: 1 - a*0.10,
    wobble: a*0.035,
    fadeMembrane: 1 - a*0.55
  };
}