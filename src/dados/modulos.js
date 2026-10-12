/* =====================================================================
   PARTE 2 — MÓDULOS DE ESTUDO (teoria + simulação + questão)
   ===================================================================== */
export const MODULES = {
  '0':{
    titulo:'Fundamentos: Célula e Teoria Celular',
    subtitulo:'Procariontes vs. eucariontes · Animal vs. vegetal · Núcleo interfásico',
    teoria:[
      { h:'Teoria celular', p:'Proposta por <b>Schleiden</b> (1838, plantas) e <b>Schwann</b> (1839, animais) e completada por <b>Virchow</b> (1855): <span class="hl">toda célula origina-se de outra célula preexistente</span> — "Omnis cellula e cellula".' },
      { h:'Procarionte vs. eucarionte', u:[
        '<b>Procarionte:</b> sem núcleo delimitado, DNA circular no nucleoide, ribossomos 70S, sem organelas membranosas. Ex.: bactérias e arqueias.',
        '<b>Eucarionte:</b> núcleo com envelope duplo, DNA linear associado a histonas, organelas membranosas, ribossomos 80S.',
        'Tamanhos típicos: procariontes de 1 a 5 μm; eucariontes de 10 a 100 μm.'
      ]},
      { h:'Célula animal vs. vegetal', u:[
        '<span class="hl">Vegetal possui:</span> parede celular de celulose, cloroplastos, vacúolo central grande e plasmodesmos. Reserva: <b>amido</b>.',
        '<span class="hl">Animal possui:</span> centríolos, lisossomos e vacúolos pequenos. Reserva: <b>glicogênio</b>.',
        'Ambas compartilham membrana plasmática, núcleo, mitocôndrias, retículo endoplasmático, complexo de Golgi e ribossomos.'
      ]},
      { h:'Núcleo interfásico', u:[
        '<b>Envoltório nuclear:</b> dupla membrana com poros que controlam o transporte núcleo-citoplasma.',
        '<b>Nucléolo:</b> local de síntese de rRNA e de montagem das subunidades ribossômicas.',
        '<b>Cromatina:</b> DNA associado a histonas — <b>eucromatina</b> ativa e frouxa; <b>heterocromatina</b> inativa e condensada.'
      ]}
    ],
    sim:{ type:'cell-compare', focus:null, emissive:{} },
    questao:{
      texto:'(Unicamp) A presença de centríolos e lisossomos é característica marcante de células:',
      alts:[
        { t:'procariontes.', c:false },
        { t:'vegetais.', c:false },
        { t:'animais.', c:true, fb:'Correto! Centríolos e lisossomos são típicos de células animais. Células vegetais organizam o fuso sem centríolos e suas funções líticas são exercidas sobretudo pelo vacúolo. Procariontes não possuem organelas membranosas.' },
        { t:'bacterianas.', c:false }
      ]
    }
  },
  '1':{
    titulo:'Membrana Plasmática e Transporte',
    subtitulo:'Mosaico fluido · Osmose · Bomba de Na⁺/K⁺ · Endocitose',
    teoria:[
      { h:'Mosaico fluido', p:'Modelo de <b>Singer e Nicolson (1972)</b>. Bicamada de <b>fosfolipídios anfipáticos</b> — cabeça polar e caudas apolares — com proteínas integrais e periféricas, glicocálice e colesterol, que regula a fluidez.' },
      { h:'Especializações da membrana', u:[
        '<b>Microvilosidades:</b> ampliam a superfície de absorção, como no intestino.',
        '<b>Desmossomos:</b> ancoragem mecânica entre células.',
        '<b>Junções gap:</b> comunicação direta de íons e pequenas moléculas.',
        '<b>Junções de oclusão:</b> vedam o espaço intercelular.'
      ]},
      { h:'Transporte passivo (sem gasto de ATP)', u:[
        '<b>Difusão simples:</b> O₂, CO₂ e moléculas apolares, a favor do gradiente.',
        '<b>Difusão facilitada:</b> glicose por GLUT e íons por canais.',
        '<b>Osmose:</b> passagem de água do meio <span class="hl">hipotônico para o hipertônico</span>.'
      ]},
      { h:'Efeitos da osmose', u:[
        'Célula animal em meio <b>hipotônico</b>: ganha água e pode sofrer <b>lise</b>.',
        'Célula animal em meio <b>hipertônico</b>: perde água e sofre <b>crenação</b>.',
        'Célula vegetal em meio hipotônico: <b>turgescência</b>, limitada pela parede celular.',
        'Célula vegetal em meio hipertônico: <b>plasmólise</b>, com descolamento da membrana.'
      ]},
      { h:'Transporte ativo (gasta ATP)', u:[
        '<b>Bomba de Na⁺/K⁺-ATPase:</b> 3 Na⁺ para fora e 2 K⁺ para dentro por ATP hidrolisado.',
        '<b>Transporte ativo secundário:</b> cotransporte movido pelo gradiente criado pela bomba.',
        '<b>Endocitose e exocitose:</b> fagocitose, pinocitose e secreção.'
      ]}
    ],
    sim:{ type:'osmosis', focus:['membrana','citoplasma'], emissive:{ membrana:1.3 } },
    questao:{
      texto:'(ENEM) Uma célula animal foi colocada em uma solução hipertônica. Espera-se que ela:',
      alts:[
        { t:'absorva água e sofra lise.', c:false },
        { t:'perca água por osmose e sofra crenação.', c:true, fb:'Correto! Em meio hipertônico, a concentração de solutos externa é maior que a citoplasmática, de modo que a água sai da célula por osmose e ela murcha — a crenação.' },
        { t:'mantenha o volume inalterado.', c:false },
        { t:'sofra turgescência, como uma célula vegetal.', c:false }
      ]
    }
  },
  '2':{
    titulo:'Citoplasma e Organelas',
    subtitulo:'Ribossomos · Retículo endoplasmático · Golgi · Lisossomos · Mitocôndrias · Citoesqueleto',
    teoria:[
      { h:'Ribossomos', p:'Responsáveis pela síntese proteica. Os <b>livres</b> no citosol produzem proteínas de uso interno; os <b>aderidos ao RE rugoso</b> produzem proteínas de exportação, de membrana e lisossômicas.' },
      { h:'Retículo endoplasmático', u:[
        '<b>Rugoso:</b> síntese de proteínas destinadas à secreção e N-glicosilação inicial.',
        '<b>Liso:</b> síntese de lipídios e esteroides, desintoxicação por citocromo P450 e estoque de Ca²⁺.'
      ]},
      { h:'Complexo de Golgi', p:'Modifica, empacota e endereça proteínas e lipídios — o "correio celular". Face cis na entrada e face trans na saída; é também a origem dos lisossomos.' },
      { h:'Lisossomos e peroxissomos', u:[
        '<b>Lisossomos:</b> digestão intracelular por hidrolases ácidas em pH ~5, mantido pela V-ATPase. Atuam na autofagia e na heterofagia.',
        '<b>Peroxissomos:</b> degradam H₂O₂ pela catalase e realizam a β-oxidação de ácidos graxos de cadeia muito longa.'
      ]},
      { h:'Mitocôndrias e cloroplastos', p:'Organelas semiautônomas, com <b>DNA circular próprio</b> e ribossomos 70S — evidência da hipótese endossimbiótica. A mitocôndria realiza a respiração celular; o cloroplasto, a fotossíntese.' },
      { h:'Citoesqueleto', u:[
        '<b>Microfilamentos de actina:</b> movimento, contração e ciclose.',
        '<b>Microtúbulos de tubulina:</b> transporte intracelular e fuso mitótico.',
        '<b>Filamentos intermediários:</b> resistência mecânica à tração.',
        '<b>Centríolos:</b> 9 trincas de microtúbulos; organizam o fuso na célula animal.'
      ]}
    ],
    sim:{ type:'organelle-click', focus:null, emissive:{} },
    questao:{
      texto:'(Unicamp) A organela responsável pela digestão intracelular de macromoléculas é o:',
      alts:[
        { t:'ribossomo.', c:false },
        { t:'lisossomo.', c:true, fb:'Correto! O lisossomo contém hidrolases ácidas que digerem macromoléculas, participando tanto da heterofagia (material externo) quanto da autofagia (material próprio).' },
        { t:'peroxissomo.', c:false },
        { t:'complexo de Golgi.', c:false }
      ]
    }
  },
  '3':{
    titulo:'Respiração Celular Aeróbia e Anaeróbia',
    subtitulo:'Glicólise · Ciclo de Krebs · Cadeia respiratória · Fermentação',
    teoria:[
      { h:'Equação geral da respiração aeróbia', p:'<b>C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + energia</b> (rendimento teórico de até 38 ATP por glicose).' },
      { h:'Glicólise — no citosol', p:'Glicose (6 C) é convertida em 2 piruvato (3 C), com saldo de <b>2 ATP</b> e 2 NADH. Não depende de oxigênio.' },
      { h:'Descarboxilação oxidativa — na matriz', p:'Piruvato → acetil-CoA + CO₂ + NADH. É a ponte entre a glicólise e o ciclo de Krebs.' },
      { h:'Ciclo de Krebs — na matriz', p:'Cada acetil-CoA gera 3 NADH, 1 FADH₂ e 1 GTP. Por glicose: 6 NADH, 2 FADH₂ e 2 ATP.' },
      { h:'Cadeia respiratória e quimiosmose', p:'NADH e FADH₂ doam elétrons aos complexos da membrana interna; o bombeamento de prótons cria um gradiente eletroquímico no espaço intermembranar. O retorno dos prótons pela <b>ATP sintase</b> produz ATP. O <b>O₂ é o aceptor final de elétrons</b> e forma água.' },
      { h:'Fermentação — no citosol, sem O₂', u:[
        '<b>Lática:</b> piruvato → lactato. Ocorre em músculo em esforço e em bactérias do iogurte.',
        '<b>Alcoólica:</b> piruvato → acetaldeído → etanol + CO₂. Realizada por leveduras na produção de pão e bebidas.',
        'Saldo de apenas <span class="hl">2 ATP por glicose</span> — a fermentação não oxida completamente a glicose.'
      ]},
      { h:'Comparação essencial', u:[
        '<b>Aeróbia:</b> até 38 ATP, com O₂, na mitocôndria, produzindo CO₂ e H₂O.',
        '<b>Anaeróbia:</b> 2 ATP, sem O₂, no citosol, produzindo lactato ou etanol e CO₂.'
      ]}
    ],
    sim:{ type:'respiration', focus:['mitocondria','citoplasma'], emissive:{ mitocondria:1.5 } },
    questao:{
      texto:'(ENEM) Em anaerobiose, a produção de ATP na célula muscular humana ocorre por:',
      alts:[
        { t:'respiração aeróbia, na mitocôndria.', c:false },
        { t:'fermentação lática, no citosol.', c:true, fb:'Correto! Sem oxigênio, o piruvato é reduzido a lactato no citosol, regenerando NAD⁺ para que a glicólise continue — com saldo de apenas 2 ATP por glicose.' },
        { t:'fermentação alcoólica, no citosol.', c:false },
        { t:'fotossíntese, nos cloroplastos.', c:false }
      ]
    }
  },
  '4':{
    titulo:'Núcleo e Ciclo Celular',
    subtitulo:'Interfase · Mitose · Meiose · Apoptose',
    teoria:[
      { h:'Núcleo interfásico', u:[
        '<b>Envoltório nuclear:</b> dupla membrana com poros seletivos.',
        '<b>Nucléolo:</b> síntese de rRNA e montagem dos ribossomos.',
        '<b>Cromatina:</b> DNA associado a histonas, em estado difuso (eucromatina) ou condensado (heterocromatina).'
      ]},
      { h:'Interfase', u:[
        '<b>G1:</b> crescimento celular e síntese de RNA e proteínas.',
        '<b>S:</b> duplicação do DNA — cada cromossomo passa a ter duas cromátides-irmãs.',
        '<b>G2:</b> preparação para a divisão, com verificação da replicação.'
      ]},
      { h:'Mitose', p:'Prófase → metáfase → anáfase → telófase. Produz <b>2 células diploides geneticamente idênticas à célula-mãe</b>. Funções: crescimento, regeneração e reprodução assexuada.' },
      { h:'Meiose', p:'Meiose I (reducional) seguida de meiose II (equacional). Produz <b>4 células haploides geneticamente diferentes</b>. O <span class="hl">crossing-over</span> ocorre na prófase I, com pareamento de homólogos, e é uma das fontes de variabilidade genética.' },
      { h:'Apoptose e necrose', u:[
        '<b>Apoptose:</b> morte celular programada, sem inflamação, essencial no desenvolvimento e na renovação dos tecidos.',
        '<b>Necrose:</b> morte acidental por dano, com rompimento da membrana, extravasamento do conteúdo e inflamação.'
      ]}
    ],
    sim:{ type:'cell-cycle', focus:['nucleo'], emissive:{ nucleo:1.4 } },
    questao:{
      texto:'(Unicamp) O crossing-over, fenômeno que amplia a variabilidade genética, ocorre durante a:',
      alts:[
        { t:'prófase da mitose.', c:false },
        { t:'prófase I da meiose.', c:true, fb:'Correto! Na prófase I os cromossomos homólogos pareiam (sinapse) e trocam segmentos entre cromátides não irmãs — o crossing-over.' },
        { t:'metáfase II da meiose.', c:false },
        { t:'anáfase da mitose.', c:false }
      ]
    }
  },
  '5':{
    titulo:'Fotossíntese',
    subtitulo:'Fase clara · Fotólise da água · Ciclo de Calvin',
    teoria:[
      { h:'Equação geral', p:'<b>6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂</b>. Ocorre nos <b>cloroplastos</b> de células vegetais e de algas.' },
      { h:'Fase clara ou fotoquímica — nos tilacoides', u:[
        '<b>Fotólise da água:</b> 2 H₂O → 4 H⁺ + 4 e⁻ + O₂. <span class="hl">O oxigênio liberado provém da água, não do CO₂.</span>',
        'Fotossistemas II e I organizados nas membranas dos tilacoides.',
        'Produção de <b>ATP</b> e <b>NADPH</b>, que seguem para o estroma.'
      ]},
      { h:'Fase escura ou Ciclo de Calvin — no estroma', u:[
        'Enzima-chave: <b>RuBisCO</b>, responsável pela fixação do CO₂.',
        'Usa o ATP e o NADPH produzidos na fase clara para formar glicose.',
        '<span class="warn">Atenção:</span> a chamada "fase escura" não ocorre apenas à noite — ela depende dos produtos da fase clara, e não diretamente da luz.'
      ]},
      { h:'Relação com a respiração', p:'Fotossíntese e respiração são processos complementares: a fotossíntese armazena energia em carboidratos, e a respiração a libera para produzir ATP.' }
    ],
    sim:{ type:'photosynthesis', focus:['cloroplasto','vacuolo','parede'], emissive:{ cloroplasto:1.6 } },
    questao:{
      texto:'(ENEM) A fotólise da água, etapa em que ocorre liberação de gás oxigênio, acontece na:',
      alts:[
        { t:'fase escura, no estroma.', c:false },
        { t:'fase clara, nos tilacoides.', c:true, fb:'Correto! Nos tilacoides, a energia luminosa é usada para quebrar a molécula de água, liberando O₂ e fornecendo elétrons à cadeia transportadora.' },
        { t:'fase escura, nos tilacoides.', c:false },
        { t:'fase clara, no estroma.', c:false }
      ]
    }
  },
  '6':{
    titulo:'Comunicação e Adesão Celular',
    subtitulo:'Glicocálice · Desmossomos · Junções gap · Junções de oclusão · Plasmodesmos',
    teoria:[
      { h:'Glicocálice', p:'Conjunto de carboidratos ligados a proteínas e lipídios na face externa da membrana. Funções: <b>proteção</b>, <b>reconhecimento celular</b> — determinando os grupos sanguíneos ABO — e <b>adesão</b>.' },
      { h:'Junções celulares animais', u:[
        '<b>Desmossomos:</b> placas de adesão que ancoram filamentos intermediários e resistem ao atrito, como na epiderme.',
        '<b>Junções gap (comunicantes):</b> canais de conexina que permitem a passagem de íons e pequenas moléculas; fazem o músculo cardíaco se comportar como um sincício funcional.',
        '<b>Junções de oclusão:</b> faixas que vedam o espaço intercelular e impedem o vazamento, como no epitélio intestinal e na barreira hematoencefálica.'
      ]},
      { h:'Junções celulares vegetais', p:'<b>Plasmodesmos:</b> canais revestidos por membrana que atravessam a parede celular e conectam o citoplasma de células vegetais vizinhas, permitindo o transporte direto de água, solutos e sinais.' },
      { h:'Adesão e sinalização', p:'A adesão celular não é apenas mecânica: proteínas de adesão transmitem sinais ao citoesqueleto e ao núcleo, influenciando proliferação, diferenciação e sobrevivência celular.' }
    ],
    sim:{ type:'junctions', focus:['membrana','juncoes'], emissive:{ juncoes:1.8 } },
    questao:{
      texto:'(Unicamp) As junções gap são especialmente importantes para:',
      alts:[
        { t:'a ancoragem mecânica das células.', c:false },
        { t:'a comunicação direta entre células adjacentes.', c:true, fb:'Correto! As junções gap formam canais que permitem a passagem de íons e pequenas moléculas, possibilitando comunicação elétrica e química direta entre células vizinhas.' },
        { t:'a vedação do espaço intercelular.', c:false },
        { t:'o reconhecimento celular por carboidratos.', c:false }
      ]
    }
  },
  '7':{
    titulo:'Diferenciação e Morte Celular',
    subtitulo:'Células-tronco · Apoptose vs. necrose',
    teoria:[
      { h:'Células-tronco', u:[
        '<b>Totipotentes:</b> o zigoto e as primeiras clivagens — originam qualquer tecido, inclusive os anexos embrionários.',
        '<b>Pluripotentes:</b> células embrionárias — originam os três folhetos germinativos, mas não os anexos.',
        '<b>Multipotentes:</b> células-tronco adultas, como as da medula óssea — originam linhagens específicas.'
      ]},
      { h:'Diferenciação celular', p:'Todas as células de um organismo possuem o mesmo DNA, mas expressam genes diferentes. A <b>expressão gênica diferencial</b> é o que torna cada célula especializada em forma e função.' },
      { h:'Apoptose', u:[
        'Morte celular <b>programada</b>, com fragmentação controlada do DNA e formação de corpos apoptóticos.',
        '<b>Não causa inflamação</b>, pois a membrana permanece íntegra durante o processo.',
        'Essencial no desenvolvimento — por exemplo, na eliminação das membranas interdigitais — e na renovação dos tecidos.'
      ]},
      { h:'Necrose', u:[
        'Morte celular <b>acidental</b> por isquemia, toxina, trauma ou infecção.',
        'Há rompimento da membrana, extravasamento do conteúdo celular e <b>inflamação</b> do tecido.',
        'É sempre um processo patológico.'
      ]}
    ],
    sim:{ type:'differentiation', focus:null, emissive:{} },
    questao:{
      texto:'(ENEM) A apoptose é fundamental no desenvolvimento embrionário porque:',
      alts:[
        { t:'provoca inflamação que estimula o crescimento.', c:false },
        { t:'elimina células indesejadas sem desencadear inflamação.', c:true, fb:'Correto! A apoptose remove células de forma programada e limpa, mantendo a membrana íntegra, sem extravasar conteúdo e sem provocar inflamação.' },
        { t:'aumenta o número de células do embrião.', c:false },
        { t:'impede a diferenciação celular.', c:false }
      ]
    }
  },
  '8':{
    titulo:'Vírus e Replicação Viral (Acelular)',
    subtitulo:'Ciclo lítico · Ciclo lisogênico',
    teoria:[
      { h:'O que são os vírus', u:[
        '<span class="hl">Acelulares:</span> não possuem membrana plasmática, citoplasma, ribossomos nem metabolismo próprio.',
        'Estrutura: <b>capsídeo proteico</b> envolvendo material genético, que pode ser DNA <i>ou</i> RNA — nunca os dois.',
        'Alguns possuem envelope lipídico derivado da membrana da célula hospedeira.',
        'São <b>parasitas intracelulares obrigatórios</b>: dependem da maquinaria da célula para se replicar.'
      ]},
      { h:'Ciclo lítico', u:[
        'Adsorção à membrana → penetração → desnudamento → replicação do material genético → montagem de novas partículas → <b>lise e liberação</b>.',
        'A célula hospedeira morre ao final do ciclo.'
      ]},
      { h:'Ciclo lisogênico', u:[
        'O DNA viral integra-se ao genoma da célula hospedeira, formando o <b>prófago</b> (ou provírus).',
        'Pode permanecer latente por muitas gerações, sendo replicado junto com o DNA celular.',
        'Sob certas condições, o prófago é excisado e o vírus entra no ciclo lítico.'
      ]},
      { h:'Importância e aplicações', p:'Os vírus são usados em vacinas, na terapia gênica e na biotecnologia. Questões de vestibular costumam contextualizá-los com dengue, HIV, influenza e COVID-19.' }
    ],
    sim:{ type:'virus', focus:['membrana','nucleo'], emissive:{ membrana:1.2 } },
    questao:{
      texto:'(ENEM) Os vírus são considerados acelulares porque:',
      alts:[
        { t:'possuem DNA circular.', c:false },
        { t:'não possuem membrana plasmática, citoplasma nem metabolismo próprio.', c:true, fb:'Correto! A ausência de organização celular — sem membrana plasmática, citoplasma, ribossomos e metabolismo próprio — é exatamente o que define os vírus como acelulares.' },
        { t:'são menores que as bactérias.', c:false },
        { t:'não possuem material genético.', c:false }
      ]
    }
  }
};