import { SCIENCE, ORG_ORDER, isAvailable } from '../dados/citologia.js';
import { MODULES } from '../dados/modulos.js';
import { TRILHAS, TRILHA_ORDER, INCIDENCIA, resolveUnidade, unidadesDaTrilha } from '../dados/trilhas.js';
import { state, ORGANELLE_INDEX } from '../nucleo/estado.js';

/* =====================================================================
   PARTE 9 — INTERFACE: lista, ficha científica, escala, teoria, questões
   ===================================================================== */

export const dom = {
  orgList:document.getElementById('orgList'),
  ficha:document.getElementById('ficha'),
  searchInput:document.getElementById('searchInput'),
  scaleBar:document.getElementById('scaleBar'),
  scaleLabel:document.getElementById('scaleLabel'),
  lvlText:document.getElementById('lvlText'),
  lvlDesc:document.getElementById('lvlDesc'),
  zoomPill:document.getElementById('zoomPill'),
  questionCard:document.getElementById('questionCard'),
  qText:document.getElementById('qText'),
  qAlts:document.getElementById('qAlts'),
  qFeedback:document.getElementById('qFeedback'),
  aulaNum:document.getElementById('aulaNum'),
  aulaTitle:document.getElementById('aulaTitle'),
  aulaSub:document.getElementById('aulaSub'),
  aulaTheory:document.getElementById('aulaTheory'),
  labTitle:document.getElementById('labTitle'),
  labContent:document.getElementById('labContent'),
  labControls:document.getElementById('labControls'),
  disclaimer:document.getElementById('disclaimerPill')
};

const LEVEL_INFO = { 1:'Visão celular', 2:'Visão subcelular', 3:'Visão estrutural', 4:'Visão molecular ilustrativa' };
export const LEVEL_DESC = LEVEL_INFO;

let lastScaleText = '';

/* ------------------------- lista de estruturas --------------------- */
export function buildOrganelleList(){
  dom.orgList.innerHTML = '';
  ORG_ORDER.forEach(id => {
    const d = SCIENCE[id];
    if (!d) return;
    const btn = document.createElement('button');
    btn.className = 'org-item';
    btn.dataset.id = id;
    const hex = d.cor.toString(16).padStart(6, '0');
    btn.innerHTML = `<span class="org-swatch" style="background:#${hex};color:#${hex}"></span><span class="nm">${d.nome}</span>`;
    btn.addEventListener('click', () => {
      if (typeof window.__cvSelect === 'function') window.__cvSelect(id, true);
    });
    dom.orgList.appendChild(btn);
  });
  refreshListAvailability();
}

/* esconde estruturas ausentes no tipo celular atual */
export function refreshListAvailability(){
  [...dom.orgList.children].forEach(btn => {
    const id = btn.dataset.id;
    btn.style.display = isAvailable(id, state.cellType) ? '' : 'none';
  });
}

export function setActiveListItem(id){
  [...dom.orgList.children].forEach(b => b.classList.toggle('active', b.dataset.id === id));
}

export function filterList(q){
  const query = (q || '').trim().toLowerCase();
  [...dom.orgList.children].forEach(btn => {
    const id = btn.dataset.id;
    const d = SCIENCE[id];
    if (!d) return;
    if (!isAvailable(id, state.cellType)){ btn.style.display = 'none'; return; }
    if (!query){ btn.style.display = ''; return; }
    const hay = [d.nome, d.tipo, d.funcao, d.anatomia, (d.processos || []).join(' '), (d.curiosidades || []).join(' ')]
      .join(' ').toLowerCase();
    btn.style.display = hay.includes(query) ? '' : 'none';
  });
}

/* --------------------------- ficha científica ---------------------- */
export function renderFicha(id){
  const d = SCIENCE[id];
  if (!d){
    dom.ficha.innerHTML = `
      <div class="empty-ficha">
        <div class="big">🔬</div>
        <p>Selecione uma estrutura celular no modelo 3D ou na lista lateral para abrir sua ficha científica completa.</p>
        <p style="font-size:11px; opacity:.75">Cada ficha traz anatomia, composição, função, processos, relações, curiosidades, consequências funcionais e escala aproximada.</p>
      </div>`;
    return;
  }
  const li = arr => `<ul>${arr.map(x => `<li>${x}</li>`).join('')}</ul>`;
  const hex = d.cor.toString(16).padStart(6, '0');

  /* bloco de comparação estrutural (modo ⇋ Comparar) */
  let comparison = '';
  const otherId = state.compareWith;
  if (otherId && otherId !== id && SCIENCE[otherId]){
    const o = SCIENCE[otherId];
    const ohex = o.cor.toString(16).padStart(6, '0');
    const rows = [
      ['Estrutura fixada', `<span class="cmp-dot" style="background:#${ohex}"></span>${o.nome}`, `<span class="cmp-dot" style="background:#${hex}"></span>${d.nome}`],
      ['Classificação', o.tipo, d.tipo],
      ['Escala aproximada', o.escala, d.escala],
      ['Função principal', o.funcao, d.funcao]
    ];
    comparison = `
      <div class="ficha-sec cmp-sec">
        <h3>Comparação estrutural</h3>
        <div class="cmp-grid">
          <div class="cmp-head"><span>Critério</span><span>Estrutura fixada</span><span>Selecionada</span></div>
          ${rows.map(r => `<div class="cmp-row"><span class="crit">${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span></div>`).join('')}
        </div>
      </div>`;
  }

  dom.ficha.innerHTML = `
    <div class="ficha-head">
      <span class="chip">${d.tipo}</span>
      <h2><span class="h-dot" style="background:#${hex};color:#${hex}"></span>${d.nome}</h2>
      <div class="escala">📏 <strong>Escala aproximada:</strong> ${d.escala}</div>
    </div>
    ${comparison}
    <div class="ficha-sec"><h3>Descrição anatômica</h3><p>${d.anatomia}</p></div>
    ${d.localizacao ? `<div class="ficha-sec"><h3>Localização celular</h3><p>${d.localizacao}</p></div>` : ''}
    <div class="ficha-sec"><h3>Características estruturais observáveis</h3>${li(d.estruturais)}</div>
    <div class="ficha-sec"><h3>Composição e organização geral</h3><p>${d.composicao}</p></div>
    <div class="ficha-sec"><h3>Função biológica</h3><p>${d.funcao}</p></div>
    <div class="ficha-sec"><h3>Processos celulares dos quais participa</h3>${li(d.processos)}</div>
    <div class="ficha-sec"><h3>Relação com outras estruturas</h3><p>${d.relacoes}</p></div>
    <div class="ficha-sec"><h3>Curiosidades científicas</h3>${li(d.curiosidades)}</div>
    <div class="ficha-sec"><h3>Consequências funcionais</h3><p>${d.consequencias}</p></div>
    <div class="tagline">
      <span class="tag">Reconstrução didática</span>
      <span class="tag">Escala aproximada</span>
      <span class="tag">${state.cellType === 'vegetal' ? 'Célula eucariótica vegetal' : state.cellType === 'procarionte' ? 'Célula procariótica' : 'Célula eucariótica animal'}</span>
    </div>
    <div class="ficha-actions">
      <button class="ficha-btn" id="cmpPin">${state.compareWith === id ? '📌 Estrutura fixada' : '📌 Fixar para comparar'}</button>
      <button class="ficha-btn" id="cmpClear" ${state.compareWith ? '' : 'disabled'}>✕ Limpar comparação</button>
    </div>`;
  const panel = dom.ficha.parentElement;
  if (panel) panel.scrollTop = 0;

  const pinBtn = document.getElementById('cmpPin');
  const clearBtn = document.getElementById('cmpClear');
  if (pinBtn){
    pinBtn.addEventListener('click', () => {
      state.compareWith = state.compareWith === id ? null : id;
      if (window.__cvSetPinned) window.__cvSetPinned(state.compareWith);
      renderFicha(id);
    });
    pinBtn.classList.toggle('active', state.compareWith === id);
  }
  if (clearBtn){
    clearBtn.addEventListener('click', () => {
      state.compareWith = null;
      if (window.__cvSetPinned) window.__cvSetPinned(null);
      renderFicha(id);
    });
  }
}

/* ------------------------------ escala ----------------------------- */
export function updateScaleBar(camera, controls, viewport, force){
  if (!camera || !controls || !viewport) return;
  const h = viewport.clientHeight || 1;
  const dist = camera.position.distanceTo(controls.target);
  const worldHeight = 2*Math.tan((camera.fov*Math.PI/180)/2)*dist;
  const worldPerPx = worldHeight/h;

  const targetPx = 110;
  const rawLen = worldPerPx*targetPx;
  const pow = Math.pow(10, Math.floor(Math.log10(Math.max(rawLen, 1e-9))));
  const candidates = [1, 2, 5, 10].map(n => n*pow);
  const nice = candidates.find(c => c >= rawLen) || pow*10;
  const px = Math.max(30, Math.min(200, nice/worldPerPx));

  const label = nice >= 1
    ? `${nice % 1 === 0 ? nice : nice.toFixed(1)} μm`
    : `${(nice*1000).toFixed(0)} nm`;

  if (force || label !== lastScaleText){
    lastScaleText = label;
    dom.scaleBar.style.width = px + 'px';
    dom.scaleLabel.innerHTML = `${label}<small>barra de referência aproximada</small>`;
  }

  /* nível de observação derivado da distância da câmera */
  const level = dist > 26 ? 1 : dist > 14 ? 2 : dist > 6 ? 3 : 4;
  if (dom.lvlText.dataset.lvl !== String(level)){
    dom.lvlText.dataset.lvl = String(level);
    dom.lvlText.textContent = 'Nível ' + level;
    dom.lvlDesc.textContent = LEVEL_INFO[level];
    [...document.querySelectorAll('#levelList .org-item')].forEach(b => {
      b.classList.toggle('active', b.dataset.level === String(level));
    });
    /* aviso metodológico muda conforme o nível */
    if (level === 4){
      dom.disclaimer.textContent = 'Nível molecular ilustrativo e esquemático. Sem proporção de escala real em relação aos níveis 1 a 3.';
    } else if (level === 3){
      dom.disclaimer.textContent = 'Nível estrutural: detalhes internos ampliados de forma didática. Escalas aproximadas.';
    } else {
      dom.disclaimer.textContent = 'Reconstrução didática tridimensional. Escalas, proporções e velocidades são aproximadas e qualificadas.';
    }
  }
  dom.zoomPill.textContent = `Distância: ${dist.toFixed(1)} μm`;
  return level;
}

/* --------------------------- teoria (aula) ------------------------- */
export function renderTheory(modId){
  const u = resolveUnidade(modId);
  if (!u) return;

  dom.aulaNum.textContent = u.rotulo || ('Módulo ' + modId);
  dom.aulaTitle.textContent = (u.icone ? u.icone + ' ' : '') + u.titulo;
  dom.aulaSub.textContent = u.subtitulo || '';

  /* cartão de incidência ENEM × UNICAMP, quando o tema traz o dado */
  const inc = u.incidencia
    ? `<div class="inc-card">
        <h4>📊 Incidência nos vestibulares</h4>
        <div class="inc-grid">
          <div class="inc-cell"><div class="k">ENEM</div><div class="v enem">${u.incidencia.enem || '—'}</div></div>
          <div class="inc-cell"><div class="k">UNICAMP</div><div class="v uni">${u.incidencia.unicamp || '—'}</div></div>
          <div class="inc-cell"><div class="k">Relevância</div><div class="v">${u.incidencia.peso || '—'}</div></div>
        </div>
        ${u.incidencia.nota ? `<div class="inc-note">${u.incidencia.nota}</div>` : ''}
      </div>`
    : '';

  dom.aulaTheory.innerHTML = inc + u.teoria.map(b => {
    const body = b.p ? `<p>${b.p}</p>` : '';
    const list = b.u ? `<ul>${b.u.map(x => `<li>${x}</li>`).join('')}</ul>` : '';
    return `<div class="theory-block"><h4>${b.h}</h4>${body}${list}</div>`;
  }).join('');
}

/* --------------------------- questão ------------------------------- */
export function renderQuestion(modId){
  const u = resolveUnidade(modId);
  if (!u || !u.questao) return;

  const fonte = u.questao.fonte
    ? `<span class="q-fonte">📝 Estilo ${u.questao.fonte}</span><br>` : '';

  dom.qText.innerHTML = fonte + u.questao.texto;
  dom.qFeedback.innerHTML = '';
  dom.qAlts.innerHTML = '';

  const letters = ['A', 'B', 'C', 'D', 'E'];
  u.questao.alts.forEach((alt, i) => {
    const b = document.createElement('button');
    b.className = 'alt-btn';
    b.innerHTML = `<span class="letter">${letters[i]}</span><span>${alt.t}</span>`;
    b.addEventListener('click', () => answerQuestion(modId, i, b));
    dom.qAlts.appendChild(b);
  });
}

function answerQuestion(modId, idx, btn){
  const u = resolveUnidade(modId);
  if (!u) return;
  const alts = u.questao.alts;
  const chosen = alts[idx];
  if (!chosen) return;

  const buttons = [...dom.qAlts.children];
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (alts[i].c) b.classList.add('correct');
  });
  if (!chosen.c) btn.classList.add('wrong');

  const correct = alts.find(a => a.c);
  dom.qFeedback.innerHTML = chosen.c
    ? `<div class="q-feedback">✅ <b>Resposta correta.</b><br>${chosen.fb || ''}</div>`
    : `<div class="q-feedback wrong">❌ <b>Resposta incorreta.</b> A alternativa correta é a letra <b>${'ABCDE'[alts.indexOf(correct)]}</b>.<br>${correct.fb || ''}</div>
       <button class="q-reset" id="qReset">↺ Tentar novamente</button>`;

  const reset = document.getElementById('qReset');
  if (reset) reset.addEventListener('click', () => renderQuestion(modId));
}

/* ------------------------ barras de trilha ------------------------- */
export function buildTrilhaBar(){
  const bar = document.getElementById('trilhaBar');
  if (!bar) return;
  bar.querySelectorAll('.tr-btn').forEach(b => { b.remove(); });
  TRILHA_ORDER.forEach(id => {
    const t = TRILHAS[id];
    const b = document.createElement('button');
    b.className = 'tr-btn' + (state.trilha === id ? ' active' : '');
    b.dataset.trilha = id;
    b.setAttribute('aria-selected', String(state.trilha === id));
    b.innerHTML = `<span class="ic">${t.icone || '•'}</span>${t.nome}`;
    bar.insertBefore(b, document.getElementById('trilhaInfo'));
  });
}

export function setTrilhaBarActive(trilhaId){
  document.querySelectorAll('#trilhaBar .tr-btn').forEach(b => {
    const on = b.dataset.trilha === trilhaId;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
  });
  const t = TRILHAS[trilhaId];
  const info = document.getElementById('trilhaInfo');
  if (info && t) info.textContent = t.descricao || t.nome;
}

/* reconstrói a barra de módulos conforme a trilha ativa */
export function buildModuleBar(){
  const bar = document.getElementById('moduleBar');
  if (!bar) return;
  bar.querySelectorAll('.mod-btn').forEach(b => { b.remove(); });

  const unidades = unidadesDaTrilha(state.trilha);
  unidades.forEach(u => {
    if (!u) return;
    const b = document.createElement('button');
    b.className = 'mod-btn' + (String(u.key) === String(state.currentModule) ? ' active' : '');
    b.dataset.mod = u.key;
    b.innerHTML = `<span class="num">${u.rotulo || ''}</span><span class="ttl">${u.titulo}</span>`;
    bar.appendChild(b);
  });
}

/* --------------------------- barra de módulos ---------------------- */
export function setModuleBarActive(modId){
  document.querySelectorAll('#moduleBar .mod-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mod === String(modId));
  });
}

/* --------------------------- modo (explorar/aula) ------------------ */
export function setUIMode(mode){
  state.mode = mode;
  const isAula = mode === 'aula';
  document.body.classList.toggle('aula', isAula);
  document.getElementById('modeExplore').classList.toggle('active', !isAula);
  document.getElementById('modeAula').classList.toggle('active', isAula);
  document.getElementById('modeExplore').setAttribute('aria-selected', String(!isAula));
  document.getElementById('modeAula').setAttribute('aria-selected', String(isAula));

  dom.questionCard.classList.toggle('show', isAula);
  if (!isAula){
    dom.labControls.classList.remove('show');
  }
}