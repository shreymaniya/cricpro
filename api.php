<?php
/**
 * CricketPro — api.php  (final version)
 * Resources: tournaments | groups | teams | players | matches | standings | stats
 *
 * GET    /api.php?resource=X            → list
 * POST   /api.php?resource=X            → create
 * PUT    /api.php?resource=X&id=N       → update
 * DELETE /api.php?resource=X&id=N       → delete
 * POST   /api.php?resource=players&bulk=1 → bulk import
 * PUT    /api.php?resource=matches&id=N&result=1 → save match result + NRR
 */

require_once 'config.php';
setHeaders();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$method   = $_SERVER['REQUEST_METHOD'];
$resource = $_GET['resource'] ?? '';
$id       = isset($_GET['id']) ? (int)$_GET['id'] : null;

if ($method !== 'GET') {
    requireAdminAuth(true);
}

match($resource) {
    'groups'      => handleGroups($method, $id),
    'teams'       => handleTeams($method, $id),
    'players'     => handlePlayers($method, $id),
    'matches'     => handleMatches($method, $id),
    'standings'   => handleStandings(),
    'stats'       => handleStats(),
    default       => respond(['error' => "Unknown resource: $resource"], 404),
};

function resolveGroupId(PDO $db, ?string $groupName): ?int {
    if ($groupName === null || $groupName === '') {
        return null;
    }

    $stmt = $db->prepare("SELECT id FROM groups WHERE name = :name LIMIT 1");
    $stmt->execute(['name' => $groupName]);
    $groupId = $stmt->fetchColumn();

    return $groupId !== false ? (int)$groupId : null;
}

function getTeamCodeById(PDO $db, int $id): ?string {
    $stmt = $db->prepare("SELECT code FROM teams WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $id]);
    $code = $stmt->fetchColumn();

    return $code !== false ? (string)$code : null;
}

function deleteMatchesByIds(PDO $db, array $matchIds): void {
    if (!$matchIds) {
        return;
    }

    $scorecardDelete = $db->prepare("DELETE FROM match_scorecard WHERE match_id = :id");
    $matchDelete = $db->prepare("DELETE FROM matches WHERE id = :id");

    foreach ($matchIds as $matchId) {
        $scorecardDelete->execute(['id' => (int)$matchId]);
        $matchDelete->execute(['id' => (int)$matchId]);
    }
}

function deleteTeamCascade(PDO $db, int $id): void {
    $teamCode = getTeamCodeById($db, $id);
    if ($teamCode === null) {
        throw new RuntimeException('Team not found');
    }

    $matchStmt = $db->prepare(
        "SELECT id
         FROM matches
         WHERE team1_code = :team1_code OR team2_code = :team2_code"
    );
    $matchStmt->execute([
        'team1_code' => $teamCode,
        'team2_code' => $teamCode,
    ]);
    $matchIds = array_map('intval', $matchStmt->fetchAll(PDO::FETCH_COLUMN));

    deleteMatchesByIds($db, $matchIds);

    $db->prepare("DELETE FROM players WHERE team_code = :team_code")
       ->execute(['team_code' => $teamCode]);

    $db->prepare("DELETE FROM teams WHERE id = :id")
       ->execute(['id' => $id]);
}

function upsertMatchScorecard(PDO $db, int $matchId, ?array $scorecard): void {
    if (!$scorecard) {
        return;
    }

    $inn1 = $scorecard['inn1'] ?? [];
    $inn2 = $scorecard['inn2'] ?? [];
    $payload = [
        'match_id' => $matchId,
        'i1r' => (int)($inn1['runs'] ?? 0),
        'i1b' => (int)($inn1['balls'] ?? 0),
        'i2r' => (int)($inn2['runs'] ?? 0),
        'i2b' => (int)($inn2['balls'] ?? 0),
    ];

    $exists = $db->prepare("SELECT id FROM match_scorecard WHERE match_id = :match_id LIMIT 1");
    $exists->execute(['match_id' => $matchId]);

    if ($exists->fetchColumn()) {
        $db->prepare(
            "UPDATE match_scorecard
             SET innings1_runs = :i1r, innings1_balls = :i1b, innings2_runs = :i2r, innings2_balls = :i2b
             WHERE match_id = :match_id"
        )->execute($payload);
        return;
    }

    $db->prepare(
        "INSERT INTO match_scorecard (match_id, innings1_runs, innings1_balls, innings2_runs, innings2_balls)
         VALUES (:match_id, :i1r, :i1b, :i2r, :i2b)"
    )->execute($payload);
}

function inningsOversForNRR(?array $innings, int $maxBalls, int $maxWickets): float {
    if (!$innings) {
        return 0.0;
    }

    $balls = (int)($innings['balls'] ?? 0);
    $wickets = (int)($innings['wickets'] ?? 0);
    if ($balls <= 0) {
        return 0.0;
    }

    if ($wickets >= $maxWickets && $maxBalls > 0 && $balls < $maxBalls) {
        return $maxBalls / 6;
    }

    return $balls / 6;
}

function recalculateTeamStandings(PDO $db): void {
    $db->exec("UPDATE teams SET played = 0, won = 0, lost = 0, nr = 0, nrr = 0");

    $matches = $db->query(
        "SELECT id, team1_code, team2_code, winner_code, overs_per_innings, max_wickets, scorecard_json
         FROM matches
         WHERE status = 'completed'"
    )->fetchAll();

    $playedStmt = $db->prepare("UPDATE teams SET played = played + 1 WHERE code = :code");
    $wonStmt = $db->prepare("UPDATE teams SET won = won + 1 WHERE code = :code");
    $lostStmt = $db->prepare("UPDATE teams SET lost = lost + 1 WHERE code = :code");
    $nrStmt = $db->prepare("UPDATE teams SET nr = nr + 1 WHERE code = :code");

    foreach ($matches as $match) {
        $team1 = $match['team1_code'];
        $team2 = $match['team2_code'];
        $winner = $match['winner_code'] ?? null;

        $playedStmt->execute(['code' => $team1]);
        $playedStmt->execute(['code' => $team2]);

        if ($winner === $team1) {
            $wonStmt->execute(['code' => $team1]);
            $lostStmt->execute(['code' => $team2]);
        } elseif ($winner === $team2) {
            $wonStmt->execute(['code' => $team2]);
            $lostStmt->execute(['code' => $team1]);
        } else {
            $nrStmt->execute(['code' => $team1]);
            $nrStmt->execute(['code' => $team2]);
        }
    }

    $teamCodes = $db->query("SELECT code FROM teams")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($teamCodes as $code) {
        recalcNRR($db, (string)$code);
    }
}

function addMatchAppearance(array &$playedByTeam, string $teamCode, array $playerMap): void {
    if ($teamCode === '') {
        return;
    }

    if (!isset($playedByTeam[$teamCode])) {
        $playedByTeam[$teamCode] = [];
    }

    foreach (array_keys($playerMap) as $playerName) {
        $playedByTeam[$teamCode][$playerName] = true;
    }
}

function recalculatePlayerStats(PDO $db): void {
    $db->exec("UPDATE players SET matches_played = 0, total_runs = 0, total_wickets = 0");

    $matches = $db->query(
        "SELECT team1_code, team2_code, scorecard_json
         FROM matches
         WHERE status = 'completed' AND scorecard_json IS NOT NULL"
    )->fetchAll();

    $matchPlayedStmt = $db->prepare("UPDATE players SET matches_played = matches_played + 1 WHERE team_code = :team_code AND name = :name");
    $runsStmt = $db->prepare("UPDATE players SET total_runs = total_runs + :runs WHERE team_code = :team_code AND name = :name");
    $wicketsStmt = $db->prepare("UPDATE players SET total_wickets = total_wickets + :wickets WHERE team_code = :team_code AND name = :name");

    foreach ($matches as $match) {
        $scorecard = json_decode((string)$match['scorecard_json'], true);
        if (!is_array($scorecard)) {
            continue;
        }

        $playedByTeam = [];
        foreach (['inn1', 'inn2'] as $innKey) {
            $innings = $scorecard[$innKey] ?? null;
            if (!is_array($innings)) {
                continue;
            }

            $batTeam = strtoupper((string)($innings['batTeam'] ?? ''));
            $bowlTeam = strtoupper((string)($innings['bowlTeam'] ?? ''));
            $batsmen = is_array($innings['batsmen'] ?? null) ? $innings['batsmen'] : [];
            $bowlers = is_array($innings['bowlers'] ?? null) ? $innings['bowlers'] : [];

            addMatchAppearance($playedByTeam, $batTeam, $batsmen);
            addMatchAppearance($playedByTeam, $bowlTeam, $bowlers);

            foreach ($batsmen as $playerName => $stats) {
                $runsStmt->execute([
                    'runs' => (int)($stats['runs'] ?? 0),
                    'team_code' => $batTeam,
                    'name' => $playerName,
                ]);
            }

            foreach ($bowlers as $playerName => $stats) {
                $wicketsStmt->execute([
                    'wickets' => (int)($stats['wickets'] ?? 0),
                    'team_code' => $bowlTeam,
                    'name' => $playerName,
                ]);
            }
        }

        foreach ($playedByTeam as $teamCode => $players) {
            foreach (array_keys($players) as $playerName) {
                $matchPlayedStmt->execute([
                    'team_code' => $teamCode,
                    'name' => $playerName,
                ]);
            }
        }
    }
}

function refreshDerivedData(PDO $db): void {
    $lockName = 'cricketpro_refresh_derived_data';
    $lockStmt = $db->prepare("SELECT GET_LOCK(:name, 10)");
    $releaseStmt = $db->prepare("SELECT RELEASE_LOCK(:name)");
    $lockStmt->execute(['name' => $lockName]);
    $lockAcquired = (int)$lockStmt->fetchColumn() === 1;

    if (!$lockAcquired) {
        throw new RuntimeException('Could not refresh derived data');
    }

    try {
        $db->beginTransaction();
        recalculateTeamStandings($db);
        recalculatePlayerStats($db);
        $db->commit();
    } catch (Throwable $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        throw $e;
    } finally {
        $releaseStmt->execute(['name' => $lockName]);
    }
}

/* ============================================================
   GROUPS
   ============================================================ */
function handleGroups(string $m, ?int $id): void {
    $db = getDB();
    switch ($m) {
        case 'GET':
            respond($db->query("SELECT * FROM groups ORDER BY name ASC")->fetchAll());
        case 'POST':
            $b = getBody();
            if (empty($b['name'])) respond(['error' => 'name required'], 422);
            $db->prepare("INSERT INTO groups (name, stage) VALUES (:name, :stage)")
               ->execute(['name' => $b['name'], 'stage' => $b['stage'] ?? 'group']);
            respond(['id' => (int)$db->lastInsertId(), 'message' => 'Group created'], 201);
        case 'DELETE':
            if (!$id) respond(['error' => 'id required'], 422);
            $groupNameStmt = $db->prepare("SELECT name FROM groups WHERE id = :id LIMIT 1");
            $groupNameStmt->execute(['id' => $id]);
            $groupName = $groupNameStmt->fetchColumn();
            $db->prepare("UPDATE teams SET group_name = NULL, group_id = NULL WHERE group_id = :group_id OR group_name = :group_name")
               ->execute([
                   'group_id' => $id,
                   'group_name' => $groupName !== false ? $groupName : null,
                ]);
            $db->prepare("DELETE FROM groups WHERE id = :id")->execute(['id' => $id]);
            respond(['message' => 'Group deleted']);
        default: respond(['error' => 'Method not allowed'], 405);
    }
}

/* ============================================================
   TEAMS
   ============================================================ */
function handleTeams(string $m, ?int $id): void {
    $db = getDB();
    switch ($m) {
        case 'GET':
            refreshDerivedData($db);
            $filter = isset($_GET['group']) ? " WHERE t.group_name = :g" : '';
            $stmt = $db->prepare("SELECT t.*, COALESCE(g.name, t.group_name) AS group_name, (t.won*2+t.nr) AS pts FROM teams t LEFT JOIN groups g ON t.group_id = g.id $filter ORDER BY pts DESC, t.nrr DESC");
            $stmt->execute(isset($_GET['group']) ? ['g' => $_GET['group']] : []);
            respond($stmt->fetchAll());

        case 'POST':
            $b = getBody();
            if (empty($b['name']) || empty($b['code'])) respond(['error' => 'name and code required'], 422);
            $groupName = trim((string)($b['group_name'] ?? ''));
            $db->prepare("INSERT INTO teams (name,code,color,group_name,group_id,captain,home_ground) VALUES (:n,:c,:col,:g,:gid,:cap,:gr)")
               ->execute([
                   'n'=>$b['name'],
                   'c'=>strtoupper($b['code']),
                   'col'=>$b['color']??'#555',
                   'g'=>$groupName !== '' ? $groupName : null,
                   'gid'=>resolveGroupId($db, $groupName !== '' ? $groupName : null),
                   'cap'=>$b['captain']??'',
                   'gr'=>$b['ground']??''
                ]);
            respond(['id'=>(int)$db->lastInsertId(),'message'=>'Team created'],201);

        case 'PUT':
            if (!$id) respond(['error'=>'id required'],422);
            $b = getBody();
            $groupName = trim((string)($b['group_name'] ?? ''));
            $db->prepare("UPDATE teams SET name=:n,color=:col,group_name=:g,group_id=:gid,captain=:cap,home_ground=:gr WHERE id=:id")
               ->execute([
                   'n'=>$b['name'] ?? '',
                   'col'=>$b['color'] ?? '#555',
                   'g'=>$groupName !== '' ? $groupName : null,
                   'gid'=>resolveGroupId($db, $groupName !== '' ? $groupName : null),
                   'cap'=>$b['captain'] ?? '',
                   'gr'=>$b['ground'] ?? '',
                   'id'=>$id
                ]);
            respond(['message'=>'Team updated']);

        case 'DELETE':
            if (!$id) respond(['error'=>'id required'],422);
            $db->beginTransaction();
            try {
                deleteTeamCascade($db, $id);
                recalculateTeamStandings($db);
                recalculatePlayerStats($db);
                $db->commit();
            } catch (Throwable $e) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                respond(['error' => $e->getMessage()], 500);
            }
            respond(['message'=>'Team deleted']);

        default: respond(['error'=>'Method not allowed'],405);
    }
}

/* ============================================================
   PLAYERS
   ============================================================ */
function handlePlayers(string $m, ?int $id): void {
    $db = getDB();

    // Bulk import
    if ($m === 'POST' && isset($_GET['bulk'])) {
        $b = getBody();
        if (empty($b['players']) || !is_array($b['players'])) respond(['error'=>'players array required'],422);
        $stmt = $db->prepare("INSERT INTO players (name,team_code,role,jersey_number,nationality,matches_played,total_runs,total_wickets) VALUES (:n,:t,:r,:j,:c,:m,:ru,:w)");
        $added = 0;
        foreach ($b['players'] as $p) {
            if (empty($p['name']) || empty($p['team_code'])) continue;
            $stmt->execute([
                'n'=>$p['name'],
                't'=>strtoupper($p['team_code']),
                'r'=>$p['role']??'batsman',
                'j'=>$p['jersey_number']??null,
                'c'=>$p['nationality']??'',
                'm'=>(int)($p['matches_played'] ?? 0),
                'ru'=>(int)($p['total_runs'] ?? 0),
                'w'=>(int)($p['total_wickets'] ?? 0)
            ]);
            $added++;
        }
        respond(['added' => $added, 'message' => "$added players imported"], 201);
    }

    if ($m === 'DELETE' && isset($_GET['all'])) {
        $deleted = (int)$db->query("SELECT COUNT(*) FROM players")->fetchColumn();
        $db->exec("DELETE FROM players");
        respond([
            'deleted' => $deleted,
            'message' => $deleted ? 'All players cleared' : 'No players to clear',
        ]);
    }

    switch ($m) {
        case 'GET':
            refreshDerivedData($db);
            $where='1=1'; $params=[];
            if (isset($_GET['team'])) { $where='p.team_code=:t'; $params=['t'=>strtoupper($_GET['team'])]; }
            if (isset($_GET['role'])) { $where.=' AND p.role=:r'; $params['r']=$_GET['role']; }
            $stmt=$db->prepare("SELECT p.*,t.name AS team_name,t.color AS team_color FROM players p LEFT JOIN teams t ON p.team_code=t.code WHERE $where ORDER BY p.name");
            $stmt->execute($params); respond($stmt->fetchAll());

        case 'POST':
            $b=getBody();
            if(empty($b['name'])||empty($b['team_code'])) respond(['error'=>'name and team_code required'],422);
            $db->prepare("INSERT INTO players (name,team_code,role,jersey_number,nationality,matches_played,total_runs,total_wickets) VALUES(:n,:t,:r,:j,:c,:m,:ru,:w)")
               ->execute([
                   'n'=>$b['name'],
                   't'=>strtoupper($b['team_code']),
                   'r'=>$b['role']??'batsman',
                   'j'=>$b['jersey_number']??null,
                   'c'=>$b['nationality']??'',
                   'm'=>(int)($b['matches_played'] ?? 0),
                   'ru'=>(int)($b['total_runs'] ?? 0),
                   'w'=>(int)($b['total_wickets'] ?? 0)
                ]);
            respond(['id'=>(int)$db->lastInsertId(),'message'=>'Player registered'],201);

        case 'PUT':
            if(!$id) respond(['error'=>'id required'],422);
            $b=getBody();
            $db->prepare("UPDATE players SET name=COALESCE(:n,name),team_code=COALESCE(:t,team_code),role=COALESCE(:r,role),jersey_number=COALESCE(:j,jersey_number),nationality=COALESCE(:c,nationality),matches_played=COALESCE(:m,matches_played),total_runs=COALESCE(:ru,total_runs),total_wickets=COALESCE(:w,total_wickets) WHERE id=:id")
               ->execute(['n'=>$b['name']??null,'t'=>$b['team_code']??null,'r'=>$b['role']??null,'j'=>$b['jersey_number']??null,'c'=>$b['nationality']??null,'m'=>$b['matches_played']??null,'ru'=>$b['total_runs']??null,'w'=>$b['total_wickets']??null,'id'=>$id]);
            respond(['message'=>'Player updated']);

        case 'DELETE':
            if(!$id) respond(['error'=>'id required'],422);
            $db->prepare("DELETE FROM players WHERE id=:id")->execute(['id'=>$id]);
            respond(['message'=>'Player removed']);

        default: respond(['error'=>'Method not allowed'],405);
    }
}

/* ============================================================
   MATCHES
   ============================================================ */
function handleMatches(string $m, ?int $id): void {
    $db = getDB();
    switch ($m) {
        case 'GET':
            $where='1=1'; $params=[];
            if(isset($_GET['status'])){$where='m.status=:s';$params=['s'=>$_GET['status']];}
            $stmt=$db->prepare("SELECT m.*,t1.name AS t1_name,t1.color AS t1_color,t2.name AS t2_name,t2.color AS t2_color FROM matches m LEFT JOIN teams t1 ON m.team1_code=t1.code LEFT JOIN teams t2 ON m.team2_code=t2.code WHERE $where ORDER BY m.match_date ASC");
            $stmt->execute($params); respond($stmt->fetchAll());

        case 'POST':
            $b=getBody();
            if(empty($b['team1_code'])||empty($b['team2_code'])||empty($b['match_date'])) respond(['error'=>'team1_code, team2_code, match_date required'],422);
            $db->prepare("INSERT INTO matches (team1_code,team2_code,match_date,venue,match_type,overs_per_innings,max_wickets,status) VALUES(:t1,:t2,:d,:v,:ty,:ov,:mw,'upcoming')")
               ->execute(['t1'=>strtoupper($b['team1_code']),'t2'=>strtoupper($b['team2_code']),'d'=>$b['match_date'],'v'=>$b['venue']??'','ty'=>$b['match_type']??'league','ov'=>(int)($b['overs_per_innings']??20),'mw'=>(int)($b['max_wickets']??10)]);
            respond(['id'=>(int)$db->lastInsertId(),'message'=>'Match scheduled'],201);

        case 'PUT':
            if(!$id) respond(['error'=>'id required'],422);
            $b=getBody();
            if(isset($_GET['result'])){
                // Save result + update NRR
                $db->beginTransaction();
                try {
                    $scorecard = is_array($b['scorecard'] ?? null) ? $b['scorecard'] : null;
                    $db->prepare("UPDATE matches SET score1=:s1,score2=:s2,winner_code=:w,result_summary=:rs,player_of_match=:pm,status='completed',scorecard_json=:sc WHERE id=:id")
                       ->execute([
                           's1'=>$b['score1'],
                           's2'=>$b['score2'],
                           'w'=>$b['winner_code'],
                           'rs'=>$b['result_summary']??'',
                           'pm'=>$b['player_of_match']??'',
                           'sc'=>json_encode($scorecard),
                           'id'=>$id
                        ]);
                    upsertMatchScorecard($db, $id, $scorecard);
                    recalculateTeamStandings($db);
                    recalculatePlayerStats($db);
                    $db->commit(); respond(['message'=>'Result saved, NRR and player stats updated']);
                } catch(Exception $e){ $db->rollBack(); respond(['error'=>$e->getMessage()],500); }
            } elseif (isset($_GET['reopen'])) {
                $db->beginTransaction();
                try {
                    $scorecard = is_array($b['scorecard'] ?? null) ? $b['scorecard'] : null;
                    $db->prepare("UPDATE matches SET status=:status, score1=:s1, score2=:s2, winner_code=NULL, result_summary='', player_of_match='', scorecard_json=:sc WHERE id=:id")
                       ->execute([
                           'status'=>$b['status'] ?? 'live',
                           's1'=>$b['score1'] ?? '',
                           's2'=>$b['score2'] ?? '',
                           'sc'=>json_encode($scorecard),
                           'id'=>$id
                        ]);
                    upsertMatchScorecard($db, $id, $scorecard);
                    recalculateTeamStandings($db);
                    recalculatePlayerStats($db);
                    $db->commit();
                    respond(['message'=>'Match reopened']);
                } catch(Exception $e){ $db->rollBack(); respond(['error'=>$e->getMessage()],500); }
            } else {
                $fields = [];
                $params = ['id' => $id];
                $map = [
                    'status' => 'status',
                    'venue' => 'venue',
                    'score1' => 'score1',
                    'score2' => 'score2',
                    'player_of_match' => 'player_of_match',
                    'result_summary' => 'result_summary',
                ];

                foreach ($map as $bodyKey => $column) {
                    if (array_key_exists($bodyKey, $b)) {
                        $fields[] = "$column = :$bodyKey";
                        $params[$bodyKey] = $b[$bodyKey];
                    }
                }

                if (array_key_exists('scorecard', $b)) {
                    $scorecard = is_array($b['scorecard']) ? $b['scorecard'] : null;
                    $fields[] = "scorecard_json = :scorecard_json";
                    $params['scorecard_json'] = json_encode($scorecard);
                    upsertMatchScorecard($db, $id, $scorecard);
                }

                if (!$fields) {
                    respond(['error' => 'No fields to update'], 422);
                }

                $db->prepare("UPDATE matches SET " . implode(', ', $fields) . " WHERE id=:id")
                   ->execute($params);
                respond(['message'=>'Match updated']);
            }

        case 'DELETE':
            if(!$id) respond(['error'=>'id required'],422);
            $db->beginTransaction();
            try {
                $scorecardDelete = $db->prepare("DELETE FROM match_scorecard WHERE match_id = :id");
                $scorecardDelete->execute(['id' => $id]);
                $db->prepare("DELETE FROM matches WHERE id=:id")->execute(['id'=>$id]);
                recalculateTeamStandings($db);
                recalculatePlayerStats($db);
                $db->commit();
            } catch (Exception $e) {
                $db->rollBack();
                respond(['error' => $e->getMessage()], 500);
            }
            respond(['message'=>'Match deleted']);

        default: respond(['error'=>'Method not allowed'],405);
    }
}

/* NRR recalculation */
function recalcNRR(PDO $db, string $code): void {
    $stmt=$db->prepare(
        "SELECT m.team1_code, m.team2_code, m.overs_per_innings, m.max_wickets, m.scorecard_json
         FROM matches m
         WHERE m.status='completed' AND (m.team1_code=:team1_code OR m.team2_code=:team2_code)"
    );
    $stmt->execute([
        'team1_code' => $code,
        'team2_code' => $code,
    ]);
    $rows=$stmt->fetchAll();
    $rsTotal=0.0;$obFaced=0.0;$rcTotal=0.0;$obBowled=0.0;
    foreach($rows as $r){
        $scorecard = json_decode((string)($r['scorecard_json'] ?? ''), true);
        if (!is_array($scorecard)) {
            continue;
        }

        $inn1 = is_array($scorecard['inn1'] ?? null) ? $scorecard['inn1'] : null;
        $inn2 = is_array($scorecard['inn2'] ?? null) ? $scorecard['inn2'] : null;
        if (!$inn1 || !$inn2) {
            continue;
        }

        $maxBalls = (int)($r['overs_per_innings'] ?? 0) * 6;
        $maxWickets = (int)($r['max_wickets'] ?? 10);
        $inn1BatTeam = strtoupper((string)($inn1['batTeam'] ?? ''));
        $inn2BatTeam = strtoupper((string)($inn2['batTeam'] ?? ''));

        if ($inn1BatTeam === $code) {
            $rsTotal += (int)($inn1['runs'] ?? 0);
            $obFaced += inningsOversForNRR($inn1, $maxBalls, $maxWickets);
            $rcTotal += (int)($inn2['runs'] ?? 0);
            $obBowled += inningsOversForNRR($inn2, $maxBalls, $maxWickets);
        } elseif ($inn2BatTeam === $code) {
            $rsTotal += (int)($inn2['runs'] ?? 0);
            $obFaced += inningsOversForNRR($inn2, $maxBalls, $maxWickets);
            $rcTotal += (int)($inn1['runs'] ?? 0);
            $obBowled += inningsOversForNRR($inn1, $maxBalls, $maxWickets);
        }
    }

    $nrr = 0.0;
    if($obFaced>0 && $obBowled>0) {
        $nrr = ($rsTotal / $obFaced) - ($rcTotal / $obBowled);
    }

    $db->prepare("UPDATE teams SET nrr=:nrr WHERE code=:c")->execute(['nrr'=>round($nrr,3),'c'=>$code]);
}

/* ============================================================
   STANDINGS
   ============================================================ */
function handleStandings(): void {
    $db=getDB();
    refreshDerivedData($db);
    $stmt=$db->query("SELECT t.*,(t.won*2+t.nr) AS pts,COALESCE(g.name, t.group_name) AS group_name FROM teams t LEFT JOIN groups g ON t.group_id=g.id ORDER BY COALESCE(g.name, t.group_name),pts DESC,t.nrr DESC");
    respond($stmt->fetchAll());
}

/* ============================================================
   STATS
   ============================================================ */
function handleStats(): void {
    $db=getDB();
    refreshDerivedData($db);
    respond([
        'teams'     => (int)$db->query("SELECT COUNT(*) FROM teams")->fetchColumn(),
        'players'   => (int)$db->query("SELECT COUNT(*) FROM players")->fetchColumn(),
        'matches'   => (int)$db->query("SELECT COUNT(*) FROM matches")->fetchColumn(),
        'completed' => (int)$db->query("SELECT COUNT(*) FROM matches WHERE status='completed'")->fetchColumn(),
        'live'      => (int)$db->query("SELECT COUNT(*) FROM matches WHERE status='live'")->fetchColumn(),
        'top_scorer'=> $db->query("SELECT name,total_runs v,team_code FROM players ORDER BY total_runs DESC LIMIT 1")->fetch(),
        'top_wickets'=> $db->query("SELECT name,total_wickets v,team_code FROM players ORDER BY total_wickets DESC LIMIT 1")->fetch(),
    ]);
}
