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
    next: { revalidate: 10 },
  });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Request failed: ${res.status}`);
  }
  return { data: json.data as T, meta: json.meta ?? null };
}

/** Client-side mutation (POST / PATCH / DELETE). No caching. */
export async function apiMutate<T = void>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: object,
): Promise<T> {
  const url = `${apiBase()}/${path.replace(/^\//, "")}`;
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Request failed: ${res.status}`);
  }
  return json.data;
}

/** Client-side file upload via FormData. */
export async function apiUpload<T = { url: string }>(
  path: string,
  file: File,
  fieldName = "file",
): Promise<T> {
  const url = `${apiBase()}/${path.replace(/^\//, "")}`;
  const fd = new FormData();
  fd.append(fieldName, file);
  const res = await fetch(url, { method: "POST", credentials: "include", body: fd });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Upload failed: ${res.status}`);
  }
  return json.data;
}

/** Client-side GET (no Next.js cache). */
export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): Promise<T> {
  const url = new URL(`${apiBase()}/${path.replace(/^\//, "")}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), { credentials: "include" });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Request failed: ${res.status}`);
  }
  return json.data;
}
