# Crew Spend Tracker

Three CrewAI-style agents sharing one **wallet set** with set-level **rate limit** and **budget** guards.

## Quick start — Jupyter

```bash
cd python
pip install -e ".[dev]" jupyter pandas
jupyter notebook examples/community/crew-spend-tracker/demo.ipynb
```

## Quick start — script

```bash
cd python
pip install -e ".[dev]"
set ALGOPAY_DEMO_MODE=mock
python examples/community/crew-spend-tracker/crew_tracker.py
```

## What it demonstrates

- `add_rate_limit_guard_for_set` — shared RPM across agents
- `add_budget_guard_for_set` — shared daily cap
- Ledger filtered by `wallet_set_id`

## Built by

Reference integration by the AlgoPay team.

**Design partner quote slot:** *"[Your name]: Ledger export saved us during debugging."*
