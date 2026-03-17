<?php
/**
 * CricketPro — config.php
 * Database configuration and helper functions
 */

// ============================================================
// DATABASE CONFIGURATION
// ============================================================
// define('DB_HOST',   'localhost');
// define('DB_NAME',   'cricketpro');
// define('DB_USER',   'root');
// define('DB_PASS',   '');
// define('DB_PORT',   3306);

// ============================================================
// Live server DATABASE CONFIGURATION
// ============================================================
define('DB_HOST',   'sql102.infinityfree.com');
define('DB_NAME',   'if0_40799604_cricketpro');
define('DB_USER',   'if0_40799604');
define('DB_PASS',   'pxwRovrRZtbfZ');
define('DB_PORT',   3306);

// ============================================================
// DATABASE CONNECTION
// ============================================================
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
        }
    }
    return $pdo;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Set CORS and JSON headers
 */
function setHeaders(): void {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept');
    header('Content-Type: application/json; charset=utf-8');
}

/**
 * Get JSON body from request
 */
function getBody(): array {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return is_array($data) ? $data : [];
}

/**
 * Send JSON response
 */
function respond(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Initialize database tables if they don't exist
 */
function initializeDatabase(): void {
    $db = getDB();
    
    // Groups table
    $db->exec("CREATE TABLE IF NOT EXISTS groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        stage VARCHAR(50) DEFAULT 'group'
    )");
    
    // Teams table
    $db->exec("CREATE TABLE IF NOT EXISTS teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(10) UNIQUE NOT NULL,
        color VARCHAR(7) DEFAULT '#555',
        group_name VARCHAR(100),
        group_id INT,
        captain VARCHAR(100),
        home_ground VARCHAR(150),
        played INT DEFAULT 0,
        won INT DEFAULT 0,
        lost INT DEFAULT 0,
        nr INT DEFAULT 0,
        nrr DECIMAL(10, 3) DEFAULT 0,
        FOREIGN KEY (group_id) REFERENCES groups(id)
    )");
    
    // Players table
    $db->exec("CREATE TABLE IF NOT EXISTS players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        team_code VARCHAR(10) NOT NULL,
        role VARCHAR(50) DEFAULT 'batsman',
        jersey_number INT,
        nationality VARCHAR(50),
        matches_played INT DEFAULT 0,
        total_runs INT DEFAULT 0,
        total_wickets INT DEFAULT 0,
        FOREIGN KEY (team_code) REFERENCES teams(code)
    )");
    
    // Matches table
    $db->exec("CREATE TABLE IF NOT EXISTS matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team1_code VARCHAR(10) NOT NULL,
        team2_code VARCHAR(10) NOT NULL,
        match_date DATETIME NOT NULL,
        venue VARCHAR(150),
        match_type VARCHAR(50) DEFAULT 'league',
        overs_per_innings INT DEFAULT 20,
        max_wickets INT DEFAULT 10,
        score1 VARCHAR(50),
        score2 VARCHAR(50),
        winner_code VARCHAR(10),
        result_summary TEXT,
        player_of_match VARCHAR(100),
        status VARCHAR(20) DEFAULT 'upcoming',
        scorecard_json LONGTEXT,
        FOREIGN KEY (team1_code) REFERENCES teams(code),
        FOREIGN KEY (team2_code) REFERENCES teams(code),
        FOREIGN KEY (winner_code) REFERENCES teams(code)
    )");
    
    // Match scorecard table
    $db->exec("CREATE TABLE IF NOT EXISTS match_scorecard (
        id INT AUTO_INCREMENT PRIMARY KEY,
        match_id INT NOT NULL,
        innings1_runs INT DEFAULT 0,
        innings1_balls INT DEFAULT 0,
        innings2_runs INT DEFAULT 0,
        innings2_balls INT DEFAULT 0,
        FOREIGN KEY (match_id) REFERENCES matches(id)
    )");
}

// Initialize database on first load
if (!defined('DB_INITIALIZED')) {
    define('DB_INITIALIZED', true);
    try {
        initializeDatabase();
    } catch (Exception $e) {
        // Tables might already exist, silently continue
    }
}
