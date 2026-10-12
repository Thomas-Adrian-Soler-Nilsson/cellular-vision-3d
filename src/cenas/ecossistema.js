import * as THREE from 'three';

/* =====================================================================
   CENA 3D — ECOSSISTEMA
   Paisagem didática legível (não fotorrealista) para os temas de
   Ecologia, Evolução, Botânica e Química Ambiental do projeto.
   ---------------------------------------------------------------------
   Todo nome de nível superior começa com "eco" ou "ECO_" porque o build
   concatena todos os arquivos do projeto em um único escopo de módulo.
   A câmera do projeto observa a cena a ~28 unidades; todo o conteúdo
   fica, portanto, dentro de um raio aproximado de 16 unidades.
   ===================================================================== */

/* ---------------------------------------------------------------------
   PARÂMETROS — fonte única de verdade, sempre lida por ecoApply()
   --------------------------------------------------------------------- */
export const ecoParams = {
  co2: 0.4,        // 0..1 concentração de CO2 atmosférico
  vegetacao: 0.7,  // 0..1 cobertura vegetal
  emissao: 0.4,    // 0..1 emissão de poluentes
  tratamento: 0.3, // 0..1 fração de esgoto tratado
  selecao: 0.5,    // 0..1 pressão seletiva (variação de cor das mariposas)
  mutacao: 0.3,    // 0..1 taxa de mutação
  umidade: 0.5,    // 0..1 umidade do ambiente (relevante para artrópodes)
  temp: 0.5,       // 0..1 temperatura
  luz: 0.6,        // 0..1 intensidade luminosa (fotossíntese / fitocromo)
  agua: 0.6        // 0..1 disponibilidade de água (estômatos)
};

/* ---------------------------------------------------------------------
   RAIZ DA CENA — o motor já a adiciona à cena e controla a visibilidade
   --------------------------------------------------------------------- */
export const ecoRoot = new THREE.Group();
ecoRoot.name = 'ecossistema';
ecoRoot.visible = false;

/* ---------------------------------------------------------------------
   CONSTANTES GEOMÉTRICAS
   --------------------------------------------------------------------- */
const ECO_RAIO_CENA = 16;          // limite aproximado do conteúdo
const ECO_LADO_TERRENO = 32;       // meia-extensão de 16 unidades
const ECO_SEGMENTOS_TERRENO = 64;

const ECO_LAGO_X = -5.2;           // centro da depressão do lago
const ECO_LAGO_Z = -3.6;
const ECO_LAGO_RAIO = 6.4;         // raio da bacia esculpida no terreno
const ECO_AGUA_RAIO = 5.7;         // raio da malha de água (dentro da bacia)
const ECO_NIVEL_AGUA = -0.84;      // cota do lençol: -0.28 x profundidade da bacia
const ECO_PROFUNDIDADE_BACIA = 3.0;

const ECO_CHAMINE_X = 8.0;         // indústria estilizada
const ECO_CHAMINE_Z = -7.0;
const ECO_TRONCO_X = 4.6;          // tronco destacado com liquens
const ECO_TRONCO_Z = 5.4;
const ECO_FOLHA_X = 7.4;           // folha em destaque (estômatos)
const ECO_FOLHA_Z = -1.2;

const ECO_ARVORES_MIN = 14;        // faixa pedida: 14 a 22 árvores visíveis
const ECO_ARVORES_MAX = 22;
const ECO_ARVORES_CAP = 22;        // instâncias alocadas de uma vez
const ECO_MARIPOSAS_CAP = 60;      // faixa pedida: 30 a 60 mariposas
const ECO_CARBONO_CAP = 240;       // partículas de CO2 (THREE.Points)
const ECO_FUMACA_CAP = 72;
const ECO_ALGAS_CAP = 72;
const ECO_LIQUENS_CAP = 44;
const ECO_ESTOMATOS_CAP = 22;
const ECO_NUVENS_CAP = 8;          // faixa pedida: 6 a 10 nuvens

const ECO_EIXO_Y = new THREE.Vector3(0, 1, 0);

/* ---------------------------------------------------------------------
   ESTADO DO MÓDULO (referências guardadas para ecoApply e update)
   --------------------------------------------------------------------- */
let ecoConstruido = false;
let ecoTempo = 0;

let ecoTerreno = null;
let ecoAgua = null;
let ecoAguaGeo = null;
let ecoAguaBase = null;
let ecoAguaTotal = 0;

let ecoTroncos = null;
let ecoCopas = null;
let ecoArvores = [];
let ecoArvoresVisiveis = ECO_ARVORES_MIN;

let ecoNuvens = [];
let ecoNuvensVel = [];

let ecoIndustria = null;
let ecoChamine = null;
let ecoFumacaGeo = null;
let ecoFumacaY = null;
let ecoFumacaDX = null;
let ecoFumacaDZ = null;
let ecoFumacaVisivel = 0;
let ecoFumacaTopo = 0;

let ecoCarbonoGeo = null;
let ecoCarbonoX = null;
let ecoCarbonoY = null;
let ecoCarbonoZ = null;
let ecoCarbonoFase = null;
let ecoCarbonoVel = null;
let ecoCarbonoAlvo = null;
let ecoCarbonoVisivel = 0;

let ecoMariposas = null;
let ecoMariposaTraco = null;
let ecoMariposaBase = null;
let ecoMariposaFase = null;
let ecoMariposasVisiveis = 30;

let ecoTroncoDestaque = null;
let ecoLiquens = null;

let ecoAlgas = null;
let ecoAlgasVisiveis = 0;
let ecoAlgaBase = null;

let ecoFolhaGrupo = null;
let ecoFolha = null;
let ecoEstomatos = null;

let ecoLuzLago = null;

/* materiais atualizados por ecoApply */
let ecoMatTerreno = null;
let ecoMatAgua = null;
let ecoMatTronco = null;
let ecoMatCopa = null;
let ecoMatNuvem = null;
let ecoMatFumaca = null;
let ecoMatCarbono = null;
let ecoMatEsgoto = null;
let ecoMatEsgotoFluxo = null;
let ecoMatMariposa = null;
let ecoMatTroncoDestaque = null;
let ecoMatLiquen = null;
let ecoMatAlga = null;
let ecoMatFolha = null;
let ecoMatEstomato = null;

/* fatores derivados dos parâmetros, calculados em ecoApply e usados no update */
let ecoFatorEmissao = 0.4;
let ecoFatorCo2 = 0.4;

/* objetos temporários reutilizados (nenhuma alocação por quadro) */
const ecoDummy = new THREE.Object3D();
const ecoTmpVecA = new THREE.Vector3();
const ecoTmpColor = new THREE.Color();
const ecoCorCopaA = new THREE.Color(0x6ea23c);
const ecoCorCopaB = new THREE.Color(0x2f5a24);
const ecoCorMariposaClara = new THREE.Color(0xdcd6bf);
const ecoCorMariposaEscura = new THREE.Color(0x2b2723);
const ecoCorAguaLimpa = new THREE.Color(0x2f86c8);
const ecoCorAguaTurva = new THREE.Color(0x59783a);
const ecoCorLiquenClaro = new THREE.Color(0xa9c67c);
const ecoCorLiquenJovem = new THREE.Color(0xbfd68f);
const ecoCorLiquenFuligem = new THREE.Color(0x3a3d31);
const ecoCorFumacaClara = new THREE.Color(0xc3c9cd);
const ecoCorFumacaEscura = new THREE.Color(0x24242a);
const ecoCorNuvemLimpa = new THREE.Color(0xf1f6fb);
const ecoCorNuvemSmog = new THREE.Color(0x9d9683);
const ecoCorEsgotoBruto = new THREE.Color(0x6d5a34);
const ecoCorEsgotoTratado = new THREE.Color(0x8fd3e6);

/* ---------------------------------------------------------------------
   UTILIDADES
   --------------------------------------------------------------------- */
function ecoClamp(v, a, b){
  return v < a ? a : (v > b ? b : v);
}

function ecoSmooth(t){
  const k = ecoClamp(t, 0, 1);
  return k * k * (3 - 2 * k);
}

function ecoLerp(a, b, t){
  return a + (b - a) * t;
}

/* gerador pseudoaleatório determinístico (LCG) — a cena é sempre a mesma */
let ecoSemente = 20241012;
function ecoRand(){
  ecoSemente = (ecoSemente * 1664525 + 1013904223) % 4294967296;
  return ecoSemente / 4294967296;
}

/* Perfil do terreno: colinas suaves (senos) + depressão em bacia elíptica.
   A bacia é o que permite a existência do lago: sem a depressão a água
   escoaria e não haveria ambiente lêntico (lago) para a eutrofização. */
function ecoAltura(x, z){
  const ruido = Math.sin(x * 0.36) * 0.30
              + Math.cos(z * 0.31) * 0.26
              + Math.sin((x + z) * 0.23) * 0.22;

  const dx = x - ECO_LAGO_X;
  const dz = z - ECO_LAGO_Z;
  const d = Math.sqrt(dx * dx + dz * dz);
  const rd = ecoClamp(d / ECO_LAGO_RAIO, 0, 1);
  const bacia = 1 - rd * rd;   // 1 no centro, 0 na borda da bacia

  /* dentro da bacia o relevo é atenuado: o fundo é liso e submerso */
  return ruido * (1 - 0.8 * bacia) - ECO_PROFUNDIDADE_BACIA * bacia;
}

/* Disco radial com resolução interna, usado como superfície da água
   (a malha precisa de anéis para ondular verticalmente no update). */
function ecoCriarDisco(raio, aneis, setores){
  const pos = [0, 0, 0];
  const idx = [];

  for (let a = 1; a <= aneis; a++){
    const r = raio * (a / aneis);
    for (let s = 0; s < setores; s++){
      const th = (s / setores) * Math.PI * 2;
      pos.push(Math.cos(th) * r, 0, Math.sin(th) * r);
    }
  }

  for (let s = 0; s < setores; s++){
    idx.push(0, 1 + s, 1 + ((s + 1) % setores));
  }
  for (let a = 1; a < aneis; a++){
    const base = 1 + (a - 1) * setores;
    const prox = base + setores;
    for (let s = 0; s < setores; s++){
      const s2 = (s + 1) % setores;
      idx.push(base + s, prox + s, base + s2);
      idx.push(base + s2, prox + s, prox + s2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/* orienta um cilindro de altura 1 entre dois pontos do espaço */
function ecoPosicionarCilindro(mesh, ax, ay, az, bx, by, bz){
  ecoTmpVecA.set(bx - ax, by - ay, bz - az);
  const comp = ecoTmpVecA.length() || 0.0001;
  mesh.position.set((ax + bx) * 0.5, (ay + by) * 0.5, (az + bz) * 0.5);
  mesh.quaternion.setFromUnitVectors(ECO_EIXO_Y, ecoTmpVecA.normalize());
  mesh.scale.set(1, comp, 1);
}

/* ---------------------------------------------------------------------
   (a) TERRENO — solo/grama ondulados, com cores por vértice
   --------------------------------------------------------------------- */
function ecoBuildTerreno(){
  const geo = new THREE.PlaneGeometry(
    ECO_LADO_TERRENO, ECO_LADO_TERRENO,
    ECO_SEGMENTOS_TERRENO, ECO_SEGMENTOS_TERRENO
  );
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const cores = new Float32Array(pos.count * 3);
  const grama = new THREE.Color(0x4f7a34);
  const gramaClara = new THREE.Color(0x6d9440);
  const solo = new THREE.Color(0x6b5a3f);
  const areia = new THREE.Color(0x8d7f5a);
  const lodo = new THREE.Color(0x3c4a33);

  for (let i = 0; i < pos.count; i++){
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = ecoAltura(x, z);
    pos.setY(i, y);

    const dx = x - ECO_LAGO_X;
    const dz = z - ECO_LAGO_Z;
    const d = Math.sqrt(dx * dx + dz * dz);

    /* solo exposto nos topos, grama nas encostas, areia/lodo na margem */
    ecoTmpColor.copy(grama).lerp(gramaClara, ecoSmooth((y + 0.6) / 1.8));
    ecoTmpColor.lerp(solo, ecoClamp((y - 0.35) / 0.7, 0, 1) * 0.55);
    if (d < ECO_LAGO_RAIO + 0.9){
      ecoTmpColor.lerp(areia, ecoClamp((ECO_LAGO_RAIO + 0.9 - d) / 1.4, 0, 1) * 0.6);
    }
    if (d < ECO_LAGO_RAIO){
      ecoTmpColor.lerp(lodo, ecoClamp((ECO_LAGO_RAIO - d) / 2.2, 0, 1));
    }

    cores[i * 3] = ecoTmpColor.r;
    cores[i * 3 + 1] = ecoTmpColor.g;
    cores[i * 3 + 2] = ecoTmpColor.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  geo.computeVertexNormals();

  ecoMatTerreno = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.96, metalness: 0.0, flatShading: false
  });

  ecoTerreno = new THREE.Mesh(geo, ecoMatTerreno);
  ecoTerreno.name = 'eco-terreno';
  ecoRoot.add(ecoTerreno);
}

/* ---------------------------------------------------------------------
   (b) LAGO — ambiente lêntico em depressão; a água ondula no update.
   A disponibilidade de água também é o insumo da fotólise (ver (j)).
   --------------------------------------------------------------------- */
function ecoBuildLago(){
  ecoAguaGeo = ecoCriarDisco(ECO_AGUA_RAIO, 9, 44);
  ecoAguaTotal = ecoAguaGeo.attributes.position.count;

  const base = ecoAguaGeo.attributes.position.array;
  ecoAguaBase = new Float32Array(base.length);
  ecoAguaBase.set(base);

  ecoMatAgua = new THREE.MeshStandardMaterial({
    color: ecoCorAguaLimpa.clone(),
    roughness: 0.12,
    metalness: 0.05,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    depthWrite: false,
    emissive: 0x0b2b33,
    emissiveIntensity: 0.25
  });

  ecoAgua = new THREE.Mesh(ecoAguaGeo, ecoMatAgua);
  ecoAgua.name = 'eco-lago';
  ecoAgua.position.set(ECO_LAGO_X, ECO_NIVEL_AGUA, ECO_LAGO_Z);
  ecoAgua.renderOrder = 2;
  ecoRoot.add(ecoAgua);

  /* única luz local da cena: dá vida ao lago, intensidade sempre <= 6 */
  ecoLuzLago = new THREE.PointLight(0x59d4e8, 3.0, 18, 2);
  ecoLuzLago.position.set(ECO_LAGO_X, ECO_NIVEL_AGUA + 1.4, ECO_LAGO_Z);
  ecoRoot.add(ecoLuzLago);
}

/* ---------------------------------------------------------------------
   (c) VEGETAÇÃO — árvores estilizadas (tronco cilíndrico + copa).
   A quantidade visível cresce com ecoParams.vegetacao.
   --------------------------------------------------------------------- */
function ecoBuildVegetacao(){
  const geoBase = new THREE.CylinderGeometry(0.09, 0.16, 1, 7);
  geoBase.translate(0, 0.5, 0);   // pivô na base, para erguer a árvore no solo
  const geoCopa = new THREE.IcosahedronGeometry(1, 1);

  ecoMatTronco = new THREE.MeshStandardMaterial({ color: 0x6a4a2c, roughness: 0.92, metalness: 0.0 });
  ecoMatCopa = new THREE.MeshStandardMaterial({
    color: ecoCorCopaA.clone(), roughness: 0.78, metalness: 0.0,
    emissive: 0x123a12, emissiveIntensity: 0.3, flatShading: true
  });

  ecoTroncos = new THREE.InstancedMesh(geoBase, ecoMatTronco, ECO_ARVORES_CAP);
  ecoCopas = new THREE.InstancedMesh(geoCopa, ecoMatCopa, ECO_ARVORES_CAP);
  ecoTroncos.frustumCulled = false;
  ecoCopas.frustumCulled = false;
  ecoTroncos.raycast = () => {};
  ecoCopas.raycast = () => {};

  ecoArvores = [];
  let tentativas = 0;
  while (ecoArvores.length < ECO_ARVORES_CAP && tentativas < 900){
    tentativas++;
    const ang = ecoRand() * Math.PI * 2;
    const raio = 7.6 + ecoRand() * 6.6;
    const x = Math.cos(ang) * raio;
    const z = Math.sin(ang) * raio;
    if (Math.hypot(x - ECO_LAGO_X, z - ECO_LAGO_Z) < ECO_LAGO_RAIO + 1.2) continue;
    if (Math.hypot(x, z) > ECO_RAIO_CENA - 1.2) continue;
    if (Math.hypot(x - ECO_CHAMINE_X, z - ECO_CHAMINE_Z) < 3.2) continue;
    if (Math.hypot(x - ECO_TRONCO_X, z - ECO_TRONCO_Z) < 1.6) continue;

    const y = ecoAltura(x, z);
    if (y < ECO_NIVEL_AGUA + 0.25) continue;

    const alturaTronco = 1.1 + ecoRand() * 1.3;
    const raioCopa = 0.62 + ecoRand() * 0.5;
    ecoArvores.push({
      x: x, y: y, z: z,
      altura: alturaTronco,
      copa: raioCopa,
      giro: ecoRand() * Math.PI * 2,
      balanco: 0.5 + ecoRand() * 0.9
    });
  }

  for (let i = 0; i < ECO_ARVORES_CAP; i++){
    const a = ecoArvores[i % ecoArvores.length] || { x: 0, y: 0, z: 0, altura: 1.4, copa: 0.8, giro: 0, balanco: 1 };

    ecoDummy.position.set(a.x, a.y, a.z);
    ecoDummy.rotation.set(0, a.giro, 0);
    ecoDummy.scale.set(1, a.altura, 1);
    ecoDummy.updateMatrix();
    ecoTroncos.setMatrixAt(i, ecoDummy.matrix);

    ecoDummy.position.set(a.x, a.y + a.altura + a.copa * 0.55, a.z);
    ecoDummy.rotation.set(0, a.giro, 0);
    ecoDummy.scale.set(a.copa, a.copa * 1.15, a.copa);
    ecoDummy.updateMatrix();
    ecoCopas.setMatrixAt(i, ecoDummy.matrix);

    /* leve variação de tom entre indivíduos (variabilidade intraespecífica) */
    ecoTmpColor.copy(ecoCorCopaA).lerp(ecoCorCopaB, 0.15 + 0.45 * ecoRand());
    ecoCopas.setColorAt(i, ecoTmpColor);
  }

  ecoTroncos.instanceMatrix.needsUpdate = true;
  ecoCopas.instanceMatrix.needsUpdate = true;
  if (ecoCopas.instanceColor) ecoCopas.instanceColor.needsUpdate = true;

  ecoRoot.add(ecoTroncos);
  ecoRoot.add(ecoCopas);
}

/* ---------------------------------------------------------------------
   (d) ATMOSFERA — nuvens estilizadas (esferas achatadas) à deriva
   --------------------------------------------------------------------- */
function ecoBuildNuvens(){
  const geoCli = new THREE.SphereGeometry(1, 12, 9);
  ecoMatNuvem = new THREE.MeshStandardMaterial({
    color: ecoCorNuvemLimpa.clone(),
    roughness: 0.95, metalness: 0.0,
    transparent: true, opacity: 0.9, depthWrite: false
  });

  ecoNuvens = [];
  ecoNuvensVel = [];

  for (let n = 0; n < ECO_NUVENS_CAP; n++){
    const grupo = new THREE.Group();
    const partes = 3 + Math.floor(ecoRand() * 3);
    for (let p = 0; p < partes; p++){
      const bola = new THREE.Mesh(geoCli, ecoMatNuvem);
      bola.position.set((p - partes * 0.5) * 0.95 + ecoRand() * 0.3, ecoRand() * 0.25, ecoRand() * 0.35 - 0.15);
      const s = 0.55 + ecoRand() * 0.5;
      bola.scale.set(s * 1.5, s * 0.62, s);
      grupo.add(bola);
    }
    grupo.position.set(-ECO_RAIO_CENA + ecoRand() * ECO_RAIO_CENA * 2, 9.2 + ecoRand() * 3.4, -ECO_RAIO_CENA + ecoRand() * ECO_RAIO_CENA * 2);
    ecoRoot.add(grupo);
    ecoNuvens.push(grupo);
    ecoNuvensVel.push(0.22 + ecoRand() * 0.42);
  }
}

/* ---------------------------------------------------------------------
   (e) CICLO DO CARBONO — partículas de CO2 que sobem da chaminé e são
   absorvidas pelas copas.
   RIGOR: na fotossíntese o O2 liberado vem da FOTÓLISE DA ÁGUA, não do
   CO2. O CO2 entra como fonte de carbono para o ciclo de Calvin (fixação
   em compostos orgânicos); a água é o doador de elétrons e a origem do
   oxigênio molecular. A chamada "fase escura" (ciclo de Calvin) não
   ocorre obrigatoriamente no escuro: ela depende de ATP e NADPH e é
   inibida quando a luz é cortada por tempo suficiente para esgotá-los.
   --------------------------------------------------------------------- */
function ecoBuildCarbono(){
  ecoCarbonoX = new Float32Array(ECO_CARBONO_CAP);
  ecoCarbonoY = new Float32Array(ECO_CARBONO_CAP);
  ecoCarbonoZ = new Float32Array(ECO_CARBONO_CAP);
  ecoCarbonoFase = new Float32Array(ECO_CARBONO_CAP);
  ecoCarbonoVel = new Float32Array(ECO_CARBONO_CAP);
  ecoCarbonoAlvo = new Int32Array(ECO_CARBONO_CAP);

  const baseX = ECO_CHAMINE_X;
  const baseZ = ECO_CHAMINE_Z;
  const baseY = ecoAltura(baseX, baseZ) + 4.6;

  const posicoes = new Float32Array(ECO_CARBONO_CAP * 3);
  for (let i = 0; i < ECO_CARBONO_CAP; i++){
    ecoCarbonoX[i] = baseX;
    ecoCarbonoY[i] = baseY;
    ecoCarbonoZ[i] = baseZ;
    ecoCarbonoFase[i] = ecoRand();
    ecoCarbonoVel[i] = 0.7 + ecoRand() * 0.7;
    ecoCarbonoAlvo[i] = i % ECO_ARVORES_CAP;
    posicoes[i * 3] = ecoCarbonoX[i];
    posicoes[i * 3 + 1] = ecoCarbonoY[i];
    posicoes[i * 3 + 2] = ecoCarbonoZ[i];
  }

  ecoCarbonoGeo = new THREE.BufferGeometry();
  ecoCarbonoGeo.setAttribute('position', new THREE.BufferAttribute(posicoes, 3));

  ecoMatCarbono = new THREE.PointsMaterial({
    color: 0xdfe8ef, size: 0.20, sizeAttenuation: true,
    transparent: true, opacity: 0.55, depthWrite: false
  });

  const pontos = new THREE.Points(ecoCarbonoGeo, ecoMatCarbono);
  pontos.name = 'eco-ciclo-carbono';
  pontos.frustumCulled = false;
  ecoRoot.add(pontos);
}

/* ---------------------------------------------------------------------
   (f) INDÚSTRIA E ESGOTO — caixa + chaminé; o cano despeja no lago.
   EUTROFIZAÇÃO: o excesso de nitrogênio e fósforo fertiliza o lago e
   provoca proliferação de algas; a mortandade de peixes decorre de
   ANOXIA — os decompositores consomem o oxigênio dissolvido ao degradar
   a matéria orgânica —, e não de uma toxidez direta dos nutrientes.
   --------------------------------------------------------------------- */
function ecoBuildIndustria(){
  const x = ECO_CHAMINE_X;
  const z = ECO_CHAMINE_Z;
  const solo = ecoAltura(x, z);

  ecoIndustria = new THREE.Group();
  ecoIndustria.position.set(x, solo, z);

  const matPredio = new THREE.MeshStandardMaterial({ color: 0x8a8f96, roughness: 0.72, metalness: 0.25 });
  const matTelhado = new THREE.MeshStandardMaterial({ color: 0x5b6068, roughness: 0.6, metalness: 0.35 });
  const matChamine = new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.55, metalness: 0.3 });

  const galpao = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.5, 2.0), matPredio);
  galpao.position.y = 0.75;
  ecoIndustria.add(galpao);

  const telhado = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 2.2), matTelhado);
  telhado.position.y = 1.58;
  ecoIndustria.add(telhado);

  const cano = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 3.1, 12), matChamine);
  cano.position.set(0.95, 3.1, 0);
  ecoIndustria.add(cano);

  ecoChamine = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.30, 0.3, 12), matTelhado);
  ecoChamine.position.set(0.95, 4.75, 0);
  ecoIndustria.add(ecoChamine);

  ecoRoot.add(ecoIndustria);

  ecoFumacaTopo = solo + 5.0;

  /* fumaça: material particulado que escurece com a emissão */
  ecoFumacaY = new Float32Array(ECO_FUMACA_CAP);
  ecoFumacaDX = new Float32Array(ECO_FUMACA_CAP);
  ecoFumacaDZ = new Float32Array(ECO_FUMACA_CAP);
  const pos = new Float32Array(ECO_FUMACA_CAP * 3);
  for (let i = 0; i < ECO_FUMACA_CAP; i++){
    ecoFumacaY[i] = ecoRand() * 2.4;
    ecoFumacaDX[i] = (ecoRand() - 0.5) * 0.9;
    ecoFumacaDZ[i] = (ecoRand() - 0.5) * 0.9;
    pos[i * 3] = x + 0.95 + ecoFumacaDX[i];
    pos[i * 3 + 1] = ecoFumacaTopo + ecoFumacaY[i];
    pos[i * 3 + 2] = z + ecoFumacaDZ[i];
  }

  const geoFumaca = new THREE.BufferGeometry();
  geoFumaca.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  ecoMatFumaca = new THREE.PointsMaterial({
    color: 0x9a9a9a, size: 0.62, sizeAttenuation: true,
    transparent: true, opacity: 0.4, depthWrite: false
  });
  const fumaca = new THREE.Points(geoFumaca, ecoMatFumaca);
  fumaca.name = 'eco-fumaca';
  fumaca.frustumCulled = false;
  ecoRoot.add(fumaca);
  ecoFumacaGeo = geoFumaca;
}

function ecoBuildEsgoto(){
  const soloInd = ecoAltura(ECO_CHAMINE_X, ECO_CHAMINE_Z);
  const ax = ECO_CHAMINE_X - 1.5;
  const az = ECO_CHAMINE_Z + 0.6;
  const ay = soloInd + 0.55;

  /* destino: borda do lago, onde o esgoto é lançado */
  const bx = ECO_LAGO_X + ECO_AGUA_RAIO * 0.72;
  const bz = ECO_LAGO_Z + ECO_AGUA_RAIO * 0.62;
  const by = ECO_NIVEL_AGUA + 0.22;

  const matCano = new THREE.MeshStandardMaterial({ color: 0x707880, roughness: 0.6, metalness: 0.35 });
  const tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1, 10), matCano);
  ecoPosicionarCilindro(tubo, ax, ay, az, bx, by, bz);
  ecoRoot.add(tubo);

  /* efluente: interpola entre esgoto bruto e efluente tratado */
  ecoMatEsgotoFluxo = new THREE.MeshStandardMaterial({
    color: ecoCorEsgotoBruto.clone(), roughness: 0.25, metalness: 0.05,
    transparent: true, opacity: 0.85, emissive: 0x14100a, emissiveIntensity: 0.3
  });
  ecoMatEsgoto = ecoMatEsgotoFluxo;
  const fluxo = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1, 8), ecoMatEsgotoFluxo);
  ecoPosicionarCilindro(
    fluxo,
    ax + (bx - ax) * 0.55, ay + (by - ay) * 0.55,
    az + (bz - az) * 0.55,
    bx, by, bz
  );
  ecoRoot.add(fluxo);
}

/* ---------------------------------------------------------------------
   (g) MARIPOSAS — MELANISMO INDUSTRIAL / SELEÇÃO NATURAL
   RIGOR: as mariposas escuras JÁ EXISTIAM na população, geradas por
   mutação e recombinação. A fuligem não induz a cor: ela apenas muda a
   pressão seletiva, tornando as escuras crípticas sobre troncos
   escurecidos (e as claras, expostas à predação). Trata-se de seleção
   direcional sobre variação pré-existente, não de adaptação dirigida.
   --------------------------------------------------------------------- */
function ecoBuildMariposas(){
  const geo = new THREE.PlaneGeometry(0.26, 0.19);
  ecoMatMariposa = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.85, metalness: 0.0,
    side: THREE.DoubleSide, transparent: false
  });

  ecoMariposas = new THREE.InstancedMesh(geo, ecoMatMariposa, ECO_MARIPOSAS_CAP);
  ecoMariposas.frustumCulled = false;
  ecoMariposas.raycast = () => {};

  ecoMariposaTraco = new Float32Array(ECO_MARIPOSAS_CAP);
  ecoMariposaFase = new Float32Array(ECO_MARIPOSAS_CAP);
  ecoMariposaBase = [];

  for (let i = 0; i < ECO_MARIPOSAS_CAP; i++){
    const a = ecoArvores[i % ecoArvores.length] || { x: 0, y: 0, z: 0, altura: 1.4, copa: 0.8 };
    const ang = ecoRand() * Math.PI * 2;
    const raio = 0.5 + ecoRand() * 0.8;
    ecoMariposaBase.push({
      x: a.x + Math.cos(ang) * raio,
      y: a.y + a.altura * (0.55 + ecoRand() * 0.4),
      z: a.z + Math.sin(ang) * raio,
      giro: ecoRand() * Math.PI * 2,
      amp: 0.07 + ecoRand() * 0.1
    });
    /* variação pré-existente: 0 = clara, 1 = escura */
    ecoMariposaTraco[i] = ecoRand();
    ecoMariposaFase[i] = ecoRand() * Math.PI * 2;

    ecoTmpColor.copy(ecoCorMariposaClara);
    ecoMariposas.setColorAt(i, ecoTmpColor);
  }

  ecoMariposas.instanceMatrix.needsUpdate = true;
  if (ecoMariposas.instanceColor) ecoMariposas.instanceColor.needsUpdate = true;
  ecoRoot.add(ecoMariposas);
}

/* ---------------------------------------------------------------------
   (h) TRONCO DESTACADO COM LIQUENS — o marcador clássico do melanismo:
   liquens claros sobre casca clara antes da industrialização; a fuligem
   escurece ambos e inverte o valor críptico das duas formas.
   --------------------------------------------------------------------- */
function ecoBuildTroncoDestaque(){
  const x = ECO_TRONCO_X;
  const z = ECO_TRONCO_Z;
  const y = ecoAltura(x, z);

  const grupo = new THREE.Group();
  grupo.position.set(x, y, z);

  ecoMatTroncoDestaque = new THREE.MeshStandardMaterial({ color: 0x8d7c5f, roughness: 0.94, metalness: 0.0 });
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.68, 4.4, 14), ecoMatTroncoDestaque);
  tronco.position.y = 2.2;
  grupo.add(tronco);
  ecoTroncoDestaque = tronco;

  ecoMatLiquen = new THREE.MeshStandardMaterial({ color: ecoCorLiquenClaro.clone(), roughness: 0.88, metalness: 0.0 });
  ecoLiquens = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.11, 0), ecoMatLiquen, ECO_LIQUENS_CAP);
  ecoLiquens.frustumCulled = false;
  ecoLiquens.raycast = () => {};

  for (let i = 0; i < ECO_LIQUENS_CAP; i++){
    const th = ecoRand() * Math.PI * 2;
    const hy = 0.35 + (i / ECO_LIQUENS_CAP) * 3.6 + ecoRand() * 0.2;
    const r = 0.56 + (hy / 4.4) * 0.12;
    const s = 0.7 + ecoRand() * 0.8;

    ecoDummy.position.set(Math.cos(th) * r, hy, Math.sin(th) * r);
    ecoDummy.rotation.set(ecoRand() * 3.1, th, ecoRand() * 3.1);
    ecoDummy.scale.set(s, s * 0.6, s);
    ecoDummy.updateMatrix();
    ecoLiquens.setMatrixAt(i, ecoDummy.matrix);

    ecoTmpColor.copy(ecoCorLiquenClaro).lerp(ecoCorLiquenJovem, ecoRand() * 0.5);
    ecoLiquens.setColorAt(i, ecoTmpColor);
  }

  ecoLiquens.instanceMatrix.needsUpdate = true;
  if (ecoLiquens.instanceColor) ecoLiquens.instanceColor.needsUpdate = true;
  grupo.add(ecoLiquens);
  ecoRoot.add(grupo);
}

/* ---------------------------------------------------------------------
   (i) ALGAS / PLANTAS AQUÁTICAS — a resposta visível da eutrofização:
   mais nutrientes (emissão + CO2) e menos tratamento significam mais
   biomassa de produtores; o excesso leva à anoxia descrita em (f).
   --------------------------------------------------------------------- */
function ecoBuildAlgas(){
  const geo = new THREE.ConeGeometry(0.11, 0.5, 6);
  geo.translate(0, 0.25, 0);

  ecoMatAlga = new THREE.MeshStandardMaterial({
    color: 0x3f6b2c, roughness: 0.8, metalness: 0.0,
    emissive: 0x0d2408, emissiveIntensity: 0.35
  });

  ecoAlgas = new THREE.InstancedMesh(geo, ecoMatAlga, ECO_ALGAS_CAP);
  ecoAlgas.frustumCulled = false;
  ecoAlgas.raycast = () => {};

  ecoAlgaBase = [];
  for (let i = 0; i < ECO_ALGAS_CAP; i++){
    const ang = ecoRand() * Math.PI * 2;
    const r = Math.sqrt(ecoRand()) * (ECO_AGUA_RAIO - 0.5);
    const s = 0.7 + ecoRand() * 0.9;
    ecoAlgaBase.push({
      x: Math.cos(ang) * r,
      z: Math.sin(ang) * r,
      giro: ecoRand() * Math.PI * 2,
      escala: s,
      fase: ecoRand() * Math.PI * 2
    });
    ecoDummy.position.set(ecoAlgaBase[i].x, 0, ecoAlgaBase[i].z);
    ecoDummy.rotation.set(0, ecoAlgaBase[i].giro, 0);
    ecoDummy.scale.set(1, s, 1);
    ecoDummy.updateMatrix();
    ecoAlgas.setMatrixAt(i, ecoDummy.matrix);
  }

  ecoAlgas.instanceMatrix.needsUpdate = true;
  ecoAgua.add(ecoAlgas);   // algas acompanham a superfície do lago
}

/* ---------------------------------------------------------------------
   (j) ESTÔMATOS — TRANSPIRAÇÃO E FOTOPERÍODO
   A abertura estomática responde à disponibilidade de água e à luz: com
   boa hidratação e luz, as células-guarda ficam túrgidas e o ostíolo se
   abre, permitindo a entrada de CO2 e a saída de vapor d'água (transpiração
   e fluxo de água pelo xilema). Com déficit hídrico, o ABA promove o
   fechamento e a planta reduz a perda de água.
   O fotoperíodo é percebido pelo fitocromo: a duração da noite é o sinal,
   e por isso plantas de dia curto respondem a noites longas — a "fase
   escura" da fotossíntese, porém, não ocorre obrigatoriamente no escuro.
   O oxigênio liberado vem da fotólise da água no fotossistema II.
   --------------------------------------------------------------------- */
function ecoBuildFolha(){
  ecoFolhaGrupo = new THREE.Group();
  ecoFolhaGrupo.position.set(ECO_FOLHA_X, ecoAltura(ECO_FOLHA_X, ECO_FOLHA_Z) + 2.1, ECO_FOLHA_Z);
  ecoFolhaGrupo.rotation.set(-0.32, 0.62, -0.14);

  ecoMatFolha = new THREE.MeshStandardMaterial({
    color: 0x4f8f38, roughness: 0.62, metalness: 0.0,
    transparent: true, opacity: 0.94,
    emissive: 0x14400f, emissiveIntensity: 0.35,
    side: THREE.DoubleSide
  });

  ecoFolha = new THREE.Mesh(new THREE.SphereGeometry(1, 26, 16), ecoMatFolha);
  ecoFolha.scale.set(1.35, 0.07, 0.8);
  ecoFolha.raycast = () => {};
  ecoFolhaGrupo.add(ecoFolha);

  const matNervura = new THREE.MeshStandardMaterial({ color: 0x9dc46a, roughness: 0.6, metalness: 0.0 });
  const nervura = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.03, 2.4, 8), matNervura);
  nervura.rotation.z = Math.PI / 2;
  nervura.position.set(0, 0.03, 0);
  nervura.raycast = () => {};
  ecoFolhaGrupo.add(nervura);

  /* ostíolos: instâncias que variam de escala/opacidade com água e luz */
  ecoMatEstomato = new THREE.MeshStandardMaterial({
    color: 0x1d3a15, roughness: 0.5, metalness: 0.0,
    transparent: true, opacity: 0.6, emissive: 0x08170a, emissiveIntensity: 0.4
  });
  ecoEstomatos = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6), ecoMatEstomato, ECO_ESTOMATOS_CAP);
  ecoEstomatos.frustumCulled = false;
  ecoEstomatos.raycast = () => {};

  for (let i = 0; i < ECO_ESTOMATOS_CAP; i++){
    const linha = i % 2 === 0 ? 0.24 : -0.24;
    const t = (i / ECO_ESTOMATOS_CAP);
    const x = -0.98 + t * 1.96;
    ecoDummy.position.set(x, 0.055, linha);
    ecoDummy.rotation.set(0, 0, 0);
    ecoDummy.scale.set(1, 0.45, 1.5);
    ecoDummy.updateMatrix();
    ecoEstomatos.setMatrixAt(i, ecoDummy.matrix);
  }
  ecoEstomatos.instanceMatrix.needsUpdate = true;
  ecoFolhaGrupo.add(ecoEstomatos);

  /* pecíolo até o solo */
  const matPec = new THREE.MeshStandardMaterial({ color: 0x5c7f34, roughness: 0.8, metalness: 0.0 });
  const pec = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.2, 8), matPec);
  pec.position.set(0, -1.15, 0);
  pec.raycast = () => {};
  ecoFolhaGrupo.add(pec);

  ecoRoot.add(ecoFolhaGrupo);
}

/* ---------------------------------------------------------------------
   CONSTRUÇÃO COMPLETA — idempotente-safe (executa apenas uma vez)
   --------------------------------------------------------------------- */
export function buildEcossistema(){
  if (ecoConstruido) return ecoRoot;

  ecoBuildTerreno();        // (a) relevo e solo
  ecoBuildLago();           // (b) água em depressão
  ecoBuildVegetacao();      // (c) produtores terrestres
  ecoBuildNuvens();         // (d) atmosfera
  ecoBuildIndustria();      // (f) fonte de emissão + fumaça
  ecoBuildEsgoto();         // (f) lançamento de efluente no lago
  ecoBuildCarbono();        // (e) ciclo do carbono (partículas)
  ecoBuildMariposas();      // (g) seleção natural / melanismo
  ecoBuildTroncoDestaque(); // (h) liquens e fuligem
  ecoBuildAlgas();          // (i) eutrofização
  ecoBuildFolha();          // (j) estômatos, transpiração e fotoperíodo

  /* legenda interna (metadados didáticos, sem texturas externas) */
  ecoRoot.userData.legendas = [
    'Terreno: solo e cobertura vegetal (produtores)',
    'Lago: ambiente lêntico sujeito à eutrofização e à anoxia',
    'Chaminé: ciclo do carbono — CO2 fixado pelas copas',
    'Cano: esgoto lançado no lago (tratamento reduz a carga)',
    'Mariposas: melanismo industrial (variação pré-existente)',
    'Tronco com liquens: casca clara -> escura pela fuligem',
    'Folha em destaque: estômatos, transpiração e fotoperíodo'
  ];

  ecoConstruido = true;
  ecoApply();
  return ecoRoot;
}

/* ---------------------------------------------------------------------
   APLICAÇÃO DOS PARÂMETROS — todas as leituras passam por ecoParams
   --------------------------------------------------------------------- */
export function ecoApply(){
  if (!ecoConstruido) return;

  const co2 = ecoClamp(ecoParams.co2, 0, 1);
  const veg = ecoClamp(ecoParams.vegetacao, 0, 1);
  const emi = ecoClamp(ecoParams.emissao, 0, 1);
  const trat = ecoClamp(ecoParams.tratamento, 0, 1);
  const selecao = ecoClamp(ecoParams.selecao, 0, 1);
  const mutacao = ecoClamp(ecoParams.mutacao, 0, 1);
  const umidade = ecoClamp(ecoParams.umidade, 0, 1);
  const temp = ecoClamp(ecoParams.temp, 0, 1);
  const luz = ecoClamp(ecoParams.luz, 0, 1);
  const agua = ecoClamp(ecoParams.agua, 0, 1);

  ecoFatorEmissao = emi;
  ecoFatorCo2 = co2;

  /* ---------- (c) vegetação: quantidade visível de árvores ---------- */
  const nArvores = Math.round(ecoLerp(ECO_ARVORES_MIN, ECO_ARVORES_MAX, veg));
  ecoArvoresVisiveis = ecoClamp(nArvores, ECO_ARVORES_MIN, ECO_ARVORES_MAX);
  ecoTroncos.count = ecoArvoresVisiveis;
  ecoCopas.count = ecoArvoresVisiveis;

  /* fotoperíodo: mais luz -> copa mais clara e mais ativa (fotossíntese) */
  ecoMatCopa.color.setRGB(
    ecoLerp(0.13, 0.34, luz),
    ecoLerp(0.30, 0.60, luz),
    ecoLerp(0.11, 0.20, luz)
  );
  ecoMatCopa.emissiveIntensity = ecoLerp(0.10, 0.55, luz);

  /* ---------- (b)+(f) água: turva esverdeada <-> azul limpa ---------- */
  const turbidez = ecoClamp(0.45 * (1 - trat) + 0.35 * emi + 0.20 * co2, 0, 1);
  ecoMatAgua.color.copy(ecoCorAguaLimpa).lerp(ecoCorAguaTurva, turbidez);
  ecoMatAgua.opacity = ecoLerp(0.68, 0.96, turbidez);
  ecoMatAgua.emissiveIntensity = ecoLerp(0.30, 0.10, turbidez);

  /* ---------- (i) algas: respondem à carga de nutrientes ---------- */
  const carga = ecoClamp(0.55 * emi + 0.25 * co2 + 0.20 * (1 - trat), 0, 1);
  const descontoTratamento = 1 - 0.75 * trat;
  ecoAlgasVisiveis = Math.round(ecoLerp(4, ECO_ALGAS_CAP, ecoClamp(carga * descontoTratamento, 0, 1)));
  ecoAlgas.count = ecoAlgasVisiveis;
  ecoMatAlga.color.setRGB(
    ecoLerp(0.16, 0.34, carga),
    ecoLerp(0.42, 0.52, carga),
    ecoLerp(0.13, 0.14, carga)
  );
  ecoMatAlga.emissiveIntensity = ecoLerp(0.25, 0.5, carga);

  /* ---------- (f) esgoto: bruto (escuro) <-> tratado (claro) ---------- */
  ecoMatEsgoto.color.copy(ecoCorEsgotoBruto).lerp(ecoCorEsgotoTratado, trat);
  ecoMatEsgoto.opacity = ecoLerp(0.92, 0.55, trat);
  ecoMatEsgoto.emissiveIntensity = ecoLerp(0.15, 0.45, trat);

  /* ---------- (e) ciclo do carbono: densidade e velocidade ---------- */
  ecoCarbonoVisivel = Math.round(ecoLerp(50, ECO_CARBONO_CAP, ecoClamp(0.5 * co2 + 0.5 * emi, 0, 1)));
  ecoCarbonoGeo.setDrawRange(0, ecoCarbonoVisivel);
  ecoMatCarbono.opacity = ecoLerp(0.25, 0.8, co2);
  ecoMatCarbono.size = ecoLerp(0.15, 0.26, ecoClamp(0.5 * co2 + 0.5 * emi, 0, 1));

  /* ---------- (f) fumaça: mais emissão, mais escura e mais densa ---------- */
  ecoFumacaVisivel = Math.round(ecoLerp(6, ECO_FUMACA_CAP, emi));
  ecoFumacaGeo.setDrawRange(0, Math.max(1, ecoFumacaVisivel));
  ecoMatFumaca.color.copy(ecoCorFumacaClara).lerp(ecoCorFumacaEscura, emi);
  ecoMatFumaca.opacity = ecoLerp(0.12, 0.62, emi);
  ecoMatFumaca.size = ecoLerp(0.4, 0.8, emi);

  /* ---------- (g) mariposas: quantidade e cor por seleção/mutação ------ */
  const nMariposas = Math.round(30 + 20 * veg + 10 * umidade);
  ecoMariposasVisiveis = ecoClamp(nMariposas, 30, ECO_MARIPOSAS_CAP);
  ecoMariposas.count = ecoMariposasVisiveis;

  for (let i = 0; i < ECO_MARIPOSAS_CAP; i++){
    /* O traço é herdado (variação pré-existente). A pressão seletiva não
       cria a cor: ela apenas desloca a frequência dos fenótipos, e a
       mutação adiciona nova variação sobre a qual a seleção pode agir. */
    const desvio = (ecoMariposaTraco[i] - 0.5) * (0.35 + 0.65 * mutacao);
    const fenotipo = ecoClamp(selecao + desvio, 0, 1);
    ecoTmpColor.copy(ecoCorMariposaClara).lerp(ecoCorMariposaEscura, fenotipo);
    ecoMariposas.setColorAt(i, ecoTmpColor);
  }
  if (ecoMariposas.instanceColor) ecoMariposas.instanceColor.needsUpdate = true;

  /* ---------- (h) liquens e casca: escurecem com a fuligem ---------- */
  const fuligem = ecoClamp(0.75 * emi + 0.25 * (1 - trat), 0, 1);
  ecoMatLiquen.color.copy(ecoCorLiquenClaro).lerp(ecoCorLiquenFuligem, fuligem);
  ecoMatTroncoDestaque.color.setRGB(
    ecoLerp(0.55, 0.20, fuligem),
    ecoLerp(0.49, 0.20, fuligem),
    ecoLerp(0.37, 0.17, fuligem)
  );

  /* ---------- (d) nuvens: podem carregar material particulado ---------- */
  ecoMatNuvem.color.copy(ecoCorNuvemLimpa).lerp(ecoCorNuvemSmog, 0.5 * emi);
  ecoMatNuvem.opacity = ecoLerp(0.92, 0.8, emi);

  /* ---------- (j) estômatos: abrem com água e luz ---------- */
  const abertura = ecoClamp(0.55 * agua + 0.45 * luz, 0, 1);
  for (let i = 0; i < ECO_ESTOMATOS_CAP; i++){
    const linha = i % 2 === 0 ? 0.24 : -0.24;
    const t = i / ECO_ESTOMATOS_CAP;
    const x = -0.98 + t * 1.96;
    const esc = ecoLerp(0.35, 1.35, abertura);
    ecoDummy.position.set(x, 0.055, linha);
    ecoDummy.rotation.set(0, 0, 0);
    ecoDummy.scale.set(esc, 0.28 + 0.34 * abertura, esc * 1.5);
    ecoDummy.updateMatrix();
    ecoEstomatos.setMatrixAt(i, ecoDummy.matrix);
  }
  ecoEstomatos.instanceMatrix.needsUpdate = true;
  ecoMatEstomato.opacity = ecoLerp(0.3, 0.95, abertura);
  ecoMatFolha.emissiveIntensity = ecoLerp(0.12, 0.6, luz);
  ecoMatFolha.color.setRGB(ecoLerp(0.24, 0.38, luz), ecoLerp(0.48, 0.62, luz), ecoLerp(0.18, 0.24, luz));
  /* déficit hídrico: a folha murcha (inclina) por perda de turgor */
  ecoFolhaGrupo.rotation.z = ecoLerp(-0.14, -0.55, 1 - agua);

  /* ---------- luz local do lago (única da cena, <= 6) ---------- */
  ecoLuzLago.intensity = ecoLerp(1.4, 4.2, luz) * ecoLerp(0.85, 1.0, temp);
  ecoLuzLago.color.setRGB(ecoLerp(0.25, 0.35, trat), ecoLerp(0.65, 0.83, trat), ecoLerp(0.62, 0.92, trat));

  /* ---------- atmosfera: umidade em suspensão sobre o lago ---------- */
  ecoMatAgua.roughness = ecoLerp(0.22, 0.08, umidade);
}

/* ---------------------------------------------------------------------
   ANIMAÇÕES — todas reutilizam buffers/objetos do módulo
   --------------------------------------------------------------------- */
function ecoAnimarNuvens(dt){
  for (let i = 0; i < ecoNuvens.length; i++){
    const g = ecoNuvens[i];
    g.position.x += ecoNuvensVel[i] * dt;
    if (g.position.x > ECO_RAIO_CENA) g.position.x = -ECO_RAIO_CENA;
  }
}

function ecoAnimarAgua(dt){
  if (!ecoAguaGeo) return;
  const attr = ecoAguaGeo.attributes.position;
  const arr = attr.array;

  for (let i = 0; i < ecoAguaTotal; i++){
    const bx = ecoAguaBase[i * 3];
    const bz = ecoAguaBase[i * 3 + 2];
    const d = Math.sqrt(bx * bx + bz * bz) / ECO_AGUA_RAIO;
    const borda = 1 - ecoClamp(d, 0, 1);   // a ondulação some na margem
    const onda = Math.sin(bx * 1.7 + ecoTempo * 1.35) * 0.05
               + Math.cos(bz * 1.9 + ecoTempo * 1.05) * 0.045;
    arr[i * 3 + 1] = onda * borda;
  }

  attr.needsUpdate = true;
  ecoAguaGeo.computeVertexNormals();
}

/* ciclo do carbono: as partículas sobem da chaminé e convergem para as copas,
   onde são fixadas (fotossíntese). A densidade cresce com emissão e CO2. */
function ecoAnimarCarbono(dt){
  if (!ecoCarbonoGeo) return;
  const attr = ecoCarbonoGeo.attributes.position;
  const arr = attr.array;
  const total = Math.max(1, ecoCarbonoVisivel);
  const vel = 0.10 + 0.30 * ecoFatorEmissao;

  for (let i = 0; i < total; i++){
    let fase = ecoCarbonoFase[i] + dt * vel * ecoCarbonoVel[i];
    if (fase >= 1){
      fase -= 1;
      ecoCarbonoAlvo[i] = Math.floor(ecoRand() * Math.max(1, ecoArvoresVisiveis));
    }
    ecoCarbonoFase[i] = fase;

    const idx = ecoCarbonoAlvo[i] % Math.max(1, ecoArvoresVisiveis);
    const a = ecoArvores[idx] || { x: 0, y: 0, z: 0, altura: 1.4, copa: 0.8 };
    const alvoY = a.y + a.altura + a.copa * 0.4;

    const bx = ECO_CHAMINE_X + 0.95;
    const by = ecoAltura(ECO_CHAMINE_X, ECO_CHAMINE_Z) + 4.6;
    const bz = ECO_CHAMINE_Z;

    const t = fase;
    arr[i * 3] = ecoLerp(bx, a.x, t) + Math.sin(fase * 6.283 + i * 1.7) * 0.22;
    arr[i * 3 + 1] = ecoLerp(by, alvoY, t);
    arr[i * 3 + 2] = ecoLerp(bz, a.z, t) + Math.cos(fase * 5.1 + i * 1.1) * 0.22;
  }

  attr.needsUpdate = true;
  ecoCarbonoGeo.setDrawRange(0, ecoCarbonoVisivel);
}

function ecoAnimarFumaca(dt){
  if (!ecoFumacaGeo) return;
  const attr = ecoFumacaGeo.attributes.position;
  const arr = attr.array;
  const total = Math.max(1, ecoFumacaVisivel);
  const vel = 0.35 + 0.75 * ecoFatorEmissao;
  const x = ECO_CHAMINE_X + 0.95;
  const z = ECO_CHAMINE_Z;

  for (let i = 0; i < total; i++){
    ecoFumacaY[i] += dt * vel * (0.7 + 0.3 * (i % 5) / 5);
    if (ecoFumacaY[i] > 4.2){
      ecoFumacaY[i] -= 4.2;
      ecoFumacaDX[i] = (ecoRand() - 0.5) * 0.9;
      ecoFumacaDZ[i] = (ecoRand() - 0.5) * 0.9;
    }
    const dispersao = 1 + ecoFumacaY[i] * 0.45;
    arr[i * 3] = x + ecoFumacaDX[i] * dispersao;
    arr[i * 3 + 1] = ecoFumacaTopo + ecoFumacaY[i];
    arr[i * 3 + 2] = z + ecoFumacaDZ[i] * dispersao;
  }

  attr.needsUpdate = true;
  ecoFumacaGeo.setDrawRange(0, Math.max(1, ecoFumacaVisivel));
}

/* copas balançando: aragem (vento) sobre a cobertura vegetal */
function ecoAnimarCopas(dt){
  if (!ecoCopas) return;
  const n = ecoArvoresVisiveis;

  for (let i = 0; i < n; i++){
    const a = ecoArvores[i];
    if (!a) continue;
    const k = Math.sin(ecoTempo * (0.7 + 0.25 * a.balanco) + i * 0.9) * 0.045 * a.balanco;

    ecoDummy.position.set(a.x, a.y + a.altura + a.copa * 0.55, a.z);
    ecoDummy.rotation.set(k * 0.7, a.giro, k);
    ecoDummy.scale.set(a.copa, a.copa * 1.15, a.copa);
    ecoDummy.updateMatrix();
    ecoCopas.setMatrixAt(i, ecoDummy.matrix);

    ecoDummy.position.set(a.x, a.y, a.z);
    ecoDummy.rotation.set(k * 0.25, a.giro, k * 0.35);
    ecoDummy.scale.set(1, a.altura, 1);
    ecoDummy.updateMatrix();
    ecoTroncos.setMatrixAt(i, ecoDummy.matrix);
  }

  ecoCopas.instanceMatrix.needsUpdate = true;
  ecoTroncos.instanceMatrix.needsUpdate = true;
}

/* mariposas: voo pairado (revoada) com batimento das asas.
   A atividade dos artrópodes depende de umidade e temperatura. */
function ecoAnimarMariposas(dt){
  if (!ecoMariposas) return;
  const n = ecoMariposasVisiveis;
  const atividade = ecoClamp(0.35 + 0.45 * ecoParams.umidade + 0.35 * ecoParams.temp, 0.2, 1.4);

  for (let i = 0; i < n; i++){
    const b = ecoMariposaBase[i];
    if (!b) continue;
    const f = ecoMariposaFase[i] + ecoTempo * atividade * (1.6 + (i % 3) * 0.25);
    const batida = Math.sin(f * 2.2) * 0.55;

    ecoDummy.position.set(
      b.x + Math.sin(f * 0.8) * b.amp,
      b.y + Math.sin(f * 1.4) * b.amp * 0.8,
      b.z + Math.cos(f * 0.7) * b.amp
    );
    ecoDummy.rotation.set(batida, b.giro + f * 0.25, Math.cos(f * 1.1) * 0.25);
    ecoDummy.scale.set(1, 1, 1);
    ecoDummy.updateMatrix();
    ecoMariposas.setMatrixAt(i, ecoDummy.matrix);
  }

  ecoMariposas.instanceMatrix.needsUpdate = true;
}

/* algas: oscilação leve na superfície do lago */
function ecoAnimarAlgas(dt){
  if (!ecoAlgas) return;
  const n = ecoAlgasVisiveis;

  for (let i = 0; i < n; i++){
    const b = ecoAlgaBase[i];
    if (!b) continue;
    const onda = 1 + Math.sin(ecoTempo * 0.9 + b.fase) * 0.12;
    ecoDummy.position.set(b.x, 0, b.z);
    ecoDummy.rotation.set(
      Math.sin(ecoTempo * 0.7 + b.fase) * 0.10,
      b.giro,
      Math.cos(ecoTempo * 0.8 + b.fase) * 0.10
    );
    ecoDummy.scale.set(1, b.escala * onda, 1);
    ecoDummy.updateMatrix();
    ecoAlgas.setMatrixAt(i, ecoDummy.matrix);
  }

  ecoAlgas.instanceMatrix.needsUpdate = true;
}

/* folha em destaque: balanço e resposta da turgescência */
function ecoAnimarFolha(dt){
  if (!ecoFolhaGrupo) return;
  const agua = ecoClamp(ecoParams.agua, 0, 1);
  const k = Math.sin(ecoTempo * 0.85) * 0.035;
  ecoFolhaGrupo.rotation.y = 0.62 + k;
  ecoFolhaGrupo.rotation.x = -0.32 + Math.cos(ecoTempo * 0.62) * 0.03;
  ecoFolhaGrupo.rotation.z = ecoLerp(-0.14, -0.55, 1 - agua) + k * 0.4;
}

/* ---------------------------------------------------------------------
   ATUALIZAÇÃO POR QUADRO
   --------------------------------------------------------------------- */
export function updateEcossistema(dt){
  if (!ecoConstruido) return;

  const d = (typeof dt === 'number' && isFinite(dt)) ? ecoClamp(dt, 0, 0.1) : 0;
  if (d <= 0) return;

  ecoTempo += d;

  ecoAnimarNuvens(d);      // nuvens à deriva
  ecoAnimarAgua(d);        // ondulação da água
  ecoAnimarCarbono(d);     // CO2 subindo e sendo absorvido
  ecoAnimarFumaca(d);      // material particulado da chaminé
  ecoAnimarCopas(d);       // copas balançando
  ecoAnimarMariposas(d);   // revoada das mariposas
  ecoAnimarAlgas(d);       // algas oscilando
  ecoAnimarFolha(d);       // folha e estômatos
}