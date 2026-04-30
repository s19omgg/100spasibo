import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
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
  UploadBox,
  VerifiedDocuments,
  WatercolorHero,
  type NavigateFn,
} from "./components/ui";
import annaPhoto from "./assets/anna-photo.png";
import { formatRubles, getPercent, requests as mockRequests, type HelpRequest } from "./data/requests";
import {
  createApplication,
  isBackendConfigured,
  listApplications,
  listPublishedRequests,
  updateApplicationStatus,
  type ApplicationRecord,
} from "./lib/applications";
import { getBrowserPath, getRoutePath } from "./lib/routing";
import "./styles.css";

const completedStories = [
  {
    name: "Мария",
    age: 31,
    city: "Ростов-на-Дону",
    image: mockRequests[2].image,
    category: "Коммунальные платежи",
    amount: 15000,
    helpers: 87,
    closedAt: "Июнь 2024",
    title: "Дома снова спокойно: свет и тепло оплачены",
    quote:
      "Мне помогли закрыть долг по коммунальным платежам. Я показала оплату на видео и до сих пор пересматриваю сообщения поддержки.",
    result: "Задолженность погашена напрямую по реквизитам Марии. Видеоотчет и подтверждение оплаты опубликованы после закрытия сбора.",
  },
  {
    name: "Игорь",
    age: 29,
    city: "Новосибирск",
    image: mockRequests[1].image,
    category: "Аренда жилья",
    amount: 30000,
    helpers: 126,
    closedAt: "Июль 2024",
    title: "Игорь сохранил жилье и спокойно вышел на новую работу",
    quote:
      "Самое важное было не остаться одному в моменте, когда нужно было просто продержаться один месяц.",
    result: "Аренда оплачена прямыми переводами получателю. Игорь записал короткий отчет с квитанцией и благодарностью.",
  },
  {
    name: "Дмитрий",
    age: 22,
    city: "Краснодар",
    image: mockRequests[5].image,
    category: "Образование",
    amount: 40000,
    helpers: 214,
    closedAt: "Август 2024",
    title: "Семестр оплачен, учебу не пришлось прерывать",
    quote:
      "Я боялся брать академический отпуск, но много маленьких переводов сложились в нужную сумму.",
    result: "Оплата учебы закрыта. Дмитрий показал счет и подтверждение перевода в видеоотчете.",
  },
  {
    name: "Сергей",
    age: 42,
    city: "Екатеринбург",
    image: mockRequests[3].image,
    category: "Лечение и здоровье",
    amount: 45000,
    helpers: 173,
    closedAt: "Сентябрь 2024",
    title: "Курс восстановления после операции начался вовремя",
    quote:
      "Поддержка пришла очень бережно. Не как жалость, а как спокойное человеческое плечо.",
    result: "Лекарства и реабилитация оплачены. После сбора Сергей прислал видеоотчет и безопасные подтверждения расходов.",
  },
  {
    name: "Ольга",
    age: 38,
    city: "Самара",
    image: mockRequests[4].image,
    category: "Долги и кредиты",
    amount: 60000,
    helpers: 302,
    closedAt: "Октябрь 2024",
    title: "Просрочка закрыта, новые начисления остановлены",
    quote:
      "Мне было стыдно просить о помощи, но на платформе я почувствовала, что ситуацию можно решить без осуждения.",
    result: "Переводы поступали напрямую Ольге. После закрытия она показала оплату и выписку о погашении просрочки.",
  },
];

const ADMIN_PASSWORD_HASH = "89dff4423dd73af217eb641b9050a34ce2623f392919258ee754e402be74953f";
const ADMIN_SESSION_KEY = "100spasibo:admin-unlocked";
const TELEGRAM_CONTACT_URL = "https://t.me/100spasibo";
const REQUESTS_PER_PAGE = 8;

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
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
  const [publishedRequests, setPublishedRequests] = useState<HelpRequest[]>([]);
  useTelegramMiniApp(path, navigate);

  const allRequests = useMemo(() => [...publishedRequests, ...mockRequests], [publishedRequests]);

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

  const page = (() => {
    if (path === "/requests") return <RequestsPage requests={allRequests} onNavigate={navigate} />;
    if (path.startsWith("/requests/")) return <RequestDetailPage requests={allRequests} id={path.split("/").pop()} onNavigate={navigate} onToast={showToast} />;
    if (path === "/apply") return <ApplyPage onToast={showToast} onApplicationCreated={refreshPublishedRequests} />;
    if (path === "/how-it-works") return <HowItWorksPage onNavigate={navigate} />;
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
    if (path === "/faq") return <FaqPage />;
    return <HomePage requests={allRequests} onNavigate={navigate} />;
  })();

  return (
    <div className="telegram-mini-app">
      <MiniAppTopBar onNavigate={navigate} />
      <main className="telegram-mini-main">{page}</main>
      {path === "/admin" ? null : <MiniAppBottomNav path={path} onNavigate={navigate} />}
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

function HomePage({ requests, onNavigate }: { requests: HelpRequest[]; onNavigate: NavigateFn }) {
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
          <div className="social-proof">
            <div className="avatar-stack">
              {requests.slice(0, 5).map((item) => (
                <img key={item.id} src={item.image} alt="" width="44" height="44" />
              ))}
            </div>
            <p>Уже более 28 000 человек получили поддержку.</p>
          </div>
        </div>
        <WatercolorHero />
      </section>

      <section className="section shell">
        <div className="center-heading">
          <h2>Как это работает</h2>
        </div>
        <div className="steps-grid">
          <StepCard index={1} icon="file" title="Подача заявки" text="Человек заполняет анкету и прикрепляет документы, подтверждающие долг." />
          <StepCard index={2} icon="shield" title="Проверка документов" text="Мы проверяем документы и ситуацию, чтобы помощь была честной и адресной." />
          <StepCard index={3} icon="hands" title="Прямая помощь" text="После одобрения заявка публикуется. Люди переводят деньги напрямую получателю." />
          <StepCard index={4} icon="video" title="Видеоотчет" text="После сбора получатель показывает, как помощь была использована." />
        </div>
      </section>

      <section className="section shell">
        <div className="section-row">
          <div>
            <h2>Кому нужна помощь прямо сейчас</h2>
            <p>Выберите конкретного человека и помогите той суммой, которая сейчас комфортна.</p>
          </div>
          <Button variant="soft" onClick={() => onNavigate("/requests")}>Смотреть все заявки</Button>
        </div>
        <div className="featured-grid">
          {requests.slice(0, 3).map((request) => (
            <RequestCard key={request.id} request={request} onNavigate={onNavigate} compact />
          ))}
        </div>
      </section>

      <section className="section shell trust-strip">
        <TrustCard icon="shield" title="Документы проверены" text="Каждая заявка проходит ручную проверку модераторами платформы." />
        <TrustCard icon="card" title="Деньги идут напрямую получателю" text="Мы не удерживаем средства — вы помогаете человеку напрямую." />
        <TrustCard icon="video" title="Есть отчетность" text="Получатель показывает результат, а вы видите, как ваша помощь работает." />
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
        </div>
      </div>
    </section>
  );
}

function RequestDetailPage({ requests, id, onNavigate, onToast }: { requests: HelpRequest[]; id: string | undefined; onNavigate: NavigateFn; onToast: (message: string) => void }) {
  const request = requests.find((item) => item.id === id) ?? requests[0] ?? mockRequests[0];
  const targetAmount = request.id === "anna" ? 20000 : request.targetAmount;
  const collectedAmount = request.id === "anna" ? 13000 : request.collectedAmount;
  const percent = Math.min(100, Math.round((collectedAmount / targetAmount) * 100));
  const remaining = targetAmount - collectedAmount;
  const detailImage = request.id === "anna" ? annaPhoto : request.image;

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
              <p>{request.story}</p>
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
              <span><Icon name="users" /> Уже помогли 25 человек</span>
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

function ApplyPage({ onToast, onApplicationCreated }: { onToast: (message: string) => void; onApplicationCreated: () => Promise<void> }) {
  const [formVersion, setFormVersion] = useState(0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      onToast("Пожалуйста, заполните обязательные поля.");
      form.reportValidity();
      return;
    }
    try {
      await createApplication(form);
      await onApplicationCreated();
      onToast(isBackendConfigured ? "Заявка отправлена в админ-панель." : "Заявка сохранена в демо-очередь админки.");
      form.reset();
      setFormVersion((version) => version + 1);
    } catch {
      onToast("Не получилось отправить заявку. Проверьте подключение базы.");
    }
  };

  return (
    <section className="page shell apply-page">
      <div className="apply-hero">
        <div>
          <Badge icon="heart">Люди помогают людям</Badge>
          <h1>
            Подать заявку <span>на помощь</span>
          </h1>
          <p>
            Заполните анкету максимально подробно. Вся информация конфиденциальна и помогает нашей команде внимательно
            рассмотреть вашу ситуацию.
          </p>
        </div>
        <WatercolorHero type="apply" />
      </div>

      <div className="apply-layout">
        <form key={formVersion} className="application-form" onSubmit={handleSubmit}>
          <FormSection number={1} title="Личная информация">
            <Field name="full_name" label="Фамилия, имя, отчество" required placeholder="Иванов Иван Иванович" />
            <DateField name="birth_date" label="Дата рождения" required />
            <Field name="city" label="Город проживания" required placeholder="Например, Казань" />
            <SelectField name="family_status" label="Семейное положение" options={["Не выбрано", "Не женат / не замужем", "В браке", "Разведен(а)", "Другое"]} />
            <Field name="dependents" label="Количество иждивенцев" type="number" placeholder="0" />
          </FormSection>

          <FormSection number={2} title="Контактные данные">
            <Field name="telegram" label="Telegram для связи" required placeholder="@username" />
            <SelectField name="contact_time" label="Когда удобно написать" options={["В любое время", "Утром", "Днем", "Вечером"]} />
          </FormSection>

          <FormSection number={3} title="Информация о долге">
            <SelectField name="category" label="Тип долга" options={["Долги и кредиты", "Лечение и здоровье", "Коммунальные платежи", "Аренда жилья", "Образование", "Другое"]} />
            <Field name="creditor" label="Организация / МФО / банк / кредитор" required placeholder="Название организации" />
            <Field name="contract_number" label="Номер договора" placeholder="1234567890" />
            <DateField name="contract_date" label="Дата договора" />
            <SelectField name="debt_reason" label="Причина возникновения долга" options={["Потеря работы", "Снижение дохода", "Болезнь", "Непредвиденные расходы", "Семейные обстоятельства", "Другое"]} />
          </FormSection>

          <FormSection number={4} title="Сумма и сроки">
            <Field name="target_amount" label="Запрашиваемая сумма" required type="number" placeholder="Например, 20 000" />
            <SelectField label="Валюта" options={["Рубли (₽)", "Другая"]} />
            <SelectField name="urgency" label="На какой срок требуется помощь" options={["Срочно", "В течение недели", "В течение месяца", "Не срочно"]} />
            <DateField name="deadline" label="Крайний срок оплаты" />
          </FormSection>

          <FormSection number={5} title="Опишите вашу ситуацию" wide>
            <label className="form-field form-field-wide">
              <span>Расскажите, что произошло</span>
              <textarea name="story" required placeholder="Расскажите, что произошло, почему возник долг и почему сейчас вам нужна помощь." />
              <small>Не нужно писать слишком формально. Главное — честно объяснить ситуацию.</small>
            </label>
          </FormSection>

          <FormSection number={6} title="Загрузите документы" wide>
            <UploadBox />
            <ul className="example-docs">
              <li>Копия договора займа или кредита</li>
              <li>Справка о задолженности</li>
              <li>График платежей</li>
              <li>Документы, подтверждающие трудную ситуацию</li>
            </ul>
          </FormSection>

          <FormSection number={7} title="Реквизиты для получения помощи">
            <Field name="recipient_name" label="ФИО получателя" required placeholder="Полностью, как в паспорте" />
            <Field name="bank" label="Банк" required placeholder="Название банка" />
            <Field name="card" label="Номер карты / счета" required placeholder="Номер карты или счета" />
            <Field name="sbp_phone" label="Телефон для СБП" type="tel" placeholder="+7 (___) ___-__-__" />
            <p className="form-hint">Эти данные используются только для перевода помощи и проверки заявки.</p>
          </FormSection>

          <FormSection number={8} title="Согласие и обязательства" wide>
            <div className="consent-stack">
              {[
                "Я соглашаюсь на обработку персональных данных.",
                "Я подтверждаю, что вся информация в заявке является достоверной.",
                "Я понимаю, что заявка пройдет ручную проверку.",
                "Я обязуюсь предоставить отчет после получения помощи.",
                "Я согласен, что часть информации может быть опубликована в мини-приложении после модерации.",
              ].map((item) => (
                <label key={item}>
                  <input type="checkbox" required />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            <p className="policy-links">
              <a href="/safety">Политика конфиденциальности</a>
              <a href="/safety">Пользовательское соглашение</a>
            </p>
          </FormSection>

          <Button type="submit" className="submit-application">
            <Icon name="heart" filled />
            Отправить заявку
          </Button>
          <p className="secure-submit"><Icon name="lock" /> Заявка будет отправлена по защищенному соединению.</p>
        </form>

        <aside className="apply-sidebar">
          <SidebarCard icon="file" title="Какие документы подготовить" items={["Копия договора займа или кредита", "Справка о задолженности", "Документы, подтверждающие трудную ситуацию", "Выписка по долгу / задолженности"]} />
          <SidebarCard icon="calendar" title="Что будет после отправки" items={["Команда проверит информацию и документы.", "Мы свяжемся с вами в течение 1-3 рабочих дней.", "Если заявка пройдет проверку, она будет опубликована.", "После получения помощи мы попросим предоставить отчет."]} ordered />
          <div className="sidebar-card contact-help">
            <Icon name="heart" />
            <h3>Нужна помощь?</h3>
            <p>Если у вас возникли вопросы — напишите нам в Telegram.</p>
            <a href={TELEGRAM_CONTACT_URL} target="_blank" rel="noreferrer"><Icon name="telegram" />Написать в Telegram</a>
            <div className="safe-note"><Icon name="lock" />Ваша информация в безопасности. Мы не передаем данные третьим лицам.</div>
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

  const changeMonth = (direction: number) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  };

  const selectDate = (date: Date) => {
    setValue(formatDateValue(date));
    setViewDate(date);
    setOpen(false);
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
            <strong>{calendarMonths[viewDate.getMonth()]} {viewDate.getFullYear()}</strong>
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

function SidebarCard({ icon, title, items, ordered = false }: { icon: "file" | "calendar"; title: string; items: string[]; ordered?: boolean }) {
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
        text="Новые анкеты попадают сюда. После проверки нажмите «Опубликовать», и карточка появится в каталоге помощи."
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
        <DashboardStat icon="copy" label="Всего анкет" value={String(applications.length)} />
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
                <p>Когда человек отправит анкету из мини-аппа, она появится здесь.</p>
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

function StoriesPage({ onNavigate }: { onNavigate: NavigateFn }) {
  const [mainStory, ...otherStories] = completedStories;
  const totalHelp = completedStories.reduce((sum, item) => sum + item.amount, 0);
  const totalHelpers = completedStories.reduce((sum, item) => sum + item.helpers, 0);

  return (
    <section className="page shell stories-page">
      <div className="stories-hero">
        <div>
          <Badge icon="heart">Истории помощи</Badge>
          <h1>Люди, которым уже помогли</h1>
          <p>
            Здесь собраны завершенные истории: помощь дошла напрямую до человека, документы проверены, а после закрытия
            сбора получатель показал результат.
          </p>
        </div>
        <div className="stories-summary">
          <div>
            <strong>{completedStories.length}</strong>
            <span>завершенных историй</span>
          </div>
          <div>
            <strong>{formatRubles(totalHelp)}</strong>
            <span>помощи напрямую</span>
          </div>
          <div>
            <strong>{totalHelpers}</strong>
            <span>человек помогли</span>
          </div>
        </div>
      </div>

      <article className="story-featured">
        <img src={mainStory.image} alt={`${mainStory.name}, ${mainStory.city}`} width="420" height="420" />
        <div className="story-featured-copy">
          <div className="story-meta">
            <Badge tone="mint" icon="shield">Сбор закрыт</Badge>
            <span>{mainStory.closedAt}</span>
          </div>
          <h2>{mainStory.title}</h2>
          <blockquote>{mainStory.quote}</blockquote>
          <div className="story-result">
            <Icon name="video" />
            <p>{mainStory.result}</p>
          </div>
          <div className="story-stats">
            <span>{mainStory.name}, {mainStory.age} год, {mainStory.city}</span>
            <span>{formatRubles(mainStory.amount)}</span>
            <span>{mainStory.helpers} помощников</span>
          </div>
        </div>
      </article>

      <div className="stories-grid">
        {otherStories.map((story) => (
          <article className="story-card" key={story.name + story.city}>
            <div className="story-card-head">
              <img src={story.image} alt={`${story.name}, ${story.city}`} width="112" height="112" loading="lazy" />
              <div>
                <Badge tone="mint" icon="check">Помощь получена</Badge>
                <h2>{story.name}, {story.age}</h2>
                <p>{story.city} · {story.category}</p>
              </div>
            </div>
            <h3>{story.title}</h3>
            <blockquote>{story.quote}</blockquote>
            <div className="story-card-result">
              <Icon name="video" />
              <span>Видеоотчет опубликован</span>
            </div>
            <div className="story-card-foot">
              <strong>{formatRubles(story.amount)}</strong>
              <span>{story.helpers} помощников</span>
            </div>
          </article>
        ))}
      </div>

      <div className="stories-cta">
        <div>
          <h2>Новая история может начаться со 100 рублей</h2>
          <p>Выберите человека из проверенного каталога и помогите напрямую той суммой, которая вам комфортна.</p>
        </div>
        <Button onClick={() => onNavigate("/requests")}>
          <Icon name="heart" filled />
          Хочу помочь
        </Button>
      </div>
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
        <StepCard index={1} icon="file" title="Заявка" text="Человек заполняет форму, рассказывает ситуацию и прикладывает подтверждения." />
        <StepCard index={2} icon="shield" title="Модерация" text="Команда проверяет документы и публикует только безопасную часть информации." />
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
