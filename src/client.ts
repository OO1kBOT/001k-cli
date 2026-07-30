import { createHmac } from "node:crypto";

interface ApiClientConfig {
  accessKey: string;
  secretKey: string;
  baseUrl: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** Request failed before an HTTP response was received (DNS, refused, timeout). */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

function assertSecureBaseUrl(baseUrl: string): string {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error(`Invalid base URL: "${baseUrl}"`);
  }
  const isLocalhost =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "::1";
  if (url.protocol !== "https:" && !isLocalhost) {
    throw new Error(
      `Insecure base URL "${baseUrl}": API credentials may only be sent over https:// (localhost is exempt for local testing).`,
    );
  }
  return baseUrl;
}

export class ApiClient {
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor({ accessKey, secretKey, baseUrl }: ApiClientConfig) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.baseUrl = assertSecureBaseUrl(baseUrl);
  }

  async get(
    path: string,
    params?: Record<string, string>,
  ): Promise<unknown> {
    const url = this.buildUrl(path, params);
    const headers = this.signHeaders(path);
    return this.request(url, { method: "GET", headers });
  }

  async post(
    path: string,
    body?: Record<string, unknown>,
  ): Promise<unknown> {
    const url = this.buildUrl(path);
    const headers = this.signHeaders(path, body);
    return this.request(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async getPublic(
    path: string,
    params?: Record<string, string>,
  ): Promise<unknown> {
    const url = this.buildUrl(path, params);
    return this.request(url, { method: "GET" });
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  private async request(
    url: string,
    init: RequestInit,
  ): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      if (error instanceof Error) {
        const cause = (error as { cause?: { code?: string } }).cause;
        const detail = cause?.code ? ` (${cause.code})` : "";
        throw new NetworkError(
          (error.message || "Network request failed") + detail,
        );
      }
      throw error;
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new ApiError(response.status, data);
    }

    return data;
  }

  private signHeaders(
    path: string,
    body?: Record<string, unknown>,
  ): Record<string, string> {
    const timestamp = Date.now();

    let message = `${this.accessKey}${path}${timestamp}`;
    if (body) {
      message += JSON.stringify(body);
    }

    const signature = createHmac("sha256", this.secretKey)
      .update(message)
      .digest("hex");

    return {
      "X-Access-Key": this.accessKey,
      "X-Timestamp": `${timestamp}`,
      "X-Signature": signature,
    };
  }
}
