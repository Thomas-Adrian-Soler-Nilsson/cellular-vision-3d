/* =====================================================================
   quimica.js — trilha de Química para ENEM e UNICAMP

   Sete temas ordenados pela incidência levantada nas duas provas.
   Mesma estrutura dos temas de Biologia, para que a interface trate
   as duas trilhas de forma idêntica.

   Diferença de estilo entre as provas:
     ENEM    — Físico-Química e Química Orgânica dominam, com forte
               contextualização ambiental e interdisciplinar.
     UNICAMP — distribuição mais uniforme, com destaque para
               Estequiometria, Soluções e Equilíbrio Químico.
   ===================================================================== */

export const TRILHA_QUIMICA = {
  id: 'quimica',
  nome: 'Química',
  cor: '#ffb648',
  descricao: 'Sete temas ordenados pela incidência em ENEM e UNICAMP. O ENEM concentra o ' +
             'peso em Físico-Química e Química Orgânica, com forte viés ambiental; a UNICAMP ' +
             'distribui de forma mais uniforme e cobra mais cálculo.',
  temas: [

    /* ---------------------------------------------------------------- */
    {
      id: 'fisico-quimica',
      titulo: 'Físico-Química',
      icone: '⚗️',
      incidencia: { enem: '28,4%', unicamp: '18,8%', peso: 'Área mais ampla das duas provas' },
      resumo: 'A área de maior peso, reunindo estequiometria, soluções, termoquímica, ' +
              'cinética e radioatividade. No ENEM aparece muito contextualizada; na UNICAMP ' +
              'exige domínio de cálculo e de leis.',
      teoria: [
        { h: 'Matéria, substâncias e misturas',
          p: 'Substância pura tem composição definida e propriedades constantes; misturas ' +
             'reúnem duas ou mais substâncias sem proporção fixa. Misturas eutéticas fundem a ' +
             'temperatura constante, e as azeotrópicas fervem a temperatura constante, o que ' +
             'permite separar componentes por destilação fracionada ou fusão fracionada.' },
        { h: 'Leis ponderais e cálculo estequiométrico',
          u: [ 'Lei de Lavoisier: a massa total se conserva em sistema fechado.',
               'Lei de Proust: a proporção em massa entre os elementos de um composto é constante.',
               'O balanceamento garante a conservação dos átomos de cada elemento.',
               'O reagente limitante determina o máximo de produto formado; o excesso não reage.',
               'O rendimento relaciona o produto obtido com o previsto teoricamente.' ] },
        { h: 'Gases',
          p: 'A equação de Clapeyron relaciona pressão, volume, quantidade de matéria e ' +
             'temperatura. Nas condições normais de temperatura e pressão, um mol de gás ideal ' +
             'ocupa 22,4 L. A lei de Dalton trata de misturas gasosas, e a de Graham compara as ' +
             'velocidades de efusão com as massas molares.' },
        { h: 'Termoquímica',
          u: [ 'Reações exotérmicas liberam energia e têm variação de entalpia negativa.',
               'Reações endotérmicas absorvem energia e têm variação de entalpia positiva.',
               'A lei de Hess permite somar entalpias de etapas para obter a entalpia global.',
               'A entalpia de formação é a variação ao formar um mol do composto a partir dos elementos.',
               'A energia de ligação é a energia necessária para romper um mol de ligações.' ] },
        { h: 'Cinética química',
          p: 'A velocidade da reação depende da concentração dos reagentes, da temperatura, da ' +
             'superfície de contato e da presença de catalisador. A temperatura aumenta a ' +
             'frequência e a energia das colisões efetivas. O catalisador diminui a energia de ' +
             'ativação e não é consumido, aumentando a velocidade sem alterar o equilíbrio.' },
        { h: 'Radioatividade',
          p: 'A emissão alfa reduz o número atômico em duas unidades e a massa em quatro; a ' +
             'emissão beta aumenta o número atômico em uma unidade sem alterar a massa. A ' +
             'meia-vida é o tempo para metade dos núcleos decair e independe da quantidade ' +
             'inicial. As aplicações incluem datação, medicina nuclear e geração de energia.' }
      ],
      cena: 'moleculas',
      sim: { type: 'cinetica', focus: 'reacao',
             parametros: [ { id: 'temperatura', rotulo: 'Temperatura', min: 0, max: 1, valor: 0.5 },
                           { id: 'concentracao', rotulo: 'Concentração', min: 0, max: 1, valor: 0.5 },
                           { id: 'catalisador', rotulo: 'Catalisador', min: 0, max: 1, valor: 0 } ] },
      questao: {
        fonte: 'ENEM',
        texto: 'Um estudante quer conservar alimentos por mais tempo e observa que, na ' +
               'geladeira, a deterioração é mais lenta. A explicação correta é que a baixa ' +
               'temperatura',
        alts: [
          { t: 'aumenta a energia de ativação das reações de decomposição.',
            c: false, fb: 'A energia de ativação é uma característica do caminho reacional e não ' +
                          'aumenta com a queda de temperatura. Quem a altera é o catalisador.' },
          { t: 'reduz a frequência e a energia das colisões efetivas entre as moléculas, ' +
                'diminuindo a velocidade das reações.',
            c: true,  fb: 'Correto. Pela teoria das colisões, temperaturas menores reduzem a ' +
                          'fração de moléculas com energia suficiente para reagir, o que diminui ' +
                          'a velocidade das reações de decomposição dos alimentos.' },
          { t: 'elimina as enzimas dos alimentos, impedindo qualquer reação química.',
            c: false, fb: 'A refrigeração reduz a atividade enzimática, mas não elimina as ' +
                          'enzimas nem interrompe todas as reações.' },
          { t: 'aumenta a concentração de oxigênio dentro do recipiente.',
            c: false, fb: 'A temperatura baixa na verdade aumenta a solubilidade dos gases, mas ' +
                          'esse não é o mecanismo que explica a conservação.' },
          { t: 'desloca o equilíbrio da reação no sentido dos produtos.',
            c: false, fb: 'A deterioração não é tratada como equilíbrio deslocável, e a velocidade ' +
                          'é o fator determinante nesse caso.' }
        ]
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'organica',
      titulo: 'Química Orgânica',
      icone: '⬡',
      incidencia: { enem: '28,4%', unicamp: 'relevante', peso: 'Funções orgânicas e reações são o núcleo' },
      resumo: 'Junto com Físico-Química, forma a área de maior peso no ENEM. Funções ' +
              'orgânicas e reações dominam, com polímeros e biomoléculas ganhando espaço na ' +
              'UNICAMP.',
      teoria: [
        { h: 'Cadeias carbônicas',
          p: 'O carbono é tetravalente e forma cadeias por ligações simples, duplas ou triplas. ' +
             'As cadeias classificam-se em abertas ou fechadas, saturadas ou insaturadas, ' +
             'homogêneas ou heterogêneas, e normais ou ramificadas. O anel aromático tem ' +
             'ressonância e confere estabilidade característica.' },
        { h: 'Funções orgânicas',
          u: [ 'Álcool possui hidroxila ligada a carbono saturado; fenol, a anel aromático.',
               'Aldeído tem carbonila na extremidade da cadeia; cetona, no meio.',
               'Ácido carboxílico tem carboxila; éster resulta da reação com álcool.',
               'Amina deriva da amônia por substituição de hidrogênios por radicais orgânicos.',
               'Amida possui nitrogênio ligado a carbonila e forma ligação peptídica em proteínas.',
               'Éter tem oxigênio entre dois carbonos, e o éster, carbonila ligada a oxigênio.' ] },
        { h: 'Isomeria',
          p: 'Isômeros têm a mesma fórmula molecular e propriedades diferentes. A isomeria ' +
             'plana inclui cadeia, posição e função. A espacial inclui geométrica, com ' +
             'restrição de rotação em ligações duplas, e óptica, com carbono quiral assimétrico ' +
             'que desvia o plano da luz polarizada.' },
        { h: 'Reações orgânicas',
          u: [ 'Substituição: um átomo ou grupo é trocado por outro, típica de alcanos e aromáticos.',
               'Adição: átomos se somam a uma ligação dupla ou tripla, típica de alcenos e alcinos.',
               'Eliminação: saem grupos de carbonos vizinhos e forma-se uma insaturação.',
               'Esterificação: ácido carboxílico com álcool produz éster e água, em equilíbrio.',
               'Saponificação: éster com base forte produz sal de ácido graxo e glicerol.',
               'Oxidação de álcool: primário forma aldeído e depois ácido; secundário forma cetona.' ] },
        { h: 'Polímeros',
          p: 'Polímeros são macromoléculas formadas por repetição de monômeros. Na adição, os ' +
             'monômeros insaturados se ligam sem liberar subproduto, como no polietileno e no ' +
             'PVC. Na condensação, há liberação de água ou de outra molécula pequena, como no ' +
             'náilon e no PET. Os polímeros podem ser reciclados mecanicamente ou por via ' +
             'química, e os biodegradáveis reduzem o impacto ambiental.' },
        { h: 'Biomoléculas',
          p: 'Carboidratos são fontes de energia e estruturas de reserva; lipídios incluem ' +
             'triglicerídeos e esteroides; proteínas são cadeias de aminoácidos unidos por ' +
             'ligações peptídicas; ácidos nucleicos armazenam e transmitem informação genética. ' +
             'A hidrólise de cada classe recupera suas unidades constituintes.' }
      ],
      cena: 'moleculas',
      sim: { type: 'organica', focus: 'funcoes',
             parametros: [ { id: 'carbono', rotulo: 'Nº de carbonos', min: 1, max: 12, valor: 4 },
                           { id: 'insaturacao', rotulo: 'Insaturação', min: 0, max: 1, valor: 0.3 } ] },
      questao: {
        fonte: 'UNICAMP',
        texto: 'Um composto orgânico de fórmula molecular C₄H₈O₂ reage com hidrogenocarbonato ' +
               'de sódio liberando gás carbônico e, ao reagir com etanol em meio ácido, produz ' +
               'um composto de odor agradável. Esse comportamento indica que o composto é',
        alts: [
          { t: 'um éster, pois reage com álcool formando outro éster.',
            c: false, fb: 'Ésteres não liberam CO₂ com hidrogenocarbonato, e a reação com álcool ' +
                          'não produziria outro éster de odor agradável por essa via.' },
          { t: 'um ácido carboxílico, pois libera CO₂ com hidrogenocarbonato e sofre ' +
                'esterificação com etanol.',
            c: true,  fb: 'Correto. A liberação de CO₂ com hidrogenocarbonato é o teste clássico ' +
                          'de ácido carboxílico, e a reação com álcool em meio ácido é a ' +
                          'esterificação, que produz éster de aroma característico.' },
          { t: 'um álcool, pois reage com ácido carboxílico formando éster.',
            c: false, fb: 'Álcoois não liberam CO₂ com hidrogenocarbonato de sódio, o que ' +
                          'contradiz a primeira observação.' },
          { t: 'um aldeído, pois a fórmula C₄H₈O₂ e o odor agradável são típicos dessa função.',
            c: false, fb: 'Aldeídos não liberam CO₂ com hidrogenocarbonato e não sofrem ' +
                          'esterificação direta com álcool.' },
          { t: 'uma cetona, pois possui dois átomos de oxigênio.',
            c: false, fb: 'O número de oxigênios não define a função, e cetonas não apresentam ' +
                          'nenhum dos dois comportamentos descritos.' }
        ]
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'ambiental',
      titulo: 'Química Ambiental',
      icone: '🌍',
      incidencia: { enem: '18,5%', unicamp: '12,9%', peso: 'Tema muito contextualizado nas duas provas' },
      resumo: 'Aborda poluição, química verde e ciclos ambientais. A UNICAMP enfatiza ' +
              'química verde, poluição atmosférica e da água, quase sempre ligada a gráficos ' +
              'e a situações reais.',
      teoria: [
        { h: 'Poluição atmosférica',
          u: [ 'A queima de combustíveis fósseis libera CO₂, CO, NOₓ, SO₂ e material particulado.',
               'O SO₂ e os NOₓ formam chuva ácida ao reagir com vapor de água.',
               'O monóxido de carbono liga-se à hemoglobina e impede o transporte de oxigênio.',
               'Os CFCs liberam cloro na estratosfera e catalisam a destruição do ozônio.',
               'O ozônio troposférico é poluente e irritante, embora seja protetor na estratosfera.' ] },
        { h: 'Efeito estufa e clima',
          p: 'O efeito estufa é um fenômeno natural que mantém a temperatura média do planeta. ' +
             'A intensificação ocorre pelo aumento de gases como CO₂, CH₄, N₂O e vapor de água, ' +
             'que absorvem radiação infravermelha reemitida pela superfície. A queima de ' +
             'combustíveis fósseis e o desmatamento são as principais causas antropogênicas.' },
        { h: 'Poluição da água',
          u: [ 'A eutrofização decorre do excesso de nitrogênio e fósforo e leva à anoxia.',
               'A demanda bioquímica de oxigênio mede o consumo de O₂ pelos decompositores.',
               'Metais pesados como mercúrio e chumbo bioacumulam e sofrem magnificação trófica.',
               'O descarte de óleos e solventes compromete o tratamento e a vida aquática.',
               'O pH e a temperatura alteram a solubilidade e a toxicidade dos poluentes.' ] },
        { h: 'Química verde',
          p: 'Os doze princípios da química verde orientam a prevenção de resíduos, a economia ' +
             'atômica, o uso de matérias-primas renováveis, a eficiência energética e o design ' +
             'de substâncias menos tóxicas. A catálise e os solventes verdes, como a água em ' +
             'condições supercríticas, reduzem impacto. Biorrefinarias e bioplásticos são ' +
             'aplicações contemporâneas.' },
        { h: 'Tratamento de água e resíduos',
          p: 'A água de abastecimento passa por coagulação, floculação, decantação, filtração e ' +
             'desinfecção, normalmente com cloro ou ozônio. O esgoto, por sua vez, passa por ' +
             'tratamento preliminar, primário, secundário e terciário, com remoção de sólidos, ' +
             'matéria orgânica e nutrientes. A reciclagem e a logística reversa reduzem a ' +
             'pressão sobre aterros.' },
        { h: 'Ciclos e indicadores',
          p: 'O ciclo do carbono relaciona fotossíntese, respiração, decomposição e queima de ' +
             'combustíveis. O ciclo do nitrogênio depende de fixação biológica, nitrificação e ' +
             'desnitrificação. Indicadores como pegada de carbono, pegada hídrica e ' +
             'concentração de material particulado quantificam impactos e orientam políticas ' +
             'públicas.' }
      ],
      cena: 'ecossistema',
      sim: { type: 'ambiental', focus: 'poluicao',
             parametros: [ { id: 'emissao', rotulo: 'Emissão de poluentes', min: 0, max: 1, valor: 0.4 },
                           { id: 'tratamento', rotulo: 'Tratamento aplicado', min: 0, max: 1, valor: 0.3 } ] },
      questao: {
        fonte: 'ENEM',
        texto: 'Uma indústria substituiu um processo que usava solvente orgânico clorado por ' +
               'outro que utiliza água em condições supercríticas, com catalisador reciclável, ' +
               'reduzindo também a temperatura de operação. Essa mudança atende a princípios de',
        alts: [
          { t: 'química verde, pois reduz o uso de substâncias tóxicas, economiza energia e ' +
                'favorece a catálise.',
            c: true,  fb: 'Correto. Substituir solvente clorado por água supercrítica reduz a ' +
                          'toxicidade e os resíduos, e a menor temperatura de operação reduz o ' +
                          'consumo energético — três princípios diretos da química verde.' },
          { t: 'termodinâmica, pois a mudança aumenta a entalpia da reação.',
            c: false, fb: 'A química verde trata de prevenção e eficiência, e a mudança não é ' +
                          'descrita em termos de variação de entalpia.' },
          { t: 'eletroquímica, pois o catalisador gera corrente elétrica.',
            c: false, fb: 'Catalisadores não geram corrente elétrica; eles reduzem a energia de ' +
                          'ativação.' },
          { t: 'estequiometria, pois o rendimento depende do reagente limitante.',
            c: false, fb: 'O reagente limitante influencia o rendimento, mas não é o critério ' +
                          'ambiental descrito no enunciado.' },
          { t: 'radioquímica, pois a água supercrítica emite radiação.',
            c: false, fb: 'Água supercrítica não é radioativa; é apenas água acima do ponto ' +
                          'crítico de temperatura e pressão.' }
        ]
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'estequiometria',
      titulo: 'Estequiometria',
      icone: '⚖️',
      incidencia: { enem: '8%', unicamp: '11,9%', peso: 'Peso maior na UNICAMP' },
      resumo: 'Tema clássico de cálculo, com peso maior na UNICAMP, que cobra reagente ' +
              'limitante, excesso, rendimento e pureza em situações experimentais.',
      teoria: [
        { h: 'Mol e massa molar',
          p: 'O mol é a quantidade de matéria que contém 6,02 × 10²³ entidades. A massa molar ' +
             'é numericamente igual à massa atômica ou molecular em gramas por mol. O volume ' +
             'molar de um gás ideal nas condições normais é 22,4 L.' },
        { h: 'Balanceamento',
          u: [ 'O balanceamento iguala o número de átomos de cada elemento nos dois lados.',
               'Comece pelos elementos que aparecem em menos substâncias e deixe H e O por último.',
               'Ajuste coeficientes inteiros e menores possíveis.',
               'Confira a carga elétrica em reações iônicas, além da massa.' ] },
        { h: 'Cálculo estequiométrico',
          p: 'O roteiro é sempre o mesmo: converter a grandeza dada em mols, usar a proporção ' +
             'dos coeficientes, e converter o resultado para a grandeza pedida. Esse caminho ' +
             'resolve massa, volume de gás, quantidade de partículas e concentração de solução ' +
             'sem fórmulas decoradas.' },
        { h: 'Reagente limitante e excesso',
          u: [ 'Compare a quantidade disponível de cada reagente com a proporção estequiométrica.',
               'O reagente limitante é o que se esgota primeiro e determina o produto formado.',
               'O excesso é a quantidade que sobra sem reagir após o término da reação.',
               'Sempre calcule o produto a partir do limitante, nunca do excesso.',
               'Teste rápido: divida os mols de cada reagente pelo seu coeficiente; o menor resultado é o limitante.' ] },
        { h: 'Rendimento e pureza',
          p: 'O rendimento é a razão entre o produto realmente obtido e o previsto teoricamente, ' +
             'expressa em porcentagem. Perdas ocorrem por reações paralelas, transferência ' +
             'incompleta e impurezas. A pureza indica a fração de substância efetivamente ' +
             'presente na amostra e deve ser considerada antes do cálculo.' },
        { h: 'Soluções e gases em estequiometria',
          p: 'Para soluções, a quantidade em mols é o produto da concentração pelo volume. ' +
             'Para gases, a equação de Clapeyron relaciona pressão, volume e temperatura. ' +
             'Reações com gases frequentemente são resolvidas por proporção direta de volumes, ' +
             'quando as condições são as mesmas para todos.' }
      ],
      cena: 'moleculas',
      sim: { type: 'estequiometria', focus: 'reagente',
             parametros: [ { id: 'reagenteA', rotulo: 'Reagente A (mol)', min: 0, max: 10, valor: 4 },
                           { id: 'reagenteB', rotulo: 'Reagente B (mol)', min: 0, max: 10, valor: 6 },
                           { id: 'rendimento', rotulo: 'Rendimento', min: 0.1, max: 1, valor: 0.9 } ] },
      questao: {
        fonte: 'UNICAMP',
        texto: 'Foram misturados 4 mols de N₂ com 9 mols de H₂ para a síntese de amônia, ' +
               'segundo a equação N₂ + 3 H₂ → 2 NH₃. Considerando rendimento de 100%, a ' +
               'quantidade máxima de amônia obtida e o reagente em excesso são, respectivamente,',
        alts: [
          { t: '6 mols de NH₃ e excesso de 1 mol de H₂.',
            c: false, fb: 'Confira a proporção: 4 mols de N₂ exigiriam 12 mols de H₂, e só há 9. ' +
                          'Logo o H₂ é o limitante, e não há excesso dele.' },
          { t: '6 mols de NH₃ e excesso de 1 mol de N₂.',
            c: true,  fb: 'Correto. Dividindo pelos coeficientes: N₂ → 4/1 = 4 e H₂ → 9/3 = 3. O ' +
                          'menor valor é o do H₂, que é o limitante. Assim, reagem 3 mols de N₂ ' +
                          'com 9 mols de H₂, formando 2 × 3 = 6 mols de NH₃, e sobra 1 mol de N₂.' },
          { t: '9 mols de NH₃ e excesso de 2 mols de N₂.',
            c: false, fb: '9 mols de NH₃ corresponderiam a consumir 4,5 mols de N₂, mais do que os ' +
                          '4 disponíveis. O cálculo não respeita a proporção.' },
          { t: '4 mols de NH₃ e excesso de 3 mols de H₂.',
            c: false, fb: 'Esse resultado usaria o N₂ como limitante, mas a divisão pelos ' +
                          'coeficientes mostra que é o H₂ que se esgota primeiro.' },
          { t: '13 mols de NH₃ e nenhum excesso.',
            c: false, fb: 'Somar as quantidades dos reagentes ignora a proporção estequiométrica e ' +
                          'a conservação dos átomos.' }
        ]
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'solucoes',
      titulo: 'Soluções',
      icone: '💧',
      incidencia: { enem: '6,6%', unicamp: '9,3%', peso: 'Concentração e diluição são o foco' },
      resumo: 'A UNICAMP cobra com frequência concentração comum, molaridade e diluição, ' +
              'muitas vezes em contextos laboratoriais e de controle de qualidade.',
      teoria: [
        { h: 'Classificação e coeficiente de solubilidade',
          p: 'Soluções podem ser insaturadas, saturadas ou supersaturadas. O coeficiente de ' +
             'solubilidade indica a massa máxima de soluto dissolvida em 100 g de solvente, a ' +
             'determinada temperatura. Na maioria dos sólidos, a solubilidade aumenta com a ' +
             'temperatura; nos gases, diminui.' },
        { h: 'Concentrações',
          u: [ 'Concentração comum: massa de soluto por volume de solução, em g/L.',
               'Molaridade: mols de soluto por litro de solução, em mol/L.',
               'Título em massa: massa de soluto dividida pela massa da solução.',
               'Concentração em partes por milhão: usada para poluentes e soluções muito diluídas.',
               'Molalidade: mols de soluto por quilograma de solvente, independente da temperatura.' ] },
        { h: 'Diluição e mistura',
          p: 'Na diluição, a quantidade de soluto permanece constante e apenas o volume aumenta, ' +
             'o que se traduz em C₁V₁ = C₂V₂, válida para concentração comum e molaridade. Na ' +
             'mistura de soluções do mesmo soluto, somam-se as quantidades de soluto e os ' +
             'volumes. Se houver reação química, o cálculo passa a ser estequiométrico.' },
        { h: 'Propriedades coligativas',
          u: [ 'Dependem apenas do número de partículas dissolvidas, não da natureza do soluto.',
               'A tonoscopia reduz a pressão de vapor do solvente.',
               'A ebulioscopia eleva a temperatura de ebulição.',
               'A crioscopia abaixa a temperatura de congelamento — é o princípio do sal na estrada e do anticongelante.',
               'A osmoscopia relaciona a pressão osmótica com a concentração de partículas.' ] },
        { h: 'Solubilidade e polaridade',
          p: 'Substâncias polares dissolvem-se em solventes polares e apolares em apolares — é a ' +
             'regra "semelhante dissolve semelhante". A água, polar, dissolve sais e açúcares; ' +
             'a gasolina, apolar, dissolve gorduras e óleos. Detergentes possuem uma parte ' +
             'polar e outra apolar e por isso atuam na interface entre água e gordura.' },
        { h: 'Cálculos aplicados',
          p: 'Em laboratório, a preparação de uma solução parte da massa ou do volume do soluto, ' +
             'completando-se o volume em balão volumétrico. Na titulação, a relação entre as ' +
             'concentrações depende da estequiometria: C₁V₁/n₁ = C₂V₂/n₂. Esse cálculo é a base ' +
             'do controle de qualidade e da análise de acidez de produtos.' }
      ],
      cena: 'moleculas',
      sim: { type: 'solucoes', focus: 'diluicao',
             parametros: [ { id: 'concentracao', rotulo: 'Concentração inicial', min: 0.1, max: 2, valor: 1 },
                           { id: 'volume', rotulo: 'Volume final', min: 0.1, max: 1, valor: 0.5 } ] },
      questao: {
        fonte: 'UNICAMP',
        texto: 'Em um laboratório, 25,0 mL de uma solução de hidróxido de sódio foram ' +
               'titulados com solução de ácido clorídrico 0,100 mol/L, consumindo 20,0 mL do ' +
               'ácido até o ponto de equivalência. A concentração da solução de hidróxido de ' +
               'sódio é',
        alts: [
          { t: '0,050 mol/L.',
            c: false, fb: 'Esse valor resultaria de uma proporção invertida entre os volumes.' },
          { t: '0,080 mol/L.',
            c: true,  fb: 'Correto. A reação NaOH + HCl → NaCl + H₂O é 1:1, então C₁V₁ = C₂V₂. ' +
                          'C₁ × 25,0 = 0,100 × 20,0, o que dá C₁ = 2,00/25,0 = 0,080 mol/L.' },
          { t: '0,100 mol/L.',
            c: false, fb: 'Esse valor apenas repete a concentração do ácido, o que só ocorreria ' +
                          'se os volumes fossem iguais.' },
          { t: '0,125 mol/L.',
            c: false, fb: 'Esse valor corresponderia a usar 25,0 mL de ácido, e não 20,0 mL.' },
          { t: '0,200 mol/L.',
            c: false, fb: 'Esse resultado multiplicaria as concentrações em vez de usar a relação ' +
                          'de volumes.' }
        ]
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'eletroquimica',
      titulo: 'Eletroquímica',
      icone: '🔋',
      incidencia: { enem: '6,6%', unicamp: 'recorrente', peso: 'Pilhas e eletrólise' },
      resumo: 'Cobra pilhas, eletrólise e corrosão, com forte ligação a metais, ' +
              'baterias e processos industriais como a galvanoplastia e a obtenção de alumínio.',
      teoria: [
        { h: 'Número de oxidação e reações redox',
          p: 'Oxidação é perda de elétrons, com aumento do número de oxidação; redução é ganho ' +
             'de elétrons, com diminuição. O agente oxidante sofre redução e o agente redutor ' +
             'sofre oxidação. Em uma reação redox, o total de elétrons perdidos é igual ao de ' +
             'elétrons ganhos.' },
        { h: 'Pilhas',
          u: [ 'O ânodo é o polo negativo, onde ocorre a oxidação; o cátodo é o positivo, onde ocorre a redução.',
               'O fluxo de elétrons no circuito externo vai do ânodo para o cátodo.',
               'A ponte salina mantém a neutralidade elétrica das soluções e fecha o circuito iônico.',
               'A diferença de potencial é calculada por E° = E°cátodo − E°ânodo, com valores de redução.',
               'Quanto maior o potencial de redução, maior a tendência de a espécie se reduzir.' ] },
        { h: 'Eletrólise',
          p: 'A eletrólise é um processo não espontâneo, forçado por corrente externa. Na ' +
             'eletrólise ígnea usa-se o composto fundido; na aquosa, a água compete nas ' +
             'semirreações e a descarga depende dos potenciais e da concentração. As ' +
             'aplicações incluem galvanoplastia, refino eletrolítico de metais e produção de ' +
             'cloro e soda.' },
        { h: 'Leis de Faraday',
          u: [ 'A massa depositada é proporcional à carga elétrica que atravessa a célula.',
               'A carga é o produto da corrente pelo tempo: Q = i × t.',
               'Um mol de elétrons corresponde a 96.500 coulombs — a constante de Faraday.',
               'A massa depositada também é proporcional à massa molar dividida pelo número de elétrons envolvidos.' ] },
        { h: 'Corrosão e proteção',
          p: 'A ferrugem forma-se pela oxidação do ferro na presença de oxigênio e água, em ' +
             'processo eletroquímico com formação de pequenas pilhas na superfície. A pintura ' +
             'isola o metal; a galvanização o recobre com zinco, que oxida preferencialmente e ' +
             'atua como metal de sacrifício. A proteção catódica liga o metal a um ânodo de ' +
             'sacrifício, como magnésio.' },
        { h: 'Aplicações contemporâneas',
          p: 'Baterias de íons de lítio dominam dispositivos portáteis pela alta densidade ' +
             'energética. Células a combustível convertem hidrogênio e oxigênio em água e ' +
             'eletricidade, com emissão de vapor de água. O hidrogênio verde, produzido por ' +
             'eletrólise da água com energia renovável, é apontado como vetor energético de ' +
             'baixo carbono.' }
      ],
      cena: 'moleculas',
      sim: { type: 'eletroquimica', focus: 'pilha',
             parametros: [ { id: 'corrente', rotulo: 'Corrente (A)', min: 0, max: 5, valor: 2 },
                           { id: 'tempo', rotulo: 'Tempo (min)', min: 0, max: 60, valor: 30 } ] },
      questao: {
        fonte: 'ENEM',
        texto: 'Para evitar a corrosão de um casco de navio de aço, são fixados blocos de ' +
               'zinco, que se desgastam lentamente ao longo do tempo enquanto o aço permanece ' +
               'íntegro. Esse procedimento funciona porque o zinco',
        alts: [
          { t: 'possui maior potencial de redução que o ferro e por isso se reduz no lugar dele.',
            c: false, fb: 'O zinco possui menor potencial de redução que o ferro. Além disso, ele ' +
                          'oxida, e não se reduz.' },
          { t: 'sofre oxidação preferencial, atuando como ânodo de sacrifício e protegendo o ferro.',
            c: true,  fb: 'Correto. O zinco tem menor potencial de redução e, portanto, maior ' +
                          'tendência a oxidar. Ele funciona como ânodo de sacrifício, e o ferro ' +
                          'passa a ser o cátodo protegido — é a proteção catódica.' },
          { t: 'reage com a água formando uma camada de óxido insolúvel que veda o casco.',
            c: false, fb: 'O zinco forma óxido, mas o mecanismo de proteção descrito é ' +
                          'eletroquímico, por sacrifício do metal, e não por vedação passiva.' },
          { t: 'impede a passagem de elétrons do ferro para o oxigênio por ser isolante elétrico.',
            c: false, fb: 'Metais são condutores. A proteção depende justamente da condução ' +
                          'eletrônica entre zinco e ferro.' },
          { t: 'aumenta o potencial de redução do ferro, tornando-o nobre.',
            c: false, fb: 'O potencial de redução é uma propriedade do elemento e não é alterado ' +
                          'pela presença de outro metal.' }
        ]
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'equilibrio',
      titulo: 'Equilíbrio Químico',
      icone: '⇌',
      incidencia: { enem: '8,9%', unicamp: '9,3%', peso: 'Inclui ácidos, bases, pH e pOH' },
      resumo: 'Tema de peso nas duas provas, quase sempre acompanhado de ácidos e bases, ' +
              'cálculo de pH e pOH, hidrólise de sais e soluções tampão.',
      teoria: [
        { h: 'Equilíbrio químico',
          p: 'O equilíbrio é dinâmico: as velocidades das reações direta e inversa se igualam e ' +
             'as concentrações permanecem constantes. A constante de equilíbrio, Kc, depende ' +
             'apenas da temperatura e relaciona as concentrações dos produtos e dos reagentes ' +
             'elevadas aos respectivos coeficientes. Sólidos e líquidos puros não entram na ' +
             'expressão.' },
        { h: 'Princípio de Le Chatelier',
          u: [ 'Aumentar a concentração de um reagente desloca o equilíbrio no sentido dos produtos.',
               'Aumentar a pressão desloca o equilíbrio para o lado de menor volume gasoso.',
               'Aumentar a temperatura favorece a reação endotérmica.',
               'O catalisador não desloca o equilíbrio: apenas faz o sistema atingi-lo mais rápido.',
               'A adição de gás inerte a volume constante não desloca o equilíbrio.' ] },
        { h: 'Ácidos e bases',
          p: 'Pela definição de Brønsted-Lowry, ácido é a espécie que doa prótons e base é a que ' +
             'recebe. Ácidos fortes ionizam-se completamente; fracos, parcialmente, com constante ' +
             'de ionização pequena. O pH é o negativo do logaritmo decimal da concentração de ' +
             'íons hidrogênio, e pH + pOH é igual a 14 a 25 °C.' },
        { h: 'Escala de pH e indicadores',
          u: [ 'Soluções ácidas têm pH menor que 7; básicas, maior que 7; neutras, igual a 7 a 25 °C, sempre a essa temperatura.',
               'Cada unidade de pH corresponde a uma variação de dez vezes na concentração de H⁺.',
               'Indicadores mudam de cor em faixas características; a fenolftaleína fica rosa em meio básico.',
               'O pHmetro mede diretamente a diferença de potencial entre eletrodos.',
               'O pH do sangue é mantido próximo de 7,4 por tampões como o bicarbonato.' ] },
        { h: 'Hidrólise de sais e tampões',
          p: 'Sais derivados de ácido fraco e base forte produzem solução básica; de ácido forte ' +
             'e base fraca, solução ácida; de ácido e base fortes, solução neutra. Soluções ' +
             'tampão resistem a variações de pH por conterem um ácido fraco e sua base ' +
             'conjugada, ou o inverso. O tampão bicarbonato e o fosfato são essenciais nos ' +
             'sistemas biológicos.' },
        { h: 'Produto de solubilidade',
          p: 'O Kps expressa o equilíbrio entre um sólido pouco solúvel e seus íons em solução ' +
             'saturada. Quando o produto das concentrações iônicas supera o Kps, ocorre ' +
             'precipitação. A adição de um íon comum diminui a solubilidade do sal, efeito ' +
             'aplicado em tratamentos de água e em análises gravimétricas.' }
      ],
      cena: 'moleculas',
      sim: { type: 'equilibrio', focus: 'ph',
             parametros: [ { id: 'forca', rotulo: 'Força do ácido', min: 0, max: 1, valor: 0.5 },
                           { id: 'concentracao', rotulo: 'Concentração (mol/L)', min: 0.001, max: 1, passo: 0.001, valor: 0.01 },
                           { id: 'tampao', rotulo: 'Adicionar tampão', min: 0, max: 1, valor: 0 } ] },
      questao: {
        fonte: 'UNICAMP',
        texto: 'Em um frasco, 100 mL de solução de ácido acético 0,10 mol/L foram parcialmente ' +
               'neutralizados com hidróxido de sódio, resultando em uma solução que contém ' +
               'quantidades semelhantes de ácido acético e de acetato de sódio. Ao adicionar ' +
               'uma pequena quantidade de ácido clorídrico concentrado, espera-se que o pH',
        alts: [
          { t: 'caia bruscamente, pois o ácido clorídrico é forte e se ioniza completamente.',
            c: false, fb: 'A queda brusca ocorreria em água pura. Nessa solução há um tampão ' +
                          'formado por ácido fraco e sua base conjugada, que resiste à variação.' },
          { t: 'varie pouco, pois o íon acetato presente consome os prótons adicionados, ' +
                'deslocando o equilíbrio.',
            c: true,  fb: 'Correto. O acetato é a base conjugada do ácido acético e neutraliza os ' +
                          'H⁺ adicionados, formando mais ácido acético. O equilíbrio se desloca, ' +
                          'mas o pH varia muito pouco — é o comportamento típico de uma solução ' +
                          'tampão.' },
          { t: 'aumente, pois a adição de um ácido eleva a concentração de íons hidrogênio.',
            c: false, fb: 'Adicionar ácido nunca aumenta o pH. A questão é que o tampão faz o pH ' +
                          'cair muito pouco, e não subir.' },
          { t: 'permaneça exatamente igual, pois soluções tampão impedem qualquer variação.',
            c: false, fb: 'Tampões atenuam a variação, mas não a impedem totalmente. Afirmar que ' +
                          'o pH não muda é um exagero.' },
          { t: 'caia a zero, pois a quantidade de ácido adicionado é pequena.',
            c: false, fb: 'pH igual a zero exigiria concentração de H⁺ de 1 mol/L, o que não ' +
                          'corresponde a uma adição pequena.' }
        ]
      }
    }
  ]
};

/* índice unificado usado pela interface para montar a trilha de Química */
export const QUIMICA_ORDER = TRILHA_QUIMICA.temas.map(t => t.id);