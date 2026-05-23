import * as React from "react";

type SvgIconProps = Omit<React.SVGProps<SVGSVGElement>, "width" | "height"> & {
  /** Pixel size for both width + height */
  size?: number | string;
  /** Accessible title (recommended). Also helpful for indexing when SVG is inlined in HTML. */
  title?: string;
  /** Optional longer description for screen readers */
  desc?: string;
};

/**
 * Shared SVG wrapper that:
 * - Lets you control size via `size`
 * - Uses `currentColor` by default so CSS `color` controls fill
 * - Adds <title>/<desc> and aria-labelledby for accessibility (and better inline semantics)
 */
function SvgIconBase({
  size = 24,
  title,
  desc,
  children,
  fill,
  ...rest
}: SvgIconProps & { children: React.ReactNode }) {
  const titleId = React.useId();
  const descId = React.useId();
  const labelledBy =
    title && desc ? `${titleId} ${descId}` : title ? titleId : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      focusable="false"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-labelledby={labelledBy}
      xmlns="http://www.w3.org/2000/svg"
      fill={fill ?? "currentColor"}
      {...rest}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {desc ? <desc id={descId}>{desc}</desc> : null}
      {children}
    </svg>
  );
}

export const BrushIcon = React.memo(function BrushIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Brush" {...props}>
      <path d="M7 16c.55 0 1 .45 1 1 0 1.1-.9 2-2 2-.17 0-.33-.02-.5-.05.31-.55.5-1.21.5-1.95 0-.55.45-1 1-1M18.67 3c-.26 0-.51.1-.71.29L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41l-1.34-1.34c-.2-.2-.45-.29-.7-.29M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3" />
    </SvgIconBase>
  );
});

export const CakeIcon = React.memo(function CakeIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Cake" {...props}>
      <path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2m6 3h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v9c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-9c0-1.66-1.34-3-3-3m1 11H5v-3c.9-.01 1.76-.37 2.4-1.01l1.09-1.07 1.07 1.07c1.31 1.31 3.59 1.3 4.89 0l1.08-1.07 1.07 1.07c.64.64 1.5 1 2.4 1.01zm0-4.5c-.51-.01-.99-.2-1.35-.57l-2.13-2.13-2.14 2.13c-.74.74-2.03.74-2.77 0L8.48 12.8l-2.14 2.13c-.35.36-.83.56-1.34.57V12c0-.55.45-1 1-1h12c.55 0 1 .45 1 1z" />
    </SvgIconBase>
  );
});

export const CalendarIcon = React.memo(function CalendarIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Calendar" {...props}>
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V10h14zm0-12H5V6h14zM9 14H7v-2h2zm4 0h-2v-2h2zm4 0h-2v-2h2zm-8 4H7v-2h2zm4 0h-2v-2h2zm4 0h-2v-2h2z" />
    </SvgIconBase>
  );
});

export const CelebrationIcon = React.memo(function CelebrationIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Celebration" {...props}>
      <path d="m2 22 14-5-9-9zm10.35-5.82L5.3 18.7l2.52-7.05zm2.18-3.65 5.59-5.59c.49-.49 1.28-.49 1.77 0l.59.59 1.06-1.06-.59-.59c-1.07-1.07-2.82-1.07-3.89 0l-5.59 5.59zm-4.47-5.65-.59.59 1.06 1.06.59-.59c1.07-1.07 1.07-2.82 0-3.89l-.59-.59-1.06 1.07.59.59c.48.48.48 1.28 0 1.76m7 5-1.59 1.59 1.06 1.06 1.59-1.59c.49-.49 1.28-.49 1.77 0l1.61 1.61 1.06-1.06-1.61-1.61c-1.08-1.07-2.82-1.07-3.89 0m-2-6-3.59 3.59 1.06 1.06 3.59-3.59c1.07-1.07 1.07-2.82 0-3.89l-1.59-1.59-1.06 1.06 1.59 1.59c.48.49.48 1.29 0 1.77" />
    </SvgIconBase>
  );
});

export const RadioTowerIcon = React.memo(function RadioTowerIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Radio tower" {...props}>
      <path d="m7.3 14.7 1.2-1.2c-1-1-1.5-2.3-1.5-3.5 0-1.3.5-2.6 1.5-3.5L7.3 5.3c-1.3 1.3-2 3-2 4.7s.7 3.4 2 4.7M19.1 2.9l-1.2 1.2c1.6 1.6 2.4 3.8 2.4 5.9s-.8 4.3-2.4 5.9l1.2 1.2c2-2 2.9-4.5 2.9-7.1s-1-5.1-2.9-7.1" />
      <path d="M6.1 4.1 4.9 2.9C3 4.9 2 7.4 2 10s1 5.1 2.9 7.1l1.2-1.2c-1.6-1.6-2.4-3.8-2.4-5.9s.8-4.3 2.4-5.9m10.6 10.6c1.3-1.3 2-3 2-4.7-.1-1.7-.7-3.4-2-4.7l-1.2 1.2c1 1 1.5 2.3 1.5 3.5 0 1.3-.5 2.6-1.5 3.5zM14.5 10c0-1.38-1.12-2.5-2.5-2.5S9.5 8.62 9.5 10c0 .76.34 1.42.87 1.88L7 22h2l.67-2h4.67l.66 2h2l-3.37-10.12c.53-.46.87-1.12.87-1.88m-4.17 8L12 13l1.67 5z" />
    </SvgIconBase>
  );
});

export const ChatMessageIcon = React.memo(function ChatMessageIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Message" {...props}>
      <path d="M4 4h16v12H5.17L4 17.17zm0-2c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm2 10h8v2H6zm0-3h12v2H6zm0-3h12v2H6z" />
    </SvgIconBase>
  );
});

export const ChecklistIcon = React.memo(function ChecklistIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Checklist" {...props}>
      <path d="M22 7h-9v2h9zm0 8h-9v2h9zM5.54 11 2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41z" />
    </SvgIconBase>
  );
});

export const CodeIcon = React.memo(function CodeIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Code" {...props}>
      <path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6z" />
    </SvgIconBase>
  );
});

export const CodeOffIcon = React.memo(function CodeOffIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Code off" {...props}>
      <path d="m19.17 12-4.58-4.59L16 6l6 6-3.59 3.59L17 14.17zM1.39 4.22l4.19 4.19L2 12l6 6 1.41-1.41L4.83 12 7 9.83l12.78 12.78 1.41-1.41L2.81 2.81z" />
    </SvgIconBase>
  );
});

export const LaptopIcon = React.memo(function LaptopIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Laptop" {...props}>
      <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2zM4 6h16v10H4z" />
    </SvgIconBase>
  );
});

export const DoneAllIcon = React.memo(function DoneAllIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Done all" {...props}>
      <path d="m18 7-1.41-1.41-6.34 6.34 1.41 1.41zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12zM.41 13.41 6 19l1.41-1.41L1.83 12z" />
    </SvgIconBase>
  );
});

export const BrushSparkIcon = React.memo(function BrushSparkIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Brush sparkle" {...props}>
      <path d="M21.94 4.88c-.18-.53-.69-.88-1.26-.88H19.6l-.31-.97C19.15 2.43 18.61 2 18 2s-1.15.43-1.29 1.04L16.4 4h-1.07c-.57 0-1.08.35-1.26.88-.19.56.04 1.17.56 1.48l.87.52-.4 1.24c-.23.58-.04 1.25.45 1.62.23.17.51.26.78.26.31 0 .61-.11.86-.32l.81-.7.81.7c.25.21.55.32.86.32.27 0 .55-.09.78-.26.5-.37.68-1.04.45-1.62l-.39-1.24.87-.52c.51-.31.74-.92.56-1.48M18 7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m-4.51 3.51c-.43-.43-.94-.73-1.49-.93V8h-1v1.38c-.11-.01-.23-.03-.34-.03-1.02 0-2.05.39-2.83 1.17l-.5.5-1.33-.5c-1.56-.55-3.28.27-3.83 1.82-.27.75-.23 1.57.12 2.29.23.48.58.87 1 1.16-.38 1.35-.06 2.85 1 3.91.78.78 1.8 1.17 2.83 1.17.37 0 .73-.07 1.09-.17.29.42.68.77 1.16 1 .41.2.84.3 1.28.3.34 0 .68-.06 1.01-.17 1.56-.55 2.38-2.27 1.82-3.85l-.49-1.3.5-.5c.87-.87 1.24-2.04 1.14-3.17H16v-1h-1.59c-.19-.55-.49-1.06-.92-1.5m-5.91 8.31c-.15.04-.3.06-.46.06-.53 0-1.04-.21-1.41-.59-.38-.38-.59-.88-.59-1.41 0-.16.03-.32.06-.47.14.01.28.03.42.03.85 0 1.68-.2 2.44-.48-.32.89-.54 1.87-.46 2.86m-2.91-4.53c-.25-.09-.45-.27-.57-.51s-.13-.51-.04-.76c.19-.52.76-.79 1.26-.61l3.16 1.19c-1.15.6-2.63 1.11-3.81.69m6.32 5.65c-.25.09-.52.08-.76-.04-.24-.11-.42-.32-.51-.57-.42-1.18.09-2.65.7-3.8l1.18 3.13c.18.52-.09 1.1-.61 1.28m1.21-5.34-.61-1.61c0-.01-.01-.02-.02-.03l-.06-.12c-.02-.04-.04-.07-.07-.11l-.09-.09-.09-.09c-.03-.03-.07-.05-.11-.07s-.07-.05-.12-.06c-.01 0-.02-.01-.03-.02l-1.6-.6c.36-.29.79-.46 1.26-.46.53 0 1.04.21 1.41.59.73.73.77 1.88.13 2.67" />
    </SvgIconBase>
  );
});

export const CoffeeMakerIcon = React.memo(function CoffeeMakerIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Coffee maker" {...props}>
      <path d="M2 19h18v2H2zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2m-4 10c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V5h3v1.4L7.19 7.85c-.12.09-.19.24-.19.39v4.26c0 .28.22.5.5.5h4c.28 0 .5-.22.5-.5V8.24c0-.15-.07-.3-.19-.39L10 6.4V5h6zM9.5 7.28l1.5 1.2V12H8V8.48zM20 8h-2V5h2z" />
    </SvgIconBase>
  );
});

export const FlagIcon = React.memo(function FlagIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Flag" {...props}>
      <path d="m14 9-1-2H7V5.72c.6-.34 1-.98 1-1.72 0-1.1-.9-2-2-2s-2 .9-2 2c0 .74.4 1.38 1 1.72V21h2v-4h5l1 2h7V9h-6zm4 8h-4l-1-2H7V9h5l1 2h5v6z" />
    </SvgIconBase>
  );
});

export const TrophyIcon = React.memo(function TrophyIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Trophy" {...props}>
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2M5 8V7h2v3.82C5.84 10.4 5 9.3 5 8m7 6c-1.65 0-3-1.35-3-3V5h6v6c0 1.65-1.35 3-3 3m7-6c0 1.3-.84 2.4-2 2.82V7h2z" />
    </SvgIconBase>
  );
});

export const MusicNoteIcon = React.memo(function MusicNoteIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Music note" {...props}>
      <path d="m12 3 .01 10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4.01 4S14 19.21 14 17V7h4V3zm-1.99 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2" />
    </SvgIconBase>
  );
});

export const MusicOffIcon = React.memo(function MusicOffIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Music off" {...props}>
      <path d="M14 7h4V3h-6v4.61l2 2zm-2 3.44L4.41 2.86 3 4.27l9 9v.28c-.94-.54-2.1-.75-3.33-.32-1.34.48-2.37 1.67-2.61 3.07-.46 2.74 1.86 5.08 4.59 4.65 1.96-.31 3.35-2.11 3.35-4.1v-1.58L19.73 21l1.41-1.41zM10 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2" />
    </SvgIconBase>
  );
});

export const SwapArrowsIcon = React.memo(function SwapArrowsIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Swap arrows" {...props}>
      <path d="m17 4 4 4-4 4V9h-4V7h4zm-7 3c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1M6 7c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1m1 10h4v-2H7v-3l-4 4 4 4zm7 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1m4 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1" />
    </SvgIconBase>
  );
});

export const MoreVerticalIcon = React.memo(function MoreVerticalIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="More vertical" {...props}>
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2" />
    </SvgIconBase>
  );
});

export const MoreHorizontalIcon = React.memo(function MoreHorizontalIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="More horizontal" {...props}>
      <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2" />
    </SvgIconBase>
  );
});

export const WarningBadgeIcon = React.memo(function WarningBadgeIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Warning badge" {...props}>
      <path d="m23 12-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68zm-4.51 2.11.26 2.79-2.74.62-1.43 2.41L12 18.82l-2.58 1.11-1.43-2.41-2.74-.62.26-2.8L3.66 12l1.85-2.12-.26-2.78 2.74-.61 1.43-2.41L12 5.18l2.58-1.11 1.43 2.41 2.74.62-.26 2.79L20.34 12zM11 15h2v2h-2zm0-8h2v6h-2z" />
    </SvgIconBase>
  );
});

export const RewindIcon = React.memo(function RewindIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Rewind" {...props}>
      <path d="M18 9.86v4.28L14.97 12zm-9 0v4.28L5.97 12zM20 6l-8.5 6 8.5 6zm-9 0-8.5 6 8.5 6z" />
    </SvgIconBase>
  );
});

export const FavoriteOutlineIcon = React.memo(function FavoriteOutlineIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Favorite outline" {...props}>
      <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3m-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05" />
    </SvgIconBase>
  );
});

export const FavoriteIcon = React.memo(function FavoriteIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Favorite" {...props}>
      <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
    </SvgIconBase>
  );
});

export const FeedbackIcon = React.memo(function FeedbackIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Feedback" {...props}>
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H5.17l-.59.59-.58.58V4h16zm-9-4h2v2h-2zm0-6h2v4h-2z" />
    </SvgIconBase>
  );
});

export const QuoteBlockIcon = React.memo(function QuoteBlockIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Quote block" {...props}>
      <path d="M18.62 18h-5.24l2-4H13V6h8v7.24zm-2-2h.76L19 12.76V8h-4v4h3.62zm-8 2H3.38l2-4H3V6h8v7.24zm-2-2h.76L9 12.76V8H5v4h3.62z" />
    </SvgIconBase>
  );
});

export const RadiateIcon = React.memo(function RadiateIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Radiate" {...props}>
      <path d="M13 4v2.67l-1 1-1-1V4zm7 7v2h-2.67l-1-1 1-1zM6.67 11l1 1-1 1H4v-2zM12 16.33l1 1V20h-2v-2.67zM15 2H9v5.5l3 3 3-3zm7 7h-5.5l-3 3 3 3H22zM7.5 9H2v6h5.5l3-3zm4.5 4.5-3 3V22h6v-5.5z" />
    </SvgIconBase>
  );
});

export const StarOutlineIcon = React.memo(function StarOutlineIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Star outline" {...props}>
      <path d="m12 7.13.97 2.29.47 1.11 1.2.1 2.47.21-1.88 1.63-.91.79.27 1.18.56 2.41-2.12-1.28-1.03-.64-1.03.62-2.12 1.28.56-2.41.27-1.18-.91-.79-1.88-1.63 2.47-.21 1.2-.1.47-1.11zM12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z" />
    </SvgIconBase>
  );
});

export const SignalAlertIcon = React.memo(function SignalAlertIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Signal alert" {...props}>
      <path d="M20 4H4c-1.1 0-2 .9-2 2v3h2V6h16v3h2V6c0-1.1-.9-2-2-2m0 14H4v-3H2v3c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-3h-2z" />
      <path d="M14.89 7.55c-.34-.68-1.45-.68-1.79 0L10 13.76l-1.11-2.21A.988.988 0 0 0 8 11H2v2h5.38l1.72 3.45c.18.34.52.55.9.55s.72-.21.89-.55L14 10.24l1.11 2.21c.17.34.51.55.89.55h6v-2h-5.38z" />
    </SvgIconBase>
  );
});

export const PercentIcon = React.memo(function PercentIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Percent" {...props}>
      <path d="M7.5 4C5.57 4 4 5.57 4 7.5S5.57 11 7.5 11 11 9.43 11 7.5 9.43 4 7.5 4m0 5C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9m9 4c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5m0 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5M5.41 20 4 18.59 18.59 4 20 5.41z" />
    </SvgIconBase>
  );
});

export const BroadcastIcon = React.memo(function BroadcastIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Broadcast" {...props}>
      <path d="M14 12c0 .74-.4 1.38-1 1.72V22h-2v-8.28c-.6-.35-1-.98-1-1.72 0-1.1.9-2 2-2s2 .9 2 2m-2-6c-3.31 0-6 2.69-6 6 0 1.74.75 3.31 1.94 4.4l1.42-1.42C8.53 14.25 8 13.19 8 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.19-.53 2.25-1.36 2.98l1.42 1.42C17.25 15.31 18 13.74 18 12c0-3.31-2.69-6-6-6m0-4C6.48 2 2 6.48 2 12c0 2.85 1.2 5.41 3.11 7.24l1.42-1.42C4.98 16.36 4 14.29 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8c0 2.29-.98 4.36-2.53 5.82l1.42 1.42C20.8 17.41 22 14.85 22 12c0-5.52-4.48-10-10-10" />
    </SvgIconBase>
  );
});

export const SyncCheckIcon = React.memo(function SyncCheckIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Sync check" {...props}>
      <path d="M18.6 19.5H21v2h-6v-6h2v2.73c1.83-1.47 3-3.71 3-6.23 0-4.07-3.06-7.44-7-7.93V2.05c5.05.5 9 4.76 9 9.95 0 2.99-1.32 5.67-3.4 7.5M4 12c0-2.52 1.17-4.77 3-6.23V8.5h2v-6H3v2h2.4C3.32 6.33 2 9.01 2 12c0 5.19 3.95 9.45 9 9.95v-2.02c-3.94-.49-7-3.86-7-7.93m12.24-3.89-5.66 5.66-2.83-2.83-1.41 1.41 4.24 4.24 7.07-7.07z" />
    </SvgIconBase>
  );
});

export const LibraryMusicIcon = React.memo(function LibraryMusicIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Music library" {...props}>
      <path d="M22 6h-5v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3zm-7 0H3v2h12zm0 4H3v2h12zm-4 4H3v2h8z" />
    </SvgIconBase>
  );
});

export const RadioIcon = React.memo(function RadioIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Radio" {...props}>
      <path d="M20 6H8.3l8.26-3.34L15.88 1 3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.89 2 2 2h16c1.11 0 2-.9 2-2V8c0-1.11-.89-2-2-2m0 2v3h-2V9h-2v2H4V8zM4 20v-7h16v7z" />
      <circle cx="8" cy="16.48" r="2.5" />
    </SvgIconBase>
  );
});

export const SailingIcon = React.memo(function SailingIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Sailing" {...props}>
      <path d="M19.66 14c-.66 1.92-2.24 3.54-4.4 4.39l-1.26.5V20h-4v-1.11l-1.27-.5c-2.16-.85-3.74-2.47-4.4-4.39zM22 2 4 3.99V12H2c0 3.69 2.47 6.86 6 8.25V22h8v-1.75c3.53-1.39 6-4.56 6-8.25H10.5V8H22V6.5H10.5V4.78L22 3.51zM8 6.5V5.06l1-.11V6.5zm-2.5 0V5.34l1-.11V6.5zM8 12V8h1v4zm-2.5 0V8h1v4z" />
    </SvgIconBase>
  );
});

export const ReceiptLongIcon = React.memo(function ReceiptLongIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Receipt long" {...props}>
      <path d="M19.5 3.5 18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2zM15 20H6c-.55 0-1-.45-1-1v-1h10zm4-1c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11z" />
      <path d="M9 7h6v2H9zm7 0h2v2h-2zm-7 3h6v2H9zm7 0h2v2h-2z" />
    </SvgIconBase>
  );
});

export const ReceiptIcon = React.memo(function ReceiptIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Receipt" {...props}>
      <path d="M19.5 3.5 18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2zM19 19.09H5V4.91h14zM6 15h12v2H6zm0-4h12v2H6zm0-4h12v2H6z" />
    </SvgIconBase>
  );
});

export const ReportIcon = React.memo(function ReportIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Report" {...props}>
      <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27zM19 14.9 14.9 19H9.1L5 14.9V9.1L9.1 5h5.8L19 9.1z" />
      <circle cx="12" cy="16" r="1" />
      <path d="M11 7h2v7h-2z" />
    </SvgIconBase>
  );
});

export const ReportOffIcon = React.memo(function ReportOffIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Report off" {...props}>
      <path d="M9.1 5h5.8L19 9.1v5.8l-.22.22 1.42 1.41.8-.8V8.27L15.73 3H8.27l-.8.8 1.41 1.42z" />
      <circle cx="12" cy="16" r="1" />
      <path d="M13 9.33V7h-2v.33zM2.41 1.58 1 2.99l3.64 3.64L3 8.27v7.46L8.27 21h7.46l1.64-1.64L21.01 23l1.41-1.41zM14.9 19H9.1L5 14.9V9.1l1.05-1.05 9.9 9.9z" />
    </SvgIconBase>
  );
});

export const RestaurantBellIcon = React.memo(function RestaurantBellIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Restaurant bell" {...props}>
      <path d="M18.98 17H2v2h20v-2zM21 16c-.27-4.07-3.25-7.4-7.16-8.21.1-.24.16-.51.16-.79 0-1.1-.9-2-2-2s-2 .9-2 2c0 .28.06.55.16.79C6.25 8.6 3.27 11.93 3 16zm-9-6.42c2.95 0 5.47 1.83 6.5 4.41h-13c1.03-2.58 3.55-4.41 6.5-4.41" />
    </SvgIconBase>
  );
});

export const SaveFileIcon = React.memo(function SaveFileIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Save file" {...props}>
      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7zm2 16H5V5h11.17L19 7.83zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3M6 6h9v4H6z" />
    </SvgIconBase>
  );
});

export const SpeedGaugeIcon = React.memo(function SpeedGaugeIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Speed gauge" {...props}>
      <path d="m20.38 8.57-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44z" />
      <path d="M10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83" />
    </SvgIconBase>
  );
});

export const RulerIcon = React.memo(function RulerIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Ruler" {...props}>
      <path d="m17.66 17.66-1.06 1.06-.71-.71 1.06-1.06-1.94-1.94-1.06 1.06-.71-.71 1.06-1.06-1.94-1.94-1.06 1.06-.71-.71 1.06-1.06L9.7 9.7l-1.06 1.06-.71-.71 1.06-1.06-1.94-1.94-1.06 1.06-.71-.71 1.06-1.06L4 4v14c0 1.1.9 2 2 2h14zM7 17v-5.76L12.76 17z" />
    </SvgIconBase>
  );
});

export const StarCircleIcon = React.memo(function StarCircleIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Star circle" {...props}>
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2m7.48 7.16-5.01-.43-2-4.71c3.21.19 5.91 2.27 7.01 5.14m-5.07 6.26L12 13.98l-2.39 1.44.63-2.72-2.11-1.83 2.78-.24L12 8.06l1.09 2.56 2.78.24-2.11 1.83zm-2.86-11.4-2 4.72-5.02.43c1.1-2.88 3.8-4.97 7.02-5.15M4 12c0-.64.08-1.26.23-1.86l3.79 3.28-1.11 4.75C5.13 16.7 4 14.48 4 12m3.84 6.82L12 16.31l4.16 2.5c-1.22.75-2.64 1.19-4.17 1.19-1.52 0-2.94-.44-4.15-1.18m9.25-.65-1.11-4.75 3.79-3.28c.14.59.23 1.22.23 1.86 0 2.48-1.14 4.7-2.91 6.17" />
    </SvgIconBase>
  );
});

export const MagicSparkIcon = React.memo(function MagicSparkIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Magic sparkle" {...props}>
      <path d="M7.06 8.94 5 8l2.06-.94L8 5l.94 2.06L11 8l-2.06.94L8 11zM8 21l.94-2.06L11 18l-2.06-.94L8 15l-.94 2.06L5 18l2.06.94zm-3.63-8.63L3 13l1.37.63L5 15l.63-1.37L7 13l-1.37-.63L5 11zM12 12c0-3.09 1.38-5.94 3.44-8H12V2h7v7h-2V5.28c-1.8 1.74-3 4.2-3 6.72 0 3.32 2.1 6.36 5 7.82V22c-4.09-1.59-7-5.65-7-10m12 2h-2v-2h-2v2h-2v2h2v2h2v-2h2z" />
    </SvgIconBase>
  );
});

export const ThumbUpIcon = React.memo(function ThumbUpIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Thumb up" {...props}>
      <path d="M21 8h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2m0 4-3 7H9V9l4.34-4.34L12.23 10H21zM1 9h4v12H1z" />
    </SvgIconBase>
  );
});

export const TouchClickIcon = React.memo(function TouchClickIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Touch click" {...props}>
      <path d="m18.19 12.44-3.24-1.62c1.29-1 2.12-2.56 2.12-4.32 0-3.03-2.47-5.5-5.5-5.5s-5.5 2.47-5.5 5.5c0 2.13 1.22 3.98 3 4.89v3.26c-2.15-.46-2.02-.44-2.26-.44-.53 0-1.03.21-1.41.59L4 16.22l5.09 5.09c.43.44 1.03.69 1.65.69h6.3c.98 0 1.81-.7 1.97-1.67l.8-4.71c.22-1.3-.43-2.58-1.62-3.18m-.35 2.85-.8 4.71h-6.3c-.09 0-.17-.04-.24-.1l-3.68-3.68 4.25.89V6.5c0-.28.22-.5.5-.5s.5.22.5.5v6h1.76l3.46 1.73c.4.2.62.63.55 1.06M8.07 6.5c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 .95-.38 1.81-1 2.44V6.5c0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5v2.44c-.62-.63-1-1.49-1-2.44" />
    </SvgIconBase>
  );
});

export const TrafficLightIcon = React.memo(function TrafficLightIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Traffic light" {...props}>
      <path d="M20 10h-3V8.86c1.72-.45 3-2 3-3.86h-3V4c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v1H4c0 1.86 1.28 3.41 3 3.86V10H4c0 1.86 1.28 3.41 3 3.86V15H4c0 1.86 1.28 3.41 3 3.86V20c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1.14c1.72-.45 3-2 3-3.86h-3v-1.14c1.72-.45 3-2 3-3.86m-5 9H9V5h6zm-3-1c.83 0 1.5-.67 1.5-1.5S12.83 15 12 15s-1.5.67-1.5 1.5.67 1.5 1.5 1.5m0-4.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5M12 9c.83 0 1.5-.67 1.5-1.5S12.83 6 12 6s-1.5.67-1.5 1.5S11.17 9 12 9" />
    </SvgIconBase>
  );
});

export const VerifiedBadgeIcon = React.memo(function VerifiedBadgeIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Verified badge" {...props}>
      <path d="M23 11.99 20.56 9.2l.34-3.69-3.61-.82L15.4 1.5 12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 11.99l2.44 2.79-.34 3.7 3.61.82 1.89 3.2 3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69zm-3.95 1.48-.56.65.08.85.18 1.95-1.9.43-.84.19-.44.74-.99 1.68-1.78-.77-.8-.34-.79.34-1.78.77-.99-1.67-.44-.74-.84-.19-1.9-.43.18-1.96.08-.85-.56-.65L3.67 12l1.29-1.48.56-.65-.09-.86-.18-1.94 1.9-.43.84-.19.44-.74.99-1.68 1.78.77.8.34.79-.34 1.78-.77.99 1.68.44.74.84.19 1.9.43-.18 1.95-.08.85.56.65 1.29 1.47z" />
      <path d="m10.09 13.75-2.32-2.33-1.48 1.49 3.8 3.81 7.34-7.36-1.48-1.49z" />
    </SvgIconBase>
  );
});

export const CubeFocusIcon = React.memo(function CubeFocusIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Cube focus" {...props}>
      <path d="M3 4c0-.55.45-1 1-1h2V1H4C2.34 1 1 2.34 1 4v2h2zm0 16v-2H1v2c0 1.66 1.34 3 3 3h2v-2H4c-.55 0-1-.45-1-1M20 1h-2v2h2c.55 0 1 .45 1 1v2h2V4c0-1.66-1.34-3-3-3m1 19c0 .55-.45 1-1 1h-2v2h2c1.66 0 3-1.34 3-3v-2h-2zm-2-5.13V9.13c0-.72-.38-1.38-1-1.73l-5-2.88c-.31-.18-.65-.27-1-.27s-.69.09-1 .27L6 7.39c-.62.36-1 1.02-1 1.74v5.74c0 .72.38 1.38 1 1.73l5 2.88c.31.18.65.27 1 .27s.69-.09 1-.27l5-2.88c.62-.35 1-1.01 1-1.73m-8 2.3-4-2.3v-4.63l4 2.33zm1-6.33L8.04 8.53 12 6.25l3.96 2.28zm5 4.03-4 2.3v-4.6l4-2.33z" />
    </SvgIconBase>
  );
});

export const HeartHandIcon = React.memo(function HeartHandIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Heart hand" {...props}>
      <path d="M16 13c3.09-2.81 6-5.44 6-7.7C22 3.45 20.55 2 18.7 2c-1.04 0-2.05.49-2.7 1.25C15.34 2.49 14.34 2 13.3 2 11.45 2 10 3.45 10 5.3c0 2.26 2.91 4.89 6 7.7m-2.7-9c.44 0 .89.21 1.18.55L16 6.34l1.52-1.79c.29-.34.74-.55 1.18-.55.74 0 1.3.56 1.3 1.3 0 1.12-2.04 3.17-4 4.99-1.96-1.82-4-3.88-4-4.99 0-.74.56-1.3 1.3-1.3M19 16h-2c0-1.2-.75-2.28-1.87-2.7L8.97 11H1v11h6v-1.44l7 1.94 8-2.5v-1c0-1.66-1.34-3-3-3M3 20v-7h2v7zm10.97.41L7 18.48V13h1.61l5.82 2.17c.34.13.57.46.57.83 0 0-1.99-.05-2.3-.15l-2.38-.79-.63 1.9 2.38.79c.51.17 1.04.26 1.58.26H19c.39 0 .74.23.9.56z" />
    </SvgIconBase>
  );
});

export const KeyIcon = React.memo(function KeyIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Key" {...props}>
      <path d="M22 19h-6v-4h-2.68c-1.14 2.42-3.6 4-6.32 4-3.86 0-7-3.14-7-7s3.14-7 7-7c2.72 0 5.17 1.58 6.32 4H24v6h-2zm-4-2h2v-4h2v-2H11.94l-.23-.67C11.01 8.34 9.11 7 7 7c-2.76 0-5 2.24-5 5s2.24 5 5 5c2.11 0 4.01-1.34 4.71-3.33l.23-.67H18zM7 15c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3m0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1" />
    </SvgIconBase>
  );
});

export const KeyOffIcon = React.memo(function KeyOffIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Key off" {...props}>
      <path d="M2.81 2.81 1.39 4.22l2.59 2.59C2.2 7.85 1 9.79 1 12c0 3.31 2.69 6 6 6 2.22 0 4.15-1.21 5.19-3l7.59 7.61 1.41-1.41zM7 16c-2.21 0-4-1.79-4-4 0-1.67 1.02-3.1 2.47-3.7l1.71 1.71C7.12 10 7.06 10 7 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2c0-.06 0-.12-.01-.18l1.74 1.74C10.22 14.48 9.14 16 7 16m10-1.83V13h-1.17zM13.83 11H21v2h-2v3l2 2v-3h2V9H11.83z" />
    </SvgIconBase>
  );
});

export const ClockIcon = React.memo(function ClockIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Clock" {...props}>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7z" />
    </SvgIconBase>
  );
});

export const OpenInNewIcon = React.memo(function OpenInNewIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Open in new" {...props}>
      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3z" />
    </SvgIconBase>
  );
});

export const LightBulbIcon = React.memo(function LightBulbIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Light bulb" {...props}>
      <path d="M7 20h4c0 1.1-.9 2-2 2s-2-.9-2-2m-2-1h8v-2H5zm11.5-9.5c0 3.82-2.66 5.86-3.77 6.5H5.27c-1.11-.64-3.77-2.68-3.77-6.5C1.5 5.36 4.86 2 9 2s7.5 3.36 7.5 7.5m4.87-2.13L20 8l1.37.63L22 10l.63-1.37L24 8l-1.37-.63L22 6zM19 6l.94-2.06L22 3l-2.06-.94L19 0l-.94 2.06L16 3l2.06.94z" />
    </SvgIconBase>
  );
});

export const SparklesIcon = React.memo(function SparklesIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Sparkles" {...props}>
      <path d="m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm0 6-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25zm-7.5-5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12zm-1.51 3.49L9 15.17l-.99-2.18L5.83 12l2.18-.99L9 8.83l.99 2.18 2.18.99z" />
    </SvgIconBase>
  );
});

export const SmartSettingsIcon = React.memo(function SmartSettingsIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Smart settings" {...props}>
      <path d="M10 13c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m0-2c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3m8.5-2 1.09-2.41L22 5.5l-2.41-1.09L18.5 2l-1.09 2.41L15 5.5l2.41 1.09zm2.78 3.72L20.5 11l-.78 1.72-1.72.78 1.72.78.78 1.72.78-1.72L23 13.5zM16.25 14c0-.12 0-.25-.01-.37l1.94-1.47-2.5-4.33-2.24.94c-.2-.13-.42-.26-.64-.37L12.5 6h-5l-.3 2.41c-.22.11-.43.24-.64.37l-2.24-.95-2.5 4.33 1.94 1.47c-.01.12-.01.25-.01.37s0 .25.01.37l-1.94 1.47 2.5 4.33 2.24-.94c.2.13.42.26.64.37l.3 2.4h5l.3-2.41c.22-.11.43-.23.64-.37l2.24.94 2.5-4.33-1.94-1.47c.01-.11.01-.24.01-.36m-1.42 3.64-1.73-.73c-.56.6-1.3 1.04-2.13 1.23L10.73 20H9.27l-.23-1.86c-.83-.19-1.57-.63-2.13-1.23l-1.73.73-.73-1.27 1.49-1.13q-.18-.585-.18-1.23t.18-1.23l-1.49-1.13.73-1.27 1.73.73c.56-.6 1.3-1.04 2.13-1.23L9.27 8h1.47l.23 1.86c.83.19 1.57.63 2.13 1.23l1.73-.73.73 1.27-1.49 1.13q.18.585.18 1.23t-.18 1.23l1.49 1.13z" />
    </SvgIconBase>
  );
});

export const SignalPathIcon = React.memo(function SignalPathIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Signal path" {...props}>
      <path d="M21 8c-1.45 0-2.26 1.44-1.93 2.51l-3.55 3.56c-.3-.09-.74-.09-1.04 0l-2.55-2.55C12.27 10.45 11.46 9 10 9c-1.45 0-2.27 1.44-1.93 2.52l-4.56 4.55C2.44 15.74 1 16.55 1 18c0 1.1.9 2 2 2 1.45 0 2.26-1.44 1.93-2.51l4.55-4.56c.3.09.74.09 1.04 0l2.55 2.55C12.73 16.55 13.54 18 15 18c1.45 0 2.27-1.44 1.93-2.52l3.56-3.55c1.07.33 2.51-.48 2.51-1.93 0-1.1-.9-2-2-2" />
      <path d="m15 9 .94-2.07L18 6l-2.06-.93L15 3l-.92 2.07L12 6l2.08.93zM3.5 11 4 9l2-.5L4 8l-.5-2L3 8l-2 .5L3 9z" />
    </SvgIconBase>
  );
});

export const SunIcon = React.memo(function SunIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Sun" {...props}>
      <path d="m6.76 4.84-1.8-1.79-1.41 1.41 1.79 1.79zM1 10.5h3v2H1zM11 .55h2V3.5h-2zm8.04 2.495 1.408 1.407-1.79 1.79-1.407-1.408zm-1.8 15.115 1.79 1.8 1.41-1.41-1.8-1.79zM20 10.5h3v2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6m0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4m-1 4h2v2.95h-2zm-7.45-.96 1.41 1.41 1.79-1.8-1.41-1.41z" />
    </SvgIconBase>
  );
});

export const SoundIcon = React.memo(function SoundIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Sound" {...props}>
      <path d="M14 9c0-2.04 1.24-3.79 3-4.57V4c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h9c1.1 0 2-.9 2-2v-2.42c-1.76-.78-3-2.53-3-4.58m-4 5H6v-2h4zm3-3H6V9h7zm0-3H6V6h7z" />
      <path d="M20 6.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V3h2V1h-4z" />
    </SvgIconBase>
  );
});

export const VibrateIcon = React.memo(function VibrateIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Vibrate" {...props}>
      <path d="M3 7h2v7H3zm-3 3h2v7H0zm22-3h2v7h-2zm-3 3h2v7h-2zm-3-7.99L8 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-1.99-2-1.99M16 17H8V7h8z" />
    </SvgIconBase>
  );
});

export const TrashIcon = React.memo(function TrashIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Trash" {...props}>
      <path d="M16 9v10H8V9zm-1.5-6h-5l-1 1H5v2h14V4h-3.5zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2z" />
    </SvgIconBase>
  );
});

export const UploadIcon = React.memo(function UploadIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Upload" {...props}>
      <path d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3zM7 9l1.41 1.41L11 7.83V16h2V7.83l2.59 2.58L17 9l-5-5z" />
    </SvgIconBase>
  );
});

export const EqualizerIcon = React.memo(function EqualizerIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Equalizer" {...props}>
      <path d="M5 2c0-.55-.45-1-1-1s-1 .45-1 1v4H1v10c0 1.3.84 2.4 2 2.82V23h2v-4.18C6.16 18.4 7 17.3 7 16V6H5zM4 17c-.55 0-1-.45-1-1v-2h2v2c0 .55-.45 1-1 1m-1-5V8h2v4zM13 2c0-.55-.45-1-1-1s-1 .45-1 1v4H9v10c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.42 2-1.52 2-2.82V6h-2zm-1 15c-.55 0-1-.45-1-1v-2h2v2c0 .55-.45 1-1 1m-1-5V8h2v4zm10-6V2c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v10c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.42 2-1.52 2-2.82V6zm-1 11c-.55 0-1-.45-1-1v-2h2v2c0 .55-.45 1-1 1m-1-5V8h2v4z" />
    </SvgIconBase>
  );
});

export const LoopIcon = React.memo(function LoopIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Loop" {...props}>
      <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53L13.51 12l2.69-2.39c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37" />
    </SvgIconBase>
  );
});

export const SaveIcon = React.memo(function SaveIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Save" {...props}>
      <path d="M21 12.4V7l-4-4H3v18h9.4zM15 15c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3M6 6h9v4H6zm13.99 10.25 1.77 1.77L16.77 23H15v-1.77zm3.62-.09-1.2 1.2-1.77-1.77 1.2-1.2z" />
    </SvgIconBase>
  );
});

export const SaveEditIcon = SaveIcon;

export const CopyIcon = React.memo(function CopyIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Copy" {...props}>
      <path d="M16 1H2v16h2V3h12zm5 4H6v18h15zm-2 16H8V7h11z" />
    </SvgIconBase>
  );
});

export const PauseIcon = React.memo(function PauseIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Pause" {...props}>
      <path d="M9 16h2V8H9zm3-14C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m1-4h2V8h-2z" />
    </SvgIconBase>
  );
});

export const PlayIcon = React.memo(function PlayIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Play" {...props}>
      <path d="m10 16.5 6-4.5-6-4.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8" />
    </SvgIconBase>
  );
});

export const StopIcon = React.memo(function StopIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Stop" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m4 14H8V8h8z" />
    </SvgIconBase>
  );
});

export const ShareIcon = React.memo(function ShareIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Share" {...props}>
      <path d="M5.01 1v22H19V1zM17 19H7V5h10zm-4.2-5.76v1.75L16 12l-3.2-2.98v1.7c-3.11.43-4.35 2.56-4.8 4.7 1.11-1.5 2.58-2.18 4.8-2.18" />
    </SvgIconBase>
  );
});

export const WarningIcon = React.memo(function WarningIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Warning" {...props}>
      <path d="M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z" />
    </SvgIconBase>
  );
});

export const PrintIcon = React.memo(function PrintIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Print" {...props}>
      <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3M16 19H8v-5h8zm3-5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1M18 3H6v4h12z" />
    </SvgIconBase>
  );
});

export const DownloadIcon = React.memo(function DownloadIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Download" {...props}>
      <path d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3zm-1-4-1.41-1.41L13 12.17V4h-2v8.17L8.41 9.59 7 11l5 5z" />
    </SvgIconBase>
  );
});

export const ShuffleIcon = React.memo(function ShuffleIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Shuffle" {...props}>
      <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17zm4.91-4.67 2.04 2.04L4 20.09 5.41 21.5 18.96 7.96 21 10V4.5zM14.83 13.41l-1.41 1.41 4.13 4.13L15.5 21H21v-5.5l-2.04 2.04z" />
    </SvgIconBase>
  );
});

export const RefreshIcon = React.memo(function RefreshIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Refresh" {...props}>
      <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z" />
    </SvgIconBase>
  );
});

export const VisibilityIcon = React.memo(function VisibilityIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Show" {...props}>
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5m0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10m0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6" />
    </SvgIconBase>
  );
});

export const VisibilityOffIcon = React.memo(function VisibilityOffIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Hide" {...props}>
      <path d="M2.81 2.81 1.39 4.22l3.05 3.05A11.7 11.7 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l3.4 3.4 1.41-1.41zm6.3 6.3 1.55 1.55A3 3 0 0 0 13.34 13l1.55 1.55A5 5 0 0 1 9.1 9.1m2.82-2.1L15 10.08V9h2v2h-1.08l2.8 2.8A11.9 11.9 0 0 0 23 12c-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.24-3.98.69l2.14 2.14c.55-.21 1.14-.33 1.77-.33" />
    </SvgIconBase>
  );
});

export const QrCodeIcon = React.memo(function QrCodeIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="QR code" {...props}>
      <path d="M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm10-2h2v2h-2zm4 0h2v2h-2zm-6 4h2v4h-2zm4 0h4v2h-2v2h-2zm2-2h2v2h-2z" />
    </SvgIconBase>
  );
});

export const CheckCircleIcon = React.memo(function CheckCircleIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Check" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
    </SvgIconBase>
  );
});

export const CloseIcon = React.memo(function CloseIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Close" {...props}>
      <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3z" />
    </SvgIconBase>
  );
});

export const SearchIcon = React.memo(function SearchIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Search" {...props}>
      <path d="M9.5 3a6.5 6.5 0 0 1 5.16 10.45l5.44 5.45-1.41 1.41-5.45-5.44A6.5 6.5 0 1 1 9.5 3m0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9" />
    </SvgIconBase>
  );
});

export const ListIcon = React.memo(function ListIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="List" {...props}>
      <path d="M4 10.5c.83 0 1.5-.67 1.5-1.5S4.83 7.5 4 7.5 2.5 8.17 2.5 9 3.17 10.5 4 10.5m0 6c.83 0 1.5-.67 1.5-1.5S4.83 13.5 4 13.5 2.5 14.17 2.5 15 3.17 16.5 4 16.5M4 4.5c.83 0 1.5-.67 1.5-1.5S4.83 1.5 4 1.5 2.5 2.17 2.5 3 3.17 4.5 4 4.5M8 4h14V2H8zm0 6h14V8H8zm0 6h14v-2H8zm0 6h14v-2H8z" />
    </SvgIconBase>
  );
});

export const TuneIcon = React.memo(function TuneIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Settings" {...props}>
      <path d="M3 17v2h6v-2zM3 5v2h10V5zm10 16v-2h8v-2h-8v-2h-2v6zM7 9v2H3v2h4v2h2V9zm14 4v-2H11v2zm-6-4h2V7h4V5h-4V3h-2z" />
    </SvgIconBase>
  );
});

export const VolumeIcon = React.memo(function VolumeIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Volume" {...props}>
      <path d="M14 8.83v6.34L11.83 13H9v-2h2.83zM16 4l-5 5H7v6h4l5 5z" />
    </SvgIconBase>
  );
});

export const VolumeOffIcon = React.memo(function VolumeOffIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Volume off" {...props}>
      <path d="M4.34 2.93 2.93 4.34 7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06c1.34-.3 2.57-.92 3.61-1.75l2.05 2.05 1.41-1.41zM10 15.17 7.83 13H5v-2h2.83l.88-.88L10 11.41zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71m-7-8-1.88 1.88L12 7.76zm4.5 8c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24" />
    </SvgIconBase>
  );
});

export const HeadphonesIcon = React.memo(function HeadphonesIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Headphones" {...props}>
      <path d="M12 3c-4.97 0-9 4.03-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-4v8h4c1.1 0 2-.9 2-2v-7c0-4.97-4.03-9-9-9M7 15v4H5v-4zm12 4h-2v-4h2z" />
    </SvgIconBase>
  );
});

export const MoonIcon = React.memo(function MoonIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="Moon" {...props}>
      <path d="M12.34 2.02C6.59 1.82 2 6.42 2 12c0 5.52 4.48 10 10 10 3.71 0 6.93-2.02 8.66-5.02-7.51-.25-12.09-8.43-8.32-14.96" />
    </SvgIconBase>
  );
});

export const ThemeSunIcon = React.memo(function ThemeSunIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Theme sun" {...props}>
      <path d="M11 4V2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1m7.36 3.05 1.41-1.42c.39-.39.39-1.02 0-1.41a.996.996 0 0 0-1.41 0l-1.41 1.42c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0M22 11h-2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1m-10 8c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1M5.64 7.05 4.22 5.64c-.39-.39-.39-1.03 0-1.41s1.03-.39 1.41 0l1.41 1.41c.39.39.39 1.03 0 1.41s-1.02.39-1.4 0m11.31 9.9c-.39.39-.39 1.03 0 1.41l1.41 1.41c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.41-1.41c-.38-.39-1.02-.39-1.41 0M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m3.64 6.78 1.41-1.41c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.41 1.41c-.39.39-.39 1.03 0 1.41.38.39 1.02.39 1.41 0M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6" />
    </SvgIconBase>
  );
});

export const SchoolIcon = React.memo(function SchoolIcon(props: SvgIconProps) {
  return (
    <SvgIconBase title="School" {...props}>
      <path d="M12 3 1 9l4 2.18v6L12 21l7-3.82v-6L21 10v7h2V9zm6.82 6L12 12.72 5.18 9 12 5.28zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73z" />
    </SvgIconBase>
  );
});

export const KeyboardIcon = React.memo(function KeyboardIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Keyboard" {...props}>
      <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2M8 8h2v2H8zm0 3h2v2H8zm-1 2H5v-2h2zm0-3H5V8h2zm9 7H8v-2h8zm0-4h-2v-2h2zm0-3h-2V8h2zm3 3h-2v-2h2zm0-3h-2V8h2zm-6 3h-2v-2h2zm0-3h-2V8h2z" />
    </SvgIconBase>
  );
});

export const PortfolioIcon = React.memo(function PortfolioIcon(
  props: SvgIconProps,
) {
  return (
    <SvgIconBase title="Developer portfolio" {...props} fill="none">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="var(--mw-nav-bg)"
      />
      <text
        x="12"
        y="12.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Space Grotesk, system-ui, sans-serif"
        fontSize="12"
        fontWeight="800"
        fill="var(--mw-accent)"
      >
        S
      </text>
    </SvgIconBase>
  );
});

/** Optional convenience map */
export const Icons = {
  BrushIcon,
  CakeIcon,
  CalendarIcon,
  CelebrationIcon,
  RadioTowerIcon,
  ChatMessageIcon,
  ChecklistIcon,
  CodeIcon,
  CodeOffIcon,
  LaptopIcon,
  DoneAllIcon,
  BrushSparkIcon,
  CoffeeMakerIcon,
  FlagIcon,
  TrophyIcon,
  MusicNoteIcon,
  MusicOffIcon,
  SwapArrowsIcon,
  MoreVerticalIcon,
  MoreHorizontalIcon,
  WarningBadgeIcon,
  RewindIcon,
  FavoriteOutlineIcon,
  FavoriteIcon,
  FeedbackIcon,
  QuoteBlockIcon,
  RadiateIcon,
  StarOutlineIcon,
  SignalAlertIcon,
  PercentIcon,
  BroadcastIcon,
  SyncCheckIcon,
  LibraryMusicIcon,
  RadioIcon,
  SailingIcon,
  ReceiptLongIcon,
  ReceiptIcon,
  ReportIcon,
  ReportOffIcon,
  RestaurantBellIcon,
  SaveFileIcon,
  SpeedGaugeIcon,
  RulerIcon,
  StarCircleIcon,
  MagicSparkIcon,
  ThumbUpIcon,
  TouchClickIcon,
  TrafficLightIcon,
  VerifiedBadgeIcon,
  CubeFocusIcon,
  HeartHandIcon,
  KeyIcon,
  KeyOffIcon,
  ClockIcon,
  OpenInNewIcon,
  LightBulbIcon,
  SparklesIcon,
  SmartSettingsIcon,
  SignalPathIcon,
  SunIcon,
  SoundIcon,
  VibrateIcon,
  TrashIcon,
  UploadIcon,
  EqualizerIcon,
  LoopIcon,
  SaveIcon,
  SaveEditIcon,
  CopyIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
  ShareIcon,
  WarningIcon,
  PrintIcon,
  DownloadIcon,
  ShuffleIcon,
  RefreshIcon,
  VisibilityIcon,
  VisibilityOffIcon,
  QrCodeIcon,
  CheckCircleIcon,
  CloseIcon,
  SearchIcon,
  ListIcon,
  TuneIcon,
  VolumeIcon,
  VolumeOffIcon,
  HeadphonesIcon,
  MoonIcon,
  ThemeSunIcon,
  SchoolIcon,
  KeyboardIcon,
  PortfolioIcon,
} as const;
