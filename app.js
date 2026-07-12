'use strict';

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════

const STORE = {
  WEEK:     'mtn_week',
  SESSIONS: 'mtn_sessions',
  TIMER:    'mtn_timer',
};

const DAYS_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAYS_FULL  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const IP_ACTIVITIES = [
  'Reach out to previous leads',
  'Follow up with warm contacts',
  'Invite someone to a class',
  'Ask for referral',
  'Book wellness consultation',
  'Customer reorder conversation',
  'Builder conversation',
  'Sales follow-up',
];

const SPRINT_LABELS = {
  adminCleanup:  'Admin cleanup',
  contentSystem: 'Content system',
  techSetup:     'Tech/system setup',
  launchPrep:    'Launch preparation',
  taxCleanup:    'Tax cleanup',
  other:         'Other',
};

const COMMITMENT_LABELS = {
  clientWork:   'Client work',
  volunteering: 'Volunteering',
  other:        'Other commitment',
};

const STORE_GOALS       = 'mtn_goals';
const STORE_WEEKLY_PLAN = 'mtn_weekly_plan';

const QUADRANT_LABELS = {
  customerAcquisition: { label: 'Customer Acquisition', emoji: '🌱' },
  customerRetention:   { label: 'Customer Retention',   emoji: '💚' },
  builderAcquisition:  { label: 'Builder Acquisition',  emoji: '🚀' },
  builderRetention:    { label: 'Builder Retention',    emoji: '🤝' },
};

const BREAK_HABITS = [
  { emoji: '👀', title: 'Eye reset',      body: 'Find the furthest point you can see and hold your gaze there for 20 seconds. Every 20 minutes.' },
  { emoji: '🧍', title: 'Stand up',       body: 'Stand up, sit back down — five times. Gets the blood moving and clears your head.' },
  { emoji: '💧', title: 'Drink water',    body: 'Get up and grab a glass of water. Your brain is mostly water and your focus depends on it.' },
  { emoji: '🫁', title: 'Breathe',        body: '4 counts in through your nose, hold 4, out for 6. Do it three times. Reset your nervous system.' },
  { emoji: '🤸', title: 'Shoulder rolls', body: 'Roll your shoulders back slowly, five times. Release what the desk has been holding.' },
  { emoji: '🚶', title: 'Walk it out',    body: '60 seconds away from the screen. Walk to the window, the kitchen, anywhere with distance.' },
  { emoji: '🙆', title: 'Neck stretch',   body: 'Tilt your head slowly to each side and hold 10 seconds. Repeat twice. Your neck will thank you.' },
];

const INTENTION_PROMPTS = [
  'Today I protect my Direct IP time and show up for my pipeline.',
  'I will finish one thing completely before I start the next.',
  'Today is about progress, not perfection.',
  'I will say no to what doesn\'t matter and yes to what does.',
  'Today I move the needle on what actually grows my business.',
  'I work with focus, rest without guilt, and trust the process.',
  'Today I reach out to at least one person who could become a customer.',
  'I choose momentum over perfection today.',
  'I am building something real, one focused hour at a time.',
  'Today I lead with revenue, then let everything else follow.',
];

const FOCUS_PROMPTS = [
  'Follow up with 3 warm contacts',
  'Send one Direct IP outreach message',
  'Finish and send the client proposal',
  'Block 2 hours of uninterrupted IP work',
  'Prepare for tomorrow\'s consultation',
  'Schedule next week\'s follow-up calls',
  'Batch this week\'s content in one sitting',
  'Reconnect with one past customer',
];

// ═══════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════

const STORE_DAILY = 'mtn_daily';

let state = {
  week:               null,
  sessions:           [],
  timer:              null,
  daily:              null,
  goals:              null,
  weeklyPlan:         null,
  tab:                'home',
  timerInterval:      null,
  lastBreakDismissed: 0,
  breakHabitIndex:    0,
};

let wiz = {
  step: 1,
  data: {
    weeklyHours:    null,
    workdays:       null,
    dayOff:         null,
    hasCommitments: null,
    commitments:    [],
    hasSprints:     null,
    sprints:        [],
    learningHours:  null,
  },
};

// ═══════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════

function loadState() {
  state.week     = JSON.parse(localStorage.getItem(STORE.WEEK)     || 'null');
  state.sessions = JSON.parse(localStorage.getItem(STORE.SESSIONS) || '[]');
  state.timer    = JSON.parse(localStorage.getItem(STORE.TIMER)    || 'null');
}

function saveWeek()     { localStorage.setItem(STORE.WEEK,     JSON.stringify(state.week));     }
function saveSessions() { localStorage.setItem(STORE.SESSIONS, JSON.stringify(state.sessions)); }
function saveTimer() {
  if (state.timer) localStorage.setItem(STORE.TIMER, JSON.stringify(state.timer));
  else             localStorage.removeItem(STORE.TIMER);
}

function loadDaily() {
  state.daily = JSON.parse(localStorage.getItem(STORE_DAILY) || 'null');
}

function saveDaily() {
  localStorage.setItem(STORE_DAILY, JSON.stringify(state.daily));
}

function loadGoals() {
  state.goals = JSON.parse(localStorage.getItem(STORE_GOALS) || 'null');
}
function saveGoals() {
  localStorage.setItem(STORE_GOALS, JSON.stringify(state.goals));
}
function loadWeeklyPlan() {
  state.weeklyPlan = JSON.parse(localStorage.getItem(STORE_WEEKLY_PLAN) || 'null');
}
function saveWeeklyPlan() {
  localStorage.setItem(STORE_WEEKLY_PLAN, JSON.stringify(state.weeklyPlan));
}

function isNewDay() {
  return !state.daily || state.daily.date !== todayISO();
}

// ═══════════════════════════════════════════════════
// DATE / TIME UTILS
// ═══════════════════════════════════════════════════

function uid() { return Math.random().toString(36).slice(2, 9); }

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function pad(n) { return String(n).padStart(2,'0'); }

function weekMondayISO(dateISO) {
  const ref = dateISO ? new Date(dateISO + 'T00:00:00') : new Date();
  const day  = ref.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  ref.setDate(ref.getDate() + diff);
  return `${ref.getFullYear()}-${pad(ref.getMonth()+1)}-${pad(ref.getDate())}`;
}

function formatTimer(secs) {
  secs = Math.max(0, Math.floor(secs));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatDur(secs) {
  secs = Math.max(0, Math.floor(secs));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  if (secs > 0) return '<1m';
  return '0m';
}

function fmtH(h) {
  if (h % 1 === 0) return `${h}h`;
  return `${h}h`;
}

function dayOfWeekShort(dateISO) {
  const d = new Date(dateISO + 'T00:00:00');
  return DAYS_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function todayDayName() {
  const d = new Date();
  return DAYS_FULL[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}`;
}
function currentMonthName() {
  const d = new Date();
  return ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()];
}
function currentQuarterKey() {
  const d = new Date();
  return `${d.getFullYear()}-Q${Math.ceil((d.getMonth()+1)/3)}`;
}
function currentQuarterLabel() {
  const d = new Date();
  return `Q${Math.ceil((d.getMonth()+1)/3)} ${d.getFullYear()}`;
}
function todayDOW() {
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
}

function formatDateFull(dateISO) {
  const d   = new Date(dateISO + 'T00:00:00');
  const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
  return `${d.getDate()} ${mon}`;
}

// ═══════════════════════════════════════════════════
// BUDGET & STATS CALCULATIONS
// ═══════════════════════════════════════════════════

function calcBudgets() {
  if (!state.week) return {};
  const w = state.week;
  const clientH = (w.commitments || []).reduce((s, c) => s + (c.hoursPerWeek || 0), 0);
  const ldH     = w.learningHours || 0;
  const adminSprints  = (w.sprints || []).filter(sp => sp.type === 'adminCleanup');
  const otherSprints  = (w.sprints || []).filter(sp => sp.type !== 'adminCleanup');
  const adminH  = adminSprints.reduce((s, sp) => s + (sp.cap || 0), 0);
  const sprintH = otherSprints.reduce((s, sp) => s + (sp.cap || 0), 0);
  const directH = Math.max(0, (w.weeklyHours || 0) - clientH - ldH - adminH - sprintH);

  const b = {
    total:             (w.weeklyHours || 0) * 3600,
    directIP:          directH * 3600,
    clientCommitments: clientH * 3600,
    learningDev:       ldH    * 3600,
    adminCleanup:      adminH * 3600,
  };
  otherSprints.forEach(sp => { b[`sprint_${sp.id}`] = sp.cap * 3600; });
  return b;
}

function getWeekSessions() {
  if (!state.week) return [];
  return state.sessions.filter(s => s.weekStart === state.week.weekStartDate);
}

function calcUsed() {
  const sessions = getWeekSessions();
  const u = { total: 0 };
  sessions.forEach(s => {
    const d = s.duration || 0;
    u[s.category] = (u[s.category] || 0) + d;
    u.total = (u.total || 0) + d;
  });
  if (state.timer) {
    const el  = getTimerElapsed();
    const cat = state.timer.category;
    u[cat]   = (u[cat]   || 0) + el;
    u.total  = (u.total  || 0) + el;
  }
  return u;
}

function getTimerElapsed() {
  if (!state.timer) return 0;
  const acc = state.timer.accumulatedSeconds || 0;
  if (state.timer.isRunning && state.timer.startTimestamp) {
    return acc + (Date.now() - state.timer.startTimestamp) / 1000;
  }
  return acc;
}

// Returns ordered list of categories to display
function getCategoryList() {
  if (!state.week) return [];
  const w = state.week;
  const list = [
    { key: 'directIP',          label: 'Direct IP',              isIP: true },
    { key: 'clientCommitments', label: 'Client & Commitments',   isIP: false },
    { key: 'learningDev',       label: 'Learning & Development', isIP: false },
  ];
  const adminSprints = (w.sprints || []).filter(sp => sp.type === 'adminCleanup');
  if (adminSprints.length > 0) {
    list.push({ key: 'adminCleanup', label: 'Admin / Cleanup', isIP: false });
  }
  (w.sprints || []).filter(sp => sp.type !== 'adminCleanup').forEach(sp => {
    list.push({ key: `sprint_${sp.id}`, label: sp.name, isIP: false, sprintId: sp.id });
  });
  return list;
}

function getCatLabel(key) {
  if (!state.week) return key;
  const list = getCategoryList();
  const found = list.find(c => c.key === key);
  return found ? found.label : key;
}

// ═══════════════════════════════════════════════════
// WIZARD
// ═══════════════════════════════════════════════════

function showWizard(prefillData) {
  if (prefillData) wiz.data = { ...wiz.data, ...prefillData };
  wiz.step = 1;
  document.getElementById('wizard').classList.remove('hidden');
  document.getElementById('main').classList.add('hidden');
  renderWizStep();
}

function renderWizStep() {
  const n     = wiz.step;
  const total = 5;
  document.getElementById('wiz-label').textContent = `Step ${n} of ${total}`;
  document.getElementById('wiz-fill').style.width  = `${(n / total) * 100}%`;

  const backBtn = document.getElementById('wiz-back');
  const nextBtn = document.getElementById('wiz-next');
  backBtn.classList.toggle('hidden', n === 1);
  nextBtn.textContent = n === 5 ? 'Start this week →' : 'Next →';

  document.getElementById('wiz-body').innerHTML = getWizStepHTML(n);
  initWizListeners(n);
}

function getWizStepHTML(n) {
  switch(n) {
    case 1: return wizStep1();
    case 2: return wizStep2();
    case 3: return wizStep3();
    case 4: return wizStep4();
    case 5: return wizStep5();
  }
  return '';
}

function chip(label, field, val, current) {
  const sel = current === val ? 'selected' : '';
  return `<button class="chip ${sel}" data-field="${field}" data-val="${val}">${label}</button>`;
}

function wizStep1() {
  const d = wiz.data;
  const customHours = d.weeklyHours && ![30,32,36,40].includes(d.weeklyHours);
  const customShown = customHours ? '' : 'hidden';
  return `
    <div class="wiz-step">
      <h2>This week's capacity</h2>
      <p class="hint">Set your limits before the week sets them for you.</p>

      <span class="field-label">Weekly hours</span>
      <div class="chips">
        ${chip('30h','hours',30,d.weeklyHours)}
        ${chip('32h','hours',32,d.weeklyHours)}
        ${chip('36h','hours',36,d.weeklyHours)}
        ${chip('40h','hours',40,d.weeklyHours)}
        ${chip('Custom','hours','custom', customHours ? 'custom' : null)}
      </div>
      <div class="custom-input ${customShown}" id="custom-hours-wrap">
        <input type="number" id="custom-hours" value="${customHours ? d.weeklyHours : ''}" min="1" max="80" placeholder="e.g. 45">
        <span class="unit">hours</span>
      </div>

      <span class="field-label">Working days</span>
      <div class="chips">
        ${chip('4 days','workdays',4,d.workdays)}
        ${chip('5 days','workdays',5,d.workdays)}
        ${chip('6 days','workdays',6,d.workdays)}
      </div>

      <span class="field-label">Day off</span>
      <div class="chips day-chips">
        ${DAYS_SHORT.map(day => chip(day,'dayoff',day,d.dayOff)).join('')}
      </div>
    </div>`;
}

function wizStep2() {
  const d  = wiz.data;
  const yn = d.hasCommitments;
  const show = yn === true ? '' : 'hidden';
  return `
    <div class="wiz-step">
      <h2>Fixed commitments</h2>
      <p class="hint">Recurring work that happens every week regardless.</p>

      <div class="yn-row">
        <button class="chip ${yn === true ? 'selected':''}" data-yn="yes">Yes, I have some</button>
        <button class="chip ${yn === false ? 'selected':''}" data-yn="no">No, skip this</button>
      </div>

      <div id="commitments-section" class="section-reveal ${show}">
        <div id="commitments-list">
          ${d.commitments.map(c => renderCommitmentEntry(c)).join('')}
        </div>
        <button id="add-commitment" class="btn-ghost-sm">+ Add commitment</button>
      </div>
    </div>`;
}

function renderCommitmentEntry(c) {
  const isCustomH = c.hoursPerWeek && ![0.5,1,1.5,2,3].includes(c.hoursPerWeek);
  return `
    <div class="entry-card" data-cid="${c.id}">
      <div class="entry-row">
        <select class="select-input" data-ctype="${c.id}">
          ${Object.entries(COMMITMENT_LABELS).map(([k,v]) =>
            `<option value="${k}" ${c.type===k?'selected':''}>${v}</option>`).join('')}
        </select>
      </div>
      <input type="text" class="text-input" placeholder="Name (e.g. LULU)" value="${escHtml(c.name||'')}" data-cname="${c.id}">
      <span class="field-label" style="margin-top:10px">Weekly hours</span>
      <div class="chips" style="margin-bottom:6px">
        ${[0.5,1,1.5,2,3].map(h =>
          `<button class="chip ${c.hoursPerWeek===h?'selected':''}" data-ch="${c.id}" data-hval="${h}">${h}h</button>`).join('')}
        <button class="chip ${isCustomH?'selected':''}" data-ch="${c.id}" data-hval="custom">Custom</button>
      </div>
      <div class="custom-input ${isCustomH?'':'hidden'}" id="chcustom-${c.id}">
        <input type="number" id="chval-${c.id}" value="${isCustomH?c.hoursPerWeek:''}" min="0.5" max="40" step="0.5" placeholder="Hours">
        <span class="unit">h</span>
      </div>
      <button class="remove-btn" data-cremove="${c.id}">✕ Remove</button>
    </div>`;
}

function wizStep3() {
  const d = wiz.data;
  const yn = d.hasSprints;
  const show = yn === true ? '' : 'hidden';
  return `
    <div class="wiz-step">
      <h2>Temporary sprints</h2>
      <p class="hint">Projects that need a strict time cap this week.</p>

      <div class="yn-row">
        <button class="chip ${yn===true?'selected':''}" data-yn="yes">Yes, I have one</button>
        <button class="chip ${yn===false?'selected':''}" data-yn="no">No, skip this</button>
      </div>

      <div id="sprints-section" class="section-reveal ${show}">
        <div id="sprints-list">
          ${d.sprints.map(sp => renderSprintEntry(sp)).join('')}
        </div>
        <button id="add-sprint" class="btn-ghost-sm">+ Add sprint</button>
      </div>
    </div>`;
}

function renderSprintEntry(sp) {
  const isCustomC = sp.cap && ![2,3,5,8].includes(sp.cap);
  return `
    <div class="entry-card" data-sid="${sp.id}">
      <span class="field-label" style="margin-top:0">Sprint type</span>
      <div class="chips" style="flex-wrap:wrap;margin-bottom:10px">
        ${Object.entries(SPRINT_LABELS).map(([k,v]) =>
          `<button class="chip ${sp.type===k?'selected':''}" data-stype="${sp.id}" data-stval="${k}">${v}</button>`).join('')}
      </div>
      <input type="text" class="text-input" placeholder="Sprint name" value="${escHtml(sp.name||'')}" data-sname="${sp.id}" style="margin-bottom:10px">
      <span class="field-label" style="margin-top:6px">Weekly cap</span>
      <div class="chips" style="margin-bottom:6px">
        ${[2,3,5,8].map(h =>
          `<button class="chip ${sp.cap===h?'selected':''}" data-sc="${sp.id}" data-cval="${h}">${h}h</button>`).join('')}
        <button class="chip ${isCustomC?'selected':''}" data-sc="${sp.id}" data-cval="custom">Custom</button>
      </div>
      <div class="custom-input ${isCustomC?'':'hidden'}" id="sccustom-${sp.id}">
        <input type="number" id="scval-${sp.id}" value="${isCustomC?sp.cap:''}" min="1" max="40" step="0.5" placeholder="Hours">
        <span class="unit">h</span>
      </div>
      <span class="field-label">End condition</span>
      <div class="chips">
        <button class="chip ${sp.endCondition==='thisWeek'?'selected':''}" data-send="${sp.id}" data-eval="thisWeek">This week only</button>
        <button class="chip ${sp.endCondition==='ongoing'?'selected':''}" data-send="${sp.id}" data-eval="ongoing">Until completed</button>
      </div>
      <button class="remove-btn" data-sremove="${sp.id}">✕ Remove</button>
    </div>`;
}

function wizStep4() {
  const d = wiz.data;
  const customH = d.learningHours !== null && ![0,1,2,3,4].includes(d.learningHours);
  return `
    <div class="wiz-step">
      <h2>Learning & Development</h2>
      <p class="hint">How much time will you invest in yourself this week?</p>

      <span class="field-label">Hours for L&D</span>
      <div class="chips">
        ${[0,1,2,3,4].map(h =>
          `<button class="chip ${d.learningHours===h?'selected':''}" data-field="learning" data-val="${h}">${h === 0 ? 'None' : h+'h'}</button>`).join('')}
        <button class="chip ${customH?'selected':''}" data-field="learning" data-val="custom">Custom</button>
      </div>
      <div class="custom-input ${customH?'':'hidden'}" id="ld-custom-wrap">
        <input type="number" id="ld-custom" value="${customH?d.learningHours:''}" min="0.5" max="20" step="0.5" placeholder="Hours">
        <span class="unit">h</span>
      </div>
    </div>`;
}

function wizStep5() {
  const d  = wiz.data;
  const w  = d.weeklyHours || 0;
  const clientH = d.commitments.reduce((s, c) => s + (c.hoursPerWeek || 0), 0);
  const ldH     = d.learningHours || 0;
  const adminSprints = d.sprints.filter(sp => sp.type === 'adminCleanup');
  const otherSprints = d.sprints.filter(sp => sp.type !== 'adminCleanup');
  const adminH  = adminSprints.reduce((s, sp) => s + (sp.cap || 0), 0);
  const sprintH = otherSprints.reduce((s, sp) => s + (sp.cap || 0), 0);
  const allocated = clientH + ldH + adminH + sprintH;
  const directH = Math.max(0, w - allocated);
  const overflow = Math.max(0, allocated - w);
  const pct = w > 0 ? Math.round((directH / w) * 100) : 0;

  let rows = `<div class="totals-row"><span>Weekly limit</span><span>${fmtH(w)}</span></div>`;
  if (clientH > 0) rows += `<div class="totals-row"><span>Client & Commitments</span><span>−${fmtH(clientH)}</span></div>`;
  if (adminH  > 0) rows += `<div class="totals-row"><span>Admin / Cleanup</span><span>−${fmtH(adminH)}</span></div>`;
  otherSprints.forEach(sp => {
    rows += `<div class="totals-row"><span>${escHtml(sp.name||SPRINT_LABELS[sp.type])}</span><span>−${fmtH(sp.cap||0)}</span></div>`;
  });
  if (ldH > 0) rows += `<div class="totals-row"><span>Learning & Development</span><span>−${fmtH(ldH)}</span></div>`;

  const overMsg = overflow > 0
    ? `<div class="warn-box">This exceeds your weekly limit by ${fmtH(overflow)}. Go back and reduce or remove something.</div>`
    : `<div class="info-box">You're protecting <strong>${fmtH(directH)}</strong> (${pct}%) for Direct IP — revenue-generating work first.</div>`;

  return `
    <div class="wiz-step">
      <h2>Revenue protection</h2>
      <p class="hint">Here's where your ${fmtH(w)} goes.</p>
      <div class="totals-card">
        ${rows}
        <div class="totals-row highlight">
          <span>🎯 Direct IP (protected)</span>
          <span class="lime">${fmtH(directH)}</span>
        </div>
      </div>
      ${overMsg}
    </div>`;
}

function initWizListeners(n) {
  // Generic chip handler
  document.querySelectorAll('.chip[data-field]').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      const val   = btn.dataset.val;
      document.querySelectorAll(`.chip[data-field="${field}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (field === 'hours') {
        if (val === 'custom') {
          document.getElementById('custom-hours-wrap').classList.remove('hidden');
          wiz.data.weeklyHours = null;
        } else {
          document.getElementById('custom-hours-wrap')?.classList.add('hidden');
          wiz.data.weeklyHours = parseFloat(val);
        }
      } else if (field === 'workdays') {
        wiz.data.workdays = parseInt(val);
      } else if (field === 'dayoff') {
        wiz.data.dayOff = val;
      } else if (field === 'learning') {
        if (val === 'custom') {
          document.getElementById('ld-custom-wrap').classList.remove('hidden');
          wiz.data.learningHours = null;
        } else {
          document.getElementById('ld-custom-wrap')?.classList.add('hidden');
          wiz.data.learningHours = parseFloat(val);
        }
      }
    });
  });

  const customHours = document.getElementById('custom-hours');
  if (customHours) customHours.addEventListener('input', () => { wiz.data.weeklyHours = parseFloat(customHours.value)||null; });

  const ldCustom = document.getElementById('ld-custom');
  if (ldCustom) ldCustom.addEventListener('input', () => { wiz.data.learningHours = parseFloat(ldCustom.value)||null; });

  // Step 2 / 3 yes/no
  document.querySelectorAll('.chip[data-yn]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip[data-yn]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const yes = btn.dataset.yn === 'yes';
      if (n === 2) {
        wiz.data.hasCommitments = yes;
        document.getElementById('commitments-section')?.classList.toggle('hidden', !yes);
        if (yes && wiz.data.commitments.length === 0) addCommitment();
      } else if (n === 3) {
        wiz.data.hasSprints = yes;
        document.getElementById('sprints-section')?.classList.toggle('hidden', !yes);
        if (yes && wiz.data.sprints.length === 0) addSprint();
      }
    });
  });

  // Add commitment
  document.getElementById('add-commitment')?.addEventListener('click', addCommitment);
  // Add sprint
  document.getElementById('add-sprint')?.addEventListener('click', addSprint);

  // Commitment remove
  document.querySelectorAll('[data-cremove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.cremove;
      wiz.data.commitments = wiz.data.commitments.filter(c => c.id !== id);
      rerenderList('commitments-list', wiz.data.commitments, renderCommitmentEntry);
      reattachCommitmentListeners();
    });
  });

  // Commitment type
  document.querySelectorAll('[data-ctype]').forEach(sel => {
    sel.addEventListener('change', () => {
      const c = wiz.data.commitments.find(c => c.id === sel.dataset.ctype);
      if (c) c.type = sel.value;
    });
  });

  // Commitment name
  document.querySelectorAll('[data-cname]').forEach(inp => {
    inp.addEventListener('input', () => {
      const c = wiz.data.commitments.find(c => c.id === inp.dataset.cname);
      if (c) c.name = inp.value;
    });
  });

  // Commitment hours chips
  document.querySelectorAll('[data-ch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = btn.dataset.ch;
      const val = btn.dataset.hval;
      document.querySelectorAll(`[data-ch="${id}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const c = wiz.data.commitments.find(c => c.id === id);
      if (!c) return;
      if (val === 'custom') {
        document.getElementById(`chcustom-${id}`)?.classList.remove('hidden');
        c.hoursPerWeek = null;
      } else {
        document.getElementById(`chcustom-${id}`)?.classList.add('hidden');
        c.hoursPerWeek = parseFloat(val);
      }
    });
  });

  document.querySelectorAll('[id^="chval-"]').forEach(inp => {
    inp.addEventListener('input', () => {
      const id = inp.id.replace('chval-','');
      const c  = wiz.data.commitments.find(c => c.id === id);
      if (c) c.hoursPerWeek = parseFloat(inp.value)||null;
    });
  });

  // Sprint remove
  document.querySelectorAll('[data-sremove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.sremove;
      wiz.data.sprints = wiz.data.sprints.filter(s => s.id !== id);
      rerenderList('sprints-list', wiz.data.sprints, renderSprintEntry);
      reattachSprintListeners();
    });
  });

  // Sprint type
  document.querySelectorAll('[data-stype]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = btn.dataset.stype;
      const val = btn.dataset.stval;
      document.querySelectorAll(`[data-stype="${id}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const sp = wiz.data.sprints.find(s => s.id === id);
      if (!sp) return;
      sp.type = val;
      const nameInp = document.querySelector(`[data-sname="${id}"]`);
      if (nameInp && !nameInp.value) nameInp.value = SPRINT_LABELS[val] || '';
      sp.name = nameInp?.value || SPRINT_LABELS[val] || '';
    });
  });

  // Sprint name
  document.querySelectorAll('[data-sname]').forEach(inp => {
    inp.addEventListener('input', () => {
      const sp = wiz.data.sprints.find(s => s.id === inp.dataset.sname);
      if (sp) sp.name = inp.value;
    });
  });

  // Sprint cap chips
  document.querySelectorAll('[data-sc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = btn.dataset.sc;
      const val = btn.dataset.cval;
      document.querySelectorAll(`[data-sc="${id}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const sp = wiz.data.sprints.find(s => s.id === id);
      if (!sp) return;
      if (val === 'custom') {
        document.getElementById(`sccustom-${id}`)?.classList.remove('hidden');
        sp.cap = null;
      } else {
        document.getElementById(`sccustom-${id}`)?.classList.add('hidden');
        sp.cap = parseFloat(val);
      }
    });
  });

  document.querySelectorAll('[id^="scval-"]').forEach(inp => {
    inp.addEventListener('input', () => {
      const id = inp.id.replace('scval-','');
      const sp = wiz.data.sprints.find(s => s.id === id);
      if (sp) sp.cap = parseFloat(inp.value)||null;
    });
  });

  // Sprint end condition
  document.querySelectorAll('[data-send]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = btn.dataset.send;
      const val = btn.dataset.eval;
      document.querySelectorAll(`[data-send="${id}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const sp = wiz.data.sprints.find(s => s.id === id);
      if (sp) sp.endCondition = val;
    });
  });
}

function addCommitment() {
  const c = { id: uid(), type: 'clientWork', name: '', hoursPerWeek: null };
  wiz.data.commitments.push(c);
  rerenderList('commitments-list', wiz.data.commitments, renderCommitmentEntry);
  reattachCommitmentListeners();
}

function addSprint() {
  const sp = { id: uid(), type: '', name: '', cap: null, endCondition: 'thisWeek' };
  wiz.data.sprints.push(sp);
  rerenderList('sprints-list', wiz.data.sprints, renderSprintEntry);
  reattachSprintListeners();
}

function rerenderList(containerId, arr, renderFn) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = arr.map(renderFn).join('');
}

function reattachCommitmentListeners() { initWizListeners(2); }
function reattachSprintListeners()     { initWizListeners(3); }

function validateWizStep() {
  const n = wiz.step;
  const d = wiz.data;
  if (n === 1) {
    if (!d.weeklyHours || !d.workdays || !d.dayOff) {
      showToast('Please fill in all fields.'); return false;
    }
  }
  if (n === 2 && d.hasCommitments === true) {
    for (const c of d.commitments) {
      if (!c.name) { showToast('Give each commitment a name.'); return false; }
      if (!c.hoursPerWeek) { showToast('Set hours for each commitment.'); return false; }
    }
  }
  if (n === 3 && d.hasSprints === true) {
    for (const sp of d.sprints) {
      if (!sp.name) { showToast('Give each sprint a name.'); return false; }
      if (!sp.cap)  { showToast('Set a cap for each sprint.'); return false; }
    }
  }
  if (n === 4) {
    if (d.learningHours === null || d.learningHours === undefined) {
      showToast('Select hours for L&D (0 is fine).'); return false;
    }
  }
  if (n === 5) {
    const clientH = d.commitments.reduce((s,c) => s+(c.hoursPerWeek||0), 0);
    const ldH     = d.learningHours || 0;
    const adminH  = d.sprints.filter(sp=>sp.type==='adminCleanup').reduce((s,sp)=>s+(sp.cap||0),0);
    const sprintH = d.sprints.filter(sp=>sp.type!=='adminCleanup').reduce((s,sp)=>s+(sp.cap||0),0);
    if (clientH + ldH + adminH + sprintH > (d.weeklyHours||0)) {
      showToast('Total exceeds weekly limit. Reduce something first.'); return false;
    }
  }
  return true;
}

function wizNext() {
  if (!validateWizStep()) return;
  if (wiz.step === 5) { completeSetup(); return; }
  wiz.step++;
  renderWizStep();
}

function wizBack() {
  if (wiz.step <= 1) return;
  wiz.step--;
  renderWizStep();
}

function completeSetup() {
  state.week = {
    weeklyHours:   wiz.data.weeklyHours,
    workdays:      wiz.data.workdays,
    dayOff:        wiz.data.dayOff,
    weekStartDate: weekMondayISO(),
    commitments:   wiz.data.commitments,
    sprints:       wiz.data.sprints,
    learningHours: wiz.data.learningHours,
  };
  saveWeek();
  wiz = { step:1, data:{ weeklyHours:null, workdays:null, dayOff:null, hasCommitments:null, commitments:[], hasSprints:null, sprints:[], learningHours:null } };
  showMainApp();
  showToast('Week set up. Let\'s move the needle.');
}

// ═══════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════

function showMainApp() {
  document.getElementById('wizard').classList.add('hidden');
  document.getElementById('main').classList.remove('hidden');
  updateTopbarDate();
  switchTab(state.tab);
  updateTimerBanner();
  if (state.timer && state.timer.isRunning) {
    state.lastBreakDismissed = state.lastBreakDismissed || Date.now();
    startTimerTick();
  }
}

function updateTopbarDate() {
  const d = new Date();
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('topbar-date').textContent =
    `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

function switchTab(name) {
  state.tab = name;
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`)?.classList.remove('hidden');
  document.querySelector(`.nav-btn[data-tab="${name}"]`)?.classList.add('active');
  const renders = { home: renderHome, work: renderWork, week: renderWeek, review: renderReview };
  renders[name]?.();
}

// ═══════════════════════════════════════════════════
// HOME TAB
// ═══════════════════════════════════════════════════

function renderHome() {
  const el = document.getElementById('tab-home');
  if (!state.week) { el.innerHTML = `<div class="empty"><div class="empty-icon">📋</div>Set up your week first.</div>`; return; }

  const budgets  = calcBudgets();
  const used     = calcUsed();
  const w        = state.week;
  const totalB   = budgets.total;
  const totalU   = used.total || 0;
  const remain   = Math.max(0, totalB - totalU);
  const pctDone  = totalB > 0 ? Math.min(100, (totalU / totalB) * 100) : 0;
  const today    = todayDayName();
  const isDayOff = today === w.dayOff;
  const catList  = getCategoryList();

  // IP pace logic
  const ipBudget = budgets.directIP || 0;
  const ipUsed   = used.directIP || 0;
  const ipPct    = ipBudget > 0 ? Math.round((ipUsed / ipBudget) * 100) : 0;
  const workPct  = totalB > 0 ? (totalU / totalB) : 0;
  const ipBehind = workPct > 0.25 && ipBudget > 0 && (ipUsed / ipBudget) < (workPct - 0.15);

  // Recommendation
  let reco = '';
  const overBudget = catList.filter(c => (used[c.key]||0) > (budgets[c.key]||0) && (budgets[c.key]||0) > 0);
  if (ipBehind) {
    reco = 'Your next block should be Direct IP.';
  } else if (overBudget.length > 0) {
    reco = `${overBudget[0].label} is over budget — shift to Direct IP.`;
  } else if (ipPct < 50 && totalB > 0) {
    reco = 'Keep going. Direct IP needs more time this week.';
  } else {
    reco = 'You\'re on track. Protect your Direct IP time.';
  }

  const weekMonday   = w.weekStartDate;
  const weekEndDate  = new Date(weekMonday + 'T00:00:00');
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekEnd = `${weekEndDate.getFullYear()}-${pad(weekEndDate.getMonth()+1)}-${pad(weekEndDate.getDate())}`;

  let html = '';

  if (isDayOff) {
    html += `<div class="dayoff-card">🌿 Today is your day off — ${today}. Step away.</div>`;
  }

  // Daily intention
  if (state.daily?.intention) {
    html += `<div class="intention-line">"${escHtml(state.daily.intention)}"</div>`;
  }

  // Today's must-do and appointments from weekly plan
  const todayDow = todayDOW();
  const hasPlan  = state.weeklyPlan && state.weeklyPlan.weekStart === weekMondayISO();
  if (hasPlan) {
    if (state.weeklyPlan.dailyMustDo) {
      html += `<div class="mustdo-banner">
        <div class="mustdo-label">Today's non-negotiable</div>
        <div class="mustdo-text">${escHtml(state.weeklyPlan.dailyMustDo)}</div>
      </div>`;
    }
    const todayAppts = (state.weeklyPlan.appointments||[]).filter(a => a.day === todayDow)
      .sort((a,b) => (a.time||'').localeCompare(b.time||''));
    if (todayAppts.length > 0) {
      html += `<div class="today-appts">`;
      todayAppts.forEach(a => {
        html += `<div class="today-appt-item">
          <div class="appt-time-badge">${a.time||'—'}</div>
          <div class="appt-title-text">${escHtml(a.title)}</div>
        </div>`;
      });
      html += `</div>`;
    }
  }

  // Daily focus goal
  if (state.daily?.focusGoal) {
    const focusDone = state.daily.focusDone;
    html += `
      <div class="focus-card ${focusDone ? 'done' : ''}" id="focus-toggle">
        <div class="focus-inner">
          <div class="focus-label">Today's focus</div>
          <div class="focus-text">${escHtml(state.daily.focusGoal)}</div>
        </div>
        <div class="focus-check">${focusDone ? '✓' : '○'}</div>
      </div>`;
  }

  // Weekly overview card
  html += `
    <div class="card purple-card">
      <div class="card-label">This week · ${formatDateFull(weekMonday)} – ${formatDateFull(weekEnd)}</div>
      <div class="stat-row">
        <div class="stat-big">${formatDur(totalU)}</div>
        <div class="stat-right">${formatDur(remain)} left</div>
      </div>
      <div class="stat-sub">of ${fmtH(w.weeklyHours)} limit</div>
      <div class="prog-wrap">
        <div class="prog-bar ${pctDone > 100 ? 'over':''}" style="width:${Math.min(100,pctDone)}%"></div>
      </div>
    </div>`;

  // Direct IP card (highlighted)
  const ipOver = ipUsed > ipBudget && ipBudget > 0;
  html += `
    <div class="card lime-card">
      <div class="card-label">🎯 Direct IP</div>
      <div class="stat-row">
        <div class="stat-big">${formatDur(ipUsed)}</div>
        <div class="stat-right">/ ${formatDur(ipBudget)}</div>
      </div>
      <div class="stat-sub">${ipPct}% of target</div>
      <div class="prog-wrap">
        <div class="prog-bar ${ipOver?'over':''}" style="width:${Math.min(100, ipBudget>0?(ipUsed/ipBudget*100):0)}%"></div>
      </div>
      ${ipBehind ? '<span class="badge-warn" style="display:block;margin-top:8px">Behind target — prioritize IP</span>' : ''}
      ${ipOver   ? '<span class="badge-warn" style="display:block;margin-top:8px">Over budget</span>' : ''}
    </div>`;

  html += `<div class="section-head">Categories</div>`;

  // Other categories
  catList.filter(c => c.key !== 'directIP').forEach(cat => {
    const b    = budgets[cat.key] || 0;
    const u    = used[cat.key]   || 0;
    const over = b > 0 && u > b;
    const pct  = b > 0 ? Math.min(100, (u/b)*100) : 0;
    html += `
      <div class="cat-card ${over?'over':''}">
        <div class="cat-header">
          <span class="cat-name">${escHtml(cat.label)}</span>
          <span class="cat-nums ${over?'over':''}">${formatDur(u)} / ${formatDur(b)}</span>
        </div>
        <div class="cat-bar-wrap">
          <div class="cat-bar ${over?'over':''}" style="width:${pct}%"></div>
        </div>
        ${over ? '<span class="badge-warn">Over budget</span>' : ''}
      </div>`;
  });

  // Recommendation card
  html += `
    <div class="reco-card">
      <div class="reco-label">Next move</div>
      <div class="reco-text">${escHtml(reco)}</div>
    </div>`;

  el.innerHTML = html;

  // Focus toggle
  document.getElementById('focus-toggle')?.addEventListener('click', () => {
    if (state.daily) {
      state.daily.focusDone = !state.daily.focusDone;
      saveDaily();
      renderHome();
    }
  });
}

// ═══════════════════════════════════════════════════
// WORK TAB
// ═══════════════════════════════════════════════════

function renderWork() {
  const el = document.getElementById('tab-work');
  if (!state.week) { el.innerHTML = `<div class="empty"><div class="empty-icon">📋</div>Set up your week first.</div>`; return; }

  const catList = getCategoryList();
  const budgets = calcBudgets();
  const used    = calcUsed();
  const timer   = state.timer;
  const elapsed = getTimerElapsed();
  const isRunning = timer && timer.isRunning;
  const isPaused  = timer && !timer.isRunning && elapsed > 0;
  const hasTimer  = isRunning || isPaused;
  const selCat    = timer ? timer.category : (catList[0]?.key || 'directIP');

  let html = '';

  // Category selector
  if (!hasTimer) {
    html += `<div class="section-head">Select category</div>
      <div class="cat-select-grid" id="cat-grid">`;
    catList.forEach(cat => {
      const b = budgets[cat.key] || 0;
      const u = used[cat.key]   || 0;
      html += `
        <button class="cat-select-btn ${selCat===cat.key?'selected':''}${cat.isIP?' lime-cat':''}" data-selcat="${cat.key}">
          <div class="cat-select-name">${escHtml(cat.label)}</div>
          <div class="cat-select-budget">${formatDur(u)} / ${formatDur(b)}</div>
        </button>`;
    });
    html += `</div>`;

    // Activity selector
    html += `<div class="section-head">Activity</div><div class="activity-wrap">`;
    if (selCat === 'directIP') {
      html += `<select class="activity-select" id="activity-input">
        ${IP_ACTIVITIES.map(a => `<option value="${escHtml(a)}">${escHtml(a)}</option>`).join('')}
        <option value="__custom">Other (custom)…</option>
      </select>
      <input type="text" class="activity-text hidden" id="activity-custom" placeholder="Describe the activity">`;
    } else {
      html += `<input type="text" class="activity-text" id="activity-input" placeholder="What are you working on? (optional)">`;
    }
    html += `</div>`;
  }

  // Timer display
  const displayClass = isRunning ? 'running' : (isPaused ? 'paused' : '');
  const statusText   = isRunning ? '▶ Running' : (isPaused ? '⏸ Paused' : 'Ready');
  if (hasTimer) {
    html += `
      <div class="section-head">${escHtml(getCatLabel(timer.category))}${timer.activity ? ` · ${escHtml(timer.activity)}` : ''}</div>`;
  }
  html += `
    <div class="timer-wrap">
      <div class="timer-display ${displayClass}" id="timer-display">${formatTimer(elapsed)}</div>
      <div class="timer-status ${isRunning?'running':''}">${statusText}</div>
    </div>`;

  // Controls
  html += `<div class="timer-controls">`;
  if (!hasTimer) {
    html += `<button class="btn-prime" id="btn-start">Start</button>`;
  } else if (isRunning) {
    html += `<button class="btn-outline" id="btn-pause">Pause</button>
             <button class="btn-prime"  id="btn-finish">Finish</button>`;
  } else {
    html += `<button class="btn-prime"  id="btn-resume">Resume</button>
             <button class="btn-dark"   id="btn-finish">Finish</button>`;
  }
  html += `</div>`;

  // Add time button (always available when no active timer)
  if (!hasTimer) {
    html += `<button class="btn-ghost" id="btn-add-time" style="width:100%;margin-bottom:20px">+ Add time manually</button>`;
  }

  // Recent sessions
  const recents = getWeekSessions().slice().reverse().slice(0,6);
  if (recents.length > 0) {
    html += `<div class="section-head">Recent sessions</div><div class="sessions-list">`;
    recents.forEach(s => {
      const isIP = s.category === 'directIP';
      html += `
        <div class="session-item">
          <div class="session-dot ${isIP?'lime':''}"></div>
          <div class="session-info">
            <div class="session-cat">${escHtml(getCatLabel(s.category))}</div>
            ${s.activity ? `<div class="session-act">${escHtml(s.activity)}</div>` : ''}
          </div>
          <div class="session-dur">${formatDur(s.duration)}</div>
          <button class="session-edit" data-edit="${s.id}" title="Edit">✎</button>
        </div>`;
    });
    html += `</div>`;
  }

  el.innerHTML = html;

  // Attach event listeners
  document.querySelectorAll('[data-selcat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-selcat]').forEach(b => b.classList.remove('selected','lime-cat'));
      btn.classList.add('selected');
      const cat = btn.dataset.selcat;
      const catInfo = getCategoryList().find(c => c.key === cat);
      if (catInfo?.isIP) btn.classList.add('lime-cat');
      updateActivitySelector(cat);
    });
  });

  document.getElementById('btn-start')?.addEventListener('click', startTimer);
  document.getElementById('btn-pause')?.addEventListener('click', pauseTimer);
  document.getElementById('btn-resume')?.addEventListener('click', resumeTimer);
  document.getElementById('btn-finish')?.addEventListener('click', finishTimer);
  document.getElementById('btn-add-time')?.addEventListener('click', showAddTimeModal);

  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => showEditSessionModal(btn.dataset.edit));
  });

  const actInput = document.getElementById('activity-input');
  if (actInput?.tagName === 'SELECT') {
    actInput.addEventListener('change', () => {
      const custom = document.getElementById('activity-custom');
      if (actInput.value === '__custom') custom?.classList.remove('hidden');
      else custom?.classList.add('hidden');
    });
  }
}

function updateActivitySelector(cat) {
  const wrap = document.querySelector('.activity-wrap');
  if (!wrap) return;
  if (cat === 'directIP') {
    wrap.innerHTML = `<select class="activity-select" id="activity-input">
      ${IP_ACTIVITIES.map(a => `<option value="${escHtml(a)}">${escHtml(a)}</option>`).join('')}
      <option value="__custom">Other (custom)…</option>
    </select>
    <input type="text" class="activity-text hidden" id="activity-custom" placeholder="Describe the activity">`;
    document.getElementById('activity-input').addEventListener('change', e => {
      const custom = document.getElementById('activity-custom');
      if (e.target.value === '__custom') custom?.classList.remove('hidden');
      else custom?.classList.add('hidden');
    });
  } else {
    wrap.innerHTML = `<input type="text" class="activity-text" id="activity-input" placeholder="What are you working on? (optional)">`;
  }
}

function getSelectedCategory() {
  const selected = document.querySelector('[data-selcat].selected');
  return selected?.dataset.selcat || getCategoryList()[0]?.key || 'directIP';
}

function getSelectedActivity() {
  const actInput = document.getElementById('activity-input');
  if (!actInput) return '';
  if (actInput.tagName === 'SELECT') {
    if (actInput.value === '__custom') return document.getElementById('activity-custom')?.value?.trim() || '';
    return actInput.value;
  }
  return actInput.value?.trim() || '';
}

// ═══════════════════════════════════════════════════
// TIMER
// ═══════════════════════════════════════════════════

function startTimer() {
  const cat      = getSelectedCategory();
  const activity = getSelectedActivity();
  state.timer = {
    isRunning:          true,
    startTimestamp:     Date.now(),
    accumulatedSeconds: 0,
    category:           cat,
    activity:           activity,
    date:               todayISO(),
    weekStart:          state.week?.weekStartDate || weekMondayISO(),
  };
  state.lastBreakDismissed = Date.now();
  saveTimer();
  startTimerTick();
  updateTimerBanner();
  renderWork();
}

function pauseTimer() {
  if (!state.timer || !state.timer.isRunning) return;
  state.timer.accumulatedSeconds = getTimerElapsed();
  state.timer.isRunning          = false;
  state.timer.startTimestamp     = null;
  saveTimer();
  stopTimerTick();
  updateTimerBanner();
  renderWork();
}

function resumeTimer() {
  if (!state.timer || state.timer.isRunning) return;
  state.timer.isRunning      = true;
  state.timer.startTimestamp = Date.now();
  saveTimer();
  startTimerTick();
  updateTimerBanner();
  renderWork();
}

function finishTimer() {
  const elapsed = Math.floor(getTimerElapsed());
  if (elapsed < 10) { showToast('No time recorded.'); return; }

  const session = {
    id:          uid(),
    category:    state.timer.category,
    activity:    state.timer.activity,
    date:        state.timer.date || todayISO(),
    weekStart:   state.timer.weekStart || weekMondayISO(),
    duration:    elapsed,
    manuallyAdded: false,
  };
  state.sessions.push(session);
  saveSessions();

  const wasIP = state.timer.category === 'directIP';
  state.timer = null;
  saveTimer();
  stopTimerTick();
  updateTimerBanner();

  renderWork();
  if (state.tab === 'home') renderHome();

  if (wasIP) {
    showConfetti();
    setTimeout(() => showToast('Needle moved.', 'lime'), 300);
  } else {
    showToast(`Session saved — ${formatDur(elapsed)}`);
  }
}

function startTimerTick() {
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    const elapsed = getTimerElapsed();
    const display = document.getElementById('timer-display');
    if (display) display.textContent = formatTimer(elapsed);
    const bt = document.getElementById('banner-time');
    if (bt) bt.textContent = formatTimer(elapsed);
    if (state.tab === 'home') renderHome();
    // 20-minute break nudge
    if (state.lastBreakDismissed > 0) {
      const minsSinceBreak = (Date.now() - state.lastBreakDismissed) / 60000;
      if (minsSinceBreak >= 20 && !document.getElementById('break-nudge')) {
        showBreakNudge();
      }
    }
  }, 1000);
}

function stopTimerTick() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
}

function updateTimerBanner() {
  const banner = document.getElementById('timer-banner');
  if (!banner) return;
  if (state.timer) {
    banner.classList.remove('hidden');
    const catLabel = getCatLabel(state.timer.category);
    document.getElementById('banner-cat').textContent  = catLabel;
    document.getElementById('banner-time').textContent = formatTimer(getTimerElapsed());
  } else {
    banner.classList.add('hidden');
  }
}

// ═══════════════════════════════════════════════════
// WEEK TAB
// ═══════════════════════════════════════════════════

function renderWeek() {
  const el = document.getElementById('tab-week');
  if (!state.week) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">📋</div>No week set up yet.</div>
      <button class="btn-prime mt-4" onclick="showWizard()">Set up this week</button>`;
    return;
  }

  const w       = state.week;
  const budgets = calcBudgets();
  const catList = getCategoryList();
  const monday  = w.weekStartDate;
  const sundayD = new Date(monday + 'T00:00:00');
  sundayD.setDate(sundayD.getDate() + 6);
  const sunday  = `${sundayD.getFullYear()}-${pad(sundayD.getMonth()+1)}-${pad(sundayD.getDate())}`;

  const g          = state.goals;
  const qKey       = currentQuarterKey();
  const mKey       = currentMonthKey();
  const yearGoal   = g?.yearGoal || '';
  const qGoal      = g?.quarters?.[qKey] || '';
  const monthData  = g?.months?.[mKey] || {};
  const monthGoal  = monthData.goal || '';
  const quadrants  = monthData.quadrants || {};
  const hasQuads   = Object.values(quadrants).some(v => v);

  let html = '';

  // ── Goals ──────────────────────────────────
  html += `<div class="section-head">Goals <button class="btn-ghost-inline" onclick="showGoalsEditor()">Edit</button></div>`;
  html += `<div class="goals-cascade">
    <div class="goal-tier year">
      <div class="goal-eyebrow">${new Date().getFullYear()} Year Goal</div>
      <div class="goal-text">${yearGoal ? escHtml(yearGoal) : '<span class="goal-empty">Tap Edit to set your year goal</span>'}</div>
    </div>
    <div class="goal-tier quarter">
      <div class="goal-eyebrow">${currentQuarterLabel()}</div>
      <div class="goal-text">${qGoal ? escHtml(qGoal) : '<span class="goal-empty">Set your quarterly goal</span>'}</div>
    </div>
    <div class="goal-tier month">
      <div class="goal-eyebrow">${currentMonthName()}</div>
      <div class="goal-text">${monthGoal ? escHtml(monthGoal) : '<span class="goal-empty">Set your monthly goal</span>'}</div>
    </div>
  </div>`;

  if (hasQuads) {
    html += `<div class="section-head" style="margin-top:4px">doTERRA Quadrants — ${currentMonthName()}</div>
      <div class="quadrant-grid">`;
    Object.entries(QUADRANT_LABELS).forEach(([key, {label, emoji}]) => {
      const strat = quadrants[key] || '';
      html += `<div class="quadrant-card">
        <div class="quadrant-label">${emoji} ${label}</div>
        <div class="quadrant-strategy">${strat ? escHtml(strat) : '<span class="goal-empty">—</span>'}</div>
      </div>`;
    });
    html += `</div>`;
  }

  // ── Weekly Plan ────────────────────────────
  const plan       = state.weeklyPlan;
  const hasPlan    = plan && plan.weekStart === weekMondayISO();
  const planBtnTxt = hasPlan ? 'Edit plan' : 'Plan this week';

  html += `<div class="section-head">This week · ${formatDateFull(monday)} – ${formatDateFull(sunday)}
    <button class="btn-ghost-inline" onclick="showSundayPlanner()">${planBtnTxt}</button>
  </div>`;

  if (!hasPlan) {
    html += `<div class="week-plan-empty">
      <p>Plan your week every Sunday — set your non-negotiable, tasks, and appointments to stay on target.</p>
      <button class="btn-outline" onclick="showSundayPlanner()" style="margin-top:12px;width:auto;padding:10px 24px">Plan this week →</button>
    </div>`;
  } else {
    if (plan.dailyMustDo) {
      html += `<div class="mustdo-banner">
        <div class="mustdo-label">Daily non-negotiable</div>
        <div class="mustdo-text">${escHtml(plan.dailyMustDo)}</div>
      </div>`;
    }

    const dayOrder = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    if (plan.appointments?.length > 0) {
      html += `<div class="plan-sub-head">Appointments</div>`;
      [...plan.appointments]
        .sort((a,b) => dayOrder.indexOf(a.day)-dayOrder.indexOf(b.day) || (a.time||'').localeCompare(b.time||''))
        .forEach(a => {
          html += `<div class="appt-item">
            <div class="appt-day-badge">${a.day}</div>
            <div class="appt-details">
              <div class="appt-title-text">${escHtml(a.title)}</div>
              ${a.time ? `<div class="appt-time">${a.time}</div>` : ''}
            </div>
          </div>`;
        });
    }

    if (plan.tasks?.length > 0) {
      html += `<div class="plan-sub-head">Tasks</div><div id="week-tasks-list">`;
      plan.tasks.forEach(t => {
        html += `<div class="week-task-item ${t.done?'done':''}" data-task-id="${t.id}">
          <div class="week-task-check">${t.done ? '✓' : '○'}</div>
          <div class="week-task-body">
            <div class="week-task-text">${escHtml(t.text)}</div>
            ${t.day !== 'any' ? `<div class="week-task-day">${t.day}</div>` : ''}
          </div>
        </div>`;
      });
      html += `</div>`;
    }

    if (plan.calendarUrl) {
      html += `<div class="plan-sub-head">Calendar</div>
        <div class="cal-embed-wrap">
          <iframe src="${escHtml(plan.calendarUrl)}&mode=AGENDA&wkst=2" frameborder="0" scrolling="no" class="cal-iframe"></iframe>
        </div>`;
    }
  }

  // ── Hour budget ────────────────────────────
  html += `<div class="divider"></div>
    <div class="card purple-card" style="margin-bottom:16px">
      <div class="card-label">Hour budget</div>
      <div class="stat-big">${formatDateFull(monday)} – ${formatDateFull(sunday)}</div>
      <div class="stat-sub">${fmtH(w.weeklyHours)} · ${w.workdays} days · ${w.dayOff} off</div>
    </div>
    <div class="section-head">Budget breakdown</div>`;

  catList.forEach(cat => {
    html += `<div class="week-item">
      <span class="week-item-label">${escHtml(cat.label)}</span>
      <span class="week-item-val">${formatDur(budgets[cat.key]||0)}</span>
    </div>`;
  });

  if (w.commitments?.length > 0) {
    html += `<div class="section-head">Fixed commitments</div>`;
    w.commitments.forEach(c => {
      html += `<div class="week-item">
        <span class="week-item-label">${escHtml(COMMITMENT_LABELS[c.type]||c.type)}</span>
        <span class="week-item-val">${escHtml(c.name)} · ${fmtH(c.hoursPerWeek)}/wk</span>
      </div>`;
    });
  }

  if (w.sprints?.length > 0) {
    html += `<div class="section-head">Temporary sprints</div>`;
    w.sprints.forEach(sp => {
      html += `<div class="week-item">
        <span class="week-item-label">${escHtml(sp.name)}</span>
        <span class="week-item-val">Cap ${fmtH(sp.cap)} · ${sp.endCondition==='thisWeek'?'This week':'Ongoing'}</span>
      </div>`;
    });
  }

  html += `<div class="divider"></div>
    <button class="btn-outline" onclick="editWeekSetup()" style="margin-bottom:10px">Edit hour setup</button>`;

  el.innerHTML = html;

  document.querySelectorAll('.week-task-item').forEach(el => {
    el.addEventListener('click', () => toggleWeekTask(el.dataset.taskId));
  });
}

function toggleWeekTask(taskId) {
  if (!state.weeklyPlan?.tasks) return;
  const task = state.weeklyPlan.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.done = !task.done;
  saveWeeklyPlan();
  renderWeek();
}

function editWeekSetup() {
  const w = state.week;
  wiz.data = {
    weeklyHours:    w.weeklyHours,
    workdays:       w.workdays,
    dayOff:         w.dayOff,
    hasCommitments: (w.commitments||[]).length > 0,
    commitments:    (w.commitments||[]).map(c => ({...c})),
    hasSprints:     (w.sprints||[]).length > 0,
    sprints:        (w.sprints||[]).map(s => ({...s})),
    learningHours:  w.learningHours,
  };
  showWizard();
}

// ═══════════════════════════════════════════════════
// REVIEW TAB
// ═══════════════════════════════════════════════════

function renderReview() {
  const el = document.getElementById('tab-review');
  if (!state.week) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">📊</div>Set up your week to see the review.</div>`;
    return;
  }

  const budgets = calcBudgets();
  const used    = calcUsed();
  const catList = getCategoryList();
  const w       = state.week;
  const totalU  = used.total || 0;
  const totalB  = budgets.total;
  const ipUsed  = used.directIP || 0;
  const ipBudget= budgets.directIP || 0;
  const ipPct   = totalU > 0 ? Math.round((ipUsed / totalU) * 100) : 0;

  // Day off check
  const sessions    = getWeekSessions();
  const dayOffFull  = w.dayOff; // e.g. 'Monday'
  const dayOffIdx   = DAYS_FULL.indexOf(dayOffFull);
  const dayOffDow   = dayOffIdx >= 0 ? (dayOffIdx + 1) % 7 : -1; // JS dow (0=Sun)
  const workedOnOff = sessions.some(s => {
    if (dayOffDow < 0) return false;
    const d = new Date(s.date + 'T00:00:00');
    return d.getDay() === dayOffDow;
  });
  const dayOffRespected = !workedOnOff;

  // Sprint status
  const sprints = w.sprints || [];

  let html = `
    <div class="section-head">Planned vs Actual</div>
    <div class="card mb-0">
      <table class="review-table">
        <thead>
          <tr><th>Category</th><th>Plan</th><th>Actual</th></tr>
        </thead>
        <tbody>`;

  catList.forEach(cat => {
    const b    = budgets[cat.key] || 0;
    const u    = used[cat.key]   || 0;
    const over = u > b && b > 0;
    html += `
      <tr>
        <td>${escHtml(cat.label)}</td>
        <td>${formatDur(b)}</td>
        <td class="${over?'over-col':''}">${formatDur(u)}${over?' ▲':''}</td>
      </tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>

    <div class="section-head">Week summary</div>
    <div class="card mb-0">
      <div class="review-stat">
        <span>Total hours worked</span>
        <span class="review-stat-val">${formatDur(totalU)} / ${formatDur(totalB)}</span>
      </div>
      <div class="review-stat">
        <span>Direct IP percentage</span>
        <span class="review-stat-val ${ipPct >= 40 ? 'good':'bad'}">${ipPct}%</span>
      </div>
      <div class="review-stat">
        <span>Day off respected</span>
        <span class="review-stat-val ${dayOffRespected?'good':'bad'}">${dayOffRespected ? '✓ Yes' : '✗ No'}</span>
      </div>
    </div>`;

  // Over budget categories
  const overCats = catList.filter(c => (used[c.key]||0) > (budgets[c.key]||1e9 > 0 ? budgets[c.key] : 1e9) && (budgets[c.key]||0) > 0);
  if (overCats.length > 0) {
    html += `<div class="section-head">Over budget</div><div class="card danger-card mb-0">`;
    overCats.forEach(c => {
      html += `<div class="review-stat"><span>${escHtml(c.label)}</span><span class="review-stat-val bad">+${formatDur((used[c.key]||0)-(budgets[c.key]||0))}</span></div>`;
    });
    html += `</div>`;
  }

  // Sprint status
  if (sprints.length > 0) {
    html += `<div class="section-head">Temporary sprints</div><div class="card mb-0">`;
    sprints.forEach(sp => {
      const key  = sp.type === 'adminCleanup' ? 'adminCleanup' : `sprint_${sp.id}`;
      const u    = used[key]   || 0;
      const b    = budgets[key] || 0;
      const pct  = b > 0 ? Math.round(u/b*100) : 0;
      const done = sp.endCondition === 'thisWeek' ? 'Remove next week' : 'Carry forward';
      html += `
        <div class="review-stat">
          <span>${escHtml(sp.name)} <span class="text-muted" style="font-size:11px">${done}</span></span>
          <span class="review-stat-val">${pct}%</span>
        </div>`;
    });
    html += `</div>`;
  }

  html += `
    <div class="section-head">End of week</div>
    <button class="btn-prime" onclick="startNextWeek()" style="margin-bottom:10px">Start next week →</button>
    <button class="btn-ghost" onclick="editWeekSetup()" style="width:100%;margin-bottom:10px">Edit & adjust setup</button>`;

  el.innerHTML = html;
}

// ═══════════════════════════════════════════════════
// NEW WEEK
// ═══════════════════════════════════════════════════

function startNextWeek() {
  openModal(`
    <div class="modal-title">Start next week</div>
    <p class="text-muted" style="margin-bottom:20px">How do you want to set up next week?</p>
    <button class="btn-prime" id="nw-same" style="margin-bottom:10px">Use same template</button>
    <button class="btn-outline" id="nw-fresh" style="margin-bottom:10px">Set up fresh</button>
    <p class="text-muted text-center" style="font-size:12px;margin-top:4px">Ongoing sprints will carry forward automatically.</p>
  `);

  document.getElementById('nw-same')?.addEventListener('click', () => {
    closeModal();
    carryWeekForward();
  });
  document.getElementById('nw-fresh')?.addEventListener('click', () => {
    closeModal();
    wiz.data = { weeklyHours:null, workdays:null, dayOff:null, hasCommitments:null, commitments:[], hasSprints:null, sprints:[], learningHours:null };
    showWizard();
  });
}

function carryWeekForward() {
  const w = state.week;
  const newSprints = (w.sprints||[]).filter(sp => sp.endCondition === 'ongoing').map(sp => ({...sp}));
  state.week = {
    ...w,
    weekStartDate: weekMondayISO(),
    sprints: newSprints,
  };
  saveWeek();
  switchTab('home');
  showToast('New week started. Go move the needle.');
}

// ═══════════════════════════════════════════════════
// ADD / EDIT TIME MODALS
// ═══════════════════════════════════════════════════

function showAddTimeModal() {
  const catList = getCategoryList();
  const today   = todayISO();
  openModal(`
    <div class="modal-title">Add time manually</div>

    <label class="modal-label">Category</label>
    <select class="select-input" id="modal-cat">
      ${catList.map(c => `<option value="${c.key}">${escHtml(c.label)}</option>`).join('')}
    </select>

    <div id="modal-activity-wrap">
      <label class="modal-label">Activity</label>
      <select class="activity-select" id="modal-act-select">
        ${IP_ACTIVITIES.map(a => `<option value="${escHtml(a)}">${escHtml(a)}</option>`).join('')}
        <option value="__custom">Other (custom)…</option>
      </select>
      <input type="text" class="activity-text hidden" id="modal-act-custom" placeholder="Describe the activity" style="margin-top:8px">
    </div>

    <label class="modal-label">Duration</label>
    <div class="dur-inputs">
      <div>
        <input type="number" id="modal-h" min="0" max="24" placeholder="0" value="0">
        <div class="dur-label">hours</div>
      </div>
      <span class="dur-sep">:</span>
      <div>
        <input type="number" id="modal-m" min="0" max="59" placeholder="0" value="0">
        <div class="dur-label">minutes</div>
      </div>
    </div>

    <label class="modal-label">Date</label>
    <input type="date" class="text-input" id="modal-date" value="${today}" style="margin-bottom:4px">

    <button class="btn-prime" id="modal-save" style="margin-top:16px">Save session</button>
  `);

  function updateActivityWrap() {
    const cat  = document.getElementById('modal-cat')?.value;
    const wrap = document.getElementById('modal-activity-wrap');
    if (!wrap) return;
    if (cat === 'directIP') {
      wrap.innerHTML = `
        <label class="modal-label">Activity</label>
        <select class="activity-select" id="modal-act-select">
          ${IP_ACTIVITIES.map(a => `<option value="${escHtml(a)}">${escHtml(a)}</option>`).join('')}
          <option value="__custom">Other (custom)…</option>
        </select>
        <input type="text" class="activity-text hidden" id="modal-act-custom" placeholder="Describe the activity" style="margin-top:8px">`;
      document.getElementById('modal-act-select').addEventListener('change', e => {
        document.getElementById('modal-act-custom')?.classList.toggle('hidden', e.target.value !== '__custom');
      });
    } else {
      wrap.innerHTML = `
        <label class="modal-label">Activity (optional)</label>
        <input type="text" class="activity-text" id="modal-act-text" placeholder="What were you working on?">`;
    }
  }

  document.getElementById('modal-cat').addEventListener('change', updateActivityWrap);
  document.getElementById('modal-act-select')?.addEventListener('change', e => {
    document.getElementById('modal-act-custom')?.classList.toggle('hidden', e.target.value !== '__custom');
  });

  document.getElementById('modal-save').addEventListener('click', () => {
    const cat   = document.getElementById('modal-cat').value;
    const h     = parseInt(document.getElementById('modal-h').value) || 0;
    const m     = parseInt(document.getElementById('modal-m').value) || 0;
    const secs  = h * 3600 + m * 60;
    const date  = document.getElementById('modal-date').value || todayISO();

    if (secs < 60) { showToast('Add at least 1 minute.'); return; }

    let activity = '';
    const actSel  = document.getElementById('modal-act-select');
    const actText = document.getElementById('modal-act-text');
    const actCust = document.getElementById('modal-act-custom');
    if (actSel) {
      activity = actSel.value === '__custom' ? (actCust?.value?.trim()||'') : actSel.value;
    } else if (actText) {
      activity = actText.value?.trim() || '';
    }

    const session = {
      id: uid(), category: cat, activity,
      date, weekStart: state.week?.weekStartDate || weekMondayISO(),
      duration: secs, manuallyAdded: true,
    };
    state.sessions.push(session);
    saveSessions();
    closeModal();
    renderWork();
    if (state.tab === 'home') renderHome();
    showToast(`${formatDur(secs)} added.`);
  });
}

function showEditSessionModal(sessionId) {
  const s = state.sessions.find(s => s.id === sessionId);
  if (!s) return;
  const h = Math.floor(s.duration / 3600);
  const m = Math.floor((s.duration % 3600) / 60);

  openModal(`
    <div class="modal-title">Edit session</div>
    <p class="text-muted" style="margin-bottom:16px">${escHtml(getCatLabel(s.category))}${s.activity ? ` · ${escHtml(s.activity)}` : ''}</p>

    <label class="modal-label">Duration</label>
    <div class="dur-inputs">
      <div>
        <input type="number" id="edit-h" min="0" max="24" value="${h}">
        <div class="dur-label">hours</div>
      </div>
      <span class="dur-sep">:</span>
      <div>
        <input type="number" id="edit-m" min="0" max="59" value="${m}">
        <div class="dur-label">minutes</div>
      </div>
    </div>

    <button class="btn-prime" id="edit-save" style="margin-top:20px">Save</button>
    <button class="btn-danger" id="edit-delete">Delete session</button>
  `);

  document.getElementById('edit-save').addEventListener('click', () => {
    const nh   = parseInt(document.getElementById('edit-h').value) || 0;
    const nm   = parseInt(document.getElementById('edit-m').value) || 0;
    const secs = nh * 3600 + nm * 60;
    if (secs < 10) { showToast('Too short.'); return; }
    s.duration = secs;
    saveSessions();
    closeModal();
    renderWork();
    if (state.tab === 'home') renderHome();
    showToast('Session updated.');
  });

  document.getElementById('edit-delete').addEventListener('click', () => {
    state.sessions = state.sessions.filter(sess => sess.id !== sessionId);
    saveSessions();
    closeModal();
    renderWork();
    if (state.tab === 'home') renderHome();
    showToast('Session deleted.');
  });
}

// ═══════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════

function openModal(html) {
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal-body').innerHTML = '';
}

// ═══════════════════════════════════════════════════
// CONFETTI
// ═══════════════════════════════════════════════════

function showConfetti() {
  const stage = document.getElementById('confetti-stage');
  stage.innerHTML = '';
  const colors = ['#C7F236','#2A2340','#ffffff'];
  for (let i = 0; i < 45; i++) {
    const dot = document.createElement('div');
    dot.className = 'cdot';
    const size = 5 + Math.random() * 9;
    dot.style.cssText = `
      left:${Math.random()*100}%;
      width:${size}px;
      height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      animation-delay:${(Math.random()*0.6).toFixed(2)}s;
      animation-duration:${(1+Math.random()*1.2).toFixed(2)}s;
    `;
    stage.appendChild(dot);
  }
  setTimeout(() => { stage.innerHTML = ''; }, 3000);
}

// ═══════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════

function showToast(msg, type) {
  const stage = document.getElementById('toast-stage');
  const el    = document.createElement('div');
  el.className = `toast${type === 'lime' ? ' lime' : ''}`;
  el.textContent = msg;
  stage.appendChild(el);
  requestAnimationFrame(() => { el.classList.add('show'); });
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

// ═══════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ═══════════════════════════════════════════════════
// NEW WEEK DETECTION
// ═══════════════════════════════════════════════════

function checkWeekStatus() {
  if (!state.week) { showWizard(); return; }
  const currentMonday = weekMondayISO();
  if (state.week.weekStartDate < currentMonday) {
    showNewWeekNotice(currentMonday);
  } else {
    checkMorningCard();
  }
}

function showNewWeekNotice(newMonday) {
  document.getElementById('wizard').classList.add('hidden');
  document.getElementById('main').classList.add('hidden');

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:#F7F3EA;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;z-index:500;max-width:480px;margin:0 auto;';
  overlay.innerHTML = `
    <div style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#C7F236;background:#2A2340;padding:6px 16px;border-radius:20px;margin-bottom:24px">Move The Needle</div>
    <h2 style="font-size:24px;font-weight:800;color:#2A2340;text-align:center;margin-bottom:10px">New week ahead</h2>
    <p style="font-size:15px;color:rgba(42,35,64,.6);text-align:center;margin-bottom:32px;line-height:1.5">It's a new week. How do you want to set it up?</p>
    <button id="nw-same-btn" style="background:#C7F236;color:#2A2340;border:none;border-radius:40px;padding:15px 28px;font-size:16px;font-weight:800;width:100%;max-width:320px;margin-bottom:12px;cursor:pointer">Same template →</button>
    <button id="nw-fresh-btn" style="background:transparent;color:#2A2340;border:2px solid #2A2340;border-radius:40px;padding:13px 28px;font-size:15px;font-weight:700;width:100%;max-width:320px;cursor:pointer">Set up fresh</button>
  `;
  document.getElementById('app').appendChild(overlay);

  document.getElementById('nw-same-btn').addEventListener('click', () => {
    overlay.remove();
    carryWeekForward();
    showMainApp();
  });
  document.getElementById('nw-fresh-btn').addEventListener('click', () => {
    overlay.remove();
    wiz.data = { weeklyHours:null, workdays:null, dayOff:null, hasCommitments:null, commitments:[], hasSprints:null, sprints:[], learningHours:null };
    showWizard();
  });
}

// ═══════════════════════════════════════════════════
// MORNING CARD
// ═══════════════════════════════════════════════════

function checkMorningCard() {
  if (isNewDay()) showMorningCard();
  else showMainApp();
}

function showMorningCard() {
  document.getElementById('wizard').classList.add('hidden');
  document.getElementById('main').classList.add('hidden');

  const d = new Date();
  const dayNames   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateStr    = `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`;

  const overlay = document.createElement('div');
  overlay.id = 'morning-card';
  overlay.innerHTML = `
    <div class="mc-inner">
      <div class="mc-brand">Move The Needle</div>
      <div class="mc-date">${dateStr}</div>
      <h1 class="mc-greeting">Good morning.</h1>

      <div class="mc-section">
        <label class="mc-label">Set your intention for today</label>
        <textarea id="mc-intention" class="mc-textarea" placeholder="Today I will…" rows="3"></textarea>
        <button class="mc-inspire-btn" id="mc-inspire-toggle">✦ Inspire me</button>
        <div class="mc-chips hidden" id="mc-inspire-chips"></div>
      </div>

      <div class="mc-section">
        <label class="mc-label">One focus goal that makes today a win</label>
        <input type="text" id="mc-focus" class="mc-input" placeholder="e.g. Follow up with 3 warm contacts">
        <button class="mc-inspire-btn" id="mc-focus-toggle">✦ Ideas</button>
        <div class="mc-chips hidden" id="mc-focus-chips"></div>
      </div>

      <button class="btn-prime mc-submit" id="mc-submit">Let's go →</button>
      <button class="mc-skip" id="mc-skip">Skip for today</button>
    </div>
  `;
  document.getElementById('app').appendChild(overlay);

  // Intention inspire
  document.getElementById('mc-inspire-toggle').addEventListener('click', () => {
    const wrap = document.getElementById('mc-inspire-chips');
    if (!wrap.classList.contains('hidden')) { wrap.classList.add('hidden'); return; }
    const picks = shuffleArr([...INTENTION_PROMPTS]).slice(0, 3);
    wrap.innerHTML = picks.map(p =>
      `<button class="inspire-chip">${escHtml(p)}</button>`
    ).join('');
    wrap.classList.remove('hidden');
    wrap.querySelectorAll('.inspire-chip').forEach((chip, i) => {
      chip.addEventListener('click', () => {
        document.getElementById('mc-intention').value = picks[i];
        wrap.classList.add('hidden');
      });
    });
  });

  // Focus ideas
  document.getElementById('mc-focus-toggle').addEventListener('click', () => {
    const wrap = document.getElementById('mc-focus-chips');
    if (!wrap.classList.contains('hidden')) { wrap.classList.add('hidden'); return; }
    const picks = shuffleArr([...FOCUS_PROMPTS]).slice(0, 3);
    wrap.innerHTML = picks.map(p =>
      `<button class="inspire-chip">${escHtml(p)}</button>`
    ).join('');
    wrap.classList.remove('hidden');
    wrap.querySelectorAll('.inspire-chip').forEach((chip, i) => {
      chip.addEventListener('click', () => {
        document.getElementById('mc-focus').value = picks[i];
        wrap.classList.add('hidden');
      });
    });
  });

  function saveMorningAndGo() {
    state.daily = {
      date:      todayISO(),
      intention: document.getElementById('mc-intention').value.trim(),
      focusGoal: document.getElementById('mc-focus').value.trim(),
      focusDone: false,
    };
    saveDaily();
    overlay.remove();
    showMainApp();
  }

  document.getElementById('mc-submit').addEventListener('click', saveMorningAndGo);
  document.getElementById('mc-skip').addEventListener('click', () => {
    state.daily = { date: todayISO(), intention: '', focusGoal: '', focusDone: false };
    saveDaily();
    overlay.remove();
    showMainApp();
  });
}

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ═══════════════════════════════════════════════════
// BREAK NUDGE
// ═══════════════════════════════════════════════════

function showBreakNudge() {
  if (document.getElementById('break-nudge')) return;
  const habit = BREAK_HABITS[state.breakHabitIndex % BREAK_HABITS.length];
  state.breakHabitIndex++;

  const el = document.createElement('div');
  el.id = 'break-nudge';
  el.innerHTML = `
    <div class="break-emoji">${habit.emoji}</div>
    <div class="break-body">
      <div class="break-title">${habit.title}</div>
      <div class="break-text">${habit.body}</div>
    </div>
    <button class="break-dismiss" id="break-dismiss">Got it</button>
  `;
  document.getElementById('app').appendChild(el);
  requestAnimationFrame(() => el.classList.add('break-visible'));
  document.getElementById('break-dismiss').addEventListener('click', dismissBreakNudge);
}

function dismissBreakNudge() {
  const el = document.getElementById('break-nudge');
  if (el) {
    el.classList.remove('break-visible');
    setTimeout(() => el.remove(), 300);
  }
  state.lastBreakDismissed = Date.now();
}

// ═══════════════════════════════════════════════════
// GOALS EDITOR
// ═══════════════════════════════════════════════════

function showGoalsEditor() {
  const g        = state.goals || {};
  const qKey     = currentQuarterKey();
  const mKey     = currentMonthKey();
  const yearKey  = String(new Date().getFullYear());
  const quarters = g.quarters || {};
  const months   = g.months   || {};
  const monthData  = months[mKey] || {};
  const quadrants  = monthData.quadrants || {};

  openModal(`
    <div class="modal-title">Goals</div>

    <label class="modal-label">${yearKey} Year Goal</label>
    <textarea id="goal-year" class="mc-textarea" rows="2" placeholder="What does success look like at year end?">${escHtml(g.yearGoal||'')}</textarea>

    <label class="modal-label">${currentQuarterLabel()}</label>
    <textarea id="goal-quarter" class="mc-textarea" rows="2" placeholder="What needs to happen this quarter?">${escHtml(quarters[qKey]||'')}</textarea>

    <label class="modal-label">${currentMonthName()} Goal</label>
    <textarea id="goal-month" class="mc-textarea" rows="2" placeholder="What's your focus this month?">${escHtml(monthData.goal||'')}</textarea>

    <div class="goals-modal-divider">doTERRA Quadrants — ${currentMonthName()}</div>
    <p style="font-size:12px;color:var(--muted);margin-bottom:14px">One strategy per quadrant. These guide your Sunday planning.</p>

    ${Object.entries(QUADRANT_LABELS).map(([key,{label,emoji}]) => `
      <label class="modal-label">${emoji} ${label}</label>
      <input type="text" id="q-${key}" class="mc-input" placeholder="Strategy for this month…" value="${escHtml(quadrants[key]||'')}">
    `).join('')}

    <button class="btn-prime" id="goals-save" style="margin-top:24px">Save goals</button>
  `);

  document.getElementById('goals-save').addEventListener('click', () => {
    if (!state.goals) state.goals = { yearGoal:'', quarters:{}, months:{} };
    state.goals.yearGoal = document.getElementById('goal-year').value.trim();
    if (!state.goals.quarters) state.goals.quarters = {};
    state.goals.quarters[qKey] = document.getElementById('goal-quarter').value.trim();
    if (!state.goals.months) state.goals.months = {};
    if (!state.goals.months[mKey]) state.goals.months[mKey] = {};
    state.goals.months[mKey].goal = document.getElementById('goal-month').value.trim();
    const newQ = {};
    Object.keys(QUADRANT_LABELS).forEach(k => {
      newQ[k] = document.getElementById(`q-${k}`)?.value?.trim() || '';
    });
    state.goals.months[mKey].quadrants = newQ;
    saveGoals();
    closeModal();
    if (state.tab === 'week') renderWeek();
    showToast('Goals saved.');
  });
}

// ═══════════════════════════════════════════════════
// SUNDAY PLANNER
// ═══════════════════════════════════════════════════

function showSundayPlanner() {
  if (document.getElementById('sunday-planner')) return;

  const plan        = state.weeklyPlan;
  const isCurrent   = plan && plan.weekStart === weekMondayISO();
  const tasks       = isCurrent ? (plan.tasks       || []) : [];
  const appts       = isCurrent ? (plan.appointments || []) : [];
  const mustDo      = isCurrent ? (plan.dailyMustDo  || '') : '';
  const calUrl      = plan?.calendarUrl || '';

  const mKey      = currentMonthKey();
  const monthGoal = state.goals?.months?.[mKey]?.goal || '';

  const weekStart = weekMondayISO();
  const weekEndD  = new Date(weekStart + 'T00:00:00');
  weekEndD.setDate(weekEndD.getDate() + 6);
  const weekEnd   = `${weekEndD.getFullYear()}-${pad(weekEndD.getMonth()+1)}-${pad(weekEndD.getDate())}`;
  const weekLabel = `${formatDateFull(weekStart)} – ${formatDateFull(weekEnd)}`;

  const overlay = document.createElement('div');
  overlay.id = 'sunday-planner';
  overlay.innerHTML = `
    <div class="sp-inner">
      <div class="sp-head">
        <div class="mc-brand">Weekly Plan</div>
        <div class="sp-week">${weekLabel}</div>
      </div>

      ${monthGoal ? `<div class="sp-goal-reminder">
        <div class="sp-goal-label">This month's goal</div>
        <div class="sp-goal-text">"${escHtml(monthGoal)}"</div>
      </div>` : ''}

      <div class="sp-section">
        <label class="mc-label">Daily non-negotiable</label>
        <p class="sp-hint">One thing you'll do every day this week, no matter what.</p>
        <input type="text" id="sp-mustdo" class="mc-input" placeholder="e.g. 1 hour admin + tax" value="${escHtml(mustDo)}">
      </div>

      <div class="sp-section">
        <label class="mc-label">This week's tasks</label>
        <p class="sp-hint">Specific things to get done this week. Optionally pin to a day.</p>
        <div id="sp-tasks-list">
          ${tasks.map(t => renderPlannerTask(t)).join('')}
        </div>
        <button class="btn-ghost-sm" id="sp-add-task">+ Add task</button>
      </div>

      <div class="sp-section">
        <label class="mc-label">Fixed appointments</label>
        <p class="sp-hint">Meetings, calls, or events that are locked in.</p>
        <div id="sp-appts-list">
          ${appts.map(a => renderPlannerAppt(a)).join('')}
        </div>
        <button class="btn-ghost-sm" id="sp-add-appt">+ Add appointment</button>
      </div>

      <div class="sp-section">
        <label class="mc-label">Google Calendar (optional)</label>
        <p class="sp-hint">Paste the embed URL from Google Calendar settings to see your agenda here.</p>
        <input type="url" id="sp-cal-url" class="mc-input" placeholder="https://calendar.google.com/calendar/embed?src=…" value="${escHtml(calUrl)}">
      </div>

      <button class="btn-prime sp-submit" id="sp-submit">Lock in this week →</button>
      <button class="mc-skip" id="sp-skip">Skip for now</button>
    </div>
  `;
  document.getElementById('app').appendChild(overlay);

  document.querySelectorAll('#sp-tasks-list .sp-task-item').forEach(el => {
    el.querySelector('.sp-remove')?.addEventListener('click', () => el.remove());
  });
  document.querySelectorAll('#sp-appts-list .sp-appt-item').forEach(el => {
    el.querySelector('.sp-remove')?.addEventListener('click', () => el.remove());
  });

  document.getElementById('sp-add-task').addEventListener('click', () => {
    const t = { id: uid(), text:'', done:false, day:'any' };
    const html = renderPlannerTask(t);
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const item = wrap.firstElementChild;
    document.getElementById('sp-tasks-list').appendChild(item);
    item.querySelector('.sp-remove')?.addEventListener('click', () => item.remove());
    item.querySelector('.sp-task-text')?.focus();
  });

  document.getElementById('sp-add-appt').addEventListener('click', () => {
    const a = { id: uid(), title:'', day:'Mon', time:'' };
    const html = renderPlannerAppt(a);
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const item = wrap.firstElementChild;
    document.getElementById('sp-appts-list').appendChild(item);
    item.querySelector('.sp-remove')?.addEventListener('click', () => item.remove());
    item.querySelector('.sp-appt-title')?.focus();
  });

  document.getElementById('sp-submit').addEventListener('click', saveSundayPlan);
  document.getElementById('sp-skip').addEventListener('click', () => overlay.remove());
}

function renderPlannerTask(t) {
  const dayOpts = ['any','Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d =>
    `<option value="${d}" ${t.day===d?'selected':''}>${d==='any'?'Any day':d}</option>`
  ).join('');
  return `<div class="sp-task-item" data-task-id="${t.id}">
    <input type="text" class="sp-task-text" placeholder="What needs to get done?" value="${escHtml(t.text||'')}">
    <div class="sp-task-row">
      <select class="sp-day-select">${dayOpts}</select>
      <button class="sp-remove">✕</button>
    </div>
  </div>`;
}

function renderPlannerAppt(a) {
  const dayOpts = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d =>
    `<option value="${d}" ${a.day===d?'selected':''}>${d}</option>`
  ).join('');
  return `<div class="sp-appt-item" data-appt-id="${a.id}">
    <input type="text" class="sp-appt-title" placeholder="Appointment name" value="${escHtml(a.title||'')}">
    <div class="sp-task-row">
      <select class="sp-day-select">${dayOpts}</select>
      <input type="time" class="sp-time-input" value="${a.time||''}">
      <button class="sp-remove">✕</button>
    </div>
  </div>`;
}

function saveSundayPlan() {
  const overlay = document.getElementById('sunday-planner');
  const mustDo  = document.getElementById('sp-mustdo')?.value?.trim() || '';
  const calUrl  = document.getElementById('sp-cal-url')?.value?.trim() || '';

  const tasks = [];
  document.querySelectorAll('#sp-tasks-list .sp-task-item').forEach(el => {
    const text = el.querySelector('.sp-task-text')?.value?.trim() || '';
    const day  = el.querySelector('.sp-day-select')?.value || 'any';
    if (text) tasks.push({ id: el.dataset.taskId || uid(), text, done: false, day });
  });

  const appointments = [];
  document.querySelectorAll('#sp-appts-list .sp-appt-item').forEach(el => {
    const title = el.querySelector('.sp-appt-title')?.value?.trim() || '';
    const day   = el.querySelector('.sp-day-select')?.value || 'Mon';
    const time  = el.querySelector('.sp-time-input')?.value || '';
    if (title) appointments.push({ id: el.dataset.apptId || uid(), title, day, time });
  });

  state.weeklyPlan = { weekStart: weekMondayISO(), dailyMustDo: mustDo, tasks, appointments, calendarUrl: calUrl };
  saveWeeklyPlan();

  overlay.remove();
  if (state.tab === 'week') renderWeek();
  if (state.tab === 'home') renderHome();
  showToast('Week locked in.');
}

// ═══════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════

function setupEvents() {
  // Wizard nav
  document.getElementById('wiz-next').addEventListener('click', wizNext);
  document.getElementById('wiz-back').addEventListener('click', wizBack);

  // Tab nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-back').addEventListener('click', closeModal);

  // Keyboard: close modal on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════

function init() {
  loadState();
  loadDaily();
  loadGoals();
  loadWeeklyPlan();
  setupEvents();
  checkWeekStatus();
}

document.addEventListener('DOMContentLoaded', init);
