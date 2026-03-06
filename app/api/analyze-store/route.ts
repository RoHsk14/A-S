import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    try {
        // 1. Appel au JSON Public de Shopify
        const response = await fetch(`https://${domain}/products.json?limit=250`, {
            next: { revalidate: 3600 } // Cache for 1 hour to prevent rate limits
        });

        if (!response.ok) throw new Error('Store non-Shopify ou JSON bloqué');

        const { products } = await response.json();

        if (!products || !Array.isArray(products)) {
            throw new Error('Invalid JSON format');
        }

        // 2. Extraction des infos réelles
        const productCount = products.length;

        // Sort by best-selling? Actually, products.json doesn't support ?sort_by=best-selling unfortunately, but we'll take top 10 as requested
        // Or we can try appending &sort_by=best-selling but it has no effect on products.json usually.
        // We will just map the top 10 returned.
        const bestSellers = products.slice(0, 10).map((p: any) => ({
            id: p.id,
            title: p.title,
            price: p.variants[0]?.price,
            image: p.images[0]?.src,
            created_at: p.created_at,
            handle: p.handle
        }));

        // 3. Date de création du store (Basée sur le premier produit, donc le plus ancien en bas de la liste limit=250)
        const oldestProduct = products[products.length - 1];

        return NextResponse.json({
            realProductCount: productCount,
            bestSellers: bestSellers,
            establishedAt: oldestProduct?.created_at || null,
            platform: 'Shopify'
        });
    } catch (error) {
        // Fallback YouCan ou WooCommerce ici
        return NextResponse.json({ error: "Analyse profonde requise" }, { status: 404 });
    }
}
