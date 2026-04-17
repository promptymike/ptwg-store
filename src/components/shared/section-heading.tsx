import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  badge: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  badge,
  title,
  description,
  align = "left",
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
        <h2 className="text-4xl text-white sm:text-5xl">{title}</h2>
        <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
    </div>
  );
}
