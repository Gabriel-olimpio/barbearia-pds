interface CardServicoProps {
  name: string;
  price: number;
  durationMinutes: number;
  isSelected?: boolean; // Adicione isso
}

export function CardServico({ name, price, isSelected }: CardServicoProps) {
  return (
    <div className={`relative p-5 border rounded-xl cursor-pointer transition-all 
      ${isSelected ? "border-green-500 bg-[#1e291e]" : "border-[#27272a] bg-[#18181b]"}`}>
      
      {/* Bolinha de seleção ativa */}
      <div className={`w-5 h-5 rounded-full border-2 ${isSelected ? "bg-green-500 border-green-500" : "border-zinc-500"}`} />
      
      <h3 className="font-bold text-white mt-4 uppercase">{name}</h3>
      <p className="font-extrabold text-white text-lg mt-2">R$ {price.toFixed(2)}</p>
    </div>
  );
}