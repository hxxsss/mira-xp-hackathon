import { motion } from "framer-motion";
import { TableCard } from "./TableCard";

interface Table {
  name: string;
  description: string;
  columns?: number;
}

interface ModuleSectionProps {
  title: string;
  tables: Table[];
  color?: string;
}

export function ModuleSection({ title, tables, color = "indigo" }: ModuleSectionProps) {
  const colorClasses = {
    indigo: "text-indigo-600 border-indigo-200",
    purple: "text-purple-600 border-purple-200",
    pink: "text-pink-600 border-pink-200",
    blue: "text-blue-600 border-blue-200",
    green: "text-green-600 border-green-200",
    orange: "text-orange-600 border-orange-200",
  };

  const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h3 className={`text-xl font-semibold pb-2 border-b-2 ${selectedColor}`}>
        {title}
      </h3>
      <div className="grid gap-3">
        {tables.map((table) => (
          <TableCard
            key={table.name}
            name={table.name}
            description={table.description}
            columns={table.columns}
          />
        ))}
      </div>
    </motion.div>
  );
}
