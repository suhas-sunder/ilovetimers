import { Children, cloneElement, isValidElement } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  InputHTMLAttributes,
  Ref,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { useLocation } from "react-router";
import { getRouteMonetization } from "~/clients/config/monetization";
import { cx } from "./utils";

type DivProps = ComponentPropsWithoutRef<"div">;
type SectionProps = ComponentPropsWithoutRef<"section">;
type ToolFrameProps = DivProps & {
  cardRef?: Ref<HTMLDivElement>;
  frameRef?: Ref<HTMLDivElement>;
  isFullscreen?: boolean;
};
type DisplayStageProps = SectionProps & {
  stageRef?: Ref<HTMLElement>;
  isFullscreen?: boolean;
};

export function PageShell({ className, children, ...props }: DivProps) {
  return (
    <main
      className={cx(
        "min-h-svh bg-[var(--ilt-bg-page)] text-[var(--ilt-text-primary)]",
        className,
      )}
      {...props}
    >
      {children}
      <ToolAdSlot slot="bottom-banner" className="pt-8 pb-10 sm:pt-10 sm:pb-12" />
    </main>
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
    <section className={cx("w-full px-[var(--ilt-page-x)] pb-4 pt-1 sm:pb-6 sm:pt-1", className)}>
      <div className="ilt-tool-hero mx-auto flex w-full max-w-[112rem] flex-col gap-5">
        {display}
        {controls ? <ControlRail>{controls}</ControlRail> : null}
        {settings ? <div className="ilt-settings-width mx-auto w-full">{settings}</div> : null}
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
        <ToolAdSlot slot="top-banner" className="timer-mobile-heading-ad pt-3 pb-0 sm:hidden" />
      </div>
    </section>
  );
}

export function DisplayStage({
  stageRef,
  isFullscreen = false,
  className,
  ...props
}: DisplayStageProps) {
  return (
    <section
      ref={stageRef}
      data-display-stage
      data-fullscreen-stage={isFullscreen ? "true" : undefined}
      className={cx(
        "ilt-display-stage flex w-full items-center justify-center bg-[var(--ilt-bg-utility)] text-center",
        isFullscreen ? "h-full min-h-0" : "min-h-[clamp(16rem,34svh,34rem)]",
        className,
      )}
      {...props}
    />
  );
}

export function ToolFrame({
  cardRef,
  frameRef,
  isFullscreen = false,
  className,
  tabIndex = 0,
  ...props
}: ToolFrameProps) {
  return (
    <div
      ref={frameRef ?? cardRef}
      tabIndex={tabIndex}
      data-fullscreen-frame
      data-fullscreen-active={isFullscreen ? "true" : undefined}
      className={cx(
        "ilt-tool-frame relative w-full bg-[var(--ilt-bg-utility)] text-[var(--ilt-text-primary)] outline-none focus:outline-none focus-visible:outline-none",
        isFullscreen
          ? "h-screen w-screen overflow-hidden rounded-none p-0"
          : "min-h-full",
        className,
      )}
      {...props}
    />
  );
}

export function FullscreenTopBar({
  show,
  title,
  left,
  right,
  onExit,
}: {
  show: boolean;
  title: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  onExit: () => void;
}) {
  if (!show) return null;

  return (
    <div
      data-fullscreen-topbar
      className="absolute left-0 right-0 top-0 z-50 bg-[var(--ilt-bg-overlay)] px-2 py-2 shadow-[0_1px_8px_var(--ilt-border-subtle)] backdrop-blur sm:px-3"
    >
      <div className="mx-auto flex max-w-[112rem] items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <StatusChip>{title}</StatusChip>
          {left}
        </div>
        <div className="flex items-center gap-2">
          {right}
          <Button variant="secondary" size="sm" onClick={onExit}>
            Exit (Esc)
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FullscreenBottomBar({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
  if (!show) return null;

  return (
    <div
      data-fullscreen-bottombar
      className="absolute bottom-0 left-0 right-0 z-40 bg-[var(--ilt-bg-overlay)] px-2 py-2 shadow-[0_-1px_8px_var(--ilt-border-subtle)] backdrop-blur sm:px-3"
    >
      <div className="mx-auto max-w-[112rem]">{children}</div>
    </div>
  );
}

export function ControlRail({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        "ilt-settings-width mx-auto flex w-full flex-wrap items-center justify-center gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function ControlGroup({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        "timer-controls-row ilt-settings-width mx-auto flex w-full flex-wrap items-center justify-center gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function PresetGroup({
  title,
  description,
  className,
  children,
  ...props
}: DivProps & {
  title?: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div
      className={cx("timer-preset-group ilt-settings-width mx-auto w-full space-y-3", className)}
      {...props}
    >
      {title || description ? (
        <div className="text-center">
          {title ? (
            <div className="text-sm font-bold text-[var(--ilt-text-primary)]">
              {title}
            </div>
          ) : null}
          {description ? (
            <div className="ilt-helper-text mt-1">{description}</div>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {children}
      </div>
    </div>
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

export function SettingGroup({
  title,
  description,
  className,
  children,
  ...props
}: SectionProps & {
  title?: ReactNode;
  description?: ReactNode;
}) {
  return (
    <SettingsPanel
      className={cx("timer-settings-panel ilt-settings-width mx-auto w-full space-y-3", className)}
      {...props}
    >
      {title || description ? (
        <div className="text-center">
          {title ? (
            <h2 className="text-sm font-bold text-[var(--ilt-text-primary)]">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="ilt-helper-text mt-1">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </SettingsPanel>
  );
}

export function SettingRow({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        "ilt-setting-row grid w-full items-start gap-3 sm:gap-4",
        className,
      )}
      {...props}
    />
  );
}

export function SecondaryActionRow({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        "timer-secondary-actions ilt-settings-width mx-auto flex w-full flex-wrap items-center justify-center gap-2 pt-1 sm:gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function ShortcutHint({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        "timer-shortcut-hint ilt-helper-text ilt-settings-width mx-auto w-full pt-1 text-center text-xs leading-5",
        className,
      )}
      {...props}
    />
  );
}

export function UtilityResultRow({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        "flex flex-col gap-2 bg-[var(--ilt-bg-panel)] px-3 py-2 text-[var(--ilt-text-secondary)] sm:flex-row sm:items-center sm:justify-between",
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
      <summary className="ilt-focus-ring flex cursor-pointer list-none items-center justify-between gap-3 rounded-[var(--ilt-radius-control)] px-3 py-2 text-sm font-bold text-[var(--ilt-text-primary)] hover:bg-[var(--ilt-bg-hover)]">
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
  const contentChildren = Children.toArray(children);

  return (
    <section className={cx("w-full bg-[var(--ilt-bg-content)] py-10", className)}>
      <div className="mx-auto w-full max-w-[var(--ilt-seo-band-max)] px-[var(--ilt-page-x)]">
        <div className="ilt-seo-prose">
          {title ? (
            <h2 className="text-2xl font-bold tracking-tight text-[var(--ilt-text-primary)]">
              {title}
            </h2>
          ) : null}
          <div className={cx(title ? "mt-4" : "", "space-y-4 leading-7 text-[var(--ilt-text-secondary)]")}>
            {contentChildren.length > 0 ? (
              <>
                {contentChildren[0]}
                <ToolAdSlot slot="in-content-square" className="py-4 sm:py-6" />
                {contentChildren.slice(1)}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonKind = "solid" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
type ButtonIconOptions = {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  kind?: ButtonKind;
  size?: ButtonSize;
} & ButtonIconOptions;
type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  kind?: ButtonKind;
  size?: ButtonSize;
} & ButtonIconOptions;
export type AdSlotType = "top-banner" | "in-content-square" | "bottom-banner";
type AdPlaceholderVariant = "banner" | "horizontal" | "square" | "vertical";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--ilt-accent)] text-[var(--ilt-button-primary-text)] hover:bg-[var(--ilt-accent-hover)] hover:text-[var(--ilt-button-primary-text-hover)]",
  secondary:
    "bg-[var(--ilt-button-secondary-bg)] text-[var(--ilt-text-primary)] shadow-[var(--ilt-shadow-interactive)] hover:bg-[var(--ilt-button-secondary-hover)] hover:shadow-[var(--ilt-shadow-interactive-hover)]",
  ghost:
    "bg-transparent text-[var(--ilt-text-primary)] hover:bg-[var(--ilt-bg-hover)]",
  danger:
    "bg-[var(--ilt-button-danger-bg)] text-[var(--ilt-button-danger-text)] hover:bg-[var(--ilt-button-danger-hover)]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

type IconElementProps = {
  className?: string;
  size?: number | string;
  title?: string;
  "aria-hidden"?: boolean | "true" | "false";
  focusable?: boolean | "true" | "false";
};

function renderButtonIcon(icon: ReactNode, size: ButtonSize) {
  if (!icon) return null;
  const iconSize = size === "lg" ? 18 : 16;
  if (!isValidElement<IconElementProps>(icon)) return icon;

  return cloneElement(icon, {
    size: iconSize,
    title: undefined,
    "aria-hidden": true,
    focusable: "false",
    className: cx("shrink-0", icon.props.className),
  });
}

export function Button({
  variant = "secondary",
  kind,
  size = "md",
  className,
  children,
  leadingIcon,
  trailingIcon,
  type = "button",
  ...props
}: ButtonProps) {
  const resolvedVariant =
    variant === "secondary" && kind
      ? kind === "solid"
        ? "primary"
        : kind === "danger"
          ? "danger"
        : "secondary"
      : variant;
  const hasIcon = Boolean(leadingIcon || trailingIcon);

  return (
    <button
      type={type}
      className={cx(
        "ilt-focus-ring inline-flex cursor-pointer items-center justify-center rounded-[var(--ilt-radius-control)] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[resolvedVariant],
        buttonSizes[size],
        hasIcon ? "gap-2" : "",
        className,
      )}
      {...props}
    >
      {renderButtonIcon(leadingIcon, size)}
      {children}
      {renderButtonIcon(trailingIcon, size)}
    </button>
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

export function ButtonLink({
  variant = "secondary",
  kind,
  size = "md",
  className,
  children,
  leadingIcon,
  trailingIcon,
  ...props
}: ButtonLinkProps) {
  const resolvedVariant =
    variant === "secondary" && kind
      ? kind === "solid"
        ? "primary"
        : kind === "danger"
          ? "danger"
        : "secondary"
      : variant;
  const hasIcon = Boolean(leadingIcon || trailingIcon);

  return (
    <a
      className={cx(
        "ilt-focus-ring inline-flex cursor-pointer items-center justify-center rounded-[var(--ilt-radius-control)] font-semibold transition",
        buttonVariants[resolvedVariant],
        buttonSizes[size],
        hasIcon ? "gap-2" : "",
        className,
      )}
      {...props}
    >
      {renderButtonIcon(leadingIcon, size)}
      {children}
      {renderButtonIcon(trailingIcon, size)}
    </a>
  );
}

export function Toggle({
  label,
  description,
  className,
  onChange,
  onCheckedChange,
  disabled,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  description?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <label
      className={cx(
        "ilt-focus-ring inline-flex min-w-0 items-center gap-2 rounded-[var(--ilt-radius-control)] bg-[var(--ilt-button-secondary-bg)] px-3 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] shadow-[var(--ilt-shadow-interactive)] hover:bg-[var(--ilt-button-secondary-hover)]",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      )}
    >
      <input
        type="checkbox"
        className="h-4 w-4 accent-[var(--ilt-accent)]"
        disabled={disabled}
        onChange={(event) => {
          onChange?.(event);
          onCheckedChange?.(event.currentTarget.checked);
        }}
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
  active,
  selected = false,
  className,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  selected?: boolean;
}) {
  const isSelected = selected || !!active;

  return (
    <button
      type="button"
      className={cx(
        "ilt-focus-ring inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold transition",
        isSelected
          ? "bg-[var(--ilt-selected-bg)] text-[var(--ilt-selected-text)]"
          : cx(
              "bg-[var(--ilt-button-secondary-bg)] text-[var(--ilt-text-primary)] shadow-[var(--ilt-shadow-interactive)]",
              disabled ? "" : "hover:bg-[var(--ilt-button-secondary-hover)]",
            ),
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      )}
      aria-pressed={isSelected}
      disabled={disabled}
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
    <label className={cx("block min-w-0 text-sm font-semibold text-[var(--ilt-text-primary)]", className)}>
      <span>{label}</span>
      <input
        id={id}
        className="ilt-focus-ring mt-1 min-h-11 w-full min-w-0 rounded-[var(--ilt-radius-control)] bg-[var(--ilt-bg-input)] px-3 py-2 text-[var(--ilt-text-primary)] shadow-[inset_0_0_0_1px_var(--ilt-border-subtle)] transition hover:bg-[var(--ilt-bg-hover)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--ilt-bg-input)]"
        {...props}
      />
      {hint ? <span className="mt-1 block text-xs font-normal text-[var(--ilt-text-muted)]">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-semibold text-[var(--ilt-text-primary)]">{error}</span> : null}
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
    <label className={cx("block min-w-0 text-sm font-semibold text-[var(--ilt-text-primary)]", className)}>
      <span>{label}</span>
      <select
        id={id}
        className="ilt-focus-ring mt-1 min-h-11 w-full min-w-0 cursor-pointer rounded-[var(--ilt-radius-control)] bg-[var(--ilt-bg-input)] px-3 py-2 text-[var(--ilt-text-primary)] shadow-[inset_0_0_0_1px_var(--ilt-border-subtle)] transition hover:bg-[var(--ilt-bg-hover)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--ilt-bg-input)]"
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
        "inline-flex items-center rounded-full bg-[var(--ilt-status-bg)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--ilt-text-secondary)]",
        className,
      )}
      {...props}
    />
  );
}

export function ContentPage({
  title,
  description,
  meta,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cx("min-h-svh bg-[var(--ilt-bg-page)] px-[var(--ilt-page-x)] py-8 text-[var(--ilt-text-primary)]", className)}>
      <div className="mx-auto max-w-5xl">
        <header>
          {meta ? (
            <div className="mb-3 text-sm text-[var(--ilt-text-muted)]">
              {meta}
            </div>
          ) : null}
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

export function ContentSection({
  title,
  children,
  className,
  ...props
}: SectionProps & {
  title?: ReactNode;
}) {
  return (
    <section
      className={cx(
        "scroll-mt-6 py-2",
        className,
      )}
      {...props}
    >
      {title ? (
        <h2 className="text-xl font-bold tracking-tight text-[var(--ilt-text-primary)] sm:text-2xl">
          {title}
        </h2>
      ) : null}
      <div
        className={cx(
          title ? "mt-3" : "",
          "space-y-3 leading-7 text-[var(--ilt-text-secondary)]",
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function ContentPanel({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        "text-[var(--ilt-text-secondary)]",
        className,
      )}
      {...props}
    />
  );
}

export function AdPlaceholder({
  slot,
  variant,
  label = "Advertisement",
  className,
}: {
  slot?: AdSlotType;
  variant?: AdPlaceholderVariant;
  label?: ReactNode;
  className?: string;
}) {
  const resolvedSlot =
    slot ?? (variant === "square" ? "in-content-square" : "bottom-banner");

  const slotClass =
    resolvedSlot === "in-content-square"
      ? "h-[250px] w-[min(100%,300px)]"
      : "h-[50px] w-[min(100%,320px)] sm:h-[60px] sm:w-[min(100%,468px)] lg:h-[90px] lg:w-[728px]";

  const legacyVerticalClass =
    variant === "vertical"
      ? "h-[250px] w-[min(100%,300px)] sm:h-[600px] sm:w-[160px] lg:w-[300px]"
      : "";

  return (
    <aside
      aria-label="Advertisement"
      data-ad-placeholder
      data-ad-slot={resolvedSlot}
      className={cx(
        "mx-auto flex items-center justify-center rounded-[2px] border border-[color:var(--ilt-ad-border)] bg-[var(--ilt-ad-bg)] px-3 text-center text-xs font-medium normal-case text-[var(--ilt-text-muted)]",
        legacyVerticalClass || slotClass,
        className,
      )}
    >
      <span>{label}</span>
    </aside>
  );
}

export function ToolAdSlot({
  slot,
  className,
}: {
  slot: AdSlotType;
  className?: string;
}) {
  const location = useLocation();
  const monetization = getRouteMonetization(location.pathname);
  const isAllowed =
    monetization?.eligibility === "eligible-tool-page" &&
    monetization.allowedSlots.includes(slot);

  if (!isAllowed) return null;

  return (
    <div
      data-tool-ad-slot-wrapper
      data-tool-ad-slot={slot}
      className={cx("no-print w-full px-[var(--ilt-page-x)]", className)}
    >
      <AdPlaceholder slot={slot} />
    </div>
  );
}
