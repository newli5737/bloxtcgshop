/**
 * Generic CRUD hook for admin pages.
 * Encapsulates loading, creating, updating, deleting state and side effects.
 * Pages only consume the returned state + actions — zero API knowledge.
 */
"use client";
import { useState, useEffect, useCallback } from "react";

interface CrudActions<T, C, U> {
  list: () => Promise<T[]>;
  create: (data: C) => Promise<T>;
  update: (id: string, data: U) => Promise<T>;
  remove: (id: string) => Promise<{ id: string }>;
}

interface CrudState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  saving: boolean;
}

interface CrudReturn<T, C, U> extends CrudState<T> {
  reload: () => void;
  create: (data: C) => Promise<T | null>;
  update: (id: string, data: U) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
}

export function useAdminCrud<T, C, U>(
  actions: CrudActions<T, C, U>,
): CrudReturn<T, C, U> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    actions.list()
      .then(setItems)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [actions]);

  useEffect(reload, [reload]);

  const create = useCallback(async (data: C): Promise<T | null> => {
    setSaving(true);
    try {
      const created = await actions.create(data);
      reload();
      return created;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [actions, reload]);

  const update = useCallback(async (id: string, data: U): Promise<T | null> => {
    setSaving(true);
    try {
      const updated = await actions.update(id, data);
      reload();
      return updated;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [actions, reload]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await actions.remove(id);
      reload();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  }, [actions, reload]);

  return { items, loading, error, saving, reload, create, update, remove };
}
