import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const barber = await prisma.barberShop.findUnique({
      where: { slug },
      include: { services: true, barbers: true },
    });

    if (!barber) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }

    return NextResponse.json(barber);
  } catch (error) {
    console.error('Erro Prisma:', error);
    return NextResponse.json({ error: 'Erro Interno' }, { status: 500 });
  }
}