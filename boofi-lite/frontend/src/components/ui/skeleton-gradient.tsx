import { cn } from "@/utils";

function SkeletonGradient({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-full h-full rounded-md animate-pulse bg-gradient-to-br from-blue-300 via-violet-300 to-cyan-300 bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] transition-[background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
        <div className="w-24 h-24 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
        <span className="text-indigo-500 font-bold text-xl animate-pulse">Loading...</span>
      </div>
    </div>
  );
}

export { SkeletonGradient };
