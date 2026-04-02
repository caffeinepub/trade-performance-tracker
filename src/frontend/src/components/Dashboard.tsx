import { Activity, AlertCircle, Award, Target, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AssetBreakdown, MonthlyPnl, TradeStats } from "../backend.d";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function fmt(value: number): string {
  const abs = Math.abs(value);
  return `${value >= 0 ? "+" : "-"}₹${abs.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPlain(value: number): string {
  return `₹${Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  positive?: boolean;
  negative?: boolean;
  delay?: number;
}

function KpiCard({
  label,
  value,
  icon,
  positive,
  negative,
  delay = 0,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass shadow-glass p-5 flex flex-col gap-3 group hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#A7B0BF]">
          {label}
        </span>
        <div className="p-2 rounded-lg bg-white/5 text-[#A7B0BF]">{icon}</div>
      </div>
      <p
        className={`text-2xl font-bold tracking-tight ${
          positive ? "profit-glow" : negative ? "loss-color" : "text-[#E8EDF5]"
        }`}
      >
        {value}
      </p>
    </motion.div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="glass px-3 py-2 text-sm">
      <p className="text-[#A7B0BF] mb-1">{label}</p>
      <p
        className={val >= 0 ? "profit-glow font-bold" : "loss-color font-bold"}
      >
        {fmt(val)}
      </p>
    </div>
  );
}

interface Props {
  stats: TradeStats | null | undefined;
  monthlyPnl: MonthlyPnl[] | undefined;
  assetBreakdown: AssetBreakdown[] | undefined;
  isLoading: boolean;
}

export function Dashboard({ stats, monthlyPnl, assetBreakdown }: Props) {
  const chartData = (monthlyPnl ?? []).map((m) => ({
    name: `${MONTH_NAMES[Number(m.month) - 1]} ${String(m.year).slice(2)}`,
    pnl: m.pnl,
  }));

  const sampleMonthly = [
    { name: "Oct 24", pnl: 12400 },
    { name: "Nov 24", pnl: -4300 },
    { name: "Dec 24", pnl: 28100 },
    { name: "Jan 25", pnl: 6800 },
    { name: "Feb 25", pnl: -2200 },
    { name: "Mar 25", pnl: 15600 },
  ];

  const displayChart = chartData.length > 0 ? chartData : sampleMonthly;
  const hasRealData = (stats?.totalTrades ?? BigInt(0)) > BigInt(0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          label="Total Trades"
          value={stats ? String(stats.totalTrades) : "—"}
          icon={<Activity size={15} />}
          delay={0.05}
        />
        <KpiCard
          label="Win Rate"
          value={stats ? `${stats.winRate.toFixed(1)}%` : "—"}
          icon={<Target size={15} />}
          positive={stats ? stats.winRate >= 50 : false}
          delay={0.1}
        />
        <KpiCard
          label="Net P&L"
          value={stats ? fmt(stats.netPnl) : "—"}
          icon={<TrendingUp size={15} />}
          positive={stats ? stats.netPnl > 0 : false}
          negative={stats ? stats.netPnl < 0 : false}
          delay={0.15}
        />
        <KpiCard
          label="Total Profit"
          value={stats ? fmtPlain(stats.totalProfit) : "—"}
          icon={<TrendingUp size={15} />}
          positive={!!stats}
          delay={0.2}
        />
        <KpiCard
          label="Best Trade"
          value={stats ? fmt(stats.bestTrade) : "—"}
          icon={<Award size={15} />}
          positive={stats ? stats.bestTrade > 0 : false}
          delay={0.25}
        />
        <KpiCard
          label="Worst Trade"
          value={stats ? fmt(stats.worstTrade) : "—"}
          icon={<AlertCircle size={15} />}
          negative={stats ? stats.worstTrade < 0 : false}
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="glass shadow-glass p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#E8EDF5]">
                Monthly P&amp;L
              </h3>
              <p className="text-xs text-[#A7B0BF] mt-0.5">
                Performance over time
              </p>
            </div>
            {!hasRealData && (
              <span className="text-xs text-[#A7B0BF] bg-white/5 px-2 py-1 rounded-md">
                Sample data
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={displayChart}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
              barSize={28}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#A7B0BF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#A7B0BF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  `₹${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
                }
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {displayChart.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.pnl >= 0 ? "#33E07A" : "#E35B5B"}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass shadow-glass p-6"
        >
          <div className="mb-5">
            <h3 className="text-base font-bold text-[#E8EDF5]">
              Per-Asset Breakdown
            </h3>
            <p className="text-xs text-[#A7B0BF] mt-0.5">
              P&amp;L by instrument
            </p>
          </div>

          {assetBreakdown && assetBreakdown.length > 0 ? (
            <div className="space-y-3">
              {assetBreakdown.slice(0, 6).map((ab) => (
                <div
                  key={ab.asset}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${ab.totalPnl >= 0 ? "bg-[#33E07A]" : "bg-[#E35B5B]"}`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {ab.asset}
                      </p>
                      <p className="text-xs text-[#A7B0BF]">
                        {String(ab.trades)} trades · {ab.winRate.toFixed(0)}% WR
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${ab.totalPnl >= 0 ? "profit-glow" : "loss-color"}`}
                  >
                    {fmt(ab.totalPnl)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              data-ocid="assets.empty_state"
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <Activity size={20} className="text-[#A7B0BF]" />
              </div>
              <p className="text-sm text-[#A7B0BF]">No asset data yet</p>
              <p className="text-xs text-[#A7B0BF]/60 mt-1">
                Add trades to see breakdown
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
