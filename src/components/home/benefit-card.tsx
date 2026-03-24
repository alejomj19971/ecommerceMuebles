type BenefitCardProps = {
  title: string;
  text: string;
};

export function BenefitCard({ title, text }: BenefitCardProps) {
  return (
    <article className="rounded-2xl bg-[#f6f5f3] p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[#666]">{text}</p>
    </article>
  );
}
