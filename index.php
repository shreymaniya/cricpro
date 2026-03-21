<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CricketPro Live Tournament</title>
  <link rel="stylesheet" href="styles.css"/>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
</head>
<body class="public-body">
  <main class="public-shell">
    <header class="public-head">
      <div class="public-brand">
        <div class="public-brand-badge">CP</div>
        <div class="public-brand-copy">
          <h1>CricketPro Live</h1>
          <!-- <p>Follow the tournament from one professional match center with live action, scoreboards, fixtures, and standings.</p> -->
        </div>
      </div>
      <div class="public-actions">
        <span class="public-refresh" id="public-refresh-time">Refreshing scores...</span>
        <!-- <a class="topbar-link" href="login.php">Admin Login</a> -->
      </div>
    </header>

    <section class="public-tab-shell">
      <div class="public-tabs" role="tablist" aria-label="Public match center tabs">
        <button class="public-tab active" type="button" role="tab" aria-selected="true" aria-controls="public-tab-live" data-tab="live">Live</button>
        <button class="public-tab" type="button" role="tab" aria-selected="false" aria-controls="public-tab-scoreboard" data-tab="scoreboard">Scoreboard</button>
        <button class="public-tab" type="button" role="tab" aria-selected="false" aria-controls="public-tab-fixtures" data-tab="fixtures">Fixtures</button>
        <button class="public-tab" type="button" role="tab" aria-selected="false" aria-controls="public-tab-table" data-tab="table">Points Table</button>
      </div>
    </section>

    <section class="public-hero">
      <article class="hero-card">
        <span class="hero-kicker"><span class="live-dot"></span> Tournament Center</span>
        <h2 class="hero-title">Live. Scoreboard. Fixtures. Table.</h2>
        <p class="hero-copy">
          Visitors can switch between the live match center, tournament scoreboard, upcoming fixtures, and points
          table without leaving the page.
        </p>
        <div class="hero-highlight" id="public-summary-text">Loading tournament data...</div>
      </article>

      <div class="public-summary-grid">
        <article class="summary-card">
          <div class="summary-label">Live Matches</div>
          <div class="summary-value" id="sum-live">0</div>
          <div class="summary-help">Matches currently in progress</div>
        </article>
        <article class="summary-card">
          <div class="summary-label">Upcoming</div>
          <div class="summary-value" id="sum-upcoming">0</div>
          <div class="summary-help">Next fixtures in the tournament</div>
        </article>
        <article class="summary-card">
          <div class="summary-label">Completed</div>
          <div class="summary-value" id="sum-completed">0</div>
          <div class="summary-help">Results already finalized</div>
        </article>
        <article class="summary-card">
          <div class="summary-label">Teams</div>
          <div class="summary-value" id="sum-teams">0</div>
          <div class="summary-help">Teams in the current standings</div>
        </article>
      </div>
    </section>

    <section class="public-panels">

      <section class="public-tab-panel active" id="public-tab-live" role="tabpanel">
        <div class="public-grid public-grid-live">
          <div class="public-section-card">
            <div class="section-head">
              <div>
                <h2 class="section-title">Live Match Center</h2>
                <p class="section-copy">Big live scores first, with the latest match movement shown clearly and cleanly.</p>
              </div>
              <span class="status-pill live" id="featured-status">Loading</span>
            </div>
            <div id="featured-live-root"></div>
          </div>

          <aside class="public-section-card">
            <div class="section-head">
              <div>
                <h2 class="section-title">Live Commentary</h2>
                <p class="section-copy">Ball-by-ball updates stay on the side for quick reading.</p>
              </div>
              <span class="status-pill upcoming">Comms</span>
            </div>
            <div id="live-pulse-root"></div>
          </aside>
        </div>

        <div class="public-section-card public-subsection">
          <div class="section-head">
            <div>
              <h2 class="section-title">Match Queue</h2>
              <p class="section-copy">Live games first, then the next key fixtures and latest results.</p>
            </div>
            <span class="status-pill upcoming">Queue</span>
          </div>
          <div class="match-list" id="match-queue-root"></div>
        </div>
      </section>

      <section class="public-tab-panel" id="public-tab-scoreboard" role="tabpanel">
        <div class="public-section-card">
          <div class="section-head">
            <div>
              <h2 class="section-title">Tournament Scoreboard</h2>
              <p class="section-copy">Scorecard-style innings view with batting, bowling, extras, and the full match board below.</p>
            </div>
            <span class="status-pill live">Scoreboard</span>
          </div>
          <div id="scoreboard-root"></div>
        </div>
      </section>

      <section class="public-tab-panel" id="public-tab-fixtures" role="tabpanel">
        <div class="public-grid">
          <div class="public-section-card">
            <div class="section-head">
              <div>
                <h2 class="section-title">Upcoming Matches</h2>
                <p class="section-copy">The next fixtures scheduled in this tournament.</p>
              </div>
              <span class="status-pill upcoming">Schedule</span>
            </div>
            <div class="match-list" id="upcoming-root"></div>
          </div>

          <div class="public-section-card">
            <div class="section-head">
              <div>
                <h2 class="section-title">Recent Results</h2>
                <p class="section-copy">Latest completed matches and outcomes.</p>
              </div>
              <span class="status-pill done">Results</span>
            </div>
            <div class="match-list" id="completed-root"></div>
          </div>
        </div>
      </section>

      <section class="public-tab-panel" id="public-tab-table" role="tabpanel">
        <div class="public-section-card">
          <div class="section-head">
            <div>
              <h2 class="section-title">Points Table</h2>
              <p class="section-copy">Updated from completed match results and sorted by points and NRR.</p>
            </div>
            <span class="status-pill done">Standings</span>
          </div>
          <div id="standings-root"></div>
        </div>
      </section>
    </section>
  </main>

  <script src="public.js"></script>
</body>
</html>
