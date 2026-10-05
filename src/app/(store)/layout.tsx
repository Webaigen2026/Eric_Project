import { AgeGate } from "@/components/AgeGate";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { StoreFooter } from "@/components/StoreFooter";
import { StoreHeader } from "@/components/StoreHeader";
import { prisma } from "@/lib/prisma";
import { expireReservations } from "@/lib/stock";

export const dynamic = "force-dynamic";

async function getSettings() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  });
  return (
    settings ?? {
      storeName: "Da liquor-store",
      tagline: "Fine spirits, local pickup",
      address: "69 Drug Runner Ave Gotham",
      phone: "420-697-6969",
      hours: "Mon–Thu 10am–9pm\nFri–Sat 10am–11pm\nSun 12pm–7pm",
      announcementBanner: "",
    }
  );
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await expireReservations();
  const settings = await getSettings();

  return (
    <AuthProvider>
      <AgeGate>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <StoreHeader
              storeName={settings.storeName}
              announcement={settings.announcementBanner || undefined}
            />
            <main className="flex-1">{children}</main>
            <StoreFooter
              storeName={settings.storeName}
              address={settings.address}
              phone={settings.phone}
              hours={settings.hours}
            />
          </div>
        </CartProvider>
      </AgeGate>
    </AuthProvider>
  );
}
