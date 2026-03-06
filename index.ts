import {
    Bot,
    Context as BaseContext,
    session,
    Keyboard,
    InlineKeyboard,
} from "grammy";
import { Menu } from "@grammyjs/menu";
import cron from "node-cron";
import dotenv from "dotenv";
import { SessionData, BotContext } from "./types/session"; // ← Импорт
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { isCommandType } from "./helpers";
import { PAY_CONFIG_ARRAY } from "./config";
import { startWebhookServer } from "./webhook";

const locale = "en-US";
const timezone = "Europe/Kyiv";

const keys = {
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
    price: {
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

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

const bot = new Bot<BotContext>(process.env.BOT_TOKEN as string); // ← Типизация Bot

// Middleware сессии с типом
bot.use(
    session({
        initial: (): SessionData => ({}), // ← Явный тип
    }),
);

const menu = PAY_CONFIG_ARRAY.reduce((acc, el) => {
    return acc
        .text(el.label, async (ctx) => await tariffByDay(ctx, el.days))
        .row();
}, new Menu<BotContext>("tariffs"));

bot.use(menu);

async function tariffByDay(ctx: BotContext, days: number) {
    const payConfig = PAY_CONFIG_ARRAY.find((el) => el.days === days);
    if (!payConfig) return await ctx.reply(keys.tariff.errors.notFound);

    const keyboard = payConfig.payments.reduce((kb, el) => {
        return kb.text(el.label, `buy:${days}:${el.command}`).row();
    }, new InlineKeyboard());

    await ctx.reply(keys.tariff.chooseTariff(payConfig.label), {
        parse_mode: "HTML",
        reply_markup: keyboard,
    });
}
async function showStatus(ctx: BotContext) {
    // ← BotContext
    const userId = ctx.from!.id;
    const now = Math.floor(Date.now() / 1000);

    const access = await prisma.access.findUnique({
        where: { userId: String(userId) },
    });

    if (!access || access.accessUntil < now) {
        return ctx.reply(keys.status.errors.notFound);
    }

    const until = new Date(access.accessUntil * 1000).toLocaleString(locale);
    const daysLeft = Math.floor(Number(access.accessUntil - now) / 86400);

    ctx.reply(keys.status.show({ until, daysLeft }));
}
async function start(ctx: BotContext) {
    await price(ctx);
    const keyboard = new Keyboard()
        .text(keys.tariff.btn)
        .text(keys.status.btn)
        .resized();

    await ctx.reply(keys.menu.name, {
        reply_markup: keyboard,
    });

    await bot.api.setMyCommands([
        { command: "start", description: keys.menu.start },
        { command: "price", description: keys.tariff.btn },
        { command: "status", description: keys.status.btn },
    ]);
}
async function price(ctx: BotContext) {
    await ctx.reply(keys.price.main, {
        parse_mode: "HTML",
        reply_markup: menu,
    });
}

async function grantAccess(userId: number, period: number, username?: string) {
    const now = Math.floor(Date.now() / 1000);
    const newUntil = now + period;

    const current = await prisma.access.findUnique({
        where: { userId: String(userId) },
    });

    const accessUntil =
        current && current.accessUntil > now
            ? Math.max(current.accessUntil + period, newUntil)
            : newUntil;

    const isRenewal = current && current.accessUntil > now;

    await prisma.access.upsert({
        where: { userId: String(userId) },
        update: { accessUntil },
        create: { userId: String(userId), accessUntil, username },
    });

    const expire_date = now + 3600;
    const untilDate = new Date(Number(accessUntil) * 1000).toLocaleString(
        locale,
    );
    const statusMessage = isRenewal ? keys.access.extended : keys.access.active;

    try {
        const link = await bot.api.createChatInviteLink(
            process.env.CHANNEL_ID as string,
            {
                member_limit: 1,
                expire_date,
                name: `access_${userId}_${Date.now()}`,
                creates_join_request: false,
            },
        );

        await bot.api.sendMessage(
            userId,

            keys.access.success({
                statusMessage,
                link: link.invite_link,
                untilDate,
            }),
            { parse_mode: "HTML" },
        );
    } catch (err) {
        console.error("Ошибка создания ссылки:", err);
        await bot.api.sendMessage(userId, keys.access.errors.link);
    }
}

bot.on("pre_checkout_query", async (ctx) => {
    await ctx.answerPreCheckoutQuery(true);
});

bot.on("message:successful_payment", async (ctx: BotContext) => {
    const payment = ctx.message!.successful_payment!;
    const payload = JSON.parse(payment.invoice_payload) as {
        days: number;
        period: number;
    };

    await grantAccess(ctx.from!.id, payload.period, ctx.from!.username);
});

bot.on("callback_query:data", async (ctx, next) => {
    const data = ctx.callbackQuery.data;
    if (!data) return next();
    const arrData = data.split(":");
    if (!arrData[0]) return next();
    if (arrData[0] !== "buy") return next();
    if (!arrData[1]) return next();
    const payConfig = PAY_CONFIG_ARRAY.find(
        (el) => el.days === Number(arrData[1]),
    );
    if (!payConfig) return next();
    if (!arrData[2]) return next();
    if (!isCommandType(arrData[2])) return next();
    const payment = payConfig.payments.find((el) => el.command === arrData[2]);
    if (!payment) return next();
    console.log(data);
    await payment.callback(ctx);
    return ctx.answerCallbackQuery();
});
// /start
bot.command("start", start);
bot.command("price", price);
bot.command("status", showStatus);
bot.hears(keys.tariff.btn, price);
bot.hears(keys.status.btn, showStatus);
// Cron (без изменений)
cron.schedule(
    "1 * * * * *",
    async () => {
        console.log("🧹 Проверяем истёкшие доступы...");
        const now = Math.floor(Date.now() / 1000);

        const expired = await prisma.access.findMany({
            where: {
                accessUntil: { lt: now },
                NOT: { accessUntil: 0 },
            },
        });

        let kicked = 0;
        for (const acc of expired) {
            try {
                const member = await bot.api.getChatMember(
                    process.env.CHANNEL_ID as string,
                    Number(acc.userId),
                );
                if (
                    ["member", "administrator", "creator"].includes(
                        member.status,
                    )
                ) {
                    // 1. Кик
                    await bot.api.banChatMember(
                        process.env.CHANNEL_ID as string,
                        Number(acc.userId),
                    );

                    // 2. МГНОВЕННЫЙ разбан!
                    await bot.api.unbanChatMember(
                        process.env.CHANNEL_ID as string,
                        Number(acc.userId),
                    );
                    console.log(`👢 Кикнул userId: ${acc.userId}`);
                    kicked++;

                    await bot.api.sendMessage(
                        Number(acc.userId),
                        keys.access.errors.expired,
                        { parse_mode: "HTML" },
                    );
                }

                await prisma.access.delete({ where: { id: acc.id } });
            } catch (err: any) {
                console.error(`Ошибка кика ${acc.userId}:`, err.message);
            }
        }

        console.log(`✅ Кик обработан: ${kicked}/${expired.length} юзеров`);
    },
    {
        timezone: timezone,
    },
);
// Обработка ошибок
bot.catch((err) => {
    console.error("Bot error:", err);
});
// Graceful запуск
(async () => {
    try {
        await prisma.$connect();
        console.log("✅ Prisma подключена");
        await bot.start({
            onStart(botInfo) {
                console.log("🚀 Бот запущен! ", botInfo.first_name);
            },
        });
    } catch (err) {
        console.error("🚨 Ошибка запуска:", err);
        process.exit(1);
    }
})();
process.on("SIGINT", async () => {
    console.log("\n🛑 Остановка...");
    await bot.stop();
    await prisma.$disconnect();
    console.log("\n🛑 Стоп");
    process.exit(0);
});

const WEBHOOK_PORT = Number(process.env.WEBHOOK_PORT ?? 3000);
startWebhookServer(WEBHOOK_PORT, grantAccess);
