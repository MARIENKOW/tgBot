import { subtle } from "node:crypto";

export const keys = {
    tariff: {
        errors: {
            notFound: "❌ This tariff no longer exists! /start",
        },
        btn: "Tariff",
        chooseTariff: (value: any) =>
            `🔐 <b>${value}</b>\n\n` + "Choose a payment method:",
    },
    status: {
        errors: {
            notFound: "⛔ No active access. Buy a tariff! /start",
        },
        btn: "Status",
        show: ({ until, daysLeft }: { until: any; daysLeft: any }) =>
            `✅ Access active until:\n${until}\n\n` +
            `📅 Remaining: ${daysLeft} days`,
    },
    stars: {
        invoice: {
            title: (days: number) => `Доступ в канал на ${days} дней`,
            subtitle: ({ days, stars }: { days: number; stars: number }) =>
                `Получи приватный доступ на ${days} дней за ${stars} ⭐`,
            label: (days: number) => `${days} дней`,
        },
    },
    crypto: {
        invoice: {
            error: {
                notfound: "❌ Тариф не найден.",
                catch: "❌ Ошибка создания счёта. Попробуй позже.",
            },
            pay: "💳 Оплатить в CryptoBot",
            description: (days: number) => `Доступ на ${days} дней`,
            message: ({ label, usd }: { usd: number; label: string }) =>
                `💎 <b>Оплата через CryptoBot</b>\n\n` +
                `📦 Тариф: ${label}\n` +
                `💵 Сумма: $${usd}\n\n` +
                `👆 Нажми кнопку и оплати.\n` +
                `✅ Доступ откроется <b>автоматически</b> после оплаты.\n` +
                `⏰ Счёт действует 1 час.`,
            promise: "⏳ Создаём счёт...",
        },
    },
    price: {
        oneDay: "1 day",
        sixMonth: "6 months",
        main:
            "🔐 <b>Private channel — paid access</b>\n\n" + "Choose a tariff:",
    },
    access: {
        success: ({
            statusMessage,
            link,
            untilDate,
        }: {
            statusMessage: any;
            link: any;
            untilDate: any;
        }) =>
            `${statusMessage}\n\n` +
            `🔗 <b>Go to the channel using the link:</b>\n\n` +
            `${link}\n\n` +
            `📅 Valid until: ${untilDate}\n` +
            `(The link is one-time use, only for you)`,
        active: "✅ Access activated!",
        extended: "✅ Access extended!",
        errors: {
            link: `✅ Access recorded. Contact the admin for the link.\n\n ${process.env.BOT_ADMIN}`,
            expired:
                "⛔ <b>Access has expired!</b>\n\n💳 Buy a new tariff: /price",
        },
    },
    menu: {
        start: "Start bot",
        name: "menu",
    },
};
