import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cx } from "./utils";

type DivProps = ComponentPropsWithoutRef<"div">;
type SectionProps = ComponentPropsWithoutRef<"section">;

export function PageShell({ className, ...props }: DivProps) {
  return (
    <main
      className={cx(
        "min-h-svh bg-[var(--ilt-bg-page)] text-[var(--ilt-text-primary)]",
        className,
      )}
      {...props}
    />
  );
}

export function ToolHero({
  display,
  controls,
  settings,
  title,
  description,
  meta,
  className,
}: {
  display: ReactNode;
  controls?: ReactNode;
  settings?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("w-full px-[var(--ilt-page-x)] py-4 sm:py-6", className)}>
      <div className="mx-auto flex w-full max-w-[112rem] flex-col gap-5">
        {display}
        {controls ? <ControlRail>{controls}</ControlRail> : null}
        {settings ? <div className="mx-auto w-full max-w-5xl">{settings}</div> : null}
        {title || description || meta ? (
          <div className="mx-auto w-full max-w-5xl pt-2">
            {meta ? <div className="mb-2 text-sm text-[var(--ilt-text-muted)]">{meta}</div> : null}
            {title ? (
              <h1 className="text-2xl font-bold tracking-tight text-[var(--ilt-text-primary)] sm:text-3xl">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ilt-text-secondary)] sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function DisplayStage({ className, ...props }: SectionProps) {
  return (
    <section
      className={cx(
        "flex min-h-[clamp(16rem,34svh,34rem)] w-full items-center justify-center bg-[var(--ilt-bg-utility)] text-center",
        className,
      )}
      {...props}
    />
  );
}

export function ControlRail({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        "mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function SettingsPanel({ className, ...props }: SectionProps) {
  return (
    <section
      className={cx(
        "w-full bg-transparent text-[var(--ilt-text-primary)]",
        className,
      )}
      {...props}
    />
  );
}

export function SettingsDrawer({
  title = "Settings",
  children,
  className,
  defaultOpen = false,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className={cx("group w-full bg-transparent", className)}
      open={defaultOpen}
    >
      <summary className="ilt-focus-ring flex cursor-pointer list-none items-center justify-between gap-3 rounded-[var(--ilt-radius-control)] px-3 py-2 text-sm font-bold text-[var(--ilt-text-primary)] hover:bg-slate-100">
        <span>{title}</span>
        <span aria-hidden="true" className="text-xs text-[var(--ilt-text-muted)]">
          v
        </span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

export function SeoBand({
  title,
  children,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("w-full bg-[var(--ilt-bg-content)] py-10", className)}>
      <div className="px-[var(--ilt-page-x)]">
        <div className="ilt-seo-prose">
          {title ? (
            <h2 className="text-2xl font-bold tracking-tight text-[var(--ilt-text-primary)]">
              {title}
            </h2>
          ) : null}
          <div className={cx(title ? "mt-4" : "", "space-y-4 leading-7 text-[var(--ilt-text-secondary)]")}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--ilt-accent)] text-black hover:bg-[var(--ilt-accent-hover)] hover:text-white",
  secondary:
    "bg-white text-[var(--ilt-text-primary)] shadow-[var(--ilt-shadow-interactive)] hover:bg-slate-50 hover:shadow-[var(--ilt-shadow-interactive-hover)]",
  ghost:
    "bg-transparent text-[var(--ilt-text-primary)] hover:bg-slate-100",
  danger:
    "bg-slate-950 text-white hover:bg-black",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "ilt-focus-ring inline-flex cursor-pointer items-center justify-center rounded-[var(--ilt-radius-control)] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({
  label,
  className,
  children,
  ...props
}: ButtonProps & {
  label: string;
  children: ReactNode;
}) {
  return (
    <Button
      aria-label={label}
      className={cx("aspect-square px-0", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function Toggle({
  label,
  description,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  description?: ReactNode;
}) {
  return (
    <label
      className={cx(
        "ilt-focus-ring inline-flex cursor-pointer items-center gap-2 rounded-[var(--ilt-radius-control)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] shadow-[var(--ilt-shadow-interactive)] hover:bg-slate-50",
        className,
      )}
    >
      <input
        type="checkbox"
        className="h-4 w-4 accent-[var(--ilt-accent)]"
        {...props}
      />
      <span>{label}</span>
      {description ? (
        <span className="font-normal text-[var(--ilt-text-muted)]">
          {description}
        </span>
      ) : null}
    </label>
  );
}

export function PresetChip({
  selected = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      className={cx(
        "ilt-focus-ring inline-flex cursor-pointer items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold transition",
        selected
          ? "bg-[var(--ilt-text-primary)] text-white"
          : "bg-white text-[var(--ilt-text-primary)] shadow-[var(--ilt-shadow-interactive)] hover:bg-slate-50",
        className,
      )}
      aria-pressed={selected}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}) {
  return (
    <label className={cx("block text-sm font-semibold text-[var(--ilt-text-primary)]", className)}>
      <span>{label}</span>
      <input
        id={id}
        className="ilt-focus-ring mt-1 min-h-11 w-full rounded-[var(--ilt-radius-control)] bg-white px-3 py-2 text-[var(--ilt-text-primary)] shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] transition hover:bg-slate-50"
        {...props}
      />
      {hint ? <span className="mt-1 block text-xs font-normal text-[var(--ilt-text-muted)]">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-semibold text-slate-950">{error}</span> : null}
    </label>
  );
}

export function Select({
  label,
  hint,
  id,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label className={cx("block text-sm font-semibold text-[var(--ilt-text-primary)]", className)}>
      <span>{label}</span>
      <select
        id={id}
        className="ilt-focus-ring mt-1 min-h-11 w-full cursor-pointer rounded-[var(--ilt-radius-control)] bg-white px-3 py-2 text-[var(--ilt-text-primary)] shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] transition hover:bg-slate-50"
        {...props}
      >
        {children}
      </select>
      {hint ? <span className="mt-1 block text-xs font-normal text-[var(--ilt-text-muted)]">{hint}</span> : null}
    </label>
  );
}

export function StatusChip({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--ilt-text-secondary)]",
        className,
      )}
      {...props}
    />
  );
}

export function ContentPage({
  title,
  description,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cx("bg-[var(--ilt-bg-page)] px-[var(--ilt-page-x)] py-8 text-[var(--ilt-text-primary)]", className)}>
      <div className="mx-auto max-w-5xl">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-3xl leading-7 text-[var(--ilt-text-secondary)]">
              {description}
            </p>
          ) : null}
        </header>
        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </main>
  );
}
