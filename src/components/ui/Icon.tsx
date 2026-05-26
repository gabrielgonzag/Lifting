import type { CSSProperties, ReactNode, SVGProps } from "react";

export type IconName =
  | "arrow_l"
  | "arrow_r"
  | "bell"
  | "book"
  | "calendar"
  | "chart"
  | "check"
  | "chevron_d"
  | "chevron_u"
  | "clock"
  | "drag"
  | "dumbbell"
  | "edit"
  | "flame"
  | "google"
  | "home"
  | "info"
  | "list"
  | "log_out"
  | "note"
  | "profile"
  | "play"
  | "plus"
  | "search"
  | "settings"
  | "sparkles"
  | "timer"
  | "trash"
  | "trophy"
  | "x";

type IconProps = {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
} & Omit<SVGProps<SVGSVGElement>, "name" | "stroke">;

export function Icon({ name, size = 18, stroke = 1.6, className = "", style, ...props }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style,
    ...props,
  };
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" /><path d="M4 19.5V21h16" /></>,
    list: <><path d="M9 6h11" /><path d="M9 12h11" /><path d="M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></>,
    dumbbell: <><path d="M6.5 6.5l11 11" /><path d="M3 9l3-3 3 3-3 3z" /><path d="M15 15l3-3 3 3-3 3z" /><path d="M4.5 13.5l1.5 1.5" /><path d="M18 6l1.5 1.5" /></>,
    chart: <><path d="M4 20V8" /><path d="M10 20V4" /><path d="M16 20v-8" /><path d="M3 20h18" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.4.4 1 .7 1.5.7H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    check: <path d="M5 12l5 5L20 7" />,
    x: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
    arrow_r: <><path d="M5 12h14" /><path d="M13 5l7 7-7 7" /></>,
    arrow_l: <><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></>,
    play: <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    flame: <path d="M12 22c4.4 0 8-3.4 8-7.6 0-3.2-1.8-5.6-4-7.4 0 2.3-1.5 3-2.5 3.5C13 7 12.5 4 9 2c.5 4-3 5.6-3 10 0 4.2 3.6 10 6 10z" />,
    trophy: <><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M17 4h3v2a3 3 0 0 1-3 3" /><path d="M7 4H4v2a3 3 0 0 0 3 3" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M3 10h18" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
    trash: <><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></>,
    timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M9 2h6" /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    sparkles: <><path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" /><path d="M19 13l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>,
    log_out: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
    note: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    chevron_d: <path d="M6 9l6 6 6-6" />,
    chevron_u: <path d="M18 15l-6-6-6 6" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01" /><path d="M11 12h1v4h1" /></>,
    drag: <><circle cx="8" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="8" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="8" cy="18" r="1.2" fill="currentColor" stroke="none" /><circle cx="16" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="16" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="16" cy="18" r="1.2" fill="currentColor" stroke="none" /></>,
    google: <><path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" stroke="none" /><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853" stroke="none" /><path d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z" fill="#FBBC04" stroke="none" /><path d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6A6 6 0 0 1 12 5.8z" fill="#EA4335" stroke="none" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}
