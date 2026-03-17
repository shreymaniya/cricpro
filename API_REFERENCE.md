# CricketPro — API & Database Reference

## 🔌 API Endpoints

All requests go to: `http://localhost/cricpro/api.php`

### Groups
```
GET    /api.php?resource=groups          # List all groups
POST   /api.php?resource=groups          # Create new group
PUT    /api.php?resource=groups&id=1     # Update group 1
DELETE /api.php?resource=groups&id=1     # Delete group 1
```

### Teams
```
GET    /api.php?resource=teams           # List all teams
POST   /api.php?resource=teams           # Create new team
PUT    /api.php?resource=teams&id=3      # Update team 3
DELETE /api.php?resource=teams&id=3      # Delete team 3
```

### Players
```
GET    /api.php?resource=players         # List all players
POST   /api.php?resource=players         # Create new player
PUT    /api.php?resource=players&id=5    # Update player 5
DELETE /api.php?resource=players&id=5    # Delete player 5
```

### Matches
```
GET    /api.php?resource=matches         # List all matches
POST   /api.php?resource=matches         # Create new match
PUT    /api.php?resource=matches&id=2    # Update match 2
DELETE /api.php?resource=matches&id=2    # Delete match 2
```

### Standings & Stats
```
GET    /api.php?resource=standings       # Get league standings
GET    /api.php?resource=stats           # Get statistics
```

---

## 📋 Database Field Reference

### groups table
| Field | Type | Example |
|-------|------|---------|
| id | INT | 1 |
| name | VARCHAR | "Group A" |
| stage | VARCHAR | "League Stage" |

**POST/PUT Body:**
```json
{
  "name": "Group A",
  "stage": "League Stage"
}
```

---

### teams table
| Field | Type | Example |
|-------|------|---------|
| id | INT | 1 |
| name | VARCHAR | "Mumbai Indians" |
| code | VARCHAR | "MI" |
| color | VARCHAR | "#1f4788" |
| group_name | VARCHAR | "Group A" |
| captain | VARCHAR | "Rohit Sharma" |
| home_ground | VARCHAR | "Wankhede Stadium" |
| played | INT | 5 |
| won | INT | 4 |
| lost | INT | 1 |
| nr | INT | 0 |
| nrr | DECIMAL | 0.45 |

**POST Body:**
```json
{
  "name": "Mumbai Indians",
  "code": "MI",
  "color": "#1f4788",
  "group_name": "Group A",
  "captain": "Rohit Sharma",
  "home_ground": "Wankhede Stadium"
}
```

**PUT Body:** (Include only fields to update)
```json
{
  "captain": "Hardik Pandya",
  "played": 6,
  "won": 5
}
```

---

### players table
| Field | Type | Example |
|-------|------|---------|
| id | INT | 1 |
| name | VARCHAR | "Virat Kohli" |
| team_code | VARCHAR | "RCB" |
| role | VARCHAR | "batsman" |
| jersey_number | INT | 18 |
| nationality | VARCHAR | "India" |
| matches_played | INT | 5 |
| total_runs | INT | 187 |
| total_wickets | INT | 0 |

**POST Body:**
```json
{
  "name": "Virat Kohli",
  "team_code": "RCB",
  "role": "batsman",
  "jersey_number": 18,
  "nationality": "India"
}
```

**PUT Body:** (Include only fields to update)
```json
{
  "role": "all-rounder",
  "matches_played": 6,
  "total_runs": 250,
  "total_wickets": 2
}
```

**Roles:** batsman | bowler | all-rounder | wicket-keeper

---

### matches table
| Field | Type | Example |
|-------|------|---------|
| id | INT | 1 |
| team1_code | VARCHAR | "MI" |
| team2_code | VARCHAR | "CSK" |
| match_date | DATETIME | "2024-01-15 19:30:00" |
| venue | VARCHAR | "Eden Gardens" |
| match_type | VARCHAR | "T20" |
| overs_per_innings | INT | 20 |
| max_wickets | INT | 10 |
| score1 | INT | 165 |
| score2 | INT | 162 |
| winner_code | VARCHAR | "MI" |
| result_summary | VARCHAR | "MI won by 3 runs" |
| status | VARCHAR | "completed" |
| scorecard_json | JSON | {...} |

**POST Body (Schedule Match):**
```json
{
  "team1_code": "MI",
  "team2_code": "CSK",
  "match_date": "2024-01-15 19:30:00",
  "venue": "Eden Gardens",
  "match_type": "T20",
  "overs_per_innings": 20,
  "max_wickets": 10
}
```

**PUT Body (Start Live Match):**
```json
{
  "status": "live"
}
```

**PUT Body (End Live Match with Score):**
```json
{
  "status": "completed",
  "score1": 165,
  "score2": 162,
  "winner_code": "MI",
  "result_summary": "MI won by 3 runs",
  "scorecard_json": {
    "innings1": {...},
    "innings2": {...}
  }
}
```

**Status Values:** scheduled | live | completed | abandoned

**Match Types:** T20 | ODI | Test

---

## 🔄 JavaScript Integration

### Making API Calls in app.js

```javascript
// GET all teams
const teams = await apiCall('teams', 'GET');

// POST - Create new player
const newPlayer = await apiCall('players', 'POST', {
  name: "MS Dhoni",
  team_code: "CSK",
  role: "wicket-keeper",
  jersey_number: 7,
  nationality: "India"
});

// PUT - Update team stats
const updated = await apiCall('teams', 'PUT', {
  played: 6,
  won: 5,
  lost: 1
}, '&id=5');

// DELETE - Remove a match
await apiCall('matches', 'DELETE', null, '&id=3');
```

### apiCall() Function Signature
```javascript
async function apiCall(resource, method='GET', body=null, params='') {
  // resource: 'groups', 'teams', 'players', 'matches', 'standings', 'stats'
  // method: 'GET', 'POST', 'PUT', 'DELETE'
  // body: JSON object for POST/PUT
  // params: additional URL params like '&id=5'
  
  // Returns: Parsed JSON response from API
}
```

---

## ✨ Response Format

### Success Response (GET)
```json
[
  {
    "id": 1,
    "name": "Mumbai Indians",
    "code": "MI",
    "color": "#1f4788",
    "group_name": "Group A",
    "captain": "Rohit Sharma",
    "home_ground": "Wankhede Stadium",
    "played": 5,
    "won": 4,
    "lost": 1,
    "nr": 0,
    "nrr": 0.45
  }
]
```

### Success Response (POST/PUT)
```json
{
  "success": true,
  "message": "Team created successfully",
  "id": 1
}
```

### Success Response (DELETE)
```json
{
  "success": true,
  "message": "Team deleted successfully"
}
```

### Error Response (Any Method)
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## 🔍 Field Name Mapping (Old → New)

| Old Field | New Field | Table | Notes |
|-----------|-----------|-------|-------|
| group | group_name | teams | Foreign key to groups.name |
| t1 | team1_code | matches | Foreign key to teams.code |
| t2 | team2_code | matches | Foreign key to teams.code |
| s1 | score1 | matches | Innings 1 score |
| s2 | score2 | matches | Innings 2 score |
| date | match_date | matches | Datetime format |
| winner | winner_code | matches | Foreign key to teams.code |
| summary | result_summary | matches | Text description |
| potm | player_of_match | matches | Player name |
| scorecard | scorecard_json | matches | JSON object |
| jersey | jersey_number | players | Number only |
| country | nationality | players | Country name |
| m | matches_played | players | Count |
| runs | total_runs | players | Career total |
| wkts | total_wickets | players | Career total |
| overs | overs_per_innings | matches | Number |
| ground | home_ground | teams | Venue name |
| maxW | max_wickets | matches | Number |
| team | team_code | players | Foreign key |

---

## 📊 Database Connection Details

```php
// From config.php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'cricketpro');
define('DB_PORT', 3306);
```

---

## 🧪 Testing API Endpoints

### Using cURL (Command Line)

```bash
# List all teams
curl http://localhost/cricpro/api.php?resource=teams

# Create new team
curl -X POST http://localhost/cricpro/api.php?resource=teams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kolkata Knight Riders",
    "code": "KKR",
    "color": "#3f51b5",
    "group_name": "Group B",
    "captain": "Shreyas Iyer",
    "home_ground": "Eden Gardens"
  }'

# Update team 1
curl -X PUT http://localhost/cricpro/api.php?resource=teams\&id=1 \
  -H "Content-Type: application/json" \
  -d '{"captain": "Hardik Pandya"}'

# Delete team 3
curl -X DELETE http://localhost/cricpro/api.php?resource=teams\&id=3
```

### Using Postman

1. Create new request
2. Select method: GET / POST / PUT / DELETE
3. URL: `http://localhost/cricpro/api.php?resource=teams` (or other resource)
4. Headers: 
   ```
   Content-Type: application/json
   ```
5. Body (for POST/PUT): Select "raw" → "JSON" → enter JSON data
6. Click "Send"

---

## 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 Not Found | API file missing or wrong path | Check `/cricpro/api.php` exists |
| 500 Server Error | Database connection failed | Check MySQL running, database created |
| "Database connection failed" | Wrong credentials or database not created | Verify DB_HOST, DB_USER, DB_PASS in config.php |
| Empty array returned | No data in database | Run init_database.php to seed data |
| Field not found error | Using old field names | Update field names per mapping table |
| Foreign key error | Reference to non-existent record | Ensure team_code exists in teams table |

---

## 📌 Quick Summary

✅ **URL:** `http://localhost/cricpro/api.php?resource=X`
✅ **Methods:** GET, POST, PUT, DELETE
✅ **Format:** application/json
✅ **Database:** cricpro (MySQL)
✅ **Fields:** Use database field names (not old names)
✅ **Response:** Always JSON (success/failure + data)
✅ **No localStorage:** All data persists in database
