"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PLACES as LOCAL_PLACES } from "@/data/places";
import { Place, PlaceCategory } from "@/types/place";
import * as XLSX from "xlsx";

interface PlacesContextProps {
  places: Place[];
  isLoading: boolean;
  error: string | null;
  googleDriveId: string;
  setGoogleDriveId: (id: string) => void;
  refreshPlaces: () => Promise<void>;
  isUsingLocal: boolean;
}

const PlacesContext = createContext<PlacesContextProps | undefined>(undefined);

// Helper to extract file ID from common Google Drive share link formats
export function extractGoogleDriveId(input: string): string {
  if (!input) return "";

  // Trims whitespace
  const trimmed = input.trim();

  // Regex patterns for various Google Drive / Sheets URLs
  const sheetPattern = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const filePattern = /\/file\/d\/([a-zA-Z0-9-_]+)/;
  const directDownloadPattern = /[?&]id=([a-zA-Z0-9-_]+)/;

  let match = trimmed.match(sheetPattern);
  if (match) return match[1];

  match = trimmed.match(filePattern);
  if (match) return match[1];

  match = trimmed.match(directDownloadPattern);
  if (match) return match[1];

  // If it's a plain ID (no slashes), return it
  if (!trimmed.includes("/")) {
    return trimmed;
  }

  return "";
}

interface ExcelRow {
  id?: string | number;
  slug?: string | number;
  name?: string | number;
  category?: string | number;
  description?: string | number;
  latitude?: string | number;
  longitude?: string | number;
  address?: string | number;
  imageUrl?: string | number;
  tags?: string | number;
  openingHours?: string | number;
  recommendedItems?: string | number;
  priceLevel?: string | number;
  city?: string | number;
}

export function PlacesProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage and env using lazy state initializer
  const [googleDriveId, setGoogleDriveIdState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("didau.driveFileId") || "";
      const envId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FILE_ID || "1BlC4-J6Ihi5jkGorxHi2HMvVTKBNiGTu";
      return savedId || envId;
    }
    return "1BlC4-J6Ihi5jkGorxHi2HMvVTKBNiGTu";
  });

  const [places, setPlaces] = useState<Place[]>(LOCAL_PLACES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingLocal, setIsUsingLocal] = useState<boolean>(true);

  const loadDataFromDrive = useCallback(async (fileId: string) => {
    if (!fileId) {
      setPlaces(LOCAL_PLACES);
      setIsUsingLocal(true);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Google Sheets export URL is highly CORS friendly when sheet is shared "Anyone with link can view"
      const sheetsUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;

      let response;
      try {
        response = await fetch(sheetsUrl);
      } catch (fetchErr) {
        console.warn("Spreadsheet export failed (CORS or network), trying direct download URL:", fetchErr);
        // Fallback endpoint for uploaded files
        const directUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
        response = await fetch(directUrl);
      }

      if (!response.ok) {
        throw new Error(`Google Drive returned status ${response.status}. Please check your share settings and ensure 'Anyone with the link can view' is enabled.`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // Parse with SheetJS
      const workbook = XLSX.read(data, { type: "array" });
      if (!workbook.SheetNames.length) {
        throw new Error("The Excel file has no sheets.");
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData.length) {
        throw new Error("No place data found in the Excel spreadsheet.");
      }

      // Map rows back to structured Place objects
      const parsedPlaces: Place[] = (jsonData as ExcelRow[]).map((row) => {
        // Parse tags (comma-separated string in Excel to string[])
        let tags: string[] = [];
        if (row.tags) {
          tags = String(row.tags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }

        // Parse recommendedItems (comma-separated string to string[])
        let recommendedItems: string[] = [];
        if (row.recommendedItems) {
          recommendedItems = String(row.recommendedItems)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }

        // Build type-safe Place structure
        return {
          id: String(row.id || "").trim(),
          slug: String(row.slug || "").trim(),
          name: String(row.name || "").trim(),
          category: String(row.category || "attraction").trim() as PlaceCategory,
          description: row.description ? String(row.description).trim() : undefined,
          latitude: typeof row.latitude === "number" ? row.latitude : parseFloat(String(row.latitude || 0)) || 0,
          longitude: typeof row.longitude === "number" ? row.longitude : parseFloat(String(row.longitude || 0)) || 0,
          address: row.address ? String(row.address).trim() : undefined,
          imageUrl: row.imageUrl ? String(row.imageUrl).trim() : undefined,
          tags,
          openingHours: row.openingHours ? String(row.openingHours).trim() : undefined,
          recommendedItems,
          priceLevel: row.priceLevel ? (parseInt(String(row.priceLevel), 10) as 1 | 2 | 3 | 4) : undefined,
          city: String(row.city || "hanoi").trim(),
        } as Place;
      });

      // Filter to keep only fully functional place items
      const validPlaces = parsedPlaces.filter(
        (p) => p.id && p.category && p.latitude && p.longitude
      );

      if (validPlaces.length === 0) {
        throw new Error("Failed to parse any valid places from Excel. Check that headers (id, category, latitude, longitude) match exact naming.");
      }

      setPlaces(validPlaces);
      setIsUsingLocal(false);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to load spreadsheet from Google Drive:", err);
      const errMsg = err instanceof Error ? err.message : "An unknown error occurred while syncing data.";
      setError(errMsg);
      // Keep using local fallback data
      setPlaces(LOCAL_PLACES);
      setIsUsingLocal(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync whenever ID changes
  useEffect(() => {
    let active = true;
    const fetchCloudData = async () => {
      if (!active) return;
      await loadDataFromDrive(googleDriveId);
    };
    fetchCloudData();
    return () => {
      active = false;
    };
  }, [googleDriveId, loadDataFromDrive]);

  const setGoogleDriveId = (idOrUrl: string) => {
    const extractedId = extractGoogleDriveId(idOrUrl);
    setGoogleDriveIdState(extractedId);

    if (extractedId) {
      localStorage.setItem("didau.driveFileId", extractedId);
    } else {
      localStorage.removeItem("didau.driveFileId");
    }
  };

  const refreshPlaces = async () => {
    await loadDataFromDrive(googleDriveId);
  };

  return (
    <PlacesContext.Provider
      value={{
        places,
        isLoading,
        error,
        googleDriveId,
        setGoogleDriveId,
        refreshPlaces,
        isUsingLocal,
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
}

export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error("usePlaces must be used within a PlacesProvider");
  }
  return context;
}
