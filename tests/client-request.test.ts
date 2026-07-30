import { describe, it, expect, vi, afterEach } from "vitest";
import { ApiClient, ApiError, NetworkError } from "../src/client.js";

function makeClient(baseUrl = "https://api.example.com"): ApiClient {
  return new ApiClient({ accessKey: "ak", secretKey: "sk", baseUrl });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("assertSecureBaseUrl", () => {
  it("rejects http:// for non-localhost hosts", () => {
    expect(() => makeClient("http://api.example.com")).toThrow(/Insecure base URL/);
  });

  it("allows http://localhost and http://127.0.0.1", () => {
    expect(() => makeClient("http://localhost:8080")).not.toThrow();
    expect(() => makeClient("http://127.0.0.1:8080")).not.toThrow();
  });

  it("rejects malformed URLs", () => {
    expect(() => makeClient("not a url")).toThrow(/Invalid base URL/);
  });
});

describe("request", () => {
  it("returns parsed JSON on 2xx", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const data = await makeClient().get("/api/v1/status", { a: "1" });

    expect(data).toEqual({ ok: true });
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toBe("https://api.example.com/api/v1/status?a=1");
  });

  it("throws ApiError with body on non-2xx", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ type: "client_error" }), { status: 400 }),
    ));

    const error = await makeClient().get("/x").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(400);
    expect((error as ApiError).body).toEqual({ type: "client_error" });
  });

  it("returns null body when response is not JSON", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("plain", { status: 200 })));
    await expect(makeClient().get("/x")).resolves.toBeNull();
  });

  it("wraps fetch failures in NetworkError with the cause code", async () => {
    const failure = new TypeError("fetch failed");
    (failure as { cause?: unknown }).cause = { code: "ECONNREFUSED" };
    vi.stubGlobal("fetch", vi.fn(async () => { throw failure; }));

    const error = await makeClient().get("/x").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(NetworkError);
    expect((error as NetworkError).message).toBe("fetch failed (ECONNREFUSED)");
  });

  it("falls back to a generic message when the fetch error message is empty", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError(""); }));

    const error = await makeClient().get("/x").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(NetworkError);
    expect((error as NetworkError).message).toBe("Network request failed");
  });

  it("rethrows non-Error rejections unwrapped", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw "boom"; }));

    const error = await makeClient().get("/x").catch((e: unknown) => e);

    expect(error).toBe("boom");
    expect(error).not.toBeInstanceOf(NetworkError);
  });

  it("wraps timeout aborts in NetworkError", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    }));

    const error = await makeClient().get("/x").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(NetworkError);
  });

  it("getPublic sends no signature headers, post signs and sends JSON", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({}), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = makeClient();

    await client.getPublic("/api/v1/currency");
    const publicInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect(publicInit.headers).toBeUndefined();

    await client.post("/api/v1/swap/open", { direction: 1 });
    const postInit = fetchMock.mock.calls[1][1] as RequestInit;
    const headers = postInit.headers as Record<string, string>;
    expect(postInit.method).toBe("POST");
    expect(headers["X-Access-Key"]).toBe("ak");
    expect(headers["X-Signature"]).toMatch(/^[0-9a-f]{64}$/);
    expect(headers["Content-Type"]).toBe("application/json");
    expect(postInit.body).toBe(JSON.stringify({ direction: 1 }));
  });
});
