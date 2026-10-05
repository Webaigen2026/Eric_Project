import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function storeLocalImage(imageUrl?: string | null) {
  if (!imageUrl?.startsWith("/uploads/")) return imageUrl ?? null;
  const filePath = path.join(process.cwd(), "public", imageUrl);
  if (!fs.existsSync(filePath)) return null;
  const image = await prisma.storedImage.create({
    data: {
      contentType: "image/png",
      data: fs.readFileSync(filePath),
    },
  });
  return `/api/images/${image.id}`;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const products: Array<{
  name: string;
  description: string;
  category: string;
  priceCents: number;
  stockOnHand: number;
  imageUrl?: string;
}> = [
  {
    name: "Harbor IPA 6-Pack",
    description: "Citrus-forward craft IPA, locally canned. Crisp finish.",
    category: "Beer",
    priceCents: 1299,
    stockOnHand: 48,
    imageUrl: "/uploads/harbor-ipa-6-pack.png",
  },
  {
    name: "Riverton Lager 12-Pack",
    description: "Clean golden lager. Easy drinking for any night in.",
    category: "Beer",
    priceCents: 1599,
    stockOnHand: 36,
    imageUrl: "/uploads/riverton-lager-12-pack.png",
  },
  {
    name: "Coastal Pinot Noir",
    description: "Bright red fruit, soft tannins. Pair with dinner or a quiet evening.",
    category: "Wine",
    priceCents: 1899,
    stockOnHand: 24,
    imageUrl: "/uploads/coastal-pinot-noir.png",
  },
  {
    name: "Ember Rosé",
    description: "Dry Provençal-style rosé. Strawberry and mineral notes.",
    category: "Wine",
    priceCents: 1499,
    stockOnHand: 30,
    imageUrl: "/uploads/ember-ros.png",
  },
  {
    name: "Oak Barrel Bourbon",
    description: "Small-batch bourbon aged in charred oak. Vanilla and caramel.",
    category: "Spirits",
    priceCents: 4299,
    stockOnHand: 18,
  },
  {
    name: "North Shore Gin",
    description: "Botanical gin with juniper, citrus peel, and a clean finish.",
    category: "Spirits",
    priceCents: 3299,
    stockOnHand: 22,
  },
  {
    name: "Silver Agave Tequila",
    description: "100% agave blanco. Bright and peppery — perfect for margaritas.",
    category: "Spirits",
    priceCents: 3699,
    stockOnHand: 16,
  },
  {
    name: "Hennesy_Black",
    description: "Strongest Hennesy there is got that good sugar and whatnot",
    category: "Mixers",
    priceCents: 2999,
    stockOnHand: 32,
    imageUrl: "/uploads/hennesy-black.png",
  },
  {
    name: "Tonic Water 4-Pack",
    description: "Classic Indian tonic. Ideal mixer for gin and vodka.",
    category: "Mixers",
    priceCents: 699,
    stockOnHand: 60,
  },
  {
    name: "Ginger Beer 6-Pack",
    description: "Spicy ginger beer for highballs and dark & stormies.",
    category: "Mixers",
    priceCents: 999,
    stockOnHand: 40,
    imageUrl: "/uploads/ginger-beer-6-pack.png",
  },
  {
    name: "Bar Spoon Set",
    description: "Stainless bar spoons for stirring and layering.",
    category: "Other",
    priceCents: 1299,
    stockOnHand: 12,
    imageUrl: "/uploads/bar-spoon-set.png",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  await prisma.adminUser.upsert({
    where: { email: "admin@goku.example" },
    update: { passwordHash },
    create: {
      email: "admin@goku.example",
      passwordHash,
      name: "Store Owner",
    },
  });

  const customerHash = await bcrypt.hash("customer123", 10);
  await prisma.customer.upsert({
    where: { email: "customer@example.com" },
    update: {
      passwordHash: customerHash,
      name: "Alex Rivera",
      phone: "(555) 201-3344",
      emailVerified: true,
      otpHash: null,
      otpExpiresAt: null,
    },
    create: {
      email: "customer@example.com",
      passwordHash: customerHash,
      name: "Alex Rivera",
      phone: "(555) 201-3344",
      emailVerified: true,
    },
  });

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "Da liquor-store",
      tagline: "Fine spirits, local pickup",
      address: "69 Drug Runner Ave Gotham",
      phone: "420-697-6969",
      email: "hello@emberandoak.example",
      hours: "Mon–Thu 10am–9pm\nFri–Sat 10am–11pm\nSun 12pm–7pm",
      announcementBanner: "Hold online, pick up same day — pay at the counter.",
    },
  });

  for (const p of products) {
    const slug = slugify(p.name);
    const imageUrl = await storeLocalImage(p.imageUrl);
    await prisma.product.upsert({
      where: { slug },
      update: {
        name: p.name,
        description: p.description,
        category: p.category,
        priceCents: p.priceCents,
        stockOnHand: p.stockOnHand,
        ...(imageUrl ? { imageUrl } : {}),
        isActive: true,
      },
      create: {
        name: p.name,
        slug,
        description: p.description,
        category: p.category,
        priceCents: p.priceCents,
        stockOnHand: p.stockOnHand,
        imageUrl,
        isActive: true,
      },
    });
  }

  console.log("Seeded admin (admin@goku.example / 123456)");
  console.log("Seeded customer (customer@example.com / customer123)");
  console.log("Seeded settings and products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
