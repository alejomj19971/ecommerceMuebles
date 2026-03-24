import { Instagram } from "lucide-react";

const INSTAGRAM_URL =
  "https://www.instagram.com/galeriadeluxmedellin?igsh=a2gzMzBmZGd2dDV6";

export function InstagramSticky() {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Abrir Instagram de Galeria Deluxe Medellin"
      title="Síguenos en Instagram"
      className="fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e1306c] text-white shadow-lg ring-1 ring-black/15 transition hover:scale-105"
    >
      <Instagram size={22} />
    </a>
  );
}
