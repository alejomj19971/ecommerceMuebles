type SectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={className ?? "mb-8 text-center"}>
      <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#666] sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
