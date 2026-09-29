import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  });

  return (
    <SettingsForm
      initial={{
        storeName: settings?.storeName ?? "Da liquor-store",
        tagline: settings?.tagline ?? "",
        address: settings?.address ?? "",
        phone: settings?.phone ?? "",
        email: settings?.email ?? "",
        hours: settings?.hours ?? "",
        announcementBanner: settings?.announcementBanner ?? "",
      }}
    />
  );
}
