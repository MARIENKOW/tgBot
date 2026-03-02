// payment_handlers/cryptoBuy.ts
import { InlineKeyboard } from "grammy";
import { BotContext } from "../types/session";
import { PAY_CONFIG_ARRAY } from "../config";
import { createInvoice } from "../cryptobot";

export async function cryptoBuy(
    ctx: BotContext,
    days: number,
    usd: number,
): Promise<void> {
    const payConfig = PAY_CONFIG_ARRAY.find((el) => el.days === days);
    if (!payConfig) {
        await ctx.reply("❌ Тариф не найден.");
        return;
    }

    const userId = ctx.from!.id;
    const username = ctx.from!.username;
    const msg = await ctx.reply("⏳ Создаём счёт...");

    try {
        const invoice = await createInvoice({
            userId,
            days,
            username,
            amountUsd: usd,
            description: `Доступ на ${days} дней`,
        });

        const keyboard = new InlineKeyboard().url(
            "💳 Оплатить в CryptoBot",
            invoice.pay_url,
        );

        await ctx.api.editMessageText(
            ctx.chat!.id,
            msg.message_id,
            `💎 <b>Оплата через CryptoBot</b>\n\n` +
                `📦 Тариф: ${payConfig.label}\n` +
                `💵 Сумма: $${usd}\n\n` +
                `👆 Нажми кнопку и оплати.\n` +
                `✅ Доступ откроется <b>автоматически</b> после оплаты.\n` +
                `⏰ Счёт действует 1 час.`,
            { parse_mode: "HTML", reply_markup: keyboard },
        );
    } catch (err) {
        console.error("CryptoBot createInvoice error:", err);
        await ctx.api.editMessageText(
            ctx.chat!.id,
            msg.message_id,
            "❌ Ошибка создания счёта. Попробуй позже.",
        );
    }
}
