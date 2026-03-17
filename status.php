<?php
/**
 * CricketPro — status.php
 * 
 * Check database connection and table structure.
 * URL: http://localhost/cricpro/status.php
 */

require_once 'config.php';
setHeaders();

try {
    $db = getDB();
    
    // Get table information
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    $stats = [
        'database_name' => DB_NAME,
        'connected' => true,
        'tables' => $tables,
        'data_count' => [
            'groups' => (int)$db->query("SELECT COUNT(*) FROM groups")->fetchColumn(),
            'teams' => (int)$db->query("SELECT COUNT(*) FROM teams")->fetchColumn(),
            'players' => (int)$db->query("SELECT COUNT(*) FROM players")->fetchColumn(),
            'matches' => (int)$db->query("SELECT COUNT(*) FROM matches")->fetchColumn(),
        ]
    ];
    
    respond($stats);
    
} catch (Exception $e) {
    respond([
        'connected' => false,
        'error' => $e->getMessage(),
        'tip' => 'Make sure MySQL is running and database "cricpro" exists'
    ], 500);
}
