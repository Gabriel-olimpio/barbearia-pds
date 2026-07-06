type RankingItem = {
  id: string;
  name: string;
  appointments: number;
};

type RankingCardProps = {
  title: string;
  icon: React.ReactNode;
  firstColumn: string;
  secondColumn: string;
  items: RankingItem[];
};

export default function RankingCard({
  title,
  icon,
  firstColumn,
  secondColumn,
  items,
}: RankingCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center gap-3">
        {icon}

        <h2 className="text-2xl font-bold text-gray-800">
          {title}
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          Nenhum dado encontrado.
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-left text-gray-700">
                {firstColumn}
              </th>

              <th className="py-3 text-right text-gray-700">
                {secondColumn}
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id}
                className="border-b last:border-none hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 text-gray-800">
                  <span className="mr-2">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && "•"}
                  </span>

                  {item.name}
                </td>

                <td className="py-3 text-right font-bold text-gray-800">
                  {item.appointments}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}