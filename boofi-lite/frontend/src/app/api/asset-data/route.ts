// src/app/api/asset-data/route.ts

import { NextResponse } from "next/server";
import type { AssetData } from "@/lib/types";

type ViewTab = "lend" | "withdraw" | "borrow" | "repay";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const viewTab = searchParams.get("viewTab") as ViewTab | null;

    if (
      !viewTab ||
      !["lend", "withdraw", "borrow", "repay"].includes(viewTab)
    ) {
      return NextResponse.json(
        { error: "Invalid or missing viewTab parameter" },
        { status: 400 }
      );
    }

    // Replace with actual data fetching logic
    const mockData: Record<ViewTab, AssetData[]> = {
      borrow: [
        {
          assetName: "USDC",
          amount: 5000,
          value: 5000,
          chains: ["evm"],
          totalSupplied: 10000,
          totalSupplyAPY: 0.01,
        },
        {
          assetName: "ETH",
          amount: 2,
          value: 6000,
          chains: ["evm"],
          totalSupplied: 10000,
          totalSupplyAPY: 0.01,
        },
      ],
      lend: [
        {
          assetName: "USDC",
          amount: 8000,
          value: 8000,
          chains: ["evm"],
          totalSupplied: 10000,
          totalSupplyAPY: 0.01,
        },
        {
          assetName: "DAI",
          amount: 10000,
          value: 10000,
          chains: ["evm"],
          totalSupplied: 10000,
          totalSupplyAPY: 0.01,
        },
      ],
      withdraw: [
        {
          assetName: "USDC",
          amount: 10000,
          value: 10000,
          chains: ["evm"],
          totalSupplied: 10000,
          totalSupplyAPY: 0.01,
        },
      ],
      repay: [
        {
          assetName: "USDC",
          amount: 2000,
          value: 2000,
          chains: ["evm"],
          totalSupplied: 10000,
          totalSupplyAPY: 0.01,
        },
      ],
    };

    return NextResponse.json(mockData[viewTab]);
  } catch (error) {
    console.error("Error in Asset API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch Asset data" },
      { status: 500 }
    );
  }
}
