import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Filter, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Trade } from "../backend.d";
import { useDeleteTrade } from "../hooks/useQueries";

const SKELETON_ROWS = ["sk1", "sk2", "sk3", "sk4", "sk5"];
const SKELETON_COLS = [
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7",
  "c8",
  "c9",
  "c10",
];

function fmt(value: number): string {
  const abs = Math.abs(value);
  return `${value >= 0 ? "+" : "-"}₹${abs.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const d = new Date(ms);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Props {
  trades: Trade[] | undefined;
  isLoading: boolean;
}

export function TradeHistory({ trades, isLoading }: Props) {
  const deleteTrade = useDeleteTrade();
  const [assetFilter, setAssetFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<"date" | "pnl">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function toggleSort(key: "date" | "pnl") {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filtered = (trades ?? [])
    .filter((t) => {
      if (
        assetFilter &&
        !t.asset.toLowerCase().includes(assetFilter.toLowerCase())
      )
        return false;
      if (resultFilter === "win" && t.pnl <= 0) return false;
      if (resultFilter === "loss" && t.pnl > 0) return false;
      if (dateFrom) {
        const ts = Number(t.date) / 1_000_000;
        if (ts < new Date(dateFrom).getTime()) return false;
      }
      if (dateTo) {
        const ts = Number(t.date) / 1_000_000;
        if (ts > new Date(dateTo).getTime() + 86400000) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === "date") diff = Number(a.date) - Number(b.date);
      else diff = a.pnl - b.pnl;
      return sortDir === "asc" ? diff : -diff;
    });

  async function handleDelete(id: bigint) {
    try {
      await deleteTrade.mutateAsync(id);
      toast.success("Trade deleted");
    } catch {
      toast.error("Failed to delete trade");
    }
  }

  function SortIcon({ col }: { col: "date" | "pnl" }) {
    if (sortKey !== col) return <ChevronUp size={12} className="opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-[#33E07A]" />
    ) : (
      <ChevronDown size={12} className="text-[#33E07A]" />
    );
  }

  const headers = [
    "Asset",
    "Type",
    "Date",
    "Entry",
    "Exit",
    "Lots",
    "Lot Size",
    "P&L",
    "Status",
    "",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass shadow-glass"
    >
      <div className="p-5 border-b border-white/10">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Search size={14} className="text-[#A7B0BF] shrink-0" />
            <Input
              data-ocid="history.search_input"
              value={assetFilter}
              onChange={(e) => setAssetFilter(e.target.value)}
              placeholder="Filter by asset..."
              className="h-8 bg-white/5 border-white/10 text-white placeholder:text-[#A7B0BF]/50 text-sm"
            />
          </div>
          <Select value={resultFilter} onValueChange={setResultFilter}>
            <SelectTrigger
              data-ocid="history.select"
              className="h-8 w-[120px] bg-white/5 border-white/10 text-white text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#0c121c]">
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="win">Wins Only</SelectItem>
              <SelectItem value="loss">Losses Only</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-[#A7B0BF]" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 w-[138px] bg-white/5 border-white/10 text-white text-xs [color-scheme:dark]"
            />
            <span className="text-[#A7B0BF] text-xs">–</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 w-[138px] bg-white/5 border-white/10 text-white text-xs [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {headers.map((h, i) => {
                const isDate = h === "Date";
                const isPnl = h === "P&L";
                const isSortable = isDate || isPnl;
                return (
                  <th
                    key={h || `col-${i}`}
                    onClick={
                      isSortable
                        ? () => toggleSort(isDate ? "date" : "pnl")
                        : undefined
                    }
                    onKeyDown={
                      isSortable
                        ? (e) => {
                            if (e.key === "Enter")
                              toggleSort(isDate ? "date" : "pnl");
                          }
                        : undefined
                    }
                    tabIndex={isSortable ? 0 : undefined}
                    className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#A7B0BF] ${
                      isSortable
                        ? "cursor-pointer hover:text-white select-none"
                        : ""
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {h}
                      {isDate && <SortIcon col="date" />}
                      {isPnl && <SortIcon col="pnl" />}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              SKELETON_ROWS.map((rowId) => (
                <tr key={rowId} className="border-b border-white/5">
                  {SKELETON_COLS.map((colId) => (
                    <td key={colId} className="px-4 py-3">
                      <div className="h-4 w-16 rounded bg-white/10 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <div
                    data-ocid="history.empty_state"
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Search size={22} className="text-[#A7B0BF]" />
                    </div>
                    <p className="text-sm font-semibold text-[#E8EDF5]">
                      No trades found
                    </p>
                    <p className="text-xs text-[#A7B0BF] mt-1">
                      Try adjusting your filters or add a new trade
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((trade, idx) => (
                <motion.tr
                  key={String(trade.id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  data-ocid={`history.row.item.${idx + 1}`}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                >
                  <td className="px-4 py-3">
                    <span className="font-bold text-white text-sm">
                      {trade.asset}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        trade.tradeType === "buy"
                          ? "bg-[#33E07A]/15 text-[#33E07A]"
                          : "bg-[#E35B5B]/15 text-[#E35B5B]"
                      }`}
                    >
                      {trade.tradeType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#A7B0BF]">
                    {formatDate(trade.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#E8EDF5] font-mono">
                    ₹
                    {trade.entryPrice.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#E8EDF5] font-mono">
                    ₹
                    {trade.exitPrice.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#A7B0BF]">
                    {trade.lots}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#A7B0BF]">
                    {trade.lotSize}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-bold font-mono ${
                        trade.pnl >= 0 ? "profit-glow" : "loss-color"
                      }`}
                    >
                      {fmt(trade.pnl)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        trade.pnl >= 0
                          ? "bg-[#33E07A]/15 text-[#33E07A]"
                          : "bg-[#E35B5B]/15 text-[#E35B5B]"
                      }`}
                    >
                      {trade.pnl >= 0 ? "WIN" : "LOSS"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(trade.id)}
                      data-ocid={`history.delete_button.${idx + 1}`}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#A7B0BF] hover:text-[#E35B5B] hover:bg-[#E35B5B]/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-[#A7B0BF]">
            Showing {filtered.length} of {(trades ?? []).length} trades
          </p>
          <p
            className={`text-sm font-bold ${
              filtered.reduce((s, t) => s + t.pnl, 0) >= 0
                ? "profit-glow"
                : "loss-color"
            }`}
          >
            Filtered P&amp;L: {fmt(filtered.reduce((s, t) => s + t.pnl, 0))}
          </p>
        </div>
      )}
    </motion.div>
  );
}
