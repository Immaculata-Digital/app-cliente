import { useState, useMemo, ReactNode, memo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search, MoreVertical, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "./Input";
import { Button } from "./Button";

export interface Column<T = any> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  hiddenOn?: Array<"xs" | "sm" | "md">;
  renderCell?: (value: any, row: T) => ReactNode;
  renderHeader?: () => ReactNode;
  colSpanMobile?: boolean;
}

export interface Action<T = any> {
  key: string;
  label: string;
  icon?: ReactNode;
  intent?: "default" | "danger" | "success";
  onClick: (row: T) => void;
  confirm?: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  rows: T[];
  rowKey: string | ((row: T) => string);
  actions?: {
    global?: ReactNode;
    perRow: (row: T) => Action<T>[];
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  sorting?: {
    sortBy?: string;
    sortDir?: "asc" | "desc";
    onSortChange?: (key: string, dir: "asc" | "desc") => void;
  };
  isLoading?: boolean;
  error?: string | ReactNode;
  emptyState?: ReactNode | string;
  density?: "comfortable" | "compact";
  zebra?: boolean;
  stickyHeader?: boolean;
  responsive?: "auto" | "table" | "cards";
  headerExtra?: ReactNode;
  i18n?: {
    searchPlaceholder?: string;
    emptyLabel?: string;
    errorLabel?: string;
    loadingLabel?: string;
    actionsLabel?: string;
    noResultsLabel?: string;
  };
  onRowClick?: (row: T) => void;
  onAction?: (actionKey: string, row: T) => void;
}

/**
 * DataTable Component
 * 
 * Componente de tabela completo com:
 * - Busca e filtros
 * - Ordenação
 * - Paginação
 * - Ações por linha
 * - Responsivo (cards no mobile)
 * - Loading e error states
 * 
 * @example
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   rows={data}
 *   rowKey="id"
 *   search={{ value: search, onChange: setSearch }}
 *   pagination={{ page, pageSize, total, onPageChange }}
 * />
 * ```
 */
export const DataTable = memo(function DataTable<T = any>({
  columns,
  rows,
  rowKey,
  actions,
  search,
  pagination,
  sorting,
  isLoading = false,
  error,
  emptyState,
  density = "comfortable",
  zebra = true,
  stickyHeader = false,
  responsive = "auto",
  headerExtra,
  i18n = {},
  onRowClick,
  onAction,
}: DataTableProps<T>) {
  const [openMenuRow, setOpenMenuRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(search?.value || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getRowKey = (row: T): string => {
    return typeof rowKey === "function" ? rowKey(row) : (row as any)[rowKey];
  };

  const handleSort = (key: string) => {
    if (!sorting?.onSortChange) return;
    const newDir = sorting.sortBy === key && sorting.sortDir === "asc" ? "desc" : "asc";
    sorting.onSortChange(key, newDir);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer to trigger search after delay
    debounceTimerRef.current = setTimeout(() => {
      if (search?.onChange) {
        search.onChange(value);
      }
    }, search?.debounceMs || 500);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Sync external search value changes
  useEffect(() => {
    if (search?.value !== undefined && search.value !== searchTerm) {
      setSearchTerm(search.value);
    }
  }, [search?.value]);

  const densityClasses = {
    comfortable: "py-4 px-4",
    compact: "py-2 px-3",
  };

  // Loading skeleton - only show full skeleton if no data yet
  const showFullSkeleton = isLoading && rows.length === 0 && !searchTerm;
  if (showFullSkeleton) {
    return (
      <div className="w-full space-y-3">
        <div className="h-11 bg-muted animate-pulse rounded-lg" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <div className="text-destructive text-lg font-medium">
          {typeof error === "string" ? error : error}
        </div>
      </div>
    );
  }

  // Empty state
  if (rows.length === 0 && !searchTerm) {
    return (
      <div className="w-full space-y-4">
        {/* Header with search and actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {search && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={search.placeholder || i18n.searchPlaceholder || "Buscar..."}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
          {actions?.global && <div className="flex gap-2">{actions.global}</div>}
        </div>
        <div className="w-full p-12 text-center">
          <div className="text-muted-foreground text-lg">
            {emptyState || i18n.emptyLabel || "Nenhum dado disponível"}
          </div>
        </div>
      </div>
    );
  }

  // No results state
  if (rows.length === 0 && searchTerm) {
    return (
      <div className="w-full space-y-4">
        {/* Header with search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={i18n.searchPlaceholder || "Buscar..."}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {actions?.global && <div className="flex gap-2">{actions.global}</div>}
        </div>
        <div className="w-full p-12 text-center">
          <div className="text-muted-foreground text-lg">
            {i18n.noResultsLabel || "Nenhum resultado encontrado"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header with search and actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {search && (
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={search.placeholder || i18n.searchPlaceholder || "Buscar..."}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
        )}
        {actions?.global && <div className="flex gap-2">{actions.global}</div>}
      </div>

      {headerExtra && <div>{headerExtra}</div>}

      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn("bg-muted", stickyHeader && "sticky top-0 z-10")}>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "text-left font-semibold text-sm text-foreground border-b border-border",
                      densityClasses[density],
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.sortable && "cursor-pointer select-none hover:bg-muted/80"
                    )}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.renderHeader ? col.renderHeader() : col.header}
                      {col.sortable && sorting?.sortBy === col.key && (
                        <span>
                          {sorting.sortDir === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions && (
                  <th
                    className={cn(
                      "text-center font-semibold text-sm text-foreground border-b border-border w-16",
                      densityClasses[density]
                    )}
                  >
                    {i18n.actionsLabel || "Ações"}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const key = getRowKey(row);
                const rowActions = actions?.perRow(row) || [];
                return (
                  <tr
                    key={key}
                    className={cn(
                      "border-b border-border transition-colors",
                      zebra && idx % 2 === 0 && "bg-muted/30",
                      onRowClick && "cursor-pointer hover:bg-muted/50"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => {
                      const value = (row as any)[col.key];
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "text-sm text-foreground",
                            densityClasses[density],
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right"
                          )}
                        >
                          {col.renderCell ? col.renderCell(value, row) : value || "—"}
                        </td>
                      );
                    })}
                     {actions && (
                      <td className={cn("text-center", densityClasses[density])}>
                        <div className="relative">
                          <button
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuRow(openMenuRow === key ? null : key);
                            }}
                            aria-label={i18n.actionsLabel || "Ações"}
                            aria-haspopup="menu"
                            aria-expanded={openMenuRow === key}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenuRow === key && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuRow(null)}
                              />
                              <div className="fixed z-50 min-w-[160px] bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
                                style={{
                                  top: `${(document.activeElement as HTMLElement)?.getBoundingClientRect().bottom + 4}px`,
                                  left: `${(document.activeElement as HTMLElement)?.getBoundingClientRect().right - 160}px`,
                                }}
                              >
                                {rowActions.map((action) => (
                                  <button
                                    key={action.key}
                                    className={cn(
                                      "w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors",
                                      action.intent === "danger"
                                        ? "text-destructive hover:bg-destructive/10"
                                        : action.intent === "success"
                                        ? "text-success hover:bg-success/10"
                                        : "text-foreground hover:bg-muted"
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (action.confirm) {
                                        const confirmed = window.confirm(
                                          `${action.confirm.title}\n\n${action.confirm.message}`
                                        );
                                        if (confirmed) {
                                          action.onClick(row);
                                          onAction?.(action.key, row);
                                        }
                                      } else {
                                        action.onClick(row);
                                        onAction?.(action.key, row);
                                      }
                                      setOpenMenuRow(null);
                                    }}
                                  >
                                    {action.icon && <span className="inline-flex">{action.icon}</span>}
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {rows.map((row) => {
          const key = getRowKey(row);
          const rowActions = actions?.perRow(row) || [];
          return (
            <div
              key={key}
              className={cn(
                "bg-card border border-border rounded-lg p-4 shadow-sm",
                onRowClick && "cursor-pointer active:scale-[0.98] transition-transform"
              )}
              onClick={() => onRowClick?.(row)}
              role="group"
            >
              <div className="space-y-2.5">
                {columns.map((col) => {
                  const value = (row as any)[col.key];
                  return (
                    <div key={col.key} className="flex justify-between items-start gap-3">
                      <span className="text-sm font-medium text-muted-foreground min-w-[100px]">
                        {col.header}:
                      </span>
                      <span className="text-sm text-foreground text-right flex-1">
                        {col.renderCell ? col.renderCell(value, row) : value || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
              {actions && rowActions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border relative">
                  <button
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuRow(openMenuRow === key ? null : key);
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                    {i18n.actionsLabel || "Ações"}
                  </button>
                  {openMenuRow === key && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuRow(null)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                        {rowActions.map((action) => (
                          <button
                            key={action.key}
                            className={cn(
                              "w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors",
                              action.intent === "danger"
                                ? "text-destructive hover:bg-destructive/10"
                                : action.intent === "success"
                                ? "text-success hover:bg-success/10"
                                : "text-foreground hover:bg-muted"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (action.confirm) {
                                const confirmed = window.confirm(
                                  `${action.confirm.title}\n\n${action.confirm.message}`
                                );
                                if (confirmed) {
                                  action.onClick(row);
                                  onAction?.(action.key, row);
                                }
                              } else {
                                action.onClick(row);
                                onAction?.(action.key, row);
                              }
                              setOpenMenuRow(null);
                            }}
                          >
                            {action.icon && <span className="inline-flex">{action.icon}</span>}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}) as <T = any>(props: DataTableProps<T>) => JSX.Element;
