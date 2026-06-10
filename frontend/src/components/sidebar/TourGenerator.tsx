"use client";

import { useState } from "react";
import { Sparkles, Calendar, Layers, Share2, Trash2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface TourGeneratorProps {
  onGenerateByCount: (count: 3 | 5 | 7 | 10) => void;
  onGenerateByDays: (days: 1 | 2 | 3) => void;
  onClearTour: () => void;
  hasActiveTour: boolean;
  tourStopsCount: number;
  onShareTour: () => void;
  shareStatus: "idle" | "copied";
}

export default function TourGenerator({
  onGenerateByCount,
  onGenerateByDays,
  onClearTour,
  hasActiveTour,
  tourStopsCount,
  onShareTour,
  shareStatus,
}: TourGeneratorProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"count" | "days">("count");
  const [selectedCount, setSelectedCount] = useState<3 | 5 | 7 | 10>(5);
  const [selectedDays, setSelectedDays] = useState<1 | 2 | 3>(2);

  const handleGenerate = () => {
    if (activeTab === "count") {
      onGenerateByCount(selectedCount);
    } else {
      onGenerateByDays(selectedDays);
    }
  };

  // Display compositions helpers using translations
  const getCompositionDesc = () => {
    if (activeTab === "count") {
      return t(`composition.count${selectedCount}`);
    } else {
      return t(`composition.days${selectedDays}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {t("generator.title")}
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-100 p-1 border border-zinc-200 rounded-lg">
        <button
          onClick={() => setActiveTab("count")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-bold transition-all duration-200 active:scale-95 hover:scale-[1.01] ${
            activeTab === "count"
              ? "bg-white text-zinc-800 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800 hover:bg-white/20"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t("generator.byCount")}</span>
        </button>
        <button
          onClick={() => setActiveTab("days")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-bold transition-all duration-200 active:scale-95 hover:scale-[1.01] ${
            activeTab === "days"
              ? "bg-white text-zinc-800 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800 hover:bg-white/20"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{t("generator.byDays")}</span>
        </button>
      </div>

      {/* Inputs content */}
      <div className="py-2">
        {activeTab === "count" ? (
          <div className="flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold text-zinc-400">{t("generator.stopsCount")}</span>
            <div className="grid grid-cols-4 gap-2">
              {([3, 5, 7, 10] as const).map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setSelectedCount(cnt)}
                  className={`py-2 rounded-lg border text-xs font-bold transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-sm ${
                    selectedCount === cnt
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700"
                      : "bg-white border-zinc-200 text-zinc-605 hover:border-zinc-350 hover:text-zinc-800"
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold text-zinc-400">{t("generator.travelDays")}</span>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map((dy) => (
                <button
                  key={dy}
                  onClick={() => setSelectedDays(dy)}
                  className={`py-2 rounded-lg border text-xs font-bold transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-sm ${
                    selectedDays === dy
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700"
                      : "bg-white border-zinc-200 text-zinc-650 hover:border-zinc-350 hover:text-zinc-800"
                  }`}
                >
                  {t("generator.dayFormat", { days: dy })}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composition Info box */}
        <div className="mt-4 p-3 bg-white rounded-lg border border-zinc-200 text-[11px] text-zinc-655 leading-relaxed shadow-sm hover:shadow-md transition-shadow duration-300">
          <span className="block font-bold text-zinc-800 mb-1">{t("generator.composition")}</span>
          <span className="text-zinc-600 font-medium">{getCompositionDesc()}</span>
        </div>
      </div>

      {/* Button controls */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs shadow-md border border-amber-400 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] hover:shadow-lg hover:shadow-amber-500/10 group"
        >
          <Sparkles className="w-4 h-4 shrink-0 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
          <span>{t("generator.generate")}</span>
        </button>

        {hasActiveTour && (
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-zinc-100">
            <button
              onClick={onShareTour}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-bold transition-all duration-200 hover:scale-[1.03] active:scale-95 hover:shadow-sm group ${
                shareStatus === "copied"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-650"
                  : "bg-white border-zinc-200 text-zinc-705 hover:text-zinc-900 hover:border-zinc-350"
              }`}
            >
              {shareStatus === "copied" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in duration-200" />
                  <span>{t("generator.copied")}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-[-1px] group-hover:scale-105" />
                  <span>{t("generator.share")}</span>
                </>
              )}
            </button>

            <button
              onClick={onClearTour}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-zinc-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 text-zinc-500 transition-all duration-200 hover:scale-[1.03] active:scale-95 hover:shadow-sm group text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-12" />
              <span>{t("generator.discard")} ({tourStopsCount})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
