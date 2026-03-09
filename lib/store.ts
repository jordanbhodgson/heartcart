import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

export interface StoredOrder {
  id: string;
  familyCode: string;
  orderedAt: string;
  senderName: string;
  recipientName: string;
  recipientRoom?: string;
  home: { id: string; name: string; city: string; address: string };
  items: { id: string; name: string; emoji: string; quantity: number; price: number }[];
  total: number;
  message?: string;
  status: "processing" | "in_transit" | "delivered";
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readOrders(): StoredOrder[] {
  ensureDataDir();
  if (!fs.existsSync(ORDERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeOrders(orders: StoredOrder[]) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export function getOrdersByFamily(code: string): StoredOrder[] {
  return readOrders()
    .filter((o) => o.familyCode === code.toUpperCase())
    .sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
}

export function addOrder(
  order: Omit<StoredOrder, "id" | "orderedAt" | "status">
): StoredOrder {
  const orders = readOrders();
  const newOrder: StoredOrder = {
    ...order,
    id: Math.random().toString(36).slice(2, 10).toUpperCase(),
    orderedAt: new Date().toISOString(),
    status: "processing",
  };
  orders.push(newOrder);
  writeOrders(orders);
  return newOrder;
}
