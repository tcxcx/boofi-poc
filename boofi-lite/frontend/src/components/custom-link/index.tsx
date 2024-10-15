import { cn } from "@/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { CustomLinkProps } from "@/lib/types";

const CustomLink = ({
  href,
  children,
  className,
  ...rest
}: CustomLinkProps) => {
  const isInternalLink = href.startsWith("/");
  const isAnchorLink = href.startsWith("#");

  if (isInternalLink || isAnchorLink) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("items-center underline", className)}
      {...rest}
    >
      {children}
      <ExternalLink className=" ml-0.5 h-4 w-4 inline-block" />
    </Link>
  );
};

export default CustomLink;
