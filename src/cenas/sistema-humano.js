import * as THREE from 'three';

/* =====================================================================
   CENA 3D — FISIOLOGIA HUMANA (ENEM / Unicamp)
   ---------------------------------------------------------------------
   Esquema anatômico didático, legível a ~28 unidades de distância e
   contido em um raio de ~14 unidades em torno da origem.

   CONVENÇÃO DE NOMES (obrigatória neste projeto):
   o build concatena TODOS os arquivos em um único escopo de módulo, logo
   todo nome de nível superior começa com `hum` ou `HUM_`.

   ROTEIRO FISIOLÓGICO
   1. Coração com quatro câmaras: lado DIREITO recebe sangue VENOSO
      (azul, rico em CO2) e lado ESQUERDO ejeta sangue ARTERIAL
      (vermelho, rico em O2).
   2. Pequena circulação: ventrículo direito -> pulmões -> átrio esquerdo.
      Grande circulação: ventrículo esquerdo -> tecidos -> átrio direito.
   3. Pulmões com alvéolos que ventilam; a ventilação cresce quando o O2
      cai e, sobretudo, quando o CO2 sobe (resposta à HIPERCAPNIA).
   4. Hematose por DIFUSÃO SIMPLES e efeito Bohr sobre a hemoglobina.
   5. Néfron com filtração glomerular, reabsorção tubilar, ADH e
      aldosterona.
   6. Sistema nervoso condutor com condução saltatória nos nódulos de
      Ranvier.
   ===================================================================== */

/* ----------------------------- PARÂMETROS ---------------------------- */
export const humParams = {
  oxigenio: 0.8,   // 0..1 O2 disponível
  hidratacao: 0.6, // 0..1 hidratação / volume plasmático
  fc: 0.7,         // 0..1 frequência cardíaca relativa
  co2: 0.3,        // 0..1 CO2 nos tecidos
  ph: 0.5          // 0..1 pH relativo (0 = acidose, 1 = alcalose relativa)
};

/* ------------------------------- RAÍZES ------------------------------ */
export const humRoot = new THREE.Group();
humRoot.visible = false;
humRoot.name = 'sistema-humano';

const humCoracao = new THREE.Group();
const humPulmoes = new THREE.Group();
const humVasos = new THREE.Group();
const humNefron = new THREE.Group();
const humNervo = new THREE.Group();
const humPainel = new THREE.Group();
humRoot.add(humCoracao, humPulmoes, humVasos, humNefron, humNervo, humPainel);

/* ---------------------------------------------------------------------
   PALETA (saturada x dessaturada)
   Vermelho-vivo : hemoglobina SATURADA de O2 (sangue arterial).
   Vinho-escuro  : hemoglobina DESSATURADA (sangue venoso).
   Azul          : esquema clássico do sangue venoso.

   OBSERVAÇÃO FISIOLÓGICA IMPORTANTE: a cor depende da SATURAÇÃO da
   hemoglobina, não do tipo de vaso. As ARTÉRIAS são sempre vasos
   EFERENTES (levam sangue PARA LONGE do coração); por isso a ARTÉRIA
   PULMONAR transporta sangue VENOSO (azul, dessaturado) e as VEIAS
   PULMONARES transportam sangue ARTERIAL (vermelho, saturado).
   --------------------------------------------------------------------- */
const HUM_VERMELHO_RICO = 0xd8322c;
const HUM_VERMELHO_ART = 0xcf2b26;
const HUM_VINHO = 0x5c1224;
const HUM_AZUL = 0x2f6fd0;
const HUM_ROSADO = 0xe9a8ae;

/* Cores constantes pré-alocadas: nunca são mutadas, apenas lidas. */
const humCorVermelhoRico = new THREE.Color(HUM_VERMELHO_RICO);
const humCorVermelhoArt = new THREE.Color(HUM_VERMELHO_ART);
const humCorVinho = new THREE.Color(HUM_VINHO);
const humCorAzul = new THREE.Color(HUM_AZUL);
const humCorAr = new THREE.Color(0x9fd8ff);
const humCorFiltrado = new THREE.Color(0xffe08a);
const humCorUrina = new THREE.Color(0xd88a1e);
const humCorReabsorvido = new THREE.Color(0x8fe6ff);

/* Cores de trabalho (rascunho) e vetores/matrizes reutilizados por quadro. */
const humC0 = new THREE.Color();
const humC1 = new THREE.Color();
const humC2 = new THREE.Color();
const humVA = new THREE.Vector3();
const humVB = new THREE.Vector3();
const humVC = new THREE.Vector3();
const humV3Escala = new THREE.Vector3();
const humDummy = new THREE.Object3D();

/* --------------------------- ESTADO DA CENA -------------------------- */
const humRefs = {
  /* coração */
  coracaoCorpo: null, paredeD: null, paredeE: null,
  atrioD: null, atrioE: null, ventD: null, ventE: null,
  /* vasos */
  aorta: null, aortaBaseY: [], veiaCava: null, pulmArt: null, veiaPulm: null,
  capilares: null, rotaPequena: null, rotaGrande: null,
  /* pulmões */
  alvD: null, alvE: null, facesAlv: [], rotasHematose: [],
  hemacias: [], hemaciasMat: [],
  /* néfron */
  nefronBase: null, tubulo: null, tubuloBase: [],
  capilarPeritub: null, rotaFiltrado: null, rotaReabsorcao: null,
  /* nervo */
  rotaNervo: null, potenciais: [],
  /* painel */
  anel: null, anel2: null, dial: null, dialMat: null,
  barraCO2: null, barraAgua: null,
  /* partículas instanciadas */
  partAzuis: null, partVermelhas: null, partAr: null,
  partO2: null, partFiltrado: null, partReabsorvido: null,
  rotaAr: null,
  /* cores persistentes derivadas dos parâmetros (sem alocação por quadro) */
  corArterial: new THREE.Color(HUM_VERMELHO_ART),
  corVenosa: new THREE.Color(HUM_AZUL),
  corHemacia: new THREE.Color(HUM_VERMELHO_RICO),
  /* valores derivados (preenchidos em humApply) */
  freqCard: 1.9, amplCard: 0.075, velNervo: 0.6, driveResp: 1,
  taxaFiltracao: 0.75, taxaReabsorcao: 0.6
};

const humAnim = {
  t: 0, ciclo: 0, resp: 0, nervo: 0, filtrado: 0, reabsorcao: 0
};

/* ---------------------------------------------------------------------
   MATERIAIS COMPARTILHADOS
   --------------------------------------------------------------------- */
const humMatParede = new THREE.MeshStandardMaterial({
  color: 0xa83a34, roughness: 0.52, metalness: 0.03,
  transparent: true, opacity: 0.34, depthWrite: false, side: THREE.DoubleSide
});
const humMatSepto = new THREE.MeshStandardMaterial({
  color: 0xf2c9c6, roughness: 0.55, metalness: 0.02,
  transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide
});
const humMatVenoso = new THREE.MeshStandardMaterial({
  color: HUM_AZUL, roughness: 0.32, metalness: 0.10,
  emissive: 0x0d2a5c, emissiveIntensity: 0.60,
  transparent: true, opacity: 0.85
});
const humMatArterial = new THREE.MeshStandardMaterial({
  color: HUM_VERMELHO_ART, roughness: 0.32, metalness: 0.10,
  emissive: 0x5c1008, emissiveIntensity: 0.60,
  transparent: true, opacity: 0.85
});
const humMatCapilar = new THREE.MeshStandardMaterial({
  color: 0xcf8ab4, roughness: 0.50, metalness: 0.05,
  emissive: 0x3d1c33, emissiveIntensity: 0.35,
  transparent: true, opacity: 0.42
});
const humMatPlasma = new THREE.MeshStandardMaterial({
  color: 0xbfd8f2, roughness: 0.30, metalness: 0.05,
  transparent: true, opacity: 0.30, depthWrite: false
});
const humMatAlveolo = new THREE.MeshStandardMaterial({
  color: HUM_ROSADO, roughness: 0.72, metalness: 0.0,
  emissive: 0x2a0c0e, emissiveIntensity: 0.4,
  transparent: true, opacity: 0.70
});
const humMatAlveoloOlho = new THREE.MeshStandardMaterial({
  color: 0x3d7fd0, roughness: 0.45, metalness: 0.05,
  emissive: 0x14386b, emissiveIntensity: 0.55
});
const humMatBronquio = new THREE.MeshStandardMaterial({
  color: 0xc9bcc8, roughness: 0.60, metalness: 0.04,
  transparent: true, opacity: 0.80, side: THREE.DoubleSide
});
const humMatNefron = new THREE.MeshStandardMaterial({
  color: 0x7fe0bd, roughness: 0.34, metalness: 0.10,
  emissive: 0x0f5c46, emissiveIntensity: 0.70,
  transparent: true, opacity: 0.88
});
const humMatDucto = new THREE.MeshStandardMaterial({
  color: 0xbfe8a8, roughness: 0.45, metalness: 0.05,
  emissive: 0x2a5c1e, emissiveIntensity: 0.55,
  transparent: true, opacity: 0.85
});
const humMatNervo = new THREE.MeshStandardMaterial({
  color: 0xccb08a, roughness: 0.62, metalness: 0.06,
  transparent: true, opacity: 0.78
});
const humMatMielina = new THREE.MeshStandardMaterial({
  color: 0xf2e6cf, roughness: 0.40, metalness: 0.08,
  emissive: 0x3d3320, emissiveIntensity: 0.35,
  transparent: true, opacity: 0.92
});
const humMatPotencial = new THREE.MeshStandardMaterial({
  color: 0xfff3a8, roughness: 0.20, metalness: 0.0,
  emissive: 0xffd54a, emissiveIntensity: 1.60,
  transparent: true, opacity: 0.95
});

/* ---------------------------------------------------------------------
   UTILIDADES DE CONSTRUÇÃO
   --------------------------------------------------------------------- */
function humTube(pontos, raio, mat, tubular, radial){
  /* aceita tanto Vector3 quanto triplas [x, y, z] */
  const pts = pontos.map(p => (Array.isArray(p) ? new THREE.Vector3(p[0], p[1], p[2]) : p));
  const curva = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curva, tubular || 140, raio, radial || 10, false);
  const malha = new THREE.Mesh(geo, mat);
  malha.raycast = () => {};
  return { malha, curva };
}

function humPts(lista){
  return lista.map(p => new THREE.Vector3(p[0], p[1], p[2]));
}

/* InstancedMesh de partículas: o raycast é neutralizado para o raycaster
   do projeto nunca tentar ler instâncias; matriz dinâmica por quadro. */
function humInstanceMesh(geo, mat, count){
  const im = new THREE.InstancedMesh(geo, mat, count);
  im.raycast = () => {};
  im.frustumCulled = false;
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  return im;
}

function humMakeFlowMaterial(opacidade){
  return new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.38, metalness: 0.05,
    emissive: 0xffffff, emissiveIntensity: 0.30,
    transparent: true, opacity: opacidade
  });
}

/* Posiciona a instância `i` ao longo da curva (fração `s`), com escala
   uniforme. Não aloca nada: usa apenas os objetos de rascunho do módulo. */
function humPosicionar(i, im, curva, s, escala){
  curva.getPointAt(s % 1, humVA);
  humDummy.position.copy(humVA);
  humDummy.scale.setScalar(escala);
  humDummy.updateMatrix();
  im.setMatrixAt(i, humDummy.matrix);
}

/* ---------------------------------------------------------------------
   a) CORAÇÃO
   Corpo orgânico por LatheGeometry deformada, com quatro câmaras
   internas visíveis (átrios e ventrículos) separadas por um septo.
   A sístole/diástole é animada em updateSistemaHumano.
   --------------------------------------------------------------------- */
function humBuildCoracao(){
  /* O eixo do Lathe é Y; inclinamos o grupo para o ápice apontar para
     baixo e para a esquerda, como no tórax. */
  const corpo = new THREE.Group();
  corpo.position.set(-4.2, 1.4, 0);
  corpo.rotation.z = -0.22;
  humCoracao.add(corpo);
  humRefs.coracaoCorpo = corpo;

  const perfil = [
    new THREE.Vector2(0.02, -2.20),
    new THREE.Vector2(1.05, -1.90),
    new THREE.Vector2(1.62, -1.20),
    new THREE.Vector2(1.92, -0.40),
    new THREE.Vector2(1.98, 0.35),
    new THREE.Vector2(1.82, 1.05),
    new THREE.Vector2(1.50, 1.65),
    new THREE.Vector2(1.12, 2.05),
    new THREE.Vector2(0.60, 2.32),
    new THREE.Vector2(0.02, 2.40)
  ];

  const geoCorpo = new THREE.LatheGeometry(perfil, 36);
  /* deformação orgânica: o miocárdio não é um sólido de revolução */
  const pos = geoCorpo.attributes.position;
  for (let i = 0; i < pos.count; i++){
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const tremor = 1 + 0.085*Math.sin(y*1.9) + 0.055*Math.cos(y*3.3 + x*0.7);
    pos.setXYZ(i, x*tremor*1.06, y, z*tremor*0.80);
  }
  geoCorpo.computeVertexNormals();

  const corpoMalha = new THREE.Mesh(geoCorpo, humMatParede);
  corpoMalha.raycast = () => {};
  corpo.add(corpoMalha);
  humRefs.paredeD = corpoMalha;

  /* Septo interventricular/interatrial: separa o lado direito (venoso)
     do lado esquerdo (arterial). */
  const septo = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.05, 3.10), humMatSepto);
  septo.position.y = -0.06;
  septo.raycast = () => {};
  corpo.add(septo);

  /* Quatro câmaras: eixo X negativo = lado DIREITO do paciente (venoso),
     eixo X positivo = lado ESQUERDO do paciente (arterial). */
  const camara = (raio, mat) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(raio, 20, 14), mat);
    m.raycast = () => {};
    return m;
  };

  const atrioD = camara(0.62, humMatVenoso);
  atrioD.position.set(-0.62, 1.34, 0.24);
  const atrioE = camara(0.62, humMatArterial);
  atrioE.position.set(0.62, 1.34, 0.24);
  const ventD = camara(0.76, humMatVenoso);
  ventD.position.set(-0.70, -0.62, -0.06);
  const ventE = camara(0.76, humMatArterial);
  ventE.position.set(0.70, -0.62, -0.06);
  corpo.add(atrioD, atrioE, ventD, ventE);
  humRefs.atrioD = atrioD; humRefs.atrioE = atrioE;
  humRefs.ventD = ventD; humRefs.ventE = ventE;

  /* Aros de reforço: reafirmam azul (direito) x vermelho (esquerdo). */
  const aroVenoso = new THREE.Mesh(new THREE.TorusGeometry(0.70, 0.045, 8, 26), humMatVenoso);
  aroVenoso.position.copy(ventD.position);
  aroVenoso.rotation.x = Math.PI/2;
  aroVenoso.scale.set(1, 1, 1.7);
  const aroArterial = new THREE.Mesh(new THREE.TorusGeometry(0.70, 0.045, 8, 26), humMatArterial);
  aroArterial.position.copy(ventE.position);
  aroArterial.rotation.x = Math.PI/2;
  aroArterial.scale.set(1, 1, 1.7);
  aroVenoso.raycast = () => {}; aroArterial.raycast = () => {};
  corpo.add(aroVenoso, aroArterial);

  /* Ponta do ápice, para leitura da orientação anatômica. */
  const apice = new THREE.Mesh(new THREE.SphereGeometry(0.30, 14, 10), humMatParede);
  apice.position.set(0.32, -2.10, 0);
  apice.raycast = () => {};
  corpo.add(apice);
}

/* ---------------------------------------------------------------------
   b) DOIS CIRCUITOS
   Traçados com CatmullRomCurve3 + TubeGeometry. O sentido do trajeto (e
   o das setas na cena) é SEMPRE o sentido do fluxo sanguíneo.

   PEQUENA CIRCULAÇÃO (pulmonar):
     ventrículo direito -> tronco/artéria pulmonar -> alvéolos ->
     veias pulmonares -> átrio esquerdo.
   GRANDE CIRCULAÇÃO (sistêmica):
     ventrículo esquerdo -> arco da aorta -> tecidos -> veia cava ->
     átrio direito.
   --------------------------------------------------------------------- */
function humBuildCirculacoes(){
  /* --- PEQUENA CIRCULAÇÃO: VD -> pulmões -> AE ---------------------- */
  const pequena = humPts([
    [-4.90, 0.55, -0.10],
    [-5.10, 2.15, -0.20],
    [-4.30, 3.05, -0.40],
    [-3.20, 3.80, -0.30],
    [-2.30, 4.35, -0.20],
    [-1.50, 4.90, 0.10],
    [ 0.00, 5.40, 0.20],
    [ 1.50, 4.90, 0.10],
    [ 2.30, 4.35, -0.20],
    [ 3.20, 3.80, -0.30],
    [ 4.30, 3.05, -0.40],
    [ 5.10, 2.05, -0.20],
    [ 3.85, 0.72, -0.10]
  ]);

  /* A ARTÉRIA pulmonar conduz sangue VENOSO (dessaturado, azul). */
  const artPulm = humTube(pequena.slice(0, 6), 0.19, humMatVenoso, 150, 10);
  /* As VEIAS pulmonares conduzem sangue ARTERIAL (saturado, vermelho). */
  const veiaPulm = humTube(pequena.slice(6), 0.17, humMatArterial, 150, 10);
  humRefs.pulmArt = artPulm.malha;
  humRefs.veiaPulm = veiaPulm.malha;
  humVasos.add(artPulm.malha, veiaPulm.malha);

  const bronqD = humTube(humPts([
    [-1.50, 4.90, 0.10], [-2.90, 4.75, 1.50], [-4.20, 3.90, 2.30], [-5.00, 3.00, 2.40]
  ]), 0.17, humMatBronquio, 60, 8);
  const bronqE = humTube(humPts([
    [ 1.50, 4.90, 0.10], [ 2.90, 4.75, 1.50], [ 4.20, 3.90, 2.30], [ 5.00, 3.00, 2.40]
  ]), 0.17, humMatBronquio, 60, 8);
  humVasos.add(bronqD.malha, bronqE.malha);

  /* --- GRANDE CIRCULAÇÃO: VE -> aorta -> tecidos -> cava -> AD ------ */
  const grande = humPts([
    [ 3.75, -0.60, -0.05],
    [ 4.10, 1.10, -0.20],
    [ 4.70, 2.40, -0.35],
    [ 5.30, 3.25, -0.50],
    [ 6.30, 2.55, -0.65],
    [ 7.20, 1.05, -0.90],
    [ 7.60, -1.20, -1.10],
    [ 6.90, -3.30, -1.15],
    [ 5.40, -4.40, -1.05],
    [ 3.40, -4.10, -0.95],
    [ 1.60, -2.60, -0.95],
    [ 0.60, -0.70, -1.15],
    [-3.75, 0.45, -1.45],
    [-3.90, 1.85, -1.05],
    [-3.95, 2.85, -0.45]
  ]);

  /* A aorta é EFERENTE e leva sangue ARTERIAL ao corpo. */
  const aorta = humTube(grande.slice(0, 8), 0.21, humMatArterial, 170, 10);
  /* Leito capilar dos tecidos: aqui o efeito Bohr libera o O2. */
  const tecidos = humTube(grande.slice(8, 11), 0.14, humMatCapilar, 70, 8);
  /* Veia cava: AFERENTE, devolve sangue VENOSO ao átrio direito. */
  const cava = humTube(grande.slice(11), 0.23, humMatVenoso, 140, 10);
  humRefs.aorta = aorta.malha;
  humRefs.veiaCava = cava.malha;
  humRefs.capilares = tecidos.malha;
  humVasos.add(aorta.malha, tecidos.malha, cava.malha);

  /* Guarda a altura original da aorta para o recuo pulsátil da sístole. */
  const apos = aorta.malha.geometry.attributes.position;
  for (let i = 0; i < apos.count; i++) humRefs.aortaBaseY.push(apos.getY(i));

  humRefs.rotaPequena = new THREE.CatmullRomCurve3(pequena);
  humRefs.rotaGrande = new THREE.CatmullRomCurve3(grande);

  /* Setas: explicitam o SENTIDO do fluxo nos dois circuitos. */
  humAddSetas(humRefs.rotaGrande, 9, humMatArterial);
  humAddSetas(humRefs.rotaPequena, 7, humMatVenoso);
}

function humAddSetas(curva, quantidade, mat){
  for (let i = 0; i < quantidade; i++){
    const s = (i + 0.5)/quantidade;
    const p = curva.getPointAt(s);
    const tg = curva.getTangentAt(s);
    const seta = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.30, 8), mat);
    seta.position.copy(p);
    humVB.copy(p).add(tg);
    seta.lookAt(humVB);
    seta.rotateX(Math.PI/2);
    seta.raycast = () => {};
    humVasos.add(seta);
  }
}

/* ---------------------------------------------------------------------
   c) PULMÕES — cachos de alvéolos
   A ventilação é comandada pela HIPERCAPNIA: com CO2 alto (e O2 baixo) a
   amplitude e a frequência do movimento respiratório aumentam.
   --------------------------------------------------------------------- */
function humBuildPulmoes(){
  const gerarCacho = (centroX) => {
    const grupo = new THREE.Group();
    const proto = new THREE.IcosahedronGeometry(0.30, 1);
    const base = [];

    /* "saco" de alvéolos por distribuição de Fibonacci */
    const total = 92;
    for (let i = 0; i < total; i++){
      const y = 1 - (i/(total - 1))*2;
      const r = Math.sqrt(Math.max(0, 1 - y*y));
      const th = i * Math.PI * (3 - Math.sqrt(5));
      const ff = 0.45 + 0.55*Math.abs(Math.sin(i*0.7));
      const px = centroX + Math.cos(th)*r*1.50*ff;
      const py = 4.30 + y*1.55*ff;
      const pz = Math.sin(th)*r*1.15*ff;

      /* Parede alveolar fina: é onde ocorre a hematose. */
      const alv = new THREE.Mesh(proto, humMatAlveolo);
      const esc = 0.72 + Math.random()*0.42;
      alv.position.set(px, py, pz);
      alv.scale.setScalar(esc);
      alv.raycast = () => {};
      grupo.add(alv);
      base.push({ malha: alv, escala: esc });

      /* "olho" azul-escuro = superfície de troca gasosa */
      if (i % 6 === 0){
        const olho = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), humMatAlveoloOlho);
        olho.position.set(px, py, pz);
        olho.raycast = () => {};
        grupo.add(olho);
      }
    }

    /* brônquio intrapulmonar estilizado */
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 2.9, 8), humMatBronquio);
    br.position.set(centroX, 3.35, 1.20);
    br.rotation.z = centroX < 0 ? -0.22 : 0.22;
    br.raycast = () => {};
    grupo.add(br);

    grupo.userData.base = base;
    return grupo;
  };

  humRefs.alvD = gerarCacho(-5.05);
  humRefs.alvE = gerarCacho(5.05);
  humPulmoes.add(humRefs.alvD, humRefs.alvE);

  /* Superfícies de hematose visíveis: pequenas esferas sobre alvéolos do
     lado direito, ligadas por capilares. Nelas ficam as hemácias em
     destaque que SOFREM O EFEITO BOHR (mudam de cor com O2, CO2 e pH). */
  const pontos = [
    [-4.60, 4.85, 0.62],
    [-5.55, 4.25, 0.30],
    [-4.95, 3.70, 0.58],
    [-6.05, 5.00, 0.20]
  ];

  for (let i = 0; i < pontos.length; i++){
    const pt = humVA.set(pontos[i][0], pontos[i][1], pontos[i][2]).clone();

    const face = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 10), humMatAlveolo.clone());
    face.position.copy(pt);
    face.raycast = () => {};
    humPulmoes.add(face);
    humRefs.facesAlv.push(face);

    /* Capilar pulmonar: a hematose é DIFUSÃO SIMPLES, do meio mais
       concentrado para o menos concentrado — O2 do alvéolo para o sangue
       e CO2 do sangue para o alvéolo. Não há transporte ativo aqui. */
    const tubo = humTube([
      [pt.x - 0.90, pt.y - 0.55, pt.z],
      [pt.x - 0.05, pt.y + 0.08, pt.z + 0.10],
      [pt.x + 0.85, pt.y - 0.35, pt.z]
    ], 0.09, humMatCapilar, 70, 8);
    humPulmoes.add(tubo.malha);
    humRefs.rotasHematose.push(tubo.curva);

    /* Hemácia em destaque: disco bicôncavo, material próprio para o
       efeito Bohr (uma cor por superfície de troca). */
    const matHem = new THREE.MeshStandardMaterial({
      color: HUM_VERMELHO_RICO, roughness: 0.34, metalness: 0.06,
      emissive: 0x5c0a06, emissiveIntensity: 0.55
    });
    humRefs.hemaciasMat.push(matHem);
    for (let k = 0; k < 2; k++){
      const hem = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), matHem);
      hem.scale.set(1.25, 0.62, 1.25);
      hem.raycast = () => {};
      humPulmoes.add(hem);
      humRefs.hemacias.push({ malha: hem, rota: i, s: k*0.5, vel: 0.14 + i*0.02 });
    }
  }
}

/* ---------------------------------------------------------------------
   d) HEMATOSE VISÍVEL e efeito Bohr
   Partículas de O2 percorrem alvéolo -> capilar -> hemácia (InstancedMesh
   com instanceMatrix e instanceColor atualizados por quadro).

   EFEITO BOHR (comentário obrigatório): mais CO2, pH MENOR e temperatura
   mais alta DESLOCAM A CURVA DE SATURAÇÃO DA HEMOGLOBINA PARA A DIREITA,
   isto é, REDUZEM A AFINIDADE da hemoglobina pelo O2 e FAVORECEM A
   LIBERAÇÃO DE O2 NOS TECIDOS. Nos PULMÕES ocorre o oposto: a ventilação
   reduz o CO2, o pH sobe e a afinidade da hemoglobina AUMENTA, o que
   garante a saturação do sangue que deixa os alvéolos.
   --------------------------------------------------------------------- */
function humBuildHematose(){
  /* O2 no ar alveolar (azul-claro) e O2 difundindo para o capilar. */
  humRefs.rotaAr = new THREE.CatmullRomCurve3(humPts([
    [-1.55, 4.85, 0.10],
    [-3.00, 4.70, 1.45],
    [-4.30, 4.00, 2.25],
    [-4.90, 3.70, 1.40],
    [-5.10, 4.30, 0.60],
    [-6.00, 4.80, 0.25]
  ]));

  const N_AR = 44;
  humRefs.partAr = humInstanceMesh(new THREE.IcosahedronGeometry(0.055, 0), humMakeFlowMaterial(0.88), N_AR);
  for (let i = 0; i < N_AR; i++) humRefs.partAr.setColorAt(i, humCorAr);
  humRefs.partAr.instanceColor.needsUpdate = true;
  humPulmoes.add(humRefs.partAr);

  /* O2 que atravessa a membrana alveolar e chega à hemácia (44 + 24
     instâncias pequenas). */
  const rotas = humRefs.rotasHematose;
  const N_O2 = 24;
  const porRota = Math.ceil(N_O2/rotas.length);
  humRefs.partO2 = humInstanceMesh(new THREE.SphereGeometry(0.06, 8, 6), humMakeFlowMaterial(0.95), porRota*rotas.length);
  for (let i = 0; i < humRefs.partO2.count; i++) humRefs.partO2.setColorAt(i, humCorAr);
  humRefs.partO2.instanceColor.needsUpdate = true;
  humPulmoes.add(humRefs.partO2);

  /* Hemácias da PEQUENA circulação: saem do ventrículo direito dessaturadas
     (azul) e retornam ao átrio esquerdo saturadas (vermelho). */
  const N_HEM = 118;
  humRefs.partAzuis = humInstanceMesh(new THREE.SphereGeometry(0.085, 8, 6), humMakeFlowMaterial(0.92), N_HEM);
  for (let i = 0; i < N_HEM; i++){
    humRefs.partAzuis.setColorAt(i, i < N_HEM*0.45 ? humCorAzul : humCorVermelhoArt);
  }
  humRefs.partAzuis.instanceColor.needsUpdate = true;
  humVasos.add(humRefs.partAzuis);

  /* Hemácias da GRANDE circulação: saem da aorta saturadas (vermelho) e
     voltam pela cava dessaturadas (vinho-escuro). */
  const N_HEM2 = 110;
  humRefs.partVermelhas = humInstanceMesh(new THREE.SphereGeometry(0.085, 8, 6), humMakeFlowMaterial(0.92), N_HEM2);
  for (let i = 0; i < N_HEM2; i++){
    humRefs.partVermelhas.setColorAt(i, i < N_HEM2*0.5 ? humCorVermelhoArt : humCorVinho);
  }
  humRefs.partVermelhas.instanceColor.needsUpdate = true;
  humVasos.add(humRefs.partVermelhas);

  /* O plasma é destacado no leito capilar (transparência por hidratação). */
  const plasma = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.6, 12, 1, true), humMatPlasma);
  plasma.position.set(1.05, -0.35, 0.85);
  plasma.rotation.z = 0.5;
  plasma.raycast = () => {};
  humVasos.add(plasma);
}

/* ---------------------------------------------------------------------
   e) NÉFRON — glomérulo, túbulo contorcido, alça e ducto coletor
   FILTRAÇÃO: no glomérulo o plasma é filtrado por pressão para a cápsula
   de Bowman. Quase todo o filtrado é REABSORVIDO no túbulo contorcido
   proximal (água, glicose, aminoácidos e sais).

   ADH (vasopressina, neuro-hipófise): aumenta a PERMEABILIDADE À ÁGUA do
   ducto coletor, AUMENTANDO A REABSORÇÃO DE ÁGUA e CONCENTRANDO a urina.
   Quando a hidratação cai, o ADH sobe e menos água é perdida.
   ALDOSTERONA (córtex da suprarrenal): aumenta a reabsorção de SÓDIO e a
   secreção de potássio no ducto coletor; a água acompanha o sódio, o que
   ajuda a preservar o volume plasmático.
   Todos os pontos abaixo estão em coordenadas LOCAIS do grupo base.
   --------------------------------------------------------------------- */
function humBuildNefron(){
  const base = new THREE.Group();
  base.position.set(-8.10, -3.40, 0.70);
  base.rotation.y = 0.35;
  humNefron.add(base);
  humRefs.nefronBase = base;

  /* --- GLOMÉRULO: capilar enovelado dentro da cápsula de Bowman ----- */
  const glomerulo = humTube([
    [-0.38, 1.85, 0.05], [0.22, 2.02, 0.28], [0.44, 1.52, -0.18],
    [0.00, 1.28, 0.32], [-0.44, 1.50, -0.10], [-0.22, 1.90, 0.30],
    [0.30, 1.95, -0.24], [0.06, 1.60, 0.04]
  ], 0.075, humMatArterial, 160, 8);
  base.add(glomerulo.malha);

  const capsula = new THREE.Mesh(new THREE.SphereGeometry(0.82, 22, 16), new THREE.MeshStandardMaterial({
    color: 0xbfe6ff, roughness: 0.35, metalness: 0.05,
    transparent: true, opacity: 0.20, depthWrite: false
  }));
  capsula.position.set(0, 1.68, 0);
  capsula.raycast = () => {};
  base.add(capsula);

  /* --- TÚBULO CONTORCIDO PROXIMAL (tubo em curva bem visível) ------- */
  const tubulo = humTube([
    [-0.52, 1.28, 0.02],
    [-1.70, 1.05, 0.42],
    [-2.30, 1.70, -0.30],
    [-1.40, 2.15, 0.36],
    [-0.20, 1.90, -0.42],
    [ 0.55, 1.15, 0.24],
    [ 1.10, 0.35, -0.10],
    [ 0.40, -0.35, 0.32],
    [-0.70, -0.15, -0.30],
    [-1.05, -1.00, 0.12],
    [-0.30, -1.60, -0.22],
    [-0.10, -2.20, 0.00],
    [ 0.50, -2.80, 0.16],
    [ 0.90, -3.30, 0.00]
  ], 0.110, humMatNefron, 220, 9);
  base.add(tubulo.malha);
  humRefs.tubulo = tubulo.malha;

  /* Túbulo distal em tom mais claro e DUCTO COLETOR, onde o ADH age. */
  const distal = humTube([
    [0.90, -3.30, 0.00], [1.50, -3.70, 0.10], [2.00, -3.50, -0.15],
    [2.40, -3.90, 0.05], [2.70, -4.40, 0.00]
  ], 0.095, humMatNefron, 80, 8);
  const coletor = humTube([
    [2.70, -4.40, 0.00], [2.90, -5.00, 0.00], [3.00, -5.60, 0.00]
  ], 0.140, humMatDucto, 70, 9);
  base.add(distal.malha, coletor.malha);

  /* Registra as curvaturas do túbulo para a animação peristáltica. */
  const posT = tubulo.malha.geometry.attributes.position;
  humRefs.tubuloBase = new Array(posT.count);
  for (let i = 0; i < posT.count; i++){
    const x = posT.getX(i), z = posT.getZ(i);
    humRefs.tubuloBase[i] = { r: Math.hypot(x, z), y: posT.getY(i) };
  }

  /* --- FILTRADO: do glomérulo para a cápsula e pelo túbulo ---------- */
  humRefs.rotaFiltrado = new THREE.CatmullRomCurve3(humPts([
    [0.00, 1.95, 0.10],
    [-0.30, 1.55, 0.30],
    [-1.30, 1.20, 0.36],
    [-2.05, 1.55, -0.20],
    [-1.20, 2.05, 0.30],
    [-0.10, 1.80, -0.30],
    [0.60, 1.00, 0.20],
    [1.05, 0.25, -0.10],
    [0.30, -0.40, 0.28],
    [-0.70, -0.20, -0.25],
    [-1.00, -1.05, 0.10],
    [-0.25, -1.65, -0.18],
    [-0.05, -2.25, 0.00],
    [0.55, -2.85, 0.14],
    [0.95, -3.35, 0.00],
    [1.60, -3.70, 0.08],
    [2.05, -3.55, -0.12],
    [2.45, -3.95, 0.04],
    [2.80, -4.50, 0.00],
    [3.00, -5.30, 0.00]
  ]));

  const N_FILT = 70;
  humRefs.partFiltrado = humInstanceMesh(new THREE.SphereGeometry(0.055, 8, 6), humMakeFlowMaterial(0.90), N_FILT);
  for (let i = 0; i < N_FILT; i++){
    humRefs.partFiltrado.setColorAt(i, i < N_FILT*0.4 ? humCorFiltrado : humCorUrina);
  }
  humRefs.partFiltrado.instanceColor.needsUpdate = true;
  base.add(humRefs.partFiltrado);

  /* --- REABSORÇÃO: retorno ao capilar peritubular ------------------
     Quanto MENOR a hidratação, MAIOR a fração reabsorvida (ADH atuante no
     ducto coletor) e mais CONCENTRADA fica a urina. */
  const reabsorcao = humTube([
    [-2.20, 1.10, -0.30], [-2.60, 0.20, -0.55], [-1.90, -0.70, -0.60],
    [-0.60, -1.40, -0.65], [0.70, -1.90, -0.70], [1.60, -2.60, -0.65],
    [1.30, -3.60, -0.60], [0.20, -4.60, -0.55], [-1.10, -5.10, -0.50]
  ], 0.055, humMatCapilar, 150, 8);
  /* Capilar peritubular com material próprio: o ADH que promove a
     reabsorção de água é destacado pela emissividade azul deste vaso. */
  const matPeritub = humMatVenoso.clone();
  const capilarPeritub = humTube([
    [-2.60, 0.60, -0.62], [-1.60, -0.50, -0.70], [0.10, -1.70, -0.75],
    [1.60, -2.80, -0.70], [0.40, -4.40, -0.60], [-1.20, -5.00, -0.50]
  ], 0.115, matPeritub, 150, 9);
  base.add(reabsorcao.malha, capilarPeritub.malha);
  humRefs.rotaReabsorcao = reabsorcao.curva;
  humRefs.capilarPeritub = capilarPeritub.malha;

  const N_REABS = 30;
  humRefs.partReabsorvido = humInstanceMesh(new THREE.SphereGeometry(0.052, 8, 6), humMakeFlowMaterial(0.92), N_REABS);
  for (let i = 0; i < N_REABS; i++) humRefs.partReabsorvido.setColorAt(i, humCorReabsorvido);
  humRefs.partReabsorvido.instanceColor.needsUpdate = true;
  base.add(humRefs.partReabsorvido);
}

/* ---------------------------------------------------------------------
   f) SISTEMA NERVOSO CONDUTOR
   Feixe nervoso saindo do coração, com bainha de mielina em segmentos
   INTERROMPIDOS nos NÓDULOS DE RANVIER. O potencial de ação salta de um
   nódulo ao outro: é a CONDUÇÃO SALTATÓRIA, bem mais rápida que a
   condução contínua das fibras amielínicas, porque a despolarização só
   precisa ocorrer nos nódulos.

   CONTROLE AUTONÔMICO (sem inversões): o PARASSIMPÁTICO (nervo vago)
   REDUZ a frequência cardíaca; o SIMPÁTICO e a ADRENALINA AUMENTAM a
   frequência, a força de contração e a velocidade de condução.
   --------------------------------------------------------------------- */
function humBuildNervo(){
  humRefs.rotaNervo = new THREE.CatmullRomCurve3(humPts([
    [-5.60, 1.30, 2.20],
    [-4.40, 2.20, 2.80],
    [-2.20, 2.80, 2.60],
    [ 0.40, 2.40, 2.30],
    [ 2.60, 1.40, 2.10],
    [ 4.20, 0.40, 2.30],
    [ 5.60, -0.60, 2.70],
    [ 5.40, -2.20, 3.00]
  ]));

  /* Axônio central em tom pálido. */
  const axonio = humTube(humRefs.rotaNervo.points, 0.085, humMatNervo, 220, 8);
  humNervo.add(axonio.malha);

  /* Bainha de mielina: segmentos com intervalos = NÓDULOS DE RANVIER. */
  const N_SEG = 12;
  for (let i = 0; i < N_SEG; i++){
    const s0 = (i + 0.12)/N_SEG;
    const s1 = (i + 0.80)/N_SEG;
    const pts = [];
    for (let k = 0; k <= 5; k++) pts.push(humRefs.rotaNervo.getPointAt(s0 + (s1 - s0)*(k/5)));
    const seg = humTube(pts, 0.190, humMatMielina, 26, 10);
    humNervo.add(seg.malha);

    /* Nódulo de Ranvier: anel onde ocorre a troca iônica do potencial. */
    const no = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.030, 6, 14), humMatPotencial);
    const sN = s1 + 0.005;
    humRefs.rotaNervo.getPointAt(sN, humVA);
    no.position.copy(humVA);
    humRefs.rotaNervo.getTangentAt(sN, humVB);
    humVC.copy(humVA).add(humVB);
    no.lookAt(humVC);
    no.raycast = () => {};
    humNervo.add(no);
  }

  /* Potenciais de ação: percorrem o feixe com velocidade proporcional à
     frequência cardíaca (simpático/adrenalina acelera a condução). */
  for (let i = 0; i < 3; i++){
    const esfera = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), humMatPotencial);
    esfera.raycast = () => {};
    humNervo.add(esfera);
    humRefs.potenciais.push({ malha: esfera, s: i/3 });
  }
}

/* ---------------------------------------------------------------------
   g) PAINEL DE ESTADO INTERNO — apenas 3D, NENHUM elemento HTML/DOM
   Dois anéis cujo diâmetro codifica O2 e CO2 e duas barras de referência
   (CO2 e reabsorção de água por ação do ADH).
   --------------------------------------------------------------------- */
function humBuildPainel(){
  humPainel.position.set(8.20, 5.10, 1.60);
  humPainel.rotation.z = -0.18;

  const arcoCinza = (raio) => {
    const aro = new THREE.Mesh(new THREE.TorusGeometry(raio, 0.035, 6, 48), new THREE.MeshStandardMaterial({
      color: 0x6f7f92, roughness: 0.60, metalness: 0.10,
      transparent: true, opacity: 0.32
    }));
    aro.raycast = () => {};
    return aro;
  };
  humPainel.add(arcoCinza(1.05), arcoCinza(1.38));

  const fazerDial = (raio, matBase) => {
    const grupo = new THREE.Group();
    const arco = new THREE.Mesh(new THREE.TorusGeometry(raio, 0.055, 8, 40, Math.PI*1.5), matBase);
    arco.rotation.z = Math.PI*0.75;
    arco.raycast = () => {};
    grupo.add(arco);
    humPainel.add(grupo);
    return grupo;
  };

  humRefs.anel = fazerDial(1.05, new THREE.MeshStandardMaterial({
    color: 0xff5a4a, roughness: 0.30, metalness: 0.15,
    emissive: 0x5c1108, emissiveIntensity: 0.80
  }));
  humRefs.anel2 = fazerDial(1.38, new THREE.MeshStandardMaterial({
    color: 0x6fd0ff, roughness: 0.30, metalness: 0.15,
    emissive: 0x0b3a5c, emissiveIntensity: 0.80
  }));

  humRefs.dialMat = new THREE.MeshStandardMaterial({
    color: 0x1b2a3a, roughness: 0.55, metalness: 0.25,
    transparent: true, opacity: 0.55,
    emissive: 0x0a1a2a, emissiveIntensity: 0.40
  });
  humRefs.dial = new THREE.Mesh(new THREE.CircleGeometry(0.92, 32), humRefs.dialMat);
  humRefs.dial.position.z = -0.06;
  humRefs.dial.raycast = () => {};
  humPainel.add(humRefs.dial);

  /* Barra de CO2: quanto mais CO2, mais longa. */
  humRefs.barraCO2 = new THREE.Mesh(new THREE.BoxGeometry(1, 0.14, 0.14), new THREE.MeshStandardMaterial({
    color: 0xffb85a, roughness: 0.35, metalness: 0.10,
    emissive: 0x5c3a05, emissiveIntensity: 0.70
  }));
  humRefs.barraCO2.position.set(-1.80, -0.70, 0);
  humRefs.barraCO2.raycast = () => {};

  /* Barra de água reabsorvida (ADH atuante). */
  humRefs.barraAgua = new THREE.Mesh(new THREE.BoxGeometry(1, 0.14, 0.14), new THREE.MeshStandardMaterial({
    color: 0x7fe0bd, roughness: 0.35, metalness: 0.10,
    emissive: 0x0f5c46, emissiveIntensity: 0.70
  }));
  humRefs.barraAgua.position.set(-1.80, -1.05, 0);
  humRefs.barraAgua.raycast = () => {};
  humPainel.add(humRefs.barraCO2, humRefs.barraAgua);

  /* Uma única luz fraca (intensidade <= 6) dentro de humRoot. */
  const luz = new THREE.PointLight(0xffd9c8, 5.2, 16, 2);
  luz.position.set(-4.6, -0.4, 2.40);
  humPainel.add(luz);
}

/* =====================================================================
   CONSTRUÇÃO
   ===================================================================== */
export function buildSistemaHumano(){
  humBuildCoracao();
  humBuildCirculacoes();
  humBuildPulmoes();
  humBuildHematose();
  humBuildNefron();
  humBuildNervo();
  humBuildPainel();
  humApply();
}

/* =====================================================================
   APLICAÇÃO DOS PARÂMETROS
   Toda leitura de humParams acontece aqui; nenhuma alocação por quadro.
   ===================================================================== */
export function humApply(){
  const p = humParams;

  /* ------------------------- EFEITO BOHR ---------------------------
     Nos TECIDOS: mais CO2 -> pH menor -> curva desviada para a DIREITA
     -> MENOR afinidade -> MAIOR LIBERAÇÃO de O2 para as células.
     Nos PULMÕES: a ventilação reduz o CO2 e ELEVA o pH -> curva desviada
     para a ESQUERDA -> MAIOR AFINIDADE -> captação de O2 pela hemoglobina.
     `bohr` vai de 0 (totalmente saturada) a 1 (totalmente dessaturada). */
  const bohr = THREE.MathUtils.clamp(
    0.42 + 0.75*p.co2 - 0.70*(p.ph - 0.5) - 1.30*p.oxigenio,
    0, 1
  );

  /* Cores persistentes usadas pelas partículas e pelos materiais. */
  humRefs.corArterial.copy(humCorVermelhoArt).lerp(humCorVinho, 0.55*bohr);
  humRefs.corVenosa.copy(humCorVinho).lerp(humCorAzul, 0.35);
  humRefs.corHemacia.copy(humCorVermelhoRico).lerp(humCorVinho, bohr);

  /* ------------------- HEMÁCIAS EM DESTAQUE ------------------------ */
  for (let i = 0; i < humRefs.hemaciasMat.length; i++){
    const mat = humRefs.hemaciasMat[i];
    mat.color.copy(humRefs.corHemacia);
    mat.emissive.setRGB(0.36*(1 - bohr), 0.02, 0.02 + 0.08*bohr);
  }

  /* --------------- SUPERFÍCIES DE HEMATOSE (alvéolos) -------------- */
  for (let i = 0; i < humRefs.facesAlv.length; i++){
    const face = humRefs.facesAlv[i];
    face.material.opacity = 0.40 + 0.34*p.oxigenio;
    face.material.emissive.setRGB(0.12*p.oxigenio, 0.02, 0.06*(1 - p.oxigenio));
  }

  /* --------------------- VASOS: azul x vermelho -------------------- */
  /* O lado DIREITO (venoso) é azul e o ESQUERDO (arterial) é vermelho; a
     saturação modula a intensidade, não a identidade do lado. */
  humMatArterial.color.copy(humRefs.corArterial);
  humMatArterial.emissive.setRGB(0.30*p.oxigenio, 0.03, 0.02);
  humMatVenoso.color.copy(humRefs.corVenosa);
  humMatVenoso.emissive.setRGB(0.03, 0.06 + 0.10*p.oxigenio, 0.20 + 0.22*p.oxigenio);

  /* ------------------- ALVÉOLOS: superfície de troca --------------- */
  humMatAlveolo.opacity = 0.58 + 0.22*p.oxigenio;
  humMatAlveolo.color.setRGB(
    0.87 + 0.08*p.oxigenio,
    0.60 + 0.14*(1 - p.co2),
    0.62 + 0.10*(1 - p.co2)
  );
  humMatAlveolo.emissiveIntensity = 0.20 + 0.50*p.oxigenio;
  humMatAlveoloOlho.emissiveIntensity = 0.30 + 0.90*(1 - p.oxigenio);

  /* ---------------- PLASMA: hidratação e volemia ------------------- */
  humMatPlasma.opacity = 0.16 + 0.30*p.hidratacao;
  humMatCapilar.opacity = 0.28 + 0.26*p.hidratacao;

  /* ------------------ RITMO CARDÍACO (fc) --------------------------
     O PARASSIMPÁTICO (vago) REDUZ a frequência cardíaca; o SIMPÁTICO e a
     ADRENALINA a AUMENTAM. A frequência relativa (Hz) e a amplitude da
     contração crescem com fc; a velocidade de condução acompanha. */
  humRefs.freqCard = THREE.MathUtils.clamp(0.55 + 1.85*p.fc, 0.5, 2.6);
  humRefs.amplCard = 0.030 + 0.055*p.fc;
  humRefs.velNervo = 0.16 + 0.62*p.fc;

  /* ----------- VENTILAÇÃO: resposta à HIPERCAPNIA ------------------
     CO2 alto (e O2 baixo) eleva o drive respiratório, aumentando a
     amplitude e a frequência da ventilação. Ventilar mais reduz o CO2 e
     ELEVA o pH — o que AUMENTA a afinidade da hemoglobina pelo O2 nos
     pulmões (o inverso do efeito Bohr nos tecidos). */
  humRefs.driveResp = THREE.MathUtils.clamp(0.30 + 0.90*p.co2 + 0.55*(1 - p.oxigenio), 0, 2);

  /* ------------- NÉFRON: filtração, ADH e aldosterona --------------
     Hidratação baixa -> ADH alto -> MAIOR reabsorção de água no ducto
     coletor -> urina concentrada. A aldosterona reforça o processo
     aumentando a reabsorção de sódio (a água acompanha o sódio). */
  humRefs.taxaReabsorcao = THREE.MathUtils.clamp(1.15 - 0.85*p.hidratacao, 0.15, 1);
  humRefs.taxaFiltracao = THREE.MathUtils.clamp(0.35 + 0.65*p.hidratacao, 0.20, 1);

  humRefs.barraAgua.scale.x = 0.25 + 1.75*humRefs.taxaReabsorcao;
  humRefs.barraCO2.scale.x = 0.25 + 1.75*p.co2;
  humRefs.dialMat.emissive.setRGB(0.04 + 0.20*p.fc, 0.02, 0.06);
  humRefs.capilarPeritub.material.emissive.setRGB(0.04, 0.10 + 0.20*(1 - p.hidratacao), 0.30);
}

/* =====================================================================
   ANIMAÇÃO POR QUADRO
   Batimento (sístole/diástole), fluxo nos dois circuitos, ventilação
   alveolar, hematose, filtração/reabsorção renal e condução saltatória.
   Sem alocação: reutiliza vetores, matrizes e cores de módulo.
   ===================================================================== */
export function updateSistemaHumano(dt){
  const passo = Math.min(dt > 0 ? dt : 0, 0.05);
  const p = humParams;
  humAnim.t += passo;

  /* ----------------------- CICLO CARDÍACO --------------------------
     SÍSTOLE = contração (início do ciclo, onda rápida); DIÁSTOLE =
     relaxamento e enchimento (fase longa). */
  humAnim.ciclo += passo*0.9*humRefs.freqCard;
  const u = humAnim.ciclo - Math.floor(humAnim.ciclo);
  const contracao = Math.pow(1 - Math.min(1, u/0.26), 2);
  const volume = Math.exp(-Math.pow((u - 0.72)/0.17, 2));
  const amp = humRefs.amplCard;

  /* Ventrículos contraem mais que os átrios (sístole ventricular). */
  humRefs.ventD.scale.setScalar(1 - 0.55*amp*contracao);
  humRefs.ventE.scale.setScalar(1 - 0.62*amp*contracao);
  humRefs.atrioD.scale.setScalar(1 + 0.30*amp*volume);
  humRefs.atrioE.scale.setScalar(1 + 0.30*amp*volume);

  const kCorpo = 1 - 0.10*amp*contracao;
  humRefs.coracaoCorpo.scale.set(kCorpo, kCorpo, kCorpo);

  /* Recuo elástico da aorta na sístole (pulso arterial visível). */
  if (humRefs.aorta){
    const apos = humRefs.aorta.geometry.attributes.position;
    const incha = 1 - 0.030*contracao;
    for (let i = 0; i < apos.count; i++) apos.setY(i, humRefs.aortaBaseY[i]*incha);
    apos.needsUpdate = true;
  }

  /* ------------------ FLUXO NOS DOIS CIRCUITOS ---------------------
     Pequena circulação: sai azul (venoso) do ventrículo direito e volta
     vermelho (arterial) ao átrio esquerdo depois da hematose.
     Grande circulação: sai vermelho (arterial) da aorta, perde O2 nos
     tecidos pelo efeito Bohr e retorna dessaturado pela veia cava. */
  const velSangue = 0.030 + 0.075*humRefs.freqCard;

  const azuis = humRefs.partAzuis;
  const nAzul = azuis.count;
  for (let i = 0; i < nAzul; i++){
    const s = (humAnim.t*velSangue*1.35 + i/nAzul) % 1;
    humPosicionar(i, azuis, humRefs.rotaPequena, s, 1 + 0.25*Math.sin(humAnim.t*4 + i*1.7));
    humC0.lerpColors(humRefs.corVenosa, humRefs.corArterial, THREE.MathUtils.smoothstep(s, 0.52, 0.80));
    azuis.setColorAt(i, humC0);
  }
  azuis.instanceMatrix.needsUpdate = true;
  azuis.instanceColor.needsUpdate = true;

  const vermelhas = humRefs.partVermelhas;
  const nVerm = vermelhas.count;
  for (let i = 0; i < nVerm; i++){
    const s = (humAnim.t*velSangue*1.15 + i/nVerm) % 1;
    humPosicionar(i, vermelhas, humRefs.rotaGrande, s, 1 + 0.25*Math.cos(humAnim.t*4 + i*1.3));
    humC0.lerpColors(humRefs.corArterial, humRefs.corVenosa, THREE.MathUtils.smoothstep(s, 0.46, 0.80));
    vermelhas.setColorAt(i, humC0);
  }
  vermelhas.instanceMatrix.needsUpdate = true;
  vermelhas.instanceColor.needsUpdate = true;

  /* ---------------------- VENTILAÇÃO ALVEOLAR ----------------------
     O drive respiratório (humRefs.driveResp) responde à HIPERCAPNIA:
     CO2 alto e O2 baixo aumentam a amplitude e a frequência. */
  const drive = humRefs.driveResp;
  humAnim.resp += passo*(0.30 + 0.85*drive);
  const respira = Math.sin(humAnim.resp);

  const alvD = humRefs.alvD.userData.base;
  const escalD = 1 + 0.105*drive*respira;
  for (let i = 0; i < alvD.length; i++){
    humV3Escala.setScalar(alvD[i].escala*escalD);
    alvD[i].malha.scale.copy(humV3Escala);
  }
  const alvE = humRefs.alvE.userData.base;
  const escalE = escalD*(1 - 0.02*drive*(1 - p.oxigenio));
  for (let i = 0; i < alvE.length; i++){
    humV3Escala.setScalar(alvE[i].escala*escalE);
    alvE[i].malha.scale.copy(humV3Escala);
  }

  /* --------------------------- HEMATOSE ----------------------------
     DIFUSÃO SIMPLES: o O2 passa do alvéolo (mais concentrado) para o
     capilar (menos concentrado); o CO2 faz o caminho inverso. Não há
     bomba nem transporte ativo nessa troca. */
  const ar = humRefs.partAr;
  const nAr = ar.count;
  for (let i = 0; i < nAr; i++){
    const s = (humAnim.t*(0.06 + 0.10*(1 - p.oxigenio)) + i/nAr) % 1;
    humPosicionar(i, ar, humRefs.rotaAr, s, 0.8 + 0.7*Math.abs(Math.sin(humAnim.t*3 + i*1.1)));
  }
  ar.instanceMatrix.needsUpdate = true;

  /* O2 que atravessa a membrana respiratória até a hemácia. */
  const o2 = humRefs.partO2;
  const porRota = Math.ceil(o2.count/humRefs.rotasHematose.length);
  for (let i = 0; i < o2.count; i++){
    const rota = humRefs.rotasHematose[i % humRefs.rotasHematose.length];
    const s = (humAnim.t*(0.10 + 0.16*p.oxigenio) + (i/porRota)) % 1;
    humPosicionar(i, o2, rota, s, 1);
  }
  o2.instanceMatrix.needsUpdate = true;

  /* Hemácias em destaque percorrendo alvéolo -> capilar -> hemácia. */
  for (let i = 0; i < humRefs.hemacias.length; i++){
    const h = humRefs.hemacias[i];
    h.s = (h.s + passo*h.vel*(0.6 + 0.8*p.oxigenio)) % 1;
    humRefs.rotasHematose[h.rota].getPointAt(h.s, humVA);
    h.malha.position.copy(humVA);
    h.malha.rotation.y += passo*2.4;
  }

  /* ------------------ NÉFRON: FILTRAÇÃO E ADH ----------------------
     O filtrado percorre glomérulo -> cápsula -> túbulo -> ducto coletor.
     A cor caminha do amarelo claro (filtrado diluído) ao âmbar escuro
     (urina concentrada pelo ADH). */
  const filtrado = humRefs.partFiltrado;
  const nFilt = filtrado.count;
  const velFilt = 0.05 + 0.06*humRefs.taxaFiltracao;
  for (let i = 0; i < nFilt; i++){
    const s = (humAnim.t*velFilt + i/nFilt) % 1;
    humPosicionar(i, filtrado, humRefs.rotaFiltrado, s, 1);
    humC0.lerpColors(humCorFiltrado, humCorUrina, THREE.MathUtils.smoothstep(s, 0.30, 0.95));
    filtrado.setColorAt(i, humC0);
  }
  filtrado.instanceMatrix.needsUpdate = true;
  filtrado.instanceColor.needsUpdate = true;

  /* Reabsorção: a FRAÇÃO de partículas que retorna ao capilar peritubular
     cresce quando a hidratação cai (ADH). As demais seguem para o ducto
     coletor e formam a urina concentrada. A aldosterona soma-se ao ADH
     aumentando a reabsorção de sódio, e a água acompanha o sódio. */
  const reabs = humRefs.partReabsorvido;
  const nReabs = reabs.count;
  const ativos = Math.max(1, Math.round(nReabs*humRefs.taxaReabsorcao));
  humAnim.reabsorcao += passo*(0.20 + 0.35*humRefs.taxaReabsorcao);
  for (let i = 0; i < nReabs; i++){
    const ativo = i < ativos;
    const s = (humAnim.reabsorcao + i/ativos) % 1;
    humPosicionar(i, reabs, humRefs.rotaReabsorcao, s, ativo ? 1 : 0.001);
  }
  reabs.instanceMatrix.needsUpdate = true;

  /* Ondas peristálticas do túbulo contorcido (contração da musculatura
     lisa tubular, que ajuda a conduzir o filtrado). */
  const posT = humRefs.tubulo.geometry.attributes.position;
  const baseT = humRefs.tubuloBase;
  for (let i = 0; i < posT.count; i++){
    const b = baseT[i];
    const x = posT.getX(i), z = posT.getZ(i);
    const rAtual = Math.hypot(x, z);
    if (rAtual < 1e-5) continue;
    const onda = (b.r*(1 + 0.055*Math.sin(b.y*1.6 - humAnim.t*2.2)))/rAtual;
    posT.setX(i, x*onda);
    posT.setZ(i, z*onda);
  }
  posT.needsUpdate = true;

  /* ------------------- CONDUÇÃO SALTATÓRIA -------------------------
     O potencial de ação salta de nódulo em nódulo (nódulos de Ranvier):
     é a CONDUÇÃO SALTATÓRIA, muito mais rápida que a condução contínua,
     pois só há despolarização nas interrupções da bainha de mielina. A
     velocidade visível cresce com fc (simpático e adrenalina). */
  humAnim.nervo += passo*humRefs.velNervo;
  for (let i = 0; i < humRefs.potenciais.length; i++){
    const pot = humRefs.potenciais[i];
    const s = (humAnim.nervo + i/3) % 1;
    humRefs.rotaNervo.getPointAt(s, humVA);
    pot.malha.position.copy(humVA);
    humV3Escala.setScalar(0.7 + 0.5*Math.abs(Math.sin(s*Math.PI*12)));
    pot.malha.scale.copy(humV3Escala);
  }

  /* ------------------------- PAINEL 3D ---------------------------- */
  humRefs.anel.scale.setScalar(0.82 + 0.30*p.oxigenio);
  humRefs.anel2.scale.setScalar(0.82 + 0.34*p.co2);
  humRefs.dial.rotation.z -= passo*(0.30 + 1.60*p.fc);

  /* Reaplica os parâmetros dependentes (sem alocação por quadro). */
  humApply();
}
