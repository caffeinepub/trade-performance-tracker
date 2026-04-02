import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TradeInput {
    asset: string;
    tradeType: string;
    date: Time;
    lots: number;
    notes: string;
    entryPrice: number;
    exitPrice: number;
    lotSize: number;
}
export interface MonthlyPnl {
    pnl: number;
    month: bigint;
    year: bigint;
}
export interface TradeStats {
    bestTrade: number;
    worstTrade: number;
    totalTrades: bigint;
    totalLoss: number;
    netPnl: number;
    avgLoss: number;
    totalProfit: number;
    winRate: number;
    avgProfit: number;
}
export type Time = bigint;
export interface AssetBreakdown {
    asset: string;
    trades: bigint;
    totalPnl: number;
    winRate: number;
}
export interface Trade {
    id: bigint;
    pnl: number;
    asset: string;
    tradeType: string;
    date: Time;
    lots: number;
    notes: string;
    entryPrice: number;
    exitPrice: number;
    lotSize: number;
}
export interface backendInterface {
    addTrade(input: TradeInput): Promise<bigint>;
    deleteTrade(id: bigint): Promise<void>;
    getAssetBreakdown(): Promise<Array<AssetBreakdown>>;
    getMonthlyPnl(): Promise<Array<MonthlyPnl>>;
    getStats(): Promise<TradeStats>;
    getTrades(): Promise<Array<Trade>>;
}
