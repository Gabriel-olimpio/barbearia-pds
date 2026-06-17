import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const client = await prisma.user.create({
    data: {
      name: "Cliente Teste",
      email: "cliente@teste.com",
      passwordHash: "123456",
      role: "CLIENT",
    },
  });

  return NextResponse.json(client);
}