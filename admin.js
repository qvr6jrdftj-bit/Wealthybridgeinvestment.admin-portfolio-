/**
 * Admin demo (front-end only)
 * - Light theme, responsive card layout
 * - Hard-coded credentials (demo):
 *    username: admin.wealthybridge
 *    password: 08157909627e
 * - Uses localStorage to persist demo data
 *
 * WARNING: This is a local demo admin only — no real funds or server operations.
 */

(function () {
  'use strict';

  // Demo credentials
  const USERNAME = 'admin.wealthybridge';
  const PASSWORD = '08157909627e';

  // DOM
  const loginScreen = document.getElementById('loginScreen');
  const loginBtn = document.getElementById('loginBtn');
  const fillBtn = document.getElementById('fillBtn');
  const loginMsg = document.getElementById('loginMsg');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  const dashboard = document.getElementById('dashboard');
  const logoutBtn = document.getElementById('logoutBtn');
  const cardsWrapper = document.getElementById('cardsWrapper');
  const searchInput = document.getElementById('searchInput');
  const countShown = document.getElementById('countShown');
  const clearDataBtn = document.getElementById('clearData');

  // LocalStorage key
  const LS_KEY = 'wb_demo_investors_v1';

  // Sample investors
  const SAMPLE = [
    { id: 'u1', name: 'Michael Brown', wallet: '0xA1B2...C3D4', type: 'Crypto', amount: 500, status: 'pending', created: Date.now() - 1000*60*60*24*2 },
    { id: 'u2', name: 'Sarah Johnson', wallet: '0xB2C3...D4E5', type: 'Real Estate', amount: 1200, status: 'approved', created: Date.now() - 1000*60*60*24*10 },
    { id: 'u3', name: 'David Lee', wallet: '0xC3D4...E5F6', type: 'Stocks', amount: 800, status: 'rejected', created: Date.now() - 1000*60*60*24*5 },
    { id: 'u4', name: 'Emma Davis', wallet: '0xD4E5...F6A7', type: 'Bonds', amount: 300, status: 'pending', created: Date.now() - 1000*60*60*24*1 },
  ];

  // Utilities
  function read() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') || []; } catch (e) { return []; }
  }
  function write(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
  function ensureSample() {
    const cur = read();
    if (!cur || cur.length === 0) {
      write(SAMPLE.slice());
      return SAMPLE.slice();
    }
    return cur;
  }
  function formatCurrency(n) { return '$' + Number(n).toLocaleString(); }
  function statusClass(status) {
    if (status === 'pending') return 'pill pending';
    if (status === 'approved') return 'pill approved';
    return 'pill rejected';
  }

  // Render card for one investor
  function renderCard(inv) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = inv.id;

    const nameInitial = inv.name ? inv.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() : 'WB';

    card.innerHTML = `
      <div class="top">
        <div class="user">
          <div class="avatar">${nameInitial}</div>
          <div>
            <div class="meta">${inv.name}</div>
            <div class="small-muted">${inv.wallet}</div>
          </div>
        </div>
        <div class="${statusClass(inv.status)}">${inv.status.toUpperCase()}</div>
      </div>

      <div class="row">
        <div><div class="label">Investment</div><div class="small-muted">${inv.type}</div></div>
        <div><div class="label">Amount</div><div class="small-muted">${formatCurrency(inv.amount)}</div></div>
      </div>

      <div class="row actions">
        <button class="approve">Approve</button>
        <button class="reject">Reject</button>
        <div style="margin-left:auto" class="small-muted">Added: ${new Date(inv.created).toLocaleDateString()}</div>
      </div>
    `;

    // Approve
    card.querySelector('.approve').addEventListener('click', () => {
      updateStatus(inv.id, 'approved');
    });
    // Reject
    card.querySelector('.reject').addEventListener('click', () => {
      updateStatus(inv.id, 'rejected');
    });

    return card;
  }

  // Render list with optional filter
  function renderList(filter = '') {
    const arr = read().filter(i => {
      if (!filter) return true;
      const text = (i.name + ' ' + i.wallet + ' ' + i.type).toLowerCase();
      return text.indexOf(filter.toLowerCase()) !== -1;
    });
    cardsWrapper.innerHTML = '';
    arr.forEach(i => cardsWrapper.appendChild(renderCard(i)));
    countShown.textContent = arr.length;
  }

  // Update investor status
  function updateStatus(id, status) {
    const arr = read();
    const i = arr.find(x => x.id === id);
    if (!i) return alert('Investor not found');
    i.status = status;
    write(arr);
    renderList(searchInput.value.trim());
  }

  // Login handling
  loginBtn.addEventListener('click', () => {
    const u = usernameInput.value.trim();
    const p = passwordInput.value;
    if (u === USERNAME && p === PASSWORD) {
      loginMsg.textContent = '';
      showDashboard();
      ensureSample();
      renderList();
    } else {
      loginMsg.textContent = 'Invalid credentials';
      loginMsg.style.color = 'crimson';
    }
  });

  // Fill sample data button (for convenience)
  fillBtn.addEventListener('click', () => {
    write(SAMPLE.slice());
    loginMsg.textContent = 'Sample data loaded (you can sign in now)';
    loginMsg.style.color = 'green';
  });

  function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
  }

  // Logout
  logoutBtn.addEventListener('click', () => {
    dashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    usernameInput.value = '';
    passwordInput.value = '';
    loginMsg.textContent = 'Logged out';
    loginMsg.style.color = '';
  });

  // Search
  searchInput.addEventListener('input', e => {
    renderList(e.target.value.trim());
  });

  // Clear demo data
  clearDataBtn.addEventListener('click', () => {
    if (!confirm('Clear all demo investor data? This cannot be undone.')) return;
    localStorage.removeItem(LS_KEY);
    renderList();
  });

  // Initialize (keep previous data if exists)
  (function init() {
    // If there is no data, populate sample automatically so first login works
    if (!read() || read().length === 0) {
      write(SAMPLE.slice());
    }
  })();

})();
