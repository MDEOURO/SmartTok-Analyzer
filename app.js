document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('metricsForm');
  const periodBtns = document.querySelectorAll('.btn-period');
  let currentPeriod = '7d';

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

    const mainInput = document.getElementById(field);
    if (mainInput) {
      mainInput.addEventListener('input', () => calculateAndRender());
    }
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

  btnApplyVariation.addEventListener('click', () => {
    if (!activeField) return;

    const prefix = activeField === 'cartAdds' ? 'cart' : activeField;
    const hiddenDir = document.getElementById(`${prefix}DeltaDir`);
    const hiddenVal = document.getElementById(`${prefix}Delta`);
    const varText = document.getElementById(`${prefix}VarText`);
    const varBtn = document.getElementById(`${prefix}VarBtn`);

    hiddenDir.value = activeDir;
    // Garante que o valor salvo seja sempre positivo absoluto para evitar erros do tipo "- -3"
    const parsedVal = Math.abs(parseFloat(modalInputVal.value) || 0);
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
    calculateAndRender();
  });

  // Alternância de Período (7 dias / 30 dias)
  periodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      periodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriod = btn.dataset.period;
      calculateAndRender();
    });
  });

  // Evento de submit do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateAndRender();
  });

  // MATRIZ COMPLETA DE DIAGNÓSTICO E CAUSALIDADE PARA AFILIADOS
  function calculateAndRender() {
    const ctr = parseFloat(document.getElementById('ctr').value) || 0;
    const ctrDir = document.getElementById('ctrDeltaDir').value;
    const ctrDeltaVal = Math.abs(parseFloat(document.getElementById('ctrDelta').value) || 0);
    const ctrDelta = ctrDir === 'up' ? ctrDeltaVal : -ctrDeltaVal;
    
    const orders = parseInt(document.getElementById('orders').value) || 0;
    const ordersDir = document.getElementById('ordersDeltaDir').value;
    const ordersDeltaVal = Math.abs(parseInt(document.getElementById('ordersDelta').value) || 0);
    const ordersDelta = ordersDir === 'up' ? ordersDeltaVal : -ordersDeltaVal;
    
    const cartAdds = parseInt(document.getElementById('cartAdds').value) || 0;
    const cartDir = document.getElementById('cartDeltaDir').value;
    const cartDeltaVal = Math.abs(parseInt(document.getElementById('cartDelta').value) || 0);
    const cartDelta = cartDir === 'up' ? cartDeltaVal : -cartDeltaVal;
    
    const creators = parseInt(document.getElementById('creators').value) || 0;
    const creatorsDir = document.getElementById('creatorsDeltaDir').value;
    const creatorsDeltaVal = Math.abs(parseInt(document.getElementById('creatorsDelta').value) || 0);
    const creatorsDelta = creatorsDir === 'up' ? creatorsDeltaVal : -creatorsDeltaVal;

    // Métricas Derivadas
    const cartToSaleRate = cartAdds > 0 ? (orders / cartAdds) * 100 : 0;
    const ordersPerCreator = creators > 0 ? (orders / creators) : 0;

    // Atualizar os quadros de métricas derivadas
    document.getElementById('resCartToSale').innerText = cartToSaleRate.toFixed(1).replace('.', ',') + '%';
    document.getElementById('resCartsPerOrder').innerText = orders > 0 ? (cartAdds / orders).toFixed(2).replace('.', ',') : '0';
    document.getElementById('resOrdersPerCreator').innerText = ordersPerCreator.toFixed(2).replace('.', ',');
    document.getElementById('resCartsPerCreator').innerText = creators > 0 ? (cartAdds / creators).toFixed(2).replace('.', ',') : '0';

    let score = 50;
    const reasons = [];

    // === CENÁRIO 1: ANÁLISE DA CONCORRÊNCIA E ESPAÇO PARA O AFILIADO ===
    if (creatorsDelta < 0 && ordersDelta > 0) {
      score += 25;
      reasons.push(`🔥 <strong>Oportunidade de Ouro no Orgânico:</strong> Outros criadores desistiram do produto (menos ${Math.abs(creatorsDelta)} criadores), mas as vendas subiram (+${ordersDelta}). <em>Por quê?</em> A demanda do produto está aquecida, mas faltam afiliados fazendo novos vídeos. É o momento perfeito para você gravar.`);
    } else if (creatorsDelta > 0 && ordersDelta <= 0) {
      score -= 20;
      reasons.push(`⚠️ <strong>Mercado Saturado de Vídeos:</strong> Entraram novos criadores (+${creatorsDelta}), mas as vendas continuam estagnadas ou caindo (${ordersDelta}). <em>Por quê?</em> O TikTok está lotado do mesmo produto e a audiência cansou de ver os mesmos vídeos.`);
    } else if (creatorsDelta < 0 && ordersDelta < 0) {
      score -= 25;
      reasons.push(`📉 <strong>Produto Entrando em Declínio:</strong> Tanto o número de criadores (-${Math.abs(creatorsDelta)}) quanto as vendas (-${Math.abs(ordersDelta)}) estão caindo. <em>Por quê?</em> O produto perdeu o hype no TikTok Shop.`);
    }

    // === CENÁRIO 2: ANÁLISE DE VONTADE DE CLICAR (CTR) ===
    if (ctr >= 5.0 && ctrDelta > 0) {
      score += 20;
      reasons.push(`🎥 <strong>Alta Atratividade Visual (CTR ${ctr}%, +${ctrDelta}%):</strong> As pessoas sentem desejo imediato ao ver o vídeo. <em>Por quê?</em> O produto resolve um problema visual ou gera forte curiosidade no feed. Excelente para viralizar.`);
    } else if (ctr < 3.5 || ctrDelta < 0) {
      score -= 15;
      reasons.push(`❌ <strong>Baixa Retenção do Vídeo (CTR ${ctr}%, ${ctrDelta}%):</strong> O produto não chama atenção rápida. <em>Por quê?</em> Ou a thumb/abertura do vídeo não chama atenção, ou o produto é genérico demais.`);
    }

    // === CENÁRIO 3: ANÁLISE DO CHECKOUT E INTENÇÃO DE COMPRA (CARRINHO) ===
    if (cartAdds > 0 && cartToSaleRate >= 30) {
      score += 20;
      reasons.push(`💳 <strong>Checkout Altamente Convertedor (${cartToSaleRate.toFixed(1)}% do carrinho fecha compra):</strong> 1 em cada 3 pessoas que colocam no carrinho compram. <em>Por quê?</em> O preço da loja é justo e a oferta no TikTok Shop está muito atrativa.`);
    } else if (cartAdds > 0 && cartToSaleRate < 15) {
      score -= 20;
      reasons.push(`🛒 <strong>Gargalo Severo de Checkout (${cartToSaleRate.toFixed(1)}% de conversão do carrinho):</strong> Muita gente coloca no carrinho (${cartAdds}), mas poucos compram (${orders}). <em>Por quê?</em> O frete está alto ou o comprador desiste na hora de pagar. <strong>AVISO: NÃO RODE TRÁFEGO PAGO NESTE PRODUTO!</strong>`);
    }

    // === CENÁRIO 4: PRODUTIVIDADE POR CRIADOR ===
    if (creators > 0 && ordersPerCreator < 0.8) {
      score -= 10;
      reasons.push(`👥 <strong>Baixa Conversão por Afiliado (Média de ${ordersPerCreator.toFixed(2)} pedidos/criador):</strong> Os criadores ativos estão gerando poucos resultados. <em>Por quê?</em> O produto precisa de angulação de vendas diferente da que está sendo usada.`);
    }

    // Ajuste final da nota
    score = Math.min(100, Math.max(0, score));

    // Elementos da interface
    const badge = document.getElementById('verdictBadge');
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreText = document.getElementById('scoreText');
    const reasonsList = document.getElementById('reasonsList');

    scoreText.textContent = score;
    scoreCircle.setAttribute('stroke-dasharray', `${score}, 100`);

    if (score >= 70) {
      badge.className = 'verdict-badge status-success';
      badge.textContent = 'EXCELENTE PRODUTO PARA AFILIADOS';
      scoreCircle.style.stroke = '#10b981';
    } else if (score >= 45) {
      badge.className = 'verdict-badge status-warning';
      badge.textContent = 'PRODUTO REGULAR (RISCOS / ATENÇÃO)';
      scoreCircle.style.stroke = '#f59e0b';
    } else {
      badge.className = 'verdict-badge status-danger';
      badge.textContent = 'NÃO RECOMENDADO PARA INVESTIR';
      scoreCircle.style.stroke = '#ef4444';
    }

    // Renderizar justificativas causais
    reasonsList.innerHTML = reasons.map(r => `<li>${r}</li>`).join('');
  }

  // Inicializar o primeiro cálculo
  calculateAndRender();
});
