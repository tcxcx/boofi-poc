"use client";

import React from 'react';
import { BentoGrid, BentoGridItem } from "@/components/bento-grid";
import MoneyMarketTabs from './bento-1/index';
import ApyAssets from './bento-2/market-info/index';
import BooFiAiAssistant from './bento-3/boofi-ai-assistant/index';
import PositionsInfoCard from './bento-4/market-positions-table/index';

export default function MoneyMarketBentoGrid() {
  return (

    <BentoGrid className="max-w-7xl mx-auto ">
      {/* Top Left: Large MoneyMarketTabs */}
      <BentoGridItem
        className="md:col-span-2"
        title={null}
        description={null}
        header={<MoneyMarketTabs />}
        icon={null}
      />

      {/* Top Right: Less wide ApyAssets card */}
      <BentoGridItem
        className="md:col-span-1"
        title={null}
        description={null}
        header={<ApyAssets />}
        icon={null}
      />

      {/* Bottom Left: BooFiAiAssistant */}
      <BentoGridItem
        className="md:col-span-1"
        title={null}
        description={null}
        header={<BooFiAiAssistant />}
        icon={null}
      />

      {/* Bottom Right: Large PositionsInfoCard */}
      <BentoGridItem
        className="md:col-span-2"
        title={null}
        description={null}
        header={<PositionsInfoCard />}
        icon={null}
      />
    </BentoGrid>
  );
}