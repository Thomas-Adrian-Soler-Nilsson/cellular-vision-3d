/* =====================================================================
   biologia.js — trilha de Biologia para ENEM e UNICAMP

   Sete temas ordenados pela incidência levantada nas duas provas.
   Cada tema traz: incidência comparada, resumo, blocos de teoria,
   configuração da cena/simulador 3D e uma questão comentada.

   Estrutura de um tema:
     {
       id, titulo, icone, incidencia:{enem, unicamp, peso, nota},
       resumo,
       teoria:[ {h, p} | {h, u:[...]} ],
       cena,                      // cena 3D acionada por este tema
       sim:{ type, focus, ... },  // parâmetros iniciais do simulador
       questao:{ fonte, texto, alts:[{t, c, fb}] }
     }
   ===================================================================== */

export const TRILHA_BIOLOGIA = {
  id: 'biologia',
  nome: 'Biologia',
  cor: '#63e6a0',
  descricao: 'Sete temas ordenados pela incidência em ENEM e UNICAMP. ' +
             'A prova do ENEM concentra-se em Ecologia e contextualização ambiental; ' +
             'a UNICAMP distribui melhor os conteúdos e cobra mais Evolução e Biologia Celular.',
  temas: [

    /* ---------------------------------------------------------------- */
    {
      id: 'ecologia',
      titulo: 'Ecologia',
      icone: '🌿',
      incidencia: { enem: '25% a 29%', unicamp: '21%', peso: 'Tema mais cobrado nas duas provas' },
      resumo: 'O tema de maior incidência em ambos os vestibulares. O ENEM enfatiza ' +
              'desequilíbrios ambientais, poluição e mudanças climáticas; a UNICAMP ' +
              'acrescenta relações ecológicas e ciclos biogeoquímicos com mais cálculo.',
      teoria: [
        { h: 'Cadeias, teias e níveis tróficos',
          p: 'A energia entra no ecossistema pela fotossíntese e é transferida ao longo dos ' +
             'níveis tróficos. Em cada transferência perde-se a maior parte como calor, e por ' +
             'isso a energia disponível segue uma progressão decrescente: produtores, ' +
             'consumidores primários, secundários e terciários.' },
        { h: 'Fluxo de energia e produtividade',
          u: [ 'Apenas cerca de 10% da energia de um nível é incorporada pelo nível seguinte — é a regra dos 10%, uma aproximação didática.',
               'Produtividade primária bruta é tudo o que o produtor fixa; líquida é o que sobra depois do próprio gasto respiratório.',
               'A energia flui em sentido único e se dissipa; a matéria, ao contrário, cicla.',
               'Pirâmides de energia nunca são invertidas; pirâmides de número e de biomassa podem ser.' ] },
        { h: 'Ciclos biogeoquímicos',
          p: 'O carbono circula entre atmosfera, biosfera, litosfera e hidrosfera pela ' +
             'fotossíntese, respiração, decomposição e queima de combustíveis fósseis. O ' +
             'nitrogênio depende de fixação por bactérias, e o fósforo não possui fase gasosa ' +
             'relevante, o que o torna o nutriente limitante mais comum em águas doces.' },
        { h: 'Desequilíbrios ambientais mais cobrados',
          u: [ 'Eutrofização: excesso de nutrientes provoca proliferação de algas, consumo do oxigênio dissolvido e morte da fauna.',
               'Magnificação trófica: poluentes lipossolúveis como o DDT concentram-se ao longo da cadeia alimentar.',
               'Efeito estufa intensificado: a queima de combustíveis fósseis aumenta CO₂ e CH₄, retendo mais calor.',
               'Chuva ácida: SO₂ e NOₓ reagem com vapor de água e formam ácidos sulfúrico e nítrico.',
               'Destruição da camada de ozônio: os CFCs liberam cloro que catalisa a decomposição do O₃ na estratosfera.',
               'Bioacumulação de metais pesados como mercúrio e chumbo em tecidos vivos.' ] },
        { h: 'Relações ecológicas',
          p: 'As relações interespecíficas podem ser harmônicas, como mutualismo, protocooperação ' +
             'e comensalismo, ou desarmônicas, como predatismo, parasitismo e amensalismo. ' +
             'As intraespecíficas incluem colônias, sociedades e competição. A UNICAMP cobra com ' +
             'frequência a distinção entre mutualismo obrigatório e protocooperação facultativa.' },
        { h: 'Sucessão ecológica e biomas',
          p: 'A sucessão começa com espécies pioneiras, passa por comunidades intermediárias e ' +
             'tende a um clímax de maior diversidade e biomassa. No Brasil, os biomas mais ' +
             'cobrados são Amazônia, Cerrado, Caatinga, Mata Atlântica, Pampa e Pantanal, ' +
             'cada um com características adaptativas próprias.' }
      ],
      cena: 'ecossistema',
      sim: { type: 'ecossistema', focus: 'ecossistema',
             parametros: [ { id: 'co2', rotulo: 'CO₂ atmosférico', min: 0, max: 1, valor: 0.4 },
                           { id: 'vegetacao', rotulo: 'Cobertura vegetal', min: 0, max: 1, valor: 0.7 } ] },
      questao: {
        fonte: 'ENEM',
        texto: 'Um lago usado para abastecimento recebeu, durante anos, esgoto doméstico não ' +
               'tratado, rico em nitrogênio e fósforo. Observou-se proliferação intensa de algas ' +
               'na superfície, seguida de mortandade de peixes e odor fétido. A explicação ' +
               'correta para a mortandade dos peixes é que',
        alts: [
          { t: 'as algas liberaram toxinas que mataram diretamente todos os peixes do lago.',
            c: false, fb: 'Algumas cianobactérias produzem toxinas, mas esse não é o mecanismo principal ' +
                          'e não explica a mortandade generalizada descrita.' },
          { t: 'a decomposição das algas mortas consumiu o oxigênio dissolvido na água.',
            c: true,  fb: 'Correto. O excesso de nutrientes causa eutrofização: as algas proliferam, ' +
                          'morrem, e as bactérias decompositoras consomem o oxigênio dissolvido. ' +
                          'Com a queda do O₂, os peixes morrem por asfixia — é a chamada demanda ' +
                          'bioquímica de oxigênio.' },
          { t: 'o aumento da temperatura da água provocou a evaporação do oxigênio atmosférico.',
            c: false, fb: 'A temperatura influi na solubilidade dos gases, mas não é a causa descrita ' +
                          'pelo problema, que relaciona diretamente nutrientes e mortandade.' },
          { t: 'os peixes não conseguiram se alimentar porque as algas bloquearam a luz solar.',
            c: false, fb: 'A turbidez prejudica os produtores submersos, mas a mortandade imediata ' +
                          'descrita decorre da anoxia, não da falta de alimento.' },
          { t: 'o nitrogênio e o fósforo são tóxicos e envenenaram a água diretamente.',
            c: false, fb: 'São nutrientes essenciais e não tóxicos nessas concentrações; o dano ' +
                          'é indireto, por meio do desequilíbrio do ecossistema.' }
        ]
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'fisiologia-humana',
      titulo: 'Fisiologia Humana',
      icone: '🫀',
      incidencia: { enem: '12% a 15%', unicamp: 'recorrente', peso: 'No ENEM aparece ligada à saúde pública' },
      resumo: 'O ENEM cobra sistemas específicos e doenças infecciosas; a UNICAMP integra a ' +
              'fisiologia à bioquímica e à genética, exigindo mecanismos e não apenas nomes.',
      teoria: [
        { h: 'Circulação e coração',
          p: 'O coração humano possui quatro câmaras e dois circuitos em série: a pequena ' +
             'circulação, do ventrículo direito aos pulmões e de volta ao átrio esquerdo, e a ' +
             'grande circulação, do ventrículo esquerdo aos tecidos e de volta ao átrio direito. ' +
             'O sangue que percorre as artérias é sempre eferente do coração, independentemente ' +
             'de ser arterial ou venoso.' },
        { h: 'Respiração e trocas gasosas',
          u: [ 'A hematose ocorre nos alvéolos, por difusão simples, do meio mais concentrado para o menos concentrado.',
               'A hemoglobina transporta cerca de 98% do oxigênio; o restante vai dissolvido no plasma.',
               'O transporte de CO₂ ocorre principalmente como íon bicarbonato, pela ação da anidrase carbônica.',
               'A curva de saturação da hemoglobina desloca-se para a direita com aumento de CO₂, queda de pH e elevação de temperatura — efeito Bohr.' ] },
        { h: 'Excreção e equilíbrio hidrossalino',
          p: 'O néfron filtra o plasma no glomérulo, reabsorve água e solutos nos túbulos e ' +
             'secreta substâncias indesejadas. O hormônio antidiurético aumenta a reabsorção de ' +
             'água, concentrando a urina; a aldosterona aumenta a reabsorção de sódio. A ' +
             'osmolaridade plasmática é o principal sinal regulado pelo organismo.' },
        { h: 'Sistema endócrino',
          u: [ 'Insulina e glucagon são antagonistas no controle da glicemia, ambos produzidos no pâncreas.',
               'O diabetes melito tipo 1 decorre de destruição autoimune das células beta; o tipo 2, de resistência periférica à insulina.',
               'Os hormônios tireoidianos T3 e T4 dependem de iodo e regulam o metabolismo basal.',
               'O sistema nervoso atua por sinapses rápidas e o endócrino por via sanguínea, mais lenta e duradoura.' ] },
        { h: 'Imunidade e saúde pública',
          p: 'A imunidade inata é inespecífica e imediata; a adaptativa é específica e gera ' +
             'memória. Vacinas geram memória imunológica sem causar a doença; soros fornecem ' +
             'anticorpos prontos e conferem proteção imediata e passageira. Doenças como dengue, ' +
             'tuberculose, malária e COVID-19 aparecem com frequência.' },
        { h: 'Sistemas nervoso e sensorial',
          p: 'O potencial de ação depende da abertura de canais de sódio e potássio dependentes ' +
             'de voltagem. A bainha de mielina aumenta a velocidade da condução por saltos ' +
             'entre os nódulos de Ranvier. Na visão, bastonetes e cones respondem à luz; o ' +
             'nervo óptico conduz o estímulo ao córtex occipital.' }
      ],
      cena: 'sistema-humano',
      sim: { type: 'sistema-humano', focus: 'sistema-humano',
             parametros: [ { id: 'oxigenio', rotulo: 'O₂ disponível', min: 0, max: 1, valor: 0.8 },
                           { id: 'hidratacao', rotulo: 'Hidratação', min: 0, max: 1, valor: 0.6 } ] },
      questao: {
        fonte: 'UNICAMP',
        texto: 'Em um indivíduo saudável, durante exercício físico intenso, observa-se aumento ' +
               'da frequência cardíaca e da ventilação pulmonar. Sobre esse ajuste, é correto ' +
               'afirmar que',
        alts: [
          { t: 'a maior ventilação reduz a concentração de CO₂ no sangue e eleva o pH, o que ' +
                'aumenta a afinidade da hemoglobina pelo oxigênio nos tecidos.',
            c: false, fb: 'A redução de CO₂ eleva o pH e aumenta a afinidade, mas isso ocorre nos ' +
                          'pulmões, não nos tecidos. Nos tecidos metabolicamente ativos o efeito ' +
                          'Bohr atua em sentido oposto.' },
          { t: 'nos tecidos em atividade, o aumento de CO₂ e a queda do pH deslocam a curva de ' +
                'saturação para a direita e favorecem a liberação de oxigênio.',
            c: true,  fb: 'Correto. É o efeito Bohr: mais CO₂, pH menor e temperatura mais alta ' +
                          'reduzem a afinidade da hemoglobina, liberando O₂ exatamente onde o ' +
                          'metabolismo é mais intenso.' },
          { t: 'o oxigênio é transportado principalmente dissolvido no plasma, e o aumento da ' +
                'ventilação eleva diretamente sua solubilidade.',
            c: false, fb: 'Cerca de 98% do oxigênio é transportado ligado à hemoglobina. A ' +
                          'solubilidade do gás no plasma é pequena e não é o mecanismo principal.' },
          { t: 'o coração aumenta sua frequência porque o sangue venoso passa a chegar aos ' +
                'pulmões com maior teor de oxigênio que o arterial.',
            c: false, fb: 'O sangue venoso é sempre menos oxigenado que o arterial. O aumento da ' +
                          'frequência cardíaca responde à maior demanda de O₂ e à remoção de CO₂.' },
          { t: 'a frequência cardíaca aumenta por ação exclusiva do sistema nervoso parassimpático.',
            c: false, fb: 'O parassimpático reduz a frequência cardíaca. O aumento é promovido pelo ' +
                          'simpático e pela adrenalina circulante.' }
        ]
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'genetica',
      titulo: 'Genética e Biotecnologia',
      icone: '🧬',
      incidencia: { enem: '10% a 12%', unicamp: '10%', peso: 'Leis de Mendel e heredogramas são o núcleo' },
      resumo: 'Inclui as leis de Mendel, heredogramas, estrutura do DNA, mutações, ' +
              'biotecnologia e transgênicos. A UNICAMP costuma cobrar conceitos gerais e a ' +
              'primeira lei com cálculos de probabilidade.',
      teoria: [
        { h: 'Primeira lei de Mendel',
          p: 'Cada caráter é determinado por um par de fatores que se separam na formação dos ' +
             'gametas, de modo que cada gameta recebe apenas um fator do par. Do cruzamento ' +
             'entre heterozigotos Aa × Aa resulta a proporção fenotípica 3:1 e a genotípica 1:2:1.' },
        { h: 'Segunda lei e linkage',
          u: [ 'A segregação de um par de fatores é independente da de outro par, quando os genes estão em cromossomos diferentes.',
               'Genes próximos no mesmo cromossomo não se separam independentemente — é a ligação gênica ou linkage.',
               'A frequência de recombinação mede a distância entre genes e é a base dos mapas genéticos.',
               'O crossing-over ocorre na prófase I da meiose, entre cromátides homólogas.' ] },
        { h: 'Heredogramas e padrões de herança',
          p: 'Na herança autossômica recessiva, indivíduos afetados costumam ter pais ' +
             'fenotipicamente normais e há salto de geração. Na herança autossômica dominante, ' +
             'todo afetado tem ao menos um genitor afetado. Na herança ligada ao X recessiva, ' +
             'a maioria dos afetados é do sexo masculino, pois os homens têm apenas um ' +
             'cromossomo X e não possuem o alelo compensatório.' },
        { h: 'DNA, RNA e expressão gênica',
          u: [ 'A transcrição ocorre no núcleo, a partir da fita molde do DNA, pela ação da RNA polimerase.',
               'A tradução ocorre no ribossomo, com o mRNA lido em tríplets chamados códons.',
               'Cada aminoácido é trazido pelo tRNA, que possui o anticódon correspondente.',
               'O código genético é degenerado — vários códons codificam o mesmo aminoácido — e universal.' ] },
        { h: 'Mutações e variabilidade',
          p: 'Mutações gênicas alteram a sequência de bases e podem ser silenciosas, de sentido ' +
             'trocado ou de mudança de fase de leitura. Mutações cromossômicas alteram a ' +
             'estrutura ou o número de cromossomos, como na síndrome de Down, que resulta de ' +
             'trissomia do cromossomo 21.' },
        { h: 'Biotecnologia',
          u: [ 'A tecnologia do DNA recombinante permite inserir genes de interesse em outros organismos, produzindo transgênicos.',
               'A insulina humana produzida por bactérias é o exemplo clássico de aplicação dessa técnica.',
               'A PCR amplifica fragmentos de DNA e é usada em testes de paternidade e diagnósticos.',
               'O CRISPR-Cas9 permite edição precisa do genoma, com implicações éticas importantes.',
               'Os OGMs são avaliados quanto a risco ambiental, fluxo gênico e segurança alimentar.' ] }
      ],
      cena: 'moleculas',
      sim: { type: 'genetica', focus: 'dna',
             parametros: [ { id: 'geracoes', rotulo: 'Gerações simuladas', min: 1, max: 12, valor: 4 },
                           { id: 'selecao', rotulo: 'Pressão seletiva', min: 0, max: 1, valor: 0.3 } ] },
      questao: {
        fonte: 'UNICAMP',
        texto: 'Um casal sem histórico familiar de uma doença observa que a filha apresenta ' +
               'uma condição rara. O heredograma mostra outros dois primos afetados, filhos de ' +
               'irmãos do pai. Nenhum dos genitores é afetado. O padrão de herança mais provável é',
        alts: [
          { t: 'autossômica dominante, porque a doença aparece em várias gerações da mesma família.',
            c: false, fb: 'Na herança dominante, todo indivíduo afetado precisa ter ao menos um ' +
                          'genitor afetado. Como os pais não são afetados, a hipótese é descartada.' },
          { t: 'autossômica recessiva, porque os pais são portadores assintomáticos e há ' +
                'recorrência entre primos.',
            c: true,  fb: 'Correto. Pais normais com filhos afetados, recorrência na família e ' +
                          'ausência de preferência por sexo indicam herança autossômica recessiva, ' +
                          'com os genitores sendo heterozigotos.' },
          { t: 'ligada ao X dominante, porque apenas homens transmitem o alelo.',
            c: false, fb: 'Homens transmitem o cromossomo Y aos filhos homens e o X às filhas. ' +
                          'Além disso, uma herança dominante ligada ao X deixaria a mãe afetada.' },
          { t: 'ligada ao Y, porque os afetados são descendentes de irmãos do pai.',
            c: false, fb: 'A herança ligada ao Y atingiria todos os homens da linhagem paterna e ' +
                          'nenhuma mulher. Como há uma menina afetada, a hipótese é impossível.' },
          { t: 'mitocondrial, porque a transmissão ocorre apenas pela linhagem materna.',
            c: false, fb: 'A herança mitocondrial vem da mãe, e não haveria recorrência pela ' +
                          'linhagem paterna como descrito no heredograma.' }
        ]
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'biologia-celular',
      titulo: 'Biologia Celular e Citologia',
      icone: '🔬',
      incidencia: { enem: '10% a 12%', unicamp: '5%', peso: 'No ENEM inclui metabolismo energético' },
      resumo: 'Estrutura celular, bioquímica e metabolismo. A UNICAMP costuma cobrar ' +
              'alterações celulares e microscopia, enquanto o ENEM integra o tema a respiração, ' +
              'fotossíntese e saúde.',
      teoria: [
        { h: 'Organização celular',
          p: 'Células procariontes não possuem envoltório nuclear nem organelas membranosas; ' +
             'eucariontes possuem núcleo delimitado e compartimentos especializados. A ' +
             'compartimentalização permite condições químicas distintas para reações ' +
             'incompatíveis no mesmo citoplasma.' },
        { h: 'Membranas e transporte',
          u: [ 'O modelo do mosaico fluido descreve a membrana como bicamada lipídica com proteínas móveis.',
               'Transporte passivo não gasta ATP: difusão simples, difusão facilitada e osmose.',
               'Transporte ativo gasta ATP e ocorre contra o gradiente, como na bomba de sódio e potássio.',
               'Endocitose e exocitose movem partículas grandes por vesículas.' ] },
        { h: 'Metabolismo energético',
          p: 'A respiração celular aeróbia começa na glicólise, no citosol, segue no ciclo de ' +
             'Krebs e termina na cadeia respiratória, na membrana interna da mitocôndria, onde ' +
             'a maior parte do ATP é produzida. O rendimento teórico máximo é de 38 ATP por ' +
             'glicose; a fermentação produz apenas 2 ATP.' },
        { h: 'Fotossíntese',
          u: [ 'Na fase clara, a energia luminosa quebra a molécula de água — fotólise — liberando O₂.',
               'A fase clara produz ATP e NADPH, que são consumidos na fase de fixação do carbono.',
               'No Ciclo de Calvin, a enzima RuBisCO fixa o CO₂ em moléculas orgânicas.',
               'A chamada fase escura não ocorre obrigatoriamente no escuro: depende dos produtos da fase clara.' ] },
        { h: 'Núcleo e divisão celular',
          p: 'A mitose gera duas células geneticamente idênticas e é responsável pelo ' +
             'crescimento e reparo. A meiose reduz o número de cromossomos à metade e gera ' +
             'variabilidade por meio do crossing-over na prófase I e da segregação ' +
             'independente na anáfase I.' },
        { h: 'Morte celular programada',
          p: 'A apoptose é um processo ordenado, dependente de energia, que fragmenta a célula ' +
             'em corpos apoptóticos fagocitados sem desencadear inflamação. A necrose, ao ' +
             'contrário, decorre de lesão e provoca resposta inflamatória. A apoptose é ' +
             'essencial na formação dos dedos e na eliminação de células com DNA danificado.' }
      ],
      cena: 'celula',
      sim: { type: 'respiration', focus: 'mitocondria' },
      questao: {
        fonte: 'ENEM',
        texto: 'Em uma aula prática, estudantes observaram ao microscópio óptico células com ' +
               'parede celular evidente, cloroplastos e um grande vacúolo deslocando o núcleo ' +
               'para a periferia. A conclusão correta é que se trata de células',
        alts: [
          { t: 'procariontes, pois possuem parede celular.',
            c: false, fb: 'A presença de cloroplastos e de um vacúolo delimitado por membrana e de ' +
                          'núcleo organizado exclui a condição procarionte.' },
          { t: 'animais, pois possuem vacúolo.',
            c: false, fb: 'Células animais não possuem parede celular nem cloroplastos, e seus ' +
                          'vacúolos são pequenos e numerosos.' },
          { t: 'vegetais, pois a parede celular, os cloroplastos e o vacúolo central são ' +
                'característicos desse tipo celular.',
            c: true,  fb: 'Correto. Parede celulósica, cloroplastos e vacúolo central volumoso são ' +
                          'as três marcas típicas da célula vegetal, que ainda não possui centríolos.' },
          { t: 'fungos, pois possuem parede celular e núcleo.',
            c: false, fb: 'Fungos têm parede de quitina, mas não possuem cloroplastos nem ' +
                          'fotossíntese, e seus vacúolos não têm esse papel.' },
          { t: 'indeterminadas, pois essas estruturas ocorrem em todos os seres vivos.',
            c: false, fb: 'Cloroplastos e parede celulósica não ocorrem em células animais nem em ' +
                          'procariontes, o que permite a identificação.' }
        ]
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'zoologia',
      titulo: 'Zoologia',
      icone: '🦋',
      incidencia: { enem: '13% a 15%', unicamp: '10%', peso: 'Somado à fisiologia animal no ENEM' },
      resumo: 'O ENEM cobra filogenia e diversidade animal; a UNICAMP concentra-se em ' +
              'mamíferos e no filo Arthropoda, com ênfase em adaptações e ciclos de vida.',
      teoria: [
        { h: 'Critérios de classificação',
          p: 'Os animais são classificados pelo número de folhetos embrionários, pelo tipo de ' +
             'cavidade corporal, pelo destino do blastóporo e pela presença de metameria. ' +
             'Diblásticos possuem ectoderme e endoderme; triblásticos acrescentam a mesoderme.' },
        { h: 'Principais filos',
          u: [ 'Porifera: sem tecidos verdadeiros, com coanócitos e espongina; a água entra pelos poros e sai pelo ósculo.',
               'Cnidaria: diblásticos, com cnidócitos e alternância entre pólipo e medusa.',
               'Platyhelminthes: achatados, acelomados, com protonefrídios; incluem a Taenia e o Schistosoma.',
               'Nematoda: cilíndricos, pseudocelomados, com cutícula; incluem Ascaris e ancilóstomos.',
               'Annelida: metamerizados e celomados, com sistema circulatório fechado.',
               'Mollusca: corpo mole com manto, concha em muitos grupos; lulas e polvos têm sistema nervoso desenvolvido.',
               'Arthropoda: exoesqueleto de quitina, corpo segmentado e apêndices articulados; o maior filo em número de espécies.',
               'Echinodermata: deuterostômios, com esqueleto calcário e simetria pentarradial nos adultos.',
               'Chordata: notocorda, tubo neural dorsal e fendas faríngeas em algum estágio do desenvolvimento.' ] },
        { h: 'Arthropoda em detalhe',
          p: 'O exoesqueleto de quitina protege contra a dessecação e permitiu a conquista do ' +
             'ambiente terrestre, mas obriga à muda periódica. Os insetos possuem três pares de ' +
             'patas, corpo dividido em cabeça, tórax e abdome e, na maioria, asas. Os ' +
             'crustáceos têm exoesqueleto calcificado; os aracnídeos, quatro pares de patas e ' +
             'quelíceras. O sistema respiratório é traqueal nos insetos e por filotraqueias nos ' +
             'aracnídeos.' },
        { h: 'Adaptações dos mamíferos',
          u: [ 'Glândulas mamárias e pelos são característicos; a homeotermia permite ocupar ambientes variados.',
               'A dentição diferenciada reflete a dieta: incisivos cortantes, caninos perfurantes e molares trituradores.',
               'A placenta nos eutérios permite trocas entre mãe e feto durante todo o desenvolvimento.',
               'O diafragma muscular é exclusivo dos mamíferos e aperfeiçoa a ventilação pulmonar.',
               'Morcegos desenvolveram ecolocalização; cetáceos, adaptações completas ao meio aquático.' ] },
        { h: 'Ciclos de vida e parasitoses',
          p: 'Muitas questões cobram hospedeiros intermediários e definitivos. Na esquistossomose, ' +
             'o hospedeiro intermediário é o caramujo do gênero Biomphalaria e o definitivo é o ' +
             'ser humano. Na teníase, o intermediário é o suíno ou o bovino. Na malária, o ' +
             'vetor é o mosquito Anopheles e o agente é o protozoário Plasmodium.' },
        { h: 'Filogenia e evidências',
          p: 'A filogenia organiza os grupos por ancestralidade comum, com base em caracteres ' +
             'homólogos. Estruturas análogas indicam convergência adaptativa e não parentesco ' +
             'próximo. Os cladogramas representam apenas relações de parentesco, e não grau de ' +
             'complexidade ou de evolução.' }
      ],
      cena: 'ecossistema',
      sim: { type: 'zoologia', focus: 'artropode',
             parametros: [ { id: 'umidade', rotulo: 'Umidade do ambiente', min: 0, max: 1, valor: 0.5 },
                           { id: 'temp', rotulo: 'Temperatura', min: 0, max: 1, valor: 0.5 } ] },
      questao: {
        fonte: 'UNICAMP',
        texto: 'O sucesso evolutivo dos insetos é frequentemente atribuído a um conjunto de ' +
               'características. Entre elas, a que melhor explica a ocupação dos mais diversos ' +
               'ambientes terrestres é',
        alts: [
          { t: 'a presença de sistema circulatório aberto, que reduz o gasto energético.',
            c: false, fb: 'O sistema aberto é comum a artrópodes e moluscos, mas não é o fator ' +
                          'determinante da ocupação dos ambientes terrestres.' },
          { t: 'o exoesqueleto de quitina, que reduz a perda de água, aliado à capacidade de voo.',
            c: true,  fb: 'Correto. O exoesqueleto impermeável limita a dessecação e o voo amplia ' +
                          'a dispersão e a exploração de recursos, o que explica a enorme ' +
                          'diversidade e distribuição do grupo.' },
          { t: 'a respiração por filotraqueias, exclusiva dos insetos.',
            c: false, fb: 'As filotraqueias são características de aracnídeos. Insetos respiram ' +
                          'por traqueias, e essa troca é o que impõe limites ao tamanho corporal.' },
          { t: 'a metameria homônoma, que permite regeneração de segmentos.',
            c: false, fb: 'A metameria é compartilhada por anelídeos e artrópodes e não explica ' +
                          'por si a conquista do ambiente terrestre.' },
          { t: 'a reprodução assexuada por partenogênese, presente em todas as espécies.',
            c: false, fb: 'A partenogênese ocorre em alguns grupos, como certos himenópteros, mas ' +
                          'não em todos os insetos, e não é a explicação principal.' }
        ]
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'evolucao',
      titulo: 'Evolução',
      icone: '🐒',
      incidencia: { enem: 'menor', unicamp: '11,5%', peso: 'Tema de alta relevância na UNICAMP' },
      resumo: 'Na UNICAMP, Evolução tem peso bem maior que no ENEM e aparece cobrando ' +
              'evidências, teorias e mecanismos, frequentemente integrada à genética de populações.',
      teoria: [
        { h: 'Evidências da evolução',
          u: [ 'Fósseis mostram formas extintas e sequências de transição ao longo do tempo geológico.',
               'Anatomia comparada revela órgãos homólogos, de mesma origem embrionária e funções diferentes.',
               'Estruturas vestigiais, como o cóccix humano, indicam ancestralidade comum.',
               'A embriologia comparada mostra fases iniciais semelhantes entre vertebrados.',
               'Semelhanças moleculares no DNA e nas proteínas quantificam o parentesco entre espécies.',
               'A biogeografia explica a distribuição das espécies e o endemismo insular.' ] },
        { h: 'Lamarck e Darwin',
          p: 'Lamarck propôs a lei do uso e desuso com transmissão dos caracteres adquiridos, ' +
             'explicação hoje rejeitada. Darwin propôs a seleção natural: existe variabilidade ' +
             'prévia nas populações, o ambiente seleciona os mais aptos e os caracteres ' +
             'favoráveis tornam-se mais frequentes nas gerações seguintes. A aptidão é medida ' +
             'pelo sucesso reprodutivo, e não pela força ou pela complexidade.' },
        { h: 'Neodarwinismo e genética de populações',
          u: [ 'A mutação é a fonte primária de variabilidade; a recombinação a redistribui.',
               'A seleção natural, a deriva genética, o fluxo gênico e a mutação são os fatores que alteram as frequências alélicas.',
               'O equilíbrio de Hardy-Weinberg descreve uma população ideal sem evolução, com p² + 2pq + q² = 1.',
               'A deriva genética é mais intensa em populações pequenas e pode fixar alelos por acaso.',
               'O gargalo de garrafa e o efeito do fundador reduzem a variabilidade genética.' ] },
        { h: 'Especiação',
          p: 'O isolamento reprodutivo é o critério decisivo para considerar duas populações como ' +
             'espécies distintas. A especiação alopátrica ocorre com barreira geográfica; a ' +
             'simpátrica, sem ela, geralmente por poliploidia ou por seleção sexual. Mecanismos ' +
             'pré-zigóticos impedem a fecundação; pós-zigóticos reduzem a viabilidade ou a ' +
             'fertilidade do híbrido.' },
        { h: 'Coerção e convergência',
          p: 'A coevolução ocorre quando duas espécies exercem pressão seletiva recíproca, como ' +
             'em flores e polinizadores. A convergência adaptativa produz estruturas análogas ' +
             'em linhagens distintas, como as asas de aves e de insetos, que não indicam ' +
             'parentesco próximo.' },
        { h: 'Origem da vida e evolução humana',
          p: 'A hipótese heterotrófica admite que os primeiros seres vivos eram simples, ' +
             'fermentadores e surgidos em ambiente sem oxigênio livre. O experimento de Miller ' +
             'demonstrou a formação de aminoácidos a partir de gases simples. Na linhagem ' +
             'humana, os fósseis africanos são os mais antigos, e a comparação do DNA ' +
             'mitocondrial apoia a origem africana recente.' }
      ],
      cena: 'ecossistema',
      sim: { type: 'evolucao', focus: 'selecao',
             parametros: [ { id: 'selecao', rotulo: 'Pressão seletiva', min: 0, max: 1, valor: 0.5 },
                           { id: 'mutacao', rotulo: 'Taxa de mutação', min: 0, max: 1, valor: 0.3 } ] },
      questao: {
        fonte: 'UNICAMP',
        texto: 'Em uma população de mariposas, antes da industrialização predominavam ' +
               'indivíduos claros, camuflados nos troncos cobertos de liquens. Após décadas de ' +
               'poluição, os troncos escureceram e a frequência de mariposas escuras aumentou. ' +
               'A explicação evolutiva correta é que',
        alts: [
          { t: 'a poluição induziu mutações que tornaram as mariposas escuras, e essas ' +
                'mutações foram transmitidas.',
            c: false, fb: 'O ambiente não induz mutações dirigidas. A mutação é aleatória e ' +
                          'precede a seleção — essa era a proposta de Lamarck, hoje rejeitada.' },
          { t: 'as mariposas escuras já existiam na população e foram favorecidas pela seleção ' +
                'natural, por ficarem menos visíveis aos predadores.',
            c: true,  fb: 'Correto. A variabilidade para a coloração já existia; a mudança do ' +
                          'ambiente alterou a pressão seletiva, e o fenótipo escuro passou a ter ' +
                          'maior sobrevivência e sucesso reprodutivo. É o caso clássico de ' +
                          'melanismo industrial.' },
          { t: 'as mariposas claras migraram para outras regiões por não suportarem a poluição.',
            c: false, fb: 'A migração pode ocorrer, mas a explicação do aumento da frequência do ' +
                          'fenótipo escuro está na seleção diferencial dentro da população.' },
          { t: 'as mariposas escuras surgiram por necessidade de adaptação ao novo ambiente.',
            c: false, fb: 'A necessidade não cria caracteres. Essa formulação é lamarckista e não ' +
                          'se sustenta diante das evidências genéticas.' },
          { t: 'todas as mariposas se tornaram escuras porque o fenótipo é determinado apenas ' +
                'pela temperatura.',
            c: false, fb: 'A coloração tem base genética com variação na população, e não é ' +
                          'determinada diretamente pela temperatura.' }
        ]
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'botanica',
      titulo: 'Botânica',
      icone: '🌱',
      incidencia: { enem: '7,7%', unicamp: 'recorrente', peso: 'Fisiologia vegetal é o foco' },
      resumo: 'O ENEM concentra-se em fisiologia vegetal e fotossíntese; a UNICAMP cobra ' +
              'fitocromo, estômatos, condução de seiva e hormônios vegetais.',
      teoria: [
        { h: 'Grupos vegetais',
          p: 'Briófitas não possuem vasos condutores e dependem da água para a reprodução, ' +
             'sendo pequenas e restritas a ambientes úmidos. Pteridófitas possuem vasos e ' +
             'atingem maior porte. Gimnospermas produzem sementes nuas e pólen, ' +
             'independentizando-se da água. Angiospermas possuem flores e frutos, o grupo mais ' +
             'diversificado.' },
        { h: 'Condução de seiva',
          u: [ 'O xilema conduz água e sais minerais da raiz às folhas, em vasos mortos, por transpiração e capilaridade.',
               'O floema conduz a seiva orgânica das folhas aos demais órgãos, em vasos vivos, com consumo de energia.',
               'A teoria da tensão-coesão explica a subida da água em colunas contínuas.',
               'A transpiração é a força motriz principal do transporte no xilema.' ] },
        { h: 'Estômatos e trocas gasosas',
          p: 'Os estômatos são formados por duas células-guarda que controlam a abertura do ' +
             'ostíolo. A entrada de água por osmose deixa as células-guarda túrgidas e abre o ' +
             'poro; a perda de água as deixa flácidas e o fecha. A abertura ocorre em geral ' +
             'durante o dia, e o fechamento nas horas mais quentes reduz a perda de água.' },
        { h: 'Fotossíntese e fitocromo',
          u: [ 'O fitocromo é um pigmento que detecta a qualidade da luz e regula germinação, floração e fotoperiodismo.',
               'A forma ativa, Fv, absorve luz vermelha distante e converte-se na forma inativa Fv, que absorve vermelho.',
               'Plantas de dia curto florescem quando a noite é longa; as de dia longo, quando a noite é curta.',
               'A fotossíntese ocorre nos cloroplastos, com a fase clara nos tilacoides e a fixação de carbono no estroma.' ] },
        { h: 'Hormônios vegetais',
          p: 'As auxinas promovem o crescimento por alongamento celular e participam do ' +
             'fototropismo e do geotropismo. As citocininas estimulam a divisão celular. As ' +
             'giberelinas promovem germinação e alongamento do caule. O etileno induz o ' +
             'amadurecimento de frutos e a abscisão foliar. O ácido abscísico promove a ' +
             'dormência e o fechamento dos estômatos em situação de seca.' },
        { h: 'Adaptações e reprodução',
          p: 'Angiospermas apresentam dupla fecundação: um gameta forma o embrião e outro forma ' +
             'o endosperma triploide. A polinização pode ser biótica ou abiótica, e a dispersão ' +
             'de sementes depende de vento, água ou animais. Plantas de ambientes secos ' +
             'desenvolvem cutícula espessa, estômatos em criptas e folhas reduzidas a espinhos.' }
      ],
      cena: 'ecossistema',
      sim: { type: 'botanica', focus: 'planta',
             parametros: [ { id: 'luz', rotulo: 'Intensidade luminosa', min: 0, max: 1, valor: 0.6 },
                           { id: 'agua', rotulo: 'Disponibilidade de água', min: 0, max: 1, valor: 0.6 },
                           { id: 'co2', rotulo: 'CO₂ atmosférico', min: 0, max: 1, valor: 0.5 } ] },
      questao: {
        fonte: 'UNICAMP',
        texto: 'Em um experimento, plantas de dia curto foram mantidas em fotoperíodos ' +
               'controlados. Um grupo recebeu noites longas e ininterruptas; outro teve as ' +
               'noites longas interrompidas por um breve pulso de luz. O resultado esperado é que',
        alts: [
          { t: 'os dois grupos floresçam igualmente, pois o total de luz recebida foi o mesmo.',
            c: false, fb: 'O que importa é a duração do período escuro contínuo, e não o total de ' +
                          'luz acumulada. É por isso que o fotoperiodismo é medido pela noite.' },
          { t: 'apenas o grupo com noites ininterruptas floresça, pois o pulso de luz rompe o ' +
                'período escuro exigido.',
            c: true,  fb: 'Correto. Plantas de dia curto precisam de um período escuro contínuo ' +
                          'suficiente. A interrupção luminosa converte o fitocromo para a forma ' +
                          'ativa e impede a floração no segundo grupo.' },
          { t: 'apenas o grupo com noites interrompidas floresça, pois recebeu mais energia.',
            c: false, fb: 'A luz intercalada na noite inibe a floração das plantas de dia curto, em ' +
                          'vez de promovê-la.' },
          { t: 'nenhum grupo floresça, porque a floração não depende da luz.',
            c: false, fb: 'O fotoperiodismo é um dos controles mais bem estabelecidos da floração em ' +
                          'angiospermas.' },
          { t: 'o grupo interrompido floresça mais cedo, pois o pulso de luz acelera o ' +
                'metabolismo.',
            c: false, fb: 'A aceleração metabólica não é o mecanismo; o efeito é sobre a sinalização ' +
                          'do fitocromo e a indução floral.' }
        ]
      }
    }
  ]
};