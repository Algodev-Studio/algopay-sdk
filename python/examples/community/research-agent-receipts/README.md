# Research Agent Receipts

Research agent that pays for data APIs and exports a **CSV expense report** from the AlgoPay ledger.

## What it demonstrates

- Ledger audit trail for every agent payment
- x402 URL routing (when `ALGOPAY_X402_URL` is set)
- CSV export for finance / compliance review

## Quick start — Jupyter

```bash
cd python
pip install -e ".[dev]" jupyter pandas
jupyter notebook examples/community/research-agent-receipts/demo.ipynb
```

## Quick start — script (offline)

```bash
cd python
pip install -e ".[dev]"
set ALGOPAY_DEMO_MODE=mock
python examples/community/research-agent-receipts/export_receipts.py
```

Output: `research_receipts.csv` in the current directory.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `ALGOPAY_DEMO_MODE` | `mock` | `mock` = no chain; `live` = real TestNet |
| `ALGOPAY_X402_URL` | example URL | x402-protected HTTPS endpoint |
| `ALGOPAY_RECEIPTS_CSV` | `research_receipts.csv` | Output path |

## Built by

Reference integration by the AlgoPay team.

**Design partner quote slot:** *"[Your name]: Every API call is now accounted for."*
