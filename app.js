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

  // Seleciona automaticamente o texto ao clicar no input (para não precisar apagar)
  const allInputs = document.querySelectorAll('.tt-main-input, #modalInputVal');
  allInputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.select();
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
    const ctr = parseFloat(document.getElementById('ctr').value) || 0;
    const ctrDir = document.getElementById('ctrDeltaDir').value;
    const ctrDeltaVal = Math.abs(parseFloat(document.getElementById('ctrDelta').value) || 0);
    const ctrDelta = ctrDir === 'up' ? ctrDeltaVal : -ctrDeltaVal;
    
    const ordersBase = parseFloat(document.getElementById('orders').value) || 0;
    const ordersMult = parseInt(document.getElementById('ordersMult').value) || 1;
    const orders = Math.floor(ordersBase * ordersMult);
    const ordersDir = document.getElementById('ordersDeltaDir').value;
    const ordersDeltaVal = Math.abs(parseInt(document.getElementById('ordersDelta').value) || 0);
    const ordersDelta = ordersDir === 'up' ? ordersDeltaVal : -ordersDeltaVal;
    
    const cartAddsBase = parseFloat(document.getElementById('cartAdds').value) || 0;
    const cartAddsMult = parseInt(document.getElementById('cartAddsMult').value) || 1;
    const cartAdds = Math.floor(cartAddsBase * cartAddsMult);
    const cartDir = document.getElementById('cartDeltaDir').value;
    const cartDeltaVal = Math.abs(parseInt(document.getElementById('cartDelta').value) || 0);
    const cartDelta = cartDir === 'up' ? cartDeltaVal : -cartDeltaVal;
    
    const creatorsBase = parseFloat(document.getElementById('creators').value) || 0;
    const creatorsMult = parseInt(document.getElementById('creatorsMult').value) || 1;
    const creators = Math.floor(creatorsBase * creatorsMult);
    const creatorsDir = document.getElementById('creatorsDeltaDir').value;
    const creatorsDeltaVal = Math.abs(parseInt(document.getElementById('creatorsDelta').value) || 0);
    const creatorsDelta = creatorsDir === 'up' ? creatorsDeltaVal : -creatorsDeltaVal;

    // Métricas Derivadas
    // Se orders for maior que cartAdds (ex: comprou direto sem carrinho), limitamos a 100% para não gerar % bizarras
    const cartToSaleRate = cartAdds > 0 ? Math.min(100, (orders / cartAdds) * 100) : 0;
    const ordersPerCreator = creators > 0 ? (orders / creators) : 0;
    const commission = parseFloat(document.getElementById('commission').value) || 0;
    const totalCommission = orders * commission;

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

    // === 1. VOLUME E PREVISIBILIDADE ===
    const isDroppingHeavily = ordersDir === 'down' && ordersDelta > (orders * 0.3);

    if (orders === 0) {
      score -= 20;
      weakPoints.push(`<strong>Zero Vendas Registradas:</strong> O produto não possui nenhuma validação de demanda no período.`);
      recommendations.push(`<strong>Não Escalar:</strong> Sem nenhuma venda, fazer anúncios ou vídeos em massa é desperdício de tempo e dinheiro.`);
    } else if (orders < 10) {
      score -= 10;
      weakPoints.push(`<strong>Volume Baixo (${orders} pedidos)</strong> Produto com pouquíssima saída. Base pequena para prever qualquer escala.`);
      recommendations.push(`<strong>Teste Rápido:</strong> Grave no máximo 1 a 3 vídeos. Se não vender em 5 dias, descarte.`);
    } else if (orders >= 50) {
      if (isDroppingHeavily) {
        score -= 5;
        weakPoints.push(`<strong>Queda Aguda de Demanda:</strong> Apesar do volume de ${orders}, as vendas caíram ${ordersDelta}. O produto está perdendo força rapidamente.`);
        recommendations.push(`<strong>Cuidado ao Escalar:</strong> A onda do produto parece estar passando. Não aumente o ritmo de postagens até entender essa queda.`);
      } else {
        score += 15;
        strongPoints.push(`<strong>Demanda Consolidada (${orders} pedidos)</strong> Produto validado e vendendo em escala de forma saudável.`);
        recommendations.push(`<strong>Momento de Escalar:</strong> A demanda está validada. Aumente a frequência de postagens sem medo.`);
      }
    } else {
      if (isDroppingHeavily) {
        weakPoints.push(`<strong>Tração Perdendo Força:</strong> Tem ${orders} pedidos, mas despencou ${ordersDelta}. Atenção à saturação.`);
      } else {
        score += 5;
        strongPoints.push(`<strong>Tração Inicial (${orders} pedidos)</strong> Apresenta sinais consistentes de validação de vendas.`);
        recommendations.push(`<strong>Aumente a Tração:</strong> Teste novos formatos de vídeo para achar um "campeão" e saltar as vendas.`);
      }
    }

    // === 2. ATRATIVIDADE (CTR) ===
    let varText = ctrDelta > 0 ? `+${ctrDelta}%` : (ctrDelta < 0 ? `-${ctrDelta}%` : `estável`);
    if (ctr >= 5.0) {
      score += 20;
      strongPoints.push(`<strong>Alta Atratividade (CTR ${ctr.toFixed(1)}%, ${varText})</strong> Excelente. Desperta desejo imediato e atrai cliques facilmente.`);
      recommendations.push(`<strong>Foque no Hook (Gancho):</strong> O clique é fácil. Garanta atenção nos primeiros 3s de vídeo para reter esse público curioso.`);
    } else if (ctr < 3.5 && ctr > 0) {
      score -= 15;
      weakPoints.push(`<strong>Baixa Retenção (CTR ${ctr.toFixed(1)}%)</strong> Produto não chama atenção. Exigirá uma angulação de vídeo muito criativa e difícil.`);
      recommendations.push(`<strong>Mude a Abordagem Visual:</strong> O produto parece chato no feed. Use thumbs muito apelativas ou uma promessa forte nos 3s.`);
    } else if (ctr > 0) {
      strongPoints.push(`<strong>Atratividade Saudável (CTR ${ctr.toFixed(1)}%)</strong> Taxa de clique na média do mercado. Desperta interesse normal.`);
    }

    // === 3. CONCORRÊNCIA E OCEANO AZUL ===
    if (creators > 0) {
      if (creators <= 5) {
        score += 20;
        strongPoints.push(`<strong>Oceano Azul (${creators} criadores)</strong> Concorrência quase nula. O caminho está livre se você viralizar.`);
      } else if (creators > 20) {
        score -= 20;
        weakPoints.push(`<strong>Alta Concorrência (${creators} ativos)</strong> Mercado saturado dominado por muitos afiliados competindo pela mesma atenção.`);
        recommendations.push(`<strong>Diferenciação Extrema:</strong> Só entre nessa briga se a sua qualidade de edição/roteiro esmagar a concorrência.`);
      } else {
        strongPoints.push(`<strong>Concorrência Moderada (${creators} ativos)</strong> Há disputa, mas vídeos bem feitos ainda conseguem se destacar com folga.`);
      }
    }

    // === 4. COMPORTAMENTO DE CHECKOUT ===
    if (cartAdds > 0) {
      if (orders === 0) {
         score -= 30;
         weakPoints.push(`<strong>ALERTA GRAVE NO CARRINHO:</strong> ${cartAdds} pessoas adicionaram ao carrinho e NENHUMA comprou. Há um bloqueio crítico.`);
         recommendations.push(`<strong>Audite o Checkout Imediatamente:</strong> Simule uma compra. Verifique se o frete está abusivo ou se o sistema da loja está quebrado antes de perder tempo.`);
      } else if (cartAdds < 20) {
         weakPoints.push(`<strong>Amostra Imprevisível</strong> Só ${cartAdds} carrinhos no total. Base muito pequena para cravar uma taxa de conversão segura.`);
      } else {
         if (cartToSaleRate >= 30) {
            score += 15;
            strongPoints.push(`<strong>Conversão Forte (${cartToSaleRate.toFixed(1)}%)</strong> Quem adiciona ao carrinho realmente compra. Oferta e frete estão irresistíveis.`);
         } else if (cartToSaleRate < 15) {
            score -= 15;
            weakPoints.push(`<strong>Gargalo no Checkout (${cartToSaleRate.toFixed(1)}%)</strong> Muitos clicam no carrinho, quase ninguém paga. Susto com o preço ou frete alto.`);
            recommendations.push(`<strong>Filtro de Curiosos:</strong> Revele o preço ou frete já no final do vídeo para filtrar quem não tem intenção de pagar.`);
         } else {
            strongPoints.push(`<strong>Conversão Padrão (${cartToSaleRate.toFixed(1)}%)</strong> A conversão da loja (do carrinho para a venda) está dentro da normalidade (15-30%).`);
         }
      }
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
