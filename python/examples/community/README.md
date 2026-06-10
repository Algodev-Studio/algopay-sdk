# Community reference integrations

Examples built for AlgoPay semifinal judging and design-partner sharing. Each demonstrates one SDK capability judges care about.

| Example | Feature | Notebook | Script |
|---------|---------|----------|--------|
| [budgetbot](budgetbot/) | Budget + justification guards | [demo.ipynb](budgetbot/demo.ipynb) | `budgetbot.py` |
| [research-agent-receipts](research-agent-receipts/) | Ledger CSV export | [demo.ipynb](research-agent-receipts/demo.ipynb) | `export_receipts.py` |
| [crew-spend-tracker](crew-spend-tracker/) | Wallet set + rate limits | [demo.ipynb](crew-spend-tracker/demo.ipynb) | `crew_tracker.py` |
| [slack-approval-gate](slack-approval-gate/) | Payment intents + human approval | [demo.ipynb](slack-approval-gate/demo.ipynb) | `approval_gate.py` |
| [mcp-weather-payer](../../typescript/examples/community/mcp-weather-payer/) | TypeScript x402 MCP tool | — | `weather-tool.ts` |

## Jupyter notebooks (recommended for live demos)

```bash
cd python
pip install -e ".[dev,notebooks]"
jupyter notebook examples/community/budgetbot/demo.ipynb
```

Open any `demo.ipynb` under this folder. Notebooks use **mock chain settlement** by default (no TestNet funds). Top-level `await` works in Jupyter — run cells in order.

Optional: `pandas` renders ledger tables; without it, notebooks fall back to plain print.

## Run all Python demos (mock mode)

```bash
cd python
pip install -e ".[dev]"
set ALGOPAY_DEMO_MODE=mock

python examples/community/budgetbot/budgetbot.py
python examples/community/research-agent-receipts/export_receipts.py
python examples/community/crew-spend-tracker/crew_tracker.py
set ALGOPAY_AUTO_APPROVE=1
python examples/community/slack-approval-gate/approval_gate.py
```

Share with design partners using [`judging/semifinal/VALIDATION_KIT.md`](../../../judging/semifinal/VALIDATION_KIT.md).
