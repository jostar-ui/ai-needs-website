"use client";

import { useCallback, useEffect, useState } from "react";
import { repository } from "./repository";
import type { Handover, HandoverInput } from "./types";

export function useHandovers(opts?: { query?: string; department?: string }) {
  const [items, setItems] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = opts?.query?.trim() ?? '';
      const dept = opts?.department ?? '';
      let data: Handover[];
      if (q || dept) {
        data = await repository.search(q, dept || undefined);
      } else {
        data = await repository.list();
      }
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [opts?.query, opts?.department]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: HandoverInput, editorName?: string) => {
      const created = await repository.create(input, editorName);
      await refresh();
      return created;
    },
    [refresh],
  );

  const update = useCallback(
    async (id: string, input: HandoverInput, editorName?: string) => {
      const updated = await repository.update(id, input, editorName);
      await refresh();
      return updated;
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string, editorName?: string) => {
      await repository.remove(id, editorName);
      await refresh();
    },
    [refresh],
  );

  return { items, loading, error, refresh, create, update, remove };
}

export function useHandover(id: string) {
  const [item, setItem] = useState<Handover | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await repository.get(id);
    setItem(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { item, loading, refresh };
}
