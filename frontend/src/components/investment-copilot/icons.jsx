/* Local icon components matching lucide-react API (size, color, className, style). */

function SvgIcon({ size = 24, color, className, style, children }) {
  const stroke = color ?? style?.color ?? "currentColor";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {children}
    </svg>
  );
}

export function ArrowLeft(props) {
  return (
    <SvgIcon {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </SvgIcon>
  );
}

export function ArrowRight(props) {
  return (
    <SvgIcon {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </SvgIcon>
  );
}

export function Send(props) {
  return (
    <SvgIcon {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </SvgIcon>
  );
}

export function CheckCircle2(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </SvgIcon>
  );
}

export function Circle(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="10" />
    </SvgIcon>
  );
}

export function Loader2(props) {
  return (
    <SvgIcon {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </SvgIcon>
  );
}

export function FileText(props) {
  return (
    <SvgIcon {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </SvgIcon>
  );
}

export function TrendingUp(props) {
  return (
    <SvgIcon {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </SvgIcon>
  );
}

export function TrendingDown(props) {
  return (
    <SvgIcon {...props}>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </SvgIcon>
  );
}

export function ShieldAlert(props) {
  return (
    <SvgIcon {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </SvgIcon>
  );
}

export function ChevronRight(props) {
  return (
    <SvgIcon {...props}>
      <path d="m9 18 6-6-6-6" />
    </SvgIcon>
  );
}

export function RotateCcw(props) {
  return (
    <SvgIcon {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </SvgIcon>
  );
}

export function ThumbsUp(props) {
  return (
    <SvgIcon {...props}>
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </SvgIcon>
  );
}

export function ThumbsDown(props) {
  return (
    <SvgIcon {...props}>
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </SvgIcon>
  );
}

export function Building2(props) {
  return (
    <SvgIcon {...props}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </SvgIcon>
  );
}

export function MessageSquare(props) {
  return (
    <SvgIcon {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </SvgIcon>
  );
}

export function Plus(props) {
  return (
    <SvgIcon {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </SvgIcon>
  );
}

export function User(props) {
  return (
    <SvgIcon {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </SvgIcon>
  );
}

export function Briefcase(props) {
  return (
    <SvgIcon {...props}>
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </SvgIcon>
  );
}
