/** TFA API client. Paths are passed in full (`/api/v1/...` or `/v1/...`)
 *  because the backend mounts both prefixes; vite proxies both in dev. */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Raw `detail` from the body. FastAPI sends objects here (e.g. the
     *  solver's {conflicts: [...]}), which would be lost as a string. */
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...init } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  // No fallback token: an unauthenticated call must fail as unauthenticated.
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...init, headers });

  if (!res.ok) {
    let raw: unknown = res.statusText;
    try {
      const body = await res.json();
      raw = body.detail ?? body.message ?? res.statusText;
    } catch {
      // non-JSON error body; keep statusText
    }
    const message = typeof raw === "string" ? raw : JSON.stringify(raw);
    throw new ApiError(res.status, message, raw);
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json();
  return (body?.data !== undefined ? body.data : body) as T;
}
