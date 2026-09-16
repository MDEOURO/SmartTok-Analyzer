# SmartTok Analyzer - Documentação de Arquitetura & Regras de Negócio

## 📋 Visão Geral do Projeto
O **SmartTok Analyzer** é uma aplicação web leve e determinística criada para **Afiliados do TikTok Shop**. Seu objetivo é analisar matematicamente os dados fornecidos publicamente pelo TikTok Shop nos cards de "Tendências de Produtos" e entregar um diagnóstico de viabilidade para investimento em produção de vídeos (orgânico) ou anúncios pagos (TikTok Ads).

---

## 🎨 Design & Interface (UX/UI)
* **Estilo Visual:** Réplica exata da interface oficial do TikTok Shop ("Tendências de produtos") com tema Dark Mode (`#0b0e14`) e acentos nas cores neons oficiais do TikTok (`#00F2FE` Cyan e `#FF0050` Pink).
* **Grid 2x2 Responsivo:** Projetado para funcionar tanto em telas de computadores quanto em navegadores de telefones celulares:
  1. **Pedidos** (Quantidade e Variação)
  2. **CTR** (% de cliques e Variação)
  3. **Número de Criadores** (Quantidade e Variação)
  4. **Usuários que Adicionaram ao Carrinho** (Quantidade e Variação)
* **Modal de Ajuste de Variação:** Ao clicar sobre a pílula de tendência de qualquer card (`▲ 2`, `▼ 5`), abre-se um modal responsivo centralizado com fundo desfocado onde o usuário seleciona o sinal (`▲ Subiu` ou `▼ Caiu`) e digita o valor absoluto, anulando qualquer conflito de sinais duplos.

---

## 🧮 Regras de Negócio & Fórmulas Matemáticas

A inteligência da aplicação **não utiliza inteligência artificial** (é 100% matemática e determinística).

### 1. Métricas Derivadas
* **Taxa de Conversão do Carrinho (Cart-to-Sale Rate):**
  $$\text{Cart-to-Sale} = \left( \frac{\text{Pedidos}}{\text{Adicionados ao Carrinho}} \right) \times 100$$
  *Medida de qualidade da oferta/checkout (preço e frete).*
* **Abandono de Carrinho (Carrinhos por Pedido):**
  $$\text{Carrinhos por Pedido} = \frac{\text{Adicionados ao Carrinho}}{\text{Pedidos}}$$
* **Produtividade de Vendas por Criador:**
  $$\text{Pedidos por Criador} = \frac{\text{Pedidos}}{\text{Número de Criadores}}$$
* **Interesse Gerado por Criador:**
  $$\text{Carrinhos por Criador} = \frac{\text{Adicionados ao Carrinho}}{\text{Número de Criadores}}$$

---

### 2. Matriz de Causalidade (Decisão do Afiliado)

A nota global (0 a 100) é composta dinamicamente por 4 cenários causais principais:

#### A. Concorrência entre Afiliados vs Oportunidade
* **Criadores Caem ($\downarrow$) & Pedidos Subem ($\uparrow$):** `+25 Pontos`
  * *Razão Causal:* Afiliados concorrentes abandonaram a divulgação do produto, mas a demanda do público continua em alta. Oportunidade perfeita para gravar vídeos orgânicos sem concorrência.
* **Criadores Subem ($\uparrow$) & Pedidos Estagnados ($\downarrow$):** `-20 Pontos`
  * *Razão Causal:* O mercado está saturado de vídeos do mesmo produto e a audiência do TikTok cansou de ver os mesmos criativos.
* **Criadores Caem ($\downarrow$) & Pedidos Caem ($\downarrow$):** `-25 Pontos`
  * *Razão Causal:* O produto perdeu o hype e entrou em curva de declínio no TikTok Shop.

#### B. Atratividade Visual (CTR)
* **CTR $\ge 5.0\%$ & Variação Subindo ($\uparrow$):** `+20 Pontos`
  * *Razão Causal:* O produto atrai curiosidade imediata no feed. Excelente potencial viral.
* **CTR $< 3.5\%$ ou Variação Caindo ($\downarrow$):** `-15 Pontos`
  * *Razão Causal:* O vídeo não prende atenção rápida dos usuários.

#### C. Saúde do Checkout (Conversão do Carrinho)
* **Conversão do Carrinho $\ge 30\%$:** `+20 Pontos`
  * *Razão Causal:* Preço e frete atrativos. 1 em cada 3 que colocam no carrinho finalizam a compra.
* **Conversão do Carrinho $< 15\%$:** `-20 Pontos`
  * *Razão Causal:* Alto abandono de carrinho. O frete ou o preço final travam a compra no checkout. **Recomendação expressa de NÃO rodar tráfego pago (anúncios).**

#### D. Eficiência Média por Criador
* **Pedidos por Criador $< 0.8$:** `-10 Pontos`
  * *Razão Causal:* Criadores ativos gerando poucos resultados. Necessidade de mudar a abordagem do vídeo.

---

## 🏗️ Estrutura de Arquivos da Aplicação

```
SmartTok Analyzer/
├── index.html        # Estrutura HTML semanticamente organizada e modals
├── style.css         # Design tokens, variáveis HSL, cores TikTok e responsividade
├── app.js            # Lógica JS pura (Event listeners, Math.abs, cálculo de Score e Razões)
└── README.md         # Este guia de documentação técnica
```

---

## 🚀 Como Executar em Outro Computador

Como o projeto é construído em **HTML5 + CSS Vanilla + JavaScript ES6 (sem frameworks/sem compilação)**, ele não possui dependências de instalação (`node_modules`).

### Opção A: Execução Direta (Sem Servidor)
1. Baixe a pasta ou clone o repositório do GitHub.
2. Dê um duplo clique no arquivo `index.html`. Ele abrirá diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).

### Opção B: Servidor Local Simples (Opcional)
Se desejar rodar em servidor local via terminal:
```bash
# Utilizando npx serve
npx serve -l 3000

# Ou utilizando Python
python -m http.server 3000
```
Acesse em: `http://localhost:3000`

---

## 📌 Passos Recomendados para Enviar ao GitHub

No terminal dentro da pasta do projeto (`SmartTok Analyzer`), execute:

```bash
git init
git add .
git commit -m "feat: versão inicial estável do SmartTok Analyzer com matriz causal para afiliados"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SmartTok-Analyzer.git
git push -u origin main
```
