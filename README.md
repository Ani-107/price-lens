## PriceLens AI

Analyze customer interview transcripts to generate pricing signals, willingness-to-pay reasoning, pricing strategy, risk assessment, and validation experiments.

### What’s in this repo

- **Backend**: FastAPI in `api.py` (calls the CrewAI pipeline in `pricelens_pipeline.py`)
- **Frontend**: Next.js app in `frontend/` (UI posts to the backend and renders markdown)

### Prereqs

- **Python** 3.10+
- **Node.js** 18+
- An **OpenAI API key**

### Configure environment

This workspace blocks editing hidden `.env*` files, so use these examples:

- Copy `env.example` → create your own environment variables (system env vars or your preferred secret manager)
- Copy `frontend/env.local.example` → `frontend/.env.local`

Minimum required:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000` if not set)

### Run backend (FastAPI)

From the repo root:

```bash
python -m pip install -r requirements.txt
python api.py
```

Backend runs on `http://localhost:8000`.

### Run frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

### Notes

- `pricelens_pipeline.py` is **non-interactive**: if `OPENAI_API_KEY` is missing, it throws a clear error (important for server deployments).


