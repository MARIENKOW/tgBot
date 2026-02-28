// cryptobot.ts
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config()

console.log('process.env.CRYPTOBOT_TESTNET');
console.log(process.env.CRYPTOBOT_TESTNET);
console.log('process.env.CRYPTOBOT_TESTNET');

const CRYPTOBOT_API =
    process.env.CRYPTOBOT_TESTNET === "true"
        ? "https://testnet-pay.crypt.bot/api"
        : "https://pay.crypt.bot/api";

const CRYPTOBOT_TOKEN = process.env.CRYPTOBOT_TOKEN as string;

// ─── Типы ─────────────────────────────────────────────────────────────────────

export interface CryptoBotInvoice {
    invoice_id: number;
    status: "active" | "paid" | "expired";
    hash: string;
    amount: string;
    pay_url: string;
    payload?: string; // JSON: { userId, days }
    paid_at?: string;
}

export interface CryptoBotWebhookUpdate {
    update_id: number;
    update_type: "invoice_paid";
    request_date: string;
    payload: CryptoBotInvoice;
}

interface ApiResponse<T> {
    ok: boolean;
    result: T;
    error?: { code: number; name: string };
}

// ─── Создать инвойс ───────────────────────────────────────────────────────────

export async function createInvoice(params: {
    userId: number;
    days: number;
    amountUsd: number;
    description?: string;
}): Promise<CryptoBotInvoice> {
    const payload = JSON.stringify({ userId: params.userId, days: params.days });

    const body = {
        currency_type: "fiat", // цена в USD, юзер платит любой криптой
        fiat: "USD",
        amount: String(params.amountUsd),
        description: params.description ?? `Доступ на ${params.days} дней`,
        payload,
        expires_in: 3600, // 1 час
    };

    const res = await fetch(`${CRYPTOBOT_API}/createInvoice`, {
        method: "POST",
        headers: {
            "Crypto-Pay-API-Token": CRYPTOBOT_TOKEN,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const json = (await res.json()) as ApiResponse<CryptoBotInvoice>;

    if (!json.ok) {
        throw new Error(`CryptoBot [${json.error?.code}]: ${json.error?.name}`);
    }

    return json.result;
}

// ─── Проверка подписи webhook ─────────────────────────────────────────────────

export function verifyWebhookSignature(
    rawBody: string,
    signature: string,
): boolean {
    const secret = crypto
        .createHash("sha256")
        .update(CRYPTOBOT_TOKEN)
        .digest();

    const hmac = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    return hmac === signature;
}