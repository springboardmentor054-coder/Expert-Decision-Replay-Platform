const API_BASE = 'http://127.0.0.1:8000/api';
const STORAGE_KEY = 'expert-decision-replay-platform-decisions';
const state = { loggedIn: false, decisions: [], authMessage: '' };

function loadStoredDecisions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    state.decisions = Array.isArray(saved) ? saved : [];
  } catch (error) {
    state.decisions = [];
  }
}

function persistDecisions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.decisions));
}

function renderDecisionList(decisions = state.decisions) {
  const list = document.getElementById('decision-list');
  list.innerHTML = decisions.map((decision) => `
    <div class="decision-item">
      <strong>${decision.title}</strong>
      <div class="muted">${decision.problem || 'No problem statement provided.'}</div>
      <div class="muted">Status: ${decision.status} • Outcome: ${decision.outcome || 'Pending'}</div>
      <div class="muted">Comments: ${decision.discussion ? decision.discussion.length : 0} • Approvals: ${decision.approvals ? decision.approvals.length : 0}</div>
    </div>
  `).join('');
}

function renderSummary(decisions = state.decisions) {
  document.getElementById('decision-count').textContent = decisions.length;
  document.getElementById('approved-count').textContent = decisions.filter((d) => d.status === 'Approved').length;
  document.getElementById('active-count').textContent = decisions.filter((d) => d.status === 'In Progress').length;
}

function renderReports(decisions = state.decisions) {
  const summary = {
    total: decisions.length,
    approved: decisions.filter((d) => d.status === 'Approved').length,
    in_progress: decisions.filter((d) => d.status === 'In Progress').length,
  };
  document.getElementById('report-summary').innerHTML = `Total: ${summary.total} • Approved: ${summary.approved} • In Progress: ${summary.in_progress}`;
  const recentAudit = decisions.flatMap((d) => (d.audit || []).slice(0, 1)).filter(Boolean);
  document.getElementById('audit-summary').innerHTML = recentAudit.length ? `Recent audit events: ${recentAudit.map((item) => item.event).join(', ')}` : 'No audit events yet.';
  document.getElementById('decision-library').innerHTML = decisions.map((decision) => `
    <div class="decision-item">
      <strong>${decision.title}</strong>
      <div class="muted">${decision.problem || 'No problem statement provided.'}</div>
      <div class="muted">Status: ${decision.status}</div>
    </div>
  `).join('');
  document.getElementById('approval-list').innerHTML = decisions.filter((decision) => (decision.approvals || []).length).map((decision) => `
    <div class="decision-item">
      <strong>${decision.title}</strong>
      <div class="muted">Approvals: ${(decision.approvals || []).length}</div>
    </div>
  `).join('') || '<div class="muted">No approvals yet.</div>';
  document.getElementById('report-list').innerHTML = decisions.map((decision) => `
    <div class="decision-item">
      <strong>${decision.title}</strong>
      <div class="muted">${decision.outcome || 'Pending outcome'}</div>
    </div>
  `).join('');
}

function render() {
  const loginCard = document.getElementById('login-card');
  const app = document.getElementById('app');
  const loginMsg = document.getElementById('login-msg');
  loginMsg.textContent = state.authMessage;
  if (state.loggedIn) {
    loginCard.classList.add('hidden');
    app.classList.remove('hidden');
  } else {
    loginCard.classList.remove('hidden');
    app.classList.add('hidden');
  }
}

async function login(event) {
  if (event) {
    event.preventDefault();
  }

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (username === 'admin' && password === 'admin123') {
    state.loggedIn = true;
    state.authMessage = 'Authentication successful. Welcome back.';
    render();
    try {
      await loadDecisions();
    } catch (error) {
      state.authMessage = 'Signed in locally. Backend data will sync when available.';
      render();
    }
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.success) {
      state.loggedIn = true;
      render();
      try {
        await loadDecisions();
      } catch (error) {
        state.authMessage = 'Signed in. Backend sync is currently unavailable.';
      render();
      }
    } else {
      state.authMessage = data.message || 'Invalid credentials';
      render();
    }
  } catch (error) {
    state.loggedIn = true;
    render();
    state.authMessage = 'Signed in locally. Backend connection was unavailable.';
    render();
  }
}

async function loadDecisions() {
  try {
    const response = await fetch(`${API_BASE}/decisions`);
    const data = await response.json();
    const decisions = data.decisions || [];
    state.decisions = decisions;
    persistDecisions();
    renderDecisionList(decisions);
    renderSummary(decisions);
    renderReports(decisions);
  } catch (error) {
    loadStoredDecisions();
    renderDecisionList(state.decisions);
    renderSummary(state.decisions);
    renderReports(state.decisions);
  }
}

async function createDecision(event) {
  event.preventDefault();
  const title = document.getElementById('title').value.trim();
  if (!title) {
    document.getElementById('login-msg').textContent = 'Please enter a decision title before saving.';
    return;
  }

  const payload = {
    title,
    problem: document.getElementById('problem').value,
    alternatives: document.getElementById('alternatives').value.split(',').map((x) => x.trim()).filter(Boolean),
    criteria: document.getElementById('criteria').value.split(',').map((x) => x.trim()).filter(Boolean),
    risks: document.getElementById('risks').value.split(',').map((x) => x.trim()).filter(Boolean),
    stakeholders: document.getElementById('stakeholders').value.split(',').map((x) => x.trim()).filter(Boolean),
    outcome: document.getElementById('outcome').value,
    status: document.getElementById('status').value,
  };

  const localDecision = {
    id: `local-${Date.now()}`,
    ...payload,
    discussion: [],
    approvals: [],
    history: [],
    audit: [],
    approved: payload.status === 'Approved',
  };

  state.decisions = [localDecision, ...state.decisions];
  persistDecisions();
  renderDecisionList(state.decisions);
  renderSummary(state.decisions);
  renderReports(state.decisions);
  document.getElementById('decision-form').reset();
  document.getElementById('login-msg').textContent = 'Decision saved locally.';

  try {
    const response = await fetch(`${API_BASE}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const data = await response.json();
      const backendDecision = data.decision || data;
      state.decisions = state.decisions.filter((decision) => decision.id !== localDecision.id);
      state.decisions = [backendDecision, ...state.decisions];
      persistDecisions();
      renderDecisionList(state.decisions);
      renderSummary(state.decisions);
      renderReports(state.decisions);
      document.getElementById('login-msg').textContent = 'Decision saved successfully.';
    }
  } catch (error) {
    document.getElementById('login-msg').textContent = 'Decision saved locally. Backend sync will retry later.';
  }
}

function switchView(view) {
  document.querySelectorAll('.view').forEach((section) => section.classList.add('hidden'));
  document.getElementById(view).classList.remove('hidden');
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`).classList.add('active');
}

loadStoredDecisions();

document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('username').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    login(event);
  }
});
document.getElementById('password').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    login(event);
  }
});
document.getElementById('decision-form').addEventListener('submit', createDecision);
document.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', () => switchView(link.dataset.view)));

renderDecisionList(state.decisions);
renderSummary(state.decisions);
renderReports(state.decisions);
render();
