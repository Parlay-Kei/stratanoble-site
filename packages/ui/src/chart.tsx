import * as React from "react"
import { cn } from "@strata-noble/utils"

interface ChartConfig {
  [key: string]: {
    label: string;
    color?: string;
  };
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactNode;
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, config, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        style={{
          ...Object.entries(config).reduce((acc, [key, value]) => {
            if (value.color) {
              (acc as any)[`--color-${key}`] = value.color;
            }
            return acc;
          }, {} as React.CSSProperties),
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    payload: any;
  }>;
  label?: string;
}

const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        {label && <div className="font-medium">{label}</div>}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.payload?.fill || '#8884d8' }}
            />
            <span className="text-sm">
              {entry.dataKey}: {typeof entry.value === 'number' && entry.dataKey === 'revenue' 
                ? `$${entry.value.toFixed(2)}` 
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface ChartTooltipProps {
  content?: React.ComponentType<ChartTooltipContentProps>;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ content: Content = ChartTooltipContent }) => {
  return <Content />;
};

export { ChartContainer, ChartTooltip, ChartTooltipContent }