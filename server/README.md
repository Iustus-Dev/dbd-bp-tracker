# DBD BP Tracker API

Backend server for managing Bloodpoint matches.

## Endpoints

### GET /api/matches
Returns a list of all recorded matches.

**Response:**
- `200 OK`
- Body: `Array<Match>`

### POST /api/matches
Records a new match round.

**Request Body:**
```json
{
  "character": "string",
  "bloodpoints": "number"
}
```

**Response:**
- `201 Created`
- Body: `Match` (including generated `id` and `timestamp`)

## Data Model (Match)
- `id`: Unique string (UUID)
- `character`: String
- `bloodpoints`: Number
- `timestamp`: ISO Date string
