# Run and submit this project

## What was implemented
- Django `/api/v1/lineups` now aggregates real possession data for 1–5 player combinations on offense and defense.
- Angular dashboard adds lineup size, team, player search, sorting, ratings, and rebound measures.
- `written_responses/responses.md` answers the three analysis questions using the provided data.
- `prompts/ai_prompts.txt` records this conversation's AI assistance as required by the assignment.

## Run locally
Use the repository README to install PostgreSQL and create the `okc` database and `app` schema. Then run the migration and ingestion commands in the assignment. In separate terminals, start `python manage.py runserver` inside `backend` and `npm install && npm start` inside `frontend`. Open `http://localhost:4200/lineups-summary`. This environment verified the Angular production build and the aggregation against the provided raw JSON; a running PostgreSQL instance was unavailable here, so the live endpoint was not checked.

## Finish submission
Use the repository's Railway directions to deploy the backend, database and frontend. Put the generated backend domain in `frontend/src/environments/environment.prod.ts` before building the frontend, and add the frontend URL plus your verified email to `SUBMISSION.md`. Record the dashboard, filters, sorting, and API response in a screen capture and add it to your repository. Review the code and written answers in your own words before submitting: the assignment requires original work and disclosure of AI prompts.
