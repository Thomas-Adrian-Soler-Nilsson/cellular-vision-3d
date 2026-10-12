/* =====================================================================
   PARTE 1 — CONTEÚDO CIENTÍFICO DAS ESTRUTURAS
   ===================================================================== */
export const SCIENCE = {
  membrana:{
    nome:'Membrana Plasmática', tipo:'Envoltório celular', cor:0x7fd4ff,
    escala:'≈ 7–8 nm de espessura (bicamada lipídica) — cerca de 2.500 vezes menos espessa que o diâmetro de uma célula de 20 μm.',
    anatomia:'Bicamada contínua de fosfolipídios que delimita todo o volume celular. Apresenta dois folhetos — externo e interno — cujas cabeças polares ficam voltadas para as fases aquosas (meio extracelular e citosol), enquanto as caudas apolares se enfrentam no interior da bicamada. Proteínas integrais atravessam a bicamada e proteínas periféricas aderem às suas superfícies. O folheto externo é revestido pelo glicocálice.',
    estruturais:['Duas camadas paralelas de moléculas anfipáticas, com ~7 nm de espessura total.','Proteínas transmembrana com domínios hidrofóbicos e hidrofílicos distintos.','Canais, bombas e receptores distribuídos de forma assimétrica entre os folhetos.','Microdomínios ordenados e ricos em colesterol e esfingolipídios (jangadas lipídicas).','Assimetria composicional entre folhetos, mantida por flipases e flopases.'],
    composicao:'Fosfolipídios (fosfatidilcolina, fosfatidiletanolamina, fosfatidilserina, esfingomielina), colesterol, glicolipídios, proteínas integrais e periféricas e glicocálice.',
    funcao:'Delimitar a célula e manter sua identidade; controlar seletivamente a entrada e a saída de íons, nutrientes e resíduos; receber e transmitir sinais; promover reconhecimento e adesão celular; sustentar o potencial elétrico de membrana.',
    processos:['Difusão simples e difusão facilitada por canais e carreadores.','Osmose e regulação do volume celular.','Transporte ativo primário — bomba de Na+/K+-ATPase (3 Na+ para fora, 2 K+ para dentro).','Endocitose e exocitose.','Transdução de sinais por receptores acoplados a proteína G e receptores tirosina-quinase.'],
    relacoes:'É contínua com o sistema de endomembranas pelo envelope nuclear, recebe vesículas do complexo de Golgi e é ancorada e remodelada pelo córtex de actina.',
    curiosidades:['O modelo do mosaico fluido foi proposto por Singer e Nicolson em 1972.','Lipídios difundem lateralmente cerca de 1 μm² por segundo — a membrana é fluida, não rígida.','A fosfatidilserina é mantida no folheto interno; sua exposição externa é sinal de apoptose.'],
    consequencias:'Mutações no canal de cloreto CFTR causam fibrose cística. Defeitos na distrofina, que liga o citoesqueleto à membrana, causam distrofias musculares.'
  },
  citoplasma:{
    nome:'Citoplasma e Citosol', tipo:'Compartimento intracelular', cor:0x2f7fa8,
    escala:'Ocupa 50–80 % do volume celular. O citosol contém ~200–300 mg/mL de proteínas dissolvidas.',
    anatomia:'O citoplasma é todo o conteúdo celular entre a membrana plasmática e o envelope nuclear. Compreende o citosol — solução aquosa concentrada de proteínas, íons, metabólitos e açúcares — e todas as estruturas nele suspensas: organelas membranosas, ribossomos, inclusões e o citoesqueleto.',
    estruturais:['Fase aquosa contínua com alta concentração de macromoléculas.','Organelas membranosas imersas e posicionadas pelo citoesqueleto.','Gradientes iônicos e de pH mantidos entre citosol e interior das organelas.','Movimento citoplasmático constante (ciclose), impulsionado por proteínas motoras.'],
    composicao:'Água (≈ 70 %), proteínas solúveis, aminoácidos, nucleotídeos, íons (K⁺, Na⁺, Cl⁻, Ca²⁺, Mg²⁺), açúcares, lipídios e metabólitos intermediários.',
    funcao:'Sede da glicólise, da fermentação e de parte da síntese de aminoácidos e ácidos graxos. Serve de meio de difusão, de trânsito de vesículas e de suporte físico a reações enzimáticas.',
    processos:['Glicólise: conversão de glicose em piruvato com produção líquida de 2 ATP por molécula.','Síntese de proteínas por ribossomos livres.','Transporte intracelular dependente de microtúbulos e actina.','Sinalização por segundos mensageiros como AMPc e Ca²⁺.'],
    relacoes:'Interage com todas as organelas. É o ponto de partida e de chegada do tráfego vesicular e o meio onde o citoesqueleto se organiza.',
    curiosidades:['O citosol é mais parecido com um gel viscoso do que com água livre, devido à alta concentração de proteínas.','Sua viscosidade e composição variam regionalmente e ao longo do ciclo celular.','Cerca de 20 % das proteínas celulares são chaperonas que auxiliam o enovelamento.'],
    consequencias:'Alterações na composição iônica do citosol afetam o volume celular e podem levar a edema ou encolhimento. O acúmulo de agregados proteicos no citosol é característico de doenças neurodegenerativas.'
  },
  juncoes:{
    nome:'Junções Celulares e Glicocálice', tipo:'Especializações da membrana', cor:0x66e0ff,
    escala:'Desmossomos com 0,2–0,5 μm; junções gap com canais de ~1,5 nm de diâmetro interno.',
    anatomia:'Regiões especializadas da membrana plasmática que promovem adesão mecânica, vedação do espaço intercelular ou comunicação direta entre células vizinhas. Desmossomos e junções de oclusão são sustentados por placas proteicas ligadas ao citoesqueleto; as junções gap são conjuntos de canais de conexina que atravessam as duas membranas. O glicocálice, formado por carboidratos ligados a proteínas e lipídios, reveste toda a superfície externa e participa do reconhecimento celular.',
    estruturais:['Desmossomos: placas citoplasmáticas com caderinas que ancoram filamentos intermediários.','Junções gap (comunicantes): canais de conexina alinhados entre células adjacentes.','Junções de oclusão: faixas de claudinas e ocludinas que vedam o espaço intercelular.','Plasmodesmos, em vegetais: canais revestidos por membrana que atravessam a parede celular.','Glicocálice: cadeias de carboidratos que formam a "assinatura" da superfície celular.'],
    composicao:'Caderinas (desmossomos), conexinas (junções gap), claudinas e ocludinas (junções de oclusão), integrinas, proteínas adaptadoras ligadas à actina e aos filamentos intermediários, e glicoproteínas e glicolipídios do glicocálice.',
    funcao:'Manter a coesão dos tecidos, resistir ao estresse mecânico, vedar barreiras epiteliais, permitir comunicação elétrica e química direta e mediar reconhecimento e adesão celular.',
    processos:['Adesão celular e montagem de epitélios.','Propagação do potencial de ação entre células cardíacas e musculares lisas.','Formação da barreira hematoencefálica e da barreira intestinal.','Reconhecimento imune e determinação de grupos sanguíneos.'],
    relacoes:'Ligam-se à membrana plasmática, ao córtex de actina e aos filamentos intermediários, e comunicam-se com o citoesqueleto e o núcleo por vias de sinalização mecânica.',
    curiosidades:['As junções gap permitem que o coração se comporte como um sincício funcional.','Pênfigo vulgar é uma doença autoimune contra desmossomos da pele.','O glicocálice determina os grupos sanguíneos ABO.'],
    consequencias:'Defeitos em desmossomos causam pênfigo e cardiomiopatia arritmogênica. Mutações em conexinas causam surdez não sindrômica e neuropatias periféricas.'
  },
  nucleo:{
    nome:'Núcleo Celular', tipo:'Compartimento genético', cor:0x9b7bff,
    escala:'Diâmetro típico de 5–10 μm. O envelope nuclear tem ~40 nm (duas membranas separadas por 20–40 nm).',
    anatomia:'Estrutura esférica ou elipsoide delimitada pelo envelope nuclear duplo, contínuo com o retículo endoplasmático. O envelope é perfurado por complexos de poros nucleares. No interior encontram-se a cromatina (DNA associado a histonas) e uma ou mais regiões densas, os nucléolos, onde ocorre a produção das subunidades ribossômicas.',
    estruturais:['Envelope nuclear formado por duas membranas lipídicas com espaço perinuclear entre elas.','Complexos de poros nucleares (~120 nm) que regulam o transporte núcleo-citoplasma.','Cromatina em graus variados de condensação — heterocromatina densa e eucromatina mais frouxa.','Nucléolo sem membrana própria, organizado nas regiões fibrilar, granular e centro fibrilar.','Lâmina nuclear interna, formada por laminas, que dá suporte mecânico ao envelope.'],
    composicao:'DNA genômico, histonas (H1, H2A, H2B, H3, H4), proteínas não histonas, laminas nucleares, complexos de poro (nucleoporinas), RNA e enzimas de replicação e transcrição.',
    funcao:'Armazenar e proteger o material genético; organizar a cromatina em territórios funcionais; regular a expressão gênica; realizar a replicação do DNA e a transcrição; montar as subunidades ribossômicas no nucléolo.',
    processos:['Replicação do DNA na fase S do ciclo celular.','Transcrição de genes em RNA mensageiro, ribossômico e transportador.','Processamento do RNA: capeamento, splicing e poliadenilação.','Transporte seletivo de proteínas e RNAs pelos poros nucleares.','Montagem das subunidades ribossômicas 40S e 60S no nucléolo.'],
    relacoes:'O envelope nuclear é contínuo com o retículo endoplasmático rugoso. Os poros exportam as subunidades ribossômicas ao citosol. A lâmina nuclear conecta-se ao citoesqueleto por complexos de ancoragem.',
    curiosidades:['Se o DNA de uma única célula humana fosse esticado, mediria cerca de 2 metros.','O nucléolo é visível ao microscópio óptico comum e não possui membrana.','Durante a mitose o envelope nuclear se desmonta e se reorganiza ao final, em torno dos cromossomos filhos.'],
    consequencias:'Mutações nas laminas causam laminopatias, como a progeria de Hutchinson-Gilford e certas distrofias musculares.'
  },
  mitocondria:{
    nome:'Mitocôndria', tipo:'Organela energética', cor:0xff8a5c,
    escala:'Comprimento de 1–10 μm e diâmetro de 0,5–1 μm. As cristas têm 20–40 nm de espessura.',
    anatomia:'Organela alongada delimitada por duas membranas. A membrana externa é lisa e permeável por porinas. A membrana interna é altamente pregueada, formando cristas que se projetam na matriz e aumentam enormemente a superfície disponível. O espaço intermembranar fica entre as duas membranas e a matriz mitocondrial preenche o interior.',
    estruturais:['Membrana externa lisa, com porinas que permitem a passagem de moléculas pequenas.','Membrana interna impermeável, rica em cardiolipina e nas proteínas da cadeia respiratória.','Cristas mitocondriais — dobras da membrana interna — com partículas F1 da ATP sintase voltadas para a matriz.','Matriz com DNA mitocondrial circular, ribossomos 70S e enzimas do ciclo de Krebs.','Genoma mitocondrial próprio, herdado por via materna.'],
    composicao:'Fosfolipídios (com cardiolipina abundante), proteínas da cadeia transportadora de elétrons, ATP sintase, DNA circular, ribossomos, enzimas do ciclo de Krebs e transportadores de metabólitos.',
    funcao:'Produzir a maior parte do ATP celular por fosforilação oxidativa; participar da regulação do cálcio citosólico; executar a via intrínseca da apoptose; atuar na biossíntese de grupos heme e de esteroides em células especializadas.',
    processos:['Ciclo de Krebs na matriz: oxidação de acetil-CoA a CO₂, gerando NADH e FADH₂.','Cadeia transportadora de elétrons na membrana interna (complexos I–IV), transferindo elétrons ao O₂.','Bombeamento de prótons para o espaço intermembranar, criando gradiente eletroquímico.','Fosforilação oxidativa: retorno dos prótons pela ATP sintase, convertendo ADP + Pi em ATP.','Via intrínseca da apoptose, com liberação de citocromo c.'],
    relacoes:'Recebe piruvato e ácidos graxos do citosol; mantém sítios de contato físicos com o retículo endoplasmático (MAM) que regulam a troca de cálcio e lipídios; seu produto, o ATP, abastece todas as organelas.',
    curiosidades:['Uma célula hepática pode conter de 1.000 a 2.000 mitocôndrias.','A hipótese endossimbiótica propõe que a mitocôndria descende de uma bactéria aeróbia ancestral incorporada por uma célula hospedeira.','O DNA mitocondrial humano tem cerca de 16.500 pares de bases e codifica 13 proteínas.'],
    consequencias:'Mutações no DNA mitocondrial causam MELAS e síndrome de Leigh. A disfunção mitocondrial está implicada no envelhecimento, em doenças neurodegenerativas e no diabetes tipo 2.'
  },
  re_rugoso:{
    nome:'Retículo Endoplasmático Rugoso', tipo:'Sistema de endomembranas', cor:0x4fd1c5,
    escala:'Cisternas com 40–60 nm de espessura; a rede pode ocupar cerca de 10 % do volume celular.',
    anatomia:'Rede de sacos membranosos achatados e interconectados — as cisternas — cuja face citosólica é revestida por ribossomos aderidos, responsáveis pelo aspecto rugoso. É contínuo com o envelope nuclear e com o retículo endoplasmático liso.',
    estruturais:['Cisternas achatadas e paralelas, com lúmen contínuo entre si.','Ribossomos aderidos à face citosólica pelo complexo translocador (translocon).','Continuidade física direta com o envelope nuclear externo.','Regiões especializadas de saída de vesículas (sítios ERES).'],
    composicao:'Membrana fosfolipídica, translocon Sec61, chaperonas (BiP, calnexina, calreticulina), oligossacariltransferases, peptidases sinal e ribossomos aderidos.',
    funcao:'Sintetizar e processar inicialmente proteínas destinadas à secreção, às membranas e a determinados compartimentos intracelulares; realizar a N-glicosilação; formar pontes dissulfeto; garantir a qualidade do enovelamento proteico.',
    processos:['Tradução de proteínas com peptídeo-sinal, dirigidas ao RE pelo reconhecimento da partícula SRP.','Translocação da cadeia polipeptídica para o lúmen do RE.','N-glicosilação de asparaginas e formação de pontes dissulfeto.','Enovelamento assistido por chaperonas e controle de qualidade.','Resposta a proteínas mal enoveladas (UPR), que aumenta a produção de chaperonas.'],
    relacoes:'É contínuo com o envelope nuclear, fornece lipídios e proteínas ao complexo de Golgi por vesículas e recebe cálcio e sinais do citosol. Mantém contato físico com mitocôndrias em sítios especializados.',
    curiosidades:['Células secretoras, como as do pâncreas, possuem RE rugoso extremamente desenvolvido.','Proteínas mal enoveladas são reconhecidas e degradadas pelo sistema ERAD.','O lúmen do RE é oxidante, condição necessária para a formação de pontes dissulfeto.'],
    consequencias:'Defeitos de enovelamento no RE estão associados à fibrose cística (ΔF508-CFTR) e a doenças de acúmulo conformacional.'
  },
  re_liso:{
    nome:'Retículo Endoplasmático Liso', tipo:'Sistema de endomembranas', cor:0x63e6be,
    escala:'Túbulos com 30–60 nm de diâmetro; rede contínua com o RE rugoso.',
    anatomia:'Rede de túbulos membranosos interconectados, sem ribossomos aderidos. Forma uma malha tridimensional que se estende pelo citoplasma e se conecta ao retículo rugoso. Em células especializadas pode ser muito abundante, como nos hepatócitos e nas fibras musculares (retículo sarcoplasmático).',
    estruturais:['Túbulos curvos e ramificados, sem ribossomos na superfície.','Continuidade com as cisternas do retículo rugoso.','Regiões especializadas em contato com mitocôndrias e membrana plasmática.','Retículo sarcoplasmático com bombas SERCA para armazenamento de cálcio.'],
    composicao:'Membrana fosfolipídica rica em enzimas de síntese de lipídios (aciltransferases), citocromo P450, bombas de cálcio SERCA e proteínas de transferência de lipídios.',
    funcao:'Sintetizar lipídios de membrana, colesterol e hormônios esteroides; participar da desintoxicação de substâncias lipossolúveis; armazenar e liberar cálcio de forma controlada.',
    processos:['Síntese de fosfolipídios e de colesterol.','Síntese de hormônios esteroides em células endócrinas.','Desintoxicação por oxidação mediada pelo citocromo P450.','Armazenamento de Ca²⁺ e liberação rápida na contração muscular e na sinalização.','Glicogenólise no fígado, com liberação de glicose-6-fosfato.'],
    relacoes:'Fornece lipídios e proteínas ao retículo rugoso e ao complexo de Golgi e mantém contato com mitocôndrias para troca de cálcio e lipídios.',
    curiosidades:['No fígado, o RE liso pode dobrar de volume em resposta a fármacos como o fenobarbital.','O retículo sarcoplasmático libera cálcio em milissegundos para desencadear a contração muscular.','Alterações no metabolismo de lipídios do RE estão ligadas a doenças de acúmulo, como a de Wolman.'],
    consequencias:'Alterações na captação de cálcio pelo retículo estão envolvidas em arritmias cardíacas e em doenças musculares.'
  },
  golgi:{
    nome:'Complexo de Golgi', tipo:'Organela de tráfego', cor:0xffd166,
    escala:'Cisternas com 20–30 nm de espessura cada, empilhadas em uma pilha de 1–3 μm.',
    anatomia:'Conjunto de cisternas membranosas achatadas e empilhadas, com polaridade definida. A face cis recebe vesículas do retículo endoplasmático; a face trans origina vesículas de secreção. Entre elas há cisternas mediais, onde ocorre a maior parte do processamento.',
    estruturais:['Pilha de 4 a 8 cisternas achatadas e paralelas.','Face cis (de entrada) e face trans (de saída), com composições distintas.','Vesículas de transporte associadas às margens das cisternas.','Rede trans-Golgi (TGN), centro de triagem e endereçamento de proteínas.'],
    composicao:'Membranas fosfolipídicas, glicosiltransferases, manosidases, sialiltransferases, proteínas de revestimento (COPI, COPII, clatrina) e proteínas SNARE de fusão.',
    funcao:'Modificar proteínas e lipídios recebidos do RE; adicionar e remodelar cadeias de carboidratos; classificar moléculas e empacotá-las em vesículas dirigidas aos destinos corretos; sintetizar polissacarídeos complexos.',
    processos:['Glicosilação e processamento de oligossacarídeos N-ligados.','O-glicosilação e sulfatação de proteínas.','Fosforilação de manose em enzimas lisossômicas.','Formação de vesículas revestidas e transporte anterógrado e retrógrado.'],
    relacoes:'Recebe vesículas do retículo endoplasmático, envia enzimas ao lisossomo e exporta proteínas para a membrana plasmática e para o meio extracelular.',
    curiosidades:['O nome homenageia Camillo Golgi, que descreveu a estrutura em 1898.','As faces cis e trans diferem tanto em composição lipídica quanto enzimática.','O Golgi também funciona como ponto de montagem de alguns vírus envelopados.'],
    consequencias:'Defeitos na glicosilação causam doenças congênitas conhecidas como CDG.'
  },
  ribossomos:{
    nome:'Ribossomos', tipo:'Complexo ribonucleoproteico', cor:0xe8f4ff,
    escala:'≈ 25–30 nm de diâmetro; subunidades 40S e 60S em eucariotos e 70S em procariontes.',
    anatomia:'Estruturas não membranosas formadas por duas subunidades de tamanhos diferentes. Cada subunidade contém RNA ribossômico e proteínas. Podem estar livres no citosol ou aderidas à face citosólica do retículo endoplasmático rugoso.',
    estruturais:['Subunidade maior (60S), com o sítio catalítico da peptidil-transferase.','Subunidade menor (40S), responsável pela ligação ao RNA mensageiro.','Sítios A, P e E para os RNA transportadores.','Ribossomos livres formam polissomos; os aderidos acoplam-se ao translocon.'],
    composicao:'RNA ribossômico (rRNA) e proteínas ribossômicas; a subunidade menor contém o rRNA 18S e a maior, os rRNAs 28S, 5,8S e 5S.',
    funcao:'Realizar a tradução do RNA mensageiro em cadeias polipeptídicas, catalisando a formação de ligações peptídicas entre aminoácidos.',
    processos:['Iniciação da tradução, com recrutamento do tRNA iniciador e do mRNA.','Elongação, com translocação do ribossomo ao longo do mRNA.','Terminação, com liberação do polipeptídeo e reciclagem das subunidades.','Direcionamento cotraducional ao RE pelo peptídeo-sinal.'],
    relacoes:'Ribossomos livres produzem proteínas do citosol, do núcleo, das mitocôndrias e dos peroxissomos. Ribossomos aderidos produzem proteínas destinadas à secreção, à membrana e aos lisossomos.',
    curiosidades:['Um ribossomo pode traduzir cerca de 15 a 20 aminoácidos por segundo.','Uma célula humana pode conter milhões de ribossomos.','Alguns antibióticos atuam especificamente sobre o ribossomo bacteriano 70S.'],
    consequencias:'Mutações em proteínas ribossômicas causam ribossomopatias, como a anemia de Diamond-Blackfan.'
  },
  lisossomos:{
    nome:'Lisossomos', tipo:'Organela digestiva', cor:0xff6b9d,
    escala:'Diâmetro entre 0,1 e 1,2 μm; o lúmen é ácido, com pH em torno de 4,5–5,0.',
    anatomia:'Vesículas delimitadas por membrana única, com interior ácido e rico em enzimas hidrolíticas. Sua forma e seu conteúdo variam conforme o material em digestão, o que as torna estruturas dinâmicas e heterogêneas.',
    estruturais:['Membrana única, resistente à ação das próprias hidrolases.','Bomba de prótons V-ATPase que acidifica o lúmen.','Interior com conteúdo heterogêneo, em diferentes estágios de digestão.','Corpos residuais com material não digerido, como a lipofuscina.'],
    composicao:'Membrana com proteínas altamente glicosiladas, hidrolases ácidas (proteases, lipases, nucleases, glicosidases, fosfatases), bomba de prótons e canais iônicos.',
    funcao:'Realizar a digestão intracelular de macromoléculas; reciclar componentes celulares; eliminar agentes patogênicos fagocitados; executar a autofagia.',
    processos:['Digestão de material endocitado após fusão com endossomos.','Autofagia, com degradação de organelas danificadas.','Fagocitose de microrganismos e sua destruição.','Reciclagem de aminoácidos, açúcares e lipídios para reutilização.'],
    relacoes:'Recebe enzimas do complexo de Golgi, funde-se com endossomos e autofagossomos e coopera com o retículo endoplasmático no metabolismo de lipídios.',
    curiosidades:['O lisossomo foi descoberto por Christian de Duve em 1955, trabalho que lhe rendeu o Nobel.','As enzimas lisossômicas são marcadas com manose-6-fosfato para serem corretamente endereçadas.','A autofagia é essencial para a sobrevivência celular em períodos de privação de nutrientes.'],
    consequencias:'Doenças de armazenamento lisossômico, como Tay-Sachs, Gaucher e Niemann-Pick, resultam da deficiência de enzimas específicas.'
  },
  peroxissomos:{
    nome:'Peroxissomos', tipo:'Organela oxidativa', cor:0x8ce99a,
    escala:'Diâmetro entre 0,1 e 1,0 μm; podem conter um núcleo cristalino interno.',
    anatomia:'Vesículas delimitadas por membrana única, com interior granular. Frequentemente apresentam um núcleo cristalino formado por enzimas concentradas. São dinâmicos e podem se formar a partir de peroxissomos preexistentes ou brotar do retículo endoplasmático.',
    estruturais:['Membrana única com permeabilidade seletiva a ácidos graxos e metabólitos.','Interior com enzimas oxidativas, incluindo catalase e oxidases.','Presença frequente de um núcleo cristalino enzimático.','Proteínas de membrana PEX que medeiam a importação de proteínas.'],
    composicao:'Membrana fosfolipídica, catalase, urato oxidase, D-aminoácido oxidase e enzimas da beta-oxidação de ácidos graxos de cadeia muito longa.',
    funcao:'Realizar reações oxidativas que geram peróxido de hidrogênio e depois destruí-lo com catalase; participar da beta-oxidação de ácidos graxos de cadeia muito longa; sintetizar plasmalogênios.',
    processos:['Beta-oxidação de ácidos graxos de cadeia muito longa.','Degradação de peróxido de hidrogênio pela catalase.','Síntese de plasmalogênios, lipídios essenciais da bainha de mielina.','Metabolismo de ácido úrico e de D-aminoácidos.'],
    relacoes:'Coopera com a mitocôndria no metabolismo de ácidos graxos e mantém contato com o retículo endoplasmático, de onde alguns peroxissomos se originam.',
    curiosidades:['A catalase é uma das enzimas mais rápidas conhecidas.','Os peroxissomos foram reconhecidos como organela independente na década de 1960.','Em plantas, participam da fotorrespiração.'],
    consequencias:'Defeitos na importação de proteínas peroxissomais causam doenças graves, como a adrenoleucodistrofia ligada ao X e a síndrome de Zellweger.'
  },
  vesiculas:{
    nome:'Vesículas Intracelulares', tipo:'Transportadores membranosos', cor:0xffe066,
    escala:'Diâmetro entre 50 e 200 nm, dependendo do tipo e da carga.',
    anatomia:'Pequenas esferas delimitadas por membrana que transportam proteínas, lipídios e outros materiais entre compartimentos celulares. Podem ser revestidas por COPI, COPII ou clatrina, e sua identidade é definida por proteínas Rab e SNARE.',
    estruturais:['Bicamada lipídica fechada, com conteúdo interno definido.','Revestimento proteico transitório que auxilia na formação e no brotamento.','Proteínas SNARE que determinam o compartimento de destino.','Proteínas Rab que funcionam como marcadores de identidade.'],
    composicao:'Membrana fosfolipídica, proteínas de revestimento, GTPases Rab, proteínas SNARE e o conteúdo transportado.',
    funcao:'Transportar materiais entre o retículo endoplasmático, o complexo de Golgi, a membrana plasmática, os endossomos e os lisossomos; realizar exocitose e endocitose.',
    processos:['Formação de vesículas por brotamento, com seleção de carga.','Transporte ao longo do citoesqueleto por dineína e cinesina.','Ancoragem e fusão com a membrana-alvo mediadas por Rab e SNARE.','Exocitose constitutiva e regulada.'],
    relacoes:'Conectam o retículo endoplasmático, o complexo de Golgi, o lisossomo, os endossomos e a membrana plasmática, formando o sistema de endomembranas.',
    curiosidades:['As toxinas botulínica e tetânica atuam clivando proteínas SNARE, bloqueando a exocitose de neurotransmissores.','A especificidade do tráfego depende de combinações precisas de Rab e SNARE.','Milhares de vesículas podem ser necessárias para transportar o conteúdo de uma única célula secretora.'],
    consequencias:'Falhas no tráfego vesicular causam doenças como a esferocitose hereditária e certas imunodeficiências.'
  },
  centrossomo:{
    nome:'Centrossomo e Centríolos', tipo:'Centro organizador de microtúbulos', cor:0xd0bfff,
    escala:'Centríolo com ~200 nm de diâmetro e 400–500 nm de comprimento; cada centríolo tem 9 trincas de microtúbulos.',
    anatomia:'O centrossomo é a principal região organizadora de microtúbulos da célula animal. Contém dois centríolos dispostos perpendicularmente entre si, envolvidos por material pericentriolar amorfo, rico em tubulina gama e outras proteínas.',
    estruturais:['Dois centríolos perpendiculares, cada um com nove trincas de microtúbulos.','Material pericentriolar amorfo, sem membrana, que nucleia microtúbulos.','Tubulina gama no anel que inicia a polimerização dos microtúbulos.','Duplicação do centrossomo durante a fase S do ciclo celular.'],
    composicao:'Tubulina alfa, beta e gama, proteínas do material pericentriolar (pericentrina, nineína) e proteínas reguladoras do ciclo celular.',
    funcao:'Organizar e nucleiar microtúbulos; manter a forma e a polaridade celular; posicionar organelas; formar o fuso mitótico durante a divisão celular.',
    processos:['Nucleação de microtúbulos e definição de sua polaridade.','Montagem e orientação do fuso mitótico.','Posicionamento do núcleo e das organelas.','Formação de cílios e flagelos a partir de centríolos modificados.'],
    relacoes:'Coordena-se com o citoesqueleto de microtúbulos, interage com o envelope nuclear e com o córtex celular e é essencial para a segregação cromossômica.',
    curiosidades:['Células vegetais e certos fungos organizam seus microtúbulos sem centríolos.','Alterações no número de centrossomos são frequentes em células tumorais.'],
    consequencias:'A amplificação de centrossomos leva à instabilidade genômica e é comum em cânceres. Defeitos na formação de cílios causam ciliopatias.'
  },
  citoesqueleto:{
    nome:'Citoesqueleto', tipo:'Rede de filamentos proteicos', cor:0x7ea8ff,
    escala:'Microtúbulos com 25 nm; filamentos de actina com 7 nm; filamentos intermediários com 10 nm de diâmetro.',
    anatomia:'Rede tridimensional de filamentos proteicos que atravessa todo o citoplasma, conectando a membrana plasmática ao núcleo e às organelas. É composto por três sistemas: microtúbulos, filamentos de actina e filamentos intermediários.',
    estruturais:['Microtúbulos: tubos ocos e rígidos, formados por dímeros de tubulina, com polaridade definida.','Filamentos de actina: cadeias helicoidais finas e flexíveis, com polaridade e alta dinâmica.','Filamentos intermediários: estruturas resistentes à tração, sem polaridade.','Proteínas motoras: miosina sobre actina; cinesina e dineína sobre microtúbulos.'],
    composicao:'Tubulina alfa e beta, actina, queratinas, vimentina, laminas, desmina, proteínas motoras e proteínas associadas.',
    funcao:'Dar suporte mecânico e forma à célula; ancorar organelas; permitir o transporte intracelular direcionado; viabilizar a divisão celular, a migração e a mudança de forma; participar da contração muscular.',
    processos:['Transporte intracelular de vesículas e organelas por proteínas motoras.','Formação do fuso mitótico e segregação cromossômica.','Movimento celular por polimerização de actina na frente de migração.','Contração muscular pela interação actina-miosina.'],
    relacoes:'Conecta-se à membrana plasmática por complexos de adesão, ao núcleo pela lâmina nuclear e às organelas por proteínas adaptadoras.',
    curiosidades:['Um microtúbulo pode crescer e encurtar em segundos, comportamento chamado de instabilidade dinâmica.','A actina é a proteína mais abundante em muitas células eucarióticas.','O citoesqueleto mantém a tensão interna que dá forma à célula (tensegridade).'],
    consequencias:'Mutações em queratinas causam epidermólise bolhosa. Fármacos como o taxol e a vincristina atuam sobre microtúbulos no tratamento do câncer.'
  },
  parede:{
    nome:'Parede Celular Vegetal', tipo:'Envoltório extracelular (vegetais)', cor:0xb8e0a0,
    escala:'Espessura de 0,1 a vários μm, conforme o tipo celular e a idade.',
    anatomia:'Envoltório rígido e poroso situado externamente à membrana plasmática das células vegetais, formado principalmente por celulose. É constituída por uma parede primária fina e flexível — presente em células em crescimento — e, em muitos tecidos, por uma parede secundária espessa e rígida depositada internamente após o crescimento cessar.',
    estruturais:['Microfibrilas de celulose organizadas em camadas cruzadas, resistentes à tração.','Matriz de hemicelulose e pectina que confere plasticidade e adesão.','Parede secundária com lignina, responsável pela rigidez da madeira.','Plasmodesmos, canais que atravessam a parede e conectam células vizinhas.','Porosidade que permite a livre passagem de água e solutos pequenos (apoplasto).'],
    composicao:'Celulose, hemicelulose, pectinas, proteínas estruturais e, na parede secundária, lignina e suberina.',
    funcao:'Conferir resistência mecânica e forma definida às células vegetais; impedir a lise em meio hipotônico, permitindo a turgescência; sustentar o corpo da planta; conduzir água e solutos pelo apoplasto; proteger contra patógenos.',
    processos:['Turgescência e sustentação do corpo vegetal.','Crescimento por extensão celular, com afrouxamento controlado da parede.','Condução de água pelo apoplasto.','Resposta a patógenos com reforço local da parede.'],
    relacoes:'Situa-se externamente à membrana plasmática, à qual está ligada por proteínas de adesão; conecta células vizinhas pelos plasmodesmos e limita a expansão do vacúolo central.',
    curiosidades:['A celulose é o polímero orgânico mais abundante da biosfera.','A celulose vegetal não é digerida por enzimas humanas; a fibra alimentar depende disso.','A lignina da parede secundária é o que torna a madeira rígida.'],
    consequencias:'Defeitos na síntese de celulose causam colapso celular e plantas anãs. A parede é alvo de fungos e de enzimas como a celulase usada na produção de etanol de segunda geração.'
  },
  cloroplasto:{
    nome:'Cloroplastos', tipo:'Organela fotossintetizante', cor:0x4caf50,
    escala:'Diâmetro de 3–10 μm e espessura de 1–3 μm; tilacoides com ~10 nm de espessura.',
    anatomia:'Organela delimitada por envelope duplo, com um terceiro sistema de membranas internas: os tilacoides, dispostos em pilhas chamadas grana, imersos no estroma. Possui DNA circular próprio e ribossomos 70S, o que o caracteriza como organela semiautônoma.',
    estruturais:['Envelope duplo com poros e translocadores de proteínas.','Tilacoides empilhados em grana, interligados por lamelas do estroma.','Estroma com enzimas do Ciclo de Calvin, DNA circular e ribossomos 70S.','Grânulos de amido e plastoglóbulos lipídicos como reservas.','Pigmentos: clorofilas a e b e carotenoides organizados em fotossistemas.'],
    composicao:'Envelope fosfolipídico, membranas dos tilacoides ricas em galactolipídios, clorofilas a e b, carotenoides, plastoquinona, ferredoxina, ATP sintase, RuBisCO, DNA circular e ribossomos 70S.',
    funcao:'Realizar a fotossíntese: converter energia luminosa em energia química, produzir O₂ pela fotólise da água e fixar CO₂ em carboidratos; sintetizar aminoácidos, ácidos graxos e pigmentos.',
    processos:['Fase clara nos tilacoides: fotólise da água, transporte de elétrons e produção de ATP e NADPH.','Fase escura no estroma: fixação de CO₂ pelo Ciclo de Calvin, catalisada pela RuBisCO.','Fotorrespiração em condições de alta concentração de O₂.','Síntese de amido e de pigmentos.'],
    relacoes:'Origem endossimbiótica a partir de cianobactérias. Troca metabólitos e lipídios com o retículo endoplasmático e com as mitocôndrias, e sua atividade fotossintética fornece O₂ e carboidratos a toda a célula.',
    curiosidades:['O oxigênio liberado na fotossíntese provém da água, não do CO₂.','Um mesofilo foliar pode conter de 30 a 50 cloroplastos por célula.','A "fase escura" não ocorre à noite: ela depende dos produtos da fase clara, não diretamente da luz.'],
    consequencias:'Defeitos na RuBisCO reduzem dramaticamente a produtividade agrícola. Herbicidas como a atrazina bloqueiam o transporte de elétrons no fotossistema II.'
  },
  vacuolo:{
    nome:'Vacúolo Central', tipo:'Compartimento de armazenamento (vegetais)', cor:0xbbe8d0,
    escala:'Pode ocupar de 50 a 90 % do volume da célula vegetal madura.',
    anatomia:'Grande vesícula delimitada pelo tonoplasto, que ocupa a porção central da célula vegetal madura e empurra o citoplasma e o núcleo para a periferia. Seu conteúdo, o suco vacuolar, é ácido e rico em solutos dissolvidos.',
    estruturais:['Tonoplasto, membrana única com bombas de prótons e transportadores.','Suco vacuolar ácido com açúcares, ácidos orgânicos, íons e pigmentos.','Sistema de compartimentos que pode incluir vacúolos menores no início da vida celular.','Corpos proteicos e cristais de oxalato de cálcio em algumas espécies.'],
    composicao:'Água, íons inorgânicos, açúcares, ácidos orgânicos, antocianinas, alcaloides, enzimas hidrolíticas e proteínas de reserva.',
    funcao:'Armazenar água, íons, açúcares, pigmentos e metabólitos secundários; regular a pressão de turgor e o tamanho celular; contribuir para o crescimento da planta por expansão celular; funcionar como compartimento lítico e de defesa.',
    processos:['Regulação do turgor e da expansão celular.','Armazenamento de antocianinas, responsáveis por cores de flores e frutos.','Degradação de macromoléculas por hidrolases ácidas.','Defesa contra herbívoros pelo acúmulo de alcaloides e taninos.'],
    relacoes:'Trabalha em conjunto com a parede celular na manutenção da turgescência; recebe material do retículo endoplasmático e do complexo de Golgi e comunica-se com o citosol pelo tonoplasto.',
    curiosidades:['A cor vermelha de muitas flores e frutos vem de antocianinas armazenadas no vacúolo.','Células vegetais jovens possuem muitos vacúolos pequenos que se fundem ao longo do amadurecimento.','O suco vacuolar pode ser tão ácido quanto pH 5, semelhante ao lisossomo animal.'],
    consequencias:'A perda de água do vacúolo causa perda de turgor e murcha da planta. A plasmólise, em meio hipertônico, descola a membrana plasmática da parede celular.'
  },
  nucleoide:{
    nome:'Nucleoide e Cromossomo Bacteriano', tipo:'Material genético procariótico', cor:0xffb56b,
    escala:'DNA circular com cerca de 4,6 milhões de pares de bases em E. coli; a região do nucleoide mede ~1 μm.',
    anatomia:'Região da célula procariótica onde se concentra o DNA circular, sem envelope nuclear e sem histonas típicas. O DNA apresenta-se superenrolado e organizado por proteínas semelhantes a histonas, formando alças compactadas. Além do cromossomo principal, muitas bactérias possuem pequenos plasmídeos circulares independentes.',
    estruturais:['DNA circular único e superenrolado, sem envoltório membranoso.','Proteínas de organização semelhantes a histonas que compactam o DNA.','Plasmídeos extracromossômicos, frequentemente portadores de genes de resistência.','Ausência de nucléolo e de fuso mitótico; divisão por fissão binária.'],
    composicao:'DNA circular de fita dupla, proteínas de empacotamento, RNA polimerase, enzimas de replicação e plasmídeos.',
    funcao:'Armazenar a informação genética procariótica; servir de molde para transcrição e replicação; permitir a transferência horizontal de genes por conjugação, transformação e transdução.',
    processos:['Replicação do cromossomo circular a partir de uma única origem.','Transcrição e tradução simultâneas, sem separação por membrana nuclear.','Segregação do DNA por proteínas do sistema Par durante a fissão binária.','Transferência de plasmídeos por conjugação bacteriana.'],
    relacoes:'Está em contato direto com o citoplasma, de modo que a transcrição e a tradução ocorrem no mesmo compartimento. Interage com a membrana celular durante a replicação e a segregação.',
    curiosidades:['O termo "nucleoide" evita confundir essa região com um verdadeiro núcleo.','Bactérias podem replicar seu DNA em cerca de 40 minutos em condições ótimas.','A resistência a antibióticos costuma ser transmitida por plasmídeos.'],
    consequencias:'Mutações no cromossomo bacteriano ou a aquisição de plasmídeos de resistência são a base da resistência antimicrobiana. A ausência de núcleo explica por que antibióticos que bloqueiam transcrição e tradução agem rapidamente.'
  }
};

export const ORG_ORDER = ['membrana','citoplasma','juncoes','nucleo','mitocondria','re_rugoso','re_liso','golgi','ribossomos','lisossomos','peroxissomos','vesiculas','centrossomo','citoesqueleto','parede','cloroplasto','vacuolo','nucleoide'];

/* =====================================================================
   LOCALIZAÇÃO CELULAR — campo obrigatório da ficha científica.
   Mantido separado para leitura e revisão mais diretas.
   ===================================================================== */
const LOCALIZACAO = {
  membrana:'Delimita toda a célula, na interface entre o citosol e o meio extracelular. É contínua com o sistema de endomembranas pelo envelope nuclear.',
  citoplasma:'Todo o volume interno da célula entre a membrana plasmática e o envelope nuclear — o citosol e as estruturas nele suspensas.',
  juncoes:'Regiões especializadas da membrana plasmática voltadas para células vizinhas, na periferia da célula; o glicocálice reveste toda a face externa.',
  nucleo:'Central ou ligeiramente deslocado do centro celular; na célula vegetal madura é empurrado para a periferia pelo vacúolo central.',
  mitocondria:'Distribuídas por todo o citosol, com maior concentração onde a demanda de ATP é maior, como próximo ao retículo endoplasmático e às miofibrilas.',
  re_rugoso:'Rede de cisternas no citosol, contínua com o envelope nuclear externo e com o retículo liso; abundante nas células secretoras.',
  re_liso:'Rede tubular no citosol, contínua com o retículo rugoso e mais desenvolvida em hepatócitos, células endócrinas e fibras musculares.',
  golgi:'Próximo ao núcleo, entre o retículo endoplasmático e a membrana plasmática, com a face cis voltada ao RE e a face trans à membrana.',
  ribossomos:'Livres no citosol ou aderidos à face citosólica do retículo endoplasmático rugoso; também presentes na matriz mitocondrial e no estroma do cloroplasto.',
  lisossomos:'Dispersos pelo citosol, mais abundantes em células com alta atividade de digestão intracelular, como macrófagos e hepatócitos.',
  peroxissomos:'Dispersos pelo citosol, frequentemente próximos ao retículo endoplasmático e às mitocôndrias, com as quais cooperam metabolicamente.',
  vesiculas:'Em trânsito entre o retículo endoplasmático, o complexo de Golgi, os endossomos, os lisossomos e a membrana plasmática.',
  centrossomo:'Próximo ao núcleo, na região central da célula animal; durante a divisão migra para os polos e organiza o fuso mitótico.',
  citoesqueleto:'Rede tridimensional que atravessa todo o citoplasma, do córtex subjacente à membrana plasmática até o envelope nuclear.',
  parede:'Externamente à membrana plasmática das células vegetais, formando a camada mais externa e sendo atravessada pelos plasmodesmos.',
  cloroplasto:'No citosol das células vegetais, sobretudo no mesofilo foliar, onde se posicionam junto à parede celular para otimizar a captação de luz.',
  vacuolo:'Na porção central da célula vegetal madura, ocupando a maior parte do volume e deslocando o citoplasma para a periferia.',
  nucleoide:'Região central da célula procariótica, em contato direto com o citoplasma, sem envoltório membranoso.'
};
ORG_ORDER.forEach(id => { if (SCIENCE[id]) SCIENCE[id].localizacao = LOCALIZACAO[id] || ''; });

export const AVAILABILITY = {
  animal:{ hide:['parede','cloroplasto','vacuolo','nucleoide'] },
  vegetal:{ hide:['centrossomo','nucleoide'] },
  procarionte:{ only:['membrana','citoplasma','ribossomos','nucleoide'] }
};

export function isAvailable(id, cellType){
  const a = AVAILABILITY[cellType] || AVAILABILITY.animal;
  if (a.only) return a.only.includes(id);
  return !a.hide.includes(id);
}