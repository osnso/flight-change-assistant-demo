const $ = (id) => document.getElementById(id);

const fields = [
  'orderId', 'flightNo', 'flightStatus', 'delayMinutes', 'transferBufferMinutes',
  'coreEventBufferMinutes', 'alternativeFlights', 'changeCost', 'travelerCount',
  'childrenCount', 'elderCount', 'complaintCount', 'memberLevel', 'historyPreference',
  'hasFlight', 'hasTrain', 'hasHotel', 'hasTicket', 'hasShow', 'hasTransfer',
  'departCity', 'arriveCity', 'highSpeedRailStation'
];

// ── 预设场景数据 ──
const scenarios = {
  familyShow: {
    orderId: 'T202606080001', flightNo: 'MU1234', flightStatus: '延误', delayMinutes: 90,
    transferBufferMinutes: 70, coreEventBufferMinutes: 240, alternativeFlights: 2, changeCost: 350,
    travelerCount: 4, childrenCount: 1, elderCount: 0, complaintCount: 1,
    memberLevel: '高价值会员', historyPreference: '偏好保行程',
    hasFlight: true, hasTrain: false, hasHotel: true, hasTicket: true, hasShow: true, hasTransfer: true,
    departCity: '上海', arriveCity: '北京', highSpeedRailStation: '北京南'
  },
  cancelHighValue: {
    orderId: 'T202606080087', flightNo: 'CA8888', flightStatus: '取消', delayMinutes: 240,
    transferBufferMinutes: 90, coreEventBufferMinutes: 210, alternativeFlights: 1, changeCost: 900,
    travelerCount: 2, childrenCount: 0, elderCount: 1, complaintCount: 2,
    memberLevel: '高价值会员', historyPreference: '偏好改签',
    hasFlight: true, hasTrain: true, hasHotel: true, hasTicket: true, hasShow: false, hasTransfer: true,
    departCity: '北京', arriveCity: '成都', highSpeedRailStation: '成都东'
  },
  priceSensitive: {
    orderId: 'T202606080132', flightNo: '9C6789', flightStatus: '延误', delayMinutes: 35,
    transferBufferMinutes: 180, coreEventBufferMinutes: 480, alternativeFlights: 4, changeCost: 480,
    travelerCount: 3, childrenCount: 0, elderCount: 0, complaintCount: 0,
    memberLevel: '普通会员', historyPreference: '偏好退票',
    hasFlight: true, hasTrain: false, hasHotel: true, hasTicket: true, hasShow: false, hasTransfer: false,
    departCity: '深圳', arriveCity: '重庆', highSpeedRailStation: '重庆西'
  }
};

// ── 备选交通数据库 ──
const transportDB = {
  '上海→北京': [
    { type: '高铁', label: '高铁 G2', route: '上海虹桥 → 北京南', departTime: '07:00', arriveTime: '11:32', duration: '4h32min', price: 626, seats: 128, bookingRef: null },
    { type: '高铁', label: '高铁 G6', route: '上海虹桥 → 北京南', departTime: '08:00', arriveTime: '12:28', duration: '4h28min', price: 698, seats: 56, bookingRef: null },
    { type: '高铁', label: '高铁 G8', route: '上海虹桥 → 北京南', departTime: '09:00', arriveTime: '13:12', duration: '4h12min', price: 736, seats: 23, bookingRef: null },
    { type: '联运', label: '高铁+飞机联程', route: '上海虹桥→南京南(高铁) + 南京禄口→北京大兴(飞机)', departTime: '06:30', arriveTime: '11:00', duration: '4h30min', price: 1080, seats: 15, bookingRef: null }
  ],
  '北京→成都': [
    { type: '高铁', label: '高铁 G307', route: '北京西 → 成都东', departTime: '08:30', arriveTime: '15:36', duration: '7h06min', price: 778, seats: 89, bookingRef: null },
    { type: '高铁', label: '高铁 G571', route: '北京西 → 成都东', departTime: '09:20', arriveTime: '16:42', duration: '7h22min', price: 698, seats: 176, bookingRef: null },
    { type: '高铁', label: '高铁 G89', route: '北京西 → 成都东', departTime: '06:00', arriveTime: '12:38', duration: '6h38min', price: 864, seats: 0, bookingRef: null },
    { type: '联运', label: '高铁+飞机联程', route: '北京朝阳→沈阳北(高铁) + 沈阳桃仙→成都天府(飞机)', departTime: '07:30', arriveTime: '12:15', duration: '4h45min', price: 1280, seats: 8, bookingRef: null }
  ],
  '深圳→重庆': [
    { type: '高铁', label: '高铁 G1312', route: '深圳北 → 重庆西', departTime: '07:50', arriveTime: '13:52', duration: '6h02min', price: 645, seats: 234, bookingRef: null },
    { type: '高铁', label: '高铁 G216', route: '深圳北 → 重庆西', departTime: '09:00', arriveTime: '12:06', duration: '3h06min', price: 480, seats: 32, bookingRef: null },
    { type: '联运', label: '高铁+飞机联程', route: '深圳北→广州南(高铁) + 广州白云→重庆江北(飞机)', departTime: '08:00', arriveTime: '11:30', duration: '3h30min', price: 960, seats: 42, bookingRef: null }
  ]
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
    hasTransfer: $('hasTransfer').checked,
    departCity: $('departCity').value,
    arriveCity: $('arriveCity').value,
    highSpeedRailStation: $('highSpeedRailStation').value
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

// ── 客户画像推断（保留原逻辑） ──
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

// ── 场景分类 ──
function classifyScene(scene) {
  const isSevere = scene.flightStatus === '取消' || scene.flightStatus === '备降';
  if (isSevere || scene.delayMinutes >= 180) {
    return {
      category: '严重航变',
      level: 'severe',
      summary: '航班取消/备降或延误超过3小时，原计划无法直接履约',
      priority: '对商：资源退改 → 索赔协调 → 备选交通申请 | 对客：退改/补偿 → 备选方案推荐'
    };
  }
  if (scene.delayMinutes >= 60) {
    return {
      category: '中度延误',
      level: 'mid',
      summary: `延误${scene.delayMinutes}分钟，可能影响后续资源衔接`,
      priority: '对商：资源延后调整 → 备选交通查询 → 供应商及时沟通 | 对客：主动改签 → 备选方案告知'
    };
  }
  return {
    category: '轻微延误',
    level: 'light',
    summary: `延误${scene.delayMinutes}分钟，影响可控`,
    priority: '对商：协调资源等待 → 通知供应商延后 | 对客：安抚告知 → 等待确认'
  };
}

// ── 双轨方案生成 ──
function buildDualSolutions(scene, profile, category) {
  const care = profile.tags.includes('亲子出行')
    ? '考虑到您这次有孩子同行，我们会优先减少等待和来回折腾。'
    : profile.tags.includes('老人出行')
      ? '考虑到同行有老人，我们会优先选择更稳妥、少折腾的安排。'
      : '我们会优先保障您的整体出行体验。';

  let supplierSolutions = [];
  let customerSolutions = [];

  if (category.level === 'light') {
    // 轻微延误
    supplierSolutions = [
      { order: 1, type: 'SUP', title: '协调接送/地接资源等待', detail: `立即联系接送服务商和酒店，告知航班预计延误${scene.delayMinutes}分钟，请其调整等待时间。同步确认资源延后无需额外费用。`, link: '→ 关联对客方案①' },
      { order: 2, type: 'SUP', title: '通知供应商延后备餐/入场', detail: `通知演出/景点供应商延迟入场时间${scene.delayMinutes}分钟，确认预约仍有效。如产生取消费用需协调减免。`, link: '→ 关联对客方案②' },
      { order: 3, type: 'SUP', title: '记录工单，持续监控航变', detail: '在系统中建立航变工单，设定每15分钟自动刷新航班状态。如延误继续扩大，自动升级处理流程。', link: '→ 关联对客方案③' }
    ];
    customerSolutions = [
      { order: 1, type: 'CUS', title: '安抚告知，主动沟通', detail: `${scene.flightNo}预计延误${scene.delayMinutes}分钟。${care}建议您正常前往机场，我们会持续关注并同步最新动态。`, script: `您好，关注到您订单 ${scene.orderId} 关联航班 ${scene.flightNo} 当前延误约 ${scene.delayMinutes} 分钟。${care}目前影响可控，我们已经协调好接送/地接资源等候，建议您保持原计划前往机场，如有进一步变化会第一时间通知您。`, link: '← 关联对商方案①' },
      { order: 2, type: 'CUS', title: '保留原行程，确认后续资源', detail: '确认酒店保留房间、演出/景点预约延后可用。无需额外操作，保持原行程不变。', script: `针对您订单中的酒店、演出和景点安排，我们已与供应商确认可延后至航班到达后使用，您无需担心行程衔接问题。`, link: '← 关联对商方案②' },
      { order: 3, type: 'CUS', title: '备选方案预告', detail: '如延误扩大，可选择的应对方案：① 改签后续航班 ② 转为高铁出行。提前向客户说明以降低焦虑。', script: `为了以防万一，我们也为您查询了后续备选交通方案。如延误继续扩大，我们可以协助改签其他航班或安排高铁出行，届时再与您确认。`, link: '← 关联对商方案③' }
    ];
  } else if (category.level === 'mid') {
    // 中度延误
    supplierSolutions = [
      { order: 1, type: 'SUP', title: '资源延后调整与重排', detail: `评估延误${scene.delayMinutes}分钟对后续资源（酒店入住、演出入场、景点预约）的影响，逐一与供应商协调延后或调整时间。`, link: '→ 关联对客方案②' },
      { order: 2, type: 'SUP', title: '查询备选交通并评估成本', detail: `查询高铁及联运备选方案（已读取目的地：${scene.arriveCity}），计算改签/退票成本，评估抵达时间是否能赶上核心项目。`, link: '→ 关联对客方案①' },
      { order: 3, type: 'SUP', title: '供应商沟通与成本确认', detail: '向高铁/联运供应商确认余票及价格，锁定最优方案。如涉及改签费用，申请内部减免或承担。', link: '→ 关联对客方案③' }
    ];
    customerSolutions = [
      { order: 1, type: 'CUS', title: '主动改签/备选交通推荐', detail: `航班延误${scene.delayMinutes}分钟，建议改签或选择备选交通方式。已为您预查高铁方案，可保留原行程部分资源。`, script: `您好，${scene.flightNo}预计延误${scene.delayMinutes}分钟，可能影响后续行程安排。${care}我们已为您预查了前往${scene.arriveCity}的高铁备选方案，比原航班预计早到约40分钟，改签成本可控。您看是否优先考虑高铁出行？`, link: '← 关联对商方案②' },
      { order: 2, type: 'CUS', title: '行程资源同步调整', detail: '如确认改签或换高铁，同步调整酒店入住时间、景点预约时段、演出入场时间，确保资源无缝衔接。', script: `如您选择高铁方案，我们会同步将酒店入住时间调整到新抵达时间，演出和景点预约相应延后，确保您到目的地后一切顺畅。`, link: '← 关联对商方案①' },
      { order: 3, type: 'CUS', title: '差异说明与费用确认', detail: '向客户说明原方案与备选方案的到达时间差异、成本差异，确认客户接受后执行。', script: `改签方案与原方案相比，预计到达时间提前约${Math.max(0, scene.delayMinutes - 30)}分钟，改签费用约${scene.changeCost}元/人，总计约${scene.changeCost * scene.travelerCount}元。是否确认执行该方案？`, link: '← 关联对商方案③' }
    ];
  } else {
    // 严重航变
    supplierSolutions = [
      { order: 1, type: 'SUP', title: '启动资源退改流程', detail: `因航班${scene.flightStatus}，立即启动订单中受影响资源的退改流程：门票退改、酒店免费取消、接送服务取消。优先争取无损退改。`, link: '→ 关联对客方案①' },
      { order: 2, type: 'SUP', title: '索赔协调与供应商谈判', detail: `与航司确认${scene.flightStatus}原因，争取非自愿退改签权益。与演出/景点供应商协商全额退款或改期，减少客户损失。`, link: '→ 关联对客方案②' },
      { order: 3, type: 'SUP', title: '备选交通申请与预订准备', detail: `查询${scene.departCity}→${scene.arriveCity}的所有可行替代交通（高铁/联运），锁定余票，评估替补方案可行性。`, link: '→ 关联对客方案③' }
    ];
    customerSolutions = [
      { order: 1, type: 'CUS', title: '退改/补偿方案说明', detail: `因航班${scene.flightStatus}，原行程无法继续。启动无损退改流程，涉及退款的资源预计1-3个工作日到账。`, script: `非常抱歉，您订单 ${scene.orderId} 关联的 ${scene.flightNo} 航班已${scene.flightStatus}。${care}我们会立即为您启动无损退改流程，涉及酒店、门票等资源全部按可退款处理，预计1-3个工作日到账。`, link: '← 关联对商方案①' },
      { order: 2, type: 'CUS', title: '替代方案推荐与评估', detail: `为您提供备选出行方案：①改签后续航班 ②高铁直达 ③高铁+飞机联运。同时我们会为您争取航司补偿权益。`, script: `虽然原航班已${scene.flightStatus}，但我们为您准备了备选出行方案——目前已查询到前往${scene.arriveCity}的高铁和联运方案可供选择，价格和时间差异会与您确认后再操作。同时我们会帮您申请航司非自愿退改签权益。`, link: '← 关联对商方案②' },
      { order: 3, type: 'CUS', title: '专员升级与跟进', detail: '触发高风险订单专员升级，由专属客服全程跟进处理，减少客户多次沟通的困扰。24小时内回访确认。', script: `为了确保问题得到最妥善的处理，我们会安排专属客服专员全程跟进您的订单，您无需重复说明情况。处理进度会通过短信或电话同步给您。`, link: '← 关联对商方案③' }
    ];
  }

  return { supplierSolutions, customerSolutions };
}

// ── 风险检测（精简） ──
function detectRisk(scene, profile) {
  let riskScore = 0;
  const reasons = [];

  if (scene.flightStatus === '取消') { riskScore += 85; reasons.push('航班取消，原计划无法直接履约'); }
  if (scene.flightStatus === '备降') { riskScore += 70; reasons.push('航班备降，落地城市与后续履约存在不确定性'); }
  if (scene.delayMinutes >= 180) { riskScore += 60; reasons.push('延误超过 3 小时'); }
  else if (scene.delayMinutes >= 90) { riskScore += 42; reasons.push('延误超过 90 分钟'); }
  else if (scene.delayMinutes >= 30) { riskScore += 18; reasons.push('延误超过 30 分钟'); }

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

// ── 渲染：AI 决策摘要 ──
function renderSummary(scene, profile, risk) {
  $('summary').innerHTML = `
    <div class="metric"><div class="label">风险等级</div><div class="value"><span class="badge ${riskClass(risk.riskLevel)}">${risk.riskLevel}</span></div><div class="desc">综合风险分 ${risk.riskScore}</div></div>
    <div class="metric"><div class="label">航班状态</div><div class="value">${scene.flightStatus}</div><div class="desc">${scene.flightNo} / 变化 ${scene.delayMinutes} 分钟</div></div>
    <div class="metric"><div class="label">行程路线</div><div class="value">${scene.departCity} → ${scene.arriveCity}</div><div class="desc">${scene.highSpeedRailStation} 可达</div></div>
    <div class="metric"><div class="label">最主要影响</div><div class="value">${risk.reasons[0] || '暂无明显影响'}</div><div class="desc">${risk.reasons.slice(1, 3).join('；') || '持续监控即可'}</div></div>
  `;
}

// ── 渲染：客户画像 ──
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

// ── 渲染：场景分类 + 双轨方案 ──
function renderDualSolutions(scene, profile, category, dual) {
  const categoryLabels = { severe: '严重航变', mid: '中度延误', light: '轻微延误' };
  const levelBadgeClass = { severe: 'badge high', mid: 'badge mid', light: 'badge low' };

  $('sceneCategory').innerHTML = `
    <div class="scene-category-badge ${category.level}">
      <span class="badge ${levelBadgeClass[category.level]}" style="font-size:16px;padding:8px 16px">${categoryLabels[category.level]}</span>
      <span class="category-summary" style="margin-left:12px;color:var(--muted)">${category.summary}</span>
    </div>
  `;
  $('dualSolutions').innerHTML = `
    <div class="priority-hint">推荐处理顺序：${category.priority}</div>
    <div class="dual-grid">
      <div class="dual-column sup-column">
        <div class="dual-column-header sup-header">
          <span class="dual-icon">🏢</span>
          <h3>对商协调方案</h3>
          <span class="dual-badge sup-badge">供应商端</span>
        </div>
        <div class="dual-list">
          ${dual.supplierSolutions.map(s => `
            <div class="dual-card sup-card">
              <div class="dual-card-order">${s.order === 1 ? '⭐首选' : `#${s.order}`}</div>
              <div class="dual-card-body">
                <div class="dual-card-title">${s.title}</div>
                <div class="dual-card-detail">${s.detail}</div>
                <div class="dual-card-link">${s.link}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="dual-column cus-column">
        <div class="dual-column-header cus-header">
          <span class="dual-icon">👤</span>
          <h3>对客服务方案</h3>
          <span class="dual-badge cus-badge">客户端</span>
        </div>
        <div class="dual-list">
          ${dual.customerSolutions.map(s => `
            <div class="dual-card cus-card">
              <div class="dual-card-order">${s.order === 1 ? '⭐首选' : `#${s.order}`}</div>
              <div class="dual-card-body">
                <div class="dual-card-title">${s.title}</div>
                <div class="dual-card-detail">${s.detail}</div>
                ${s.script ? `<div class="dual-card-script"><strong>话术：</strong>${s.script}</div>` : ''}
                <div class="dual-card-link">${s.link}</div>
              </div>
              ${s.script ? `<div class="card-footer"><button onclick="copyScript('${s.script.replace(/'/g, "\\'")}')">复制话术</button></div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ── 渲染：备选交通方案 ──
function renderAltTransport(scene) {
  const routeKey = `${scene.departCity}→${scene.arriveCity}`;
  const options = transportDB[routeKey];

  if (!options) {
    $('altTransport').innerHTML = `<div class="empty-state">暂无可查询的备选交通方案。请确认出发/到达城市。</div>`;
    return;
  }

  $('altTransport').innerHTML = `
    <div class="transport-hint">
      <span>🚄 ${scene.departCity} → ${scene.arriveCity}</span>
      <span>共查询到 ${options.length} 个备选方案</span>
    </div>
    <div class="transport-grid">
      ${options.map((opt, idx) => {
        const isBooked = opt.bookingRef !== null;
        const soldOut = opt.seats === 0;
        return `
          <div class="transport-card ${isBooked ? 'booked' : ''} ${soldOut ? 'sold-out' : ''}">
            <div class="transport-type ${opt.type === '高铁' ? 'train' : 'intermodal'}">${opt.type === '高铁' ? '🚄' : '✈️🚄'} ${opt.type}</div>
            <div class="transport-main">
              <div class="transport-label">${opt.label}</div>
              <div class="transport-route">${opt.route}</div>
              <div class="transport-details">
                <span>🕐 ${opt.departTime} → ${opt.arriveTime}</span>
                <span>⏱ ${opt.duration}</span>
                <span>💰 ¥${opt.price}/人</span>
                <span>${soldOut ? '❌ 已售罄' : `💺 余${opt.seats}张`}</span>
              </div>
            </div>
            <div class="transport-action">
              ${isBooked
                ? `<div class="booked-badge">✅ 已预订<br/><small>确认号: ${opt.bookingRef}</small></div>`
                : soldOut
                  ? `<button class="sold-out-btn" disabled>已售罄</button>`
                  : `<button class="book-btn" onclick="bookTransport(${idx})">为客人预订</button>`
              }
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ── 预订逻辑 ──
function generateBookingRef() {
  return 'BK' + Date.now().toString(36).toUpperCase().slice(-6);
}

function bookTransport(index) {
  const scene = getScene();
  const routeKey = `${scene.departCity}→${scene.arriveCity}`;
  const options = transportDB[routeKey];
  if (!options || !options[index]) return;
  options[index].bookingRef = generateBookingRef();
  render();
}

// ── 复制话术 ──
function copyScript(text) {
  navigator.clipboard?.writeText(text);
  const toast = $('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}
window.copyScript = copyScript;

// ── 主渲染函数 ──
function render() {
  const scene = getScene();
  const profile = inferProfile(scene);
  const risk = detectRisk(scene, profile);
  const category = classifyScene(scene);
  const dual = buildDualSolutions(scene, profile, category);

  renderSummary(scene, profile, risk);
  renderProfile(profile);
  renderDualSolutions(scene, profile, category, dual);
  renderAltTransport(scene);
}

// ── 事件绑定 ──
fields.forEach(id => {
  const el = $(id);
  if (!el) return;
  el.addEventListener('input', render);
  el.addEventListener('change', render);
});

document.querySelectorAll('[data-scenario]').forEach(btn => {
  btn.addEventListener('click', () => setScene(scenarios[btn.dataset.scenario]));
});

window.bookTransport = bookTransport;

render();