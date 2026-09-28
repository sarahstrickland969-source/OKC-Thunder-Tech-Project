# Basketball Lineup Explorer

A basketball analytics application by **Sarah Strickland**, built for the OKC Thunder technical project. The deployed dashboard turns the supplied possession dataset into searchable lineup comparisons for coaches and decision makers. The assessment data includes fictional teams and players; its ratings are not NBA or WNBA results.

**[Open the deployed app](https://sarah-lineup-web.onrender.com/)** · **[Watch the screen recording](demo/lineup-explorer-demo.mp4)** · **[Read the analysis](written_responses/responses.md)** · **[Submission details](SUBMISSION.md)**

## What the application does

- Aggregates each possession for the players on offense and defense, including combinations of one through five players.
- Shows offensive and defensive points, possession counts, ratings per 100 possessions, net rating, shooting percentages, and offensive and defensive rebounding rates from recorded opportunities.
- Lets visitors change lineup size, filter by team, search for a player or team, and rank by net rating, possessions, or rebounding. Summary cards highlight matching lineups, the top net rating, and a rebounding leader.
- Handles loading, API errors, empty results, and lineups without possessions on both sides of the ball. A missing net rating appears as a dash.
- Includes written answers to the three assessment questions about the strongest lineup, strongest player, and a lineup suited to counter a larger rebounding team.

A separate NBA/WNBA play simulation component is present in the source. It models passes, dunks, three-point attempts, fouls, scores, and player reactions, but it is **not currently reachable in the deployed app**: the Angular route for `/basketball-play` and the backend `/api/v1/play/teams` endpoint it calls are absent. The league cards on the dashboard therefore do not open a working demo. See [Remaining work](#remaining-work).

## Stack and architecture

| Layer | Implementation |
| --- | --- |
| Frontend | Angular 21, TypeScript, HTML, SCSS; `frontend/src/app/lineups-summary/` renders the dashboard and `frontend/src/app/_services/` calls the API. |
| API | Python 3.12, Django 5.2, Django REST Framework; `backend/app/views/lineups.py` serves `GET /api/v1/lineups?lineup_size=5`. |
| Analysis | `backend/app/helpers/lineups.py` groups offensive and defensive possession stats by team and player combination and computes ratings and rebound rates. |
| Data | PostgreSQL; Django migrations and `backend/scripts/ingest_raw_data.py` load the supplied JSON data. |
| Deployment | `render.yaml` defines a Render PostgreSQL database, Django web service, and Angular static site. The backend startup script migrates and imports data if the team table is empty. The frontend build injects the Render API host. |

The browser requests lineup data from the Django API, which queries PostgreSQL and returns aggregated rows. Team and player search, sorting, and display highlights run in the Angular client. The API accepts `lineup_size` from 1 to 5 (default 5); the frontend offers those five sizes. The API response is an array of lineup records.

## Run locally

Prerequisites: Python 3.12, Node.js 22 with npm 10 or later, and PostgreSQL. From a clone of this repository:

1. Create the local database and user (choose a password consistent with `backend/app/settings.py`; the checked-in local defaults use `thunder`):

   ```bash
   createuser okcapplicant --createdb
   createdb okc
   psql okc
   ```

   In `psql`:

   ```sql
   CREATE SCHEMA app;
   ALTER USER okcapplicant WITH PASSWORD 'thunder';
   GRANT ALL ON SCHEMA app TO okcapplicant;
   ```

2. Install backend dependencies, migrate, and load the supplied dataset:

   ```bash
   python3.12 -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   cd backend
   python manage.py migrate
   PYTHONPATH=. python scripts/ingest_raw_data.py
   python manage.py runserver
   ```

3. In another terminal, start the frontend:

   ```bash
   cd frontend
   npm ci
   npm start
   ```

Open [http://localhost:4200/lineups-summary](http://localhost:4200/lineups-summary). The API runs at [http://localhost:8000/api/v1/lineups?lineup_size=5](http://localhost:8000/api/v1/lineups?lineup_size=5), and the frontend's raw-response view is at [http://localhost:4200/lineups-summary-api](http://localhost:4200/lineups-summary-api). Keep PostgreSQL and both servers running. For subsequent local starts, the data import only needs repeating if you reset the database.

## Deployment and submission

The project is configured for Render through [`render.yaml`](render.yaml), with separate database, API, and static frontend services. The current public frontend URL is recorded in [`SUBMISSION.md`](SUBMISSION.md). The original assignment included Railway deployment steps; this submission uses Render. If redeploying on Render, connect the repository as a Blueprint and verify the generated service hostnames, database connection, and frontend API requests. The API has no separate public link recorded in `SUBMISSION.md`.

The original assessment requires a working backend and frontend, written responses to all three analysis questions, an attempted deployment, and a screen recording. Keep the deployed frontend URL, applicant name, and email in `SUBMISSION.md`; keep the [recording](demo/lineup-explorer-demo.mp4) and [written responses](written_responses/responses.md) in the repository. If the deployment cannot be opened, the recording must show all available frontend views and functionality. The assessment also requires an ordered list of AI prompts and model names in one text file under `prompts/`, without AI outputs; see [`prompts/ai_prompts.txt`](prompts/ai_prompts.txt). Project work must be original.

## Remaining work

- Wire the play simulation into Angular routing and implement or remove its missing `/api/v1/play/teams` API integration before presenting the NBA/WNBA league cards as a functioning feature.
- Verify the deployed URL and recording from a fresh browser session before submitting; this README update is based on repository files and commits, not a live deployment check.
- Review the AI prompt log for completeness and exact model names where available, as the assessment explicitly requires them.

For assessment questions, the original instructions list **datasolutions@okcthunder.com**.
