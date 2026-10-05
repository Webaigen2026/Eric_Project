import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const image = await prisma.storedImage.findUnique({
    where: { id },
    select: { contentType: true, data: true },
  });

  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(Buffer.from(image.data), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
