import { prisma } from "@/lib/prisma";
import ServicosClient from "./ServicosClient";

export default async function ServicosPage() {
  // Busca os dados brutos no banco
  const servicosBrutos = await prisma.service.findMany({
    orderBy: { name: 'asc' }
  });

  // Limpa os dados (converte Decimal para Number)
  const servicosLimpinhos = servicosBrutos.map((servico) => ({
    id: servico.id,
    name: servico.name,
    description: servico.description,
    durationMinutes: servico.durationMinutes,
    price: Number(servico.price), 
  }));

  // Entrega os dados limpos para o componente cliente
  return <ServicosClient servicosBanco={servicosLimpinhos} />;
}