import { keys } from "../keys";
import { BotContext } from "../types/session";

export async function starBuy(ctx: BotContext, days: number, stars: number) {
    // ← BotContext
    const period = days * 86400;
    const payload = JSON.stringify({
        days,
        period,
        channel: process.env.CHANNEL_ID?.toString(),
    });

    await ctx.api.sendInvoice(
        ctx.chat!.id,
        keys.stars.invoice.title(days),
        keys.stars.invoice.subtitle({ days, stars }),
        payload,
        "XTR",
        [{ label: keys.stars.invoice.label(days), amount: stars }],
    );
}
