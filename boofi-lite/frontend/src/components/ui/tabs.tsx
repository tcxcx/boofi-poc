"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/utils";

interface TabsTriggerRightProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  position?: "left" | "right";
}

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg p-1",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsListAlt = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-between rounded-sm px-2",
      className
    )}
    {...props}
  />
));
TabsListAlt.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsTriggerAlt = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn("inline-flex items-center justify-center space-x-2", className)}
    {...props}
  />
));
TabsTriggerAlt.displayName = TabsPrimitive.Trigger.displayName;


const TabsTriggerRight = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerRightProps
>(({ className, position, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "group relative items-center justify-center space-x-4 w-full h-full px-2 py-2 text-xs font-clash display-block inline-block border-double border-4 border-r-4 border-blue-200 transition-all shadow-sm ring-offset-background",
      "bg-transparent text-accent-foreground/70 dark:text-clr-patito hover:bg-gradient-to-br from-pink-100 via-indigo-100 to-yellow-100",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      "data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-200 data-[state=active]:via-indigo-100 data-[state=active]:to-yellow-100",
      "data-[state=active]:text-black data-[state=active]:dark:text-clr-blue" ,
      "data-[state=active]:border-blue-500",
      position === "left" ? "rounded-tl-md" : "",
      position === "right" ? "rounded-tr-md" : "",
      className
    )}
    {...props}
  />
));
TabsTriggerRight.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;


export { Tabs, TabsList, TabsListAlt, TabsTrigger, TabsContent, TabsTriggerAlt, TabsTriggerRight };
