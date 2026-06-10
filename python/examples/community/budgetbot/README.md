# BudgetBot

LangChain-style agent loop that pays for tools through AlgoPay with **budget** and **justification** guards.

## What it demonstrates

- `BudgetGuard` blocks spend after the daily cap
- `JustificationGuard` blocks payments without a purpose string
- `simulate()` before `pay()` — agent-safe planning pattern
- Ledger records every attempt (completed and blocked)

## Quick start — Jupyter (best for judging demos)

```bash
cd python
pip install -e ".[dev]" jupyter pandas
jupyter notebook examples/community/budgetbot/demo.ipynb
```

Run all cells top-to-bottom. Mock mode is built in — no TestNet funds required.

## Quick start — script (no TestNet required)

```bash
cd python
pip install -e ".[dev]"
set ALGOPAY_DEMO_MODE=mock
python examples/community/budgetbot/budgetbot.py
```

## With real TestNet USDC

```bash
set ALGOPAY_DEMO_MODE=live
set ALGOPAY_DAILY_LIMIT=1.0
python examples/community/budgetbot/budgetbot.py
```

Fund the printed wallet with TestNet ALGO, opt in to USDC, then acquire test USDC.

## LangChain integration

Wrap `agent_pay_for_tool()` as a `@tool` handler; call `client.pay()` inside the tool after `simulate()` returns `would_succeed=True`.

## Built by

Reference integration by the AlgoPay team — share with design partners and add your name when you fork.

**Design partner quote slot:** *"[Your name]: I finally have a kill switch for agent spend."*
