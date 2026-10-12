import * as THREE from 'three';
import { state, RENDER, ORGANELLE_INDEX, allMaterials, matState, registry, cellRoot } from './03-state.js';
import { groups, setCellType } from './04-cell.js';
import { anim } from './05-anim.js';
import { materialsOf, applyIsolate, applyHub, applyCellTypeVisibility } from './06-modes.js';
import { refreshListAvailability } from './08-ui.js';

/* =====================================================================
   PARTE 8 — SIMULADORES DOS MÓDULOS
   Cada simulador expõe: title, mount(el), tick(dt), apply(), teardown()
   ===================================================================== */

const q = sel => document.querySelector(sel);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- utilidades de realce usadas por vários simuladores ------- */
function setEmissive(id, factor){
  materialsOf(id).forEach(m => {
    const base = matState.get(m);
    if (!base || base.emissiveIntensity === null) return;
    if (m.userData && m.userData.__selBoost) return;
    m.emissiveIntensity = base.emissiveIntensity * factor;
  });
}
function restoreEmissiveAll(){
  allMaterials.forEach(m => {
    const base = matState.get(m);
    if (!base || base.emissiveIntensity === null) return;
    if (m.userData && m.userData.__selBoost) return;
    m.emissiveIntensity = base.emissiveIntensity;
  });
}

/* ======================= 1. COMPARAÇÃO DE CÉLULAS ================== */
const simCellCompare = {
  title:'Comparar tipos celulares',
  mount(el){
    el.innerHTML = `
      <div class="ctrl-row">
        <div class="pill-btns" style="flex:1">
          <button data-ct="animal" class="active">Animal</button>
          <button data-ct="vegetal">Vegetal</button>
          <button data-ct="procarionte">Procarionte</button>
        </div>
        <span class="status" id="ctStatus"></span>
      </div>
      <div class="lab-note" id="ctNote"></div>`;
    const btns = el.querySelectorAll('[data-ct]');
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      setCellType(b.dataset.ct);
      applyCellTypeVisibility();
      refreshListAvailability();
      if (window.__cvCameraHome) window.__cvCameraHome();
      this.apply();
    }));
    this.el = el;
    this.apply();
  },
  apply(){
    const t = state.cellType;
    const status = q('#ctStatus'), note = q('#ctNote');
    if (!status) return;
    if (t === 'animal'){
      status.textContent = 'Eucarionte animal';
      status.className = 'status';
      note.textContent = 'Possui centríolos, lisossomos e vacúolos pequenos. Reserva energética: glicogênio.';
      autoFocus('nucleo');
    } else if (t === 'vegetal'){
      status.textContent = 'Eucarionte vegetal';
      status.className = 'status good';
      note.textContent = 'Possui parede celular de celulose, cloroplastos e vacúolo central grande. Reserva: amido.';
      autoFocus('cloroplasto');
    } else {
      status.textContent = 'Procarionte';
      status.className = 'status bad';
      note.textContent = 'Sem núcleo delimitado e sem organelas membranosas. DNA circular no nucleoide; ribossomos 70S.';
      autoFocus('nucleoide');
    }
    applyCellTypeVisibility();
  },
  tick(){},
  teardown(){}
};

function autoFocus(id){
  const entry = ORGANELLE_INDEX[id];
  if (!entry || state.selectedId === id) return;
  if (typeof window.__cvSelect === 'function') window.__cvSelect(id, false);
}

/* ============================== 2. OSMOSE =========================== */
const simOsmosis = {
  title:'Simulador de osmose',
  mount(el){
    el.innerHTML = `
      <div class="ctrl-row">
        <div class="ctrl-col" style="min-width:220px">
          <label for="osmSlider">Concentração do meio externo
            <b id="osmVal">isotônico</b>
          </label>
          <input type="range" id="osmSlider" min="-100" max="100" value="0" />
        </div>
        <span class="status" id="osmStatus">Isotônico</span>
      </div>
      <div class="lab-note" id="osmNote">
        Arraste para a esquerda (hipotônico) ou para a direita (hipertônico) e observe o volume celular.
      </div>`;
    const s = q('#osmSlider');
    s.addEventListener('input', e => {
      state.osmosis = Number(e.target.value)/100;
      this.apply();
    });
    this.apply();
  },
  apply(){
    const o = state.osmosis;
    const isPlant = state.cellType === 'vegetal';
    const status = q('#osmStatus'), note = q('#osmNote'), val = q('#osmVal');
    if (!status) return;

    /* -1 = muito hipotônico (túrgido/lise) | +1 = muito hipertônico (murcho) */
    let scale, label, cls, text;

    if (o < -0.08){
      scale = 1 + (-o)*0.20;                       /* ganha água */
      label = 'hipotônico';
      if (isPlant){
        cls = 'good'; text = 'Turgescência';
        note.textContent = 'A água entra por osmose, o vacúolo aumenta e a parede celular limita a expansão — a célula fica túrgida, sem estourar.';
      } else {
        cls = o < -0.62 ? 'bad' : '';
        text = o < -0.62 ? 'Lise (hemólise)' : 'Ganho de água';
        note.textContent = o < -0.62
          ? 'Sem parede celular, a membrana não resiste: a célula animal absorve água até romper — a lise.'
          : 'A água entra por osmose e a célula animal aumenta de volume. Sem parede, ela é vulnerável à lise.';
      }
    } else if (o > 0.08){
      scale = 1 - o*0.22;                          /* perde água */
      label = 'hipertônico';
      if (isPlant){
        cls = 'bad'; text = 'Plasmólise';
        note.textContent = 'A célula perde água, o vacúolo encolhe e a membrana plasmática se descola da parede celular — a plasmólise.';
      } else {
        cls = 'bad'; text = 'Crenação';
        note.textContent = 'A água sai por osmose, o volume diminui e a membrana forma projeções — a crenação.';
      }
    } else {
      scale = 1; label = 'isotônico'; cls = ''; text = 'Isotônico';
      note.textContent = 'Fluxo de água equilibrado nos dois sentidos: o volume celular permanece estável.';
    }

    if (val) val.textContent = label;
    status.textContent = text;
    status.className = 'status ' + cls;

    RENDER.cellScaleK = scale;
    cellRoot.scale.setScalar(scale);

    /* cor da membrana indica o estado osmótico */
    materialsOf('membrana').forEach(m => {
      if (!m.color) return;
      if (!m.userData.__origColor) m.userData.__origColor = m.color.clone();
      const c = m.userData.__origColor.clone();
      if (o < -0.08) c.lerp(new THREE.Color(0x7ef0c8), Math.min(1, -o)*0.7);
      else if (o > 0.08) c.lerp(new THREE.Color(0xff7e7e), Math.min(1, o)*0.7);
      m.color.copy(c);
    });
  },
  tick(){},
  teardown(){
    RENDER.cellScaleK = 1;
    cellRoot.scale.setScalar(1);
    materialsOf('membrana').forEach(m => {
      if (m.userData.__origColor) m.color.copy(m.userData.__origColor);
    });
  }
};

/* ================== 3. EXPLORAR ORGANELAS (clique) ================== */
const simOrganelleClick = {
  title:'Explorar as organelas',
  mount(el){
    const quick = ['nucleo','mitocondria','re_rugoso','golgi','lisossomos','ribossomos','citoesqueleto','peroxissomos'];
    el.innerHTML = `
      <div class="ctrl-row">
        <div class="pill-btns" style="flex:1" id="orgQuick">
          ${quick.map(id => `<button data-org="${id}">${shortName(id)}</button>`).join('')}
        </div>
      </div>
      <div class="lab-note">
        Clique em qualquer estrutura no modelo 3D — ou use os atalhos acima — para abrir a ficha científica completa.
        Ative <b>◎ Isolar</b> na barra superior para estudar uma organela com as demais atenuadas.
      </div>`;
    el.querySelectorAll('[data-org]').forEach(b => {
      b.addEventListener('click', () => {
        if (typeof window.__cvSelect === 'function') window.__cvSelect(b.dataset.org, true);
      });
    });
  },
  apply(){},
  tick(){},
  teardown(){}
};
function shortName(id){
  const n = { nucleo:'Núcleo', mitocondria:'Mitocôndria', re_rugoso:'RE rugoso', golgi:'Golgi',
              lisossomos:'Lisossomos', ribossomos:'Ribossomos', citoesqueleto:'Citoesqueleto',
              peroxissomos:'Peroxissomos' };
  return n[id] || id;
}

/* ========================== 4. RESPIRAÇÃO =========================== */
const simRespiration = {
  title:'Simulador de respiração celular',
  mount(el){
    el.innerHTML = `
      <div class="ctrl-row">
        <div class="ctrl-col" style="min-width:190px">
          <label for="o2Slider">Disponibilidade de O₂ <b id="o2Val">60%</b></label>
          <input type="range" id="o2Slider" min="0" max="100" value="60" />
        </div>
        <div class="counter">
          <span class="num" id="atpNum">2</span><span class="unit">ATP / glicose</span>
        </div>
        <span class="status" id="respStatus">Aeróbia</span>
      </div>
      <div class="lab-note" id="respNote"></div>`;
    const s = q('#o2Slider');
    s.addEventListener('input', e => {
      state.o2 = Number(e.target.value)/100;
      this.apply();
    });
    this.apply();
  },
  apply(){
    const o2 = state.o2;
    const isProk = state.cellType === 'procarionte';
    const num = q('#atpNum'), st = q('#respStatus'), note = q('#respNote'), val = q('#o2Val');
    if (!num) return;

    /* rendimento teórico: 2 ATP (glicólise) + até 36 ATP (fosforilação oxidativa) */
    const atp = Math.round(2 + o2*36);
    num.textContent = String(atp);
    if (val) val.textContent = Math.round(o2*100) + '%';

    if (o2 >= 0.5){
      st.textContent = 'Aeróbia';
      st.className = 'status good';
      note.innerHTML = 'Com O₂ disponível, o piruvato entra na mitocôndria: ciclo de Krebs na matriz e <b>cadeia respiratória</b> na membrana interna. A quimiosmose pela <b>ATP sintase</b> gera até 36 ATP, além dos 2 da glicólise.';
    } else if (o2 >= 0.12){
      st.textContent = 'Aeróbia limitada';
      st.className = 'status';
      note.innerHTML = 'O₂ insuficiente: a cadeia respiratória fica limitada e a célula passa a complementar o ATP com <b>fermentação</b> no citosol.';
    } else {
      st.textContent = 'Anaeróbia (fermentação)';
      st.className = 'status bad';
      note.innerHTML = 'Sem O₂, o ciclo de Krebs e a cadeia respiratória param. Apenas a <b>glicólise</b> e a <b>fermentação lática</b> no citosol produzem ATP — saldo de apenas <b>2 ATP</b> por glicose.';
    }

    /* as mitocôndrias brilham conforme a atividade oxidativa */
    setEmissive('mitocondria', isProk ? 1 : 0.55 + o2*1.5);
    anim.atp.forEach(m => { m.visible = o2 >= 0.12; });
  },
  tick(){},
  teardown(){
    restoreEmissiveAll();
    anim.atp.forEach(m => { m.visible = true; });
  }
};

/* ========================= 5. CICLO CELULAR ========================= */
const CYCLE_PHASES = [
  { at:0.00, nome:'G1', desc:'Crescimento celular: a célula aumenta de tamanho e sintetiza RNA e proteínas. A cromatina permanece difusa.' },
  { at:0.26, nome:'S',  desc:'Duplicação do DNA: cada cromossomo passa a ter duas cromátides-irmãs. É o momento mais vulnerável a mutações.' },
  { at:0.46, nome:'G2', desc:'Preparação para a divisão: verificação da replicação e síntese das proteínas do fuso.' },
  { at:0.62, nome:'Prófase', desc:'A cromatina se condensa em cromossomos visíveis e o fuso mitótico começa a se formar a partir dos centrossomos.' },
  { at:0.74, nome:'Metáfase', desc:'Os cromossomos alinham-se no plano equatorial da célula, presos às fibras do fuso pelo centrômero.' },
  { at:0.84, nome:'Anáfase', desc:'As cromátides-irmãs se separam e migram para polos opostos, puxadas pelos microtúbulos do fuso.' },
  { at:0.92, nome:'Telófase', desc:'Os cromossomos se descondensam, o envelope nuclear se reorganiza e ocorre a citocinese, originando duas células idênticas.' }
];

const simCellCycle = {
  title:'Simulador do ciclo celular',
  mount(el){
    el.innerHTML = `
      <div class="ctrl-row">
        <div class="ctrl-col" style="min-width:190px">
          <label for="cycSlider">Fase do ciclo <b id="cycVal">G1</b></label>
          <input type="range" id="cycSlider" min="0" max="100" value="0" />
        </div>
        <span class="status" id="cycStatus">Interfase</span>
      </div>
      <div class="lab-note" id="cycNote">${CYCLE_PHASES[0].desc}</div>`;
    const s = q('#cycSlider');
    s.addEventListener('input', e => {
      state.cycle = Number(e.target.value)/100;
      this.apply();
    });
    this.apply();
  },
  apply(){
    const c = state.cycle;
    let phase = CYCLE_PHASES[0];
    for (const p of CYCLE_PHASES) if (c >= p.at) phase = p;

    const val = q('#cycVal'), st = q('#cycStatus'), note = q('#cycNote');
    if (val) val.textContent = phase.nome;
    if (note) note.textContent = phase.desc;
    if (st){
      const mitotic = ['Prófase','Metáfase','Anáfase','Telófase'].includes(phase.nome);
      st.textContent = mitotic ? 'Fase M (divisão)' : 'Interfase';
      st.className = 'status ' + (mitotic ? 'bad' : 'good');
    }

    /* condensa a cromatina na fase M e dissolve o nucléolo */
    const k = clamp((c - 0.58)/0.32, 0, 1);
    registry.chromatin.forEach((m, i) => {
      m.scale.setScalar(1 - k*0.22);
      m.position.multiplyScalar(1);
      const so = Math.sin(i*1.7)*k*0.5;
      m.position.set(so*0.3, so*0.4, so*0.2);
    });
    if (registry.nucleolus === undefined && groups.nucleusGroup){
      registry.nucleolus = groups.nucleusGroup.children.find(o => o.geometry && o.geometry.type === 'IcosahedronGeometry');
    }
    const nucleolus = registry.nucleolus;
    if (nucleolus){
      const b = nucleolus.userData.__base;
      nucleolus.visible = k < 0.75;
      nucleolus.scale.setScalar(1 - k*0.7);
    }
    /* fuso mitótico: microtúbulos do citoesqueleto ficam mais visíveis */
    materialsOf('citoesqueleto').forEach(m => {
      const base = matState.get(m);
      if (!base) return;
      m.opacity = clamp(base.opacity*(1 + k*0.5), 0, 1);
    });
  },
  tick(){},
  teardown(){
    registry.chromatin.forEach(m => { m.scale.setScalar(1); m.position.set(0,0,0); });
    if (registry.nucleolus){
      registry.nucleolus.visible = true;
      registry.nucleolus.scale.setScalar(1);
    }
    materialsOf('citoesqueleto').forEach(m => {
      const base = matState.get(m);
      if (base) m.opacity = base.opacity;
    });
  }
};

/* ========================= 6. FOTOSSÍNTESE ========================= */
const simPhotosynthesis = {
  title:'Simulador de fotossíntese',
  mount(el){
    el.innerHTML = `
      <div class="ctrl-row">
        <div class="ctrl-col" style="min-width:170px">
          <label for="lightSlider">Intensidade luminosa <b id="lightVal">50%</b></label>
          <input type="range" id="lightSlider" min="0" max="100" value="50" />
        </div>
        <div class="ctrl-col" style="min-width:150px">
          <label for="co2Slider">CO₂ disponível <b id="co2Val">50%</b></label>
          <input type="range" id="co2Slider" min="0" max="100" value="50" />
        </div>
        <span class="status" id="photoStatus">Fase clara ativa</span>
      </div>
      <div class="lab-note" id="photoNote"></div>`;
    const ls = q('#lightSlider'), cs = q('#co2Slider');
    ls.addEventListener('input', e => { state.light = Number(e.target.value)/100; this.apply(); });
    cs.addEventListener('input', e => { state.co2 = Number(e.target.value)/100; this.apply(); });
    ls.value = Math.round(state.light*100);
    cs.value = Math.round(state.co2*100);
    this.apply();
  },
  apply(){
    /* fotossíntese exige célula vegetal */
    if (state.cellType !== 'vegetal'){
      setCellType('vegetal');
      applyCellTypeVisibility();
      refreshListAvailability();
      document.querySelectorAll('#labContent [data-ct]').forEach(b => b.classList.remove('active'));
      if (window.__cvSelect) window.__cvSelect('cloroplasto', false);
    }
    const L = state.light, C = state.co2 === undefined ? 0.5 : state.co2;
    const st = q('#photoStatus'), note = q('#photoNote');
    const lv = q('#lightVal'), cv = q('#co2Val');
    if (lv) lv.textContent = Math.round(L*100) + '%';
    if (cv) cv.textContent = Math.round(C*100) + '%';
    if (!st) return;

    if (L < 0.05){
      st.textContent = 'Sem luz';
      st.className = 'status bad';
      note.innerHTML = 'Sem energia luminosa não há <b>fotólise da água</b> nos tilacoides: a fase clara para, e sem ATP e NADPH o Ciclo de Calvin também para.';
    } else if (L < 0.5){
      st.textContent = 'Fotossíntese limitada pela luz';
      st.className = 'status';
      note.innerHTML = 'A fase clara produz ATP e NADPH, mas em quantidade limitada. A produção de O₂ e de glicose cresce com a intensidade luminosa.';
    } else if (C < 0.2){
      st.textContent = 'Limitada pelo CO₂';
      st.className = 'status';
      note.innerHTML = '<b>Ponto de saturação luminosa:</b> aumentar mais a luz não eleva a fotossíntese, porque falta CO₂ para a <b>RuBisCO</b> fixar no Ciclo de Calvin (estroma).';
    } else {
      st.textContent = 'Fotossíntese plena';
      st.className = 'status good';
      note.innerHTML = 'Fase clara nos tilacoides (produção de ATP, NADPH e <b>O₂ a partir da água</b>) e fase escura no estroma (fixação de CO₂ pelo Ciclo de Calvin) operando em conjunto.';
    }

    /* cloroplastos brilham conforme a luz — exceto quando limitados por CO₂ */
    const eff = Math.min(L, 0.25 + C*0.9);
    setEmissive('cloroplasto', 0.35 + eff*1.6);
    registry.chloroRefs.forEach(g => {
      g.scale.setScalar(1 + eff*0.07);
    });
  },
  tick(){},
  teardown(){
    restoreEmissiveAll();
    registry.chloroRefs.forEach(g => g.scale.setScalar(1));
  }
};

/* =========================== 7. JUNÇÕES ============================= */
const simJunctions = {
  title:'Junções celulares e adesão',
  mount(el){
    el.innerHTML = `
      <div class="ctrl-row">
        <div class="pill-btns" style="flex:1">
          <button data-j="desmossomo">Desmossomo</button>
          <button data-j="gap">Junção gap</button>
          <button data-j="tight">Junção de oclusão</button>
          <button data-j="none" class="active">Ocultar</button>
        </div>
      </div>
      <div class="lab-note" id="jNote">
        Selecione um tipo de junção para destacá-la no modelo. As junções ficam na periferia da célula, conectando-a a células vizinhas.
      </div>`;
    el.querySelectorAll('[data-j]').forEach(b => b.addEventListener('click', () => {
      el.querySelectorAll('[data-j]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.junctionType = b.dataset.j === 'none' ? null : b.dataset.j;
      this.apply();
    }));
    this.apply();
  },
  apply(){
    const t = state.junctionType;
    const jg = groups.junctionGroup;
    if (jg) jg.visible = !!t;
    registry.junctionRefs.forEach(g => {
      g.visible = !t || g.userData.__junctionType === t;
    });
    const note = q('#jNote');
    if (!note) return;
    const texts = {
      desmossomo:'<b>Desmossomos</b> são placas de adesão que ancoram filamentos intermediários e resistem ao atrito mecânico — abundantes na epiderme. Doenças autoimunes contra eles causam pênfigo.',
      gap:'<b>Junções gap</b> (comunicantes) são canais de conexina que permitem a passagem direta de íons e pequenas moléculas. No músculo cardíaco, fazem o tecido se comportar como um sincício funcional.',
      tight:'<b>Junções de oclusão</b> vedam o espaço intercelular, impedindo o vazamento entre células — essenciais no epitélio intestinal e na barreira hematoencefálica.'
    };
    if (t){
      note.innerHTML = texts[t];
      /* isola visualmente as junções */
      state.isolate = true;
      state.selectedId = 'juncoes';
      applyIsolate();
      if (typeof window.__cvSelect === 'function') window.__cvSelect('juncoes', false);
    } else {
      note.innerHTML = 'Selecione um tipo de junção para destacá-la no modelo. As junções ficam na periferia da célula, conectando-a a células vizinhas.';
      state.isolate = false;
      applyIsolate();
    }
  },
  tick(){},
  teardown(){
    state.isolate = false;
    applyIsolate();
    if (groups.junctionGroup) groups.junctionGroup.visible = false;
  }
};

/* ====================== 8. DIFERENCIAÇÃO E MORTE ==================== */
const simDifferentiation = {
  title:'Diferenciação e morte celular',
  mount(el){
    el.innerHTML = `
      <div class="ctrl-row">
        <div class="pill-btns" style="flex:1">
          <button data-d="toti">Totipotente</button>
          <button data-d="pluri">Pluripotente</button>
          <button data-d="multi">Multipotente</button>
          <button data-d="diferenciada" class="active">Diferenciada</button>
        </div>
      </div>
      <div class="ctrl-row" style="margin-top:10px">
        <div class="ctrl-col">
          <label for="apoSlider">Apoptose <b id="apoVal">0%</b></label>
          <input type="range" id="apoSlider" min="0" max="100" value="0" />
        </div>
        <span class="status" id="apoStatus">Célula viável</span>
      </div>
      <div class="lab-note" id="diffNote"></div>`;
    el.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => {
      el.querySelectorAll('[data-d]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      this.potency = b.dataset.d;
      this.apply();
    }));
    const s = q('#apoSlider');
    s.addEventListener('input', e => {
      state.apoptosis = Number(e.target.value)/100;
      this.apply();
    });
    this.potency = 'diferenciada';
    this.apply();
  },
  apply(){
    const a = state.apoptosis;
    const note = q('#diffNote'), st = q('#apoStatus'), val = q('#apoVal');
    if (val) val.textContent = Math.round(a*100) + '%';

    const potTexts = {
      toti:'<b>Totipotente:</b> como o zigoto — pode originar qualquer tecido do organismo e também os anexos embrionários (placenta, âmnio).',
      pluri:'<b>Pluripotente:</b> célula-tronco embrionária — origina os três folhetos germinativos (ectoderma, mesoderma, endoderma), mas não os anexos embrionários.',
      multi:'<b>Multipotente:</b> célula-tronco adulta, como as da medula óssea — origina apenas linhagens específicas (ex.: células sanguíneas).',
      diferenciada:'<b>Diferenciada:</b> expressa um conjunto restrito de genes, o que define sua forma e função especializadas — neurônio, hemácia, célula muscular.'
    };

    if (st){
      if (a < 0.15){ st.textContent = 'Célula viável'; st.className = 'status good'; }
      else if (a < 0.6){ st.textContent = 'Fragmentação inicial'; st.className = 'status'; }
      else { st.textContent = 'Apoptose'; st.className = 'status bad'; }
    }
    if (note){
      note.innerHTML = potTexts[this.potency] + (a >= 0.15
        ? '<br><br>A <b>apoptose</b> é morte programada: o DNA se fragmenta, a célula forma corpos apoptóticos e a membrana permanece íntegra, de modo que <b>não há inflamação</b>. Diferente da necrose, que rompe a membrana e inflama o tecido.'
        : '');
    }

    /* efeito 3D: retração e perda de definição da membrana */
    cellRoot.scale.setScalar(1 - a*0.10);
    materialsOf('membrana').forEach(m => {
      const base = matState.get(m);
      if (!base) return;
      m.opacity = Math.max(0.01, base.opacity*(1 - a*0.6));
    });
    const nucleo = ORGANELLE_INDEX['nucleo'];
    if (nucleo && nucleo.nodes[0]){
      nucleo.nodes[0].group.scale.setScalar(1 - a*0.18);
    }
  },
  tick(){},
  teardown(){
    cellRoot.scale.setScalar(RENDER.cellScaleK || 1);
    materialsOf('membrana').forEach(m => {
      const base = matState.get(m);
      if (base){ m.opacity = base.opacity; }
    });
    const nucleo = ORGANELLE_INDEX['nucleo'];
    if (nucleo && nucleo.nodes[0]) nucleo.nodes[0].group.scale.setScalar(1);
  }
};

/* ============================= 9. VÍRUS ============================= */
const simVirus = {
  title:'Replicação viral',
  mount(el){
    el.innerHTML = `
      <div class="ctrl-row">
        <div class="pill-btns" style="flex:1">
          <button data-v="litic" class="active">Ciclo lítico</button>
          <button data-v="lisogenic">Ciclo lisogênico</button>
          <button data-v="none">Ocultar vírus</button>
        </div>
        <span class="status" id="virusStatus">Ciclo lítico</span>
      </div>
      <div class="lab-note" id="virusNote"></div>`;
    el.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => {
      el.querySelectorAll('[data-v]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.virus = b.dataset.v === 'none' ? null : b.dataset.v;
      this.apply();
    }));
    this.apply();
  },
  apply(){
    const v = state.virus;
    const vg = groups.virusGroup;
    if (vg) vg.visible = !!v;
    registry.virus.forEach(r => { r.group.visible = !!v; });

    const st = q('#virusStatus'), note = q('#virusNote');
    if (!st) return;

    if (v === 'litic'){
      st.textContent = 'Ciclo lítico';
      st.className = 'status bad';
      note.innerHTML = '<b>Ciclo lítico:</b> adsorção → penetração → desnudamento → replicação → montagem → <b>lise</b> e liberação. A célula hospedeira morre ao final do ciclo.';
      registry.virus.forEach((r, i) => { r.group.scale.setScalar(1); });
    } else if (v === 'lisogenic'){
      st.textContent = 'Ciclo lisogênico';
      st.className = 'status';
      note.innerHTML = '<b>Ciclo lisogênico:</b> o DNA viral integra-se ao genoma da célula hospedeira formando o <b>prófago</b>, que é replicado junto com o DNA celular por muitas gerações, sem matar a célula.';
      registry.virus.forEach(r => { r.group.scale.setScalar(0.55); });
    } else {
      st.textContent = 'Vírus ocultos';
      st.className = 'status';
      note.innerHTML = 'Os vírus são <b>acelulares</b>: capsídeo proteico + material genético (DNA ou RNA), sem membrana plasmática, citoplasma, ribossomos ou metabolismo próprio. São parasitas intracelulares obrigatórios.';
    }
  },
  tick(){},
  teardown(){
    if (groups.virusGroup) groups.virusGroup.visible = false;
    registry.virus.forEach(r => { r.group.visible = false; });
  }
};

/* ================== 10. OBSERVAÇÃO MOLECULAR (nível 4) ============== */
const simMolecular = {
  title:'Bicamada lipídica e proteínas de membrana',
  mount(el){
    el.innerHTML = `
      <div class="ctrl-row">
        <div class="pill-btns" style="flex:1">
          <button id="molOn">Mostrar detalhe molecular</button>
          <button id="molOff" class="active">Ocultar</button>
        </div>
        <span class="status" id="molStatus">Detalhe oculto</span>
      </div>
      <div class="lab-note">
        Em <b>nível molecular ilustrativo</b>, a representação é esquemática: as cabeças polares dos fosfolipídios aparecem como esferas nas duas faces da bicamada, e as proteínas integrais atravessam a membrana. Não há proporção de escala real entre esta vista e o nível celular.
      </div>`;
    q('#molOn').addEventListener('click', () => {
      state.showMolecular = true;
      q('#molStatus').textContent = 'Detalhe molecular visível';
      q('#molOn').classList.add('active'); q('#molOff').classList.remove('active');
      if (registry.molHeads) registry.molHeads.forEach(h => { h.visible = true; });
      const cb = document.getElementById('cbMolec');
      if (cb) cb.checked = true;
    });
    q('#molOff').addEventListener('click', () => {
      state.showMolecular = false;
      q('#molStatus').textContent = 'Detalhe oculto';
      q('#molOff').classList.add('active'); q('#molOn').classList.remove('active');
      if (registry.molHeads) registry.molHeads.forEach(h => { h.visible = false; });
      const cb = document.getElementById('cbMolec');
      if (cb) cb.checked = false;
    });
  },
  apply(){},
  tick(){},
  teardown(){}
};

/* ----------------------------- REGISTRO ---------------------------- */
export const SIMULATORS = {
  'cell-compare':simCellCompare,
  'osmosis':simOsmosis,
  'organelle-click':simOrganelleClick,
  'respiration':simRespiration,
  'cell-cycle':simCellCycle,
  'photosynthesis':simPhotosynthesis,
  'junctions':simJunctions,
  'differentiation':simDifferentiation,
  'virus':simVirus,
  'molecular':simMolecular
};

export { restoreEmissiveAll, setEmissive };