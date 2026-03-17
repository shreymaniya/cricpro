# CricketPro — Database Setup Guide

## 🚀 Quick Start

### Step 1: Create the Database
```sql
CREATE DATABASE cricketpro;
```

### Step 2: Initialize Sample Data
Open in your browser:
```
http://localhost/cricpro/init_database.php
```

Expected response: `{"success": true, "message": "Database initialized successfully!"}`

### Step 3: Access the App
```
http://localhost/cricpro/index.html
```

---

## ✅ Verify Everything is Working

Visit this URL to check database status:
```
http://localhost/cricpro/status.php
```

You should see:
```json
{
  "database_name": "cricketpro",
  "connected": true,
  "tables": ["groups", "teams", "players", "matches", "match_scorecard"],
  "data_count": {
    "groups": 2,
    "teams": 6,
    "players": 16,
    "matches": 5
  }
}
```

---

## 📝 How It Works Now

### ✅ ALL Data Comes from Database
- **NO localStorage** for main data (groups, teams, players, matches)
- **100% Database-Driven** - Every add, edit, delete goes to the database
- **Persistent** - Data survives browser restart, cache clear, etc.

### 🔄 Database Operations

| Operation | Method | API Endpoint | Storage |
|-----------|--------|-----|---------|
| List | GET | `/api.php?resource=groups` | Database |
| Add | POST | `/api.php?resource=groups` | Database |
| Edit | PUT | `/api.php?resource=groups&id=1` | Database |
| Delete | DELETE | `/api.php?resource=groups&id=1` | Database |

---

## 🗄️ Database Schema

```
Database: cricketpro

Tables:
├── groups (id, name, stage)
├── teams (id, name, code, color, group_name, captain, home_ground, played, won, lost, nr, nrr)
├── players (id, name, team_code, role, jersey_number, nationality, matches_played, total_runs, total_wickets)
├── matches (id, team1_code, team2_code, match_date, venue, match_type, overs_per_innings, max_wickets, score1, score2, winner_code, result_summary, status, scorecard_json)
└── match_scorecard (id, match_id, innings1_runs, innings1_balls, innings2_runs, innings2_balls)
```

---

## 🛠️ File Structure

```
cricpro/
├── index.html          (Frontend UI)
├── app.js              (React-like logic, 100% API-driven)
├── styles.css          (Styling)
├── api.php             (Backend API - handles all CRUD)
├── config.php          (Database configuration & init)
├── init_database.php   (Seed sample data)
└── status.php          (Health check)
```

---

## ⚠️ Important Notes

1. **Clear Browser Cache/Storage** - If you see old data, clear browser storage:
   - Settings → Clear browsing data → Cookies and site data

2. **No More Default Data** - App loads from database only
   - First time: Database will be empty until you add data
   - Use `init_database.php` to seed sample data

3. **All CRUD is API-Based**:
   - Add team → `POST /api.php?resource=teams`
   - Delete group → `DELETE /api.php?resource=groups&id=1`
   - Update player → `PUT /api.php?resource=players&id=5`

---

## 🐛 Troubleshooting

### "Database connection failed"
- Check MySQL is running in XAMPP
- Verify database `cricpro` exists
- Run: `CREATE DATABASE cricpro;`

### "No data showing"
- Run `init_database.php` to seed sample data
- Or manually add data through the UI

### "Data disappears on refresh"
- This should **NOT** happen anymore
- All data is in the database, not localStorage
- Clear browser cache and refresh

---

## 📱 API Examples

### Get all teams
```bash
curl http://localhost/cricpro/api.php?resource=teams
```

### Add a player
```bash
curl -X POST http://localhost/cricpro/api.php?resource=players \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Virat Kohli",
    "team_code": "RCB",
    "role": "batsman",
    "jersey_number": 18,
    "nationality": "India"
  }'
```

### Delete a match
```bash
curl -X DELETE http://localhost/cricpro/api.php?resource=matches&id=1
```

---

**✅ You're all set! Everything is now 100% database-driven.**
