import { Context, SessionFlavor } from "grammy";

export interface SessionData {
    // Добавь свои данные сессии сюда (пока пусто)
}

export type BotContext = Context & SessionFlavor<SessionData>;
