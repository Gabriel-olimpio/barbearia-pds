type BarChartItem = {
  id: string;
  name: string;
  appointments: number;
};

type BarChartCardProps = {
  title: string;
  icon: React.ReactNode;
  items: BarChartItem[];
  color?: string;
};

export default function BarChartCard({
  title,
  icon,
  items,
  color = "bg-blue-500",
}: BarChartCardProps) {
  const max = Math.max(...items.map((item) => item.appointments), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center gap-3">
        {icon}

        <h2 className="text-2xl font-bold text-gray-800">
          {title}
        </h2>
      </div>

      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.id}>
            <div className="mb-2 flex justify-between">
              <span className="text-gray-700 font-medium">
                {item.name}
              </span>

              <span className="font-bold text-gray-900">
                {item.appointments}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full ${color}`}
                style={{
                  width: `${(item.appointments / max) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}