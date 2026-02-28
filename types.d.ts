// types.ts
import { COMMAND_TYPES } from "./config";
import { BotContext } from "./types/session";

export type CommandType = (typeof COMMAND_TYPES)[number];

export type Payments = {
    label: string;
    command: CommandType;
    callback: (ctx: BotContext) => Promise<void>;
};

export type PayConfig = {
    days: number;
    label: string;
    priceUsd: number; // ← цена в USD для CryptoBot
    payments: Payments[];
};
