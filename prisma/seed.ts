import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function sku(prefix: string, num: number): string {
  return `${prefix}-${String(num).padStart(3, "0")}`;
}

async function main() {
  let user = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  if (!user) {
    const hashedPassword = await bcrypt.hash("demo123456", 12);
    user = await prisma.user.create({
      data: {
        name: "Demo Admin",
        email: "demo@invenai.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Created demo admin: demo@invenai.com / demo123456");
  } else {
    console.log("Using existing admin user:", user.email);
  }

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Electronics" },
      update: {},
      create: {
        name: "Electronics",
        description: "Electronic devices and accessories",
      },
    }),
    prisma.category.upsert({
      where: { name: "Office Supplies" },
      update: {},
      create: {
        name: "Office Supplies",
        description: "Stationery and office equipment",
      },
    }),
    prisma.category.upsert({
      where: { name: "Furniture" },
      update: {},
      create: {
        name: "Furniture",
        description: "Desks, chairs, and storage",
      },
    }),
    prisma.category.upsert({
      where: { name: "Kitchen" },
      update: {},
      create: {
        name: "Kitchen",
        description: "Kitchen equipment and supplies",
      },
    }),
    prisma.category.upsert({
      where: { name: "Cleaning" },
      update: {},
      create: {
        name: "Cleaning",
        description: "Cleaning and hygiene products",
      },
    }),
  ]);

  const items = [
    {
      name: "Wireless Mouse",
      sku: sku("ELEC", 1),
      description: "Ergonomic wireless mouse with USB receiver",
      quantity: 45,
      minStock: 15,
      costPrice: 12.5,
      sellingPrice: 24.99,
      supplier: "TechSupply Inc",
      location: "Shelf A1",
      status: "IN_STOCK" as const,
      category: categories[0],
    },
    {
      name: "USB-C Hub",
      sku: sku("ELEC", 2),
      description: "7-in-1 USB-C hub with HDMI and card reader",
      quantity: 8,
      minStock: 10,
      costPrice: 35,
      sellingPrice: 59.99,
      supplier: "TechSupply Inc",
      location: "Shelf A2",
      status: "LOW_STOCK" as const,
      category: categories[0],
    },
    {
      name: "LED Monitor 24\"",
      sku: sku("ELEC", 3),
      description: "24-inch Full HD IPS monitor",
      quantity: 12,
      minStock: 5,
      costPrice: 120,
      sellingPrice: 189.99,
      supplier: "DisplayPro",
      location: "Warehouse B",
      status: "IN_STOCK" as const,
      category: categories[0],
    },
    {
      name: "Keyboard (Mechanical)",
      sku: sku("ELEC", 4),
      description: "RGB mechanical keyboard",
      quantity: 0,
      minStock: 10,
      costPrice: 45,
      sellingPrice: 79.99,
      supplier: "TechSupply Inc",
      location: "Shelf A3",
      status: "DISCONTINUED" as const,
      category: categories[0],
    },
    {
      name: "Laptop Stand",
      sku: sku("ELEC", 5),
      description: "Aluminum laptop stand, adjustable",
      quantity: 3,
      minStock: 15,
      costPrice: 22,
      sellingPrice: 39.99,
      supplier: "OfficeGear",
      location: "Shelf A4",
      status: "ORDERED" as const,
      category: categories[0],
    },
    {
      name: "A4 Copy Paper (Ream)",
      sku: sku("OFF", 1),
      description: "500 sheets, 80gsm white paper",
      quantity: 120,
      minStock: 20,
      costPrice: 3.5,
      sellingPrice: 6.99,
      supplier: "PaperDirect",
      location: "Storage Room",
      status: "IN_STOCK" as const,
      category: categories[1],
    },
    {
      name: "Stapler",
      sku: sku("OFF", 2),
      description: "Heavy-duty metal stapler",
      quantity: 5,
      minStock: 10,
      costPrice: 4,
      sellingPrice: 8.99,
      supplier: "OfficeGear",
      location: "Desk Supplies",
      status: "LOW_STOCK" as const,
      category: categories[1],
    },
    {
      name: "Ballpoint Pens (Pack of 12)",
      sku: sku("OFF", 3),
      description: "Blue ink, medium point",
      quantity: 85,
      minStock: 30,
      costPrice: 2.5,
      sellingPrice: 4.99,
      supplier: "OfficeGear",
      location: "Desk Supplies",
      status: "IN_STOCK" as const,
      category: categories[1],
    },
    {
      name: "Desk Organizer",
      sku: sku("OFF", 4),
      description: "Multi-compartment desk organizer",
      quantity: 18,
      minStock: 8,
      costPrice: 8,
      sellingPrice: 16.99,
      supplier: "OfficeGear",
      location: "Shelf C1",
      status: "IN_STOCK" as const,
      category: categories[1],
    },
    {
      name: "Office Chair",
      sku: sku("FUR", 1),
      description: "Ergonomic office chair with lumbar support",
      quantity: 7,
      minStock: 5,
      costPrice: 180,
      sellingPrice: 299.99,
      supplier: "FurnitureWorld",
      location: "Showroom",
      status: "IN_STOCK" as const,
      category: categories[2],
    },
    {
      name: "Standing Desk",
      sku: sku("FUR", 2),
      description: "Electric height-adjustable desk",
      quantity: 2,
      minStock: 3,
      costPrice: 350,
      sellingPrice: 549.99,
      supplier: "FurnitureWorld",
      location: "Warehouse A",
      status: "LOW_STOCK" as const,
      category: categories[2],
    },
    {
      name: "Filing Cabinet",
      sku: sku("FUR", 3),
      description: "2-drawer metal filing cabinet",
      quantity: 15,
      minStock: 5,
      costPrice: 95,
      sellingPrice: 149.99,
      supplier: "FurnitureWorld",
      location: "Warehouse B",
      status: "IN_STOCK" as const,
      category: categories[2],
    },
    {
      name: "Coffee Maker",
      sku: sku("KIT", 1),
      description: "12-cup drip coffee maker",
      quantity: 10,
      minStock: 5,
      costPrice: 35,
      sellingPrice: 59.99,
      supplier: "KitchenPro",
      location: "Break Room",
      status: "IN_STOCK" as const,
      category: categories[3],
    },
    {
      name: "Paper Towels (6-pack)",
      sku: sku("KIT", 2),
      description: "Absorbent paper towel rolls",
      quantity: 4,
      minStock: 12,
      costPrice: 8,
      sellingPrice: 14.99,
      supplier: "KitchenPro",
      location: "Storage",
      status: "LOW_STOCK" as const,
      category: categories[3],
    },
    {
      name: "Hand Soap Refill",
      sku: sku("CLE", 1),
      description: "Antibacterial hand soap, 1L",
      quantity: 25,
      minStock: 10,
      costPrice: 3,
      sellingPrice: 5.99,
      supplier: "CleanSupply",
      location: "Supply Closet",
      status: "IN_STOCK" as const,
      category: categories[4],
    },
    {
      name: "Disinfectant Spray",
      sku: sku("CLE", 2),
      description: "Multi-surface disinfectant",
      quantity: 6,
      minStock: 15,
      costPrice: 4.5,
      sellingPrice: 8.99,
      supplier: "CleanSupply",
      location: "Supply Closet",
      status: "LOW_STOCK" as const,
      category: categories[4],
    },
  ];

  for (const item of items) {
    await prisma.inventoryItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: {
        name: item.name,
        sku: item.sku,
        description: item.description,
        quantity: item.quantity,
        minStock: item.minStock,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        supplier: item.supplier,
        location: item.location,
        status: item.status,
        categoryId: item.category.id,
        createdById: user.id,
      },
    });
  }

  await prisma.activityLog.createMany({
    data: [
      {
        userId: user.id,
        action: "created",
        entityType: "category",
        details: "Seeded Electronics category",
      },
      {
        userId: user.id,
        action: "created",
        entityType: "inventory item",
        details: "Seeded 16 dummy inventory items",
      },
    ],
  });

  console.log("Seed completed successfully!");
  console.log("- 5 categories");
  console.log("- 16 inventory items (various statuses)");
  console.log("- Activity logs");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
