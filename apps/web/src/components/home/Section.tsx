export default function Section({
  id,
  kicker,
  title,
  lead,
  band = false,
  children,
}: {
  id: string;
  kicker: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  band?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-20 py-20 sm:py-28 ${band ? "bg-muted/40" : ""}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center font-mono text-xs font-medium uppercase text-primary">
          // {kicker}
        </p>
        <h2
          id={`${id}-title`}
          className="mx-auto mt-3 max-w-3xl text-center font-lora text-3xl leading-tight sm:text-4xl"
        >
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {lead}
        </p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
