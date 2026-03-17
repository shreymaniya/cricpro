<?php
/**
 * CricketPro — init_database.php
 * 
 * This script initializes the database with sample data.
 * Run this ONCE after setup or when you want to reset to sample data.
 * 
 * Access: http://localhost/cricpro/init_database.php
 */

require_once 'config.php';
setHeaders();

try {
    $db = getDB();
    
    // Disable foreign key checks to allow deletion
    $db->exec("SET FOREIGN_KEY_CHECKS=0");
    
    // Clear existing data (in correct order due to foreign keys)
    $db->exec("DROP TABLE IF EXISTS match_scorecard");
    $db->exec("DROP TABLE IF EXISTS matches");
    $db->exec("DROP TABLE IF EXISTS players");
    $db->exec("DROP TABLE IF EXISTS teams");
    $db->exec("DROP TABLE IF EXISTS groups");
    
    // Re-enable foreign key checks
    $db->exec("SET FOREIGN_KEY_CHECKS=1");
    
    // Initialize tables
    require_once 'config.php';
    initializeDatabase();
    
    echo json_encode(['status' => 'Inserting groups...']);
    $groups = [
        ['name' => 'Group A', 'stage' => 'group'],
        ['name' => 'Group B', 'stage' => 'group'],
    ];
    $stmt = $db->prepare("INSERT INTO groups (name, stage) VALUES (:name, :stage)");
    foreach ($groups as $g) {
        $stmt->execute($g);
    }
    
    echo json_encode(['status' => 'Inserting teams...']);
    $teams = [
        ['name' => 'Mumbai Indians', 'code' => 'MI', 'color' => '#004ba0', 'group_name' => 'Group A', 'captain' => 'Rohit Sharma', 'home_ground' => 'Wankhede Stadium'],
        ['name' => 'Chennai Super Kings', 'code' => 'CSK', 'color' => '#f7a600', 'group_name' => 'Group A', 'captain' => 'MS Dhoni', 'home_ground' => 'Chepauk, Chennai'],
        ['name' => 'Royal Challengers', 'code' => 'RCB', 'color' => '#c40000', 'group_name' => 'Group A', 'captain' => 'Virat Kohli', 'home_ground' => 'Chinnaswamy Stadium'],
        ['name' => 'Kolkata Knight Riders', 'code' => 'KKR', 'color' => '#3a225d', 'group_name' => 'Group B', 'captain' => 'Shreyas Iyer', 'home_ground' => 'Eden Gardens'],
        ['name' => 'Delhi Capitals', 'code' => 'DC', 'color' => '#005da0', 'group_name' => 'Group B', 'captain' => 'David Warner', 'home_ground' => 'Arun Jaitley Stadium'],
        ['name' => 'Rajasthan Royals', 'code' => 'RR', 'color' => '#e01e5a', 'group_name' => 'Group B', 'captain' => 'Sanju Samson', 'home_ground' => 'Sawai Mansingh Stadium'],
    ];
    $stmt = $db->prepare("INSERT INTO teams (name, code, color, group_name, captain, home_ground) VALUES (:name, :code, :color, :group_name, :captain, :home_ground)");
    foreach ($teams as $t) {
        $stmt->execute($t);
    }
    
    echo json_encode(['status' => 'Inserting players...']);
    $players = [
        ['name' => 'Rohit Sharma', 'team_code' => 'MI', 'role' => 'batsman', 'jersey_number' => 45, 'nationality' => 'India'],
        ['name' => 'Jasprit Bumrah', 'team_code' => 'MI', 'role' => 'bowler', 'jersey_number' => 93, 'nationality' => 'India'],
        ['name' => 'Suryakumar Yadav', 'team_code' => 'MI', 'role' => 'batsman', 'jersey_number' => 73, 'nationality' => 'India'],
        ['name' => 'Hardik Pandya', 'team_code' => 'MI', 'role' => 'allrounder', 'jersey_number' => 28, 'nationality' => 'India'],
        ['name' => 'Ishan Kishan', 'team_code' => 'MI', 'role' => 'wicketkeeper', 'jersey_number' => 32, 'nationality' => 'India'],
        ['name' => 'MS Dhoni', 'team_code' => 'CSK', 'role' => 'wicketkeeper', 'jersey_number' => 7, 'nationality' => 'India'],
        ['name' => 'Ravindra Jadeja', 'team_code' => 'CSK', 'role' => 'allrounder', 'jersey_number' => 8, 'nationality' => 'India'],
        ['name' => 'Deepak Chahar', 'team_code' => 'CSK', 'role' => 'bowler', 'jersey_number' => 90, 'nationality' => 'India'],
        ['name' => 'Devon Conway', 'team_code' => 'CSK', 'role' => 'batsman', 'jersey_number' => 19, 'nationality' => 'New Zealand'],
        ['name' => 'Virat Kohli', 'team_code' => 'RCB', 'role' => 'batsman', 'jersey_number' => 18, 'nationality' => 'India'],
        ['name' => 'Glenn Maxwell', 'team_code' => 'RCB', 'role' => 'allrounder', 'jersey_number' => 32, 'nationality' => 'Australia'],
        ['name' => 'Mohammed Siraj', 'team_code' => 'RCB', 'role' => 'bowler', 'jersey_number' => 73, 'nationality' => 'India'],
        ['name' => 'Shreyas Iyer', 'team_code' => 'KKR', 'role' => 'batsman', 'jersey_number' => 41, 'nationality' => 'India'],
        ['name' => 'Andre Russell', 'team_code' => 'KKR', 'role' => 'allrounder', 'jersey_number' => 12, 'nationality' => 'West Indies'],
        ['name' => 'Sanju Samson', 'team_code' => 'RR', 'role' => 'wicketkeeper', 'jersey_number' => 9, 'nationality' => 'India'],
        ['name' => 'David Warner', 'team_code' => 'DC', 'role' => 'batsman', 'jersey_number' => 31, 'nationality' => 'Australia'],
    ];
    $stmt = $db->prepare("INSERT INTO players (name, team_code, role, jersey_number, nationality) VALUES (:name, :team_code, :role, :jersey_number, :nationality)");
    foreach ($players as $p) {
        $stmt->execute($p);
    }
    
    echo json_encode(['status' => 'Inserting matches...']);
    $matches = [
        ['team1_code' => 'MI', 'team2_code' => 'CSK', 'match_date' => '2025-03-22 14:00:00', 'venue' => 'Wankhede Stadium', 'match_type' => 'league', 'overs_per_innings' => 20, 'max_wickets' => 10, 'score1' => '187/5', 'score2' => '172/8', 'winner_code' => 'MI', 'result_summary' => 'MI won by 15 runs', 'status' => 'completed'],
        ['team1_code' => 'RCB', 'team2_code' => 'KKR', 'match_date' => '2025-03-23 14:00:00', 'venue' => 'Chinnaswamy Stadium', 'match_type' => 'league', 'overs_per_innings' => 20, 'max_wickets' => 10, 'score1' => '204/4', 'score2' => '207/6', 'winner_code' => 'KKR', 'result_summary' => 'KKR won by 4 wickets', 'status' => 'completed'],
        ['team1_code' => 'RR', 'team2_code' => 'DC', 'match_date' => '2025-03-24 14:00:00', 'venue' => 'Sawai Mansingh Stadium', 'match_type' => 'league', 'overs_per_innings' => 20, 'max_wickets' => 10, 'score1' => '165/8', 'score2' => '158/9', 'winner_code' => 'RR', 'result_summary' => 'RR won by 7 runs', 'status' => 'completed'],
        ['team1_code' => 'MI', 'team2_code' => 'RCB', 'match_date' => '2025-03-29 14:00:00', 'venue' => 'Wankhede Stadium', 'match_type' => 'league', 'overs_per_innings' => 20, 'max_wickets' => 10, 'score1' => NULL, 'score2' => NULL, 'winner_code' => NULL, 'result_summary' => NULL, 'status' => 'upcoming'],
        ['team1_code' => 'CSK', 'team2_code' => 'KKR', 'match_date' => '2025-03-30 14:00:00', 'venue' => 'Chepauk, Chennai', 'match_type' => 'league', 'overs_per_innings' => 20, 'max_wickets' => 10, 'score1' => NULL, 'score2' => NULL, 'winner_code' => NULL, 'result_summary' => NULL, 'status' => 'upcoming'],
    ];
    $stmt = $db->prepare("INSERT INTO matches (team1_code, team2_code, match_date, venue, match_type, overs_per_innings, max_wickets, score1, score2, winner_code, result_summary, status) VALUES (:team1_code, :team2_code, :match_date, :venue, :match_type, :overs_per_innings, :max_wickets, :score1, :score2, :winner_code, :result_summary, :status)");
    foreach ($matches as $m) {
        $stmt->execute($m);
    }
    
    respond(['success' => true, 'message' => 'Database initialized successfully! Now open http://localhost/cricpro/index.html'], 200);
    
} catch (Exception $e) {
    respond(['success' => false, 'error' => $e->getMessage()], 500);
}
