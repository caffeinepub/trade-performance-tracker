import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BarChart2,
  History,
  LayoutDashboard,
  Plus,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { AddTradeModal } from "./components/AddTradeModal";
import { Dashboard } from "./components/Dashboard";
import { TradeHistory } from "./components/TradeHistory";
import {
  useAssetBreakdown,
  useMonthlyPnl,
  useStats,
  useTrades,
} from "./hooks/useQueries";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function AppContent() {
  const [tab, setTab] = useState<"dashboard" | "analytics" | "history">(
    "dashboard",
  );
  const [addOpen, setAddOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: trades, isLoading: tradesLoading } = useTrades();
  const { data: monthlyPnl } = useMonthlyPnl();
  const { data: assetBreakdown } = useAssetBreakdown();

  const NAV_ITEMS = [
    {
      key: "dashboard" as const,
      label: "Dashboard",
      icon: <LayoutDashboard size={15} />,
    },
    {
      key: "analytics" as const,
      label: "Analytics",
      icon: <BarChart2 size={15} />,
    },
    {
      key: "history" as const,
      label: "Trade Log",
      icon: <History size={15} />,
    },
  ];

  const netPnl = stats?.netPnl ?? 0;
  const winRate = stats?.winRate ?? 0;

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: `url('/assets/generated/trading-bg.dim_1920x1080.jpg') center/cover fixed, #070B12`,
      }}
    >
      <div className="fixed inset-0 bg-[#070B12]/60 pointer-events-none" />

      <header className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#33E07A]/15 border border-[#33E07A]/30 flex items-center justify-center">
              <TrendingUp size={16} className="text-[#33E07A]" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              QuantTrade
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                type="button"
                key={item.key}
                onClick={() => setTab(item.key)}
                data-ocid={`nav.${item.key}.link`}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === item.key
                    ? "text-[#33E07A] bg-[#33E07A]/10"
                    : "text-[#A7B0BF] hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setAddOpen(true)}
            data-ocid="nav.add_trade.primary_button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#33E07A] text-[#070B12] font-bold text-sm hover:bg-[#2bc96e] transition-all duration-200 hover:shadow-profit active:scale-95"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Trade
          </button>
        </div>

        <div className="md:hidden flex gap-1 px-4 pb-3">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === item.key
                  ? "text-[#33E07A] bg-[#33E07A]/10"
                  : "text-[#A7B0BF]"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#33E07A] mb-1">
              Performance Overview
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {tab === "dashboard" && "Trading Dashboard"}
              {tab === "analytics" && "Analytics"}
              {tab === "history" && "Trade Log"}
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="glass px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs text-[#A7B0BF]">Net P&amp;L</span>
              <span
                className={`text-sm font-bold ${
                  netPnl >= 0 ? "profit-glow" : "loss-color"
                }`}
              >
                {netPnl >= 0 ? "+" : ""}₹
                {Math.abs(netPnl).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="glass px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs text-[#A7B0BF]">Win Rate</span>
              <span
                className={`text-sm font-bold ${
                  winRate >= 50 ? "profit-glow" : "loss-color"
                }`}
              >
                {winRate.toFixed(1)}%
              </span>
            </div>
            <div className="glass px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs text-[#A7B0BF]">Trades</span>
              <span className="text-sm font-bold text-white">
                {String(stats?.totalTrades ?? "0")}
              </span>
            </div>
          </div>
        </motion.div>

        {tab === "dashboard" && (
          <Dashboard
            stats={stats}
            monthlyPnl={monthlyPnl}
            assetBreakdown={assetBreakdown}
            isLoading={statsLoading}
          />
        )}
        {tab === "analytics" && (
          <Dashboard
            stats={stats}
            monthlyPnl={monthlyPnl}
            assetBreakdown={assetBreakdown}
            isLoading={statsLoading}
          />
        )}
        {tab === "history" && (
          <TradeHistory trades={trades} isLoading={tradesLoading} />
        )}
      </main>

      <footer className="relative z-10 border-t border-white/8 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-[#33E07A]" />
            <span className="text-xs text-[#A7B0BF] font-medium">
              QuantTrade — Professional Trading Analytics
            </span>
          </div>
          <p className="text-xs text-[#A7B0BF]/60">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#33E07A]/80 hover:text-[#33E07A] transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <AddTradeModal open={addOpen} onClose={() => setAddOpen(false)} />
      <Toaster theme="dark" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
