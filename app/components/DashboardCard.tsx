export function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-4xl font-bold text-indigo-600 mt-2">
        {value}
      </p>
    </div>
  );
}

