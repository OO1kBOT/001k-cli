import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../src/credentials.js", async () =>
  (await import("./mocks/credentials.js")).credentialsMock());

import { deposit } from "../src/commands/deposit.js";
import { withdraw } from "../src/commands/withdraw.js";
import { swap } from "../src/commands/swap.js";
import { transfer } from "../src/commands/transfer.js";
import { limitOrder } from "../src/commands/limit-order.js";
import { aml } from "../src/commands/aml.js";
import { ledger } from "../src/commands/ledger.js";
import { balance } from "../src/commands/balance.js";
import { status } from "../src/commands/status.js";
import { currency } from "../src/commands/currency.js";
import { captureProcess, expectExit, lastJson, type CapturedProcess } from "./exit-helper.js";

let proc: CapturedProcess;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  proc = captureProcess();
  process.env.OO1K_ACCESS_KEY = "ak";
  process.env.OO1K_SECRET_KEY = "sk";
  process.env.OO1K_BASE_URL = "https://api.test";
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  proc.restore();
  vi.unstubAllGlobals();
  delete process.env.OO1K_ACCESS_KEY;
  delete process.env.OO1K_SECRET_KEY;
  delete process.env.OO1K_BASE_URL;
});

function calledUrl(): string {
  return String(fetchMock.mock.calls[0][0]);
}

function calledBody(): unknown {
  const init = fetchMock.mock.calls[0][1] as RequestInit;
  return JSON.parse(String(init.body));
}

async function expectCliError(fn: () => Promise<void>, code: string): Promise<void> {
  await expectExit(fn, 2);
  expect(lastJson(proc.err)).toMatchObject({ cli_error: true, code });
  expect(fetchMock).not.toHaveBeenCalled();
}

describe("GET commands map flags to snake_case query params", () => {
  it.each<[string, () => Promise<void>, string]>([
    ["deposit list", () => deposit("list", { "custom-id": "c1", limit: "5" }), "/api/v1/deposit?custom_id=c1&limit=5"],
    ["deposit methods", () => deposit("methods", { code: "btc" }), "/api/v1/deposit-methods?code=btc"],
    ["deposit get", () => deposit("get", { code: "d1" }), "/api/v1/deposit/d1"],
    ["withdraw list", () => withdraw("list", { "card-number": "42" }), "/api/v1/withdraw?card_number=42"],
    ["withdraw get", () => withdraw("get", { code: "w1" }), "/api/v1/withdraw/w1"],
    ["swap directions", () => swap("directions", {}), "/api/v1/swap-directions"],
    ["swap list", () => swap("list", { "spend-currency": "btc" }), "/api/v1/swap?spend_currency=btc"],
    ["swap get", () => swap("get", { code: "s1" }), "/api/v1/swap/s1"],
    ["swap get-by-code", () => swap("get-by-code", { code: "s1" }), "/api/v1/swap/s1/details-with-code"],
    ["swap get-by-custom-id", () => swap("get-by-custom-id", { "custom-id": "x" }), "/api/v1/swap/x/details-with-custom-id"],
    ["transfer list", () => transfer("list", { "recipient-uid": "u1" }), "/api/v1/internal-transfer?recipient_uid=u1"],
    ["transfer get", () => transfer("get", { code: "t1" }), "/api/v1/internal-transfer/t1"],
    ["limit-order pairs", () => limitOrder("pairs", { symbol: "BTCUSDT" }), "/api/v1/limit-pairs?symbol=BTCUSDT"],
    ["limit-order list", () => limitOrder("list", { status: "open" }), "/api/v1/limit-order?status=open"],
    ["limit-order get", () => limitOrder("get", { code: "lo1" }), "/api/v1/limit-order/lo1"],
    ["aml list", () => aml("list", { status: "done" }), "/api/v1/aml/check?status=done"],
    ["aml get", () => aml("get", { code: "a1" }), "/api/v1/aml/check/a1"],
    ["aml token", () => aml("token", { symbol: "BTC" }), "/api/v1/aml/token?symbol=BTC"],
    ["aml plan", () => aml("plan", { "check-type": "fast" }), "/api/v1/aml/plan?check_type=fast"],
    ["ledger", () => ledger({ currency: "usdt", "start-at": "2026-01-01" }), "/api/v1/ledger?currency=usdt&start_at=2026-01-01"],
    ["balance", () => balance({}), "/api/v1/balance"],
    ["status", () => status(), "/api/v1/status"],
    ["currency", () => currency(), "/api/v1/currency"],
  ])("%s", async (_name, run, expectedPath) => {
    await expectExit(run, 0);
    expect(calledUrl()).toBe(`https://api.test${expectedPath}`);
    expect(lastJson(proc.out)).toEqual({ ok: true });
  });
});

describe("POST commands build the request body", () => {
  it("deposit create-address includes optional flags as snake_case", async () => {
    await expectExit(
      () => deposit("create-address", { currency: "btc", "callback-url": "https://cb", label: "l1" }),
      0,
    );
    expect(calledUrl()).toBe("https://api.test/api/v1/deposit/generate_address");
    expect(calledBody()).toEqual({ currency: "btc", callback_url: "https://cb", label: "l1" });
  });

  it("deposit default-address passes is-new-address boolean", async () => {
    await expectExit(
      () => deposit("default-address", { currency: "btc", "is-new-address": true }),
      0,
    );
    expect(calledBody()).toEqual({ currency: "btc", is_new_address: true });
  });

  it("withdraw create assembles body with beneficiary", async () => {
    await expectExit(
      () => withdraw("create", {
        currency: "uah",
        method: "card",
        amount: "100",
        address: "4111111111111111",
        "beneficiary-first-name": "Ivan",
        "beneficiary-iban": "UA123",
      }),
      0,
    );
    expect(calledBody()).toEqual({
      currency: "uah",
      method: "card",
      amount: "100",
      address: "4111111111111111",
      beneficiary: { first_name: "Ivan", iban: "UA123" },
    });
  });

  it("swap create converts time-to-live to an integer", async () => {
    await expectExit(
      () => swap("create", { direction: "1", "spend-amount": "10", "time-to-live": "300" }),
      0,
    );
    expect(calledBody()).toEqual({ direction: "1", spend_amount: "10", time_to_live: 300 });
  });

  it("transfer create maps currency-code and recipient", async () => {
    await expectExit(
      () => transfer("create", { "currency-code": "usdt", amount: "5", recipient: "uid1" }),
      0,
    );
    expect(calledBody()).toEqual({ currency_code: "usdt", amount: "5", recipient: "uid1" });
  });

  it("limit-order create includes optional pricing flags", async () => {
    await expectExit(
      () => limitOrder("create", { pair: "BTC_USDT", side: "buy", "limit-price": "50000" }),
      0,
    );
    expect(calledBody()).toEqual({ pair: "BTC_USDT", side: "buy", limit_price: "50000" });
  });

  it("aml create defaults direction to withdrawal for address checks", async () => {
    await expectExit(() => aml("create", { token: "7", address: "addr1" }), 0);
    expect(calledBody()).toEqual({ direction: "withdrawal", token: 7, address: "addr1" });
  });

  it("swap cancel accepts either code or custom-id", async () => {
    await expectExit(() => swap("cancel", { "custom-id": "x1" }), 0);
    expect(calledUrl()).toBe("https://api.test/api/v1/swap/cancel");
    expect(calledBody()).toEqual({ custom_id: "x1" });
  });

  it("swap cancel-by-code and cancel-by-custom-id hit dedicated endpoints", async () => {
    await expectExit(() => swap("cancel-by-code", { code: "s1" }), 0);
    expect(calledUrl()).toBe("https://api.test/api/v1/swap/s1/cancel-with-code");

    fetchMock.mockClear();
    await expectExit(() => swap("cancel-by-custom-id", { "custom-id": "x1" }), 0);
    expect(calledUrl()).toBe("https://api.test/api/v1/swap/x1/cancel-with-custom-id");
  });

  it("deposit disposable-address posts the currency", async () => {
    await expectExit(() => deposit("disposable-address", { currency: "btc", method: "trc20" }), 0);
    expect(calledUrl()).toBe("https://api.test/api/v1/deposit/get-disposable-address");
    expect(calledBody()).toEqual({ currency: "btc", method: "trc20" });
  });

  it("limit-order cancel posts code", async () => {
    await expectExit(() => limitOrder("cancel", { code: "lo1" }), 0);
    expect(calledUrl()).toBe("https://api.test/api/v1/limit-order/cancel");
    expect(calledBody()).toEqual({ code: "lo1" });
  });

  it("aml create with transaction requires and passes direction", async () => {
    await expectExit(
      () => aml("create", { token: "7", address: "a1", transaction: "tx1", direction: "deposit" }),
      0,
    );
    expect(calledBody()).toEqual({
      direction: "deposit",
      token: 7,
      address: "a1",
      transaction: "tx1",
    });
  });
});

describe("validation errors exit 2 before any request", () => {
  it.each<[string, () => Promise<void>, string]>([
    ["deposit get without --code", () => deposit("get", {}), "missing_flag"],
    ["deposit create-address without --currency", () => deposit("create-address", {}), "missing_flag"],
    ["withdraw create without required flags", () => withdraw("create", { currency: "uah" }), "missing_flag"],
    ["swap create without --direction", () => swap("create", {}), "missing_flag"],
    ["swap create without amounts", () => swap("create", { direction: "1" }), "missing_flag"],
    ["swap create with non-integer ttl", () => swap("create", { direction: "1", "spend-amount": "1", "time-to-live": "abc" }), "invalid_flag"],
    ["swap cancel without identifiers", () => swap("cancel", {}), "missing_flag"],
    ["transfer create without recipient", () => transfer("create", { "currency-code": "usdt", amount: "1" }), "missing_flag"],
    ["limit-order create without --side", () => limitOrder("create", { pair: "BTC_USDT" }), "missing_flag"],
    ["limit-order cancel without identifiers", () => limitOrder("cancel", {}), "missing_flag"],
    ["aml create with non-integer token", () => aml("create", { token: "x", address: "a" }), "invalid_flag"],
    ["aml create tx check without direction", () => aml("create", { token: "1", address: "a", transaction: "t" }), "missing_flag"],
    ["deposit unknown action", () => deposit("nope", {}), "unknown_action"],
    ["withdraw unknown action", () => withdraw("nope", {}), "unknown_action"],
    ["swap unknown action", () => swap("nope", {}), "unknown_action"],
    ["transfer unknown action", () => transfer("nope", {}), "unknown_action"],
    ["limit-order unknown action", () => limitOrder("nope", {}), "unknown_action"],
    ["aml unknown action", () => aml("nope", {}), "unknown_action"],
  ])("%s", async (_name, run, code) => {
    await expectCliError(run, code);
  });
});
