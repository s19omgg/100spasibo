import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { getBrowserPath } from "../lib/routing";
import applyIllustration from "../assets/apply-illustration.png";
import handsIllustration from "../assets/hands-illustration.png";
import homeIllustration from "../assets/home-illustration.png";
import type { HelpRequest } from "../data/requests";
import { formatRubles, getPercent, requests } from "../data/requests";

export type NavigateFn = (path: string) => void;
const TELEGRAM_CONTACT_URL = "https://t.me/stospasibo?direct";

type IconName =
  | "heart"
  | "hands"
  | "file"
  | "shield"
  | "video"
  | "check"
  | "copy"
  | "lock"
  | "phone"
  | "mail"
  | "telegram"
  | "search"
  | "map"
  | "users"
  | "arrowLeft"
  | "upload"
  | "card"
  | "calendar"
  | "home"
  | "book"
  | "play"
  | "share"
  | "menu"
  | "x"
  | "chevron"
  | "bank"
  | "spark";

export function Icon({ name, className = "", filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  const common = {
    className: `icon ${className}`,
    viewBox: "0 0 24 24",
    fill: filled ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.2 5.8a5.1 5.1 0 0 0-7.2 0L12 6.8l-1-1a5.1 5.1 0 0 0-7.2 7.2l1 1L12 21l7.2-7 1-1a5.1 5.1 0 0 0 0-7.2Z" />
        </svg>
      );
    case "hands":
      return (
        <svg {...common}>
          <path d="M7 12.5 3.7 9.4a2 2 0 0 0-2.7 2.9l5.8 5.5a5 5 0 0 0 3.5 1.4H12" />
          <path d="M17 12.5 20.3 9.4a2 2 0 0 1 2.7 2.9l-5.8 5.5a5 5 0 0 1-3.5 1.4H12" />
          <path d="M12 15.2 8.8 12a3 3 0 0 1 4.2-4.2l.2.2.2-.2a3 3 0 1 1 4.2 4.2L14.4 15a3.3 3.3 0 0 1-4.8.2Z" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v5h5" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-3.4 8-10V5l-8-3-8 3v7c0 6.6 8 10 8 10Z" />
          <path d="m8.7 12 2.2 2.2 4.6-4.8" />
        </svg>
      );
    case "video":
      return (
        <svg {...common}>
          <path d="M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
          <path d="m17 10 5-3v10l-5-3Z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "copy":
      return (
        <svg {...common}>
          <rect x="8" y="8" width="11" height="13" rx="2" />
          <path d="M5 16H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="m22 7-10 6L2 7" />
        </svg>
      );
    case "telegram":
      return (
        <svg {...common}>
          <path d="M21.5 3.6 2.8 10.8c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.4 1 1 1 .6 0 .9-.3 1.2-.6l2.9-2.8 5 3.7c.9.5 1.5.3 1.7-.9l3-14.2c.3-1.3-.5-1.8-1.5-1.4Z" />
          <path d="m7.5 13.6 11.1-7" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
        </svg>
      );
    case "arrowLeft":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="m7 8 5-5 5 5" />
          <path d="M5 21h14" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="m3 11 9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5Z" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="m9 7 8 5-8 5Z" />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "bank":
      return (
        <svg {...common}>
          <path d="M3 10h18L12 4Z" />
          <path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 2v6M12 16v6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2" />
        </svg>
      );
    default:
      return null;
  }
}

export function BrandMark({ className = "" }: { className?: string }) {
  const rawId = useId().replace(/:/g, "");
  const coralId = `${rawId}-coral`;
  const peachId = `${rawId}-peach`;
  const mintId = `${rawId}-mint`;

  return (
    <svg className={`brand-mark-svg ${className}`} viewBox="6 4 84 88" aria-hidden="true">
      <defs>
        <linearGradient id={coralId} x1="24" y1="18" x2="67" y2="73" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB58C" />
          <stop offset="0.58" stopColor="#FF7564" />
          <stop offset="1" stopColor="#F7A2A8" />
        </linearGradient>
        <linearGradient id={peachId} x1="6" y1="38" x2="44" y2="91" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB16C" />
          <stop offset="1" stopColor="#FF8D75" />
        </linearGradient>
        <linearGradient id={mintId} x1="58" y1="38" x2="88" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9FCBC4" />
          <stop offset="1" stopColor="#6FAEA4" />
        </linearGradient>
      </defs>

      <circle cx="19" cy="35" r="6.5" fill={`url(#${coralId})`} opacity="0.68" />
      <circle cx="33" cy="25" r="6.5" fill={`url(#${peachId})`} opacity="0.78" />
      <circle cx="63" cy="25" r="6.5" fill="#FFC17C" opacity="0.74" />
      <circle cx="77" cy="35" r="6.5" fill={`url(#${mintId})`} opacity="0.74" />
      <path
        d="M48 10.5c3.6-6 13.2-5.7 15.6 1.4 1.9 5.8-3.8 10.8-15.6 19.4-11.8-8.6-17.5-13.6-15.6-19.4 2.4-7.1 12-7.4 15.6-1.4Z"
        fill="#F8A0A6"
        opacity="0.86"
      />
      <circle cx="48" cy="33" r="2.6" fill="#FF8B78" />

      <path
        d="M20 43c-4.2 2.2-8.4 6.6-9.5 13.9-1.9 12.7 8.4 25.4 24.6 29.9 7.8 2.1 15.4 1.7 21.6-.7-16.8-4.2-25.5-13.5-28.5-27.1C26.7 52.7 24.8 47 20 43Z"
        fill={`url(#${peachId})`}
      />
      <path
        d="M76 43c4.2 2.2 8.4 6.6 9.5 13.9 1.9 12.7-8.4 25.4-24.6 29.9-7.8 2.1-15.4 1.7-21.6-.7 16.8-4.2 25.5-13.5 28.5-27.1C69.3 52.7 71.2 47 76 43Z"
        fill={`url(#${mintId})`}
      />
      <path
        d="M48 37.3c6.8-10.1 22-7.9 24.4 3.5 2.3 11.2-8.9 20.9-24.4 32.1-15.5-11.2-26.7-20.9-24.4-32.1 2.4-11.4 17.6-13.6 24.4-3.5Z"
        fill={`url(#${coralId})`}
      />
      <path
        d="M21.6 47.4c5.2-7.8 14.3-11.7 26.2-11.7M74.4 47.4C69.2 39.6 60.1 35.7 48.2 35.7"
        fill="none"
        stroke="#FFF8F2"
        strokeWidth="5.4"
        strokeLinecap="round"
      />
      <path
        d="M34.7 75.2c5.7 1.2 10 4.7 13.3 10.2 3.3-5.5 7.6-9 13.3-10.2M48 85.4v6.1"
        fill="none"
        stroke={`url(#${mintId})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="48"
        y="57.5"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Manrope, Inter, Arial, sans-serif"
        fontSize="19"
        fontWeight="900"
        letterSpacing="-1"
      >
        100
      </text>
    </svg>
  );
}

export function Logo({ onNavigate }: { onNavigate: NavigateFn }) {
  return (
    <button className="logo" type="button" onClick={() => onNavigate("/")} aria-label="100spasibo, на главную">
      <span className="logo-mark">
        <BrandMark />
      </span>
      <span className="logo-copy">
        <span className="logo-title">
          <span>100</span>spasibo
        </span>
        <span className="logo-subtitle">люди помогают людям</span>
      </span>
    </button>
  );
}

export function AppLink({
  to,
  children,
  className = "",
  onNavigate,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onNavigate: NavigateFn;
}) {
  return (
    <a
      href={getBrowserPath(to)}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(to);
      }}
    >
      {children}
    </a>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "mint" | "soft" | "ghost";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} className={`button button-${variant} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "peach",
  icon,
}: {
  children: ReactNode;
  tone?: "peach" | "mint" | "white";
  icon?: IconName;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </span>
  );
}

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="progress" aria-label={`Собрано ${percent}%`}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}

type SelectOption = string | { label: string; value: string };

export function PrettySelect({
  label,
  name,
  options,
  placeholder,
  defaultValue,
  className = "",
}: {
  label?: string;
  name?: string;
  options: SelectOption[];
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}) {
  const normalized = options.map((option) => (typeof option === "string" ? { label: option, value: option } : option));
  const initialValue = defaultValue ?? (placeholder ? "" : normalized[0]?.value ?? "");
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = normalized.find((option) => option.value === value);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className={`pretty-select ${className}`} ref={rootRef}>
      {label ? <span className="pretty-select-label">{label}</span> : null}
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        type="button"
        className={`pretty-select-trigger ${open ? "is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span>{selected?.label ?? placeholder ?? "Выберите"}</span>
        <Icon name="chevron" />
      </button>
      {open ? (
        <div className="pretty-select-menu" role="listbox">
          {placeholder ? (
            <button
              type="button"
              className={`pretty-select-option ${!value ? "selected" : ""}`}
              role="option"
              aria-selected={!value}
              onClick={() => {
                setValue("");
                setOpen(false);
              }}
            >
              {!value ? <Icon name="check" /> : <span aria-hidden="true" />}
              <span>{placeholder}</span>
            </button>
          ) : null}
          {normalized.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`pretty-select-option ${option.value === value ? "selected" : ""}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                setValue(option.value);
                setOpen(false);
              }}
            >
              {option.value === value ? <Icon name="check" /> : <span aria-hidden="true" />}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Header({ onNavigate }: { onNavigate: NavigateFn }) {
  const [open, setOpen] = useState(false);
  const nav = [
    { label: "Как это работает", to: "/how-it-works" },
    { label: "Нужна помощь", to: "/apply" },
    { label: "Хочу помочь", to: "/requests" },
    { label: "Истории", to: "/stories" },
  ];

  const handleNavigate = (to: string) => {
    setOpen(false);
    onNavigate(to);
  };

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo onNavigate={handleNavigate} />
        <nav className="desktop-nav" aria-label="Основная навигация">
          {nav.map((item) => (
            <AppLink key={item.to + item.label} to={item.to} onNavigate={handleNavigate}>
              {item.label}
            </AppLink>
          ))}
        </nav>
        <Button className="header-cta" onClick={() => handleNavigate("/requests")}>
          <Icon name="heart" filled />
          Поддержать сейчас
        </Button>
        <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          <Icon name={open ? "x" : "menu"} />
          <span className="sr-only">Открыть меню</span>
        </button>
      </div>
      {open ? (
        <nav className="mobile-nav" aria-label="Мобильная навигация">
          {nav.map((item) => (
            <AppLink key={item.to + item.label} to={item.to} onNavigate={handleNavigate}>
              {item.label}
            </AppLink>
          ))}
          <Button onClick={() => handleNavigate("/requests")}>
            <Icon name="heart" filled />
            Поддержать сейчас
          </Button>
        </nav>
      ) : null}
    </header>
  );
}

export function Footer({ onNavigate }: { onNavigate: NavigateFn }) {
  const columns = [
    {
      title: "Платформа",
      links: [
        ["Как это работает", "/how-it-works"],
        ["Нужна помощь", "/apply"],
        ["Хочу помочь", "/requests"],
        ["Истории", "/stories"],
        ["Вопросы и ответы", "/faq"],
      ],
    },
    {
      title: "Информация",
      links: [
        ["О нас", "/how-it-works"],
        ["Правила платформы", "/terms"],
        ["Безопасность", "/safety"],
        ["Отчеты", "/stories"],
        ["Контакты", "/faq"],
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Logo onNavigate={onNavigate} />
          <p>Прозрачно помогаем реальным людям в трудной жизненной ситуации.</p>
        </div>
        {columns.map((column) => (
          <div key={column.title} className="footer-column">
            <h3>{column.title}</h3>
            {column.links.map(([label, to]) => (
              <AppLink key={label} to={to} onNavigate={onNavigate}>
                {label}
              </AppLink>
            ))}
          </div>
        ))}
        <div className="footer-column">
          <h3>Поддержка</h3>
          <a href={TELEGRAM_CONTACT_URL} target="_blank" rel="noreferrer">
            <Icon name="telegram" />
            Написать в Telegram
          </a>
        </div>
        <div className="footer-social">
          <h3>Связь с нами</h3>
          <div className="social-row" aria-label="Социальные сети">
            <a href={TELEGRAM_CONTACT_URL} target="_blank" rel="noreferrer">TG</a>
          </div>
        </div>
      </div>
      <div className="shell footer-disclaimer">
        <div>
          <span>© 100spasibo, 2024. Все права защищены.</span>
          <AppLink to="/privacy" onNavigate={onNavigate}>Политика конфиденциальности</AppLink>
          <AppLink to="/terms" onNavigate={onNavigate}>Пользовательское соглашение</AppLink>
        </div>
      </div>
    </footer>
  );
}

export function RequestCard({ request, onNavigate, compact = false }: { request: HelpRequest; onNavigate: NavigateFn; compact?: boolean }) {
  const percent = getPercent(request);
  return (
    <article className={`request-card ${compact ? "request-card-compact" : ""}`}>
      <div className="request-head">
        <img src={request.image} alt={`${request.name}, ${request.city}`} width="88" height="88" loading="lazy" />
        <div>
          <h3>{request.name}</h3>
          <span className="muted-inline">
            <Icon name="map" />
            {request.city}
          </span>
        </div>
      </div>
      <p>{request.reason}</p>
      <div className="request-money">
        <span>Цель: {formatRubles(request.targetAmount)}</span>
        <span>Собрано: {formatRubles(request.collectedAmount)}</span>
      </div>
      <ProgressBar percent={percent} />
      <div className="request-bottom">
        <span className="progress-percent">{percent}%</span>
        <span className="days-left">Осталось {request.daysLeft} дней</span>
      </div>
      <div className="request-actions">
        <Badge tone={request.verified ? "mint" : "peach"} icon={request.verified ? "shield" : "file"}>
          {request.verified ? "Документы проверены" : "На проверке"}
        </Badge>
        <Button onClick={() => onNavigate(`/requests/${request.id}`)}>
          <Icon name="heart" />
          Помочь
        </Button>
      </div>
    </article>
  );
}

export function StepCard({ index, icon, title, text }: { index: number; icon: IconName; title: string; text: string }) {
  return (
    <article className="step-card">
      <span className="step-icon">
        <span className="step-index">{index}</span>
        <Icon name={icon} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}

export function TrustCard({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <article className="trust-card">
      <span className="trust-icon">
        <Icon name={icon} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}

export function InfoBanner({ tone, icon, title, text }: { tone: "peach" | "mint"; icon: IconName; title: string; text: string }) {
  return (
    <article className={`info-banner info-${tone}`}>
      <span>
        <Icon name={icon} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}

export function FilterSidebar({ count }: { count: number }) {
  const categories = ["Лечение и здоровье", "Долги и кредиты", "Коммунальные платежи", "Аренда жилья", "Образование", "Другое"];
  const cities = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Ростов-на-Дону", "Краснодар", "Екатеринбург"];
  const urgency = ["Срочно", "В течение недели", "В течение месяца", "Не срочно"];
  return (
    <aside className="filter-sidebar">
      <div className="filter-top">
        <h2>Фильтры</h2>
        <button type="button">Сбросить все</button>
      </div>
      <FilterGroup title="Тип долга" items={categories} />
      <div className="filter-group">
        <h3>Сумма сбора</h3>
        <div className="range-inputs">
          <label>
            <span>От</span>
            <input inputMode="numeric" placeholder="0" />
          </label>
          <label>
            <span>До</span>
            <input inputMode="numeric" placeholder="100 000" />
          </label>
        </div>
        <input className="range" type="range" min="0" max="100000" defaultValue="45000" />
      </div>
      <div className="filter-group">
        <h3>Город</h3>
        <PrettySelect options={cities} placeholder="Выберите город" className="filter-select" />
      </div>
      <FilterGroup title="Срочность" items={urgency} />
      <FilterGroup title="Статус проверки" items={["Документы проверены", "На проверке"]} />
      <Button variant="mint" className="wide">Показать {count} заявки</Button>
    </aside>
  );
}

function FilterGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="filter-group">
      <h3>{title}</h3>
      <div className="check-stack">
        {items.map((item) => (
          <label key={item}>
            <input type="checkbox" />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function DonationPanel({ request, onToast }: { request: HelpRequest; onToast: (message: string) => void }) {
  const [tab, setTab] = useState<"bank" | "sbp">("bank");
  const [amount, setAmount] = useState("100");
  const [receiptName, setReceiptName] = useState("");
  const rows =
    tab === "bank"
      ? [
          ["Получатель", request.recipient.name],
          ["Банк получателя", request.recipient.bank],
          ["Номер карты", request.recipient.card],
        ]
      : [
          ["Получатель", request.recipient.name],
          ["Телефон для СБП", request.recipient.sbpPhone],
          ["Банк", request.recipient.bank],
        ];

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      onToast("Скопировано");
    } catch {
      onToast("Можно выделить и скопировать вручную");
    }
  };

  return (
    <aside className="donation-panel">
      <h2>Помочь {request.name}</h2>
      <div className="tab-row" role="tablist" aria-label="Способ перевода">
        <button className={tab === "bank" ? "active" : ""} type="button" onClick={() => setTab("bank")}>
          <Icon name="bank" />
          Банковский перевод
        </button>
        <button className={tab === "sbp" ? "active" : ""} type="button" onClick={() => setTab("sbp")}>
          <Icon name="card" />
          Перевод через СБП
        </button>
      </div>
      <div className="requisites">
        {rows.map(([label, value]) => (
          <div className="requisite-row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <button type="button" onClick={() => copy(value)} aria-label={`Скопировать: ${label}`}>
              <Icon name="copy" />
            </button>
          </div>
        ))}
      </div>
      <div className="quick-amounts" aria-label="Быстрые суммы">
        {["100", "300", "500"].map((value) => (
          <button key={value} type="button" className={amount === value ? "active" : ""} onClick={() => setAmount(value)}>
            {value} ₽
          </button>
        ))}
        <button type="button" className={amount === "custom" ? "active" : ""} onClick={() => setAmount("custom")}>
          Своя сумма
        </button>
      </div>
      <label className="amount-input">
        <span>Введите сумму</span>
        <input inputMode="numeric" value={amount === "custom" ? "" : amount} onChange={(event) => setAmount(event.target.value)} placeholder="Например, 700" />
      </label>
      <div className="purpose-note">
        <Icon name="spark" />
        <div>
          <span>В назначении платежа укажите:</span>
          <strong>Благотворительность</strong>
        </div>
      </div>
      <p className="reassurance">
        <Icon name="shield" />
        Мы проверяем заявки и публикуем отчеты. Каждый перевод — это реальная помощь.
      </p>
      <label className={`receipt-upload ${receiptName ? "has-file" : ""}`}>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(event) => setReceiptName(event.target.files?.[0]?.name ?? "")}
        />
        <span className="receipt-upload-icon">
          <Icon name={receiptName ? "check" : "upload"} />
        </span>
        <span>
          <strong>{receiptName || "Прикрепить чек перевода"}</strong>
          <small>{receiptName ? "Файл добавлен к подтверждению помощи" : "PDF, JPG или PNG. До 10 МБ"}</small>
        </span>
      </label>
      <Button
        className="wide big"
        onClick={() => {
          if (!receiptName) {
            onToast("Пожалуйста, прикрепите чек перевода.");
            return;
          }
          onToast("Спасибо. Чек прикреплен, мы отметим помощь после подтверждения.");
        }}
      >
        <Icon name="heart" filled />
        Я помог
      </Button>
      <p className="security-note">
        <Icon name="lock" />
        Данные защищены и не передаются третьим лицам.
      </p>
    </aside>
  );
}

export function VerifiedDocuments({ documents }: { documents: string[] }) {
  return (
    <section className="soft-card">
      <h2>Какие документы проверены</h2>
      <ul className="doc-list">
        {documents.map((item) => (
          <li key={item}>
            <Icon name="file" />
            {item}
          </li>
        ))}
      </ul>
      <p className="tiny">Все документы проверены модераторами платформы. Публично отображается только безопасная информация.</p>
    </section>
  );
}

export function Timeline({ items }: { items: HelpRequest["updates"] }) {
  return (
    <section className="soft-card">
      <h2>Ход сбора и обновления</h2>
      <ol className="timeline">
        {items.map((item) => (
          <li key={item.date + item.text}>
            <span>{item.date}</span>
            <p>{item.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function UploadBox({ name = "documents" }: { name?: string }) {
  const [files, setFiles] = useState<string[]>([]);
  return (
    <label className="upload-box">
      <input
        type="file"
        name={name}
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(event) => setFiles(Array.from(event.target.files ?? []).map((file) => file.name))}
      />
      <span className="upload-icon">
        <Icon name="upload" />
      </span>
      <strong>Перетащите файлы сюда или нажмите, чтобы выбрать</strong>
      <small>PDF, JPG, PNG. До 10 МБ на файл.</small>
      {files.length ? <em>{files.join(", ")}</em> : null}
    </label>
  );
}

export function Toast({ message }: { message: string }) {
  return message ? <div className="toast" role="status">{message}</div> : null;
}

export function WatercolorHero({ type = "people" }: { type?: "people" | "hands" | "apply" }) {
  const image = type === "hands" ? handsIllustration : type === "apply" ? applyIllustration : homeIllustration;
  return (
    <div className={`watercolor watercolor-${type}`} aria-hidden="true">
      <img src={image} alt="" />
    </div>
  );
}

function PeopleIllustration() {
  return (
    <div className="illustration people-illustration">
      <span className="plant plant-left" />
      <span className="plant plant-right" />
      <span className="table" />
      <span className="mug mug-left" />
      <span className="mug mug-right" />
      <span className="paper paper-left" />
      <span className="paper paper-right" />
      <span className="laptop" />
      <span className="person person-left">
        <i className="hair" />
        <i className="head" />
        <i className="body" />
      </span>
      <span className="person person-right">
        <i className="hair" />
        <i className="head" />
        <i className="body" />
      </span>
      <span className="tiny-heart heart-one" />
      <span className="tiny-heart heart-two" />
    </div>
  );
}

function HandsIllustration() {
  return (
    <div className="illustration hands-illustration">
      <span className="branch branch-left" />
      <span className="branch branch-right" />
      <span className="palm palm-left" />
      <span className="palm palm-right" />
      <span className="big-heart" />
      <span className="tiny-heart heart-one" />
      <span className="tiny-heart heart-two" />
      <span className="tiny-heart heart-three" />
    </div>
  );
}

function ApplyIllustration() {
  return (
    <div className="illustration apply-illustration">
      <span className="window" />
      <span className="desk" />
      <span className="book book-one" />
      <span className="book book-two" />
      <span className="mug mug-left" />
      <span className="plant plant-left" />
      <span className="paper paper-left" />
      <span className="person person-writing">
        <i className="hair" />
        <i className="head" />
        <i className="body" />
        <i className="arm" />
      </span>
    </div>
  );
}

export const catalogCount = requests.length;
