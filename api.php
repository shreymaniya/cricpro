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

match($resource) {
    'groups'      => handleGroups($method, $id),
    'teams'       => handleTeams($method, $id),
    'players'     => handlePlayers($method, $id),
    'matches'     => handleMatches($method, $id),
    'standings'   => handleStandings(),
    'stats'       => handleStats(),
    default       => respond(['error' => "Unknown resource: $resource"], 404),
};

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
            $db->prepare("UPDATE teams SET group_name=NULL WHERE group_id=:id")->execute(['id'=>$id]);
            $db->prepare("DELETE FROM groups WHERE id=:id")->execute(['id'=>$id]);
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
            $filter = isset($_GET['group']) ? " WHERE t.group_name = :g" : '';
            $stmt = $db->prepare("SELECT t.*, (t.won*2+t.nr) AS pts FROM teams t $filter ORDER BY pts DESC, t.nrr DESC");
            $stmt->execute(isset($_GET['group']) ? ['g' => $_GET['group']] : []);
            respond($stmt->fetchAll());

        case 'POST':
            $b = getBody();
            if (empty($b['name']) || empty($b['code'])) respond(['error' => 'name and code required'], 422);
            $db->prepare("INSERT INTO teams (name,code,color,group_name,captain,home_ground) VALUES (:n,:c,:col,:g,:cap,:gr)")
               ->execute(['n'=>$b['name'],'c'=>strtoupper($b['code']),'col'=>$b['color']??'#555','g'=>$b['group_name']??null,'cap'=>$b['captain']??'','gr'=>$b['ground']??'']);
            respond(['id'=>(int)$db->lastInsertId(),'message'=>'Team created'],201);

        case 'PUT':
            if (!$id) respond(['error'=>'id required'],422);
            $b = getBody();
            $db->prepare("UPDATE teams SET name=COALESCE(:n,name),color=COALESCE(:col,color),group_name=COALESCE(:g,group_name),captain=COALESCE(:cap,captain),home_ground=COALESCE(:gr,home_ground) WHERE id=:id")
               ->execute(['n'=>$b['name']??null,'col'=>$b['color']??null,'g'=>$b['group_name']??null,'cap'=>$b['captain']??null,'gr'=>$b['ground']??null,'id'=>$id]);
            respond(['message'=>'Team updated']);

        case 'DELETE':
            if (!$id) respond(['error'=>'id required'],422);
            $db->prepare("DELETE FROM teams WHERE id=:id")->execute(['id'=>$id]);
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
        $stmt = $db->prepare("INSERT INTO players (name,team_code,role,jersey_number,nationality) VALUES (:n,:t,:r,:j,:c)");
        $added = 0;
        foreach ($b['players'] as $p) {
            if (empty($p['name']) || empty($p['team_code'])) continue;
            $stmt->execute(['n'=>$p['name'],'t'=>strtoupper($p['team_code']),'r'=>$p['role']??'batsman','j'=>$p['jersey_number']??null,'c'=>$p['nationality']??'']);
            $added++;
        }
        respond(['added' => $added, 'message' => "$added players imported"], 201);
    }

    switch ($m) {
        case 'GET':
            $where='1=1'; $params=[];
            if (isset($_GET['team'])) { $where='p.team_code=:t'; $params=['t'=>strtoupper($_GET['team'])]; }
            if (isset($_GET['role'])) { $where.=' AND p.role=:r'; $params['r']=$_GET['role']; }
            $stmt=$db->prepare("SELECT p.*,t.name AS team_name,t.color AS team_color FROM players p LEFT JOIN teams t ON p.team_code=t.code WHERE $where ORDER BY p.name");
            $stmt->execute($params); respond($stmt->fetchAll());

        case 'POST':
            $b=getBody();
            if(empty($b['name'])||empty($b['team_code'])) respond(['error'=>'name and team_code required'],422);
            $db->prepare("INSERT INTO players (name,team_code,role,jersey_number,nationality) VALUES(:n,:t,:r,:j,:c)")
               ->execute(['n'=>$b['name'],'t'=>strtoupper($b['team_code']),'r'=>$b['role']??'batsman','j'=>$b['jersey_number']??null,'c'=>$b['nationality']??'']);
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
                    $db->prepare("UPDATE matches SET score1=:s1,score2=:s2,winner_code=:w,result_summary=:rs,player_of_match=:pm,status='completed',scorecard_json=:sc WHERE id=:id")
                       ->execute(['s1'=>$b['score1'],'s2'=>$b['score2'],'w'=>$b['winner_code'],'rs'=>$b['result_summary']??'','pm'=>$b['player_of_match']??'','sc'=>json_encode($b['scorecard']??null),'id'=>$id]);
                    $row=$db->prepare("SELECT team1_code,team2_code FROM matches WHERE id=:id");
                    $row->execute(['id'=>$id]); $mr=$row->fetch();
                    $win=$b['winner_code']; $lose=$win===$mr['team1_code']?$mr['team2_code']:$mr['team1_code'];
                    $db->prepare("UPDATE teams SET won=won+1,played=played+1 WHERE code=:c")->execute(['c'=>$win]);
                    $db->prepare("UPDATE teams SET lost=lost+1,played=played+1 WHERE code=:c")->execute(['c'=>$lose]);
                    recalcNRR($db, $win); recalcNRR($db, $lose);
                    $db->commit(); respond(['message'=>'Result saved, NRR updated']);
                } catch(Exception $e){ $db->rollBack(); respond(['error'=>$e->getMessage()],500); }
            } else {
                $db->prepare("UPDATE matches SET status=COALESCE(:st,status),venue=COALESCE(:v,venue) WHERE id=:id")
                   ->execute(['st'=>$b['status']??null,'v'=>$b['venue']??null,'id'=>$id]);
                respond(['message'=>'Match updated']);
            }

        case 'DELETE':
            if(!$id) respond(['error'=>'id required'],422);
            $db->prepare("DELETE FROM matches WHERE id=:id")->execute(['id'=>$id]);
            respond(['message'=>'Match deleted']);

        default: respond(['error'=>'Method not allowed'],405);
    }
}

/* NRR recalculation */
function recalcNRR(PDO $db, string $code): void {
    $stmt=$db->prepare(
        "SELECT m.team1_code,m.team2_code,ms.innings1_runs,ms.innings1_balls,ms.innings2_runs,ms.innings2_balls
         FROM matches m
         JOIN match_scorecard ms ON ms.match_id=m.id
         WHERE m.status='completed' AND (m.team1_code=:c OR m.team2_code=:c)"
    );
    $stmt->execute(['c'=>$code]);
    $rows=$stmt->fetchAll();
    $rsTotal=0;$obFaced=0;$rcTotal=0;$obBowled=0;
    foreach($rows as $r){
        if($r['team1_code']===$code){
            $rsTotal+=$r['innings1_runs']??0; $obFaced+=($r['innings1_balls']??0)/6;
            $rcTotal+=$r['innings2_runs']??0; $obBowled+=($r['innings2_balls']??0)/6;
        } else {
            $rsTotal+=$r['innings2_runs']??0; $obFaced+=($r['innings2_balls']??0)/6;
            $rcTotal+=$r['innings1_runs']??0; $obBowled+=($r['innings1_balls']??0)/6;
        }
    }
    $nrr=0;
    if($obFaced>0&&$obBowled>0) $nrr=($rsTotal/$obFaced)-($rcTotal/$obBowled);
    elseif($obFaced>0) $nrr=$rsTotal/$obFaced;
    $db->prepare("UPDATE teams SET nrr=:nrr WHERE code=:c")->execute(['nrr'=>round($nrr,3),'c'=>$code]);
}

/* ============================================================
   STANDINGS
   ============================================================ */
function handleStandings(): void {
    $db=getDB();
    $stmt=$db->query("SELECT t.*,(t.won*2+t.nr) AS pts,g.name AS group_name FROM teams t LEFT JOIN groups g ON t.group_id=g.id ORDER BY g.name,pts DESC,t.nrr DESC");
    respond($stmt->fetchAll());
}

/* ============================================================
   STATS
   ============================================================ */
function handleStats(): void {
    $db=getDB();
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
