import { CurrencyType } from "crypto-bot-api";
import { BotContext } from "../types/session";
import CryptoBotAPI from "crypto-bot-api";

const cryptoPay = new CryptoBotAPI(process.env.CRYPTOBOT_TOKEN as string);

async function buyCrypto(ctx: BotContext, days: number, amount: string) {
    const userId = ctx.from!.id;
    const period = days * 86400;

    try {
        const invoice = await cryptoPay.createInvoice({
            currencyType: CurrencyType.Fiat, // считаем в USD, CryptoBot сам конвертирует
            fiat: "USD",
            amount,
            acceptedAssets: ["USDT", "TON", "BTC", "ETH", "LTC"],
            description: `Доступ в канал на ${days} дней`,
            payload: JSON.stringify({ userId, days, period }),
            expiresIn: 3600,
        });

        await ctx.reply(
            `💎 <b>Оплата криптой</b>\n\n` +
                `📦 Тариф: ${days} дней\n` +
                `💵 Сумма: $${amount}\n\n` +
                `👇 Нажми кнопку для оплаты:`,
            {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: `💳 Оплатить $${amount}`,
                                url: "invoice.payUrl",
                            },
                        ],
                    ],
                },
            },
        );
    } catch (err) {
        console.error("Ошибка создания крипто-инвойса:", err);
        await ctx.reply("❌ Ошибка создания платежа. Попробуй позже.");
    }
}
