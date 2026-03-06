// config.ts
import { starBuy } from "./payment_handlers/starBuy";
import { cryptoBuy } from "./payment_handlers/cryptoBuy";
import { PayConfig } from "./types";
import { BotContext } from "./types/session";
import dotenv from "dotenv";
import { keys } from "./keys";
dotenv.config();

export const COMMAND_TYPES = ["stars", "crypto"] as const;

export const PAY_CONFIG_ARRAY: PayConfig[] = [
    {
        days: 1,
        label: keys.price.oneDay,
        payments: [
            {
                label: "1 ⭐ Stars",
                command: "stars",
                callback: (ctx: BotContext) => starBuy(ctx, 1, 1),
            },
            {
                label: "💎 CryptoBot — $1",
                command: "crypto",
                callback: (ctx: BotContext) => cryptoBuy(ctx, 1, 1),
            },
        ],
    },
    {
        days: 180,
        label: keys.price.oneDay,
        payments: [
            {
                label: "2500 ⭐ Stars",
                command: "stars",
                callback: (ctx: BotContext) => starBuy(ctx, 180, 2500),
            },
            {
                label: "💎 CryptoBot — $15",
                command: "crypto",
                callback: (ctx: BotContext) => cryptoBuy(ctx, 180, 15),
            },
        ],
    },
];
