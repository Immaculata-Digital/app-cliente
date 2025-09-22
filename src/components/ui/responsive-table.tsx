import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ActionMenu, { ActionItem } from "@/components/ui/action-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  Search,
  Loader2,
  AlertCircle,
  Inbox,
} from "lucide-react";

export interface TableColumn<T = any> {
  key: string;
  header: string | React.ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  hiddenOn?: "mobile" | "tablet" | "desktop";
  renderCell?: (value: any, row: T, column: TableColumn<T>) => React.ReactNode;
  renderHeader?: (column: TableColumn<T>) => React.ReactNode;
  colSpanMobile?: number;
}

export interface SearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export interface SortConfig {
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (sortBy: string, direction: "asc" | "desc") => void;
}

export interface ActionsConfig<T = any> {
  perRow?: (row: T) => ActionItem[];
  global?: ActionItem[];
}

export interface ResponsiveTableProps<T = any> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: string | ((row: T) => string);
  search?: SearchConfig;
  sorting?: SortConfig;
  actions?: ActionsConfig<T>;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  density?: "comfortable" | "compact";
  zebra?: boolean;
  stickyHeader?: boolean;
  responsive?: "auto" | "table" | "cards";
  className?: string;
  onRowClick?: (row: T) => void;
  i18n?: {
    search?: string;
    noResults?: string;
    loading?: string;
    error?: string;
  };
}

const ResponsiveTable = <T extends Record<string, any>>({
  columns,
  rows,
  rowKey,
  search,
  sorting,
  actions,
  loading = false,
  error,
  emptyMessage,
  density = "comfortable",
  zebra = false,
  stickyHeader = false,
  responsive = "auto",
  className,
  onRowClick,
  i18n = {},
}: ResponsiveTableProps<T>) => {
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = React.useState(search?.value || "");
  const [debouncedSearch, setDebouncedSearch] = React.useState(searchValue);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, search?.debounceMs || 300);

    return () => clearTimeout(timer);
  }, [searchValue, search?.debounceMs]);

  React.useEffect(() => {
    if (search?.onChange && debouncedSearch !== search.value) {
      search.onChange(debouncedSearch);
    }
  }, [debouncedSearch, search]);

  const getRowKey = (row: T): string => {
    return typeof rowKey === "function" ? rowKey(row) : row[rowKey];
  };

  const handleSort = (columnKey: string) => {
    if (!sorting?.onSortChange) return;

    const newDirection =
      sorting.sortBy === columnKey && sorting.sortDirection === "asc"
        ? "desc"
        : "asc";

    sorting.onSortChange(columnKey, newDirection);
  };

  const getSortIcon = (columnKey: string) => {
    if (sorting?.sortBy !== columnKey) return null;
    return sorting.sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const shouldShowCards = () => {
    if (responsive === "cards") return true;
    if (responsive === "table") return false;
    return isMobile;
  };

  const renderTableHeader = () => (
    <thead className={cn("table-thead", stickyHeader && "table-thead-sticky")}>
      <tr>
        {columns.map((column) => {
          const isHidden =
            (column.hiddenOn === "mobile" && isMobile) ||
            (column.hiddenOn === "desktop" && !isMobile);

          if (isHidden) return null;

          return (
            <th
              key={column.key}
              className={cn(
                "table-header-cell",
                density === "compact" && "table-header-compact",
                column.sortable && "table-header-sortable"
              )}
              style={{
                width: column.width,
                textAlign: column.align || "left",
              }}
              onClick={
                column.sortable ? () => handleSort(column.key) : undefined
              }
            >
              <div className="flex items-center gap-2">
                {column.renderHeader
                  ? column.renderHeader(column)
                  : column.header}
                {column.sortable && getSortIcon(column.key)}
              </div>
            </th>
          );
        })}
        {actions?.perRow && <th className="table-header-cell w-12"></th>}
      </tr>
    </thead>
  );

  const renderTableRow = (row: T, index: number) => {
    const rowKeyValue = getRowKey(row);
    const hasActions = actions?.perRow?.(row)?.length;

    return (
      <tr
        key={rowKeyValue}
        className={cn(
          "table-row",
          onRowClick && "table-row-clickable",
          zebra && index % 2 === 1 && "table-row-zebra"
        )}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
      >
        {columns.map((column) => {
          const isHidden =
            (column.hiddenOn === "mobile" && isMobile) ||
            (column.hiddenOn === "desktop" && !isMobile);

          if (isHidden) return null;

          const value = row[column.key];

          return (
            <td
              key={column.key}
              className={cn(
                "table-cell",
                density === "compact" && "table-cell-compact"
              )}
              style={{ textAlign: column.align || "left" }}
            >
              {column.renderCell ? column.renderCell(value, row, column) : value}
            </td>
          );
        })}
        {actions?.perRow && (
          <td className={cn(
            "table-cell",
            density === "compact" && "table-cell-compact"
          )}>
            {hasActions && (
              <ActionMenu
                actions={actions.perRow(row)}
                size="sm"
                className="ml-auto"
              />
            )}
          </td>
        )}
      </tr>
    );
  };

  const renderCard = (row: T, index: number) => {
    const rowKeyValue = getRowKey(row);
    const hasActions = actions?.perRow?.(row)?.length;

    return (
      <Card
        key={rowKeyValue}
        className={cn(
          "cursor-pointer transition-colors hover:bg-muted/50",
          !onRowClick && "cursor-default hover:bg-transparent"
        )}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
      >
        <CardContent className="p-4">
          <div className="grid gap-3">
            {columns
              .filter((column) => column.hiddenOn !== "mobile")
              .map((column) => {
                const value = row[column.key];
                const content = column.renderCell
                  ? column.renderCell(value, row, column)
                  : value;

                return (
                  <div key={column.key} className="flex justify-between items-start">
                    <div className="text-sm font-medium text-muted-foreground min-w-0 mr-3">
                      {typeof column.header === "string"
                        ? column.header
                        : column.key}
                    </div>
                    <div className="text-sm text-right min-w-0 flex-1">
                      {content}
                    </div>
                  </div>
                );
              })}
            {hasActions && (
              <div className="flex justify-end pt-2 border-t">
                <ActionMenu
                  actions={actions.perRow(row)}
                  size="sm"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {i18n.loading || "Carregando..."}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      );
    }

    if (rows.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Inbox className="h-8 w-8 text-muted-foreground mb-2" />
          <div className="text-muted-foreground">
            {emptyMessage || i18n.noResults || "Nenhum resultado encontrado"}
          </div>
        </div>
      );
    }

    if (shouldShowCards()) {
      return (
        <div className="grid gap-4">
          {rows.map((row, index) => renderCard(row, index))}
        </div>
      );
    }

    return (
      <div className="table-container">
        <div className="table-container-inner">
          <table className="table-base">
            {renderTableHeader()}
            <tbody>
              {rows.map((row, index) => renderTableRow(row, index))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header with search and global actions */}
      {(search || actions?.global) && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {search && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={search.placeholder || i18n.search || "Buscar..."}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {actions?.global && (
            <div className="flex items-center gap-2">
              {actions.global.map((action) => (
                <Button
                  key={action.key}
                  variant={action.intent === "danger" ? "destructive" : "default"}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table content */}
      {renderContent()}
    </div>
  );
};

export default ResponsiveTable;