import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { SCIENCE, isAvailable } from './01-science.js';
import { MODULES } from './02-modules.js';
import {
  state, RENDER, cellRoot, allMaterials, pickables, ORGANELLE_INDEX,
  registry, matState, cellNoise
} from './03-state.js';
import { groups, buildCell, buildVirus, setCellType } from './04-cell.js';
import { anim, updateAnimations, buildAnimations } from './05-anim.js';
import {
  snapshotMaterials, tagMaterialsWithOwner, applyMembraneOpacity, applyWireframe,
  applyIsolate, setSection, applyHub, applyCellTypeVisibility, applyGroupVisibility,
  materialsOf, levelForDistance, distanceForLevel
} from './06-modes.js';
import {
  initSelection, applySelectionVisuals, clearSelectionVisuals,
  updateSelectionVisuals, setPinned, pinned, sel
} from './07-select.js';
import {
  dom, buildOrganelleList, refreshListAvailability, setActiveListItem, filterList,
  renderFicha, updateScaleBar, renderTheory, renderQuestion, setModuleBarActive, setUIMode
} from './08-ui.js';
import { SIMULATORS, restoreEmissiveAll } from './09-sims.js';
import { computeOrganelleBounds } from './03-state.js';

/* =====================================================================
   PARTE 10 — NÚCLEO DA APLICAÇÃO
   ===================================================================== */
const canvas = document.getElementById('c');
const viewport = document.getElementById('viewport');

let renderer, scene, camera, controls, clipPlane;
const clock = new THREE.Clock();
let activeSim = null;
let focusTween = null;
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
const tooltip = document.getElementById('tooltip');

/* ============================= INIT ================================ */
function initThree(){
  renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(viewport.clientWidth, viewport.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  renderer.clippingPlanes = [];
  RENDER.renderer = renderer;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03060a);
  scene.fog = new THREE.FogExp2(0x03060a, 0.0072);
  scene.add(cellRoot);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

  camera = new THREE.PerspectiveCamera(45, viewport.clientWidth/viewport.clientHeight, 0.08, 500);
  camera.position.set(4, 9, 28);

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.rotateSpeed = 0.62;
  controls.zoomSpeed = 0.85;
  controls.panSpeed = 0.7;
  controls.minDistance = 0.9;
  controls.maxDistance = 70;
  controls.target.set(0, 0, 0);
  controls.screenSpacePanning = true;

  clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

  scene.add(new THREE.HemisphereLight(0x9fd8ff, 0x0a1520, 0.38));
  scene.add(new THREE.AmbientLight(0x223344, 0.45));

  const key = new THREE.DirectionalLight(0xcfe8ff, 1.15); key.position.set(14, 20, 16); scene.add(key);
  const rim = new THREE.DirectionalLight(0x6aa8ff, 0.80); rim.position.set(-18, -8, -14); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffb27a, 0.40); fill.position.set(6, -14, 10); scene.add(fill);

  const p1 = new THREE.PointLight(0x5ec8ff, 14, 26, 2); p1.position.set(-5, 4, 3); scene.add(p1);
  const p2 = new THREE.PointLight(0xff9a5c, 10, 22, 2); p2.position.set(5, -4, -3); scene.add(p2);
  const p3 = new THREE.PointLight(0xa07bff, 9, 22, 2); p3.position.set(0, -6, 5); scene.add(p3);

  /* poeira microscópica ao fundo */
  const starGeo = new THREE.BufferGeometry();
  const N = 460;
  const pos = new Float32Array(N*3);
  for (let i = 0; i < N; i++){
    const r = 14 + Math.random()*46;
    const u = Math.random()*2 - 1;
    const th = Math.random()*Math.PI*2;
    const sq = Math.sqrt(1 - u*u);
    pos[i*3] = Math.cos(th)*sq*r;
    pos[i*3+1] = u*r;
    pos[i*3+2] = Math.sin(th)*sq*r;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color:0x3d6f96, size:0.13, transparent:true, opacity:0.5, sizeAttenuation:true, depthWrite:false
  })));

  initSelection(scene, camera, viewport);

  window.addEventListener('resize', onResize);
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(viewport);
}

function onResize(){
  if (!renderer || !camera) return;
  const w = viewport.clientWidth, h = viewport.clientHeight;
  if (!w || !h) return;
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  updateScaleBar(camera, controls, viewport, true);
}

/* ========================== SELEÇÃO / FOCO ========================= */
function screenToNDC(ev){
  const r = canvas.getBoundingClientRect();
  pointerNDC.x = ((ev.clientX - r.left)/r.width)*2 - 1;
  pointerNDC.y = -((ev.clientY - r.top)/r.height)*2 + 1;
}

function pickAt(ev){
  screenToNDC(ev);
  raycaster.setFromCamera(pointerNDC, camera);
  const list = pickables.filter(o => o.visible && !o.userData.__typeHidden);
  const hits = raycaster.intersectObjects(list, false);
  if (!hits.length) return null;

  /* prioriza organelas internas em relação aos envoltórios difusos */
  const SOFT = ['membrana','citoplasma'];
  const priority = hits.find(h => {
    const id = h.object.userData.organelleId;
    return id && !SOFT.includes(id);
  });
  const chosen = priority || hits[0];
  return chosen.object.userData.organelleId || null;
}

export function selectOrganelle(id, focus){
  if (id && !isAvailable(id, state.cellType)) id = null;

  state.selectedId = id;
  if (id) applySelectionVisuals(id);
  else clearSelectionVisuals();

  renderFicha(id);
  setActiveListItem(id);
  if (state.isolate) applyIsolate();

  if (focus && id && ORGANELLE_INDEX[id]){
    const entry = ORGANELLE_INDEX[id];
    const dist = Math.max(1.7, Math.min(entry.radius*3.0, 26)) / (RENDER.cellScaleK || 1);
    focusOn(entry.center.clone(), dist);
  }
  if (window.innerWidth <= 900) document.body.classList.add('show-right');
}

function focusOn(target, distance){
  const startTarget = controls.target.clone();
  const startPos = camera.position.clone();
  const dir = startPos.clone().sub(startTarget);
  if (dir.lengthSq() < 1e-6) dir.set(0, 0.3, 1);
  dir.normalize();
  const endPos = target.clone().add(dir.multiplyScalar(distance));
  focusTween = { t:0, dur:0.85, fromT:startTarget, toT:target, fromP:startPos, toP:endPos };
}

function updateFocusTween(dt){
  if (!focusTween) return;
  focusTween.t += dt/focusTween.dur;
  const k = Math.min(1, focusTween.t);
  const e = k < 0.5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3)/2;
  controls.target.lerpVectors(focusTween.fromT, focusTween.toT, e);
  camera.position.lerpVectors(focusTween.fromP, focusTween.toP, e);
  if (k >= 1) focusTween = null;
}

/* ======================== CONTROLADOR DE MÓDULOS =================== */
let currentSimKey = null;

export function applyModule(modId){
  /* encerra o simulador anterior */
  if (activeSim && typeof activeSim.teardown === 'function'){
    try { activeSim.teardown(); } catch(e){ console.warn(e); }
  }
  restoreEmissiveAll();

  state.currentModule = String(modId);
  const m = MODULES[state.currentModule];
  if (!m) return;

  setModuleBarActive(modId);
  renderTheory(state.currentModule);
  renderQuestion(state.currentModule);

  /* restaura o tipo celular adequado ao módulo */
  const sim = m.sim || {};
  const wantedType = sim.type === 'photosynthesis' ? 'vegetal' : 'animal';
  if (state.cellType !== wantedType){
    setCellType(wantedType);
    refreshListAvailability();
    applyCellTypeVisibility();
  }
  state.osmosis = 0;
  state.apoptosis = 0;
  state.junctionType = null;
  state.virus = null;
  if (groups.junctionGroup) groups.junctionGroup.visible = false;
  if (groups.virusGroup) groups.virusGroup.visible = false;
  registry.virus.forEach(r => { r.group.visible = false; });
  cellRoot.scale.setScalar(1);
  RENDER.cellScaleK = 1;

  /* foco inicial do módulo */
  currentSimKey = sim.type;

  if (sim.focus && sim.focus.length){
    const first = sim.focus.find(id => ORGANELLE_INDEX[id] && isAvailable(id, state.cellType));
    if (first) selectOrganelle(first, false);
  } else {
    selectOrganelle(null, false);
  }

  /* painel do laboratório */
  const s = SIMULATORS[sim.type];
  if (s){
    activeSim = s;
    dom.labTitle.textContent = s.title;
    dom.labControls.classList.add('show');
    try { s.mount(dom.labContent); } catch(e){ console.error(e); }
    if (typeof s.apply === 'function') s.apply();
  } else {
    activeSim = null;
    dom.labControls.classList.remove('show');
  }

  /* aplica realce emissivo definido pelo módulo */
  if (sim.emissive){
    Object.keys(sim.emissive).forEach(id => {
      materialsOf(id).forEach(mat => {
        const base = matState.get(mat);
        if (!base || base.emissiveIntensity === null) return;
        mat.emissiveIntensity = base.emissiveIntensity * sim.emissive[id];
      });
    });
  }
  window.__cvCameraHome();
}

/* ============================== UI ================================= */
function bindUI(){
  /* --- modo explorar / aula --- */
  document.getElementById('modeExplore').addEventListener('click', () => {
    setUIMode('explore');
    if (activeSim && activeSim.teardown) activeSim.teardown();
    restoreEmissiveAll();
    activeSim = null;
    cellRoot.scale.setScalar(1);
    RENDER.cellScaleK = 1;
    setCellType('animal');
    refreshListAvailability();
    applyCellTypeVisibility();
    if (groups.junctionGroup) groups.junctionGroup.visible = false;
    if (groups.virusGroup) groups.virusGroup.visible = false;
    if (groups.plantGroup) groups.plantGroup.visible = false;
    if (groups.prokGroup) groups.prokGroup.visible = false;
    selectOrganelle(null, false);
  });
  document.getElementById('modeAula').addEventListener('click', () => {
    setUIMode('aula');
    applyModule(state.currentModule);
  });

  /* --- barra de módulos --- */
  document.querySelectorAll('#moduleBar .mod-btn').forEach(b => {
    b.addEventListener('click', () => applyModule(b.dataset.mod));
  });

  /* --- busca --- */
  dom.searchInput.addEventListener('input', e => filterList(e.target.value));

  /* --- modos de visualização --- */
  const modeButtons = [...document.querySelectorAll('.topbar-modes button')];
  const memSlider = document.getElementById('memSlider');
  const dissSlider = document.getElementById('dissSlider');
  const expSlider = document.getElementById('expSlider');
  const memVal = document.getElementById('memVal');
  const dissVal = document.getElementById('dissVal');
  const expVal = document.getElementById('expVal');

  function updateValLabels(){
    memVal.textContent = Math.round(state.membraneOpacity*100) + '%';
    dissVal.textContent = Math.round(state.dissection*100) + '%';
    expVal.textContent = Math.round(state.explode*100) + '%';
  }
  window.__cvUpdateValLabels = updateValLabels;

  function resetModes(){
    state.membraneOpacity = 0.55;
    state.dissection = 0;
    state.explode = 0;
    state.isolate = false;
    state.wireframe = false;
    state.hub = false;
    state.section = false;
    state.compareWith = null;
    setPinned(null);
    memSlider.value = 55; dissSlider.value = 0; expSlider.value = 0;
    setSection(false, clipPlane);
    applyMembraneOpacity(); applyWireframe(); applyIsolate(); applyHub();
    updateValLabels();
  }

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode === 'full'){
        resetModes();
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      } else if (mode === 'transparent'){
        state.membraneOpacity = state.membraneOpacity < 0.2 ? 0.55 : 0.10;
        memSlider.value = Math.round(state.membraneOpacity*100);
        applyMembraneOpacity(); updateValLabels();
        btn.classList.toggle('active', state.membraneOpacity < 0.2);
      } else if (mode === 'section'){
        const on = !state.section;
        setSection(on, clipPlane);
        if (on){
          clipPlane.normal.set(0, 0, -1);
          clipPlane.constant = 1.5;
        }
        btn.classList.toggle('active', on);
      } else if (mode === 'explode'){
        const ex = state.explode > 0.02 ? 0 : 0.7;
        state.explode = ex;
        expSlider.value = Math.round(ex*100);
        updateValLabels();
        btn.classList.toggle('active', ex > 0.02);
      } else if (mode === 'isolate'){
        if (!state.selectedId) selectOrganelle('nucleo', false);
        state.isolate = !state.isolate;
        applyIsolate();
        btn.classList.toggle('active', state.isolate);
      } else if (mode === 'compare'){
        if (!state.selectedId){
          selectOrganelle('nucleo', false);
        }
        if (state.compareWith){
          setPinned(null);
          state.compareWith = null;
          btn.classList.remove('active');
          if (state.selectedId) applySelectionVisuals(state.selectedId);
        } else {
          state.compareWith = state.selectedId;
          setPinned(state.selectedId);
          btn.classList.add('active');
        }
      } else if (mode === 'wire'){
        state.wireframe = !state.wireframe;
        applyWireframe();
        btn.classList.toggle('active', state.wireframe);
      }
    });
  });

  memSlider.addEventListener('input', e => {
    state.membraneOpacity = Number(e.target.value)/100;
    applyMembraneOpacity(); updateValLabels();
    modeButtons.forEach(b => { if (b.dataset.mode !== 'section' && b.dataset.mode !== 'wire') b.classList.remove('active'); });
  });
  dissSlider.addEventListener('input', e => {
    state.dissection = Number(e.target.value)/100;
    applyMembraneOpacity(); updateValLabels();
  });
  expSlider.addEventListener('input', e => {
    state.explode = Number(e.target.value)/100;
    updateValLabels();
    const ex = state.explode > 0.02;
    modeButtons.forEach(b => {
      if (b.dataset.mode === 'explode') b.classList.toggle('active', ex);
    });
  });

  /* --- toggles --- */
  document.getElementById('cbCito').addEventListener('change', e => {
    state.showCytosol = e.target.checked;
    applyMembraneOpacity();
  });
  document.getElementById('cbCitoesq').addEventListener('change', e => {
    state.showCitoesqueleto = e.target.checked;
    applyGroupVisibility();
    applyIsolate();
  });
  document.getElementById('cbMolec').addEventListener('change', e => {
    state.showMolecular = e.target.checked;
    applyGroupVisibility();
  });
  document.getElementById('cbLabels').addEventListener('change', e => {
    state.showLabels = e.target.checked;
  });

  document.getElementById('anVes').addEventListener('change', e => anim.enabled.vesicles = e.target.checked);
  document.getElementById('anTrans').addEventListener('change', e => anim.enabled.transport = e.target.checked);
  document.getElementById('anATP').addEventListener('change', e => anim.enabled.atp = e.target.checked);
  document.getElementById('anTradu').addEventListener('change', e => anim.enabled.translation = e.target.checked);

  /* --- barra de animação --- */
  const playBtn = document.getElementById('playBtn');
  playBtn.addEventListener('click', () => {
    anim.playing = !anim.playing;
    playBtn.textContent = anim.playing ? '⏸ Pausar' : '▶ Reproduzir';
  });
  document.getElementById('restartBtn').addEventListener('click', () => {
    anim.time = 0;
    anim.vesicles.forEach(v => v.offset = Math.random());
    anim.transports.forEach(t => t.offset = Math.random());
    if (activeSim && activeSim.apply) activeSim.apply();
  });
  const speedSlider = document.getElementById('speedSlider');
  const speedVal = document.getElementById('speedVal');
  speedSlider.addEventListener('input', e => {
    anim.speed = Number(e.target.value)/100;
    speedVal.textContent = anim.speed.toFixed(1) + '×';
  });

  /* --- níveis de observação --- */
  document.querySelectorAll('#levelList .org-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl = Number(btn.dataset.level);
      const dist = distanceForLevel(lvl) / (RENDER.cellScaleK || 1);
      const target = (state.selectedId && ORGANELLE_INDEX[state.selectedId])
        ? ORGANELLE_INDEX[state.selectedId].center.clone()
        : new THREE.Vector3(0, 0, 0);
      focusOn(target, dist);
    });
  });

  /* --- hub do sistema de endomembranas --- */
  document.getElementById('hubBtn').addEventListener('click', e => {
    state.hub = !state.hub;
    e.currentTarget.classList.toggle('active', state.hub);
    applyHub();
  });

  /* --- reset --- */
  document.getElementById('resetBtn').addEventListener('click', () => {
    resetModes();
    state.selectedId = null;
    state.showCytosol = true;
    state.showMolecular = false;
    state.showCitoesqueleto = true;
    document.getElementById('cbCito').checked = true;
    document.getElementById('cbMolec').checked = false;
    document.getElementById('cbCitoesq').checked = true;
    clearSelectionVisuals();
    renderFicha(null);
    setActiveListItem(null);
    modeButtons.forEach(b => b.classList.remove('active'));
    document.querySelector('.topbar-modes button[data-mode="full"]').classList.add('active');
    setCellType('animal');
    refreshListAvailability();
    applyCellTypeVisibility();
    applyGroupVisibility();
    if (state.mode === 'aula') applyModule(state.currentModule);
    focusOn(new THREE.Vector3(0, 0, 0), 30);
  });

  /* --- estudo e painéis móveis --- */
  document.getElementById('studyBtn').addEventListener('click', e => {
    document.body.classList.toggle('study');
    e.currentTarget.classList.toggle('active');
  });
  document.getElementById('btnLeft').addEventListener('click', () => {
    document.body.classList.toggle('show-left');
    document.body.classList.remove('show-right');
  });
  document.getElementById('btnRight').addEventListener('click', () => {
    document.body.classList.toggle('show-right');
    document.body.classList.remove('show-left');
  });

  /* --- interação com o canvas --- */
  let downX = 0, downY = 0, isDown = false;
  canvas.addEventListener('pointerdown', e => { isDown = true; downX = e.clientX; downY = e.clientY; });
  canvas.addEventListener('pointerup', e => {
    if (!isDown) return;
    isDown = false;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
    const id = pickAt(e);
    selectOrganelle(id, false);
  });

  let hoverThrottle = 0;
  canvas.addEventListener('pointermove', e => {
    const now = performance.now();
    if (now - hoverThrottle < 55) return;
    hoverThrottle = now;
    const id = pickAt(e);
    if (id && SCIENCE[id]){
      tooltip.textContent = SCIENCE[id].nome;
      tooltip.style.opacity = '1';
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top = (e.clientY + 14) + 'px';
      canvas.style.cursor = 'pointer';
      state.hoverId = id;
    } else {
      tooltip.style.opacity = '0';
      canvas.style.cursor = 'grab';
      state.hoverId = null;
    }
  });
  canvas.addEventListener('pointerleave', () => {
    tooltip.style.opacity = '0';
    isDown = false;
  });

  /* --- teclado --- */
  window.addEventListener('keydown', e => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'r' || e.key === 'R'){ document.getElementById('resetBtn').click(); }
    else if (e.key === ' '){ e.preventDefault(); playBtn.click(); }
    else if (e.key === 'Escape'){
      state.selectedId = null;
      clearSelectionVisuals();
      renderFicha(null);
      setActiveListItem(null);
      state.isolate = false;
      applyIsolate();
    }
    else if (e.key === 'i' || e.key === 'I'){
      document.querySelector('.topbar-modes button[data-mode="isolate"]').click();
    }
    else if (e.key === 'c' || e.key === 'C'){
      document.querySelector('.topbar-modes button[data-mode="section"]').click();
    }
    else if (e.key === 'ArrowRight'){ panCamera(1, 0); }
    else if (e.key === 'ArrowLeft'){ panCamera(-1, 0); }
    else if (e.key === 'ArrowUp'){ panCamera(0, 1); }
    else if (e.key === 'ArrowDown'){ panCamera(0, -1); }
  });
}

function panCamera(dx, dy){
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
  const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
  const step = camera.position.distanceTo(controls.target)*0.06;
  const move = right.multiplyScalar(dx*step).add(up.multiplyScalar(dy*step));
  camera.position.add(move);
  controls.target.add(move);
}

/* ============================== LOOP =============================== */
function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  updateFocusTween(dt);
  updateAnimations(dt);

  /* explosão anatômica: afasta os nós radialmente */
  const k = state.explode;
  for (const id in ORGANELLE_INDEX){
    const e = ORGANELLE_INDEX[id];
    e.nodes.forEach(n => {
      if (n.noExplode) return;
      const dir = n.base.clone();
      if (dir.lengthSq() < 1e-6) return;
      const target = dir.multiplyScalar(1 + k*1.3);
      n.group.position.lerp(target, 1 - Math.pow(0.0015, dt));
    });
  }

  /* seleção: halo, anéis e etiqueta */
  updateSelectionVisuals(dt);

  /* simulador ativo */
  if (activeSim && typeof activeSim.tick === 'function') activeSim.tick(dt);

  /* plano de corte acompanha a câmera */
  if (state.section){
    const camDir = camera.position.clone().sub(controls.target).normalize();
    clipPlane.normal.copy(camDir).negate();
    clipPlane.constant = 0.6;
  }

  controls.update();
  updateScaleBar(camera, controls, viewport, false);
  renderer.render(scene, camera);
}

/* ============================== BOOT =============================== */
function boot(){
  try {
    initThree();
    buildCell();
    buildVirus();
    buildAnimations();
    computeOrganelleBounds();
    snapshotMaterials();
    tagMaterialsWithOwner();
    applyCellTypeVisibility();
    applyMembraneOpacity();
    applyGroupVisibility();

    bindUI();
    buildOrganelleList();
    renderFicha(null);
    updateScaleBar(camera, controls, viewport, true);

    /* esconde o detalhe molecular no início */
    if (registry.molHeads) registry.molHeads.forEach(h => { h.visible = false; });

    animate();

    setTimeout(() => document.getElementById('loading').classList.add('hide'), 260);
  } catch (err){
    console.error(err);
    document.getElementById('loading').innerHTML =
      `<p style="color:#ff8888;max-width:420px;text-align:center;line-height:1.6">
        Não foi possível inicializar a cena 3D neste navegador.<br>
        Verifique se o WebGL está habilitado e recarregue a página.<br><br>
        <small style="opacity:.6">${String(err && err.message ? err.message : err)}</small>
      </p>`;
  }
}

/* expõe a seleção para os módulos de UI e simuladores */
window.__cvSelect = selectOrganelle;
window.__cvApplyModule = applyModule;
window.__cvState = state;
window.__cvCameraHome = function(){
  focusOn(new THREE.Vector3(0, 0, 0), 28 / (RENDER.cellScaleK || 1));
};
window.__cvSetPinned = setPinned;

boot();