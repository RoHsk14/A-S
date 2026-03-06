"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface ProductExportButtonProps {
    domain: string;
    productHandle: string;
}

export function ProductExportButton({ domain, productHandle }: ProductExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const generateShopifyCSV = (products: any[]) => {
        const headers = [
            "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
            "Option1 Name", "Option1 Value", "Variant Price", "Variant Compare At Price",
            "Variant Requires Shipping", "Variant Taxable", "Image Src", "Status"
        ];

        const rows: any[] = [];

        products.forEach(p => {
            const bodyHtml = p.body_html ? `"${p.body_html.replace(/"/g, '""')}"` : "";
            const tags = p.tags ? `"${p.tags.join(',')}"` : "";
            const price = p.variants && p.variants[0] ? p.variants[0].price : "";
            const compareAtPrice = p.variants && p.variants[0] ? p.variants[0].compare_at_price || "" : "";
            const firstImage = p.images && p.images[0] ? p.images[0].src : "";

            const vendor = p.vendor ? `"${p.vendor.replace(/"/g, '""')}"` : '"Afro Spy"';
            const productType = p.product_type ? `"${p.product_type.replace(/"/g, '""')}"` : "";
            const title = p.title ? `"${p.title.replace(/"/g, '""')}"` : "";

            rows.push([
                p.handle || "", title, bodyHtml, vendor, productType, tags,
                "TRUE", "Title", "Default Title", price, compareAtPrice,
                "TRUE", "FALSE", firstImage, "active"
            ]);

            if (p.images && p.images.length > 1) {
                p.images.slice(1).forEach((img: any) => {
                    const extraRow = Array(headers.length).fill("");
                    extraRow[0] = p.handle || "";
                    extraRow[13] = img.src || "";
                    rows.push(extraRow);
                });
            }
        });

        return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    };

    const handleExport = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to the product page since this is inside an <a> tag
        e.stopPropagation();

        if (!domain || domain === "Domaine inconnu" || !productHandle) return;

        setIsExporting(true);
        try {
            // Fetch exactly the single product JSON
            const response = await fetch(`https://${domain}/products/${productHandle}.json`);
            if (!response.ok) throw new Error("Failed to fetch specific product");

            const { product } = await response.json();
            if (!product) {
                throw new Error("Invalid product data");
            }

            const csvContent = generateShopifyCSV([product]);

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${productHandle}_export.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Selective Export failed:", error);
            alert("Erreur lors de l'exportation du produit.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            title="Exporter ce produit"
            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-800 p-2 rounded-xl shadow-sm hover:shadow-md hover:text-orange-600 transition-all z-20 disabled:opacity-50"
        >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        </button>
    );
}
