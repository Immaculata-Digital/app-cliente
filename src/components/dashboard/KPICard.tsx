import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variacao?: number; // percentual
  onClick?: () => void;
  loading?: boolean;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function KPICard({
  title,
  value,
  subtitle,
  variacao,
  onClick,
  loading,
  icon,
  trend,
}: KPICardProps) {
  const hasVariacao = variacao !== undefined && variacao !== null;
  const isPositive = hasVariacao && variacao > 0;
  const isNegative = hasVariacao && variacao < 0;

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/3"></div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "p-6 transition-all hover:shadow-md",
        onClick && "cursor-pointer hover:border-primary"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-primary opacity-80 ml-4">{icon}</div>
        )}
      </div>

      {hasVariacao && (
        <div className="mt-4 flex items-center gap-1">
          {isPositive && <TrendingUp className="h-4 w-4 text-success" />}
          {isNegative && <TrendingDown className="h-4 w-4 text-destructive" />}
          <span
            className={cn(
              "text-sm font-medium",
              isPositive && "text-success",
              isNegative && "text-destructive",
              !isPositive && !isNegative && "text-muted-foreground"
            )}
          >
            {isPositive && "+"}
            {variacao.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            vs. período anterior
          </span>
        </div>
      )}
      
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          {trend.positive ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              trend.positive ? "text-success" : "text-destructive"
            )}
          >
            {trend.value}
          </span>
        </div>
      )}
    </Card>
  );
}
