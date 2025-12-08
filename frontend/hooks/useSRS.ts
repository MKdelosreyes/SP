"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { initSrsCard, isDue, applySm2, type SrsCardState, type SrsGrade } from "@/utils/srs";

const STORAGE_KEY = "vocab-srs-v1";

type SrsMap = Record<number, SrsCardState>;

function load(): SrsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(map: SrsMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function useSRS(allIds: number[]) {
  const [store, setStore] = useState<SrsMap>({});
  const prevIdsRef = useRef<string>("");

  useEffect(() => {
    // Create stable string representation of IDs
    const idsKey = allIds.sort((a, b) => a - b).join(",");
    
    // Only run if IDs actually changed
    if (idsKey === prevIdsRef.current) return;
    prevIdsRef.current = idsKey;

    const m = load();
    let changed = false;
    for (const id of allIds) {
      if (!m[id]) {
        m[id] = initSrsCard(id);
        changed = true;
      }
    }
    if (changed) save(m);
    setStore(m);
  }, [allIds]);

  const dueIds = useMemo(() => {
    const now = new Date();
    return allIds.filter((id) => store[id] && isDue(store[id], now));
  }, [allIds, store]);

  const grade = (id: number, g: SrsGrade) => {
    setStore((prev) => {
      const next = { ...prev, [id]: applySm2(prev[id] ?? initSrsCard(id), g) };
      save(next);
      return next;
    });
  };

  return { dueIds, grade, get: (id: number) => store[id] };
}