const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconShieldCheck({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconAlertTriangle({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <path d="M12 4l9 16H3L12 4z" />
      <path d="M12 10v4" />
      <path d="M12 17.5v.01" />
    </svg>
  );
}

export function IconAlertOctagon({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <path d="M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z" />
      <path d="M12 8v5" />
      <path d="M12 16.5v.01" />
    </svg>
  );
}

export function IconClock({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconKey({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l8-8" />
      <path d="M16 7l2.5 2.5" />
      <path d="M13.5 9.5L16 12" />
    </svg>
  );
}

export function IconUserOff({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <path d="M5 20c0-3.6 3-6 7-6 1.3 0 2.5.3 3.5.8" />
      <circle cx="12" cy="8" r="3.5" />
      <path d="M3.5 3.5l17 17" />
    </svg>
  );
}

export function IconCreditCard({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 14.5h4" />
    </svg>
  );
}

export function IconGift({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M4 13h16" />
      <path d="M12 9v11" />
      <path d="M12 9c-1.5-3.5-6-3.5-6-1s3-1 6 1z" />
      <path d="M12 9c1.5-3.5 6-3.5 6-1s-3-1-6 1z" />
    </svg>
  );
}

export function IconLink({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <path d="M9.5 14.5l5-5" />
      <path d="M13 6.5l1.5-1.5a3.5 3.5 0 015 5L18 11.5" />
      <path d="M11 17.5L9.5 19a3.5 3.5 0 01-5-5L6 12.5" />
    </svg>
  );
}

export function IconAlertCircle({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.5" />
      <path d="M12 15.5v.01" />
    </svg>
  );
}

export function IconMessageCircle({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <path d="M4 12.5C4 7.8 7.8 4 12.5 4S21 7.8 21 12.5 17.2 21 12.5 21c-1.3 0-2.5-.3-3.6-.8L4 21l1.1-4.3c-.7-1.2-1.1-2.6-1.1-4.2z" />
    </svg>
  );
}

export function IconQrcode({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <rect x="3.5" y="3.5" width="6" height="6" rx="0.5" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="0.5" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="0.5" />
      <path d="M14.5 14.5h3v3h-3z" />
      <path d="M20.5 14.5v3" />
      <path d="M14.5 20.5h6" />
    </svg>
  );
}

export function IconVolume2({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <path d="M4 9.5v5h4l5 4v-13l-5 4H4z" />
      <path d="M16.5 9a4.5 4.5 0 010 6" />
      <path d="M19 6.5a8 8 0 010 11" />
    </svg>
  );
}

export function IconActivity({ size = 18, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
      <path d="M3 12h4l2.5 6L14 6l2 6h5" />
    </svg>
  );
}

export const ICONOS_MOTIVO = {
  urgencia: IconClock,
  datos: IconKey,
  suplantacion: IconUserOff,
  pago: IconCreditCard,
  oferta: IconGift,
  url: IconLink,
  combinacion: IconAlertTriangle,
};
