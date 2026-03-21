const PUBLIC_API = 'api.php';
const publicState = {
  matches: [],
  standings: [],
  stats: null,
  teams: new Map(),
};

const PUBLIC_ERROR_ROOTS = [
  'featured-live-root',
  'live-pulse-root',
  'match-queue-root',
  'scoreboard-root',
  'upcoming-root',
  'completed-root',
  'standings-root',
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(value) {
  if (!value) return 'Date TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function oversFromBalls(balls) {
  const totalBalls = Number(balls || 0);
  return `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`;
}

function runRate(innings) {
  const balls = Number(innings?.balls || 0);
  if (!balls) return '0.00';
  return (Number(innings?.runs || 0) / (balls / 6)).toFixed(2);
}

function parseScorecard(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }
  return raw;
}

async function fetchResource(resource) {
  const url = new URL(PUBLIC_API, window.location.href);
  url.searchParams.set('resource', resource);
  const response = await fetch(url.toString(), { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || `Failed to load ${resource}`);
  return data;
}

function buildTeamMap(matches, standings) {
  const map = new Map();

  standings.forEach((team) => {
    map.set(String(team.code || '').toUpperCase(), {
      name: team.name || team.code,
      color: team.color || '#555',
      code: String(team.code || '').toUpperCase(),
    });
  });

  matches.forEach((match) => {
    map.set(String(match.team1_code || '').toUpperCase(), {
      name: match.t1_name || match.team1_code,
      color: match.t1_color || '#555',
      code: String(match.team1_code || '').toUpperCase(),
    });
    map.set(String(match.team2_code || '').toUpperCase(), {
      name: match.t2_name || match.team2_code,
      color: match.t2_color || '#555',
      code: String(match.team2_code || '').toUpperCase(),
    });
  });

  publicState.teams = map;
}

function teamMeta(code) {
  return publicState.teams.get(String(code || '').toUpperCase()) || {
    name: code || 'TBD',
    color: '#555',
    code: String(code || '').toUpperCase(),
  };
}

function teamAvatar(code, size = 44) {
  const team = teamMeta(code);
  return `<div class="ta" style="background:${escapeHtml(team.color)};width:${size}px;height:${size}px;font-size:${Math.max(12, Math.round(size * 0.3))}px">${escapeHtml(team.code || code)}</div>`;
}

function scoreText(match, teamNumber) {
  return escapeHtml(teamNumber === 1 ? match.score1 || '-' : match.score2 || '-');
}

function statusMeta(status) {
  switch (status) {
    case 'live':
      return { className: 'live', label: 'Live' };
    case 'completed':
      return { className: 'done', label: 'Completed' };
    default:
      return { className: 'upcoming', label: 'Upcoming' };
  }
}

function sortMatches(list, direction = 'asc') {
  const factor = direction === 'desc' ? -1 : 1;
  return [...list].sort((a, b) => (new Date(a.match_date) - new Date(b.match_date)) * factor);
}

function getMatchesByStatus(status, direction = 'asc') {
  return sortMatches(publicState.matches.filter((match) => match.status === status), direction);
}

function matchTitle(match) {
  return `${teamMeta(match.team1_code).name} vs ${teamMeta(match.team2_code).name}`;
}

function matchInfoLine(match) {
  return [
    fmtDate(match.match_date),
    escapeHtml(match.venue || 'Venue TBD'),
    escapeHtml(match.match_type || 'league'),
    `${Number(match.overs_per_innings || 20)} overs`,
  ].join(' | ');
}

function featuredInnings(scorecard, match) {
  if (!scorecard) return null;
  const inn1 = scorecard.inn1 || null;
  const inn2 = scorecard.inn2 || null;

  if (match.status === 'live') {
    if (inn2 && Number(inn2.balls || 0) > 0) return inn2;
    return inn1;
  }

  return inn2 && Number(inn2.balls || 0) > 0 ? inn2 : inn1;
}

function liveNeedText(innings) {
  if (!innings || !innings.target) return 'First innings in progress';
  const need = Math.max(Number(innings.target || 0) - Number(innings.runs || 0), 0);
  return `${need} needed`;
}

function commentaryColor(cls) {
  switch (cls) {
    case 'ob-four':
      return 'background:rgba(163,230,53,.18);color:var(--accent)';
    case 'ob-six':
      return 'background:rgba(251,191,36,.18);color:var(--yellow)';
    case 'ob-wkt':
      return 'background:rgba(244,63,94,.18);color:var(--red)';
    case 'ob-ext':
      return 'background:rgba(251,146,60,.18);color:var(--orange)';
    case 'ob-run':
      return 'background:rgba(56,189,248,.18);color:var(--blue)';
    default:
      return 'background:rgba(74,103,133,.2);color:var(--muted)';
  }
}

function getFeaturedBundle() {
  const liveMatches = getMatchesByStatus('live');
  const upcomingMatches = getMatchesByStatus('upcoming');
  const completedMatches = getMatchesByStatus('completed', 'desc');
  const match = liveMatches[0] || upcomingMatches[0] || completedMatches[0] || null;
  if (!match) return { match:null, scorecard:null, innings:null };
  const scorecard = parseScorecard(match.scorecard_json);
  const innings = featuredInnings(scorecard, match);
  return { match, scorecard, innings };
}

function buildMatchSummary(match, mode) {
  if (mode === 'completed') {
    return {
      score: `${scoreText(match, 1)} | ${scoreText(match, 2)}`,
      note: match.result_summary || 'Result pending',
    };
  }

  if (mode === 'live') {
    return {
      score: `${scoreText(match, 1)} | ${scoreText(match, 2)}`,
      note: match.result_summary || 'Live scoring in progress',
    };
  }

  return {
    score: 'Awaiting toss and first ball',
    note: `Starts ${fmtDate(match.match_date)}`,
  };
}

function matchCard(match, mode = match.status) {
  const status = statusMeta(mode);
  const summary = buildMatchSummary(match, mode);

  return `
    <article class="public-match-card is-${mode}">
      ${teamAvatar(match.team1_code)}
      <div class="public-match-main">
        <div class="public-match-line">
          <span class="public-match-title">${escapeHtml(matchTitle(match))}</span>
          <span class="status-pill ${status.className}">${status.label}</span>
        </div>
        <div class="public-match-score">${escapeHtml(summary.score)}</div>
        <div class="public-match-meta">${matchInfoLine(match)}</div>
        <div class="public-match-result">${escapeHtml(summary.note)}</div>
      </div>
      <div class="public-match-side">${teamAvatar(match.team2_code)}</div>
    </article>
  `;
}

function buildLiveBalls(innings) {
  const balls = Array.isArray(innings?.currentOverBalls) ? innings.currentOverBalls.slice(-6) : [];
  if (!balls.length) return '<span class="public-empty-inline">No balls yet</span>';
  return balls.map((ball) => `<span class="live-strip-ball ${ball.cls || 'ob-dot'}">${escapeHtml(ball.ev || '')}</span>`).join('');
}

function renderFeaturedMatch() {
  const root = document.getElementById('featured-live-root');
  const status = document.getElementById('featured-status');
  const bundle = getFeaturedBundle();
  const featured = bundle.match;

  if (!featured) {
    status.className = 'status-pill upcoming';
    status.textContent = 'No Match';
    root.innerHTML = '<div class="public-empty">No tournament matches are available yet.</div>';
    return;
  }

  const featuredStatus = statusMeta(featured.status);
  const innings = bundle.innings;
  const currentTeam = innings ? teamMeta(innings.batTeam).name : matchTitle(featured);
  const scoreBig = innings ? `${Number(innings.runs || 0)}/${Number(innings.wickets || 0)}` : scoreText(featured, 1);
  const oversText = innings ? `${oversFromBalls(innings.balls)} ov` : `${Number(featured.overs_per_innings || 20)} ov`;
  const chaseText = innings ? liveNeedText(innings) : (featured.result_summary || 'Match updates coming soon');
  const bowler = innings?.currentBowler || innings?.prevBowler || 'TBD';
  const striker = innings?.striker || 'TBD';
  const nonStriker = innings?.nonStriker || 'TBD';
  const resultText = featured.result_summary || (featured.status === 'live' ? 'Live match in progress' : 'Match will begin soon');

  status.className = `status-pill ${featuredStatus.className}`;
  status.textContent = featured.status === 'live' ? 'Live Now' : featuredStatus.label;

  root.innerHTML = `
    <article class="public-live-experience">
      <div class="live-stage-head">
        <div class="featured-meta">
          <span><i class="fas fa-calendar-alt"></i> ${fmtDate(featured.match_date)}</span>
          <span><i class="fas fa-location-dot"></i> ${escapeHtml(featured.venue || 'Venue TBD')}</span>
          <span><i class="fas fa-trophy"></i> ${escapeHtml(featured.match_type || 'league')}</span>
        </div>
        <div class="live-stage-status">${escapeHtml(resultText)}</div>
      </div>

      <div class="live-scoreband">
        <div class="live-score-team">
          ${teamAvatar(featured.team1_code, 62)}
          <strong>${escapeHtml(teamMeta(featured.team1_code).name)}</strong>
          <span>${scoreText(featured, 1)}</span>
        </div>

        <div class="live-score-center">
          <div class="live-score-kicker">${escapeHtml(currentTeam)}</div>
          <div class="live-score-big">${escapeHtml(scoreBig)}</div>
          <div class="live-score-sub">${escapeHtml(oversText)} | ${escapeHtml(chaseText)}</div>
        </div>

        <div class="live-score-team">
          ${teamAvatar(featured.team2_code, 62)}
          <strong>${escapeHtml(teamMeta(featured.team2_code).name)}</strong>
          <span>${scoreText(featured, 2)}</span>
        </div>
      </div>

      <div class="live-detail-grid">
        <div class="mini-panel live-focus-card">
          <span class="live-focus-label">Striker</span>
          <span class="live-focus-value">${escapeHtml(striker)}</span>
        </div>
        <div class="mini-panel live-focus-card">
          <span class="live-focus-label">Non-Striker</span>
          <span class="live-focus-value">${escapeHtml(nonStriker)}</span>
        </div>
        <div class="mini-panel live-focus-card">
          <span class="live-focus-label">Bowler</span>
          <span class="live-focus-value">${escapeHtml(bowler)}</span>
        </div>
        <div class="mini-panel live-focus-card">
          <span class="live-focus-label">Run Rate</span>
          <span class="live-focus-value">${innings ? `${runRate(innings)} RPO` : 'Not started'}</span>
        </div>
      </div>

      <div class="live-balls-row">
        <span class="this-over-lbl">This Over</span>
        <div class="live-strip-balls">${buildLiveBalls(innings)}</div>
      </div>
    </article>
  `;
}

function renderLivePulse() {
  const root = document.getElementById('live-pulse-root');
  const bundle = getFeaturedBundle();
  const commentary = Array.isArray(bundle.innings?.commentary) ? bundle.innings.commentary : [];

  if (!bundle.match) {
    root.innerHTML = '<div class="public-empty">Commentary will appear here when a match starts.</div>';
    return;
  }

  if (!commentary.length) {
    root.innerHTML = `
      <div class="public-empty">
        No commentary yet for ${escapeHtml(matchTitle(bundle.match))}.<br>
        Score updates will appear here ball by ball.
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="commentary-timeline">
      ${commentary.slice(0, 20).map((item) => `
        <article class="commentary-timeline-item">
          <div class="commentary-timeline-ball" style="${commentaryColor(item.cls)}">${escapeHtml(item.ball || '')}</div>
          <div class="commentary-timeline-copy">
            <strong>${escapeHtml(item.text || 'Ball update')}</strong>
            <small>${escapeHtml(item.over || '')}${item.sub ? ` | ${escapeHtml(item.sub)}` : ''}</small>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderMatchQueue() {
  const root = document.getElementById('match-queue-root');
  const queue = [
    ...getMatchesByStatus('live'),
    ...getMatchesByStatus('upcoming').slice(0, 3),
    ...getMatchesByStatus('completed', 'desc').slice(0, 2),
  ];

  const uniqueQueue = queue.filter((match, index, list) => index === list.findIndex((item) => item.id === match.id));
  root.innerHTML = uniqueQueue.length
    ? uniqueQueue.map((match) => matchCard(match)).join('')
    : '<div class="public-empty">No matches are queued yet.</div>';
}

function battingRows(innings) {
  const batsmen = Object.entries(innings?.batsmen || {})
    .filter(([, stats]) => stats.status !== 'dnb' || Number(stats.balls || 0) > 0 || Number(stats.runs || 0) > 0);

  if (!batsmen.length) {
    return '<tr><td colspan="6" class="scoreboard-empty-row">No batting details yet.</td></tr>';
  }

  return batsmen.map(([name, stats]) => `
    <tr>
      <td>
        <strong>${escapeHtml(name)}</strong>
        <small>${stats.status === 'out' ? escapeHtml(stats.dismissal || 'out') : 'not out'}</small>
      </td>
      <td>${Number(stats.runs || 0)}</td>
      <td>${Number(stats.balls || 0)}</td>
      <td>${Number(stats.fours || 0)}</td>
      <td>${Number(stats.sixes || 0)}</td>
      <td>${Number(stats.balls || 0) ? ((Number(stats.runs || 0) / Number(stats.balls || 1)) * 100).toFixed(2) : '0.00'}</td>
    </tr>
  `).join('');
}

function bowlingRows(innings) {
  const bowlers = Object.entries(innings?.bowlers || {}).filter(([, stats]) => Number(stats.balls || 0) > 0);

  if (!bowlers.length) {
    return '<tr><td colspan="5" class="scoreboard-empty-row">No bowling details yet.</td></tr>';
  }

  return bowlers.map(([name, stats]) => `
    <tr>
      <td><strong>${escapeHtml(name)}</strong></td>
      <td>${escapeHtml(oversFromBalls(stats.balls || 0))}</td>
      <td>${Number(stats.runs || 0)}</td>
      <td>${Number(stats.wickets || 0)}</td>
      <td>${Number(stats.balls || 0) ? (Number(stats.runs || 0) / (Number(stats.balls || 0) / 6)).toFixed(2) : '0.00'}</td>
    </tr>
  `).join('');
}

function inningsPanel(innings, index, isActive) {
  if (!innings) return '';
  const extras = innings.extras || { wide:0, noBall:0, legBye:0 };
  const extrasTotal = Number(extras.wide || 0) + Number(extras.noBall || 0) + Number(extras.legBye || 0);
  const team = teamMeta(innings.batTeam);

  return `
    <section class="scoreboard-innings-panel ${isActive ? 'active' : ''}">
      <div class="scoreboard-innings-bar ${isActive ? 'active' : ''}">
        <div>
          <strong>${escapeHtml(team.name)}</strong>
          <span>Innings ${index}</span>
        </div>
        <div class="scoreboard-innings-total">
          <strong>${Number(innings.runs || 0)}/${Number(innings.wickets || 0)}</strong>
          <span>(${escapeHtml(oversFromBalls(innings.balls || 0))} ov)</span>
        </div>
      </div>

      <div class="scoreboard-innings-grid">
        <div class="scoreboard-panel">
          <h4>Batters</h4>
          <div class="table-wrap">
            <table class="data-table scoreboard-mini-table">
              <thead><tr><th>Batters</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead>
              <tbody>${battingRows(innings)}</tbody>
            </table>
          </div>
          <div class="scoreboard-extras">Extras: <strong>${extrasTotal}</strong> (Wd ${Number(extras.wide || 0)}, Nb ${Number(extras.noBall || 0)}, Lb ${Number(extras.legBye || 0)})</div>
        </div>

        <div class="scoreboard-panel">
          <h4>Bowlers</h4>
          <div class="table-wrap">
            <table class="data-table scoreboard-mini-table">
              <thead><tr><th>Bowler</th><th>O</th><th>R</th><th>W</th><th>Econ</th></tr></thead>
              <tbody>${bowlingRows(innings)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `;
}

function buildScoreboardFeature() {
  const bundle = getFeaturedBundle();
  if (!bundle.match) return '<div class="public-empty">No scoreboard is available yet.</div>';

  const featured = bundle.match;
  const scorecard = bundle.scorecard;
  const current = bundle.innings;

  return `
    <section class="scoreboard-feature-card">
      <div class="scoreboard-feature-head">
        <div>
          <h3>${escapeHtml(matchTitle(featured))}</h3>
          <p>${matchInfoLine(featured)}</p>
        </div>
        <span class="status-pill ${statusMeta(featured.status).className}">${statusMeta(featured.status).label}</span>
      </div>
      <div class="scoreboard-feature-summary">
        <div class="scoreboard-feature-team">
          ${teamAvatar(featured.team1_code, 50)}
          <div>
            <strong>${escapeHtml(teamMeta(featured.team1_code).name)}</strong>
            <span>${scoreText(featured, 1)}</span>
          </div>
        </div>
        <div class="scoreboard-feature-center">
          <strong>${escapeHtml(featured.result_summary || (featured.status === 'live' ? 'Match in progress' : 'Match center'))}</strong>
          <span>${current ? `${escapeHtml(teamMeta(current.batTeam).name)} batting | ${runRate(current)} RPO` : 'Detailed scorecard appears here after scoring begins.'}</span>
        </div>
        <div class="scoreboard-feature-team">
          <div>
            <strong>${escapeHtml(teamMeta(featured.team2_code).name)}</strong>
            <span>${scoreText(featured, 2)}</span>
          </div>
          ${teamAvatar(featured.team2_code, 50)}
        </div>
      </div>
      ${scorecard ? `
        <div class="scoreboard-innings-stack">
          ${inningsPanel(scorecard.inn1, 1, current === scorecard.inn1)}
          ${inningsPanel(scorecard.inn2, 2, current === scorecard.inn2)}
        </div>
      ` : '<div class="public-empty">Scorecard tables will appear after ball-by-ball scoring starts.</div>'}
    </section>
  `;
}

function renderScoreboard() {
  const root = document.getElementById('scoreboard-root');
  const groups = [
    {
      title: 'Live Now',
      copy: 'Matches currently in progress.',
      status: 'live',
      matches: getMatchesByStatus('live'),
      empty: 'No live matches right now.',
    },
    {
      title: 'Upcoming Board',
      copy: 'Next scheduled fixtures in order.',
      status: 'upcoming',
      matches: getMatchesByStatus('upcoming').slice(0, 8),
      empty: 'No upcoming fixtures scheduled.',
    },
    {
      title: 'Completed Board',
      copy: 'Latest finished matches and scorelines.',
      status: 'completed',
      matches: getMatchesByStatus('completed', 'desc').slice(0, 8),
      empty: 'No completed matches yet.',
    },
  ];

  root.innerHTML = `
    ${buildScoreboardFeature()}
    <div class="scoreboard-stack">
      ${groups.map((group) => {
        const badge = statusMeta(group.status);
        return `
          <section class="scoreboard-group">
            <div class="scoreboard-group-head">
              <div>
                <h3>${escapeHtml(group.title)}</h3>
                <p>${escapeHtml(group.copy)}</p>
              </div>
              <span class="status-pill ${badge.className}">${group.matches.length}</span>
            </div>
            <div class="match-list">
              ${group.matches.length ? group.matches.map((match) => matchCard(match, group.status)).join('') : `<div class="public-empty">${escapeHtml(group.empty)}</div>`}
            </div>
          </section>
        `;
      }).join('')}
    </div>
  `;
}

function renderMatchLists() {
  const upcomingRoot = document.getElementById('upcoming-root');
  const completedRoot = document.getElementById('completed-root');
  const upcoming = getMatchesByStatus('upcoming').slice(0, 6);
  const completed = getMatchesByStatus('completed', 'desc').slice(0, 6);

  upcomingRoot.innerHTML = upcoming.length
    ? upcoming.map((match) => matchCard(match, 'upcoming')).join('')
    : '<div class="public-empty">No upcoming matches scheduled.</div>';

  completedRoot.innerHTML = completed.length
    ? completed.map((match) => matchCard(match, 'completed')).join('')
    : '<div class="public-empty">No completed matches yet.</div>';
}

function renderStandings() {
  const root = document.getElementById('standings-root');
  if (!publicState.standings.length) {
    root.innerHTML = '<div class="public-empty">Points table will appear after teams are added.</div>';
    return;
  }

  const grouped = publicState.standings.reduce((acc, row) => {
    const group = row.group_name || 'Standings';
    if (!acc[group]) acc[group] = [];
    acc[group].push(row);
    return acc;
  }, {});

  root.innerHTML = `<div class="standings-stack">${Object.entries(grouped).map(([groupName, rows]) => `
    <section class="standings-block">
      <h3>${escapeHtml(groupName)}</h3>
      <div class="table-wrap">
        <table class="data-table standings-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>NRR</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, index) => `
              <tr>
                <td><span class="pos-badge ${index === 0 ? 'p1' : index === 1 ? 'p2' : index === 2 ? 'p3' : 'pn'}">${index + 1}</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    ${teamAvatar(row.code)}
                    <div>
                      <div style="font-weight:700">${escapeHtml(row.name || row.code)}</div>
                      <div style="font-size:.72rem;color:var(--muted)">${escapeHtml(row.code || '')}</div>
                    </div>
                  </div>
                </td>
                <td>${Number(row.played || 0)}</td>
                <td>${Number(row.won || 0)}</td>
                <td>${Number(row.lost || 0)}</td>
                <td class="${Number(row.nrr || 0) >= 0 ? 'nrr-pos' : 'nrr-neg'}">${Number(row.nrr || 0).toFixed(3)}</td>
                <td class="pts-cell">${Number(row.pts || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `).join('')}</div>`;
}

function renderSummary() {
  const liveCount = getMatchesByStatus('live').length;
  const upcomingCount = getMatchesByStatus('upcoming').length;
  const completedCount = getMatchesByStatus('completed').length;

  document.getElementById('sum-live').textContent = String(liveCount);
  document.getElementById('sum-upcoming').textContent = String(upcomingCount);
  document.getElementById('sum-completed').textContent = String(completedCount);
  document.getElementById('sum-teams').textContent = String(publicState.standings.length);

  const summaryText = liveCount
    ? `${liveCount} live match${liveCount === 1 ? '' : 'es'} running right now.`
    : upcomingCount
      ? `No match is live right now. ${upcomingCount} fixture${upcomingCount === 1 ? '' : 's'} coming up next.`
      : 'Tournament setup is ready. Add matches from the admin panel to publish the live center.';

  document.getElementById('public-summary-text').textContent = summaryText;
  document.getElementById('public-refresh-time').textContent = `Last updated: ${new Date().toLocaleTimeString('en-IN')}`;
}

function setPublicTab(tabName) {
  document.querySelectorAll('.public-tab').forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  document.querySelectorAll('.public-tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `public-tab-${tabName}`);
  });
}

function initPublicTabs() {
  document.querySelectorAll('.public-tab').forEach((button) => {
    button.addEventListener('click', () => setPublicTab(button.dataset.tab));
  });
}

function renderErrorState(message) {
  const html = `<div class="public-empty">${escapeHtml(message)}</div>`;
  PUBLIC_ERROR_ROOTS.forEach((id) => {
    const root = document.getElementById(id);
    if (root) root.innerHTML = html;
  });
}

async function loadPublicData() {
  try {
    const [matches, standings, stats] = await Promise.all([
      fetchResource('matches'),
      fetchResource('standings'),
      fetchResource('stats'),
    ]);

    publicState.matches = Array.isArray(matches) ? matches : [];
    publicState.standings = Array.isArray(standings) ? standings : [];
    publicState.stats = stats || null;
    buildTeamMap(publicState.matches, publicState.standings);

    renderSummary();
    renderFeaturedMatch();
    renderLivePulse();
    renderMatchQueue();
    renderScoreboard();
    renderMatchLists();
    renderStandings();
  } catch (error) {
    renderErrorState(error.message);
  }
}

initPublicTabs();
loadPublicData();
setInterval(loadPublicData, 20000);
