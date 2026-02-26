import { NextRequest } from "next/server";
import { runScraper } from "@/lib/apify-scraper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min max

export async function POST(req: NextRequest) {
    const { keyword, country, limit, platform } = await req.json();

    const encoder = new TextEncoder();

    // Create a readable SSE stream
    const stream = new ReadableStream({
        async start(controller) {
            const send = (data: object) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            send({ type: "start", message: `🚀 Lancement du scraping pour "${keyword}" (${country})...` });

            try {
                // Execute natively without spawning a separate Node process that Vercel blocks
                await runScraper(keyword, Number(limit), country, platform, (msg) => {
                    send({ type: "log", message: msg });
                });

                send({ type: "done", code: 0, message: "✅ Scraping terminé avec succès !" });
            } catch (err: any) {
                send({ type: "error", message: `❌ Erreur process : ${err.message}` });
            } finally {
                controller.close();
            }
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
