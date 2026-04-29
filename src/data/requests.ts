export type RequestCategory =
  | "Лечение и здоровье"
  | "Долги и кредиты"
  | "Коммунальные платежи"
  | "Аренда жилья"
  | "Образование"
  | "Другое";

export type HelpRequest = {
  id: string;
  name: string;
  age: number;
  city: string;
  category: RequestCategory;
  reason: string;
  story: string;
  targetAmount: number;
  collectedAmount: number;
  verified: boolean;
  urgency: "Срочно" | "В течение недели" | "В течение месяца" | "Не срочно";
  daysLeft: number;
  image: string;
  documents: string[];
  recipient: {
    name: string;
    bank: string;
    card: string;
    sbpPhone: string;
  };
  updates: Array<{
    date: string;
    text: string;
  }>;
};

export const requests: HelpRequest[] = [
  {
    id: "anna",
    name: "Анна",
    age: 34,
    city: "Казань",
    category: "Долги и кредиты",
    reason: "Погашение микрозайма, чтобы закрыть долг и начать с чистого листа.",
    story:
      "Я потеряла работу в начале года. Долго искала новое место, но пока не получается устроиться. Чтобы продержаться и закрыть базовые расходы, оформила микрозайм. Сейчас процентов уже больше, чем я могу потянуть. Прошу помощи, чтобы погасить долг и вернуть себе спокойствие. Я обязательно предоставлю отчет и подтверждение оплаты.",
    targetAmount: 35000,
    collectedAmount: 21000,
    verified: true,
    urgency: "В течение месяца",
    daysLeft: 14,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    documents: [
      "Паспорт гражданина РФ",
      "Договор микрозайма",
      "Выписка о задолженности",
      "Справка о доходах",
    ],
    recipient: {
      name: "Анна Сергеевна П.",
      bank: "Т-Банк АО",
      card: "2200 7001 2345 6789",
      sbpPhone: "+7 987 654-32-10",
    },
    updates: [
      { date: "20 мая 2024", text: "Анна разместила заявку на помощь и предоставила документы." },
      { date: "21 мая 2024", text: "Документы проверены модератором платформы." },
      { date: "22 мая 2024", text: "Сбор открыт. Спасибо всем, кто уже откликнулся." },
      { date: "Сегодня", text: "Собрано 60%. Осталось совсем немного." },
    ],
  },
  {
    id: "igor",
    name: "Игорь",
    age: 29,
    city: "Новосибирск",
    category: "Аренда жилья",
    reason: "Оплата аренды жилья, чтобы не потерять работу и крышу над головой.",
    story:
      "Игорь временно остался без стабильного дохода после смены работы. Ему важно закрыть аренду за месяц, чтобы спокойно выйти на новое место и не потерять жилье.",
    targetAmount: 30000,
    collectedAmount: 18900,
    verified: true,
    urgency: "В течение недели",
    daysLeft: 11,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    documents: ["Договор аренды", "Справка о задолженности", "Трудовой договор"],
    recipient: {
      name: "Игорь Павлович М.",
      bank: "Сбербанк",
      card: "2202 2004 5678 9012",
      sbpPhone: "+7 913 111-22-33",
    },
    updates: [
      { date: "18 мая 2024", text: "Заявка принята и уточнены детали по аренде." },
      { date: "19 мая 2024", text: "Документы проверены." },
      { date: "Сегодня", text: "Сбор идет, уже помогли 18 человек." },
    ],
  },
  {
    id: "maria",
    name: "Мария",
    age: 31,
    city: "Ростов-на-Дону",
    category: "Коммунальные платежи",
    reason: "Оплата задолженности по коммунальным услугам, чтобы дома был свет и тепло.",
    story:
      "Мария одна воспитывает ребенка и временно не смогла полностью закрыть коммунальные платежи. Ей нужна помощь, чтобы погасить задолженность и вернуться к обычному графику оплат.",
    targetAmount: 15000,
    collectedAmount: 9450,
    verified: true,
    urgency: "В течение недели",
    daysLeft: 8,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    documents: ["Квитанции ЖКУ", "Выписка о задолженности", "Свидетельство о рождении ребенка"],
    recipient: {
      name: "Мария Андреевна К.",
      bank: "ВТБ",
      card: "2200 2400 1122 3344",
      sbpPhone: "+7 918 555-44-33",
    },
    updates: [
      { date: "17 мая 2024", text: "Мария отправила документы по коммунальным платежам." },
      { date: "18 мая 2024", text: "История опубликована после проверки." },
    ],
  },
  {
    id: "sergey",
    name: "Сергей",
    age: 42,
    city: "Екатеринбург",
    category: "Лечение и здоровье",
    reason: "Лечение после операции, нужны лекарства и реабилитация.",
    story:
      "После операции Сергею нужно пройти курс восстановления. Часть расходов уже закрыта семьей, но на лекарства и реабилитацию не хватает средств.",
    targetAmount: 45000,
    collectedAmount: 22500,
    verified: true,
    urgency: "В течение месяца",
    daysLeft: 20,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    documents: ["Выписка из клиники", "Назначения врача", "Чеки за лечение"],
    recipient: {
      name: "Сергей Викторович Н.",
      bank: "Альфа-Банк",
      card: "2200 1500 8765 4321",
      sbpPhone: "+7 922 100-11-22",
    },
    updates: [{ date: "Сегодня", text: "Сбор открыт после проверки медицинских документов." }],
  },
  {
    id: "olga",
    name: "Ольга",
    age: 38,
    city: "Самара",
    category: "Долги и кредиты",
    reason: "Погасить долги по кредитам, чтобы сохранить жилье и спокойствие.",
    story:
      "Ольга временно потеряла часть дохода и не успела внести несколько платежей. Помощь позволит закрыть просрочку и не допустить новых начислений.",
    targetAmount: 60000,
    collectedAmount: 31200,
    verified: true,
    urgency: "В течение месяца",
    daysLeft: 18,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
    documents: ["Кредитный договор", "Выписка о задолженности", "Справка о доходах"],
    recipient: {
      name: "Ольга Романовна С.",
      bank: "Газпромбанк",
      card: "2200 5000 3344 5566",
      sbpPhone: "+7 927 987-65-43",
    },
    updates: [{ date: "23 мая 2024", text: "История прошла модерацию и открыта для помощи." }],
  },
  {
    id: "dmitry",
    name: "Дмитрий",
    age: 22,
    city: "Краснодар",
    category: "Образование",
    reason: "Оплата учебы, чтобы не прерывать образование и получить профессию.",
    story:
      "Дмитрий учится и подрабатывает, но после задержки зарплаты не успел закрыть оплату семестра. Ему важно продолжить учебу без академического отпуска.",
    targetAmount: 40000,
    collectedAmount: 16000,
    verified: true,
    urgency: "В течение месяца",
    daysLeft: 25,
    image:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=600&q=80",
    documents: ["Договор с учебным заведением", "Счет на оплату", "Справка студента"],
    recipient: {
      name: "Дмитрий Ильич В.",
      bank: "Т-Банк АО",
      card: "2200 7002 1234 3333",
      sbpPhone: "+7 918 707-12-12",
    },
    updates: [{ date: "Сегодня", text: "Сбор открыт, документы по учебе проверены." }],
  },
  {
    id: "elena",
    name: "Елена",
    age: 36,
    city: "Воронеж",
    category: "Лечение и здоровье",
    reason: "Лечение ребенка, необходимо пройти курс реабилитации.",
    story:
      "Семье Елены нужна поддержка для курса реабилитации ребенка. Часть суммы уже собрана родственниками, осталось закрыть счет клиники.",
    targetAmount: 80000,
    collectedAmount: 32000,
    verified: true,
    urgency: "В течение недели",
    daysLeft: 9,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    documents: ["Назначение врача", "Счет клиники", "Справка о доходах"],
    recipient: {
      name: "Елена Олеговна Р.",
      bank: "Сбербанк",
      card: "2202 2001 4455 6677",
      sbpPhone: "+7 920 222-45-45",
    },
    updates: [{ date: "21 мая 2024", text: "Медицинские документы проверены." }],
  },
  {
    id: "tatiana",
    name: "Татьяна",
    age: 46,
    city: "Челябинск",
    category: "Лечение и здоровье",
    reason: "Срочная операция по зрению, чтобы вернуться к обычной жизни.",
    story:
      "Татьяна собирает недостающую сумму на операцию по зрению. После помощи она предоставит отчет и подтверждение оплаты клиники.",
    targetAmount: 55000,
    collectedAmount: 27500,
    verified: true,
    urgency: "Срочно",
    daysLeft: 6,
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
    documents: ["Назначение врача", "Счет клиники", "Выписка по расходам"],
    recipient: {
      name: "Татьяна Николаевна Е.",
      bank: "ВТБ",
      card: "2200 2400 9999 1010",
      sbpPhone: "+7 951 333-77-77",
    },
    updates: [{ date: "Сегодня", text: "Сбор открыт, осталось 50% суммы." }],
  },
  {
    id: "amir",
    name: "Амир",
    age: 27,
    city: "Москва",
    category: "Другое",
    reason: "Закрыть долг за ремонт после аварийной протечки в квартире.",
    story:
      "После протечки Амир взял деньги в долг на срочный ремонт. Сейчас нужно вернуть часть суммы, чтобы не сорвать договоренности с мастерами.",
    targetAmount: 28000,
    collectedAmount: 8400,
    verified: true,
    urgency: "В течение месяца",
    daysLeft: 21,
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    documents: ["Смета работ", "Расписка", "Фото повреждений"],
    recipient: {
      name: "Амир Русланович Х.",
      bank: "Райффайзен Банк",
      card: "2200 3000 4444 5555",
      sbpPhone: "+7 916 232-11-11",
    },
    updates: [{ date: "19 мая 2024", text: "Заявка проверена и опубликована." }],
  },
  {
    id: "alisa",
    name: "Алиса",
    age: 24,
    city: "Санкт-Петербург",
    category: "Образование",
    reason: "Закрыть долг за курсы, чтобы закончить обучение и выйти на работу.",
    story:
      "Алиса проходит профессиональные курсы и уже нашла стажировку. Осталось закрыть часть оплаты, чтобы получить сертификат.",
    targetAmount: 22000,
    collectedAmount: 11000,
    verified: false,
    urgency: "В течение месяца",
    daysLeft: 24,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    documents: ["Договор обучения", "Счет на оплату"],
    recipient: {
      name: "Алиса Денисовна Л.",
      bank: "Т-Банк АО",
      card: "2200 7005 9876 5432",
      sbpPhone: "+7 911 100-30-40",
    },
    updates: [{ date: "Сегодня", text: "Заявка находится на ручной проверке." }],
  },
  {
    id: "roman",
    name: "Роман",
    age: 33,
    city: "Екатеринбург",
    category: "Коммунальные платежи",
    reason: "Погасить долг за отопление после временного снижения дохода.",
    story:
      "Роман ухаживал за родственником и временно перешел на неполную занятость. Сейчас возвращается к обычному графику, но нужна помощь с накопившимся платежом.",
    targetAmount: 18000,
    collectedAmount: 7200,
    verified: true,
    urgency: "В течение недели",
    daysLeft: 7,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    documents: ["Квитанции ЖКУ", "Выписка о задолженности"],
    recipient: {
      name: "Роман Игоревич Д.",
      bank: "Сбербанк",
      card: "2202 2009 1234 1212",
      sbpPhone: "+7 912 454-90-90",
    },
    updates: [{ date: "22 мая 2024", text: "Документы по коммунальным платежам проверены." }],
  },
  {
    id: "nina",
    name: "Нина",
    age: 28,
    city: "Краснодар",
    category: "Аренда жилья",
    reason: "Помощь с арендой после переезда на новую работу.",
    story:
      "Нина переехала на новую работу и задержалась с первым авансом. Ей нужно закрыть часть аренды, чтобы спокойно закрепиться на новом месте.",
    targetAmount: 26000,
    collectedAmount: 6500,
    verified: true,
    urgency: "В течение недели",
    daysLeft: 10,
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    documents: ["Договор аренды", "Письмо работодателя", "Выписка по платежам"],
    recipient: {
      name: "Нина Александровна А.",
      bank: "Альфа-Банк",
      card: "2200 1500 3030 4040",
      sbpPhone: "+7 918 343-55-55",
    },
    updates: [{ date: "Сегодня", text: "История опубликована после проверки." }],
  },
];

export const featuredRequests = requests.slice(0, 3);

export function findRequest(id: string | undefined) {
  return requests.find((item) => item.id === id) ?? requests[0];
}

export function getPercent(request: Pick<HelpRequest, "targetAmount" | "collectedAmount">) {
  return Math.min(100, Math.round((request.collectedAmount / request.targetAmount) * 100));
}

export function formatRubles(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value).replace(/\s/g, "\u00A0") + "\u00A0₽";
}
