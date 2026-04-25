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
      <div className="space-y-3">
        <HeadingTag className="text-balance break-words text-4xl text-foreground sm:text-5xl">
          {title}
        </HeadingTag>
        <p className="text-pretty break-words text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
