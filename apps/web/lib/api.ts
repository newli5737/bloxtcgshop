const defaultBase = "http://localhost:3041/v1";

export type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown> | null;
  error?: { message?: string } | null;
};

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? defaultBase;
  return base.replace(/\/$/, "");
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string | number | boolean | undefined | null> },
): Promise<{ data: T; meta?: Record<string, unknown> | null }> {
  const url = new URL(`${apiBase()}/${path.replace(/^\//, "")}`);
  if (options?.params) {
    for (const [k, v] of Object.entries(options.params)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  const { params, ...init } = options ?? {};
  void params;
  const res = await fetch(url.toString(), {
    ...init,
    credentials: "include",
    next: { revalidate: 60 },
  });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Request failed: ${res.status}`);
  }
  return { data: json.data as T, meta: json.meta ?? null };
}
