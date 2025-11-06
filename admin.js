// Demo admin (client-side) — reads from localStorage keys created by the front-end demo
// Demo credentials (change these before use)
const DEMO_USER = 'admin';
const DEMO_PASS = 'password123';

const loginPanel = document.getElementById('loginPanel');
const loginMsg = document.getElementById('loginMsg');
const loginBtn = document.getElementById('loginBtn');
const clearDemoBtn = document.getElementById('clearDemo');

const dashboardPanel = document.getElementById('dashboardPanel');
const logoutBtn = document.getElementById('logoutBtn');
const adminLabel = document.getElementById('adminLabel');

const tabs = Array.from(document.querySelectorAll('.tab'));
const panes = {
  withdrawals: document.getElementById('withdrawalsTab'),
  deposits: document.getElementById('depositsTab'),
  support: document.getElementById('supportTab'),
  users: document.getElementById('usersTab')
};

// table bodies
const withdrawalsTbody = document.querySelector('#withdrawalsTable tbody');
const depositsTbody = document.querySelector('#depositsTable tbody');
const supportTbody = document.querySelector('#supportTable tbody');
const usersTbody = document.querySelector('#usersTable tbody');

function showPanel(name){
  loginPanel.classList.toggle('hidden', name !== 'login');
  dashboardPanel.classList.toggle('hidden', name !== 'dashboard');
}

loginBtn.addEventListener('click', () => {
  const u = document.getElementById('adminUser').value.trim();
  const p = document.getElementById('adminPass').value;
  if (u === DEMO_USER && p === DEMO_PASS) {
    showPanel('dashboard');
    adminLabel.textContent = `Signed in as ${u} (demo)`;
    loadAll();
  } else {
    loginMsg.textContent = 'Invalid credentials (demo)';
    loginMsg.style.color = 'orange';
  }
});

logoutBtn.addEventListener('click', () => {
  showPanel('login');
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPass').value = '';
  loginMsg.textContent = 'Logged out';
});

clearDemoBtn.addEventListener('click', () => {
  if (!confirm('Clear demo data from localStorage?')) return;
  localStorage.removeItem('wb_withdrawals');
  localStorage.removeItem('wb_deposits');
  localStorage.removeItem('wb_support');
  localStorage.removeItem('wb_users');
  loadAll();
});

// tab switching
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.getAttribute('data-tab');
    Object.keys(panes).forEach(k => panes[k].classList.toggle('hidden', k !== tab));
    if (tab === 'withdrawals') loadWithdrawals();
    if (tab === 'deposits') loadDeposits();
    if (tab === 'support') loadSupport();
    if (tab === 'users') loadUsers();
  });
});

// Load functions read from localStorage; if absent, create empty arrays
function readLS(key){ try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ return []; } }
function writeLS(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

function loadAll(){
  loadWithdrawals();
  loadDeposits();
  loadSupport();
  loadUsers();
}

function loadWithdrawals(){
  const arr = readLS('wb_withdrawals');
  if (!arr.length) { withdrawalsTbody.innerHTML = '<tr><td colspan="7">No withdrawals</td></tr>'; return; }
  withdrawalsTbody.innerHTML = arr.map(w => {
    return `<tr>
      <td>${w.id}</td>
      <td>${w.requester || '-'}</td>
      <td>${w.to}</td>
      <td>$${w.amount}</td>
      <td>${w.status}</td>
      <td>${new Date(w.when).toLocaleString()}</td>
      <td>
        ${w.status === 'pending' ? `<button onclick="approve('${w.id}')">Approve</button><button onclick="reject('${w.id}')">Reject</button>` : ''}
      </td>
    </tr>`;
  }).join('');
}

function loadDeposits(){
  const arr = readLS('wb_deposits');
  if (!arr.length) { depositsTbody.innerHTML = '<tr><td colspan="6">No deposits</td></tr>'; return; }
  depositsTbody.innerHTML = arr.map(d => {
    return `<tr>
      <td>${d.id}</td>
      <td>${d.wallet || '-'}</td>
      <td>$${d.amount}</td>
      <td>${d.method}</td>
      <td>${d.status}</td>
      <td>${new Date(d.when).toLocaleString()}</td>
    </tr>`;
  }).join('');
}

function loadSupport(){
  const arr = readLS('wb_support');
  if (!arr.length) { supportTbody.innerHTML = '<tr><td colspan="6">No messages</td></tr>'; return; }
  supportTbody.innerHTML = arr.map(s => {
    return `<tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td>${s.wallet || '-'}</td>
      <td>${escapeHtml(s.message)}</td>
      <td>${new Date(s.when).toLocaleString()}</td>
    </tr>`;
  }).join('');
}

function loadUsers(){
  const arr = readLS('wb_users');
  if (!arr.length) { usersTbody.innerHTML = '<tr><td colspan="4">No users</td></tr>'; return; }
  usersTbody.innerHTML = arr.map(u => {
    return `<tr>
      <td>${u.address}</td><td>${u.walletType || '-'}</td><td>${u.verified ? 'Yes' : 'No'}</td><td>${new Date(u.when).toLocaleString()}</td>
    </tr>`;
  }).join('');
}

window.approve = function(id){
  const arr = readLS('wb_withdrawals');
  const idx = arr.findIndex(x=>x.id===id);
  if (idx === -1) return alert('Not found');
  arr[idx].status = 'paid';
  writeLS('wb_withdrawals', arr);
  loadWithdrawals();
  alert('Marked as paid (demo). In production, send funds from admin wallet.');
};

window.reject = function(id){
  const arr = readLS('wb_withdrawals');
  const idx = arr.findIndex(x=>x.id===id);
  if (idx === -1) return alert('Not found');
  arr[idx].status = 'rejected';
  writeLS('wb_withdrawals', arr);
  loadWithdrawals();
  alert('Rejected (demo).');
};

function escapeHtml(str=''){ return String(str).replace(/[&<>"'`]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'})[s]); }
