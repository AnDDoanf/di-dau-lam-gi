"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "food-tour.visited-places";

export function useVisitedPlaces() {
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        Promise.resolve().then(() => {
          setVisitedIds(parsed);
          setIsInitialized(true);
        });
      } else {
        Promise.resolve().then(() => {
          setIsInitialized(true);
        });
      }
    } catch (e) {
      console.error("Failed to load visited places from localStorage:", e);
      Promise.resolve().then(() => {
        setIsInitialized(true);
      });
    }
  }, []);

  // Update localStorage when visitedIds changes
  const updateVisitedIds = (newIds: string[]) => {
    setVisitedIds(newIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
    } catch (e) {
      console.error("Failed to save visited places to localStorage:", e);
    }
  };

  const markAsVisited = (id: string) => {
    if (!visitedIds.includes(id)) {
      updateVisitedIds([...visitedIds, id]);
    }
  };

  const markAsUnvisited = (id: string) => {
    updateVisitedIds(visitedIds.filter((item) => item !== id));
  };

  const toggleVisited = (id: string) => {
    if (visitedIds.includes(id)) {
      markAsUnvisited(id);
    } else {
      markAsVisited(id);
    }
  };

  const isVisited = (id: string) => {
    return visitedIds.includes(id);
  };

  const clearVisited = () => {
    updateVisitedIds([]);
  };

  return {
    visitedIds,
    isInitialized,
    markAsVisited,
    markAsUnvisited,
    toggleVisited,
    isVisited,
    clearVisited,
  };
}
