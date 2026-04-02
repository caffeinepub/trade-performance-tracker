import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

actor {
  type Trade = {
    id : Nat;
    asset : Text;
    tradeType : Text;
    entryPrice : Float;
    exitPrice : Float;
    lots : Float;
    lotSize : Float;
    date : Time.Time;
    notes : Text;
    pnl : Float;
  };

  type TradeStats = {
    totalTrades : Nat;
    totalProfit : Float;
    totalLoss : Float;
    netPnl : Float;
    winRate : Float;
    avgProfit : Float;
    avgLoss : Float;
    bestTrade : Float;
    worstTrade : Float;
  };

  type MonthlyPnl = {
    month : Nat;
    year : Int;
    pnl : Float;
  };

  type AssetBreakdown = {
    asset : Text;
    totalPnl : Float;
    trades : Nat;
    winRate : Float;
  };

  module AssetBreakdown {
    public func compare(a : AssetBreakdown, b : AssetBreakdown) : Order.Order {
      Float.compare(b.totalPnl, a.totalPnl);
    };
  };

  type TradeInput = {
    asset : Text;
    tradeType : Text;
    entryPrice : Float;
    exitPrice : Float;
    lots : Float;
    lotSize : Float;
    date : Time.Time;
    notes : Text;
  };

  let trades = Map.empty<Nat, Trade>();
  var nextId = 0;

  public shared ({ caller }) func addTrade(input : TradeInput) : async Nat {
    let id = nextId;
    nextId += 1;

    let pnl = if (input.tradeType == "buy") {
      (input.exitPrice - input.entryPrice) * input.lots * input.lotSize;
    } else {
      (input.entryPrice - input.exitPrice) * input.lots * input.lotSize;
    };

    let trade : Trade = {
      id;
      asset = input.asset;
      tradeType = input.tradeType;
      entryPrice = input.entryPrice;
      exitPrice = input.exitPrice;
      lots = input.lots;
      lotSize = input.lotSize;
      date = input.date;
      notes = input.notes;
      pnl;
    };

    trades.add(id, trade);
    id;
  };

  public query ({ caller }) func getTrades() : async [Trade] {
    trades.values().toArray().sort(
      func(a, b) {
        Int.compare(b.date, a.date);
      }
    );
  };

  public shared ({ caller }) func deleteTrade(id : Nat) : async () {
    if (not trades.containsKey(id)) {
      Runtime.trap("Trade not found");
    };
    trades.remove(id);
  };

  public query ({ caller }) func getStats() : async TradeStats {
    var totalProfit = 0.0;
    var totalLoss = 0.0;
    var netPnl = 0.0;
    var winningTrades = 0;
    var losingTrades = 0;
    var bestTrade = 0.0;
    var worstTrade = 0.0;

    for (trade in trades.values()) {
      netPnl += trade.pnl;
      if (trade.pnl > 0) {
        totalProfit += trade.pnl;
        winningTrades += 1;
        if (trade.pnl > bestTrade) { bestTrade := trade.pnl };
      } else if (trade.pnl < 0) {
        totalLoss += trade.pnl;
        losingTrades += 1;
        if (trade.pnl < worstTrade) { worstTrade := trade.pnl };
      };
    };

    let totalTrades = trades.size();
    let winRate = if (totalTrades > 0) {
      winningTrades.toFloat() / totalTrades.toFloat();
    } else {
      0.0;
    };

    let avgProfit = if (winningTrades > 0) {
      totalProfit / winningTrades.toFloat();
    } else { 0.0 };
    let avgLoss = if (losingTrades > 0) {
      totalLoss / losingTrades.toFloat();
    } else { 0.0 };

    {
      totalTrades;
      totalProfit;
      totalLoss;
      netPnl;
      winRate;
      avgProfit;
      avgLoss;
      bestTrade;
      worstTrade;
    };
  };

  public query ({ caller }) func getMonthlyPnl() : async [MonthlyPnl] {
    let monthlyMap = Map.empty<Text, MonthlyPnl>();

    for (trade in trades.values()) {
      let month = (trade.date / (30 * 24 * 60 * 60 * 1000000000));
      let year = (trade.date / (365 * 24 * 60 * 60 * 1000000000));

      let key = year.toText() # "-" # month.toText();

      switch (monthlyMap.get(key)) {
        case (null) {
          monthlyMap.add(
            key,
            {
              month = month.toNat();
              year;
              pnl = trade.pnl;
            },
          );
        };
        case (?existing) {
          let updated = {
            month = existing.month;
            year = existing.year;
            pnl = existing.pnl + trade.pnl;
          };
          monthlyMap.add(key, updated);
        };
      };
    };

    monthlyMap.values().toArray();
  };

  public query ({ caller }) func getAssetBreakdown() : async [AssetBreakdown] {
    let assetMap = Map.empty<Text, AssetBreakdown>();

    for (trade in trades.values()) {
      switch (assetMap.get(trade.asset)) {
        case (null) {
          let winRate = if (trade.pnl > 0) { 1.0 } else { 0.0 };
          assetMap.add(
            trade.asset,
            {
              asset = trade.asset;
              totalPnl = trade.pnl;
              trades = 1;
              winRate;
            },
          );
        };
        case (?existing) {
          let winRate = if (trade.pnl > 0) {
            ((existing.winRate * existing.trades.toFloat()) + 1.0) / (existing.trades.toFloat() + 1.0);
          } else {
            (existing.winRate * existing.trades.toFloat()) / (existing.trades.toFloat() + 1.0);
          };
          let updated = {
            asset = trade.asset;
            totalPnl = existing.totalPnl + trade.pnl;
            trades = existing.trades + 1;
            winRate;
          };
          assetMap.add(trade.asset, updated);
        };
      };
    };

    assetMap.values().toArray().sort();
  };
};
