<?php
/**
 * CricketPro — fix_schema.php
 * 
 * Fixes the database schema by adding missing columns or recreating tables.
 * Run this if you get "Unknown column" errors.
 * 
 * Access: http://localhost/cricpro/fix_schema.php
 */

require_once 'config.php';
setHeaders();

try {
    $db = getDB();
    
    // Check if group_name column exists in teams table
    $result = $db->query("SHOW COLUMNS FROM teams LIKE 'group_name'");
    $columnExists = $result->rowCount() > 0;
    
    if (!$columnExists) {
        // Add the missing group_name column
        $db->exec("ALTER TABLE teams ADD COLUMN group_name VARCHAR(100) AFTER color");
        respond(['success' => true, 'message' => 'Added group_name column to teams table'], 200);
    } else {
        respond(['success' => true, 'message' => 'Schema is already correct - group_name column exists'], 200);
    }
    
} catch (Exception $e) {
    respond(['success' => false, 'error' => $e->getMessage()], 500);
}
