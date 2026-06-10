# Design partner validation kit

Use this to collect **real** feedback before semifinal judging. Do not fabricate quotes — judges value credibility.

---

## Outreach message (copy-paste)

**Subject / DM:** Quick favor — 15 min on AlgoPay alpha?

> We shipped an alpha SDK for governed agent payments on Algorand (budget guards, ledger, x402).
>
> Can you try:
> ```bash
> pip install "algopay-sdk>=0.1.0a3,<0.2"
> ```
> Then run `examples/basic_payment.py` on TestNet (or skim `examples/community/budgetbot/`).
>
> Afterward, reply with 2–3 sentences:
> 1. What worked?
> 2. What confused you?
> 3. Would you use this for an agent you're building?
>
> Optional: fork one community example and add a README line — we'll cite you as a design partner in our semifinal pitch.

---

## Who to contact (aim for 8–10)

- [ ] Former classmates / CS grad friend network (5)
- [ ] Algorand Discord builders (2)
- [ ] AI/agent Discord (MCP, LangChain) (2)
- [ ] Startup colleague / founding engineer advisor (1)

---

## Feedback log (fill in real responses)

| # | Name | Role | Date | Quote (verbatim) | Built prototype? |
|---|------|------|------|------------------|------------------|
| 1 | | | | | Y / N |
| 2 | | | | | Y / N |
| 3 | | | | | Y / N |
| 4 | | | | | Y / N |
| 5 | | | | | Y / N |

### Slide 5 quote slots

Replace placeholders in [`SLIDE_CONTENT.md`](SLIDE_CONTENT.md) with rows from this table.

**Example format (only if real):**

> "Priya, indie agent builder: 'I finally have a kill switch for agent spend.'"

---

## What counts as validation for judges

| Strong | Weak |
|--------|------|
| Verbatim quote + date + role | Anonymous praise with no context |
| Screenshot of them running the SDK | Stock testimonial text |
| Fork or PR on a community example | "Thousands of users" with no evidence |
| "We interviewed 8; 5 tried it; 3 built prototypes" | "Everyone loved it" |

---

## If a friend did not build an app

Say honestly at judging:

> "We built this reference integration after interviewing them about their use case."

That is valid customer discovery — not the same as claiming they shipped it.

---

## Community examples to share

Point design partners to:

- [`python/examples/community/budgetbot/`](../../python/examples/community/budgetbot/)
- [`typescript/examples/community/mcp-weather-payer/`](../../typescript/examples/community/mcp-weather-payer/)
- [`python/examples/community/research-agent-receipts/`](../../python/examples/community/research-agent-receipts/)
