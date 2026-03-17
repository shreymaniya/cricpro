/* ============================================================
   CricketPro — app.js  (complete rewrite)
   Features: Groups, NRR, Live Score with bowler picker,
             bulk players, auto-wickets from squad, custom overs
   ============================================================ */

// ─── DEFAULT DATA ────────────────────────────────────────────
const D_GROUPS = [
  { id:1, name:'Group A', stage:'group' },
  { id:2, name:'Group B', stage:'group' },
];

const D_TEAMS = [
  { id:1, name:'Mumbai Indians',       code:'MI',  color:'#004ba0', group:'Group A', ground:'Wankhede Stadium',        captain:'Rohit Sharma',   played:6, won:4, lost:2, nr:0 },
  { id:2, name:'Chennai Super Kings',  code:'CSK', color:'#f7a600', group:'Group A', ground:'Chepauk, Chennai',        captain:'MS Dhoni',        played:6, won:3, lost:3, nr:0 },
  { id:3, name:'Royal Challengers',    code:'RCB', color:'#c40000', group:'Group A', ground:'Chinnaswamy Stadium',     captain:'Virat Kohli',     played:6, won:3, lost:3, nr:0 },
  { id:4, name:'Kolkata Knight Riders',code:'KKR', color:'#3a225d', group:'Group B', ground:'Eden Gardens',            captain:'Shreyas Iyer',   played:6, won:4, lost:2, nr:0 },
  { id:5, name:'Delhi Capitals',       code:'DC',  color:'#005da0', group:'Group B', ground:'Arun Jaitley Stadium',   captain:'David Warner',   played:6, won:2, lost:4, nr:0 },
  { id:6, name:'Rajasthan Royals',     code:'RR',  color:'#e01e5a', group:'Group B', ground:'Sawai Mansingh Stadium', captain:'Sanju Samson',   played:6, won:3, lost:3, nr:0 },
];

const D_PLAYERS = [
  { id:1,  name:'Rohit Sharma',     team:'MI',  role:'batsman',      jersey:45, country:'India',     m:6, runs:312, wkts:0  },
  { id:2,  name:'Jasprit Bumrah',   team:'MI',  role:'bowler',       jersey:93, country:'India',     m:6, runs:18,  wkts:11 },
  { id:3,  name:'Suryakumar Yadav', team:'MI',  role:'batsman',      jersey:73, country:'India',     m:6, runs:280, wkts:0  },
  { id:4,  name:'Hardik Pandya',    team:'MI',  role:'allrounder',   jersey:28, country:'India',     m:6, runs:180, wkts:6  },
  { id:5,  name:'Ishan Kishan',     team:'MI',  role:'wicketkeeper', jersey:32, country:'India',     m:6, runs:210, wkts:0  },
  { id:6,  name:'MS Dhoni',         team:'CSK', role:'wicketkeeper', jersey:7,  country:'India',     m:6, runs:175, wkts:0  },
  { id:7,  name:'Ravindra Jadeja',  team:'CSK', role:'allrounder',   jersey:8,  country:'India',     m:6, runs:148, wkts:8  },
  { id:8,  name:'Deepak Chahar',    team:'CSK', role:'bowler',       jersey:90, country:'India',     m:6, runs:22,  wkts:9  },
  { id:9,  name:'Devon Conway',     team:'CSK', role:'batsman',      jersey:19, country:'NZ',        m:6, runs:260, wkts:0  },
  { id:10, name:'Virat Kohli',      team:'RCB', role:'batsman',      jersey:18, country:'India',     m:6, runs:380, wkts:0  },
  { id:11, name:'Glenn Maxwell',    team:'RCB', role:'allrounder',   jersey:32, country:'Australia', m:6, runs:195, wkts:4  },
  { id:12, name:'Mohammed Siraj',   team:'RCB', role:'bowler',       jersey:73, country:'India',     m:6, runs:14,  wkts:10 },
  { id:13, name:'Shreyas Iyer',     team:'KKR', role:'batsman',      jersey:41, country:'India',     m:6, runs:290, wkts:0  },
  { id:14, name:'Andre Russell',    team:'KKR', role:'allrounder',   jersey:12, country:'WI',        m:6, runs:210, wkts:7  },
  { id:15, name:'Sanju Samson',     team:'RR',  role:'wicketkeeper', jersey:9,  country:'India',     m:6, runs:295, wkts:0  },
  { id:16, name:'David Warner',     team:'DC',  role:'batsman',      jersey:31, country:'Australia', m:6, runs:240, wkts:0  },
];

const D_MATCHES = [
  { id:1,  t1:'MI',  t2:'CSK', date:'2025-03-22', venue:'Wankhede Stadium',       type:'league', overs:20, maxW:10, status:'completed', s1:'187/5 (20)',  s2:'172/8 (20)',  winner:'MI',  summary:'MI won by 15 runs',          potm:'Rohit Sharma',  scorecard:null },
  { id:2,  t1:'RCB', t2:'KKR', date:'2025-03-23', venue:'Chinnaswamy Stadium',    type:'league', overs:20, maxW:10, status:'completed', s1:'204/4 (20)',  s2:'207/6 (19.3)',winner:'KKR', summary:'KKR won by 4 wickets',       potm:'Andre Russell', scorecard:null },
  { id:3,  t1:'RR',  t2:'DC',  date:'2025-03-24', venue:'Sawai Mansingh Stadium', type:'league', overs:20, maxW:10, status:'completed', s1:'165/8 (20)',  s2:'158/9 (20)',  winner:'RR',  summary:'RR won by 7 runs',           potm:'Sanju Samson',  scorecard:null },
  { id:4,  t1:'MI',  t2:'RCB', date:'2025-03-29', venue:'Wankhede Stadium',       type:'league', overs:20, maxW:10, status:'upcoming',  s1:'',            s2:'',            winner:null,  summary:'',                           potm:'',              scorecard:null },
  { id:5,  t1:'CSK', t2:'KKR', date:'2025-03-30', venue:'Chepauk, Chennai',       type:'league', overs:20, maxW:10, status:'upcoming',  s1:'',            s2:'',            winner:null,  summary:'',                           potm:'',              scorecard:null },
  { id:6,  t1:'MI',  t2:'KKR', date:'2025-04-15', venue:'Wankhede Stadium',       type:'semi',   overs:20, maxW:10, status:'upcoming',  s1:'',            s2:'',            winner:null,  summary:'',                           potm:'',              scorecard:null },
];

// ─── STATE ───────────────────────────────────────────────────
const API_BASE = 'api.php';
let groups  = [];
let teams   = [];
let players = [];
let matches = [];
let editTeamId   = null;
let editPlayerId = null;
let matchFilter  = 'all';
let playerFilter = 'all';
let teamGroupFilter = 'all';
let liveSyncTimer = null;

function save() {}

function parseScorecard(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch (_) { return null; }
  }
  return raw;
}

function mapGroup(g) {
  return { id:Number(g.id), name:g.name, stage:g.stage || 'group' };
}

function mapTeam(t) {
  return {
    id:Number(t.id),
    name:t.name,
    code:(t.code || '').toUpperCase(),
    color:t.color || '#555',
    group:t.group_name || '',
    ground:t.home_ground || '',
    captain:t.captain || '',
    played:Number(t.played || 0),
    won:Number(t.won || 0),
    lost:Number(t.lost || 0),
    nr:Number(t.nr || 0),
    nrr:Number(t.nrr || 0),
  };
}

function mapPlayer(p) {
  return {
    id:Number(p.id),
    name:p.name,
    team:(p.team_code || '').toUpperCase(),
    role:p.role || 'batsman',
    jersey:Number(p.jersey_number || 0),
    country:p.nationality || '',
    m:Number(p.matches_played || 0),
    runs:Number(p.total_runs || 0),
    wkts:Number(p.total_wickets || 0),
  };
}

function mapMatch(m) {
  return {
    id:Number(m.id),
    t1:(m.team1_code || '').toUpperCase(),
    t2:(m.team2_code || '').toUpperCase(),
    date:m.match_date,
    venue:m.venue || '',
    type:m.match_type || 'league',
    overs:Number(m.overs_per_innings || 20),
    maxW:Number(m.max_wickets || 10),
    status:m.status || 'upcoming',
    s1:m.score1 || '',
    s2:m.score2 || '',
    winner:m.winner_code || null,
    summary:m.result_summary || '',
    potm:m.player_of_match || '',
    scorecard:parseScorecard(m.scorecard_json),
  };
}

async function apiRequest(resource, { method='GET', id=null, params={}, body=null } = {}) {
  const url = new URL(API_BASE, window.location.href);
  url.searchParams.set('resource', resource);
  if (id !== null && id !== undefined) url.searchParams.set('id', id);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const options = { method, headers:{} };
  if (body !== null) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), options);
  let data = null;
  try { data = await response.json(); } catch (_) {}
  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`);
  }
  return data;
}

async function loadAllData() {
  const [groupData, teamData, playerData, matchData] = await Promise.all([
    apiRequest('groups'),
    apiRequest('teams'),
    apiRequest('players'),
    apiRequest('matches'),
  ]);

  groups = groupData.map(mapGroup);
  teams = teamData.map(mapTeam);
  players = playerData.map(mapPlayer);
  matches = matchData.map(mapMatch);

  if (teamGroupFilter !== 'all' && !groups.some(g => g.name === teamGroupFilter)) {
    teamGroupFilter = 'all';
  }
}

function activePage() {
  const el = document.querySelector('.page.active');
  return el ? el.id.replace('page-', '') : 'dashboard';
}

function refreshCurrentView() {
  refreshGroupSelects();
  updateStats();
  renderDashboard();
  const page = activePage();
  if (page !== 'dashboard') renderPage(page);
}

// ─── HELPERS ─────────────────────────────────────────────────
function getTeam(code)     { return teams.find(t => t.code === code); }
function getTeamName(code) { const t=getTeam(code); return t ? t.name : code; }
function getTeamColor(code){ const t=getTeam(code); return t ? t.color : '#555'; }
function teamPlayers(code) { return players.filter(p => p.team === code); }
function nextId(arr)       { return arr.length ? Math.max(...arr.map(x=>x.id))+1 : 1; }

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}

function oversStr(balls) {
  return Math.floor(balls/6) + '.' + (balls%6);
}

function srCalc(runs, balls) { return balls ? (runs/balls*100).toFixed(1) : '0.0'; }
function econCalc(runs, balls){ return balls ? (runs/(balls/6)).toFixed(2) : '0.00'; }

function ta(code, size=36) {
  const c = getTeamColor(code);
  return `<div class="ta" style="background:${c};width:${size}px;height:${size}px;font-size:${size*0.28}px">${code}</div>`;
}

// ─── NAVIGATION ──────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(el.dataset.page);
    if (window.innerWidth < 768) document.getElementById('sidebar').classList.remove('open');
  });
});
document.querySelectorAll('.see-all').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); navigateTo(el.dataset.page); });
});
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  const navEl  = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (pageEl) pageEl.classList.add('active');
  if (navEl)  navEl.classList.add('active');
  document.getElementById('page-title').textContent = {
    dashboard:'Dashboard', groups:'Groups', teams:'Teams', matches:'Matches',
    players:'Players', standings:'Standings', livescore:'Live Score'
  }[page] || page;
  renderPage(page);
}

function renderPage(p) {
  switch(p) {
    case 'dashboard': renderDashboard(); break;
    case 'groups':    renderGroups(); break;
    case 'teams':     renderTeams(); break;
    case 'matches':   renderMatches(); break;
    case 'players':   renderPlayers(); break;
    case 'standings': renderStandings(); break;
    case 'livescore': renderLivePage(); break;
  }
}

// ─── DASHBOARD ───────────────────────────────────────────────
function renderDashboard() {
  document.getElementById('st-teams').textContent   = teams.length;
  document.getElementById('st-matches').textContent = matches.length;
  document.getElementById('st-players').textContent = players.length;
  document.getElementById('st-done').textContent    = matches.filter(m=>m.status==='completed').length;

  // Live card
  const liveM = matches.find(m => m.status === 'live');
  const liveBody = document.getElementById('dash-live-body');
  if (liveM) {
    const t1 = getTeam(liveM.t1), t2 = getTeam(liveM.t2);
    liveBody.innerHTML = `
      <div class="live-match-display" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0">
        <div style="text-align:center;flex:1">${ta(liveM.t1,46)}<div style="font-size:.78rem;color:var(--muted);margin-top:6px">${getTeamName(liveM.t1)}</div><div style="font-family:var(--font-h);font-size:1.8rem;margin-top:4px">${liveM.s1||'0/0'}</div></div>
        <div style="font-family:var(--font-h);font-size:1.2rem;color:var(--accent)">VS</div>
        <div style="text-align:center;flex:1">${ta(liveM.t2,46)}<div style="font-size:.78rem;color:var(--muted);margin-top:6px">${getTeamName(liveM.t2)}</div><div style="font-family:var(--font-h);font-size:1.8rem;margin-top:4px">${liveM.s2||'—'}</div></div>
      </div>`;
  } else {
    liveBody.innerHTML = `<div class="empty-state"><i class="fas fa-broadcast-tower"></i><p>No live match</p></div>`;
  }

  // Recent results
  const recent = matches.filter(m=>m.status==='completed').slice(-4).reverse();
  document.getElementById('dash-recent').innerHTML = recent.length
    ? recent.map(m=>`
      <div class="result-row">
        <div class="result-teams">${ta(m.t1,24)} <span>${getTeamName(m.t1)}</span> <span style="color:var(--muted)">vs</span> ${ta(m.t2,24)} <span>${getTeamName(m.t2)}</span></div>
        <div><div class="result-win">${m.winner?getTeamName(m.winner)+' won':''}</div><div class="result-date">${fmtDate(m.date)}</div></div>
      </div>`).join('')
    : '<div class="empty-state" style="padding:20px"><p>No results yet</p></div>';

  // Mini standings
  const sorted = calcStandings();
  document.getElementById('dash-standings').innerHTML = sorted.slice(0,5).map((t,i)=>`
    <tr>
      <td><span class="pos-badge ${i<3?'p'+(i+1):'pn'}">${i+1}</span></td>
      <td><div style="display:flex;align-items:center;gap:8px">${ta(t.code,28)}<span>${t.name}</span></div></td>
      <td>${t.played}</td><td style="color:var(--accent)">${t.won}</td><td style="color:var(--red)">${t.lost}</td>
      <td class="pts-cell">${t.pts}</td>
      <td class="${parseFloat(t.nrr)>=0?'nrr-pos':'nrr-neg'}">${t.nrr}</td>
    </tr>`).join('');
}

// ─── NRR CALCULATION ─────────────────────────────────────────
function calcNRR(teamCode) {
  let runsScored=0, oversFaced=0, runsConceded=0, oversBowled=0;
  matches.filter(m=>m.status==='completed').forEach(m=>{
    if (!m.scorecard) return;
    const sc = m.scorecard;
    if (m.t1===teamCode && sc.inn1) {
      runsScored  += sc.inn1.runs;  oversFaced   += sc.inn1.balls/6;
      runsConceded+= sc.inn2 ? sc.inn2.runs : 0; oversBowled += sc.inn2 ? sc.inn2.balls/6 : 0;
    } else if (m.t2===teamCode && sc.inn2) {
      runsScored  += sc.inn2.runs;  oversFaced   += sc.inn2.balls/6;
      runsConceded+= sc.inn1 ? sc.inn1.runs : 0; oversBowled += sc.inn1 ? sc.inn1.balls/6 : 0;
    }
  });
  if (oversFaced===0 && oversBowled===0) return '+0.000';
  const rr1 = oversFaced  > 0 ? runsScored  / oversFaced  : 0;
  const rr2 = oversBowled > 0 ? runsConceded/ oversBowled : 0;
  const nrr = rr1 - rr2;
  return (nrr >= 0 ? '+' : '') + nrr.toFixed(3);
}

function calcStandings(groupFilter) {
  let t = teams.slice();
  if (groupFilter) t = t.filter(x=>x.group===groupFilter);
  return t.map(tm=>({
    ...tm,
    pts: tm.won*2 + tm.nr,
    nrr: calcNRR(tm.code),
    form: getForm(tm.code),
  })).sort((a,b)=> b.pts-a.pts || parseFloat(b.nrr)-parseFloat(a.nrr));
}

function getForm(code) {
  return matches.filter(m=>m.status==='completed'&&(m.t1===code||m.t2===code))
    .slice(-5).map(m=>m.winner===code?'W':'L');
}

// ─── GROUPS ──────────────────────────────────────────────────
function renderGroups() {
  const grid = document.getElementById('group-grid');
  if (!groups.length) {
    grid.innerHTML = `<div class="empty-state card" style="grid-column:1/-1"><i class="fas fa-layer-group"></i><h3>No Groups</h3><p>Add groups to organise your tournament</p></div>`;
    return;
  }
  grid.innerHTML = groups.map(g => {
    const gTeams = teams.filter(t => t.group === g.name);
    return `<div class="group-card">
      <div class="group-header" style="background:linear-gradient(135deg,rgba(163,230,53,.1),rgba(163,230,53,.03))">
        <div><div class="group-name">${g.name}</div><div class="group-stage">${g.stage} stage</div></div>
        <div style="display:flex;gap:6px">
          <button class="btn-sm btn-del" onclick="deleteGroup(${g.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="group-teams">
        ${gTeams.length ? gTeams.map(t=>`<div class="group-team-row">${ta(t.code,28)}<span>${t.name}</span><span style="margin-left:auto;font-size:.72rem;color:var(--muted)">${t.won*2}pts</span></div>`).join('')
        : '<div style="color:var(--muted);font-size:.8rem;padding:8px 0">No teams assigned</div>'}
      </div>
    </div>`;
  }).join('');
}

async function addGroup() {
  const name  = document.getElementById('f-gname').value.trim();
  const stage = document.getElementById('f-gstage').value;
  if (!name) return showToast('Group name required','error');
  if (groups.find(g=>g.name===name)) return showToast('Group already exists','error');
  try {
    await apiRequest('groups', { method:'POST', body:{ name, stage } });
    await loadAllData();
    refreshCurrentView();
    closeModal('modal-add-group');
    document.getElementById('f-gname').value='';
    showToast(`${name} created`);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function deleteGroup(id) {
  if (!confirm('Delete this group? Teams will be unassigned.')) return;
  try {
    await apiRequest('groups', { method:'DELETE', id });
    await loadAllData();
    refreshCurrentView();
    showToast('Group deleted');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function refreshGroupSelects() {
  const opts = groups.map(g=>`<option value="${g.name}">${g.name}</option>`).join('');
  document.getElementById('f-tgroup').innerHTML = '<option value="">No Group</option>' + opts;
  // Team group filter buttons
  const fs = document.getElementById('team-group-filters');
  fs.innerHTML = `<button class="filter-btn ${teamGroupFilter==='all'?'active':''}" onclick="filterTeamsByGroup('all')">All</button>`
    + groups.map(g=>`<button class="filter-btn ${teamGroupFilter===g.name?'active':''}" onclick="filterTeamsByGroup('${g.name}')">${g.name}</button>`).join('');
}

// ─── TEAMS ───────────────────────────────────────────────────
function filterTeamsByGroup(g) {
  teamGroupFilter = g;
  refreshGroupSelects();
  renderTeams();
}

function renderTeams() {
  refreshGroupSelects();
  const grid = document.getElementById('team-grid');
  let list = teams;
  if (teamGroupFilter !== 'all') list = list.filter(t=>t.group===teamGroupFilter);
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state card" style="grid-column:1/-1"><i class="fas fa-shield-alt"></i><h3>No Teams</h3><p>Add a team to get started</p></div>`;
    return;
  }
  grid.innerHTML = list.map(t=>{
    const pts = t.won*2+t.nr, nrr=calcNRR(t.code);
    return `<div class="team-card">
      <div class="tc-header" style="background:linear-gradient(135deg,${t.color}cc,${t.color}55)">
        <div class="tc-badge">${t.code}</div>
        <div><div class="tc-name">${t.name}</div><div class="tc-code">${t.code}</div></div>
      </div>
      <div class="tc-body">
        ${t.group?`<div class="group-chip"><i class="fas fa-layer-group"></i>${t.group}</div>`:''}
        <div class="tc-meta">
          <div class="tc-meta-row"><i class="fas fa-map-pin"></i><span>${t.ground||'—'}</span></div>
          <div class="tc-meta-row"><i class="fas fa-user"></i><span>Captain: <strong>${t.captain||'—'}</strong></span></div>
          <div class="tc-meta-row"><i class="fas fa-users"></i><span>${teamPlayers(t.code).length} players registered</span></div>
        </div>
        <div class="tc-stats">
          <div class="tc-stat"><span class="tcs-v">${t.played}</span><span class="tcs-l">P</span></div>
          <div class="tc-stat"><span class="tcs-v" style="color:var(--accent)">${t.won}</span><span class="tcs-l">W</span></div>
          <div class="tc-stat"><span class="tcs-v" style="color:var(--red)">${t.lost}</span><span class="tcs-l">L</span></div>
          <div class="tc-stat"><span class="tcs-v" style="color:var(--yellow)">${pts}</span><span class="tcs-l">Pts</span></div>
          <div class="tc-stat"><span class="tcs-v ${parseFloat(nrr)>=0?'nrr-pos':'nrr-neg'}" style="font-size:.72rem">${nrr}</span><span class="tcs-l">NRR</span></div>
        </div>
        <div class="tc-actions">
          <button class="btn-sm btn-edit" onclick="openEditTeam(${t.id})"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-sm btn-del"  onclick="deleteTeam(${t.id})"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function openAddTeam() { editTeamId=null; document.getElementById('team-modal-title').textContent='Add Team'; document.getElementById('team-modal-btn').textContent='Add Team'; ['f-tname2','f-tcode','f-tground','f-tcaptain'].forEach(id=>{document.getElementById(id).value=''}); document.getElementById('f-tcolor').value='#1a73e8'; document.getElementById('f-tgroup').value=''; openModal('modal-add-team'); }

function openEditTeam(id) {
  const t = teams.find(x=>x.id===id);
  if (!t) return;
  editTeamId = id;
  document.getElementById('team-modal-title').textContent = 'Edit Team';
  document.getElementById('team-modal-btn').textContent = 'Save Changes';
  document.getElementById('f-tname2').value  = t.name;
  document.getElementById('f-tcode').value   = t.code;
  document.getElementById('f-tcolor').value  = t.color;
  document.getElementById('f-tground').value = t.ground||'';
  document.getElementById('f-tcaptain').value= t.captain||'';
  refreshGroupSelects();
  document.getElementById('f-tgroup').value  = t.group||'';
  openModal('modal-add-team');
}

async function saveTeam() {
  const name    = document.getElementById('f-tname2').value.trim();
  const code    = document.getElementById('f-tcode').value.trim().toUpperCase();
  const color   = document.getElementById('f-tcolor').value;
  const group   = document.getElementById('f-tgroup').value;
  const captain = document.getElementById('f-tcaptain').value.trim();
  const ground  = document.getElementById('f-tground').value.trim();
  if (!name||!code) return showToast('Name and code required','error');
  try {
    if (editTeamId) {
      await apiRequest('teams', {
        method:'PUT',
        id:editTeamId,
        body:{ name, code, color, group_name:group, captain, ground }
      });
      showToast('Team updated');
    } else {
      if (teams.find(t=>t.code===code)) return showToast('Team code exists','error');
      await apiRequest('teams', {
        method:'POST',
        body:{ name, code, color, group_name:group, captain, ground }
      });
      showToast(`${name} added`);
    }
    await loadAllData();
    refreshCurrentView();
    closeModal('modal-add-team');
    editTeamId=null;
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function deleteTeam(id) {
  if (!confirm('Delete team?')) return;
  try {
    await apiRequest('teams', { method:'DELETE', id });
    await loadAllData();
    refreshCurrentView();
    showToast('Team deleted');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ─── MATCHES ─────────────────────────────────────────────────
function toggleCustomOvers() {
  const v = document.getElementById('f-movers').value;
  document.getElementById('custom-overs-group').style.display = v==='custom' ? 'block' : 'none';
}

async function scheduleMatch() {
  const t1    = document.getElementById('f-mt1').value;
  const t2    = document.getElementById('f-mt2').value;
  const date  = document.getElementById('f-mdate').value;
  const venue = document.getElementById('f-mvenue').value.trim();
  const type  = document.getElementById('f-mtype').value;
  let overs   = document.getElementById('f-movers').value;
  if (overs==='custom') overs = document.getElementById('f-mcustom').value;
  overs = parseInt(overs)||20;
  let maxW = document.getElementById('f-mwickets').value;
  if (maxW==='auto') maxW = 10; else maxW = parseInt(maxW)||10;
  if (!t1||!t2||!date) return showToast('Teams and date required','error');
  if (t1===t2) return showToast('Teams must be different','error');
  try {
    await apiRequest('matches', {
      method:'POST',
      body:{
        team1_code:t1,
        team2_code:t2,
        match_date:date,
        venue,
        match_type:type,
        overs_per_innings:overs,
        max_wickets:maxW,
      }
    });
    await loadAllData();
    refreshCurrentView();
    closeModal('modal-add-match');
    showToast('Match scheduled');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function renderMatches() {
  const list = document.getElementById('matches-list');
  let data = matchFilter==='all' ? matches : matches.filter(m=>m.status===matchFilter);
  data = [...data].sort((a,b)=>new Date(a.date)-new Date(b.date));
  if (!data.length) {
    list.innerHTML=`<div class="empty-state card"><i class="fas fa-calendar-alt"></i><h3>No Matches</h3><p>No ${matchFilter} matches</p></div>`;
    return;
  }
  list.innerHTML = data.map(m=>{
    const isLive = m.status==='live';
    const badgeClass = {'league':'mb-league','quarter':'mb-quarter','semi':'mb-semi','final':'mb-final'}[m.type]||'mb-league';
    const sCls = {'upcoming':'sb-upcoming','live':'sb-live','completed':'sb-completed'}[m.status];
    return `<div class="match-card ${isLive?'live-card-m':''}">
      <div style="display:flex;flex-direction:column;gap:6px;min-width:90px">
        <span class="match-badge ${isLive?'mb-live':badgeClass}">${isLive?'🔴 LIVE':m.type.toUpperCase()}</span>
        <span style="font-size:.72rem;color:var(--muted)">${fmtDate(m.date)}</span>
        <span style="font-size:.68rem;color:var(--muted)">${m.overs} ov | ${m.maxW}wkts</span>
      </div>
      <div class="match-teams">
        <div class="match-team">${ta(m.t1,36)}<div><div class="mt-nm">${getTeamName(m.t1)}</div>${m.s1?`<div class="mt-sc">${m.s1}</div>`:''}</div></div>
        <div class="match-vs">VS</div>
        <div class="match-team">${ta(m.t2,36)}<div><div class="mt-nm">${getTeamName(m.t2)}</div>${m.s2?`<div class="mt-sc">${m.s2}</div>`:''}</div></div>
      </div>
      <div class="match-info">
        <span><i class="fas fa-map-pin" style="margin-right:4px"></i>${m.venue||'TBD'}</span>
        ${m.winner?`<span style="color:var(--accent);font-weight:700">${getTeamName(m.winner)} won</span>`:''}
      </div>
      <div class="match-actions">
        ${m.status==='completed'?`<button class="btn-sm btn-view" onclick="showScorecard(${m.id})"><i class="fas fa-list"></i> Card</button>`:''}
        ${m.status==='upcoming'?`<button class="btn-sm btn-edit" onclick="goLive(${m.id})"><i class="fas fa-play"></i> Live</button>`:''}
        <button class="btn-sm btn-del" onclick="deleteMatch(${m.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
}

document.querySelectorAll('.filter-btn[data-mf]').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn[data-mf]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); matchFilter=b.dataset.mf; renderMatches();
  });
});

async function deleteMatch(id) {
  if (!confirm('Delete match?')) return;
  try {
    await apiRequest('matches', { method:'DELETE', id });
    await loadAllData();
    refreshCurrentView();
    showToast('Match deleted');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function goLive(id) {
  navigateTo('livescore');
  setTimeout(()=>{ document.getElementById('f-livematch').value=id; openModal('modal-start-live'); },100);
}

function showScorecard(id) {
  const m = matches.find(x=>x.id===id);
  if (!m) return;
  const sc = m.scorecard;
  const body = document.getElementById('scorecard-body');
  if (!sc) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--muted)">No detailed scorecard available for this match.</div>
      <div style="text-align:center;font-size:.9rem"><strong>${getTeamName(m.t1)} ${m.s1||'—'}</strong> vs <strong>${getTeamName(m.t2)} ${m.s2||'—'}</strong><br>
      ${m.summary?`<div style="color:var(--accent);margin-top:8px">${m.summary}</div>`:''}
      ${m.potm?`<div style="color:var(--muted);margin-top:6px">POTM: ${m.potm}</div>`:''}</div>`;
  } else {
    body.innerHTML = buildScorecardHTML(m, sc);
  }
  openModal('modal-scorecard');
}

function buildScorecardHTML(m, sc) {
  const renderInn = (inn, title) => {
    if (!inn) return '';
    const batRows = Object.entries(inn.batsmen||{}).filter(([,d])=>d.status!=='dnb').map(([n,d])=>`
      <tr><td>${n}</td><td>${d.status==='out'?`<span style="font-size:.72rem;color:var(--red)">${d.dismissal||'out'}</span>`:'<span style="color:var(--accent);font-size:.72rem">not out</span>'}</td>
      <td>${d.runs}</td><td>${d.balls}</td><td>${d.fours}</td><td>${d.sixes}</td><td>${srCalc(d.runs,d.balls)}</td></tr>`).join('');
    const bwRows = Object.entries(inn.bowlers||{}).filter(([,d])=>d.balls>0).map(([n,d])=>`
      <tr><td>${n}</td><td>${oversStr(d.balls)}</td><td>${d.maidens}</td><td>${d.runs}</td><td style="color:var(--yellow)">${d.wickets}</td><td>${econCalc(d.runs,d.balls)}</td></tr>`).join('');
    const ex = inn.extras||{};
    return `<div class="sc-inn-title">${title} — ${inn.runs}/${inn.wickets} (${oversStr(inn.balls)} ov)</div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Batsman</th><th>Dismissal</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead><tbody>${batRows||'<tr><td colspan="7" style="color:var(--muted);text-align:center">No data</td></tr>'}</tbody></table></div>
      <div class="extras-bar" style="margin:8px 0 12px">Extras: ${(ex.wide||0)+(ex.noBall||0)+(ex.legBye||0)} (Wd:${ex.wide||0} Nb:${ex.noBall||0} Lb:${ex.legBye||0})</div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>Econ</th></tr></thead><tbody>${bwRows||'<tr><td colspan="6" style="color:var(--muted);text-align:center">No data</td></tr>'}</tbody></table></div>`;
  };
  return `<div style="margin-bottom:12px"><strong style="color:var(--accent)">${m.summary}</strong>${m.potm?`<div style="font-size:.8rem;color:var(--muted);margin-top:4px">Player of the Match: <strong style="color:var(--text)">${m.potm}</strong></div>`:''}</div>
    ${renderInn(sc.inn1, getTeamName(m.t1) + ' Innings')}
    ${renderInn(sc.inn2, getTeamName(m.t2) + ' Innings')}`;
}

// ─── PLAYERS ─────────────────────────────────────────────────
function renderPlayers() {
  let list = playerFilter==='all' ? players : players.filter(p=>p.role===playerFilter);
  const tbody = document.getElementById('players-tbody');
  if (!list.length) {
    tbody.innerHTML=`<tr><td colspan="8"><div class="empty-state"><i class="fas fa-users"></i><h3>No Players</h3></div></td></tr>`;
    return;
  }
  tbody.innerHTML = list.map((p,i)=>{
    const rbMap={batsman:'rb-bat',bowler:'rb-bow',allrounder:'rb-all',wicketkeeper:'rb-wk'};
    const col=getTeamColor(p.team);
    const initials=p.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return `<tr>
      <td style="color:var(--muted)">${p.jersey||i+1}</td>
      <td><div style="display:flex;align-items:center;gap:9px"><div class="ta" style="background:${col};width:30px;height:30px;font-size:.68rem">${initials}</div><div><div style="font-weight:600">${p.name}</div><div style="font-size:.7rem;color:var(--muted)">${p.country||''}</div></div></div></td>
      <td><div style="display:flex;align-items:center;gap:7px">${ta(p.team,22)}<span>${getTeamName(p.team)}</span></div></td>
      <td><span class="rb ${rbMap[p.role]||'rb-bat'}">${p.role}</span></td>
      <td>${p.m}</td>
      <td style="color:var(--blue);font-weight:700">${p.runs}</td>
      <td style="color:var(--yellow);font-weight:700">${p.wkts}</td>
      <td><div style="display:flex;gap:6px">
        <button class="btn-sm btn-edit" onclick="openEditPlayer(${p.id})"><i class="fas fa-edit"></i></button>
        <button class="btn-sm btn-del"  onclick="deletePlayer(${p.id})"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}

document.querySelectorAll('.filter-btn[data-pf]').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn[data-pf]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); playerFilter=b.dataset.pf; renderPlayers();
  });
});

function populatePlayerTeamSel() {
  document.getElementById('f-pteam').innerHTML = teams.map(t=>`<option value="${t.code}">${t.name} (${t.code})</option>`).join('');
}

function openAddPlayer() {
  editPlayerId=null;
  document.getElementById('player-modal-title').textContent='Register Player';
  document.getElementById('player-modal-btn').textContent='Register';
  populatePlayerTeamSel();
  ['f-pname','f-pjersey','f-pcountry','f-pmatches','f-pruns','f-pwickets'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('f-prole').value='batsman';
  openModal('modal-add-player');
}
function openEditPlayer(id) {
  const p=players.find(x=>x.id===id); if(!p) return;
  editPlayerId=id;
  document.getElementById('player-modal-title').textContent='Edit Player';
  document.getElementById('player-modal-btn').textContent='Save';
  populatePlayerTeamSel();
  document.getElementById('f-pname').value=p.name; document.getElementById('f-pteam').value=p.team;
  document.getElementById('f-prole').value=p.role; document.getElementById('f-pjersey').value=p.jersey||'';
  document.getElementById('f-pcountry').value=p.country||'';
  document.getElementById('f-pmatches').value=p.m||0;
  document.getElementById('f-pruns').value=p.runs||0;
  document.getElementById('f-pwickets').value=p.wkts||0;
  openModal('modal-add-player');
}

async function savePlayer() {
  const name=document.getElementById('f-pname').value.trim();
  const team=document.getElementById('f-pteam').value;
  const role=document.getElementById('f-prole').value;
  const jersey=parseInt(document.getElementById('f-pjersey').value)||0;
  const country=document.getElementById('f-pcountry').value.trim();
  const matchesPlayed=parseInt(document.getElementById('f-pmatches').value)||0;
  const totalRuns=parseInt(document.getElementById('f-pruns').value)||0;
  const totalWickets=parseInt(document.getElementById('f-pwickets').value)||0;
  if(!name||!team) return showToast('Name and team required','error');
  try {
    if (editPlayerId) {
      await apiRequest('players', {
        method:'PUT',
        id:editPlayerId,
        body:{
          name,
          team_code:team,
          role,
          jersey_number:jersey || null,
          nationality:country,
          matches_played:matchesPlayed,
          total_runs:totalRuns,
          total_wickets:totalWickets
        }
      });
      showToast('Player updated');
    } else {
      await apiRequest('players', {
        method:'POST',
        body:{
          name,
          team_code:team,
          role,
          jersey_number:jersey || null,
          nationality:country,
          matches_played:matchesPlayed,
          total_runs:totalRuns,
          total_wickets:totalWickets
        }
      });
      showToast(`${name} registered`);
    }
    await loadAllData();
    refreshCurrentView();
    closeModal('modal-add-player');
    editPlayerId=null;
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function deletePlayer(id) {
  if(!confirm('Remove player?')) return;
  try {
    await apiRequest('players', { method:'DELETE', id });
    await loadAllData();
    refreshCurrentView();
    showToast('Player removed');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function bulkAddPlayers() {
  const raw=document.getElementById('f-bulk').value.trim();
  if(!raw) return showToast('No data entered','error');
  const lines=raw.split('\n').filter(l=>l.trim());
  let errs=0;
  const payload = [];
  lines.forEach((line,idx)=>{
    const parts=line.split(',').map(s=>s.trim());
    if(parts.length<2){errs++;return;}
    const [name,code,...rest]=parts;
    const role=(rest[0]||'batsman').toLowerCase().replace(/[^a-z]/g,'');
    const validRole=['batsman','bowler','allrounder','wicketkeeper'].includes(role)?role:'batsman';
    const jersey=parseInt(rest[1])||0;
    const country=rest[2]||'';
    const teamCode=code.toUpperCase();
    if(!name||!teamCode){errs++;return;}
    payload.push({
      name,
      team_code:teamCode,
      role:validRole,
      jersey_number:jersey || null,
      nationality:country
    });
  });
  if (!payload.length) return showToast('No valid players found','error');
  try {
    const result = await apiRequest('players', {
      method:'POST',
      params:{ bulk:1 },
      body:{ players:payload }
    });
    await loadAllData();
    refreshCurrentView();
    closeModal('modal-bulk-players');
    document.getElementById('f-bulk').value='';
    const added = Number(result?.added || payload.length);
    showToast(`${added} player${added!==1?'s':''} imported${errs?', '+errs+' skipped':''}`);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ─── STANDINGS ───────────────────────────────────────────────
function renderStandings() {
  const container = document.getElementById('standings-groups-container');
  const baseGroups = groups.length ? groups.map(g => ({ name:g.name, filter:g.name })) : [{ name:'All Teams', filter:undefined }];
  const hasUngroupedTeams = teams.some(t => !t.group);
  const groupsToShow = hasUngroupedTeams
    ? [...baseGroups, { name:'Ungrouped Teams', filter:'__ungrouped__' }]
    : baseGroups;

  container.innerHTML = groupsToShow.map(g=>{
    const sorted = g.filter === '__ungrouped__'
      ? calcStandings().filter(t => !t.group)
      : calcStandings(g.filter);

    const rows = sorted.length ? sorted.map((t,i)=>`
      <tr>
        <td><span class="pos-badge ${i<2?'p'+(i+1):'pn'}">${i+1}</span></td>
        <td><div style="display:flex;align-items:center;gap:10px">${ta(t.code,32)}<div><div style="font-weight:600">${t.name}</div><div style="font-size:.7rem;color:var(--muted)">${t.code}</div></div></div></td>
        <td>${t.played}</td>
        <td style="color:var(--accent);font-weight:700">${t.won}</td>
        <td style="color:var(--red)">${t.lost}</td>
        <td>${t.nr}</td>
        <td class="pts-cell">${t.pts}</td>
        <td class="${parseFloat(t.nrr)>=0?'nrr-pos':'nrr-neg'}">${t.nrr}</td>
        <td><div class="form-dots">${t.form.map(f=>`<div class="fd fd-${f.toLowerCase()}">${f}</div>`).join('')}</div></td>
      </tr>`).join('')
      : `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:18px">No teams in this group yet</td></tr>`;

    return `<div class="standings-group">
      <div class="standings-group-title"><i class="fas fa-layer-group"></i>${g.name}</div>
      <div class="card"><div class="table-wrap"><table class="data-table">
        <thead><tr><th>Pos</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>NR</th><th>Pts</th><th>NRR</th><th>Form</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div></div>
    </div>`;
  }).join('');
}

// ─── UTILITY ─────────────────────────────────────────────────
function updateStats() {
  document.getElementById('st-teams').textContent   = teams.length;
  document.getElementById('st-matches').textContent = matches.length;
  document.getElementById('st-players').textContent = players.length;
  document.getElementById('st-done').textContent    = matches.filter(m=>m.status==='completed').length;
}

function populateMatchTeamSels() {
  const opts = teams.map(t=>`<option value="${t.code}">${t.name} (${t.code})</option>`).join('');
  document.getElementById('f-mt1').innerHTML = opts;
  document.getElementById('f-mt2').innerHTML = opts;
}

// ─── MODALS ──────────────────────────────────────────────────
function openModal(id) {
  if (id==='modal-add-team') refreshGroupSelects();
  if (id==='modal-add-match') populateMatchTeamSels();
  if (id==='modal-add-player') populatePlayerTeamSel();
  if (id==='modal-start-live') populateStartLiveModal();
  document.getElementById(id).classList.add('open');
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(o=>{
  o.addEventListener('click',e=>{ if(e.target===o) o.classList.remove('open'); });
});

// Redirect openAddTeam/Player buttons
window.openAddTeam = openAddTeam;

// ─── TOAST ───────────────────────────────────────────────────
function showToast(msg, type='success') {
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast'+(type==='error'?' error':type==='warn'?' warn':'');
  t.classList.add('show'); clearTimeout(t._t);
  t._t=setTimeout(()=>t.classList.remove('show'),3000);
}

// ─── TOURNAMENT ──────────────────────────────────────────────
function createTournament() {
  const name=document.getElementById('f-tname').value.trim();
  if(!name) return showToast('Enter tournament name','error');
  document.getElementById('t-name-side').textContent=name;
  closeModal('modal-tournament'); showToast(`${name} set as active tournament`);
}

// ══════════════════════════════════════════════════════════════
//   LIVE SCORE ENGINE
// ══════════════════════════════════════════════════════════════

const LS_DEF = {
  matchId: null, t1:null, t2:null, battingFirst:null,
  inn: 1, maxOvers:20, maxWickets:10,
  toss:{winner:null,choice:null},
  status:'idle', // idle|live|over_break|completed
  innings:[null,null], // [0]=1st inn data, [1]=2nd inn data
};

function mkInnData(batTeam, bowlTeam) {
  const batters = {}, bowlers = {};
  teamPlayers(batTeam).forEach(p=>{ batters[p.name]={runs:0,balls:0,fours:0,sixes:0,status:'dnb',dismissal:''}; });
  teamPlayers(bowlTeam).forEach(p=>{ bowlers[p.name]={balls:0,runs:0,wickets:0,maidens:0}; });
  return { batTeam, bowlTeam, runs:0, wickets:0, balls:0,
    extras:{wide:0,noBall:0,legBye:0}, batsmen:batters, bowlers,
    striker:null, nonStriker:null, currentBowler:null, prevBowler:null,
    currentOverBalls:[], overLog:[], commentary:[], target:null };
}

let LS = JSON.parse(localStorage.getItem('cp_live')) || JSON.parse(JSON.stringify(LS_DEF));

function saveLive() { localStorage.setItem('cp_live', JSON.stringify(LS)); }

function currInn() { return LS.innings[LS.inn-1]; }

// ─── RENDER LIVE PAGE ────────────────────────────────────────
function renderLivePage() {
  const idle   = document.getElementById('ls-idle');
  const active = document.getElementById('ls-active');
  const startB = document.getElementById('btn-start-live');
  const endB   = document.getElementById('btn-end-match');
  const badge  = document.getElementById('nav-live-badge');

  if (LS.status==='idle') {
    idle.style.display='flex'; active.style.display='none';
    startB.style.display='flex'; endB.style.display='none';
    badge.style.display='none';
    return;
  }
  idle.style.display='none'; active.style.display='block';
  startB.style.display='none'; endB.style.display='flex';
  badge.style.display='inline-flex';

  renderTopBoard();
  if (LS.status==='completed') {
    renderMatchSummary();
  } else {
    document.getElementById('ls-match-summary').style.display='none';
    populateLiveSelects();
    refreshScoreboard();
    updateBowlerLock();
  }
}

// ─── START LIVE MATCH ────────────────────────────────────────
function populateStartLiveModal() {
  const avail = matches.filter(m=>m.status==='upcoming'||m.status==='live');
  const sel = document.getElementById('f-livematch');
  sel.innerHTML = avail.length
    ? avail.map(m=>`<option value="${m.id}">${getTeamName(m.t1)} vs ${getTeamName(m.t2)} — ${fmtDate(m.date)} (${m.overs}ov)</option>`).join('')
    : '<option>No upcoming matches</option>';
  sel.onchange = updateLiveTossTeams;
  updateLiveTossTeams();
}

function updateLiveTossTeams() {
  const id=parseInt(document.getElementById('f-livematch').value);
  const m=matches.find(x=>x.id===id); if(!m) return;
  document.getElementById('f-livetoss').innerHTML=[m.t1,m.t2].map(c=>`<option value="${c}">${getTeamName(c)} (${c})</option>`).join('');
}

async function startLiveMatch() {
  const id=parseInt(document.getElementById('f-livematch').value);
  const toss=document.getElementById('f-livetoss').value;
  const choice=document.getElementById('f-livechoice').value;
  const m=matches.find(x=>x.id===id); if(!m) return showToast('Match not found','error');
  const batFirst = choice==='bat' ? toss : (toss===m.t1?m.t2:m.t1);
  const bowlFirst= batFirst===m.t1 ? m.t2 : m.t1;

  // Determine max wickets from squad
  const batSquad = teamPlayers(batFirst).length;
  const actualMaxW = Math.min(m.maxW, batSquad>1 ? batSquad-1 : 10);

  LS = {
    matchId:id, t1:m.t1, t2:m.t2, battingFirst:batFirst,
    inn:1, maxOvers:m.overs, maxWickets:actualMaxW,
    toss:{winner:toss,choice}, status:'live',
    innings:[mkInnData(batFirst,bowlFirst), mkInnData(bowlFirst,batFirst)],
  };

  // Set first two batsmen and first bowler as defaults
  const batPlayers = teamPlayers(batFirst);
  const bowlPlayers = teamPlayers(bowlFirst);
  const inn=LS.innings[0];
  if (batPlayers[0]) { inn.striker=batPlayers[0].name; inn.batsmen[inn.striker].status='not out'; }
  if (batPlayers[1]) { inn.nonStriker=batPlayers[1].name; inn.batsmen[inn.nonStriker].status='not out'; }
  if (bowlPlayers[0]) inn.currentBowler=bowlPlayers[0].name;

  try {
    await apiRequest('matches', {
      method:'PUT',
      id,
      body:{ status:'live', score1:'', score2:'', scorecard:{ inn1:LS.innings[0], inn2:LS.innings[1] } }
    });
    const mIdx=matches.findIndex(x=>x.id===id);
    if(mIdx!==-1){matches[mIdx].status='live';}
    saveLive();
    closeModal('modal-start-live');
    renderLivePage();
    showToast(`🏏 ${getTeamName(batFirst)} batting first! Max wickets: ${actualMaxW}`);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ─── POPULATE SELECTS ────────────────────────────────────────
function populateLiveSelects() {
  const inn=currInn(); if(!inn) return;
  const batP=Object.keys(inn.batsmen);
  const bowlP=Object.keys(inn.bowlers);

  const selStr=document.getElementById('sel-striker');
  const selNS=document.getElementById('sel-nonstriker');
  const selBw=document.getElementById('sel-bowler');

  selStr.innerHTML=batP.map(n=>`<option value="${n}">${n}</option>`).join('');
  selNS.innerHTML=batP.map(n=>`<option value="${n}">${n}</option>`).join('');
  selBw.innerHTML=bowlP.map(n=>`<option value="${n}">${n}</option>`).join('');

  if(inn.striker) selStr.value=inn.striker;
  if(inn.nonStriker) selNS.value=inn.nonStriker;
  if(inn.currentBowler) selBw.value=inn.currentBowler;
}

function setStriker()    { currInn().striker=document.getElementById('sel-striker').value; saveLive(); refreshScoreboard(); }
function setNonStriker() { currInn().nonStriker=document.getElementById('sel-nonstriker').value; saveLive(); refreshScoreboard(); }
function setBowler()     { currInn().currentBowler=document.getElementById('sel-bowler').value; saveLive(); refreshScoreboard(); }

// ─── BALL ENTRY ──────────────────────────────────────────────
function addBall(ev) {
  if(LS.status!=='live') return;
  const inn=currInn();
  if(!inn.striker||!inn.nonStriker||!inn.currentBowler) return showToast('Select batsmen & bowler','error');
  if(ev==='W'){showWicketModal();return;}
  processBallEvent(ev);
}

function addCustomRuns() {
  const v=parseInt(document.getElementById('custom-runs').value);
  if(isNaN(v)||v<0) return showToast('Enter valid runs','error');
  processBallEvent(String(v));
  document.getElementById('custom-runs').value='';
}

function processBallEvent(ev) {
  const inn=currInn();
  const striker=inn.striker, bowler=inn.currentBowler;
  let runs=0, legal=true, ballCls='ob-dot', commText='', commSub='';

  if(ev==='Wd'){
    runs=1; legal=false; inn.extras.wide++; inn.runs++;
    if(inn.bowlers[bowler]) inn.bowlers[bowler].runs++;
    ballCls='ob-ext'; commText='Wide ball. 1 extra.';
  } else if(ev==='Nb'){
    runs=1; legal=false; inn.extras.noBall++; inn.runs++;
    if(inn.bowlers[bowler]) inn.bowlers[bowler].runs++;
    ballCls='ob-ext'; commText='No ball! Free hit next delivery.';
  } else if(ev==='Lb'){
    runs=1; legal=true; inn.extras.legBye++; inn.runs++;
    ballCls='ob-ext'; commText='Leg bye. 1 run.';
  } else {
    runs=parseInt(ev)||0;
    inn.runs+=runs;
    if(inn.batsmen[striker]){
      inn.batsmen[striker].runs+=runs;
      inn.batsmen[striker].balls++;
      if(runs===4){inn.batsmen[striker].fours++;ballCls='ob-four';}
      else if(runs===6){inn.batsmen[striker].sixes++;ballCls='ob-six';}
      else if(runs>0){ballCls='ob-run';}
    }
    if(inn.bowlers[bowler]) inn.bowlers[bowler].runs+=runs;
    if(runs===0) commText='Dot ball.';
    else if(runs===4) commText=`FOUR! ${striker} creams it to the boundary!`;
    else if(runs===6) commText=`SIX! ${striker} sends it clean over the rope!`;
    else commText=`${runs} run${runs>1?'s':''}. ${striker} works it away.`;
    commSub=striker+'—'+(inn.batsmen[striker]?.runs||0)+'('+(inn.batsmen[striker]?.balls||0)+')';
  }

  if(legal){
    inn.balls++;
    if(inn.bowlers[bowler]) inn.bowlers[bowler].balls++;
    if(runs%2!==0 && ev!=='Lb') rotateStrike();
  }
  inn.currentOverBalls.push({ev,cls:ballCls});
  inn.commentary.unshift({ball:ev,cls:ballCls,over:oversStr(inn.balls),text:commText,sub:commSub});

  // End of over?
  if(legal && inn.balls>0 && inn.balls%6===0){
    endOver();
    return; // stops here; bowler picker resumes flow
  }

  checkInningsEnd();
  saveLive();
  syncMatch();
  refreshScoreboard();
}

function endOver() {
  const inn=currInn();
  const overNum=Math.floor(inn.balls/6);
  // Check maiden
  const lastOverRuns=inn.currentOverBalls.reduce((s,b)=>{
    if(['Wd','Nb','Lb'].includes(b.ev)) return s+1;
    return s+(parseInt(b.ev)||0);
  },0);
  if(lastOverRuns===0 && inn.bowlers[inn.currentBowler]) inn.bowlers[inn.currentBowler].maidens++;
  inn.overLog.push([...inn.currentOverBalls]);
  inn.currentOverBalls=[];
  rotateStrike();
  inn.commentary.unshift({ball:'END',cls:'ob-dot',over:overNum+'.0',text:`End of over ${overNum}. ${getTeamName(inn.batTeam)} ${inn.runs}/${inn.wickets}`,sub:''});
  inn.prevBowler=inn.currentBowler;
  LS.status='over_break';
  saveLive(); syncMatch(); renderLivePage();
  showToast(`Over ${overNum} complete! Select next bowler.`, 'warn');
}

function updateBowlerLock() {
  const entry=document.getElementById('ls-ball-entry');
  const lock=document.getElementById('ls-bowler-lock');
  if(LS.status==='over_break'){
    entry.style.display='none'; lock.style.display='block';
    // Populate next bowler select (exclude prev bowler)
    const inn=currInn();
    const eligible=Object.keys(inn.bowlers).filter(n=>n!==inn.prevBowler);
    const sel=document.getElementById('sel-next-bowler');
    sel.innerHTML=eligible.map(n=>`<option value="${n}">${n}</option>`).join('');
    const overNum=Math.floor(inn.balls/6)+1;
    document.getElementById('ls-lock-info').textContent=`Over ${overNum} starting. Choose your bowler (${inn.prevBowler?inn.prevBowler+' cannot bowl consecutive overs':''})`;
  } else {
    entry.style.display='block'; lock.style.display='none';
  }
}

function confirmNextBowler() {
  const n=document.getElementById('sel-next-bowler').value;
  if(!n) return showToast('Select a bowler','error');
  currInn().currentBowler=n;
  document.getElementById('sel-bowler').value=n;
  LS.status='live';
  saveLive(); refreshScoreboard(); updateBowlerLock();
  showToast(`${n} starts the over`);
}

// ─── WICKET ──────────────────────────────────────────────────
function showWicketModal() {
  const inn=currInn();
  document.getElementById('f-wout').innerHTML=[inn.striker,inn.nonStriker].filter(Boolean).map(n=>`<option value="${n}">${n}</option>`).join('');
  const avail=Object.keys(inn.batsmen).filter(n=>n!==inn.striker&&n!==inn.nonStriker&&inn.batsmen[n].status!=='out');
  document.getElementById('f-wnew').innerHTML=avail.length
    ? avail.map(n=>`<option value="${n}">${n}</option>`).join('')
    : '<option value="">— All Out —</option>';
  document.getElementById('f-wfielder').value='';
  openModal('modal-wicket');
}

function confirmWicket() {
  const inn=currInn();
  const outBat=document.getElementById('f-wout').value;
  const newBat=document.getElementById('f-wnew').value;
  const dismissal=document.getElementById('f-wdismissal').value;
  const fielder=document.getElementById('f-wfielder').value.trim();
  const bowler=inn.currentBowler;

  const fullDismissal = fielder ? `${dismissal} b ${bowler} (${fielder})` : `${dismissal} b ${bowler}`;
  if(inn.batsmen[outBat]){ inn.batsmen[outBat].status='out'; inn.batsmen[outBat].dismissal=fullDismissal; }
  inn.wickets++; inn.balls++;
  if(inn.bowlers[bowler]){inn.bowlers[bowler].balls++;inn.bowlers[bowler].wickets++;}
  if(newBat && inn.batsmen[newBat]){ inn.batsmen[newBat].status='not out'; }
  if(outBat===inn.striker) inn.striker=newBat||null;
  else inn.nonStriker=newBat||null;

  inn.currentOverBalls.push({ev:'W',cls:'ob-wkt'});
  inn.commentary.unshift({ball:'W',cls:'ob-wkt',over:oversStr(inn.balls),
    text:`WICKET! ${outBat} is ${fullDismissal}.`,
    sub:`${outBat}—${inn.batsmen[outBat]?.runs||0}(${inn.batsmen[outBat]?.balls||0})`});

  populateLiveSelects();
  closeModal('modal-wicket');

  if(inn.balls>0 && inn.balls%6===0){ endOver(); return; }
  checkInningsEnd(); saveLive(); syncMatch(); refreshScoreboard();
}

// ─── INNINGS END CHECK ───────────────────────────────────────
function checkInningsEnd() {
  const inn=currInn();
  const allOvers=inn.balls>=LS.maxOvers*6;
  const allOut=inn.wickets>=LS.maxWickets;
  const chaseWon=LS.inn===2&&inn.target&&inn.runs>=inn.target;

  if(chaseWon){declareWinner();return;}
  if(allOvers||allOut){
    if(LS.inn===1){
      LS.innings[1].target=inn.runs+1;
      // Init 2nd innings batsmen open
      const inn2=LS.innings[1];
      const batP=teamPlayers(inn2.batTeam);
      if(batP[0]){inn2.striker=batP[0].name;inn2.batsmen[inn2.striker].status='not out';}
      if(batP[1]){inn2.nonStriker=batP[1].name;inn2.batsmen[inn2.nonStriker].status='not out';}
      const bowlP=teamPlayers(inn2.bowlTeam);
      if(bowlP[0]) inn2.currentBowler=bowlP[0].name;
      LS.inn=2; LS.status='live';
      saveLive(); renderLivePage();
      showToast(`Innings break! Target: ${LS.innings[1].target} in ${LS.maxOvers} overs`,'warn');
    } else {
      void declareWinner();
    }
  }
}

async function declareWinner() {
  const inn1=LS.innings[0], inn2=LS.innings[1];
  let winner,summary;
  if(inn2&&inn2.runs>=(inn2.target||inn1.runs+1)){
    winner=inn2.batTeam;
    summary=`${getTeamName(winner)} won by ${LS.maxWickets-inn2.wickets} wicket${LS.maxWickets-inn2.wickets!==1?'s':''}`;
  } else {
    winner=inn1.batTeam;
    const margin=inn1.runs-(inn2?inn2.runs:0);
    summary=`${getTeamName(winner)} won by ${margin} run${margin!==1?'s':''}`;
  }
  LS.status='completed';
  saveLive();

  // Save scorecard to match
  const mIdx=matches.findIndex(m=>m.id===LS.matchId);
  if(mIdx!==-1){
    const m=matches[mIdx];
    m.status='completed'; m.winner=winner; m.summary=summary;
    m.s1=inn1?`${inn1.runs}/${inn1.wickets} (${oversStr(inn1.balls)})`:'-';
    m.s2=inn2?`${inn2.runs}/${inn2.wickets} (${oversStr(inn2.balls)})`:'-';
    m.scorecard={inn1,inn2};
    const wt=getTeam(winner), lt=getTeam(winner===m.t1?m.t2:m.t1);
    if(wt){wt.won++;wt.played++;}
    if(lt){lt.lost++;lt.played++;}
    save();
  }
  document.getElementById('nav-live-badge').style.display='none';
  renderLivePage(); showToast(`🏆 Match over! ${summary}`);
}

async function endLiveMatch() {
  if(!confirm('Clear live match data?')) return;
  LS=JSON.parse(JSON.stringify(LS_DEF));
  saveLive();
  const mIdx=matches.findIndex(m=>m.id===LS.matchId);
  if(mIdx!==-1&&matches[mIdx].status==='live'){matches[mIdx].status='upcoming';save();}
  document.getElementById('nav-live-badge').style.display='none';
  renderLivePage(); showToast('Live match ended');
}

function undoLastBall() { showToast('To undo: restart the over from the beginning','warn'); }

function rotateStrike() {
  const inn=currInn();
  [inn.striker,inn.nonStriker]=[inn.nonStriker,inn.striker];
  document.getElementById('sel-striker').value=inn.striker||'';
  document.getElementById('sel-nonstriker').value=inn.nonStriker||'';
}

function switchInnings(n) {
  if(n>LS.inn) return;
  document.querySelectorAll('.ls-inn-btn').forEach(b=>b.classList.toggle('active',parseInt(b.dataset.inn)===n));
  populateLiveSelects(); refreshScoreboard();
}

// ─── SYNC ─────────────────────────────────────────────────────
function syncMatch() {
  if(!LS.matchId) return;
  const mIdx=matches.findIndex(m=>m.id===LS.matchId);
  if(mIdx===-1) return;
  const inn1=LS.innings[0],inn2=LS.innings[1];
  matches[mIdx].s1=inn1?`${inn1.runs}/${inn1.wickets}`:'';
  matches[mIdx].s2=inn2&&inn2.balls>0?`${inn2.runs}/${inn2.wickets}`:'';
  save();
  if(document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
}

// ─── RENDER TOP BOARD ─────────────────────────────────────────
function renderTopBoard() {
  const m=matches.find(x=>x.id===LS.matchId);
  if(!m){document.getElementById('ls-top-board').innerHTML='';return;}
  const inn1=LS.innings[0],inn2=LS.innings[1];
  const s1=inn1?`${inn1.runs}/${inn1.wickets} (${oversStr(inn1.balls)})`:'-';
  const s2=inn2&&inn2.balls>0?`${inn2.runs}/${inn2.wickets} (${oversStr(inn2.balls)})`:'-';
  document.getElementById('ls-top-board').innerHTML=`
    <div class="ls-tb-teams">
      <div class="ls-tb-team">${ta(m.t1,42)}<div><div class="ls-tb-name">${getTeamName(m.t1)}</div><div class="ls-tb-score">${s1}</div></div></div>
      <span class="ls-tb-vs">VS</span>
      <div class="ls-tb-team">${ta(m.t2,42)}<div><div class="ls-tb-name">${getTeamName(m.t2)}</div><div class="ls-tb-score">${s2}</div></div></div>
      <span class="ls-live-pill"><span class="live-dot" style="width:7px;height:7px"></span>${LS.status==='completed'?'FINAL':'LIVE'}</span>
    </div>
    <div class="ls-tb-right">
      <span><i class="fas fa-map-pin"></i> ${m.venue||'TBD'}</span>
      <span>Toss: <strong>${getTeamName(LS.toss.winner)}</strong> chose to <strong>${LS.toss.choice}</strong></span>
      <span>${LS.maxOvers} overs | Max ${LS.maxWickets} wickets</span>
    </div>`;
}

// ─── REFRESH SCOREBOARD ──────────────────────────────────────
function refreshScoreboard() {
  const inn=currInn(); if(!inn) return;
  const oversBatted=inn.balls/6;

  // Over chip
  document.getElementById('ls-over-chip').textContent=oversStr(inn.balls)+' ov';
  // Inn info
  document.getElementById('ls-inn-info').textContent=`${getTeamName(inn.batTeam)} batting • ${getTeamName(inn.bowlTeam)} bowling`;

  // Big score
  document.getElementById('ls-batting-name').textContent=getTeamName(inn.batTeam)+' Batting';
  document.getElementById('ls-score-big').textContent=`${inn.runs}/${inn.wickets}`;
  document.getElementById('ls-score-overs').textContent=`${oversStr(inn.balls)} overs (max ${LS.maxOvers})`;

  // CRR / RRR
  const crr=oversBatted>0?(inn.runs/oversBatted).toFixed(2):'0.00';
  document.getElementById('ls-crr').textContent=crr;
  if(LS.inn===2&&inn.target){
    const ballsLeft=LS.maxOvers*6-inn.balls;
    const need=inn.target-inn.runs;
    const rrr=ballsLeft>0?(need/(ballsLeft/6)).toFixed(2):'∞';
    document.getElementById('ls-rrr').textContent=rrr;
    document.getElementById('ls-target').textContent=inn.target;
    document.getElementById('ls-need').textContent=`${Math.max(need,0)} off ${ballsLeft}b`;
  } else {
    ['ls-rrr','ls-target','ls-need'].forEach(id=>document.getElementById(id).textContent='—');
  }

  // This over balls
  document.getElementById('this-over-balls').innerHTML=inn.currentOverBalls.map(b=>`<div class="ob ${b.cls}">${b.ev}</div>`).join('');

  // Batter stats in selects area
  const stB=inn.batsmen[inn.striker];
  const nsB=inn.batsmen[inn.nonStriker];
  document.getElementById('stat-striker').textContent=stB?`${stB.runs}(${stB.balls})`:'0(0)';
  document.getElementById('stat-nonstriker').textContent=nsB?`${nsB.runs}(${nsB.balls})`:'0(0)';
  const bwl=inn.bowlers[inn.currentBowler];
  document.getElementById('stat-bowler').textContent=bwl?`${Math.floor(bwl.balls/6)}.${bwl.balls%6}-${bwl.runs}(${bwl.wickets}w)`:'0-0(0w)';

  // Batting table
  document.getElementById('bat-team-name').textContent=getTeamName(inn.batTeam);
  const batRows=Object.entries(inn.batsmen).filter(([,d])=>d.status!=='dnb')
    .sort((a,b)=>{const o={'not out':0,'out':1};return (o[a[1].status]||0)-(o[b[1].status]||0);});
  document.getElementById('bat-tbody').innerHTML=batRows.map(([name,d])=>{
    const isStr=name===inn.striker;
    const rowCls=d.status==='out'?'bat-out':'bat-crease';
    return `<tr class="${rowCls}">
      <td class="${isStr?'bat-strike-name':''}">${name}${isStr?' ★':''}</td>
      <td style="font-weight:700">${d.runs}</td><td>${d.balls}</td><td>${d.fours}</td><td>${d.sixes}</td>
      <td>${srCalc(d.runs,d.balls)}</td>
      <td style="font-size:.72rem">${d.status==='out'?`<span style="color:var(--red)">${d.dismissal}</span>`:`<span style="color:var(--accent)">${isStr?'batting★':'not out'}</span>`}</td>
    </tr>`;
  }).join('')||'<tr><td colspan="7" style="color:var(--muted);text-align:center;padding:14px">No batting data</td></tr>';

  // Extras
  const ex=inn.extras;
  document.getElementById('extras-bar').innerHTML=`Extras: <strong>${ex.wide+ex.noBall+ex.legBye}</strong> (Wd:${ex.wide} Nb:${ex.noBall} Lb:${ex.legBye})`;

  // Bowling table
  document.getElementById('bowl-team-name').textContent=getTeamName(inn.bowlTeam);
  const bwlRows=Object.entries(inn.bowlers).filter(([,d])=>d.balls>0);
  document.getElementById('bowl-tbody').innerHTML=bwlRows.map(([name,d])=>{
    const isCur=name===inn.currentBowler;
    return `<tr class="${isCur?'current-bowler':''}">
      <td style="${isCur?'color:var(--yellow);font-weight:700':''}">${name}${isCur?' ●':''}</td>
      <td>${oversStr(d.balls)}</td><td>${d.maidens}</td><td>${d.runs}</td>
      <td style="color:var(--yellow);font-weight:700">${d.wickets}</td>
      <td style="color:var(--muted)">${econCalc(d.runs,d.balls)}</td>
    </tr>`;
  }).join('')||'<tr><td colspan="6" style="color:var(--muted);text-align:center;padding:14px">No bowling data</td></tr>';

  // Commentary
  const commColors={
    'ob-four':'background:rgba(163,230,53,.2);color:var(--accent)',
    'ob-six':'background:rgba(251,191,36,.2);color:var(--yellow)',
    'ob-wkt':'background:rgba(244,63,94,.2);color:var(--red)',
    'ob-ext':'background:rgba(251,146,60,.2);color:var(--orange)',
    'ob-run':'background:rgba(56,189,248,.15);color:var(--blue)',
    'ob-dot':'background:rgba(74,103,133,.2);color:var(--muted)',
  };
  document.getElementById('commentary-feed').innerHTML=inn.commentary.slice(0,30).map(c=>`
    <div class="comm-item">
      <div class="comm-ball-badge" style="${commColors[c.cls]||commColors['ob-dot']}">${c.ball}</div>
      <div><div class="comm-meta">${c.over}</div><div class="comm-text">${c.text}</div>${c.sub?`<div class="comm-sub">${c.sub}</div>`:''}</div>
    </div>`).join('')||'<div style="color:var(--muted);text-align:center;padding:20px;font-size:.82rem">No deliveries yet</div>';

  updateBowlerLock();
}

// ─── MATCH SUMMARY ───────────────────────────────────────────
function renderMatchSummary() {
  document.getElementById('ls-match-summary').style.display='block';
  const summaryDiv=document.getElementById('match-summary-content');
  const inn1=LS.innings[0], inn2=LS.innings[1];
  const m=matches.find(x=>x.id===LS.matchId)||{};

  // top batter / bowler
  const allBatsmen=[...Object.entries(inn1?.batsmen||{}),...Object.entries(inn2?.batsmen||{})];
  const topBat=allBatsmen.sort((a,b)=>b[1].runs-a[1].runs)[0];
  const allBowlers=[...Object.entries(inn1?.bowlers||{}),...Object.entries(inn2?.bowlers||{})];
  const topBowl=allBowlers.sort((a,b)=>b[1].wickets-a[1].wickets)[0];

  const winCol=getTeamColor(m.winner);
  summaryDiv.innerHTML=`
    <div class="ms-trophy">🏆</div>
    <div class="ms-title">MATCH OVER</div>
    <div class="ms-winner" style="color:${winCol}">${getTeamName(m.winner)}</div>
    <div class="ms-scores">
      <div class="ms-team"><div class="ms-team-code" style="color:${getTeamColor(LS.t1)}">${LS.t1}</div><div class="ms-team-score">${inn1?inn1.runs+'/'+inn1.wickets:'—'}</div><div class="ms-team-name">${getTeamName(LS.t1)}</div><div style="font-size:.72rem;color:var(--muted)">${inn1?oversStr(inn1.balls)+' ov':''}</div></div>
      <div class="ms-vs">VS</div>
      <div class="ms-team"><div class="ms-team-code" style="color:${getTeamColor(LS.t2)}">${LS.t2}</div><div class="ms-team-score">${inn2?inn2.runs+'/'+inn2.wickets:'—'}</div><div class="ms-team-name">${getTeamName(LS.t2)}</div><div style="font-size:.72rem;color:var(--muted)">${inn2?oversStr(inn2.balls)+' ov':''}</div></div>
    </div>
    <div class="ms-result">${m.summary||'Match Complete'}</div>
    <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-bottom:16px">
      ${topBat?`<div style="text-align:center"><div style="font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Top Scorer</div><div style="font-weight:700;color:var(--blue)">${topBat[0]}</div><div style="font-size:.8rem;color:var(--muted)">${topBat[1].runs} runs (${topBat[1].balls}b)</div></div>`:''}
      ${topBowl?`<div style="text-align:center"><div style="font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Top Bowler</div><div style="font-weight:700;color:var(--yellow)">${topBowl[0]}</div><div style="font-size:.8rem;color:var(--muted)">${topBowl[1].wickets}/${topBowl[1].runs} (${oversStr(topBowl[1].balls)})</div></div>`:''}
    </div>
    ${m.potm?`<div class="ms-potm"><i class="fas fa-star"></i>Player of the Match: <strong>${m.potm}</strong></div>`:''}
    <div class="ms-btn-row">
      <button class="btn-ghost" onclick="showScorecard(${LS.matchId})" style="pointer-events:auto"><i class="fas fa-list"></i> Full Scorecard</button>
      <button class="btn-primary" onclick="endLiveMatch()"><i class="fas fa-check"></i> Done</button>
    </div>`;
}

// ─── INIT ────────────────────────────────────────────────────
function queueLiveMatchSync() {
  if(!LS.matchId || LS.status === 'completed') return;
  clearTimeout(liveSyncTimer);
  const inn1=LS.innings[0], inn2=LS.innings[1];
  liveSyncTimer = setTimeout(async () => {
    try {
      await apiRequest('matches', {
        method:'PUT',
        id:LS.matchId,
        body:{
          status:LS.status === 'over_break' ? 'live' : LS.status,
          score1:inn1?`${inn1.runs}/${inn1.wickets}`:'',
          score2:inn2&&inn2.balls>0?`${inn2.runs}/${inn2.wickets}`:'',
          scorecard:{inn1,inn2},
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, 350);
}

async function declareWinner() {
  const inn1=LS.innings[0], inn2=LS.innings[1];
  let winner,summary;
  if(inn2&&inn2.runs>=(inn2.target||inn1.runs+1)){
    winner=inn2.batTeam;
    summary=`${getTeamName(winner)} won by ${LS.maxWickets-inn2.wickets} wicket${LS.maxWickets-inn2.wickets!==1?'s':''}`;
  } else {
    winner=inn1.batTeam;
    const margin=inn1.runs-(inn2?inn2.runs:0);
    summary=`${getTeamName(winner)} won by ${margin} run${margin!==1?'s':''}`;
  }
  LS.status='completed';
  saveLive();

  try {
    clearTimeout(liveSyncTimer);
    await apiRequest('matches', {
      method:'PUT',
      id:LS.matchId,
      params:{ result:1 },
      body:{
        score1:inn1?`${inn1.runs}/${inn1.wickets} (${oversStr(inn1.balls)})`:'-',
        score2:inn2?`${inn2.runs}/${inn2.wickets} (${oversStr(inn2.balls)})`:'-',
        winner_code:winner,
        result_summary:summary,
        player_of_match:'',
        scorecard:{inn1,inn2},
      }
    });
    await loadAllData();
    document.getElementById('nav-live-badge').style.display='none';
    renderLivePage();
    showToast(`Match over! ${summary}`);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function endLiveMatch() {
  if(!confirm('Clear live match data?')) return;
  const liveMatchId = LS.matchId;
  const hadLiveMatch = matches.find(m=>m.id===liveMatchId)?.status === 'live';
  LS=JSON.parse(JSON.stringify(LS_DEF));
  saveLive();
  clearTimeout(liveSyncTimer);
  try {
    if(liveMatchId && hadLiveMatch){
      await apiRequest('matches', { method:'PUT', id:liveMatchId, body:{ status:'upcoming', score1:'', score2:'' } });
      await loadAllData();
    }
    document.getElementById('nav-live-badge').style.display='none';
    renderLivePage();
    showToast('Live match ended');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function syncMatch() {
  if(!LS.matchId) return;
  const mIdx=matches.findIndex(m=>m.id===LS.matchId);
  if(mIdx===-1) return;
  const inn1=LS.innings[0],inn2=LS.innings[1];
  matches[mIdx].status='live';
  matches[mIdx].s1=inn1?`${inn1.runs}/${inn1.wickets}`:'';
  matches[mIdx].s2=inn2&&inn2.balls>0?`${inn2.runs}/${inn2.wickets}`:'';
  queueLiveMatchSync();
  if(document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
}

(async function init() {
  try {
    await loadAllData();
  } catch (error) {
    console.error(error);
    showToast(error.message, 'error');
  }
  refreshCurrentView();
  if(LS.status!=='idle') {
    document.getElementById('nav-live-badge').style.display='inline-flex';
  }
})();
