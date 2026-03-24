import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Debes adjuntar un archivo." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato no permitido. Usa JPG, PNG o WEBP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera 8MB." },
      { status: 400 }
    );
  }

  try {
    const uploaded = await uploadImageToCloudinary(file, "ecommerce-muebleria/productos");
    return NextResponse.json({ ok: true, secure_url: uploaded.secureUrl });
  } catch {
    return NextResponse.json(
      { error: "No se pudo subir la imagen a Cloudinary. Revisa la configuración." },
      { status: 500 }
    );
  }
}
