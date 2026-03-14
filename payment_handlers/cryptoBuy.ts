// payment_handlers/cryptoBuy.ts
import { InlineKeyboard } from "grammy";
import { BotContext } from "../types/session";
import { PAY_CONFIG_ARRAY } from "../config";
import { createInvoice } from "../cryptobot";
import { keys } from "../keys";

export async function cryptoBuy(
    ctx: BotContext,
    days: number,
    usd: number,
): Promise<void> {
    const payConfig = PAY_CONFIG_ARRAY.find((el) => el.days === days);
    if (!payConfig) {
        await ctx.reply(keys.crypto.invoice.error.notfound);
        return;
    }

    const userId = ctx.from!.id;
    const username = ctx.from!.username;
    const msg = await ctx.reply(keys.crypto.invoice.promise);

    try {
        const invoice = await createInvoice({
            userId,
            days,
            username,
            amountUsd: usd,
            description: keys.crypto.invoice.description(days),
        });

        const keyboard = new InlineKeyboard().url(
            keys.crypto.invoice.pay,
            invoice.pay_url,
        );

        await ctx.api.editMessageText(
            ctx.chat!.id,
            msg.message_id,
            keys.crypto.invoice.message({ label: payConfig.label, usd }),
            { parse_mode: "HTML", reply_markup: keyboard },
        );
    } catch (err) {
        console.error("CryptoBot createInvoice error:", err);
        await ctx.api.editMessageText(
            ctx.chat!.id,
            msg.message_id,
            keys.crypto.invoice.error.catch,
        );
    }
}
