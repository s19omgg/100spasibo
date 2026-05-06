import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  AppLink,
  Badge,
  BrandMark,
  Button,
  DonationPanel,
  FilterSidebar,
  Icon,
  InfoBanner,
  PrettySelect,
  ProgressBar,
  RequestCard,
  StepCard,
  Timeline,
  Toast,
  TrustCard,
  VerifiedDocuments,
  WatercolorHero,
  type NavigateFn,
} from "./components/ui";
import { formatRubles, requests as seedRequests, type HelpRequest } from "./data/requests";
import {
  isBackendConfigured,
  listApplications,
  listPublishedRequests,
  updateApplicationStatus,
  type ApplicationRecord,
} from "./lib/applications";
import { getBrowserPath, getRoutePath } from "./lib/routing";
import "./styles.css";

const ADMIN_PASSWORD_HASH = "89dff4423dd73af217eb641b9050a34ce2623f392919258ee754e402be74953f";
const ADMIN_SESSION_KEY = "100spasibo:admin-unlocked";
const ONBOARDING_KEY = "100spasibo:onboarding-seen";
const TELEGRAM_CONTACT_URL = "https://t.me/stospasibo?direct";
const AUTHOR_DONATE_URL = "https://pay.cloudtips.ru/p/dab39b3d";
const REQUESTS_PER_PAGE = 8;

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        openTelegramLink?: (url: string) => void;
        BackButton?: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
      };
    };
  }
}

async function getSha256(value: string) {
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getAbsoluteRouteUrl(routePath: string) {
  return new URL(getBrowserPath(routePath), window.location.origin).toString();
}

async function shareHelpRequest(request: HelpRequest, onToast: (message: string) => void) {
  const routePath = `/requests/${request.id}`;
  const shareUrl = getAbsoluteRouteUrl(routePath);
  const title = `Помочь ${request.name} на 100spasibo`;
  const text = `${request.name}, ${request.city}: ${request.reason} Помощь идет напрямую человеку.`;

  try {
    if (navigator.share) {
      await navigator.share({ title, text, url: shareUrl });
      onToast("Заявка готова к отправке.");
      return;
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
  }

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
  try {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(telegramShareUrl);
    } else {
      window.open(telegramShareUrl, "_blank", "noopener,noreferrer");
    }
    await navigator.clipboard.writeText(`${text} ${shareUrl}`);
    onToast("Открыли Telegram и скопировали ссылку.");
  } catch {
    window.open(telegramShareUrl, "_blank", "noopener,noreferrer");
    onToast("Открыли Telegram для отправки заявки.");
  }
}

function usePath() {
  const [path, setPath] = useState(getRoutePath());

  useEffect(() => {
    const handlePop = () => setPath(getRoutePath());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const navigate: NavigateFn = (nextPath) => {
    if (getRoutePath() !== nextPath) {
      window.history.pushState({}, "", getBrowserPath(nextPath));
      setPath(nextPath);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return { path, navigate };
}

function useTelegramMiniApp(path: string, navigate: NavigateFn) {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    webApp?.ready();
    webApp?.expand();
    webApp?.setHeaderColor?.("#fff8f2");
    webApp?.setBackgroundColor?.("#fff8f2");
  }, []);

  useEffect(() => {
    const backButton = window.Telegram?.WebApp?.BackButton;
    if (!backButton) return undefined;

    const handleBack = () => {
      if (path.startsWith("/requests/")) {
        navigate("/requests");
        return;
      }
      if (path.startsWith("/stories/")) {
        navigate("/stories");
        return;
      }
      navigate("/");
    };

    if (path === "/") {
      backButton.hide();
      return undefined;
    }

    backButton.show();
    backButton.onClick(handleBack);
    return () => backButton.offClick(handleBack);
  }, [path, navigate]);
}

export default function App() {
  const { path, navigate } = usePath();
  const [toast, setToast] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(() => window.localStorage.getItem(ADMIN_SESSION_KEY) === "true");
  const [showOnboarding, setShowOnboarding] = useState(() => window.localStorage.getItem(ONBOARDING_KEY) !== "true");
  const [publishedRequests, setPublishedRequests] = useState<HelpRequest[]>([]);
  useTelegramMiniApp(path, navigate);

  const allRequests = useMemo(() => [...publishedRequests, ...seedRequests], [publishedRequests]);

  const refreshPublishedRequests = async () => {
    try {
      const items = await listPublishedRequests();
      setPublishedRequests(items);
    } catch {
      setPublishedRequests([]);
    }
  };

  useEffect(() => {
    void refreshPublishedRequests();
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const completeOnboarding = (nextPath?: string) => {
    window.localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
    if (nextPath) navigate(nextPath);
  };

  const page = (() => {
    if (path === "/requests") return <RequestsPage requests={allRequests} onNavigate={navigate} />;
    if (path.startsWith("/requests/")) return <RequestDetailPage requests={allRequests} id={path.split("/").pop()} onNavigate={navigate} onToast={showToast} />;
    if (path === "/apply") return <ApplyPage />;
    if (path === "/how-it-works") return <HowItWorksPage onNavigate={navigate} />;
    if (path.startsWith("/stories/")) return <StoriesPage onNavigate={navigate} />;
    if (path === "/stories") return <StoriesPage onNavigate={navigate} />;
    if (path === "/admin") {
      return adminUnlocked ? (
        <AdminDashboardPage
          onNavigate={navigate}
          onToast={showToast}
          onPublished={refreshPublishedRequests}
          onLogout={() => {
            window.localStorage.removeItem(ADMIN_SESSION_KEY);
            setAdminUnlocked(false);
            showToast("Админ-панель закрыта.");
          }}
        />
      ) : (
        <AdminAccessPage
          onNavigate={navigate}
          onToast={showToast}
          onUnlock={() => {
            window.localStorage.setItem(ADMIN_SESSION_KEY, "true");
            setAdminUnlocked(true);
            showToast("Админ-панель открыта.");
          }}
        />
      );
    }
    if (path === "/safety") return <SafetyPage />;
    if (path === "/support-author") return <SupportAuthorPage onNavigate={navigate} />;
    if (path === "/privacy") return <PrivacyPage onNavigate={navigate} />;
    if (path === "/terms") return <TermsPage onNavigate={navigate} />;
    if (path === "/faq") return <FaqPage />;
    return <HomePage requests={allRequests} onNavigate={navigate} />;
  })();

  return (
    <div className="telegram-mini-app">
      <MiniAppTopBar onNavigate={navigate} />
      <main className="telegram-mini-main">{page}</main>
      {path === "/admin" ? null : <MiniAppBottomNav path={path} onNavigate={navigate} />}
      {showOnboarding && path !== "/admin" ? <OnboardingOverlay onComplete={completeOnboarding} /> : null}
      <Toast message={toast} />
    </div>
  );
}

function MiniAppTopBar({ onNavigate }: { onNavigate: NavigateFn }) {
  return (
    <header className="telegram-topbar">
      <button className="telegram-brand" type="button" onClick={() => onNavigate("/")}>
        <span className="telegram-brand-mark">
          <BrandMark />
        </span>
        <span>
          <strong><span>100</span>spasibo</strong>
          <small>платформа взаимопомощи</small>
        </span>
      </button>
      <a className="telegram-contact-link" href={TELEGRAM_CONTACT_URL} target="_blank" rel="noreferrer">
        <Icon name="telegram" />
      </a>
    </header>
  );
}

function MiniAppBottomNav({ path, onNavigate }: { path: string; onNavigate: NavigateFn }) {
  const tabs = [
    { label: "Главная", to: "/", icon: "home" },
    { label: "Помочь", to: "/requests", icon: "heart" },
    { label: "Заявка", to: "/apply", icon: "file" },
    { label: "Истории", to: "/stories", icon: "video" },
  ] as const;

  return (
    <nav className="telegram-bottom-nav" aria-label="Навигация мини-приложения">
      {tabs.map((tab) => {
        const active = tab.to === "/" ? path === "/" : path.startsWith(tab.to);
        return (
          <button key={tab.to} type="button" className={active ? "active" : ""} onClick={() => onNavigate(tab.to)}>
            <Icon name={tab.icon} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const onboardingSlides = [
  {
    icon: "heart",
    title: "Люди помогают людям",
    text: "Вы выбираете конкретную заявку и помогаете напрямую человеку, без перевода денег платформе.",
  },
  {
    icon: "shield",
    title: "Заявки проходят проверку",
    text: "Мы смотрим документы и публикуем только безопасную часть истории, чтобы помощь была честной и адресной.",
  },
  {
    icon: "video",
    title: "После сбора есть отчет",
    text: "Получатель показывает результат: чек, видеоотчет и благодарность всем, кто помог.",
  },
] as const;

function OnboardingOverlay({ onComplete }: { onComplete: (nextPath?: string) => void }) {
  const [step, setStep] = useState(0);
  const slide = onboardingSlides[step];
  const isLast = step === onboardingSlides.length - 1;

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-card">
        <button className="onboarding-close" type="button" onClick={() => onComplete()} aria-label="Закрыть приветствие">
          <Icon name="x" />
        </button>
        <div className="onboarding-visual">
          <span className="onboarding-icon">
            <Icon name={slide.icon} />
          </span>
          <div className="onboarding-dots" aria-hidden="true">
            {onboardingSlides.map((item, index) => (
              <span key={item.title} className={index === step ? "active" : ""} />
            ))}
          </div>
        </div>
        <div className="onboarding-copy">
          <Badge tone={step === 1 ? "mint" : "peach"} icon={slide.icon}>{step + 1} из {onboardingSlides.length}</Badge>
          <h2 id="onboarding-title">{slide.title}</h2>
          <p>{slide.text}</p>
        </div>
        <div className="onboarding-actions">
          <Button variant="ghost" onClick={() => onComplete()}>Пропустить</Button>
          <Button onClick={() => (isLast ? onComplete("/requests") : setStep((current) => current + 1))}>
            {isLast ? "Смотреть заявки" : "Дальше"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function HomePage({ requests, onNavigate }: { requests: HelpRequest[]; onNavigate: NavigateFn }) {
  const hasRequests = requests.length > 0;

  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <Badge icon="heart">Люди помогают людям</Badge>
          <h1>
            Помощь, которая идет <span>напрямую</span> человеку
          </h1>
          <p>
            Мы проверяем заявки и документы, а вы помогаете напрямую. Даже 100 рублей могут стать важным шагом к
            решению чьей-то проблемы.
          </p>
          <div className="hero-actions">
            <Button onClick={() => onNavigate("/apply")}>
              <Icon name="hands" />
              Мне нужна помощь
            </Button>
            <Button variant="mint" onClick={() => onNavigate("/requests")}>
              <Icon name="heart" />
              Хочу помочь
            </Button>
          </div>
          <div className="social-proof social-proof-empty">
            <span><Icon name="spark" /></span>
            <p>{hasRequests ? "Открыта первая проверенная заявка. Помощь идет напрямую человеку." : "Первые заявки скоро появятся на платформе."}</p>
          </div>
        </div>
        <WatercolorHero />
      </section>

      <section className="section shell">
        <div className="center-heading">
          <h2>Как это работает</h2>
        </div>
        <div className="steps-grid">
          <StepCard index={1} icon="video" title="Заявка" text="Человек записывает видео: рассказывает свою историю и показывает кредиты в личных кабинетах банков." />
          <StepCard index={2} icon="shield" title="Проверка ситуации" text="Мы смотрим видео и уточняем детали, чтобы помощь была честной, адресной и безопасной." />
          <StepCard index={3} icon="hands" title="Прямая помощь" text="После одобрения заявка публикуется. Люди переводят деньги напрямую получателю." />
          <StepCard index={4} icon="video" title="Видеоотчет" text="После сбора получатель показывает, как помощь была использована." />
        </div>
      </section>

      <section className="section shell">
        <div className="section-row">
          <div>
            <h2>Кому нужна помощь прямо сейчас</h2>
            <p>{hasRequests ? "Выберите человека, которому хотите помочь напрямую." : "Пока опубликованных заявок нет. Как только мы проверим первые заявки, они появятся здесь."}</p>
          </div>
          <Button variant="soft" onClick={() => onNavigate("/requests")}>Смотреть все заявки</Button>
        </div>
        {requests.length ? (
          <div className="featured-grid">
            {requests.slice(0, 3).map((request) => (
              <RequestCard key={request.id} request={request} onNavigate={onNavigate} compact />
            ))}
          </div>
        ) : (
          <EmptyStateCard
            icon="heart"
            title="Заявок пока нет"
            text="Мы только готовим первые истории к публикации. Скоро здесь появятся люди, которым можно будет помочь напрямую."
            actionLabel="Перейти во вкладку «Помочь»"
            onAction={() => onNavigate("/requests")}
          />
        )}
      </section>

      <section className="section shell trust-strip">
        <TrustCard icon="shield" title="Документы проверены" text="Каждая заявка проходит ручную проверку модераторами платформы." />
        <TrustCard icon="card" title="Деньги идут напрямую получателю" text="Мы не удерживаем средства — вы помогаете человеку напрямую." />
        <TrustCard icon="video" title="Есть отчетность" text="Получатель показывает результат, а вы видите, как ваша помощь работает." />
      </section>

      <section className="section shell author-support-strip">
        <div>
          <Badge tone="mint" icon="heart">Поддержать автора</Badge>
          <h2>Помочь развивать 100spasibo</h2>
          <p>Небольшая поддержка помогает уделять проекту больше времени, улучшать мини-апп и делать платформу понятнее.</p>
        </div>
        <Button variant="soft" onClick={() => onNavigate("/support-author")}>
          <Icon name="spark" />
          Узнать историю
        </Button>
      </section>
    </>
  );
}

function RequestsPage({ requests, onNavigate }: { requests: HelpRequest[]; onNavigate: NavigateFn }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const filteredRequests = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return requests;
    return requests.filter((item) =>
      `${item.name} ${item.city} ${item.reason} ${item.category}`.toLowerCase().includes(normalized),
    );
  }, [query, requests]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE));
  const visible = useMemo(() => {
    const start = (page - 1) * REQUESTS_PER_PAGE;
    return filteredRequests.slice(start, start + REQUESTS_PER_PAGE);
  }, [filteredRequests, page]);
  const paginationItems = useMemo<(number | "ellipsis")[]>(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const pages = new Set([1, totalPages, page - 1, page, page + 1].filter((item) => item >= 1 && item <= totalPages));
    const sorted = Array.from(pages).sort((a, b) => a - b);
    return sorted.reduce<(number | "ellipsis")[]>((items, item, index) => {
      if (index > 0 && item - sorted[index - 1] > 1) items.push("ellipsis");
      items.push(item);
      return items;
    }, []);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const changePage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    setPage(safePage);
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <section className="page shell catalog-page">
      <div className="catalog-hero">
        <div>
          <Badge icon="heart">Люди помогают людям</Badge>
          <h1>Кому нужна помощь</h1>
          <p>Выберите человека, которому вы хотите помочь сегодня.</p>
        </div>
        <WatercolorHero type="hands" />
      </div>

      <div className="catalog-layout">
        <FilterSidebar count={requests.length} />
        <div className="catalog-main">
          <div className="banner-grid">
            <InfoBanner tone="peach" icon="hands" title="Даже 100 рублей имеют значение" text="Небольшая помощь от многих людей меняет чью-то жизнь к лучшему." />
            <InfoBanner tone="mint" icon="shield" title="Все заявки проходят проверку" text="Мы проверяем документы и историю каждого заявителя, чтобы помощь была честной и адресной." />
          </div>
          <div className="catalog-toolbar">
            <label className="search-box">
              <Icon name="search" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по имени, городу или ситуации" />
            </label>
            <PrettySelect
              label="Сортировать:"
              className="sort-box"
              defaultValue="new"
              options={[
                { label: "Сначала новые", value: "new" },
                { label: "Ближе к цели", value: "progress" },
                { label: "Сначала срочные", value: "urgent" },
              ]}
            />
          </div>
          <div className="requests-grid" ref={resultsRef}>
            {visible.map((request) => (
              <RequestCard key={request.id} request={request} onNavigate={onNavigate} />
            ))}
          </div>
          {!visible.length ? (
            <EmptyStateCard
              icon="heart"
              title={query ? "По этому поиску заявок нет" : "Заявок пока нет"}
              text={query ? "Попробуйте изменить запрос. Сейчас на платформе еще нет опубликованных заявок." : "Мы еще не опубликовали первые проверенные заявки. Как только они появятся, здесь можно будет выбрать человека и помочь напрямую."}
              actionLabel="Подать заявку"
              onAction={() => onNavigate("/apply")}
            />
          ) : null}
          {filteredRequests.length ? (
            <nav className="pagination" aria-label="Страницы заявок">
              <button type="button" aria-label="Предыдущая страница" disabled={page === 1} onClick={() => changePage(page - 1)}>
                ←
              </button>
              {paginationItems.map((item, index) =>
                item === "ellipsis" ? (
                  <span key={`ellipsis-${index}`} aria-hidden="true">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={item === page ? "active" : ""}
                    aria-current={item === page ? "page" : undefined}
                    onClick={() => changePage(item)}
                  >
                    {item}
                  </button>
                ),
              )}
              <button type="button" aria-label="Следующая страница" disabled={page === totalPages} onClick={() => changePage(page + 1)}>
                →
              </button>
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function RequestDetailPage({ requests, id, onNavigate, onToast }: { requests: HelpRequest[]; id: string | undefined; onNavigate: NavigateFn; onToast: (message: string) => void }) {
  const request = requests.find((item) => item.id === id);
  if (!request) {
    return (
      <section className="page shell detail-page">
        <button className="back-link" type="button" onClick={() => onNavigate("/requests")}>
          <Icon name="arrowLeft" />
          Назад к заявкам
        </button>
        <EmptyStateCard
          icon="heart"
          title="Эта заявка больше не опубликована"
          text="Сейчас на платформе нет открытых заявок. Когда появятся первые проверенные заявки, они будут доступны во вкладке «Помочь»."
          actionLabel="Перейти во вкладку «Помочь»"
          onAction={() => onNavigate("/requests")}
        />
      </section>
    );
  }

  const targetAmount = request.targetAmount;
  const collectedAmount = request.collectedAmount;
  const percent = targetAmount > 0 ? Math.min(100, Math.round((collectedAmount / targetAmount) * 100)) : 0;
  const remaining = targetAmount - collectedAmount;
  const detailImage = request.image;
  const collectionNote = collectedAmount > 0 ? "Есть первые переводы" : "Сбор только начинается";

  return (
    <section className="page shell detail-page">
      <button className="back-link" type="button" onClick={() => onNavigate("/requests")}>
        <Icon name="arrowLeft" />
        Назад к списку нуждающихся
      </button>
      <div className="detail-layout">
        <div className="detail-main">
          <div className="request-hero-card">
            <img className="detail-photo" src={detailImage} alt={`${request.name}, ${request.city}`} width="420" height="420" />
            <div>
              <h1>
                {request.name}, {request.age} года, {request.city}
              </h1>
              <Badge icon="heart">Нужна помощь</Badge>
              <div className="request-story">
                {request.story.split("\n\n").map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="detail-actions">
                <Button variant="soft" onClick={() => void shareHelpRequest(request, onToast)}>
                  <Icon name="share" />
                  Поделиться заявкой
                </Button>
              </div>
              <div className="chip-row">
                <Badge tone="mint" icon="shield">Документы проверены</Badge>
                <Badge tone="white" icon="card">Прямой перевод</Badge>
                <Badge tone="white" icon="video">Отчет обязателен</Badge>
              </div>
            </div>
          </div>

          <section className="collection-card">
            <h2>Сбор на погашение долга</h2>
            <div className="collection-stats">
              <div><span>Нужно собрать</span><strong>{formatRubles(targetAmount)}</strong></div>
              <div><span>Собрано</span><strong>{formatRubles(collectedAmount)}</strong></div>
              <div><span>Осталось собрать</span><strong>{formatRubles(remaining)}</strong></div>
            </div>
            <ProgressBar percent={percent} />
            <div className="collection-bottom">
              <strong>{percent}%</strong>
              <span><Icon name="users" /> {collectionNote}</span>
            </div>
          </section>

          <div className="two-column-blocks">
            <VerifiedDocuments documents={request.documents} />
            <Timeline items={request.updates} />
          </div>

          <section className="video-placeholder">
            <span className="play-button"><Icon name="play" /></span>
            <div>
              <h2>Видеоотчет о погашении долга</h2>
              <p>
                После полного закрытия долга {request.name} предоставит видеоотчет и документы, подтверждающие оплату.
                Мы публикуем отчеты — это часть нашей прозрачности.
              </p>
            </div>
          </section>
        </div>
        <DonationPanel request={request} onToast={onToast} />
      </div>
    </section>
  );
}

function ApplyPage() {
  const videoSteps = [
    {
      title: "Представьтесь и спокойно расскажите о себе",
      text: "Назовите имя, город и коротко объясните, почему сейчас вам нужна поддержка.",
    },
    {
      title: "Расскажите свою историю",
      text: "Что произошло, из-за чего появилась сложная ситуация и почему самостоятельно закрыть обязательства сейчас трудно.",
    },
    {
      title: "Объясните, на что брались кредиты",
      text: "Расскажите, для каких расходов оформлялись кредиты или займы: лечение, аренда, учеба, бытовые расходы, работа или другая причина.",
    },
    {
      title: "Покажите личный кабинет банка",
      text: "Возьмите телефон в руки, откройте личный кабинет банка или МФО и покажите раздел с кредитами так, чтобы были видны активные обязательства.",
    },
    {
      title: "Покажите сумму и статус",
      text: "В кадре должны быть понятны банк, тип обязательства, остаток долга или платеж. Если кредитов несколько, покажите каждый кабинет по очереди.",
    },
    {
      title: "Скажите, какую помощь просите",
      text: "Назовите примерную сумму, которую нужно собрать, и подтвердите, что после помощи готовы записать отчет о закрытии долга.",
    },
  ];

  return (
    <section className="page shell apply-page">
      <div className="apply-hero">
        <div>
          <Badge icon="heart">Люди помогают людям</Badge>
          <h1>
            Подать заявку <span>на помощь</span>
          </h1>
          <p>
            Запишите короткое видео для заявки. Так команда сможет лучше понять вашу ситуацию, а история будет
            выглядеть живой, честной и понятной для тех, кто захочет помочь.
          </p>
        </div>
        <WatercolorHero type="apply" />
      </div>

      <div className="apply-layout">
        <article className="video-application-card">
          <div className="video-application-head">
            <div>
              <Badge tone="mint" icon="shield">Заявка</Badge>
              <h2>Что нужно снять</h2>
              <p>
                Запишите видео на телефон в спокойной обстановке. Не нужно говорить официально: важно честно объяснить
                ситуацию и показать подтверждение кредитов в личных кабинетах банков.
              </p>
            </div>
          </div>

          <ol className="video-instruction-list">
            {videoSteps.map((step, index) => (
              <li key={step.title}>
                <span>{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="video-safety-note">
            <Icon name="lock" />
            <div>
              <h3>Важно про безопасность</h3>
              <p>
                Не показывайте пароли, SMS-коды, CVV, полные номера карт и паспорт. Если на экране есть лишние данные,
                закройте их рукой или переключитесь на раздел, где видна только информация по кредиту.
              </p>
            </div>
          </div>

          <div className="send-video-card">
            <div>
              <h3>Готово? Отправьте видео в Telegram</h3>
              <p>После отправки команда посмотрит видео и напишет вам, если нужно будет уточнить детали.</p>
            </div>
            <a className="button button-primary big wide" href={TELEGRAM_CONTACT_URL} target="_blank" rel="noreferrer">
              <Icon name="telegram" />
              Отправить видео
            </a>
          </div>
        </article>

        <aside className="apply-sidebar">
          <SidebarCard icon="video" title="Как записать видео" items={["Держите телефон вертикально", "Говорите в тихом месте", "Снимите одним видео без монтажа", "Оптимальная длина — 2-5 минут"]} />
          <SidebarCard icon="card" title="Что показать на телефоне" items={["Личный кабинет банка или МФО", "Раздел с кредитом или займом", "Остаток долга или сумму платежа", "Если банков несколько — каждый по очереди"]} />
          <SidebarCard icon="shield" title="Что будет после отправки" items={["Команда посмотрит видео", "При необходимости задаст уточняющие вопросы", "После проверки заявка может быть опубликована", "После получения помощи нужно будет записать отчет"]} ordered />
          <div className="sidebar-card contact-help">
            <Icon name="heart" />
            <h3>Есть вопрос?</h3>
            <p>Если не уверены, как лучше снять видео, напишите нам в Telegram.</p>
            <a href={TELEGRAM_CONTACT_URL} target="_blank" rel="noreferrer"><Icon name="telegram" />Написать в Telegram</a>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FormSection({ number, title, children, wide = false }: { number: number; title: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`form-section form-section-${number} ${wide ? "form-section-wide" : ""}`}>
      <h2><span>{number}</span>{title}</h2>
      <div className="form-grid">{children}</div>
    </section>
  );
}

function Field({ name, label, type = "text", placeholder = "", required = false }: { name: string; label: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="form-field">
      <span>{label}{required ? <b>*</b> : null}</span>
      <input name={name} type={type} placeholder={placeholder} required={required} />
    </label>
  );
}

const calendarMonths = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const calendarWeekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const currentCalendarYear = new Date().getFullYear();
const calendarYears = Array.from({ length: 111 }, (_, index) => currentCalendarYear + 10 - index);

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateLabel(value: string) {
  if (!value) return "";
  const date = parseDateValue(value);
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function DateField({ name, label, required = false }: { name: string; label: string; required?: boolean }) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date());
  const rootRef = useRef<HTMLDivElement>(null);
  const inputId = `date-${label.replace(/[^a-zA-Zа-яА-Я0-9]+/g, "-").toLowerCase()}`;
  const selectedDate = value ? parseDateValue(value) : null;
  const currentValue = value ? formatDateLabel(value) : "";
  const todayValue = formatDateValue(new Date());

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(year, month, index - mondayOffset + 1);
      return {
        date,
        value: formatDateValue(date),
        inCurrentMonth: date.getMonth() === month,
      };
    });
  }, [viewDate]);

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

  useEffect(() => {
    if (!open) setYearPickerOpen(false);
  }, [open]);

  const changeMonth = (direction: number) => {
    setYearPickerOpen(false);
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  };

  const changeYear = (year: number) => {
    setViewDate((current) => new Date(year, current.getMonth(), 1));
    setYearPickerOpen(false);
  };

  const selectDate = (date: Date) => {
    setValue(formatDateValue(date));
    setViewDate(date);
    setOpen(false);
    setYearPickerOpen(false);
  };

  return (
    <div className="form-field date-field" ref={rootRef}>
      <span>{label}{required ? <b>*</b> : null}</span>
      <div className="date-picker-control">
        <input
          id={inputId}
          name={name}
          type="text"
          value={currentValue}
          placeholder="ДД.ММ.ГГГГ"
          readOnly
          required={required}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen(true);
            }
          }}
        />
        <button type="button" aria-label={`Открыть календарь: ${label}`} onClick={() => setOpen((current) => !current)}>
          <Icon name="calendar" />
        </button>
      </div>
      {open ? (
        <div className="date-picker-popover" role="dialog" aria-label={`Календарь: ${label}`}>
          <div className="date-picker-head">
            <button type="button" className="date-nav date-nav-prev" aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)}>
              <Icon name="chevron" />
            </button>
            <div className="date-picker-title">
              <strong>{calendarMonths[viewDate.getMonth()]}</strong>
              <button
                type="button"
                className={`date-year-trigger ${yearPickerOpen ? "is-open" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={yearPickerOpen}
                onClick={() => setYearPickerOpen((current) => !current)}
              >
                {viewDate.getFullYear()}
                <Icon name="chevron" />
              </button>
              {yearPickerOpen ? (
                <div className="date-year-panel" role="listbox" aria-label="Выберите год">
                  {calendarYears.map((year) => (
                    <button
                      key={year}
                      type="button"
                      className={`date-year-option ${year === viewDate.getFullYear() ? "selected" : ""}`}
                      role="option"
                      aria-selected={year === viewDate.getFullYear()}
                      onClick={() => changeYear(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button type="button" className="date-nav date-nav-next" aria-label="Следующий месяц" onClick={() => changeMonth(1)}>
              <Icon name="chevron" />
            </button>
          </div>
          <div className="date-weekdays" aria-hidden="true">
            {calendarWeekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="date-days">
            {days.map((day) => {
              const selected = selectedDate ? day.value === formatDateValue(selectedDate) : false;
              return (
                <button
                  type="button"
                  key={day.value}
                  className={[
                    "date-day",
                    day.inCurrentMonth ? "" : "date-day-muted",
                    day.value === todayValue ? "date-day-today" : "",
                    selected ? "date-day-selected" : "",
                  ].filter(Boolean).join(" ")}
                  aria-pressed={selected}
                  onClick={() => selectDate(day.date)}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="date-picker-footer">
            <button type="button" onClick={() => selectDate(new Date())}>Сегодня</button>
            <button type="button" onClick={() => setOpen(false)}>Готово</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SelectField({ name, label, options }: { name?: string; label: string; options: string[] }) {
  return <PrettySelect name={name} label={label} options={options} className="form-field pretty-select-form" />;
}

function SidebarCard({ icon, title, items, ordered = false }: { icon: "file" | "calendar" | "video" | "card" | "shield"; title: string; items: string[]; ordered?: boolean }) {
  const List = ordered ? "ol" : "ul";
  return (
    <div className="sidebar-card">
      <Icon name={icon} />
      <h3>{title}</h3>
      <List>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </List>
    </div>
  );
}

function AdminAccessPage({ onNavigate, onToast, onUnlock }: { onNavigate: NavigateFn; onToast: (message: string) => void; onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const passwordHash = await getSha256(password.trim());
    if (passwordHash !== ADMIN_PASSWORD_HASH) {
      setError("Пожалуйста, проверьте пароль администратора.");
      onToast("Пароль не подошел.");
      return;
    }
    setError("");
    onUnlock();
  };

  return (
    <section className="page shell admin-access-page">
      <div className="admin-access-card">
        <Badge icon="lock">Закрытый раздел</Badge>
        <h1>Вход в админ-панель</h1>
        <p>
          Админка вынесена отдельно от публичного мини-приложения. Введите пароль администратора, чтобы открыть очередь заявок,
          чеков и отчетов.
        </p>
        <form className="admin-access-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Пароль администратора<b>*</b></span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="form-error"><Icon name="shield" />{error}</p> : null}
          <div className="admin-access-actions">
            <Button type="submit">
              <Icon name="lock" />
              Войти
            </Button>
            <Button variant="soft" onClick={() => onNavigate("/")}>В мини-апп</Button>
          </div>
        </form>
        <div className="admin-access-note">
          <Icon name="shield" />
          <span>Это статичная защита для MVP. Чувствительные данные нельзя хранить в таком интерфейсе без backend-авторизации.</span>
        </div>
      </div>
    </section>
  );
}

function AdminDashboardPage({ onNavigate, onToast, onPublished, onLogout }: { onNavigate: NavigateFn; onToast: (message: string) => void; onPublished: () => Promise<void>; onLogout: () => void }) {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    setLoading(true);
    try {
      setApplications(await listApplications());
    } catch {
      onToast("Не получилось загрузить заявки из базы.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  const publishApplication = async (id: string) => {
    try {
      await updateApplicationStatus(id, "published");
      await loadApplications();
      await onPublished();
      onToast("Заявка опубликована в мини-аппе.");
    } catch {
      onToast("Не получилось опубликовать заявку.");
    }
  };

  const rejectApplication = async (id: string) => {
    try {
      await updateApplicationStatus(id, "rejected");
      await loadApplications();
      onToast("Заявка перенесена в отклоненные.");
    } catch {
      onToast("Не получилось изменить статус.");
    }
  };

  const newApplications = applications.filter((application) => application.status === "new");
  const publishedApplications = applications.filter((application) => application.status === "published");
  const rejectedApplications = applications.filter((application) => application.status === "rejected");

  return (
    <section className="page shell dashboard-page admin-dashboard">
      <DashboardHero
        badge="Админ-панель"
        title="Заявки из мини-аппа"
        text="Новые заявки попадают сюда после проверки. Нажмите «Опубликовать», и карточка появится в каталоге помощи."
      />
      {!isBackendConfigured ? (
        <div className="backend-mode-note">
          <Icon name="shield" />
          <p>
            Сейчас включен демо-режим: заявки сохраняются только в этом браузере. Для живой работы подключите Supabase
            через переменные `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`.
          </p>
        </div>
      ) : null}
      <div className="admin-session-bar">
        <span><Icon name="lock" />Доступ открыт для администратора</span>
        <Button variant="soft" onClick={onLogout}>Выйти</Button>
      </div>
      <div className="dashboard-stats admin-stats">
        <DashboardStat icon="file" label="Новых заявок" value={String(newApplications.length)} />
        <DashboardStat icon="shield" label="Опубликовано" value={String(publishedApplications.length)} />
        <DashboardStat icon="copy" label="Всего заявок" value={String(applications.length)} />
        <DashboardStat icon="video" label="Отклонено" value={String(rejectedApplications.length)} />
      </div>
      <div className="admin-layout">
        <section className="dashboard-card admin-board">
          <div className="dashboard-card-head">
            <div>
              <h2>Очередь заявок</h2>
              <p>{loading ? "Загружаем заявки..." : `На проверке: ${newApplications.length}`}</p>
            </div>
            <Button variant="soft" onClick={() => void loadApplications()}>Обновить</Button>
          </div>
          <div className="admin-task-list">
            {!loading && !newApplications.length ? (
              <div className="empty-admin-state">
                <Icon name="file" />
                <h3>Новых заявок пока нет</h3>
                <p>Когда человек отправит заявку из мини-аппа, она появится здесь.</p>
              </div>
            ) : null}
            {newApplications.map((application) => (
              <article className="application-admin-card" key={application.id}>
                <div className="application-admin-head">
                  <Badge tone="peach" icon="file">Новая заявка</Badge>
                  <span>{application.created_at ? new Date(application.created_at).toLocaleDateString("ru-RU") : "Сегодня"}</span>
                </div>
                <h3>{application.full_name || "Без имени"}, {application.city || "город не указан"}</h3>
                <p>{application.story}</p>
                <div className="application-admin-meta">
                  <span><Icon name="telegram" />{application.telegram || "Telegram не указан"}</span>
                  <span><Icon name="card" />{formatRubles(application.target_amount)}</span>
                  <span><Icon name="shield" />{application.category}</span>
                </div>
                <div className="application-admin-docs">
                  <strong>Документы:</strong>
                  <span>{application.documents.length ? application.documents.join(", ") : "файлы не прикреплены"}</span>
                </div>
                <div className="application-admin-actions">
                  <Button variant="mint" onClick={() => void publishApplication(application.id)}>Опубликовать</Button>
                  <Button variant="soft" onClick={() => void rejectApplication(application.id)}>Отклонить</Button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <aside className="dashboard-stack">
          <section className="dashboard-card soft-dashboard-card">
            <h2>Быстрые переходы</h2>
            <Button variant="soft" onClick={() => onNavigate("/requests/anna")}>Открыть заявку Анны</Button>
            <Button variant="soft" onClick={() => onNavigate("/stories")}>Посмотреть отчеты</Button>
            <Button onClick={() => onNavigate("/apply")}>Тестовая заявка</Button>
          </section>
          <section className="dashboard-card">
            <h2>Правила публикации</h2>
            <div className="notice-list">
              <Notice icon="lock" title="Скрывать персональные данные" text="Оригиналы документов не размещаются публично." />
              <Notice icon="shield" title="Проверять реквизиты" text="Реквизиты должны совпадать с заявителем или доверенным получателем." />
              <Notice icon="video" title="Отчет после сбора" text="Видео и подтверждение оплаты публикуются в безопасном виде." />
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function DashboardHero({ badge, title, text }: { badge: string; title: string; text: string }) {
  return (
    <div className="dashboard-hero">
      <Badge icon="spark">{badge}</Badge>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

function DashboardStat({ icon, label, value }: { icon: "heart" | "users" | "check" | "video" | "file" | "copy" | "shield"; label: string; value: string }) {
  return (
    <article className="dashboard-stat">
      <span><Icon name={icon} /></span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </article>
  );
}

function Notice({ icon, title, text }: { icon: "video" | "shield" | "heart" | "lock"; title: string; text: string }) {
  return (
    <article className="notice-item">
      <span><Icon name={icon} /></span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}

function EmptyStateCard({ icon, title, text, actionLabel, onAction }: { icon: "heart" | "video" | "shield"; title: string; text: string; actionLabel: string; onAction: () => void }) {
  return (
    <section className="empty-state-card">
      <span><Icon name={icon} /></span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <Button variant="soft" onClick={onAction}>{actionLabel}</Button>
    </section>
  );
}

function StoriesPage({ onNavigate }: { onNavigate: NavigateFn }) {
  return (
    <section className="page shell stories-page">
      <div className="stories-hero">
        <div>
          <Badge icon="heart">Истории помощи</Badge>
          <h1>Первые истории еще впереди</h1>
          <p>
            Мы пока никому не помогли через платформу, поэтому не будем показывать выдуманные отчеты. Как только первая
            помощь будет оказана и получатель пришлет отчет, история появится здесь.
          </p>
        </div>
      </div>

      <section className="stories-empty-card">
        <Badge tone="mint" icon="shield">Честный старт</Badge>
        <h2>Пока здесь нет историй помощи</h2>
        <p>
          Это нормально: проект только начинает путь. Скоро здесь появятся первые проверенные заявки, люди смогут помочь
          напрямую, а после закрытия сбора мы опубликуем настоящий отчет.
        </p>
        <Button onClick={() => onNavigate("/requests")}>
          <Icon name="heart" filled />
          Перейти во вкладку «Помочь»
        </Button>
      </section>
    </section>
  );
}

function HowItWorksPage({ onNavigate }: { onNavigate: NavigateFn }) {
  return (
    <section className="page shell simple-page">
      <Badge icon="spark">Просто и прозрачно</Badge>
      <h1>Как работает 100spasibo</h1>
      <p>
        Платформа помогает человеку бережно рассказать о ситуации, пройти проверку и получить поддержку напрямую от
        людей, которым откликнулась его история.
      </p>
      <div className="steps-grid standalone">
        <StepCard index={1} icon="video" title="Заявка" text="Человек записывает историю, рассказывает о кредитах и показывает личные кабинеты банков." />
        <StepCard index={2} icon="shield" title="Модерация" text="Команда проверяет ситуацию и публикует только безопасную часть информации." />
        <StepCard index={3} icon="card" title="Перевод напрямую" text="Помогающий видит реквизиты и переводит любую сумму получателю." />
        <StepCard index={4} icon="video" title="Отчет" text="После завершения получатель показывает, как помощь была использована." />
      </div>
      <Button onClick={() => onNavigate("/requests")}>Выбрать человека</Button>
    </section>
  );
}

function SafetyPage() {
  return (
    <section className="page shell simple-page">
      <Badge icon="shield">Безопасность</Badge>
      <h1>Помощь должна быть теплой и понятной</h1>
      <div className="text-cards">
        <TrustCard icon="shield" title="Проверяем документы" text="Платформа проверяет предоставленные документы и публикует только безопасную часть информации." />
        <TrustCard icon="lock" title="Не раскрываем лишнее" text="Оригиналы документов и персональные данные не размещаются в открытом доступе." />
        <TrustCard icon="video" title="Просим отчет" text="Получатель помощи обязуется предоставить отчет о целевом использовании средств после завершения сбора." />
      </div>
      <div className="legal-note">
        100spasibo не является банком, микрофинансовой организацией, платежным оператором или благотворительным фондом.
        Платформа не принимает и не распределяет денежные средства. Переводы осуществляются напрямую от помогающего
        пользователя к получателю помощи.
      </div>
    </section>
  );
}

function SupportAuthorPage({ onNavigate }: { onNavigate: NavigateFn }) {
  return (
    <section className="page shell support-author-page">
      <button className="back-link" type="button" onClick={() => onNavigate("/")}>
        <Icon name="arrowLeft" />
        На главную
      </button>

      <article className="support-author-hero">
        <div>
          <Badge tone="mint" icon="heart">Поддержать автора</Badge>
          <h1>История 100spasibo началась с простой мысли</h1>
          <p>
            Даже 100 рублей могут стать частью большой помощи, если вокруг одной истории собирается много неравнодушных
            людей.
          </p>
        </div>
        <span className="support-author-mark">
          <BrandMark />
        </span>
      </article>

      <div className="support-story-grid">
        <section className="support-story-card">
          <span><Icon name="spark" /></span>
          <h2>Почему я сделал это приложение</h2>
          <p>
            Я хотел собрать понятный и теплый интерфейс, где человеку не страшно попросить помощи, а тому, кто помогает,
            видно, кому именно он переводит деньги и какой результат получился после сбора.
          </p>
        </section>
        <section className="support-story-card">
          <span><Icon name="shield" /></span>
          <h2>Что важно в проекте</h2>
          <p>
            100spasibo не принимает деньги на себя. Идея в прямой поддержке: заявка проходит проверку, человек получает
            помощь напрямую, а после закрытия сбора появляется отчет.
          </p>
        </section>
      </div>

      <section className="support-donate-card">
        <div>
          <Badge icon="telegram">Донат автору</Badge>
          <h2>Если хочется поддержать развитие</h2>
          <p>
            Поддержка автора помогает продолжать работу над интерфейсом, админкой, отчетами и следующими версиями
            мини-приложения.
          </p>
        </div>
        <a className="button button-primary big wide" href={AUTHOR_DONATE_URL} target="_blank" rel="noreferrer">
          <Icon name="heart" filled />
          Поддержать автора
        </a>
      </section>
    </section>
  );
}

function PrivacyPage({ onNavigate }: { onNavigate: NavigateFn }) {
  const summary = [
    ["file", "Что собираем", "Данные из заявки, документы, реквизиты, Telegram для связи и чеки о переводах."],
    ["shield", "Зачем", "Чтобы проверить заявку, связаться с человеком и опубликовать только безопасную часть истории."],
    ["lock", "Что скрываем", "Паспорта, договоры, выписки и другие оригиналы документов не показываются публично."],
    ["telegram", "Как связаться", "По любым вопросам о данных можно написать команде 100spasibo в Telegram."],
  ] as const;

  const sections = [
    {
      title: "1. Какие данные может получать платформа",
      text:
        "100spasibo может получать фамилию, имя, отчество, город, дату рождения, описание ситуации, контакт в Telegram, сведения о долге, реквизиты для прямого перевода, загруженные документы, чеки и техническую информацию, необходимую для работы интерфейса.",
    },
    {
      title: "2. Для чего используются данные",
      text:
        "Данные нужны для ручной модерации заявок, проверки подтверждающих документов, связи с заявителем, публикации карточки после одобрения, отображения реквизитов для прямой помощи и проверки отчетов после завершения сбора.",
    },
    {
      title: "3. Что может быть опубликовано",
      text:
        "После модерации на платформе может быть опубликована безопасная часть истории: имя, возраст, город, цель сбора, сумма, краткое описание ситуации, статус проверки и реквизиты, которые заявитель разрешил показать для прямого перевода.",
    },
    {
      title: "4. Что не публикуется в открытом доступе",
      text:
        "Оригиналы документов, паспортные данные, полные договоры, выписки, справки и внутренняя переписка с модерацией не размещаются публично. Эти материалы используются только для проверки заявки и отчетности.",
    },
    {
      title: "5. Кто может видеть данные",
      text:
        "Публичные данные видят пользователи платформы. Полные материалы заявки доступны только команде модерации и администраторам, которым они нужны для проверки. Данные не продаются и не используются для рекламной рассылки третьих лиц.",
    },
    {
      title: "6. Хранение, исправление и удаление",
      text:
        "Пользователь может попросить уточнить, исправить или удалить данные, если это не мешает обязательной отчетности и проверке уже опубликованной заявки. Для этого нужно написать команде 100spasibo в Telegram.",
    },
  ];

  return (
    <section className="page shell simple-page legal-page">
      <Badge icon="lock">Конфиденциальность</Badge>
      <h1>Политика конфиденциальности</h1>
      <p>
        Мы собираем только те данные, которые нужны для проверки заявки и прямой помощи человеку. Этот текст написан
        простым языком и подходит для MVP; перед публичным запуском его стоит проверить с юристом.
      </p>
      <div className="legal-summary-grid">
        {summary.map(([icon, title, text]) => (
          <TrustCard key={title} icon={icon} title={title} text={text} />
        ))}
      </div>
      <div className="legal-document">
        {sections.map((section) => (
          <article key={section.title} className="legal-section-card">
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
      </div>
      <div className="legal-note">
        В рабочей версии сюда нужно добавить полное наименование оператора, реквизиты, адрес, порядок обработки
        персональных данных и финальную редакцию согласия на обработку данных.
      </div>
      <Button variant="soft" onClick={() => onNavigate("/apply")}>Вернуться к заявке</Button>
    </section>
  );
}

function TermsPage({ onNavigate }: { onNavigate: NavigateFn }) {
  const summary = [
    ["hands", "Люди помогают напрямую", "100spasibo показывает проверенные заявки, а перевод идет от человека к человеку."],
    ["shield", "Есть модерация", "Команда может запросить уточнения, скрыть лишние данные или отказать в публикации."],
    ["card", "Платформа не принимает деньги", "Мы не храним и не распределяем средства, не являемся банком или платежным оператором."],
    ["video", "Нужен отчет", "После сбора получатель показывает, как помощь была использована."],
  ] as const;

  const sections = [
    {
      title: "1. Роль платформы",
      text:
        "100spasibo является информационной платформой взаимопомощи. Платформа помогает проверить заявку, опубликовать безопасную часть истории и показать реквизиты получателя для прямого перевода.",
    },
    {
      title: "2. Прямые переводы",
      text:
        "Помогающий пользователь сам выбирает человека, сумму и способ перевода. Деньги отправляются напрямую получателю помощи. 100spasibo не принимает, не хранит, не распределяет и не возвращает денежные средства.",
    },
    {
      title: "3. Обязанности заявителя",
      text:
        "Заявитель обязуется указывать достоверную информацию, прикладывать документы, использовать помощь по заявленной цели, сообщать о важных изменениях и предоставить отчет после завершения сбора.",
    },
    {
      title: "4. Обязанности помогающего пользователя",
      text:
        "Помогающий пользователь самостоятельно принимает решение о переводе. После перевода он может прикрепить чек, чтобы команда отметила помощь и могла сверить ход сбора.",
    },
    {
      title: "5. Модерация и публикация",
      text:
        "Команда 100spasibo может отклонить заявку, запросить дополнительные документы, отредактировать публичное описание без искажения смысла, временно скрыть карточку или снять ее с публикации.",
    },
    {
      title: "6. Запрещенные действия",
      text:
        "Нельзя размещать чужие документы без согласия, указывать ложные данные, выдавать себя за другого человека, давить на пользователей, публиковать оскорбления, спам или реквизиты, не относящиеся к заявке.",
    },
    {
      title: "7. Ограничение ответственности",
      text:
        "Платформа проводит проверку документов и историй, но не может гарантировать абсолютную полноту информации. Пользователь принимает решение о помощи добровольно и осознанно.",
    },
  ];

  return (
    <section className="page shell simple-page legal-page">
      <Badge icon="file">Правила платформы</Badge>
      <h1>Пользовательское соглашение</h1>
      <p>
        Здесь описаны понятные правила для заявителей, помогающих пользователей и команды модерации. Это черновая
        редакция для MVP, которую перед запуском нужно юридически доработать.
      </p>
      <div className="legal-summary-grid">
        {summary.map(([icon, title, text]) => (
          <TrustCard key={title} icon={icon} title={title} text={text} />
        ))}
      </div>
      <div className="legal-document">
        {sections.map((section) => (
          <article key={section.title} className="legal-section-card">
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
      </div>
      <div className="legal-note">
        100spasibo не является банком, микрофинансовой организацией, платежным оператором или благотворительным фондом.
        Все переводы совершаются напрямую от помогающего пользователя к получателю помощи.
      </div>
      <Button onClick={() => onNavigate("/requests")}>Перейти к заявкам</Button>
    </section>
  );
}

function FaqPage() {
  const items = [
    ["100spasibo принимает деньги?", "Нет. Платформа показывает проверенные истории и реквизиты. Перевод идет напрямую получателю помощи."],
    ["Можно помочь любой суммой?", "Да. Даже 100 рублей могут стать частью большого решения, если помогают многие люди."],
    ["Что писать в назначении платежа?", "На странице заявки указана мягкая плашка: в назначении платежа нужно указать «Благотворительность»."],
    ["Как я увижу результат?", "После завершения сбора получатель предоставляет видеоотчет и безопасное подтверждение оплаты."],
  ];
  return (
    <section className="page shell simple-page">
      <Badge icon="heart">Вопросы и ответы</Badge>
      <h1>Коротко о важном</h1>
      <div className="faq-list">
        {items.map(([question, answer]) => (
          <details key={question} open={question === items[0][0]}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
