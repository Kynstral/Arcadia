import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: number;
  className?: string;
  variant?: "primary" | "accent" | "secondary" | "white";
}

export function Loader({ size = 40, className = "", variant = "primary" }: LoaderProps) {
  const colorClasses = {
    primary: {
      track: "stroke-primary/10",
      car: "stroke-primary",
    },
    accent: {
      track: "stroke-accent/10",
      car: "stroke-accent",
    },
    secondary: {
      track: "stroke-secondary/10",
      car: "stroke-secondary",
    },
    white: {
      track: "stroke-white/20",
      car: "stroke-white",
    },
  };

  const colors = colorClasses[variant];

  return (
    <div className={cn("inline-block", className)} style={{ width: size, height: size }}>
      <svg
        className="animate-spin-slow origin-center"
        viewBox="0 0 40 40"
        width={size}
        height={size}
      >
        <circle
          className={colors.track}
          cx="20"
          cy="20"
          r="17.5"
          pathLength="100"
          strokeWidth="5"
          fill="none"
        />
        <circle
          className={cn(colors.car, "animate-loader-stretch stroke-5 [stroke-linecap:round]")}
          cx="20"
          cy="20"
          r="17.5"
          pathLength="100"
          fill="none"
          style={{
            strokeDasharray: "1, 200",
            strokeDashoffset: 0,
          }}
        />
      </svg>
    </div>
  );
}
