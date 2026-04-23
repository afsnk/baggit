import { useState } from "react";

interface BuySellPanelProps {
  mode: "buy" | "sell";
  onClose: () => void;
}

export default function BuySellPanel({ mode, onClose }: BuySellPanelProps) {
  const [youPay, setYouPay] = useState("0.12");
  const [youReceive, setYouReceive] = useState("22.21");
  const [paymentCurrency, setPaymentCurrency] = useState("ETH");
  const [receiveCurrency, setReceiveCurrency] = useState("SOL");

  const swapCurrencies = () => {
    setPaymentCurrency(receiveCurrency);
    setReceiveCurrency(paymentCurrency);
    const temp = youPay;
    setYouPay(youReceive);
    setYouReceive(temp);
  };

  const tabs = [
    { id: "swap", label: "SWAP", active: true },
    { id: "sell", label: "SELL", active: false },
    { id: "buy", label: "BUY", active: mode === "buy" },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 bg-gradient-to-b from-slate-900 to-slate-950 min-h-screen">
      {/* Header with close button and tabs */}
      <div className="space-y-6">
        {/* Close button and tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-6 text-gray-400">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`text-xs font-semibold transition ${
                  (tab.id === "buy" && mode === "buy") ||
                  (tab.id === "sell" && mode === "sell") ||
                  (tab.id === "swap" && mode !== "buy" && mode !== "sell")
                    ? "text-white border-b-2 border-white pb-2"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Currency exchange section */}
        <div className="space-y-4">
          {/* You Pay */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 space-y-4">
            <p className="text-gray-400 text-sm">You pay</p>
            <input
              type="text"
              value={youPay}
              onChange={(e) => setYouPay(e.target.value)}
              className="w-full text-4xl font-bold text-white bg-transparent outline-none"
            />
            <p className="text-gray-500 text-sm">${(parseFloat(youPay) * 3163.2).toFixed(2)}</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-full text-white transition">
              <span className="w-6 h-6 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-black text-sm">
                Ξ
              </span>
              {paymentCurrency}
              <span className="text-gray-400">▼</span>
            </button>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <button
              onClick={swapCurrencies}
              className="w-12 h-12 rounded-full bg-slate-700/50 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-white transition hover:scale-110"
            >
              ↔
            </button>
          </div>

          {/* You Receive */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 space-y-4">
            <p className="text-gray-400 text-sm">You receive</p>
            <input
              type="text"
              value={youReceive}
              onChange={(e) => setYouReceive(e.target.value)}
              className="w-full text-4xl font-bold text-white bg-transparent outline-none"
            />
            <p className="text-gray-500 text-sm">${(parseFloat(youReceive) * 3163.2).toFixed(2)}</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-full text-white transition">
              <span className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                ◆
              </span>
              {receiveCurrency}
              <span className="text-gray-400">▼</span>
            </button>
          </div>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-white text-slate-900 font-semibold py-3 rounded-full hover:bg-gray-100 transition">
          {mode === "buy" ? "Buy with AilPay" : mode === "sell" ? "Sell with AilPay" : "Buy with AilPay"}
        </button>

        {/* Exchange rate info */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-2">
          <p>1 {paymentCurrency} = ${(3163.2).toFixed(2)}</p>
          <div className="flex items-center gap-1">
            <span>📊</span>
            <span className="text-purple-400">$0.20</span>
            <span className="text-green-400">$1.42</span>
          </div>
        </div>

        {/* Footer branding */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-slate-700">
          <p>Powered by</p>
          <span className="text-purple-400 font-semibold">🔷 AilPay</span>
        </div>
      </div>
    </div>
  );
}
