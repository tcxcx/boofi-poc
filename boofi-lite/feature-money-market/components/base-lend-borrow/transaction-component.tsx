import { Zap } from "lucide-react";
import type React from "react";

interface TransactionDetailsProps {
  amount: string;
  action: string;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  amount,
  action,
}) => {
  // Placeholder values; replace with actual logic as needed
  const apyBreakdown = [
    {
      label: "USDC Supply APY",
      value: "0%",
      info: "Determined by asset utilization",
    },
    {
      label: "BIPS APY",
      value: "0%",
      info: "Boosted Yield earned based on BIPS this epoch. See your BIPS ℹ️",
    },
    { label: "Total APY", value: "0%", highlight: true },
    { label: "Portfolio APY", value: "0%" },
  ];

  const bipsBreakdown = [
    { type: "Supply BIPS", bipsPerDay: "0", change: "0", newBipsPerDay: "0" },
    { type: "Borrow BIPS", bipsPerDay: "0", change: "0", newBipsPerDay: "0" },
    { type: "vISYNO BIPS", bipsPerDay: "0", change: "0", newBipsPerDay: "0" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-darkBg p-6 rounded-none border-2 border-main space-y-4">
        <h3 className="text-2xl font-bold font-nupower text-main mb-4">
          Your APY Breakdown
        </h3>
        {apyBreakdown.map((item) => (
          <div key={item.label} className="flex justify-between items-center">
            <span
              className={`font-mono ${
                item.highlight ? "text-main text-lg" : "text-darkText"
              }`}
            >
              {item.label}
              {item.info && (
                <span className="text-xs ml-2 text-mainAccent">
                  {item.info}
                </span>
              )}
            </span>
            <span
              className={`font-nupower text-xl ${
                item.highlight ? "text-main" : "text-darkText"
              }`}
            >
              {item.value}
              {item.highlight && (
                <Zap className="inline ml-2 text-mainAccent" size={20} />
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-darkBg p-6 rounded-none border-2 border-main space-y-4">
        <h3 className="text-2xl font-bold font-nupower text-main mb-4">
          Your BIPS APY Breakdown
        </h3>
        <p className="text-sm mb-4 font-neue">
          BIPS APY is defined by BIPS that are earned by Supplying, Borrowing,
          and Locking. The more BIPS your portfolio accumulates, the higher the
          portion of emissions you earn. Each asset has a distinct multiplier.
        </p>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <img src="/icons/usdc/USDC_Icon.png" alt="USDC" className="w-6 h-6 mr-2" />
            <span className="font-neue">USDC on Base</span>
          </div>
          <span className="font-mono">BIPS Multiplier: 3x</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="font-nupower">BIPS</th>
              <th className="font-nupower">BIPS/Day</th>
              <th className="font-nupower">Change</th>
              <th className="font-nupower">New BIPS/Day</th>
            </tr>
          </thead>
          <tbody>
            {bipsBreakdown.map((row) => (
              <tr key={row.type}>
                <td>{row.type}</td>
                <td>{row.bipsPerDay}</td>
                <td>{row.change}</td>
                <td>{row.newBipsPerDay}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-mainAccent mt-4">
          Last update: 12/31/1969, 7:00:00 PM
        </p>
      </div>
    </div>
  );
};

export default TransactionDetails;
