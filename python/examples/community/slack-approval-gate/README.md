# Slack Approval Gate

Human-in-the-loop agent spend using **payment intents** — authorize first, confirm after approval.

The terminal prompt stands in for a Slack interactive message; wire to your bot in production.

## Quick start — Jupyter (recommended)

```bash
cd python
pip install -e ".[dev]" jupyter pandas
jupyter notebook examples/community/slack-approval-gate/demo.ipynb
```

Flip `HUMAN_APPROVED` in the approval cell to demo reject vs confirm.

## Quick start — script

```bash
cd python
pip install -e ".[dev]"
set ALGOPAY_DEMO_MODE=mock
set ALGOPAY_AUTO_APPROVE=1
python examples/community/slack-approval-gate/approval_gate.py
```

Remove `ALGOPAY_AUTO_APPROVE` to type `y` at the prompt interactively.

## What it demonstrates

- `create_payment_intent` → human review → `confirm_payment_intent`
- Pattern for Slack / Teams approval workflows before production agent spend

## Built by

Reference integration by the AlgoPay team.

**Design partner quote slot:** *"[Your name]: This is what our team needs before production."*
