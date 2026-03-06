"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface ExportCsvButtonProps {
    domain: string;
}

export function ExportCsvButton({ domain }: ExportCsvButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const generateShopifyCSV = (products: any[]) => {
        const headers = [
            "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
            "Option1 Name", "Option1 Value", "Variant Price", "Variant Compare At Price",
            "Variant Requires Shipping", "Variant Taxable", "Image Src", "Status"
        ];

        const rows: any[] = [];

        products.forEach(p => {
            // Clean up fields to avoid breaking the CSV format
            const bodyHtml = p.body_html ? `"${p.body_html.replace(/"/g, '""')}"` : "";
            const tags = p.tags ? `"${p.tags.join(',')}"` : "";
            const price = p.variants && p.variants[0] ? p.variants[0].price : "";
            const compareAtPrice = p.variants && p.variants[0] ? p.variants[0].compare_at_price || "" : "";
            const firstImage = p.images && p.images[0] ? p.images[0].src : "";

            // Vendors and Product Types might contain commas
            const vendor = p.vendor ? `"${p.vendor.replace(/"/g, '""')}"` : '"Afro Spy"';
            const productType = p.product_type ? `"${p.product_type.replace(/"/g, '""')}"` : "";
            const title = p.title ? `"${p.title.replace(/"/g, '""')}"` : "";

            // Main row (Info + 1st Image)
            rows.push([
                p.handle || "",
                title,
                bodyHtml,
                vendor,
                productType,
                tags,
                "TRUE",
                "Title",
                "Default Title",
                price,
                compareAtPrice,
                "TRUE",
                "FALSE",
                firstImage,
                "active"
            ]);

            // Additional rows for other images
            if (p.images && p.images.length > 1) {
                p.images.slice(1).forEach((img: any) => {
                    const extraRow = Array(headers.length).fill("");
                    extraRow[0] = p.handle || ""; // Identical Handle
                    extraRow[13] = img.src || ""; // Image Src
                    rows.push(extraRow);
                });
            }
        });

        return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    };

    const handleExport = async () => {
        if (!domain || domain === "Domaine inconnu") return;

        setIsExporting(true);
        try {
            // Fetch the maximum allowed products (250 is the max limit for products.json)
            const response = await fetch(`https://${domain}/products.json?limit=250`);
            if (!response.ok) throw new Error("Failed to fetch products");

            const { products } = await response.json();
            if (!products || !Array.isArray(products)) {
                throw new Error("Invalid products data");
            }

            const csvContent = generateShopifyCSV(products);

            // Export logic (Blob creation & anchor click)
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `export_${domain}_products.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Export failed:", error);
            alert("Erreur lors de l'exportation des produits.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors px-4 py-2 rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
        >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? "Génération CSV..." : "Exporter CSV"}
        </button>
    );
}
