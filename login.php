<?php
require_once 'config.php';

if (isAdminLoggedIn()) {
    redirectTo('admin.php');
}

$error = '';
$notice = isset($_GET['logged_out']) ? 'You have been logged out.' : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = (string)($_POST['username'] ?? '');
    $password = (string)($_POST['password'] ?? '');

    if (loginAdmin($username, $password)) {
        redirectTo('admin.php');
    }

    $error = 'Invalid username or password.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Admin Login | CricketPro</title>
  <link rel="stylesheet" href="styles.css"/>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
</head>
<body class="login-body">
  <main class="login-shell">
    <section class="login-card">
      <div class="login-brand">
        <div class="login-brand-badge">CP</div>
        <div>
          <div class="login-title">Admin Access</div>
          <div class="login-sub">Login to manage live scoring, teams, matches, and points table.</div>
        </div>
      </div>

      <?php if ($notice !== ''): ?>
        <div class="login-note"><?= htmlspecialchars($notice, ENT_QUOTES, 'UTF-8') ?></div>
      <?php endif; ?>

      <?php if ($error !== ''): ?>
        <div class="login-error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
      <?php endif; ?>

      <form method="post" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            class="form-input"
            id="username"
            name="username"
            type="text"
            autocomplete="username"
            required
            value="<?= htmlspecialchars((string)($_POST['username'] ?? ''), ENT_QUOTES, 'UTF-8') ?>"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            class="form-input"
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <div class="login-actions">
          <button class="btn-primary" type="submit">Login</button>
          <a class="btn-ghost" href="index.php">Back To Live Page</a>
        </div>
      </form>

      <!-- <p class="login-note">Default admin credentials are set in `config.php`, and you can change them any time.</p> -->
    </section>
  </main>
</body>
</html>
