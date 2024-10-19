import { ArrowRightIcon } from "@radix-ui/react-icons";

import AnimatedShinyText from "@/components/animated-shiny-text/animated-shiny-text";
import { cn } from "@/utils";

export function AnimatedShinyTextIntro() {
  return (
    <div className="z-10 flex min-h-[16rem] items-center justify-center">
      <div
        className={cn(
          "group rounded-full border text-base text-white transition-all ease-in hover:cursor-pointer border-white/5 bg-neutral-900 hover:bg-neutral-800"
        )}
      >
        <AnimatedShinyText className="inline-flex font-clash items-center justify-center px-4 py-1 transition ease-out hover:duration-300 hover:text-neutral-400">
          <span>✨ Introducing BooFi Finance ✨</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
      </div>
    </div>
  );
}
