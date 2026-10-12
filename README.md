# Cellular Vision 3D — Laboratório Interativo de Citologia

Experiência educacional tridimensional e interativa de uma **célula eucariótica animal**,
com extensão para **célula vegetal** e **célula procariótica**. Reúne modelo 3D detalhado,
fichas científicas completas e nove módulos de estudo com teoria, simulador e questão
estilo ENEM/Unicamp.

## Como usar

Abra o arquivo `index.html` com duplo clique (Chrome, Edge ou Firefox atualizados).

- O modelo tridimensional é carregado de `unpkg.com` (Three.js r160), portanto é
  necessária **conexão com a internet** na primeira abertura.
- Não há instalação, servidor ou dependência local. Todo o CSS e o JavaScript da
  aplicação estão embutidos no próprio `index.html`.
- Se o WebGL estiver desabilitado, a página exibe uma mensagem explicativa em vez de
  travar em branco.

## Estrutura

```
cellular-vision-3d/
├── index.html          ← entrega final autocontida (abra este arquivo)
├── README.md
└── build/              ← código-fonte modular e ferramentas de validação
    ├── template.html   ← esqueleto HTML + CSS com o marcador /*__JS__*/
    ├── build.mjs       ← inlina os módulos JS no index.html
    ├── js/
    │   ├── 01-science.js   18 estruturas com as 10 seções científicas obrigatórias
    │   ├── 02-modules.js   Módulos 0–8: teoria, configuração de simulação e questão
    │   ├── 03-state.js     estado global, registry de organelas, utilidades geométricas
    │   ├── 04-cell.js      construção do modelo 3D (membrana, organelas, vegetal, procarionte)
    │   ├── 05-anim.js      animações de processos: vesículas, transporte, ATP, tradução, vírus
    │   ├── 06-modes.js     modos de visualização, isolamento, corte, wireframe, dissecção
    │   ├── 07-select.js    identificação visual da seleção: halo, anéis, etiqueta, comparação
    │   ├── 08-ui.js        lista, ficha científica, escala, teoria e questões
    │   ├── 09-sims.js      dez simuladores interativos dos módulos
    │   └── 10-main.js      renderer, câmera, iluminação, seleção, atalhos e loop
    ├── probe.mjs       verificação de inicialização
    ├── probe2.mjs      suíte de interação (organelas, módulos, questões, comparação)
    ├── probe3.mjs      verificação de layout responsivo em cinco resoluções
    ├── shots.mjs       captura de doze estados representativos
    └── analyze_shots.py análise das capturas para confirmar renderização 3D real
```

## Conteúdo científico

**18 estruturas**, cada uma com ficha de dez campos: descrição anatômica, localização
celular, características estruturais observáveis, composição, função biológica,
processos celulares, relação com outras estruturas, curiosidades científicas,
consequências funcionais e escala aproximada.

Membrana plasmática · Citoplasma e citosol · Junções celulares e glicocálice · Núcleo ·
Mitocôndria · Retículo endoplasmático rugoso · Retículo endoplasmático liso ·
Complexo de Golgi · Ribossomos · Lisossomos · Peroxissomos · Vesículas intracelulares ·
Centrossomo e centríolos · Citoesqueleto · Parede celular vegetal · Cloroplastos ·
Vacúolo central · Nucleoide e cromossomo bacteriano.

## Nove módulos de estudo

| Módulo | Tema | Simulador |
|---|---|---|
| 0 | Fundamentos e teoria celular | comparação animal / vegetal / procarionte |
| 1 | Membrana plasmática e transporte | osmose com volume celular variável |
| 2 | Citoplasma e organelas | exploração por clique nas organelas |
| 3 | Respiração celular | disponibilidade de O₂ e rendimento em ATP |
| 4 | Núcleo e ciclo celular | fases G1, S, G2, prófase, metáfase, anáfase, telófase |
| 5 | Fotossíntese | intensidade luminosa e CO₂ |
| 6 | Comunicação e adesão celular | desmossomo, junção gap, junção de oclusão |
| 7 | Diferenciação e morte celular | potencialidade e apoptose |
| 8 | Vírus e replicação viral | ciclo lítico e ciclo lisogênico |

Cada módulo traz blocos de teoria, um simulador que altera o modelo 3D em tempo real e
uma questão de múltipla escolha com correção comentada e gabarito.

## Recursos do modelo 3D

- **Modos de visualização:** completa, membrana transparente, corte transversal com plano
  de recorte real, explosão anatômica, isolamento de estrutura, comparação estrutural
  fixando uma referência e malha (wireframe).
- **Quatro níveis de observação** com barra de escala dinâmica e aviso metodológico que
  muda conforme o nível (celular, subcelular, estrutural e molecular ilustrativo).
- **Identificação da seleção:** halo pulsante, três anéis de mira giratórios, realce
  emissivo nos materiais da estrutura, atenuação das estruturas vizinhas e etiqueta
  flutuante projetada em coordenadas de tela.
- **Animações de processos:** tráfego de vesículas do retículo ao Golgi e à membrana,
  transporte pela membrana, produção de ATP dependente de O₂ e tradução ribossômica,
  com reproduzir, pausar, reiniciar e controle de velocidade.
- **Detalhe molecular:** cabeças de fosfolipídio instanciadas nas duas faces da bicamada
  e proteínas integrais de membrana.
- **Atalhos de teclado:** `R` restaura a visão, `Espaço` pausa ou retoma as animações,
  `Esc` desfaz a seleção, `I` isola, `C` alterna o corte e as setas deslocam a câmera.

## Rigor e transparência científica

O modelo é uma **reconstrução didática**. Escalas, proporções e velocidades são
aproximadas e sempre qualificadas na interface e nas fichas. Os pontos de conteúdo
tratados com cuidado explícito incluem:

- o oxigênio liberado na fotossíntese provém da **fotólise da água**, não do CO₂;
- a "fase escura" depende dos produtos da fase clara e **não ocorre apenas no escuro**;
- a fermentação produz saldo de **2 ATP** por glicose, contra até 38 na respiração aeróbia;
- a bomba de Na⁺/K⁺-ATPase transporta **3 Na⁺ para fora e 2 K⁺ para dentro** por ATP;
- a apoptose **não desencadeia inflamação**, ao contrário da necrose;
- o vírus possui DNA **ou** RNA, nunca os dois, e é acelular;
- o crossing-over ocorre na **prófase I da meiose**;
- o envelope nuclear é **contínuo com o retículo endoplasmático rugoso**.

## Validação

```bash
node build/build.mjs        # gera index.html
node build/probe2.mjs       # 88 verificações de interação
node build/probe3.mjs       # layout em 5 resoluções
node build/shots.mjs        # 12 capturas
python build/analyze_shots.py
```