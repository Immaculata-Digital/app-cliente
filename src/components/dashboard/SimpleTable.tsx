import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ds/Button";
import { Skeleton } from "@/components/ui/skeleton";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => ReactNode;
}

interface SimpleTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  actions?: {
    label: string;
    onClick: (item: T) => void;
  };
  emptyMessage?: string;
  loading?: boolean;
}

export function SimpleTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  actions,
  emptyMessage = "Nenhum dado disponível",
  loading,
}: SimpleTableProps<T>) {
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-2">
          {data.map((row, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 space-y-1">
                {columns.map((col) => (
                  <div key={String(col.key)} className="flex items-start gap-2">
                    <span className="text-xs font-medium text-muted-foreground min-w-[80px]">
                      {col.label}:
                    </span>
                    <span className="text-sm text-foreground flex-1">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </span>
                  </div>
                ))}
              </div>
              {actions && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => actions.onClick(row)}
                >
                  {actions.label}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
