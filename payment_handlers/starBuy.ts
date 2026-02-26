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
        `Доступ в канал на ${days} дней`,
        `Получи приватный доступ на ${days} дней за ${stars} ⭐`,
        payload,
        "XTR",
        [{ label: `${days} дней`, amount: stars }],
    );
}
