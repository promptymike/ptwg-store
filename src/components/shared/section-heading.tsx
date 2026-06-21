import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  badge: string;
  title: string;
  description: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
};

export function SectionHeading({
  badge,
  title,
  description,
  align = "left",
  as: HeadingTag = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
      )}
    >
      <span className="eyebrow">{badge}</span>
      <div className="space-y-4">
        <HeadingTag className="text-balance break-words font-heading text-[2.7rem] font-semibold leading-[0.95] tracking-[-0.035em] text-foreground sm:text-6xl">
          {title}
        </HeadingTag>
        <p className="max-w-2xl text-pretty break-words text-base leading-7 text-muted-foreground sm:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
