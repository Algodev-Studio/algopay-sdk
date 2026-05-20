"""Populate the deployed AlgoPay console with demo workspace data."""

from __future__ import annotations

import json
import sys
from urllib.error import HTTPError
from urllib.request import Request, build_opener, HTTPCookieProcessor
from http.cookiejar import CookieJar

import os

BASE = os.environ.get("ALGOPAY_CONSOLE_URL", "https://algopay-sdk-pay-b17a.vercel.app")
EMAIL = os.environ["ALGOPAY_CONSOLE_EMAIL"]
PASSWORD = os.environ["ALGOPAY_CONSOLE_PASSWORD"]


class Client:
    def __init__(self, base: str) -> None:
        self.base = base.rstrip("/")
        self.jar = CookieJar()
        self.opener = build_opener(HTTPCookieProcessor(self.jar))

    def request(self, method: str, path: str, body: dict | None = None) -> tuple[int, object]:
        url = f"{self.base}{path}"
        data = json.dumps(body).encode() if body is not None else None
        headers = {"Content-Type": "application/json"} if body is not None else {}
        req = Request(url, data=data, headers=headers, method=method)
        try:
            with self.opener.open(req, timeout=30) as resp:
                raw = resp.read().decode()
                return resp.status, json.loads(raw) if raw else {}
        except HTTPError as e:
            raw = e.read().decode()
            try:
                payload = json.loads(raw) if raw else {"error": str(e)}
            except json.JSONDecodeError:
                payload = {"error": raw or str(e)}
            return e.code, payload


def main() -> int:
    if not EMAIL or not PASSWORD:
        print("Set ALGOPAY_CONSOLE_EMAIL and ALGOPAY_CONSOLE_PASSWORD", file=sys.stderr)
        return 1
    c = Client(BASE)

    status, resp = c.request("POST", "/api/auth/login", {"email": EMAIL, "password": PASSWORD})
    print(f"Login: {status} {resp}")
    if status != 200:
        return 1

    _, me = c.request("GET", "/api/me")
    print(f"User: {json.dumps(me, indent=2)}")

    _, ws = c.request("GET", "/api/workspace")
    print(f"Workspace before: {json.dumps(ws, indent=2)}")

    # Spending policies
    status, resp = c.request(
        "PATCH",
        "/api/workspace",
        {
            "network": "testnet",
            "maxDailyUsdc": "50.00",
            "maxSingleTxUsdc": "5.00",
            "approvalThresholdUsdc": "2.00",
            "requireJustification": True,
        },
    )
    print(f"Policies: {status} {resp}")

    # API key
    _, keys = c.request("GET", "/api/api-keys")
    existing_keys = keys.get("keys", []) if isinstance(keys, dict) else []
    api_key = None
    if not existing_keys:
        status, resp = c.request("POST", "/api/api-keys", {"name": "Demo Agent Key"})
        print(f"API key: {status} {resp}")
        api_key = resp.get("apiKey") if isinstance(resp, dict) else None
    else:
        print(f"API keys already exist: {len(existing_keys)}")

    # Wallet set + wallet
    _, sets_resp = c.request("GET", "/api/wallet-sets")
    wallet_sets = sets_resp.get("walletSets", []) if isinstance(sets_resp, dict) else []
    wallet_set_id = None
    for s in wallet_sets:
        if s.get("name") == "demo-agents":
            wallet_set_id = s["id"]
            break
    if not wallet_set_id:
        status, resp = c.request("POST", "/api/wallet-sets", {"name": "demo-agents"})
        print(f"Wallet set: {status} {resp}")
        wallet_set_id = resp.get("id") if isinstance(resp, dict) else None

    wallet_address = None
    if wallet_set_id:
        _, wallets_resp = c.request("GET", "/api/wallets")
        wallets = wallets_resp.get("wallets", []) if isinstance(wallets_resp, dict) else []
        demo_wallets = [w for w in wallets if w.get("walletSetName") == "demo-agents"]
        if demo_wallets:
            wallet_address = demo_wallets[0]["address"]
            print(f"Wallet exists: {wallet_address}")
        else:
            status, resp = c.request("POST", "/api/wallets", {"walletSetId": wallet_set_id})
            print(f"Wallet: {status} {resp}")
            wallet_address = resp.get("address") if isinstance(resp, dict) else None

    # Custom x402 endpoint
    _, ep_resp = c.request("GET", "/api/custom-endpoints")
    endpoints = ep_resp.get("endpoints", []) if isinstance(ep_resp, dict) else []
    if not any(e.get("slug") == "demo-weather" for e in endpoints):
        status, resp = c.request(
            "POST",
            "/api/custom-endpoints",
            {
                "slug": "demo-weather",
                "name": "Demo Weather API",
                "description": "x402 pay-per-call weather endpoint for agent demos",
                "endpointUrl": "https://x402.goplausible.xyz/examples/weather",
                "httpMethod": "GET",
            },
        )
        print(f"Custom endpoint: {status} {resp}")
    else:
        print("Custom endpoint demo-weather already exists")

    # Enable Tavily wrapped provider
    _, providers_resp = c.request("GET", "/api/wrapped-apis")
    providers = providers_resp.get("providers", []) if isinstance(providers_resp, dict) else []
    tavily = next((p for p in providers if p.get("slug") == "tavily"), None)
    if tavily and not tavily.get("enabled"):
        status, resp = c.request("POST", "/api/wrapped-apis", {"slug": "tavily"})
        print(f"Enable Tavily: {status} {resp}")

    # Gas pool
    _, pools = c.request("GET", "/api/gas-pools")
    pool_list = pools if isinstance(pools, list) else []
    pool_id = None
    if not pool_list:
        key_id = existing_keys[0]["id"] if existing_keys else None
        if not key_id and isinstance(keys, dict) and keys.get("keys"):
            key_id = keys["keys"][0]["id"]
        status, resp = c.request(
            "POST",
            "/api/gas-pools",
            {
                "apiKeyId": key_id,
                "balanceUsdc": "10.00",
                "dailyCapCents": 5000,
                "alertThresholdUsdc": "2.00",
            },
        )
        print(f"Gas pool: {status} {resp}")
        pool_id = resp.get("id") if isinstance(resp, dict) else None
    else:
        pool_id = pool_list[0]["id"]
        print(f"Gas pool exists: {pool_id}")

    # Agent
    _, agents = c.request("GET", "/api/agents")
    agent_list = agents if isinstance(agents, list) else []
    if not agent_list and wallet_address:
        status, resp = c.request(
            "POST",
            "/api/agents",
            {
                "name": "Research Agent",
                "algoAddress": wallet_address,
                "dailyLimitCents": 5000,
                "poolId": pool_id,
            },
        )
        print(f"Agent: {status} {resp}")
    else:
        print(f"Agents: {len(agent_list)}")

    # Merchant (for checkout demos)
    _, merchants = c.request("GET", "/api/merchants")
    merchant_list = merchants if isinstance(merchants, list) else []
    if not merchant_list and wallet_address:
        status, resp = c.request(
            "POST",
            "/api/merchants",
            {"name": "Demo Merchant", "algoAddress": wallet_address},
        )
        print(f"Merchant: {status} {resp}")

    # Summary
    print("\n--- Final state ---")
    for path in [
        "/api/workspace",
        "/api/api-keys",
        "/api/wallet-sets",
        "/api/wallets",
        "/api/custom-endpoints",
        "/api/wrapped-apis",
        "/api/gas-pools",
        "/api/agents",
        "/api/merchants",
        "/api/payments",
        "/api/audit",
    ]:
        _, data = c.request("GET", path)
        print(f"{path}: {json.dumps(data, indent=2)[:500]}")

    if api_key:
        print(f"\n*** Save this API key (shown once): {api_key} ***")

    return 0


if __name__ == "__main__":
    sys.exit(main())
