import { LOGO_PATHS, LOGO_VIEWBOX } from "@/lib/logo";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      role="img"
      aria-hidden="true"
      fill="currentColor"
      shapeRendering="geometricPrecision"
      className={cn("h-5 w-auto", className)}
      style={style}
    >
      {LOGO_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
