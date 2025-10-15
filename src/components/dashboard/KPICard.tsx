import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KPICardProps = {
  title: string;
  description?: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
};

export const KPICard = ({
  title,
  description,
  value,
  icon: Icon,
  trend,
  className,
}: KPICardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className="mt-1">{description}</CardDescription>
        )}
        {trend && (
          <p
            className={cn(
              "text-xs mt-2",
              trend.positive ? "text-success" : "text-destructive"
            )}
          >
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
