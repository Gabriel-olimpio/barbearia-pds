import { prisma } from "@/lib/prisma";
import ServicosClient from "./ServicosClient";

export default async function ServicosPage() {
  const servicosBrutos = await prisma.service.findMany({
    orderBy: { name: "asc" },
  });

  const servicosLimpinhos = servicosBrutos.map((servico) => ({
    id: servico.id,
    name: servico.name,
    description: servico.description,
    durationMinutes: servico.durationMinutes,
    price: Number(servico.price),
  }));

  return <ServicosClient servicosBanco={servicosLimpinhos} />;
}