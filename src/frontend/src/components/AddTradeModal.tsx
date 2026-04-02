import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IndianRupee, TrendingDown, TrendingUp, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAddTrade } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddTradeModal({ open, onClose }: Props) {
  const addTrade = useAddTrade();
  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [asset, setAsset] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [lots, setLots] = useState("");
  const [lotSize, setLotSize] = useState("50");
  const [date, setDate] = useState(defaultDate);
  const [notes, setNotes] = useState("");

  const entry = Number.parseFloat(entryPrice) || 0;
  const exit = Number.parseFloat(exitPrice) || 0;
  const lotsNum = Number.parseFloat(lots) || 0;
  const lotSizeNum = Number.parseFloat(lotSize) || 50;

  const livePnl =
    tradeType === "buy"
      ? (exit - entry) * lotsNum * lotSizeNum
      : (entry - exit) * lotsNum * lotSizeNum;

  const hasPnl = entry > 0 && exit > 0 && lotsNum > 0 && lotSizeNum > 0;

  const handleClose = useCallback(() => {
    setAsset("");
    setTradeType("buy");
    setEntryPrice("");
    setExitPrice("");
    setLots("");
    setLotSize("50");
    setDate(defaultDate);
    setNotes("");
    onClose();
  }, [onClose, defaultDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!asset.trim()) {
      toast.error("Asset name is required");
      return;
    }
    if (!entryPrice || !exitPrice) {
      toast.error("Entry and exit prices are required");
      return;
    }
    if (!lots) {
      toast.error("Number of lots is required");
      return;
    }

    const dateObj = new Date(date);
    const timestamp = BigInt(dateObj.getTime()) * BigInt(1_000_000);

    try {
      await addTrade.mutateAsync({
        asset: asset.trim().toUpperCase(),
        tradeType,
        date: timestamp,
        lots: lotsNum,
        lotSize: lotSizeNum,
        entryPrice: entry,
        exitPrice: exit,
        notes: notes.trim(),
      });
      toast.success("Trade added successfully");
      handleClose();
    } catch {
      toast.error("Failed to add trade");
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            data-ocid="trade.modal"
            className="glass-modal relative w-full max-w-lg shadow-glass-lg overflow-hidden"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
          >
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">Add New Trade</h2>
                <p className="text-sm text-[#A7B0BF] mt-0.5">
                  Record your trade details
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-lg text-[#A7B0BF] hover:text-white hover:bg-white/10 transition-colors"
                data-ocid="trade.close_button"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[#A7B0BF] text-xs font-medium uppercase tracking-wider">
                    Asset Name
                  </Label>
                  <Input
                    data-ocid="trade.input"
                    value={asset}
                    onChange={(e) => setAsset(e.target.value)}
                    placeholder="RELIANCE, TCS, NIFTY..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-[#A7B0BF]/50 focus:border-[#33E07A]/50 focus:ring-[#33E07A]/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#A7B0BF] text-xs font-medium uppercase tracking-wider">
                    Trade Type
                  </Label>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setTradeType("buy")}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold transition-all ${
                        tradeType === "buy"
                          ? "bg-[#33E07A]/20 text-[#33E07A] border border-[#33E07A]/30"
                          : "text-[#A7B0BF] hover:text-white"
                      }`}
                      data-ocid="trade.toggle"
                    >
                      <TrendingUp size={14} /> Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeType("sell")}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold transition-all ${
                        tradeType === "sell"
                          ? "bg-[#E35B5B]/20 text-[#E35B5B] border border-[#E35B5B]/30"
                          : "text-[#A7B0BF] hover:text-white"
                      }`}
                    >
                      <TrendingDown size={14} /> Sell
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[#A7B0BF] text-xs font-medium uppercase tracking-wider">
                    Entry Price (₹)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-[#A7B0BF]/50 focus:border-[#33E07A]/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#A7B0BF] text-xs font-medium uppercase tracking-wider">
                    Exit Price (₹)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-[#A7B0BF]/50 focus:border-[#33E07A]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[#A7B0BF] text-xs font-medium uppercase tracking-wider">
                    Number of Lots
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={lots}
                    onChange={(e) => setLots(e.target.value)}
                    placeholder="e.g. 1, 2.5"
                    className="bg-white/5 border-white/10 text-white placeholder:text-[#A7B0BF]/50 focus:border-[#33E07A]/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#A7B0BF] text-xs font-medium uppercase tracking-wider">
                    Lot Size (shares)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                    placeholder="50"
                    className="bg-white/5 border-white/10 text-white placeholder:text-[#A7B0BF]/50 focus:border-[#33E07A]/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#A7B0BF] text-xs font-medium uppercase tracking-wider">
                  Trade Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#33E07A]/50 [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#A7B0BF] text-xs font-medium uppercase tracking-wider">
                  Notes (optional)
                </Label>
                <Textarea
                  data-ocid="trade.textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Strategy, market conditions..."
                  rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-[#A7B0BF]/50 focus:border-[#33E07A]/50 resize-none"
                />
              </div>

              {hasPnl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`rounded-xl p-4 flex items-center gap-3 ${
                    livePnl >= 0
                      ? "bg-[#33E07A]/10 border border-[#33E07A]/20"
                      : "bg-[#E35B5B]/10 border border-[#E35B5B]/20"
                  }`}
                >
                  <IndianRupee
                    size={18}
                    className={
                      livePnl >= 0 ? "text-[#33E07A]" : "text-[#E35B5B]"
                    }
                  />
                  <div>
                    <p className="text-xs text-[#A7B0BF] uppercase tracking-wider font-medium">
                      Estimated P&amp;L
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        livePnl >= 0 ? "profit-glow" : "loss-color"
                      }`}
                    >
                      {livePnl >= 0 ? "+" : ""}
                      {livePnl.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={addTrade.isPending}
                data-ocid="trade.submit_button"
                className="w-full bg-[#33E07A] hover:bg-[#2bc96e] text-[#070B12] font-bold py-3 rounded-xl transition-all duration-200 hover:shadow-profit"
              >
                {addTrade.isPending ? "Adding Trade..." : "Add Trade"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
