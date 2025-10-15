import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TableCardProps = {
  children: React.ReactNode;
  className?: string;
};

export const TableCard = ({ children, className }: TableCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  );
};
