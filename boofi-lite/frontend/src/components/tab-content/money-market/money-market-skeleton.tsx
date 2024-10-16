import React from "react"
import { BentoGrid, BentoGridItem } from "@/components/bento-grid/index"

export const MoneyMarketBentoSkeleton: React.FC = () => {
  const Skeleton = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
  )

  const items = [
    {
      title: "",
      description: "",
      className: "md:col-span-2",
    },
    {
      title: "",
      description: "",
      className: "md:col-span-1",
    },
    {
      title: "",
      description: "",
      className: "md:col-span-1",
    },
    {
      title: "",
      description: "",
      className: "md:col-span-2",
    },
  ]

  return (
    <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
          }
          description={
            <div className="h-4 bg-gray-300 rounded w-full mb-4 animate-pulse"></div>
          }
          header={<Skeleton />}
          className={item.className}
        />
      ))}
    </BentoGrid>
  )
}
