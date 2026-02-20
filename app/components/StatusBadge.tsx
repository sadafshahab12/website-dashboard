import { clsx } from "clsx";
import { CheckCircle, Clock, Package } from "lucide-react";

export type OrderStatus = "pending" | "processing" | "completed";
export const statusIcon = {
  pending: <Clock size={14} />,
  processing: <Package size={14} />,
  completed: <CheckCircle size={14} />,
};
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const icons = {
    pending: <Clock size={14} />,
    processing: <Package size={14} />,
    completed: <CheckCircle size={14} />,
  };

  return (
    <span
      className={clsx(
        "flex items-center gap-1.5 px-3 py-1  text-xs font-semibold border",
        styles[status],
      )}
    >
      {icons[status]}
      <span className="capitalize">{status}</span>
    </span>
  );
};

export default StatusBadge;
