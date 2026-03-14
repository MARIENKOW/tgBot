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
            title: (days: number) => `Channel access for ${days} days`,
            subtitle: ({ days, stars }: { days: number; stars: number }) =>
                `Get private access for ${days} days for ${stars} ⭐`,
            label: (days: number) => `${days} days`,
        },
    },
    crypto: {
        invoice: {
            error: {
                notfound: "❌ Plan not found.",
                catch: "❌ Failed to create invoice. Please try again later.",
            },
            pay: "💳 Pay via CryptoBot",
            description: (days: number) => `Access for ${days} days`,
            message: ({ label, usd }: { usd: number; label: string }) =>
                `💎 <b>Payment via CryptoBot</b>\n\n` +
                `📦 Plan: ${label}\n` +
                `💵 Amount: $${usd}\n\n` +
                `👆 Click the button and complete the payment.\n` +
                `✅ Access will be granted <b>automatically</b> after payment.\n` +
                `⏰ The invoice is valid for 1 hour.`,
            promise: "⏳ Creating invoice...",
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
