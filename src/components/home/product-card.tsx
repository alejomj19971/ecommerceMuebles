import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  slug: string;
  name: string;
  price: string;
  image: string;
  tag: string;
};

export function ProductCard({ slug, name, price, image, tag }: ProductCardProps) {
  return (
    <Link href={`/productos/${slug}`} className="block">
      <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5">
        <div className="relative mb-4 h-40 overflow-hidden rounded-xl sm:h-44">
          <Image src={image} alt={name} fill className="object-cover" />
        </div>
        <p className="inline-block rounded-full bg-[#efefef] px-3 py-1 text-xs">
          {tag}
        </p>
        <h3 className="mt-3 text-sm font-medium sm:text-base">{name}</h3>
        <p className="mt-1 text-base font-semibold sm:text-lg">{price}</p>
      </article>
    </Link>
  );
}
