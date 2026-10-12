/* =====================================================================
   moleculas.js — cenas 3D de Química (e a dupla-hélice de Genética)

   Este arquivo implementa sete sub-cenas independentes, todas penduradas
   em `molRoot`. Apenas uma fica visível por vez, escolhida por
   `setMolCena(nome)`:

     estequiometria  N2 + 3 H2 -> 2 NH3, reagente limitante e excesso
     solucoes         diluição, C1V1 = C2V2, concentração e partículas
     equilibrio       equilíbrio dinâmico e escala de pH com tampão
     cinetica         perfil de energia, energia de ativação, catalisador
     eletroquimica    pilha de Daniell, ponte salina, elétrons e Faraday
     organica         cadeia carbônica, tetravalência, insaturação
     genetica         dupla-hélice de DNA, emparelhamento A-T e C-G

   Contrato com o restante do projeto:
     molRoot            grupo raiz (adicionado à cena pelo motor)
     buildMoleculas()   constrói todas as sub-cenas, uma única vez
     setMolCena(nome)   troca a sub-cena visível
     molCenaAtual       nome da sub-cena ativa
     molApply()         lê molParams e atualiza a sub-cena ativa
     updateMoleculas(dt) animação por quadro da sub-cena ativa
     molParams          parâmetros editáveis pelos simuladores

   Rigor científico observado nos comentários e no comportamento:
     - o catalisador DIMINUI a energia de ativação e NÃO desloca o
       equilíbrio, apenas encurta o tempo de chegada a ele;
     - sólidos e líquidos puros NÃO entram na constante de equilíbrio;
     - pH + pOH = 14 a 25 °C, e cada unidade de pH vale 10x em [H+];
     - na PILHA o ânodo é o polo NEGATIVO (oxidação) e o cátodo é o
       positivo (redução);
     - Q = i * t e um mol de elétrons vale 96.500 C (Faraday);
     - a estequiometria da amônia é 1:3:2 (N2 + 3 H2 -> 2 NH3).
   ===================================================================== */

import * as THREE from 'three';

/* ------------------------------------------------------------------
   PARÂMETROS — todas as sub-cenas leem sempre deste objeto
   ------------------------------------------------------------------ */
export const molParams = {
  /* estequiometria */
  reagenteA: 4,       /* 0..10 mol de N2                        */
  reagenteB: 6,       /* 0..10 mol de H2                        */
  rendimento: 0.9,    /* 0.1..1                                 */
  /* soluções */
  concentracao: 1,    /* 0.1..2 mol/L (concentração inicial)    */
  volume: 0.5,        /* 0.1..1 (volume final relativo)         */
  /* equilíbrio */
  forca: 0.5,         /* 0..1 força do ácido                    */
  tampao: 0,          /* 0..1 quantidade de tampão              */
  /* cinética */
  temperatura: 0.5,   /* 0..1                                   */
  catalisador: 0,     /* 0..1                                   */
  /* eletroquímica */
  corrente: 2,        /* 0..5 A                                 */
  tempo: 30,          /* 0..60 min                              */
  /* orgânica */
  carbono: 4,         /* 1..12 átomos de carbono                */
  insaturacao: 0.3,   /* 0..1                                   */
  /* genética */
  geracoes: 4,       /* 1..12                                  */
  selecao: 0.3        /* 0..1                                   */
};

/* ------------------------------------------------------------------ */
export const molRoot = new THREE.Group();
molRoot.name = 'cena-moleculas';
molRoot.visible = false;

export let molCenaAtual = 'estequiometria';

/* ------------------------------------------------------------------
   UTILIDADES COMPARTILHADAS
   ------------------------------------------------------------------ */
const MOL_SUBCENAS = ['estequiometria','solucoes','equilibrio','cinetica','eletroquimica','organica','genetica'];
const molGrupos = {};
let molConstruido = false;
let molTempo = 0;

const molDummy = new THREE.Object3D();
const molV3 = new THREE.Vector3();
const molCorA = new THREE.Color();
const molCorB = new THREE.Color();

function molClamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function molLerp(a, b, t){ return a + (b - a) * t; }
function molRand(s){ const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

/* esfera de vidro para béqueres e cubas: parede translúcida */
function molVidro(raio, altura){
  const g = new THREE.Group();
  const parede = new THREE.Mesh(
    new THREE.CylinderGeometry(raio, raio, altura, 36, 1, true),
    new THREE.MeshStandardMaterial({
      color:0xbfe3ff, roughness:.08, metalness:.02,
      transparent:true, opacity:.16, side:THREE.DoubleSide,
      depthWrite:false
    })
  );
  parede.position.y = altura/2;
  const fundo = new THREE.Mesh(
    new THREE.CylinderGeometry(raio, raio, .12, 36),
    new THREE.MeshStandardMaterial({ color:0xbfe3ff, roughness:.1, metalness:.05, transparent:true, opacity:.22 })
  );
  fundo.position.y = .06;
  g.add(parede, fundo);
  return g;
}

/* posiciona um cilindro entre dois pontos (usado nas ligações) */
function molCilindroEntre(a, b, raio, material, destino){
  const dir = molV3.copy(b).sub(a);
  const len = dir.length();
  const cil = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, len, 12), material);
  cil.position.copy(a).addScaledVector(dir, .5);
  cil.quaternion.setFromUnitVectors(new THREE.Object3D().up, dir.clone().normalize());
  destino.add(cil);
  return cil;
}

/* ==================================================================
   1. ESTEQUIOMETRIA — N2 + 3 H2 -> 2 NH3
   Mostra o ANTES (reagentes) e o DEPOIS (produto + excesso),
   com as contagens determinadas pelo reagente limitante.
   ================================================================== */
const molEst = { };

function molBuildEstequiometria(){
  const g = new THREE.Group();
  g.name = 'sub-estequiometria';

  const geo = new THREE.SphereGeometry(1, 18, 14);
  molEst.matN   = new THREE.MeshStandardMaterial({ color:0x63b0ff, roughness:.32, metalness:.2, emissive:0x1a4a9a, emissiveIntensity:1.25 });
  molEst.matH   = new THREE.MeshStandardMaterial({ color:0x74f0aa, roughness:.38, metalness:.1, emissive:0x0a5a36, emissiveIntensity:1.1 });
  molEst.matHN  = new THREE.MeshStandardMaterial({ color:0xffd07a, roughness:.38, metalness:.1, emissive:0x7a4a10, emissiveIntensity:1.1 });

  /* cada espécie tem uma malha própria por fila, porque uma InstancedMesh
     guarda um único conjunto de matrizes por espécie                 */
  molEst.n2Antes    = new THREE.InstancedMesh(geo, molEst.matN,  2*12);
  molEst.h2Antes    = new THREE.InstancedMesh(geo, molEst.matH,  2*36);
  molEst.n2Depois   = new THREE.InstancedMesh(geo, molEst.matN,  2*12);
  molEst.h2Depois   = new THREE.InstancedMesh(geo, molEst.matH,  2*36);
  molEst.nh3n       = new THREE.InstancedMesh(geo, molEst.matN,     24);
  molEst.nh3h       = new THREE.InstancedMesh(geo, molEst.matHN, 3*24);

  [molEst.n2Antes, molEst.h2Antes, molEst.n2Depois, molEst.h2Depois, molEst.nh3n, molEst.nh3h]
    .forEach(m => { m.frustumCulled = false; g.add(m); });

  /* plataformas de referência */
  const prancha = new THREE.Mesh(
    new THREE.BoxGeometry(23, .18, 5.4),
    new THREE.MeshStandardMaterial({ color:0x0d1b2c, roughness:.85, metalness:.1 })
  );
  prancha.position.y = -5.4;
  g.add(prancha);

  molGrupos.estequiometria = g;
  molRoot.add(g);
}

/* escreve as instâncias de uma espécie a partir da lista de moléculas */
function molEstEscrever(inst, mols, atomos, t){
  let n = 0;
  for (let i = 0; i < mols.length; i++){
    const m = mols[i];
    const wob = Math.sin(t*1.7 + m.fase) * .16;
    const giro = Math.sin(t*.5 + m.fase*.8) * .35;
    for (let a = 0; a < atomos.length; a++){
      const at = atomos[a];
      const ca = Math.cos(giro), sa = Math.sin(giro);
      molDummy.position.set(
        m.x + at[0]*ca - at[2]*sa,
        m.y + at[1] + wob,
        m.z + at[0]*sa + at[2]*ca
      );
      molDummy.scale.setScalar(at[3]);
      molDummy.rotation.set(0,0,0);
      molDummy.updateMatrix();
      inst.setMatrixAt(n, molDummy.matrix);
      n++;
    }
  }
  inst.count = n;
  inst.instanceMatrix.needsUpdate = true;
}

/* layout horizontal centrado */
function molLinha(cx, y, n, esp){
  const arr = [];
  if (n <= 0) return arr;
  const ini = cx - (n - 1) * esp / 2;
  for (let i = 0; i < n; i++) arr.push({ x: ini + i*esp, y, z:0, fase: i*.9 });
  return arr;
}

/* átomos de cada espécie: [x, y, z, raio]
   Os raios são generosos porque a cena é vista de longe: cada esfera
   precisa ser legível como "uma molécula" na tela.                */
const molAtN2  = [[-.62,0,0,.62],[.62,0,0,.62]];
const molAtH2  = [[-.45,0,0,.45],[.45,0,0,.45]];
const molAtN   = [[0,0,0,.68]];
const molAtHn3 = [[-.62,.42,-.28,.40],[.62,.42,-.28,.40],[0,.46,.60,.40]];

function molApplyEstequiometria(){
  const A = molClamp(molParams.reagenteA, 0, 10);   /* mol de N2      */
  const B = molClamp(molParams.reagenteB, 0, 10);   /* mol de H2      */
  const rend = molClamp(molParams.rendimento, .1, 1);

  /* regra prática: divide-se cada quantidade pelo coeficiente; o menor
     resultado é o reagente limitante. Aqui: N2/1 contra H2/3.        */
  const xi = Math.min(A, B/3);                      /* avanço da reação  */
  const nh3 = 2 * xi * rend;                        /* produto formado  */
  const excN2 = A - xi;                             /* excesso que sobra */
  const excH2 = B - 3*xi;

  molEst.antesN2 = molLinha(-7.6, 4.6, Math.round(A), 2.4);
  molEst.antesH2 = molLinha( 6.6, 4.6, Math.round(B), 1.75);
  molEst.depoisNH3 = molLinha(-5.6, -3.2, Math.round(nh3), 2.6);
  molEst.depoisN2 = molLinha(5.0, -3.2, Math.round(excN2), 2.4);
  molEst.depoisH2 = molLinha(9.2, -3.2, Math.round(excH2), 1.75);

  molEst.limitante = (B/3 < A) ? 'H2' : 'N2';
  molEst.rendTexto = nh3;
}

function molUpdateEstequiometria(t){
  molEstEscrever(molEst.n2Antes,  molEst.antesN2,   molAtN2,  t);
  molEstEscrever(molEst.h2Antes,  molEst.antesH2,   molAtH2,  t);
  molEstEscrever(molEst.nh3n,     molEst.depoisNH3, molAtN,   t);
  molEstEscrever(molEst.nh3h,     molEst.depoisNH3, molAtHn3, t);
  molEstEscrever(molEst.n2Depois, molEst.depoisN2,  molAtN2,  t);
  molEstEscrever(molEst.h2Depois, molEst.depoisH2,  molAtH2,  t);
}

/* ==================================================================
   2. SOLUÇÕES — diluição e concentração (C1V1 = C2V2)
   Um béquer cujo volume cresce e cuja cor clareia; as partículas de
   soluto conservam a QUANTIDADE (mol) e se espalham no novo volume.
   ================================================================== */
const molSol = {};

function molBuildSolucoes(){
  const g = new THREE.Group();
  g.name = 'sub-solucoes';

  molSol.bequer = molVidro(4.0, 6.4);
  molSol.bequer.position.y = -3.2;
  g.add(molSol.bequer);

  molSol.liquido = new THREE.Mesh(
    new THREE.CylinderGeometry(3.88, 3.88, 1, 40),
    new THREE.MeshStandardMaterial({ color:0x3fa9ff, roughness:.22, metalness:.05, transparent:true, opacity:.55 })
  );
  g.add(molSol.liquido);

  molSol.soluto = new THREE.InstancedMesh(
    new THREE.SphereGeometry(.24, 12, 10),
    new THREE.MeshStandardMaterial({ color:0xffc06a, roughness:.3, metalness:.25, emissive:0x5a3608, emissiveIntensity:.9 }),
    240
  );
  molSol.soluto.frustumCulled = false;
  g.add(molSol.soluto);

  molGrupos.solucoes = g;
  molRoot.add(g);
}

function molApplySolucoes(){
  const V0 = .25;                                  /* volume inicial fixo     */
  const C1 = molClamp(molParams.concentracao, .1, 2);
  const V2 = molClamp(molParams.volume, .1, 1);
  const C2 = (C1 * V0) / V2;                       /* C1V1 = C2V2             */
  molSol.mols = C1 * V0;                           /* a QUANTIDADE se conserva */
  molSol.altura = molLerp(.8, 5.9, V2);

  molSol.liquido.scale.y = molSol.altura;
  molSol.liquido.position.y = -3.2 + molSol.altura/2;

  /* a cor clareia com a diluição: menos mols por litro */
  molCorA.setRGB(.10, .35, .85).multiplyScalar(molClamp(C2/2, .06, 1));
  molSol.liquido.material.color.copy(molCorA);
  molSol.liquido.material.opacity = .28 + .42*molClamp(C2/2, 0, 1);

  molSol.nPart = Math.min(240, Math.round(molSol.mols * 90));

  /* distribui as partículas dentro do volume atual (posições relativas) */
  molSol.pos = [];
  for (let i = 0; i < molSol.nPart; i++){
    const a = i * 2.399963;
    const r = .82 * Math.sqrt(molRand(i + 3.1));
    molSol.pos.push({
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      h: molRand(i + 9.7),
      f: molRand(i + 17.3) * 6.28
    });
  }
}

function molUpdateSolucoes(t){
  const n = molSol.nPart || 0;
  for (let i = 0; i < n; i++){
    const p = molSol.pos[i];
    molDummy.position.set(
      p.x + Math.sin(t*1.3 + p.f)*.20,
      -3.2 + .30 + p.h * Math.max(.3, molSol.altura - .6) + Math.cos(t*1.7 + p.f)*.18,
      p.z + Math.cos(t*1.1 + p.f)*.20
    );
    molDummy.scale.setScalar(1);
    molDummy.updateMatrix();
    molSol.soluto.setMatrixAt(i, molDummy.matrix);
  }
  molSol.soluto.count = n;
  molSol.soluto.instanceMatrix.needsUpdate = true;
}

/* ==================================================================
   3. EQUILÍBRIO — equilíbrio dinâmico e escala de pH
   Duas câmaras ligadas por setas nos dois sentidos; no equilíbrio as
   VELOCIDADES se igualam, mas as CONCENTRAÇÕES não precisam.
   A escala de pH mostra o efeito de ácido forte x fraco e do tampão.
   ================================================================== */
const molEqu = {};

function molBuildEquilibrio(){
  const g = new THREE.Group();
  g.name = 'sub-equilibrio';

  const mkCamara = (x, cor) => {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 4.0, 32, 1, true),
      new THREE.MeshStandardMaterial({ color:cor, roughness:.15, metalness:.05, transparent:true, opacity:.22, side:THREE.DoubleSide, depthWrite:false })
    );
    m.position.set(x, 2.0, 0);
    return m;
  };
  molEqu.camA = mkCamara(-6.2, 0x4aa8ff);
  molEqu.camB = mkCamara( 6.2, 0xffb648);
  g.add(molEqu.camA, molEqu.camB);

  /* setas de ida e de volta: tubos curvos sobre as câmaras */
  molCurvaSeta(-6.2, 6.2, 6.4,  g, 'ida');
  molCurvaSeta( 6.2, -6.2, 5.8, g, 'volta');

  molEqu.partA = new THREE.InstancedMesh(
    new THREE.SphereGeometry(.34, 12, 10),
    new THREE.MeshStandardMaterial({ color:0x63e6a0, roughness:.3, metalness:.2, emissive:0x0a3a26, emissiveIntensity:.8 }),
    220
  );
  molEqu.partB = new THREE.InstancedMesh(
    new THREE.SphereGeometry(.34, 12, 10),
    new THREE.MeshStandardMaterial({ color:0xff8a5c, roughness:.3, metalness:.2, emissive:0x4a1a00, emissiveIntensity:.8 }),
    220
  );
  molEqu.partA.frustumCulled = false;
  molEqu.partB.frustumCulled = false;
  g.add(molEqu.partA, molEqu.partB);

  /* ---- escala de pH: coluna de 14 segmentos, vermelho -> azul ---- */
  molEqu.phCol = new THREE.Group();
  for (let i = 0; i < 14; i++){
    const v = i/13;
    molCorA.setHSL(molLerp(.02, .62, v), .78, .52);
    const seg = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, .60, 1.2),
      new THREE.MeshStandardMaterial({ color:molCorA.clone(), roughness:.45, metalness:.1 })
    );
    seg.position.set(0, -3.4 + i*.62, -7.0);
    molEqu.phCol.add(seg);
  }
  molEqu.marcador = new THREE.Mesh(
    new THREE.SphereGeometry(.82, 20, 16),
    new THREE.MeshStandardMaterial({ color:0xffffff, roughness:.2, metalness:.4, emissive:0x666666, emissiveIntensity:1.1 })
  );
  molEqu.phCol.add(molEqu.marcador);
  g.add(molEqu.phCol);

  molGrupos.equilibrio = g;
  molRoot.add(g);
}

function molCurvaSeta(x1, x2, altura, destino, rotulo){
  const curva = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x1, 4.0, 0),
    new THREE.Vector3((x1+x2)/2, altura, 0),
    new THREE.Vector3(x2, 4.0, 0)
  ]);
  const tubo = new THREE.Mesh(
    new THREE.TubeGeometry(curva, 48, .20, 10, false),
    new THREE.MeshStandardMaterial({ color:0x8fd4ff, roughness:.3, metalness:.5, emissive:0x123a55, emissiveIntensity:.7 })
  );
  destino.add(tubo);
  if (rotulo === 'ida') molEqu.curvaIda = curva;
  else molEqu.curvaVolta = curva;
}

function molApplyEquilibrio(){
  const forca = molClamp(molParams.forca, 0, 1);
  const conc = molClamp(molParams.concentracao, .0001, 1);
  const tampa = molClamp(molParams.tampao, 0, 1);

  /* --- pH ---
     Ácido forte (forca ~ 1): ionização total, pH = -log C.
     Ácido fraco: [H+] = sqrt(Ka * C). Aqui Ka cresce com `forca`,
     de modo que a mesma concentração dá pH diferentes.          */
  let ph;
  if (forca > .96){
    ph = -Math.log10(Math.max(conc, 1e-7));
  } else {
    const ka = Math.pow(10, -(7 - 6*forca));
    ph = -Math.log10(Math.sqrt(ka * Math.max(conc, 1e-7)));
  }
  ph = molClamp(ph, 0, 14);
  /* o TAMPÃO atenua a variação, mas NUNCA a anula por completo */
  const phEfetivo = 7 + (ph - 7) * (1 - .72 * tampa);
  molEqu.ph = phEfetivo;

  molEqu.marcador.position.set(0, -3.4 + (phEfetivo/13)*8.0, -6.4);

  /* --- partículas: as razões mudam, as velocidades se igualam --- */
  molEqu.nA = Math.round(40 + (1 - forca) * 120);
  molEqu.nB = Math.round(20 + forca * 140);
}

function molUpdateEquilibrio(t){
  /* câmara A (reagentes) */
  let n = 0;
  for (let i = 0; i < molEqu.nA; i++){
    const a = i * 2.399963 + t*.05;
    const r = 2.5 * Math.sqrt(molRand(i + 1.7));
    molDummy.position.set(-6.2 + Math.cos(a)*r, 2.0 + (molRand(i+5.3)*3.2 - 1.6), Math.sin(a)*r);
    molDummy.scale.setScalar(1);
    molDummy.updateMatrix();
    molEqu.partA.setMatrixAt(n++, molDummy.matrix);
  }
  molEqu.partA.count = n;
  molEqu.partA.instanceMatrix.needsUpdate = true;

  /* câmara B (produtos) */
  n = 0;
  for (let i = 0; i < molEqu.nB; i++){
    const a = i * 2.399963 - t*.05;
    const r = 2.5 * Math.sqrt(molRand(i + 7.9));
    molDummy.position.set(6.2 + Math.cos(a)*r, 2.0 + (molRand(i+11.3)*3.2 - 1.6), Math.sin(a)*r);
    molDummy.scale.setScalar(1);
    molDummy.updateMatrix();
    molEqu.partB.setMatrixAt(n++, molDummy.matrix);
  }
  molEqu.partB.count = n;
  molEqu.partB.instanceMatrix.needsUpdate = true;

  /* tráfego nas duas setas: velocidades IGUAIS no equilíbrio */
  const fluxo = 14;
  if (molEqu.curvaIda && molEqu.curvaVolta){
    if (!molEqu.transito){
      molEqu.transito = new THREE.InstancedMesh(
        new THREE.SphereGeometry(.28, 10, 8),
        new THREE.MeshStandardMaterial({ color:0xffffff, roughness:.2, metalness:.3, emissive:0x446688, emissiveIntensity:1 }),
        fluxo*2
      );
      molEqu.transito.frustumCulled = false;
      molGrupos.equilibrio.add(molEqu.transito);
    }
    for (let i = 0; i < fluxo; i++){
      const u = (t*.16 + i/fluxo) % 1;
      molEqu.curvaIda.getPoint(u, molV3);
      molDummy.position.copy(molV3);
      molDummy.scale.setScalar(1);
      molDummy.updateMatrix();
      molEqu.transito.setMatrixAt(i, molDummy.matrix);

      const u2 = (t*.16 + i/fluxo) % 1;
      molEqu.curvaVolta.getPoint(u2, molV3);
      molDummy.position.copy(molV3);
      molDummy.updateMatrix();
      molEqu.transito.setMatrixAt(fluxo + i, molDummy.matrix);
    }
    molEqu.transito.count = fluxo*2;
    molEqu.transito.instanceMatrix.needsUpdate = true;
  }
}

/* ==================================================================
   4. CINÉTICA — perfil de energia, temperatura e catalisador
   O catalisador ABAIXA a energia de ativação; a temperatura aumenta
   a fração de colisões efetivas. O equilíbrio não se desloca.
   ================================================================== */
const molCin = {};

function molBuildCinetica(){
  const g = new THREE.Group();
  g.name = 'sub-cinetica';
  molCin.grupo = g;

  molCin.matCurva = new THREE.MeshStandardMaterial({ color:0x7fe0c8, roughness:.3, metalness:.35, emissive:0x0a4a3a, emissiveIntensity:.8 });
  molCin.curva = null;

  /* caixa de reagentes: colisões em função da temperatura */
  molCin.caixa = new THREE.Mesh(
    new THREE.BoxGeometry(7, 4.4, 4.4),
    new THREE.MeshStandardMaterial({ color:0x224466, roughness:.2, metalness:.1, transparent:true, opacity:.16, side:THREE.DoubleSide, depthWrite:false })
  );
  molCin.caixa.position.set(-4.6, -1.6, 0);
  g.add(molCin.caixa);

  molCin.particulas = new THREE.InstancedMesh(
    new THREE.SphereGeometry(.36, 12, 10),
    new THREE.MeshStandardMaterial({ color:0xffd06a, roughness:.3, metalness:.2, emissive:0x553300, emissiveIntensity:.9 }),
    60
  );
  molCin.particulas.frustumCulled = false;
  g.add(molCin.particulas);
  molCin.vel = [];
  for (let i = 0; i < 60; i++){
    molCin.vel.push({ x:molRand(i+1)*2-1, y:molRand(i+13)*2-1, z:molRand(i+29)*2-1 });
  }

  /* marcador que percorre o perfil de energia */
  molCin.marca = new THREE.Mesh(
    new THREE.SphereGeometry(.68, 18, 14),
    new THREE.MeshStandardMaterial({ color:0xffffff, roughness:.15, metalness:.4, emissive:0x6688aa, emissiveIntensity:1.2 })
  );
  g.add(molCin.marca);

  molGrupos.cinetica = g;
  molRoot.add(g);
  molCinReconstruirCurva();
}

/* reconstrói o perfil de energia conforme o catalisador */
function molCinReconstruirCurva(){
  if (molCin.curva){ molCin.grupo.remove(molCin.curva); molCin.curva.geometry.dispose(); }
  const cat = molClamp(molParams.catalisador, 0, 1);
  const barreira = 6.2 - 4.6*cat;          /* o catalisador ABAIXA a barreira */
  const pontos = [
    new THREE.Vector3(-11, -2.6, 0),
    new THREE.Vector3(-7.5, -2.4, 0),
    new THREE.Vector3(-5.2, -1.4, 0),
    new THREE.Vector3(-3.2, barreira*.55, 0),
    new THREE.Vector3(-1.6, barreira, 0),
    new THREE.Vector3(1.2, -1.2, 0),
    new THREE.Vector3(4.5, -3.2, 0),
    new THREE.Vector3(11, -3.4, 0)
  ];
  molCin.trajeto = new THREE.CatmullRomCurve3(pontos);
  molCin.curva = new THREE.Mesh(
    new THREE.TubeGeometry(molCin.trajeto, 120, .24, 10, false),
    molCin.matCurva
  );
  molCin.grupo.add(molCin.curva);
}

function molApplyCinetica(){
  molCinReconstruirCurva();
  molCin.escalaVel = .4 + 2.4 * molClamp(molParams.temperatura, 0, 1);
}

function molUpdateCinetica(t, dt){
  const v = molCin.escalaVel || 1;

  /* colisões na caixa: velocidade cresce com a temperatura */
  for (let i = 0; i < 60; i++){
    const d = molCin.vel[i];
    const px = -4.6 + (molRand(i+3)*3.2 - 1.6) + Math.sin(t*v + i)*1.4;
    const py = -1.6 + (molRand(i+7)*1.9 - .95) + Math.cos(t*v*.8 + i*1.7)*1.2;
    const pz = (molRand(i+11)*1.9 - .95) + Math.sin(t*v*.6 + i*.7)*1.1;
    molDummy.position.set(px, py, pz);
    molDummy.scale.setScalar(.8 + .3*Math.abs(Math.sin(t*3 + i)));
    molDummy.updateMatrix();
    molCin.particulas.setMatrixAt(i, molDummy.matrix);
  }
  molCin.particulas.count = 60;
  molCin.particulas.instanceMatrix.needsUpdate = true;

  /* o marcador sobe a barreira e desce ao vale dos produtos */
  if (molCin.trajeto){
    const u = (t*.14) % 1;
    molCin.trajeto.getPoint(u, molV3);
    molCin.marca.position.copy(molV3);
  }
}

/* ==================================================================
   5. ELETROQUÍMICA — pilha de Daniell
   Zn(s) -> Zn2+ + 2e-  (ânodo, polo NEGATIVO, oxidação)
   Cu2+ + 2e- -> Cu(s)  (cátodo, polo POSITIVO, redução)
   A massa depositada segue Faraday: m ∝ Q = i * t.
   ================================================================== */
const molEle = {};

function molBuildEletroquimica(){
  const g = new THREE.Group();
  g.name = 'sub-eletroquimica';

  molEle.cubaZn = molVidro(3.0, 5.0); molEle.cubaZn.position.set(-6, -2.5, 0);
  molEle.cubaCu = molVidro(3.0, 5.0); molEle.cubaCu.position.set( 6, -2.5, 0);
  g.add(molEle.cubaZn, molEle.cubaCu);

  molEle.solZn = new THREE.Mesh(
    new THREE.CylinderGeometry(2.88, 2.88, 3.8, 32),
    new THREE.MeshStandardMaterial({ color:0x9fb8d8, roughness:.25, metalness:.05, transparent:true, opacity:.5 })
  );
  molEle.solZn.position.set(-6, -1.9, 0);
  molEle.solCu = new THREE.Mesh(
    new THREE.CylinderGeometry(2.88, 2.88, 3.8, 32),
    new THREE.MeshStandardMaterial({ color:0x5cb8ff, roughness:.25, metalness:.05, transparent:true, opacity:.5 })
  );
  molEle.solCu.position.set(6, -1.9, 0);
  g.add(molEle.solZn, molEle.solCu);

  /* eletrodos: Zn (cinza) no ânodo, Cu (cobreado) no cátodo */
  molEle.zn = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 5.8, 1.15),
    new THREE.MeshStandardMaterial({ color:0xb0b8c4, roughness:.35, metalness:.85 })
  );
  molEle.zn.position.set(-6, .4, 0);
  molEle.cu = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 5.8, 1.15),
    new THREE.MeshStandardMaterial({ color:0xe08a4a, roughness:.3, metalness:.9 })
  );
  molEle.cu.position.set(6, .4, 0);
  g.add(molEle.zn, molEle.cu);

  /* fio externo: do Zn (ânodo) para o Cu (cátodo) */
  molEle.fioCurva = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-6, 3.1, 0),
    new THREE.Vector3(-6, 5.4, 0),
    new THREE.Vector3(0, 6.2, 0),
    new THREE.Vector3(6, 5.4, 0),
    new THREE.Vector3(6, 3.1, 0)
  ]);
  const fio = new THREE.Mesh(
    new THREE.TubeGeometry(molEle.fioCurva, 64, .12, 8, false),
    new THREE.MeshStandardMaterial({ color:0x8899aa, roughness:.4, metalness:.8 })
  );
  g.add(fio);

  /* ponte salina: tubo em U entre as duas soluções */
  const ponteCurva = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-6, 1.6, 1.6),
    new THREE.Vector3(-6, 3.6, 2.4),
    new THREE.Vector3(0, 4.2, 2.4),
    new THREE.Vector3(6, 3.6, 2.4),
    new THREE.Vector3(6, 1.6, 1.6)
  ]);
  const ponte = new THREE.Mesh(
    new THREE.TubeGeometry(ponteCurva, 64, .3, 12, false),
    new THREE.MeshStandardMaterial({ color:0xd0e8ff, roughness:.15, metalness:.05, transparent:true, opacity:.34, side:THREE.DoubleSide, depthWrite:false })
  );
  g.add(ponte);

  /* elétrons percorrendo o fio externo */
  molEle.eletrons = new THREE.InstancedMesh(
    new THREE.SphereGeometry(.28, 10, 8),
    new THREE.MeshStandardMaterial({ color:0xffe06a, roughness:.2, metalness:.3, emissive:0x886600, emissiveIntensity:1.4 }),
    40
  );
  molEle.eletrons.frustumCulled = false;
  g.add(molEle.eletrons);

  molGrupos.eletroquimica = g;
  molRoot.add(g);
}

function molApplyEletroquimica(){
  const i = molClamp(molParams.corrente, 0, 5);       /* amperes          */
  const min = molClamp(molParams.tempo, 0, 60);      /* minutos          */
  /* Q = i * t; um mol de elétrons = 96.500 C (Faraday).
     A altura depositada no cátodo cresce com a carga que passou.  */
  const carga = i * min * 60;
  molEle.fracao = molClamp(carga / (5*60*60), 0, 1);
  molEle.nElet = Math.max(4, Math.round(6 + 34 * (i/5) * (0.25 + 0.75*min/60)));
  molEle.velElet = .12 + .5 * (i/5);

  /* o eletrodo de Cu engrossa com o depósito; o de Zn se consome */
  molEle.cu.scale.set(1 + molEle.fracao*.9, 1 - molEle.fracao*.12, 1 + molEle.fracao*.9);
  molEle.zn.scale.set(1 - molEle.fracao*.45, 1 - molEle.fracao*.1, 1 - molEle.fracao*.45);
}

function molUpdateEletroquimica(t){
  if (!molEle.fioCurva) return;
  for (let i = 0; i < molEle.nElet; i++){
    const u = (t*molEle.velElet + i/molEle.nElet) % 1;
    molEle.fioCurva.getPoint(u, molV3);
    molDummy.position.copy(molV3);
    molDummy.scale.setScalar(1);
    molDummy.updateMatrix();
    molEle.eletrons.setMatrixAt(i, molDummy.matrix);
  }
  molEle.eletrons.count = molEle.nElet;
  molEle.eletrons.instanceMatrix.needsUpdate = true;
}

/* ==================================================================
   6. ORGÂNICA — cadeia carbônica, tetravalência e insaturação
   A cadeia é reconstruída quando `carbono` ou `insaturacao` mudam,
   o que só acontece quando o usuário mexe no controle (apply),
   nunca a cada quadro.
   ================================================================== */
const molOrg = {};

function molBuildOrganica(){
  const g = new THREE.Group();
  g.name = 'sub-organica';
  molOrg.grupo = g;
  molGrupos.organica = g;
  molRoot.add(g);
  molOrgReconstruir();
}

function molOrgReconstruir(){
  const g = molOrg.grupo;
  while (g.children.length) g.remove(g.children[0]);

  const n = Math.round(molClamp(molParams.carbono, 1, 12));
  const ins = molClamp(molParams.insaturacao, 0, 1);
  const nDuplas = Math.round(ins * Math.max(0, Math.floor((n - 1) / 2)));

  const matC = new THREE.MeshStandardMaterial({ color:0x2a3340, roughness:.4, metalness:.3 });
  const matLig = new THREE.MeshStandardMaterial({ color:0x9fb0c0, roughness:.35, metalness:.6 });
  const matH = new THREE.MeshStandardMaterial({ color:0xe8f0ff, roughness:.4, metalness:.1 });

  const esfC = new THREE.SphereGeometry(.72, 20, 16);
  const esfH = new THREE.SphereGeometry(.38, 14, 12);

  /* posições em zigue-zague: carbonos alternam acima/abaixo */
  const pos = [];
  for (let i = 0; i < n; i++){
    pos.push(new THREE.Vector3(-((n-1)*1.0) + i*2.0, (i%2 === 0 ? .6 : -.6), 0));
  }

  /* quais ligações são duplas */
  const dupla = new Set();
  for (let k = 0; k < nDuplas; k++) dupla.add(1 + k*2);

  /* ligações */
  for (let i = 0; i < n - 1; i++){
    if (dupla.has(i)){
      /* ligação dupla: dois cilindros paralelos, levemente afastados */
      const a = pos[i], b = pos[i+1];
      const meio = a.clone().add(b).multiplyScalar(.5);
      const dirv = b.clone().sub(a).normalize();
      const perp = new THREE.Vector3(-dirv.y, dirv.x, 0).multiplyScalar(.24);
      molCilindroEntre(a.clone().add(perp), b.clone().add(perp), .14, matLig, g);
      molCilindroEntre(a.clone().sub(perp), b.clone().sub(perp), .14, matLig, g);
    } else {
      molCilindroEntre(pos[i], pos[i+1], .20, matLig, g);
    }
  }

  /* carbonos */
  pos.forEach(p => {
    const c = new THREE.Mesh(esfC, matC);
    c.position.copy(p);
    g.add(c);
  });

  /* hidrogênios: cada carbono completa a tetravalência
     (terminal: 3 H, ou 2 se participar de dupla; interno: 2 H, ou 1) */
  for (let i = 0; i < n; i++){
    let grau = 2;                                    /* duas ligações C-C internas */
    if (i === 0 || i === n-1) grau = 1;
    if (dupla.has(i) || dupla.has(i-1)) grau += 1;    /* a dupla consome um grau extra */
    const nh = 4 - grau;
    for (let h = 0; h < nh; h++){
      const ang = (h / Math.max(1, nh)) * Math.PI * 2 + i;
      const hh = new THREE.Mesh(esfH, matH);
      hh.position.set(
        pos[i].x + Math.cos(ang)*1.25,
        pos[i].y + Math.sin(ang)*1.25,
        (h % 2 === 0 ? 1.05 : -1.05)
      );
      g.add(hh);
    }
  }
}

function molApplyOrganica(){
  molOrgReconstruir();
}

function molUpdateOrganica(t){
  if (molOrg.grupo) molOrg.grupo.rotation.y = t * .35;
}

/* ==================================================================
   7. GENÉTICA — dupla-hélice de DNA e emparelhamento complementar
   A-T (adenina-timina) e C-G (citosina-guanina). O emparelhamento é
   complementar e específico; `geracoes` controla a abertura da hélice
   (metáfora visual da replicação semiconservativa).
   ================================================================== */
const molGen = {};

function molBuildGenetica(){
  const g = new THREE.Group();
  g.name = 'sub-genetica';

  molGen.grupo = g;
  molGen.matA = new THREE.MeshStandardMaterial({ color:0x63b8ff, roughness:.35, metalness:.25, emissive:0x2a6aff, emissiveIntensity:1.5 });
  molGen.matB = new THREE.MeshStandardMaterial({ color:0xff9ac5, roughness:.35, metalness:.25, emissive:0xff3a7a, emissiveIntensity:1.5 });
  molGen.matAde = new THREE.MeshStandardMaterial({ color:0xff8a8a, roughness:.35, metalness:.1, emissive:0xff3030, emissiveIntensity:1.4 });
  molGen.matTim = new THREE.MeshStandardMaterial({ color:0xffe06a, roughness:.35, metalness:.1, emissive:0xffb020, emissiveIntensity:1.4 });
  molGen.matCit = new THREE.MeshStandardMaterial({ color:0x7cc4ff, roughness:.35, metalness:.1, emissive:0x2a7aff, emissiveIntensity:1.4 });
  molGen.matGua = new THREE.MeshStandardMaterial({ color:0x7df0b0, roughness:.35, metalness:.1, emissive:0x20c070, emissiveIntensity:1.4 });

  molGen.fitaA = [];
  molGen.fitaB = [];
  molGen.pares = [];
  molGen.abertura = 0;

  const voltas = 2.4;
  const passos = 46;
  const altura = 13;
  const raio = 2.0;
  const ptsA = [], ptsB = [];

  for (let i = 0; i <= passos; i++){
    const u = i/passos;
    const ang = u * Math.PI * 2 * voltas;
    const y = -altura/2 + u*altura;
    ptsA.push(new THREE.Vector3(Math.cos(ang)*raio, y, Math.sin(ang)*raio));
    ptsB.push(new THREE.Vector3(Math.cos(ang + Math.PI)*raio, y, Math.sin(ang + Math.PI)*raio));
  }
  molGen.curvaA = new THREE.CatmullRomCurve3(ptsA);
  molGen.curvaB = new THREE.CatmullRomCurve3(ptsB);

  g.add(new THREE.Mesh(new THREE.TubeGeometry(molGen.curvaA, 140, .34, 10, false), molGen.matA));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(molGen.curvaB, 140, .34, 10, false), molGen.matB));

  /* pares de bases: metade colorida pela base da fita A, metade pela
     complementar da fita B — o emparelhamento é A-T e C-G          */
  const geoPar = new THREE.CylinderGeometry(.27, .27, 1, 12);
  const nPar = 24;
  for (let i = 0; i < nPar; i++){
    const u = (i + .5)/nPar;
    const pa = molGen.curvaA.getPoint(u);
    const pb = molGen.curvaB.getPoint(u);
    const meio = pa.clone().add(pb).multiplyScalar(.5);
    const tipo = molRand(i*3.7) > .5 ? 'AT' : 'CG';

    const m1 = new THREE.Mesh(geoPar, tipo === 'AT' ? molGen.matAde : molGen.matCit);
    const m2 = new THREE.Mesh(geoPar, tipo === 'AT' ? molGen.matTim : molGen.matGua);
    m1.scale.y = pa.distanceTo(meio)/1;
    m2.scale.y = pb.distanceTo(meio)/1;
    molPosicionarCilindro(m1, pa, meio);
    molPosicionarCilindro(m2, meio, pb);
    m1.userData.u = u; m2.userData.u = u;
    g.add(m1, m2);
    molGen.pares.push({ m1, m2, u });
  }

  molGrupos.genetica = g;
  molRoot.add(g);
}

function molPosicionarCilindro(cil, a, b){
  const dir = molV3.copy(b).sub(a);
  const len = dir.length() || .001;
  cil.position.copy(a).addScaledVector(dir, .5);
  cil.scale.y = len;
  cil.quaternion.setFromUnitVectors(new THREE.Object3D().up, dir.clone().normalize());
}

function molApplyGenetica(){
  const ger = molClamp(molParams.geracoes, 1, 12);
  const sel = molClamp(molParams.selecao, 0, 1);
  molGen.abertura = (ger - 1)/11;

  /* pares ocultos na região já aberta: a hélice se separa a partir
     de uma extremidade, como na replicação semiconservativa          */
  molGen.pares.forEach(par => {
    const aberto = par.u < molGen.abertura;
    par.m1.visible = !aberto;
    par.m2.visible = !aberto;
    /* a pressão seletiva realça um trecho da molécula */
    const foco = (par.u > .35 && par.u < .65);
    par.m1.material.emissiveIntensity = foco ? .9 + sel*1.6 : .9;
    par.m2.material.emissiveIntensity = foco ? .9 + sel*1.6 : .9;
  });
}

function molUpdateGenetica(t){
  if (molGen.grupo) molGen.grupo.rotation.y = t * .5;
}

/* ==================================================================
   CONTRATO PÚBLICO
   ================================================================== */
export function buildMoleculas(){
  if (molConstruido) return;
  molBuildEstequiometria();
  molBuildSolucoes();
  molBuildEquilibrio();
  molBuildCinetica();
  molBuildEletroquimica();
  molBuildOrganica();
  molBuildGenetica();
  MOL_SUBCENAS.forEach(k => { molGrupos[k].visible = (k === molCenaAtual); });
  molConstruido = true;
  molApply();
}

export function setMolCena(nome){
  if (MOL_SUBCENAS.indexOf(nome) === -1) return;
  molCenaAtual = nome;
  MOL_SUBCENAS.forEach(k => { if (molGrupos[k]) molGrupos[k].visible = (k === nome); });
  molApply();
}

export function molApply(){
  if (!molConstruido) return;
  switch (molCenaAtual){
    case 'estequiometria': molApplyEstequiometria(); break;
    case 'solucoes':       molApplySolucoes();       break;
    case 'equilibrio':     molApplyEquilibrio();     break;
    case 'cinetica':       molApplyCinetica();       break;
    case 'eletroquimica':  molApplyEletroquimica();  break;
    case 'organica':       molApplyOrganica();       break;
    case 'genetica':       molApplyGenetica();       break;
  }
  /* garante o estado coerente no primeiro quadro */
  updateMoleculas(0);
}

export function updateMoleculas(dt){
  if (!molConstruido || !molRoot.visible) return;
  molTempo += Math.min(dt, .05);
  const t = molTempo;
  switch (molCenaAtual){
    case 'estequiometria': molUpdateEstequiometria(t); break;
    case 'solucoes':       molUpdateSolucoes(t);       break;
    case 'equilibrio':     molUpdateEquilibrio(t);    break;
    case 'cinetica':       molUpdateCinetica(t, dt);  break;
    case 'eletroquimica':  molUpdateEletroquimica(t); break;
    case 'organica':       molUpdateOrganica(t);      break;
    case 'genetica':       molUpdateGenetica(t);      break;
  }
}

/* leituras auxiliares para os simuladores e para os testes */
export function molLeituras(){
  return {
    estequiometria: molEst.limitante ? {
      limitante: molEst.limitante,
      nh3: molEst.rendTexto
    } : null,
    equilibrio: isFinite(molEqu.ph) ? { ph: molEqu.ph } : null,
    solucoes: molSol.mols !== undefined ? { mols: molSol.mols, altura: molSol.altura } : null
  };
}