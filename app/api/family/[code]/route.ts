import { NextRequest, NextResponse } from "next/server";
import { getOrdersByFamily, addOrder } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const orders = getOrdersByFamily(params.code);
  return NextResponse.json({ orders });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const body = await req.json();
  const order = addOrder({ ...body, familyCode: params.code.toUpperCase() });
  return NextResponse.json({ order }, { status: 201 });
}
