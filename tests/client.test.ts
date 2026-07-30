import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "node:crypto";
import { ApiClient, ApiError } from "../src/client.js";

const ACCESS_KEY = "testkey";
const SECRET_KEY = "testsecret";
const BASE_URL = "https://api.example.com";

function mockFetch(status: number, body: unknown): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

describe("ApiClient", () => {
  let client: ApiClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);
    client = new ApiClient({
      accessKey: ACCESS_KEY,
      secretKey: SECRET_KEY,
      baseUrl: BASE_URL,
    });
  });

  it("GET sends correct HMAC signature without body", async () => {
    mockFetch(200, { ok: true });

    await client.get("/api/v1/balance");

    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const url = call[0] as string;
    const init = call[1] as RequestInit;
    const headers = init.headers as Record<string, string>;

    expect(url).toBe("https://api.example.com/api/v1/balance");

    const expectedMsg = `${ACCESS_KEY}/api/v1/balance1700000000000`;
    const expectedSig = createHmac("sha256", SECRET_KEY)
      .update(expectedMsg)
      .digest("hex");

    expect(headers["X-Access-Key"]).toBe(ACCESS_KEY);
    expect(headers["X-Timestamp"]).toBe("1700000000000");
    expect(headers["X-Signature"]).toBe(expectedSig);
  });

  it("POST includes JSON body in signature", async () => {
    mockFetch(200, { ok: true });

    const body = { amount: "100", currency: "USD" };
    await client.post("/api/v1/withdraw", body);

    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const init = call[1] as RequestInit;
    const headers = init.headers as Record<string, string>;

    const expectedMsg = `${ACCESS_KEY}/api/v1/withdraw1700000000000${JSON.stringify(body)}`;
    const expectedSig = createHmac("sha256", SECRET_KEY)
      .update(expectedMsg)
      .digest("hex");

    expect(headers["X-Signature"]).toBe(expectedSig);
    expect(headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify(body));
  });

  it("getPublic does not send auth headers", async () => {
    mockFetch(200, { pairs: [] });

    await client.getPublic("/api/v1/pairs");

    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const init = call[1] as RequestInit;

    expect(init.headers).toBeUndefined();
  });

  it("throws ApiError on HTTP error response", async () => {
    mockFetch(403, { type: "authentication_error" });

    await expect(client.get("/api/v1/balance")).rejects.toThrow(ApiError);

    mockFetch(403, { type: "authentication_error" });
    await expect(client.get("/api/v1/balance")).rejects.toMatchObject({
      status: 403,
      body: { type: "authentication_error" },
    });
  });

  it("throws generic Error on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
    );

    await expect(client.get("/api/v1/balance")).rejects.toThrow("ECONNREFUSED");
  });

  it("GET passes query params correctly", async () => {
    mockFetch(200, []);

    await client.get("/api/v1/deposit", { status: "success", currency: "BTC" });

    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const url = call[0] as string;

    expect(url).toContain("status=success");
    expect(url).toContain("currency=BTC");
  });
});
