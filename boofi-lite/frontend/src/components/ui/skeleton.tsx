import { cn } from "@/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-primary/10 animate-pulse bg-gradient-to-br from-indigo-100 via-violet-200 to-gray-300",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
