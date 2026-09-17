document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('metricsForm');
  const periodBtns = document.querySelectorAll('.btn-period');
  let currentPeriod = '7d';

  const strategyBtns = document.querySelectorAll('.btn-strategy');
  let currentStrategy = 'organic';
  const paidInputs = document.getElementById('paidInputs');

  strategyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      strategyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStrategy = btn.dataset.strategy;
    });
  });

  // Limpa o '0' automaticamente ao focar para não precisar apagar
  const allInputs = document.querySelectorAll('.tt-main-input, #modalInputVal');
  allInputs.forEach(input => {
    input.addEventListener('focus', function() {
      if (this.value === '0' || this.value === '0.00' || this.value === '0,00') {
        this.value = '';
      }
    });
    input.addEventListener('blur', function() {
      if (this.value.trim() === '') {
        this.value = (this.id === 'commission' || this.id === 'price') ? '0.00' : '0';
      }
    });
  });

  // Botão Limpar Tudo
  const btnClearAll = document.getElementById('btnClearAll');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      document.querySelectorAll('.tt-main-input').forEach(input => input.value = 0);
      document.querySelectorAll('input[type="hidden"]').forEach(input => {
        if (input.id.includes('Dir')) input.value = 'up';
        else input.value = '0';
      });
      document.querySelectorAll('.var-badge-text').forEach(el => el.textContent = '0');
      document.querySelectorAll('.btn-open-variation').forEach(btn => {
        btn.classList.remove('val-down');
        btn.classList.add('val-up');
        btn.querySelector('.var-badge-icon').textContent = '▲';
      });
      document.querySelectorAll('.tt-mult-select').forEach(sel => sel.value = '1');
      
      // Limpa os cards da direita e o diagnóstico inferior
      document.getElementById('resCartToSale').innerText = '0,0%';
      document.getElementById('resCartsPerOrder').innerText = '0';
      document.getElementById('resOrdersPerCreator').innerText = '0,0';
      document.getElementById('resTotalCommission').innerText = '$0,00';
      
      const reasonsContainer = document.querySelector('.reasons-container');
      if (reasonsContainer) reasonsContainer.innerHTML = '';
      
      document.getElementById('scoreText').textContent = '0';
      const scoreRing = document.getElementById('scoreCircle');
      if (scoreRing) scoreRing.setAttribute('stroke-dasharray', '0, 100');
      
      const badge = document.getElementById('verdictBadge');
      if (badge) {
        badge.textContent = 'AGUARDANDO DADOS';
        badge.className = 'verdict-badge';
        badge.style.backgroundColor = 'transparent';
        badge.style.border = '1px solid var(--card-border)';
        badge.style.color = 'var(--text-muted)';
      }
    });
  }

  // Gerenciamento do Modal de Variação (Mobile e Desktop)
  const variationModal = document.getElementById('variationModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnDirUp = document.getElementById('btnDirUp');
  const btnDirDown = document.getElementById('btnDirDown');
  const modalInputVal = document.getElementById('modalInputVal');
  const btnApplyVariation = document.getElementById('btnApplyVariation');

  let activeField = null;
  let activeDir = 'up';

  // Mapeamento dos botões das pílulas para abrir o modal
  const fields = ['orders', 'ctr', 'creators', 'cartAdds'];
  fields.forEach(field => {
    const varBtn = document.getElementById(field === 'cartAdds' ? 'cartVarBtn' : `${field}VarBtn`);
    const card = varBtn.closest('.tt-metric-card');

    varBtn.addEventListener('click', () => {
      activeField = field;
      const labelText = card.querySelector('.tt-label').textContent;
      const hiddenDir = document.getElementById(field === 'cartAdds' ? 'cartDeltaDir' : `${field}DeltaDir`);
      const hiddenVal = document.getElementById(field === 'cartAdds' ? 'cartDelta' : `${field}Delta`);

      modalTitle.textContent = `Variação: ${labelText}`;
      activeDir = hiddenDir.value;
      modalInputVal.value = hiddenVal.value;

      updateModalDirUI();
      variationModal.classList.remove('hidden');
      modalBackdrop.classList.remove('hidden');
    });

  });

  function updateModalDirUI() {
    if (activeDir === 'up') {
      btnDirUp.classList.add('active');
      btnDirDown.classList.remove('active');
    } else {
      btnDirDown.classList.add('active');
      btnDirUp.classList.remove('active');
    }
  }

  btnDirUp.addEventListener('click', () => {
    activeDir = 'up';
    updateModalDirUI();
  });

  btnDirDown.addEventListener('click', () => {
    activeDir = 'down';
    updateModalDirUI();
  });

  function closeModal() {
    variationModal.classList.add('hidden');
    modalBackdrop.classList.add('hidden');
  }

  btnCloseModal.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  function parseLocalFloat(val) {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(',', '.')) || 0;
  }

  btnApplyVariation.addEventListener('click', () => {
    if (!activeField) return;

    const prefix = activeField === 'cartAdds' ? 'cart' : activeField;
    const hiddenDir = document.getElementById(`${prefix}DeltaDir`);
    const hiddenVal = document.getElementById(`${prefix}Delta`);
    const varText = document.getElementById(`${prefix}VarText`);
    const varBtn = document.getElementById(`${prefix}VarBtn`);

    hiddenDir.value = activeDir;
    // Garante que o valor salvo seja sempre positivo absoluto para evitar erros do tipo "- -3"
    const parsedVal = Math.abs(parseLocalFloat(modalInputVal.value));
    hiddenVal.value = parsedVal;

    const formattedText = activeField === 'ctr' ? `${parsedVal.toString().replace('.', ',')}%` : parsedVal;
    varText.textContent = formattedText;

    if (activeDir === 'up') {
      varBtn.className = 'btn-open-variation val-up';
      varBtn.querySelector('.var-badge-icon').textContent = '▲';
    } else {
      varBtn.className = 'btn-open-variation val-down';
      varBtn.querySelector('.var-badge-icon').textContent = '▼';
    }

    closeModal();
  });

  // Alternância de Período (7 dias / 30 dias)
  periodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      periodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriod = btn.dataset.period;
    });
  });

  // Evento de submit do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateAndRender();
  });

  // MATRIZ COMPLETA DE DIAGNÓSTICO E CAUSALIDADE PARA AFILIADOS
  function calculateAndRender() {
    const ctr = parseLocalFloat(document.getElementById('ctr').value);
    const ctrDir = document.getElementById('ctrDeltaDir').value;
    const ctrDeltaVal = Math.abs(parseLocalFloat(document.getElementById('ctrDelta').value));
    const ctrDelta = ctrDir === 'up' ? ctrDeltaVal : -ctrDeltaVal;
    
    const ordersBase = parseLocalFloat(document.getElementById('orders').value);
    const ordersMult = parseLocalFloat(document.getElementById('ordersMult').value) || 1;
    const orders = Math.floor(ordersBase * ordersMult);
    const ordersDir = document.getElementById('ordersDeltaDir').value;
    const ordersDeltaVal = Math.abs(parseLocalFloat(document.getElementById('ordersDelta').value));
    const ordersDelta = ordersDir === 'up' ? ordersDeltaVal : -ordersDeltaVal;
    
    const cartAddsBase = parseLocalFloat(document.getElementById('cartAdds').value);
    const cartAddsMult = parseLocalFloat(document.getElementById('cartAddsMult').value) || 1;
    const cartAdds = Math.floor(cartAddsBase * cartAddsMult);
    const cartDir = document.getElementById('cartDeltaDir').value;
    const cartDeltaVal = Math.abs(parseLocalFloat(document.getElementById('cartDelta').value));
    const cartDelta = cartDir === 'up' ? cartDeltaVal : -cartDeltaVal;
    
    const creatorsBase = parseLocalFloat(document.getElementById('creators').value);
    const creatorsMult = parseLocalFloat(document.getElementById('creatorsMult').value) || 1;
    const creators = Math.floor(creatorsBase * creatorsMult);
    const creatorsDir = document.getElementById('creatorsDeltaDir').value;
    const creatorsDeltaVal = Math.abs(parseLocalFloat(document.getElementById('creatorsDelta').value));
    const creatorsDelta = creatorsDir === 'up' ? creatorsDeltaVal : -creatorsDeltaVal;

    // Métricas Derivadas
    // Se orders for maior que cartAdds (ex: comprou direto sem carrinho), limitamos a 100% para não gerar % bizarras
    const cartToSaleRate = cartAdds > 0 ? Math.min(100, (orders / cartAdds) * 100) : 0;
    const ordersPerCreator = creators > 0 ? (orders / creators) : 0;
    const commission = parseLocalFloat(document.getElementById('commission').value);
    const totalCommission = orders * commission;

    // Se tudo for ZERO (Produto nem começou a rodar ou form vazio), não rodar análise punitiva.
    if (orders === 0 && cartAdds === 0 && creators === 0 && ctr === 0) {
      document.getElementById('resCartToSale').innerText = '0,0%';
      document.getElementById('resCartsPerOrder').innerText = '0';
      document.getElementById('resOrdersPerCreator').innerText = '0,0';
      document.getElementById('resTotalCommission').innerText = '$0,00';
      
      document.getElementById('scoreText').textContent = '0';
      const scoreRing = document.getElementById('scoreCircle');
      if (scoreRing) scoreRing.setAttribute('stroke-dasharray', '0, 100');
      
      const badge = document.getElementById('verdictBadge');
      if (badge) {
        badge.textContent = 'AGUARDANDO PARÂMETROS';
        badge.className = 'verdict-badge';
        badge.style.backgroundColor = 'transparent';
        badge.style.border = '1px solid var(--card-border)';
        badge.style.color = 'var(--text-muted)';
      }

      document.querySelector('.reasons-container').innerHTML = `
        <div style="margin-top: 12px;">
          <div class="diagnostic-card" style="text-align: center; padding: 24px;">
            <strong style="color: var(--tiktok-cyan); font-size: 1rem;">O produto ainda não tem dados suficientes.</strong>
            <span style="color: var(--text-muted);">Preencha as métricas para cruzar os valores. Se for um produto do zero que você ainda vai testar, não se baseie apenas no painel e crie seus 3 vídeos de validação.</span>
          </div>
        </div>
      `;
      return;
    }

    // Atualizar os quadros de métricas derivadas
    document.getElementById('resCartToSale').innerText = cartToSaleRate.toFixed(1).replace('.', ',') + '%';
    document.getElementById('resCartsPerOrder').innerText = orders > 0 ? (cartAdds / orders).toFixed(2).replace('.', ',') : '0';
    document.getElementById('resOrdersPerCreator').innerText = ordersPerCreator.toFixed(1).replace('.', ',');
    document.getElementById('resTotalCommission').innerText = '$' + totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    let score = 50;
    let badgeClass = 'status-warning';
    let badgeText = 'ANÁLISE PENDENTE';
    
    const strongPoints = [];
    const weakPoints = [];
    const recommendations = [];

    // === CÁLCULO DE ESTADOS ANTERIORES E TAXAS REAIS ===
    const prevOrders = ordersDir === 'up' ? Math.max(1, orders - Math.abs(ordersDelta)) : orders + Math.abs(ordersDelta);
    const prevCartAdds = cartDir === 'up' ? Math.max(1, cartAdds - Math.abs(cartDelta)) : cartAdds + Math.abs(cartDelta);
    const prevCreators = creatorsDir === 'up' ? Math.max(1, creators - Math.abs(creatorsDelta)) : creators + Math.abs(creatorsDelta);

    const ordersVarPct = ((Math.abs(ordersDelta) / prevOrders) * 100).toFixed(1);
    const cartVarPct = ((Math.abs(cartDelta) / prevCartAdds) * 100).toFixed(1);
    const creatorsVarPct = ((Math.abs(creatorsDelta) / prevCreators) * 100).toFixed(1);

    // === 1. ANÁLISE DE FUNIL (Pedidos vs Carrinhos) ===
    if (ordersDir === 'down' && cartDir === 'down') {
      if ((Math.abs(ordersDelta) / prevOrders) > (Math.abs(cartDelta) / prevCartAdds) * 1.3) {
         score -= 20;
         weakPoints.push(`<strong>Fuga no Checkout:</strong> As vendas caíram num ritmo muito maior (-${ordersVarPct}%) do que as adições ao carrinho (-${cartVarPct}%). O cliente entra, mas foge na hora H.`);
         recommendations.push(`<strong>Atenção ao Frete/Preço:</strong> Algo mudou na loja nos últimos dias (frete caro ou estoque zerado) matando a conversão final.`);
      } else {
         score -= 10;
         weakPoints.push(`<strong>Tendência de Queda Proporcional:</strong> O interesse (-${cartVarPct}%) e as vendas (-${ordersVarPct}%) estão caindo na mesma proporção. O produto está perdendo a tração inicial.`);
      }
    } else if (ordersDir === 'up' && cartDir === 'down') {
      score -= 5;
      weakPoints.push(`<strong>Anomalia de Tráfego:</strong> As vendas até subiram (+${ordersVarPct}%), mas a entrada de pessoas no carrinho caiu drasticamente (-${cartVarPct}%). O topo do funil está secando.`);
      recommendations.push(`<strong>Renove os Vídeos:</strong> Quem chega no checkout compra, mas o tráfego geral despencou. O algoritmo parou de entregar os vídeos antigos.`);
    } else if (ordersDir === 'down' && cartDir === 'up') {
      score -= 15;
      weakPoints.push(`<strong>Tráfego Sujo (Curiosos):</strong> As adições ao carrinho dispararam (+${cartVarPct}%), mas as vendas despencaram (-${ordersVarPct}%). O vídeo viralizou para o público errado ou o frete assustou todo mundo.`);
    } else if (ordersDir === 'up' && cartDir === 'up' && orders > 0) {
      score += 15;
      strongPoints.push(`<strong>Crescimento Saudável:</strong> Vendas (+${ordersVarPct}%) e Carrinhos (+${cartVarPct}%) subindo proporcionalmente. O funil está redondo e em expansão.`);
    }

    // === 2. DINÂMICA DE MERCADO (Demanda vs Concorrência) ===
    if (cartDir === 'down' && creatorsDir === 'up') {
      score -= 30;
      weakPoints.push(`<strong>Saturação Aguda (Alerta Vermelho):</strong> O interesse do público encolheu (-${cartVarPct}%), mas a concorrência explodiu (+${creatorsVarPct}%). O bolo está menor com muito mais gente disputando.`);
      recommendations.push(`<strong>Pule Fora:</strong> A matemática de tráfego orgânico não vai fechar. O mercado para este produto entrou em modo tubarão.`);
    } else if (ordersDir === 'up' && creatorsDir === 'down' && orders > 0) {
      score += 20;
      strongPoints.push(`<strong>Onda de Escalada (Oceano Azul Crescente):</strong> Vendas saltando (+${ordersVarPct}%), enquanto a concorrência foge (-${creatorsVarPct}%). Os rivais estão desistindo justo quando a demanda explode.`);
      recommendations.push(`<strong>Acelere a Produção:</strong> Cenário matemático perfeito. Esmague o nicho publicando mais vídeos agora enquanto os outros dormem.`);
    } else if (orders > 0 && orders < 20 && creatorsDir !== 'down') {
      score -= 5;
      weakPoints.push(`<strong>Volume Tímido (${orders} pedidos):</strong> Amostra pequena. É perigoso tirar conclusões definitivas com pouco volume absoluto.`);
    }

    // === 3. ANÁLISE DE CTR E RETENÇÃO (Cliques vazios vs Engajamento) ===
    if (ctrDir === 'up' && ordersDir === 'down' && ordersDelta > 0) {
      score -= 10;
      weakPoints.push(`<strong>Cliques Vazios:</strong> O vídeo chama mais atenção (CTR subiu para ${ctr}%), mas as vendas caíram -${ordersVarPct}%. Promessa forte, mas produto fraco.`);
      recommendations.push(`<strong>Alinhe Expectativas:</strong> Não faça clickbaits. O cliente clica esperando uma coisa e a loja entrega outra.`);
    } else if (ctr >= 5.0) {
      score += 10;
      strongPoints.push(`<strong>Gancho Validado:</strong> CTR matemático excelente (${ctr}%). A barreira do clique já foi vencida.`);
    }

    // === 4. COMPORTAMENTO DE CHECKOUT (Conversão Real) ===
    if (cartAdds > 0 && orders > 0) {
      if (cartToSaleRate >= 30) {
         score += 15;
         strongPoints.push(`<strong>Conversão Extrema (${cartToSaleRate.toFixed(1)}%):</strong> Quem adiciona ao carrinho realmente compra. Oferta e frete estão irresistíveis para o cliente final.`);
      } else if (cartToSaleRate < 15) {
         score -= 15;
         weakPoints.push(`<strong>Gargalo no Checkout (${cartToSaleRate.toFixed(1)}%):</strong> Muitos clicam no carrinho, quase ninguém paga. Susto com o preço ou frete alto de última hora.`);
         recommendations.push(`<strong>Filtro de Curiosos:</strong> Revele o preço ou frete já no final do vídeo para filtrar quem não tem intenção de pagar.`);
      } else {
         strongPoints.push(`<strong>Conversão Padrão (${cartToSaleRate.toFixed(1)}%):</strong> A conversão da loja (do carrinho para a venda) está dentro da normalidade.`);
      }
    }

    // === 5. CÁLCULO DE CONCORRÊNCIA E FATIA DE MERCADO ===
    const marketShareRatio = ordersPerCreator; // Vendas médias por afiliado
    if (marketShareRatio < 0.5 && creators >= 20) {
      score -= 15;
      weakPoints.push(`<strong>Mercado Fatiado Demais:</strong> Com ${creators} afiliados, a fatia média é de apenas ${marketShareRatio.toFixed(2)} vendas por pessoa. Esforço desproporcional ao ganho.`);
    } else if (marketShareRatio > 2 && creators > 0) {
      score += 15;
      strongPoints.push(`<strong>Alta Fartura por Afiliado:</strong> A média matemática atual é de ${marketShareRatio.toFixed(1)} vendas por afiliado ativo. Um cenário altamente rentável e com espaço para você.`);
    }

    // === 5. CASOS DE ZERO ABSOLUTO (MAS COM OUTROS DADOS) ===
    if (orders === 0 && cartAdds > 0) {
      score -= 40;
      weakPoints.push(`<strong>Bloqueio Total de Conversão:</strong> ${cartAdds} intenções no carrinho e 0 compras (${(0).toFixed(2)}%).`);
      recommendations.push(`<strong>Audite Imediatamente:</strong> O sistema de pagamento da loja está quebrado ou o frete está absurdo. Não invista tráfego nisso hoje.`);
    } else if (orders === 0 && creators > 0) {
      score -= 20;
      weakPoints.push(`<strong>Esforço sem Retorno:</strong> Existem ${creators} criadores tentando vender e NENHUMA venda saiu.`);
      recommendations.push(`<strong>Produto Não Validado:</strong> Os criadores não conseguem convencer o público a comprar. Pule fora.`);
    }

    // === 5. TRÁFEGO PAGO (SOMENTE SE SELECIONADO) ===
    if (currentStrategy === 'paid') {
      const commission = parseFloat(document.getElementById('commission').value) || 0;
      const maxCpa = (cartToSaleRate / 100) * commission;
      
      if (orders < 20) {
        weakPoints.push(`<strong>Risco Máximo em Ads</strong> Sem volume orgânico, você queimará dinheiro comprando dados do zero.`);
        recommendations.push(`<strong>Valide no Orgânico Primeiro</strong> Consiga 15 vendas orgânicas antes de torrar verba em anúncios.`);
        score -= 20;
      } else if (maxCpa > 0) {
        if (maxCpa < 10) {
          weakPoints.push(`<strong>Margem de CPA Baixa ($${maxCpa.toFixed(2)})</strong> Leilão de Ads no TikTok vai devorar essa margem de lucro.`);
        } else {
          strongPoints.push(`<strong>Margem Saudável</strong> Teto de CPA ($${maxCpa.toFixed(2)}) permite explorar leilões de anúncios com margem de sobra.`);
        }
      }
    }

    // Ajuste final da nota
    score = Math.min(100, Math.max(0, score));

    // Determinar Veredito
    if (score >= 70 && orders >= 20) {
      badgeClass = 'status-success';
      badgeText = 'PRODUTO GANHADOR CONSOLIDADO';
    } else if (score >= 60 && orders < 20) {
      badgeClass = 'status-success';
      badgeText = 'OPORTUNIDADE DE VALIDAÇÃO (OCEANO AZUL)';
    } else if (score >= 40) {
      badgeClass = 'status-warning';
      badgeText = 'PRODUTO INCERTO / TESTE COM CAUTELA';
    } else {
      badgeClass = 'status-danger';
      badgeText = 'NÃO RECOMENDADO PARA INVESTIR';
    }

    // Renderizar Interface
    const badge = document.getElementById('verdictBadge');
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreText = document.getElementById('scoreText');
    const reasonsContainer = document.querySelector('.reasons-container');

    scoreText.textContent = score;
    scoreCircle.setAttribute('stroke-dasharray', `${score}, 100`);
    
    badge.className = `verdict-badge ${badgeClass}`;
    badge.textContent = badgeText;

    if (badgeClass === 'status-success') scoreCircle.style.stroke = '#10b981';
    else if (badgeClass === 'status-warning') scoreCircle.style.stroke = '#f59e0b';
    else scoreCircle.style.stroke = '#ef4444';

    // Montar a nova estrutura HTML limpa e profissional
    let htmlOutput = '';
    
    if (strongPoints.length > 0) {
      htmlOutput += `<div style="margin-bottom: 20px;">
        <h4 style="color: #10b981; margin-bottom: 12px; font-size: 0.9rem;">✅ Pontos Fortes (Oportunidade)</h4>
        <div class="diagnostic-grid">${strongPoints.map(p => `<div class="diagnostic-card strong-card">${p}</div>`).join('')}</div>
      </div>`;
    }

    if (weakPoints.length > 0) {
      htmlOutput += `<div style="margin-bottom: 20px;">
        <h4 style="color: #ef4444; margin-bottom: 12px; font-size: 0.9rem;">⚠️ Pontos de Atenção (Riscos)</h4>
        <div class="diagnostic-grid">${weakPoints.map(p => `<div class="diagnostic-card weak-card">${p}</div>`).join('')}</div>
      </div>`;
    }

    if (recommendations.length > 0) {
      htmlOutput += `<div>
        <h4 style="color: var(--tiktok-cyan); margin-bottom: 12px; font-size: 0.9rem;">🎯 Veredito & Como Abordar</h4>
        <div class="diagnostic-grid">${recommendations.map(p => `<div class="diagnostic-card recom-card">${p}</div>`).join('')}</div>
      </div>`;
    }

    // Gerar Conselho Final Executivo
    let finalAdvice = "";
    if (score >= 70 && orders >= 20) {
      finalAdvice = "🔥 <strong>Sinal Verde (Escale):</strong> Este é um produto vencedor. Os números provam que há demanda, o público clica e a conversão acontece. Grave vídeos o mais rápido possível para surfar a onda.";
    } else if (score >= 60 && orders < 20) {
      finalAdvice = "🌊 <strong>Aposte no Teste (Oceano Azul):</strong> O produto tem excelentes taxas de interesse e baixa concorrência, mas ainda vende pouco. Faça 2 vídeos de teste: se o algoritmo entregar, você dominará o nicho sozinho.";
    } else if (score >= 40) {
      finalAdvice = "⚖️ <strong>Caminho com Atrito (Cuidado):</strong> Existem oportunidades (como cliques), mas há gargalos graves barrando as vendas (frete caro, saturação, etc). Entre apenas se você tiver um diferencial de roteiro muito forte.";
    } else {
      finalAdvice = "🛑 <strong>Sinal Vermelho (Pule):</strong> A matemática não fecha. Ou o mercado já saturou, ou o cliente desiste na hora de pagar. Não perca tempo gravando vídeos para este produto. Pule para o próximo.";
    }

    htmlOutput += `<div style="margin-top: 24px;">
      <h4 style="color: #f1f5f9; margin-bottom: 12px; font-size: 0.9rem;">💡 Conselho Final do Analista</h4>
      <div class="diagnostic-card" style="background: rgba(0, 242, 254, 0.05); border-color: rgba(0, 242, 254, 0.3); font-size: 0.9rem; border-left: 4px solid var(--tiktok-cyan);">
        ${finalAdvice}
      </div>
    </div>`;

    reasonsContainer.innerHTML = htmlOutput;
  }

  // Inicializar o primeiro cálculo
  calculateAndRender();
});
