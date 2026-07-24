import { useState, useCallback, useEffect } from 'react';

/**
 * Generic selection-state hook for any list of identifiable items.
 * Works with images, videos, or any `{ id: string }` item.
 */
export function useSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset selection when the underlying items list changes (e.g. after rescan)
  useEffect(() => { setSelectedIds(new Set()); }, [items]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((ids?: string[]) => {
    const targetIds = ids ?? items.map((e) => e.id);
    setSelectedIds((prev) => {
      const allTargetSelected = targetIds.length > 0 && targetIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allTargetSelected) {
        targetIds.forEach((id) => next.delete(id));
      } else {
        targetIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [items]);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  return { selectedIds, toggleSelect, toggleSelectAll, clear };
}