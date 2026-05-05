import olgaPhoto from "../assets/olga-photo.png";

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
    card?: string;
    sbpPhone: string;
  };
  updates: Array<{
    date: string;
    text: string;
  }>;
};

export const requests: HelpRequest[] = [
  {
    id: "olga",
    name: "Ольга",
    age: 44,
    city: "Город уточняется",
    category: "Долги и кредиты",
    reason: "Помощь с кредитными обязательствами после резкого изменения семейной ситуации.",
    story:
      "Меня зовут Ольга, мне 44 года. Еще недавно у нас с мужем была обычная, спокойная и очень счастливая жизнь. Мы много работали, вместе строили планы, радовались маленьким победам и верили, что все делаем правильно. Купили машину, начали строить дачу, взяли квартиру в ипотеку. Да, многое было оформлено в кредит, но тогда мы были вдвоем, у нас была хорошая общая зарплата, и мы уверенно справлялись с платежами. Я думала, что это наш общий путь и наша общая ответственность.\n\nПотом с мужем будто что-то произошло. Он неожиданно решил уйти из семьи и не объяснил причину. Я осталась одна с обязательствами, которые мы брали вместе. Самое тяжелое сейчас даже не цифры, а ощущение, что привычная опора исчезла в один момент. Я стараюсь держаться, работаю, не прячусь от ответственности и делаю все, что могу, но на одну зарплату вытянуть ипотеку, кредиты, машину и начатую дачу невозможно.\n\nМне очень неловко просить о помощи, но я понимаю, что сейчас не справляюсь одна. Я прошу поддержки, чтобы пройти этот период спокойно, не потерять жилье и постепенно вернуть себе устойчивость. Для меня важна любая помощь и любое человеческое участие. Я обязательно покажу, как будет использована поддержка, и буду благодарна каждому, кто просто не пройдет мимо.",
    targetAmount: 9840750,
    collectedAmount: 0,
    verified: true,
    urgency: "В течение месяца",
    daysLeft: 30,
    image: olgaPhoto,
    documents: ["Видео-подтверждение долга", "Кредитные договора", "Справка о доходах"],
    recipient: {
      name: "Ольга Владимировна Е.",
      bank: "Т-Банк",
      sbpPhone: "+7 905 152-30-32",
    },
    updates: [
      {
        date: "Пока нет истории",
        text: "Сбор только начинается. Обновления появятся после первых подтвержденных переводов.",
      },
    ],
  },
];

export const featuredRequests = requests.slice(0, 3);

export function findRequest(id: string | undefined) {
  return requests.find((item) => item.id === id) ?? requests[0];
}

export function getPercent(request: Pick<HelpRequest, "targetAmount" | "collectedAmount">) {
  if (request.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((request.collectedAmount / request.targetAmount) * 100));
}

export function formatRubles(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value).replace(/\s/g, "\u00A0") + "\u00A0₽";
}
