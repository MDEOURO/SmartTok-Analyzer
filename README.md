# SmartTok Analyzer - Documentação de Arquitetura & Regras de Negócio

## 📋 Visão Geral do Projeto
O **SmartTok Analyzer** é uma aplicação web determinística focada em **viabilidade de investimento de tempo para Afiliados do TikTok Shop**. Seu objetivo é cruzar dados da tela de "Tendências de Produtos" em tempo real e gerar insights analíticos matematicamente precisos — alertando sobre saturação, tráfego sujo, fugas de checkout e crescimento orgânico.

---

## 🎨 Atualizações de Interface e UX/UI
* **Bloqueio de Vírgulas Removido:** Os campos de input foram atualizados para aceitar digitação fluida em diferentes padrões monetários. O travamento gerado pelo teclado numérico de navegadores brasileiros ao digitar "vírgulas" foi resolvido via `parseLocalFloat`.
* **Auto-Limpeza Inteligente:** Ao focar em um campo que está zerado (`0` ou `0,00`), ele se esvazia instantaneamente, poupando a necessidade de "apagar manualmente" os zeros sem causar loops de foco do navegador.
* **Diagnósticos em 2 Camadas:** Os alertas gerados pelo cruzamento de dados agora são entregues em formato modular e limpo:
  * *Linha 1:* O evento matemático direto (ex: "Vendas subiram 80% e carrinhos subiram 7%").
  * *Linha 2:* A tradução causal humana com emojis de rápido processamento (ex: "🚀 O que isso significa: O funil está redondo").

---

## 🧮 Matriz de Causalidade Simultânea (O "Cérebro" do App)

O sistema agora cruza múltiplas esferas de dados de forma **simultânea e independente**. O aplicativo não usa IA, trata-se de um algoritmo em JavaScript capaz de detectar anomalias (quando o topo do funil reage diferente do fundo).

### 1. Dinâmica de Funil (Pedidos vs Carrinhos)
* **Fuga no Checkout:** Vendas despencando num ritmo maior que as intenções de compra. Acusa barreiras no checkout da loja (frete alto ou erro no site).
* **Anomalia de Tráfego:** Vendas continuam altas mas intenções despencaram. Acusa que o algoritmo parou de entregar os vídeos antigos, apesar do produto converter bem.
* **Tráfego Sujo:** Carrinhos disparam mas vendas não acontecem. Acusa vídeo atraindo curiosos (viral sujo) que desistem ao ver preço.
* **Crescimento Saudável:** Topo e fundo de funil subindo de forma proporcional.

### 2. Dinâmica de Mercado e Concorrência
* **Saturação Aguda (Colapso):** O interesse do público encolhe enquanto a concorrência sobe. O mercado entrou em colapso matemático para novos entrantes.
* **Onda de Escalada (Oceano Azul):** Demanda sobe mas concorrentes caem. Cenário de ouro para dominação de nicho orgânico.

### 3. Fatiamento e Viabilidade Monetária
* **Ganhos Projetados por Afiliado:** Métrica financeira real estimando a fatia monetária gerada pelo ecossistema para cada criador ativo.
* **Mercado Fatiado Demais:** Menos de 0.5 vendas na média para cada afiliado num mar de +20 concorrentes acusa um esforço inútil.

### 4. Zero Absoluto e Estados de Partida
* Se tudo estiver "0", o painel reconhece um **Produto Não Iniciado** e não faz punições irreais, exigindo vídeos de validação primária.

---

## 🏗️ Estrutura de Arquivos

```
SmartTok Analyzer/
├── index.html        # Estrutura do App (Grid 2x2 e Grid de Resultados)
├── style.css         # Design system Dark Mode TikTok
├── app.js            # Engine matemática (parseLocalFloat, If/Else Matrix e Manipulação de DOM)
└── README.md         # Documentação técnica e histórico
```

---

## 🚀 Como Hospedar Oficialmente no Celular (Sem Banco de Dados)

O SmartTok Analyzer não requer banco de dados. Para gerar um link oficial, instalar no celular como PWA ou abrir de qualquer lugar, utilize a hospedagem gratuita e nativa do **GitHub Pages**:

1. No seu repositório no GitHub, clique em **Settings** (Configurações).
2. Acesse a guia **Pages** no menu lateral esquerdo.
3. Em "Build and deployment > Source", mude o botão de "None" para a branch **main**.
4. Clique em **Save**.
5. Aguarde cerca de 1 a 2 minutos e atualize a página para visualizar o seu link web permanente (ex: `https://mdeouro.github.io/SmartTok-Analyzer`).
