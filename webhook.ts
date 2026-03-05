// webhook.ts
import express from "express";
import { verifyWebhookSignature, CryptoBotWebhookUpdate } from "./cryptobot";

console.log(process.env.CRYPTOBOT_ENDPOINT);
console.log("CRYPTOBOT_ENDPOINT");

type GrantAccessFn = (
    userId: number,
    period: number,
    username?: string,
) => Promise<void>;

export function startWebhookServer(
    port: number,
    grantAccess: GrantAccessFn,
): void {
    const app = express();

    app.get("/", async (req, res) => {
        return res.redirect(process.env.BOT_LINK || "");
    });
    app.post(
        process.env.CRYPTOBOT_ENDPOINT || "/",
        express.raw({ type: "application/json" }),
        async (req, res) => {
            const signature = req.headers["crypto-pay-api-signature"] as string;
            const rawBody = req.body.toString("utf-8");
            // 1. Проверяем подпись
            if (!signature || !verifyWebhookSignature(rawBody, signature)) {
                console.warn("⚠️  CryptoBot webhook: неверная подпись");
                return res.status(401).send("Unauthorized");
            }

            let update: CryptoBotWebhookUpdate;
            try {
                update = JSON.parse(rawBody);
            } catch {
                return res.status(400).send("Bad JSON");
            }

            // 2. Нас интересует только оплата
            if (update.update_type !== "invoice_paid") {
                return res.status(200).send("OK");
            }

            const invoice = update.payload;

            // 3. Парсим наш payload
            let payloadData: {
                userId: number;
                days: number;
                username?: string;
            };
            try {
                payloadData = JSON.parse(invoice.payload ?? "{}");
            } catch {
                console.error("CryptoBot: не удалось распарсить payload");
                return res.status(200).send("OK");
            }

            if (invoice.status !== "paid") {
                console.warn(
                    `Unexpected status in invoice_paid: ${invoice.status}`,
                );
                return res.status(200).send("OK");
            }

            const { userId, days, username } = payloadData;
            if (!userId || !days) {
                console.error("CryptoBot: нет userId/days в payload");
                return res.status(200).send("OK");
            }

            invoice.invoice_id;

            console.log(
                `💎 CryptoBot оплата: userId=${userId}, days=${days}, invoice_id=${invoice.invoice_id}`,
            );

            // 4. Выдаём доступ
            try {
                await grantAccess(userId, Number(days) * 86400, username);
                console.log(`✅ Доступ выдан: userId=${userId}`);
            } catch (err) {
                console.error("grantAccess error:", err);
            }

            // CryptoBot ждёт 200, иначе будет повторять запрос
            res.status(200).send("OK");
        },
    );

    app.listen(port, () => {
        console.log(`🌐 Webhook сервер запущен на порту ${port}`);
    });
}
