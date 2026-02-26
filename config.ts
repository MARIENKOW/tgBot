import { starBuy } from "./payment_handlers/starBuy";
import { PayConfig } from "./types";
import { BotContext } from "./types/session";
import dotenv from "dotenv";
dotenv.config();

export const COMMAND_TYPES = ["stars", "crypto"] as const;
export const PAY_CONFIG_ARRAY: PayConfig[] = [
    {
        days: 1,
        label: "1 день",
        payments: [
            {
                label: "1 ⭐ STARS",
                command: "stars",
                callback: (ctx: BotContext) => starBuy(ctx, 1, 1),
            },
        ],
    },
    {
        days: 180,
        label: "6 месяцев",
        payments: [
            {
                label: "2500 ⭐ STARS",
                command: "stars",
                callback: (ctx: BotContext) => starBuy(ctx, 180, 2500),
            },
        ],
    },
];
