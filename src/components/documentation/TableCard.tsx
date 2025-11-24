import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TableCardProps {
  name: string;
  description: string;
  columns?: number;
}

export function TableCard({ name, description, columns }: TableCardProps) {
  return (
    <Card className="border border-indigo-100 hover:border-indigo-300 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono text-indigo-700">{name}</CardTitle>
          {columns && (
            <Badge variant="secondary" className="text-xs">
              {columns} colunas
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
