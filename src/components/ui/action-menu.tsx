import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  intent?: "default" | "danger" | "success" | "warning";
  onClick: () => void;
  disabled?: boolean;
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
}

export interface ActionMenuProps {
  actions: ActionItem[];
  className?: string;
  trigger?: React.ReactNode;
  size?: "sm" | "default" | "lg";
}

const intentClasses = {
  default: "hover:bg-muted",
  danger: "text-destructive hover:bg-destructive-bg focus:bg-destructive-bg",
  success: "text-success hover:bg-success-bg focus:bg-success-bg",
  warning: "text-warning hover:bg-warning-bg focus:bg-warning-bg",
};

const ActionMenu: React.FC<ActionMenuProps> = ({
  actions,
  className,
  trigger,
  size = "default",
}) => {
  const [confirmAction, setConfirmAction] = React.useState<ActionItem | null>(
    null
  );

  const handleActionClick = (action: ActionItem) => {
    if (action.requiresConfirmation) {
      setConfirmAction(action);
    } else {
      action.onClick();
    }
  };

  const handleConfirm = () => {
    confirmAction?.onClick();
    setConfirmAction(null);
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size={size}
      className={cn("h-8 w-8 p-0", className)}
    >
      <MoreVertical className="h-4 w-4" />
      <span className="sr-only">Open menu</span>
    </Button>
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || defaultTrigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {actions.map((action, index) => {
            const isLastGroup = index === actions.length - 1;
            const nextAction = actions[index + 1];
            const shouldAddSeparator =
              nextAction && action.intent !== nextAction.intent;

            return (
              <React.Fragment key={action.key}>
                <DropdownMenuItem
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    intentClasses[action.intent || "default"]
                  )}
                >
                  {action.icon && (
                    <span className="w-4 h-4">{action.icon}</span>
                  )}
                  {action.label}
                </DropdownMenuItem>
                {shouldAddSeparator && !isLastGroup && <DropdownMenuSeparator />}
              </React.Fragment>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.confirmationTitle || "Confirmar ação"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmationDescription ||
                "Esta ação não pode ser desfeita. Tem certeza que deseja continuar?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={cn(
                confirmAction?.intent === "danger" &&
                  "bg-destructive hover:bg-destructive/90"
              )}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ActionMenu;