import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min max

export async function POST(req: NextRequest) {
    const { keyword, country, limit, platform } = await req.json();

    const encoder = new TextEncoder();

    // Create a readable SSE stream
    const stream = new ReadableStream({
        start(controller) {
            const send = (data: object) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            send({ type: "start", message: `🚀 Lancement du scraping pour "${keyword}" (${country})...` });

            const scraperPath = path.join(process.cwd(), "scraper.js");
            const child = spawn("node", [scraperPath, keyword, String(limit), country], {
                env: { ...process.env, PLATFORM_OVERRIDE: platform || "facebook" },
            });

            child.stdout.on("data", (data: Buffer) => {
                const lines = data.toString().split("\n").filter((l: string) => l.trim());
                for (const line of lines) {
                    send({ type: "log", message: line });
                }
            });

            child.stderr.on("data", (data: Buffer) => {
                const lines = data.toString().split("\n").filter((l: string) => l.trim());
                for (const line of lines) {
                    // Filter noisy Playwright messages
                    if (line.includes("DeprecationWarning") || line.includes("ExperimentalWarning")) continue;
                    send({ type: "warn", message: line });
                }
            });

            child.on("close", (code: number) => {
                send({ type: "done", code, message: code === 0 ? "✅ Scraping terminé avec succès !" : `❌ Erreur (code ${code})` });
                controller.close();
            });

            child.on("error", (err: Error) => {
                send({ type: "error", message: `❌ Erreur process : ${err.message}` });
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
