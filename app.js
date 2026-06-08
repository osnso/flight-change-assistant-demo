const $ = (id) => document.getElementById(id);

const fields = [
  'orderId', 'flightNo', 'flightStatus', 'delayMinutes', 'transferBufferMinutes',
  'coreEventBufferMinutes', 'alternativeFlights', 'changeCost', 'travelerCount',
  'childrenCount', 'elderCount', 'complaintCount', 'memberLevel', 'historyPreference',
  'hasFlight', 'hasTrain', 'hasHotel', 'hasTicket', 'hasShow', 'hasTransfer'
];

const scenarios = {
  familyShow: {
    orderId: 'T202606080001', flightNo: 'MU1234', flightStatus: '延误', delayMinutes: 90,
    transferBufferMinutes: 70, coreEventBufferMinutes: 240, alternativeFlights: 2, changeCost: 350,
    travelerCount: 4, childrenCount: 1, elderCount: 0, complaintCount: 1,
    memberLevel: '高价值会员', historyPreference: '偏好保行程',
    hasFlight: true, hasTrain: false, hasHotel: true, hasTicket: true, hasShow: true, hasTransfer: true
  },
  cancelHighValue: {
    orderId: 'T202606080087', flightNo: 'CA8888', flightStatus: '取消', delayMinutes: 240,
    transferBufferMinutes: 90, coreEventBufferMinutes: 210, alternativeFlights: 1, changeCost: 900,
    travelerCount: 2, childrenCount: 0, elderCount: 1, complaintCount: 2,
    memberLevel: '高价值会员', historyPreference: '偏好改签',
    hasFlight: true, hasTrain: true, hasHotel: true, hasTicket: true, hasShow: false, hasTransfer: true
  },
  priceSensitive: {
    orderId: 'T202606080132', flightNo: '9C6789', flightStatus: '延误', delayMinutes: 35,
    transferBufferMinutes: 180, coreEventBufferMinutes: 480, alternativeFlights: 4, changeCost: 480,
    travelerCount: 3, childrenCount: 0, elderCount: 0, complaintCount: 0,
    memberLevel: '普通会员', historyPreference: '偏好退票',
    hasFlight: true, hasTrain: false, hasHotel: true, hasTicket: true, hasShow: false, hasTransfer: false
  }
};

function numberValue(id) {
  return Number($(id).value || 0);
}

function getScene() {
  return {
    orderId: $('orderId').value,
    flightNo: $('flightNo').value,
    flightStatus: $('flightStatus').value,
    delayMinutes: numberValue('delayMinutes'),
    transferBufferMinutes: numberValue('transferBufferMinutes'),
    coreEventBufferMinutes: numberValue('coreEventBufferMinutes'),
    alternativeFlights: numberValue('alternativeFlights'),
    changeCost: numberValue('changeCost'),
    travelerCount: numberValue('travelerCount'),
    childrenCount: numberValue('childrenCount'),
    elderCount: numberValue('elderCount'),
    complaintCount: numberValue('complaintCount'),
    memberLevel: $('memberLevel').value,
    historyPreference: $('historyPreference').value,
    hasFlight: $('hasFlight').checked,
    hasTrain: $('hasTrain').checked,
    hasHotel: $('hasHotel').checked,
    hasTicket: $('hasTicket').checked,
    hasShow: $('hasShow').checked,
    hasTransfer: $('hasTransfer').checked
  };
}

function setScene(data) {
  Object.entries(data).forEach(([key, value]) => {
    const el = $(key);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = Boolean(value);
    else el.value = value;
  });
  render();
}

function levelByScore(score) {
  if (score >= 75) return '高';
  if (score >= 45) return '中';
  return '低';
}

function inferProfile(scene) {
  let timeScore = 0;
  if (scene.flightStatus === '取消' || scene.flightStatus === '备降') timeScore += 45;
  if (scene.delayMinutes >= 120) timeScore += 35;
  else if (scene.delayMinutes >= 60) timeScore += 25;
  else if (scene.delayMinutes >= 30) timeScore += 12;
  if (scene.hasShow) timeScore += 25;
  if (scene.hasTransfer) timeScore += 12;
  if (scene.coreEventBufferMinutes <= scene.delayMinutes + 120) timeScore += 25;
  if (scene.transferBufferMinutes <= scene.delayMinutes + 30) timeScore += 18;

  let priceScore = 0;
  if (scene.memberLevel === '普通会员') priceScore += 25;
  if (scene.historyPreference === '偏好退票') priceScore += 35;
  if (scene.changeCost >= 700) priceScore += 30;
  else if (scene.changeCost >= 300) priceScore += 18;
  if (scene.travelerCount >= 4) priceScore += 12;

  let complexityScore = 0;
  ['hasFlight','hasTrain','hasHotel','hasTicket','hasShow','hasTransfer'].forEach(k => { if (scene[k]) complexityScore += 13; });
  if (scene.travelerCount >= 4) complexityScore += 12;
  if (scene.childrenCount > 0) complexityScore += 8;
  if (scene.elderCount > 0) complexityScore += 10;

  const behavior = scene.historyPreference === '无历史记录'
    ? (scene.complaintCount > 0 ? '需谨慎安抚' : '无明显偏好')
    : scene.historyPreference;

  const tags = [];
  if (scene.childrenCount > 0) tags.push('亲子出行');
  if (scene.elderCount > 0) tags.push('老人出行');
  if (scene.memberLevel === '高价值会员') tags.push('高价值会员');
  if (scene.complaintCount > 0) tags.push('高敏感客户');
  if (scene.hasShow) tags.push('关注演出履约');
  if (scene.hasHotel) tags.push('关注酒店入住');
  if (levelByScore(timeScore) === '高') tags.push('时间高敏');
  if (levelByScore(priceScore) === '高') tags.push('价格高敏');
  if (levelByScore(complexityScore) === '高') tags.push('复杂行程');

  return {
    timeSensitivity: levelByScore(timeScore),
    priceSensitivity: levelByScore(priceScore),
    itineraryComplexity: levelByScore(complexityScore),
    behavior,
    tags,
    scores: { timeScore, priceScore, complexityScore }
  };
}

function detectRisk(scene, profile) {
  let riskScore = 0;
  const reasons = [];

  if (scene.flightStatus === '取消') { riskScore += 85; reasons.push('航班取消，原计划无法直接履约'); }
  if (scene.flightStatus === '备降') { riskScore += 70; reasons.push('航班备降，落地城市与后续履约存在不确定性'); }
  if (scene.delayMinutes >= 180) { riskScore += 60; reasons.push('延误超过 3 小时'); }
  else if (scene.delayMinutes >= 90) { riskScore += 42; reasons.push('延误超过 90 分钟'); }
  else if (scene.delayMinutes >= 30) { riskScore += 18; reasons.push('延误超过 30 分钟，达到预警窗口'); }

  if (scene.hasShow && scene.coreEventBufferMinutes <= scene.delayMinutes + 120) {
    riskScore += 38; reasons.push('可能影响不可轻易改期的演出或核心项目');
  }
  if (scene.hasTransfer && scene.transferBufferMinutes <= scene.delayMinutes + 30) {
    riskScore += 24; reasons.push('可能影响接送/集合时间');
  }
  if (profile.itineraryComplexity === '高') { riskScore += 15; reasons.push('订单资源结构复杂，联动履约成本高'); }
  if (profile.timeSensitivity === '高') { riskScore += 12; reasons.push('客户时间敏感度高，需要前置沟通'); }

  const riskLevel = riskScore >= 90 ? '高风险' : riskScore >= 45 ? '中风险' : '低风险';
  return { riskLevel, riskScore, reasons };
}

function riskClass(level) {
  if (level.includes('高')) return 'high';
  if (level.includes('中')) return 'mid';
  return 'low';
}

function buildSolutions(scene, profile, risk) {
  const base = [
    {
      type: 'A',
      title: '稳妥保行程：保留原行程，联动资源延后',
      cost: '低',
      actions: ['持续监控航班状态，每 15 分钟刷新一次', '同步地接/接送服务延后等待', '通知酒店保留房间并备注航变晚到', '确认核心项目入场/预约是否仍可覆盖'],
      reason: '适合延误可控、后续资源可衔接的场景，优先减少客户决策成本。'
    },
    {
      type: 'B',
      title: '调整替代：改签/改交通并重排行程',
      cost: '中',
      actions: ['查询可替代航班或高铁车次', '计算改签成本和预计抵达时间', '调整团队集合、景点游玩和用餐顺序', '向客户说明差异和需确认事项'],
      reason: '适合时间敏感或原航班不稳定的场景，用一定成本换取行程确定性。'
    },
    {
      type: 'C',
      title: '兜底补偿：资源退改、权益申请与专员升级',
      cost: '可控',
      actions: ['确认无法履约资源的退改规则', '申请门票/演出/酒店改期或退款', '触发高风险订单专员升级', '沉淀航变原因和客户诉求，避免二次投诉'],
      reason: '适合航班取消、核心项目无法履约或客户明确不接受替代安排的场景。'
    }
  ];

  return base.map(item => {
    let score = 50;
    if (item.type === 'A') {
      if (risk.riskLevel === '低风险') score += 30;
      if (risk.riskLevel === '中风险') score += 18;
      if (profile.behavior.includes('保行程')) score += 18;
      if (profile.priceSensitivity === '高') score += 10;
      if (scene.flightStatus === '取消' || scene.delayMinutes >= 180) score -= 35;
    }
    if (item.type === 'B') {
      if (profile.timeSensitivity === '高') score += 28;
      if (scene.alternativeFlights > 0) score += 22;
      if (profile.behavior.includes('改签')) score += 18;
      if (scene.changeCost >= 700 && profile.priceSensitivity === '高') score -= 22;
      if (scene.flightStatus === '取消') score += 12;
    }
    if (item.type === 'C') {
      if (scene.flightStatus === '取消') score += 35;
      if (risk.riskLevel === '高风险') score += 22;
      if (profile.behavior.includes('退票')) score += 18;
      if (profile.priceSensitivity === '高') score += 10;
      if (profile.timeSensitivity === '高' && scene.alternativeFlights > 0) score -= 12;
    }

    const script = buildScript(item, scene, profile, risk);
    return { ...item, score: Math.max(0, Math.min(100, score)), script };
  }).sort((a, b) => b.score - a.score);
}

function buildScript(solution, scene, profile, risk) {
  const care = profile.tags.includes('亲子出行')
    ? '考虑到您这次有孩子同行，我们会优先减少等待和来回折腾。'
    : profile.tags.includes('老人出行')
      ? '考虑到同行有老人，我们会优先选择更稳妥、少折腾的安排。'
      : '我们会优先保障您的整体出行体验。';

  const impact = risk.reasons.slice(0, 2).join('；') || '目前航变影响较小';
  if (solution.type === 'A') {
    return `您好，关注到您订单 ${scene.orderId} 关联航班 ${scene.flightNo} 当前状态为${scene.flightStatus}，预计变化约 ${scene.delayMinutes} 分钟。${care}目前判断：${impact}。我们已建议同步接送/地接和酒店保留安排，并持续监控航班动态；如后续影响扩大，会第一时间为您切换备选方案。`;
  }
  if (solution.type === 'B') {
    return `您好，您的航班 ${scene.flightNo} 出现${scene.flightStatus}，为降低对后续行程的影响，我们已为您预查可替代交通方案。${care}如果您希望更稳妥抵达，我们可以协助评估改签/改交通方案，同时同步调整酒店、接送和游玩顺序，相关成本和时间差异会先与您确认后再处理。`;
  }
  return `您好，因航班 ${scene.flightNo} 当前${scene.flightStatus}可能影响部分行程履约，我们会先为您兜底确认资源退改和改期可能性。${care}如确实无法按原计划体验，我们将协助申请可改期、可退款或补偿类处理，并升级专员跟进，尽量降低您的损失和沟通成本。`;
}

function renderSummary(scene, profile, risk) {
  $('summary').innerHTML = `
    <div class="metric"><div class="label">风险等级</div><div class="value"><span class="badge ${riskClass(risk.riskLevel)}">${risk.riskLevel}</span></div><div class="desc">综合风险分 ${risk.riskScore}</div></div>
    <div class="metric"><div class="label">航班状态</div><div class="value">${scene.flightStatus}</div><div class="desc">${scene.flightNo} / 变化 ${scene.delayMinutes} 分钟</div></div>
    <div class="metric"><div class="label">预警判断</div><div class="value">${scene.delayMinutes >= 30 || scene.flightStatus !== '延误' ? '触发' : '未触发'}</div><div class="desc">提前 30 分钟预警规则</div></div>
    <div class="metric"><div class="label">最主要影响</div><div class="value">${risk.reasons[0] || '暂无明显影响'}</div><div class="desc">${risk.reasons.slice(1, 3).join('；') || '持续监控即可'}</div></div>
  `;
}

function renderProfile(profile) {
  const cards = [
    ['时间敏感度', profile.timeSensitivity, `时间分 ${profile.scores.timeScore}。由航变状态、延误时长、演出/接送缓冲推断。`],
    ['价格敏感度', profile.priceSensitivity, `价格分 ${profile.scores.priceScore}。由会员等级、历史偏好、改签成本推断。`],
    ['行程复杂度', profile.itineraryComplexity, `复杂度分 ${profile.scores.complexityScore}。由资源类型、人数、亲子/老人推断。`],
    ['过往航变行为', profile.behavior, '由历史航变选择与投诉记录推断。']
  ];
  $('profile').innerHTML = cards.map(([label, value, desc]) => `
    <div class="profile-card"><div class="label">${label}</div><strong>${value}</strong><div class="desc">${desc}</div></div>
  `).join('');
  $('tags').innerHTML = profile.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
}

function renderSolutions(solutions) {
  $('solutions').innerHTML = solutions.map((s, index) => `
    <article class="solution-card ${index === 0 ? 'recommended' : ''}">
      <div class="solution-header">
        <h3>${index === 0 ? '⭐ 最优推荐 · ' : ''}${s.title}</h3>
        <div class="score">${s.score} 分</div>
      </div>
      <p class="reason">${s.reason}</p>
      <ul class="actions">${s.actions.map(a => `<li>${a}</li>`).join('')}</ul>
      <div class="script">${s.script}</div>
      <div class="card-footer"><button onclick="copyScript(${JSON.stringify(s.script).replace(/"/g, '&quot;')})">复制话术</button></div>
    </article>
  `).join('');
}

function copyScript(text) {
  navigator.clipboard?.writeText(text);
  const toast = $('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}
window.copyScript = copyScript;

function render() {
  const scene = getScene();
  const profile = inferProfile(scene);
  const risk = detectRisk(scene, profile);
  const solutions = buildSolutions(scene, profile, risk);
  renderSummary(scene, profile, risk);
  renderProfile(profile);
  renderSolutions(solutions);
}

fields.forEach(id => {
  const el = $(id);
  if (!el) return;
  el.addEventListener('input', render);
  el.addEventListener('change', render);
});

document.querySelectorAll('[data-scenario]').forEach(btn => {
  btn.addEventListener('click', () => setScene(scenarios[btn.dataset.scenario]));
});

render();
