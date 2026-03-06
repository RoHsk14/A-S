"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ProductExportButton } from "./ProductExportButton";

interface Product {
    id: number | string;
    title: string;
    price: string;
    image: string;
    created_at: string;
    handle: string;
}

interface PaginatedProductGridProps {
    products: Product[];
    domain: string;
}

export function PaginatedProductGrid({ products, domain }: PaginatedProductGridProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 4; // 4 items per page on desktop
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const isNewProduct = (dateString: string) => {
        if (!dateString) return false;
        const diff = Date.now() - new Date(dateString).getTime();
        return diff < 7 * 24 * 60 * 60 * 1000;
    };

    const formatPrice = (price: string) => {
        if (price === "N/A") return price;
        return `${price}`;
    };

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 text-sm">
                Aucun produit trouvé.
            </div>
        );
    }

    const currentProducts = products.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                {currentProducts.map((p) => (
                    <a key={p.id} href={`https://${domain}/products/${p.handle}`} target="_blank" rel="noopener noreferrer" className="group cursor-pointer block relative">
                        <div className="aspect-[4/5] bg-slate-100 rounded-2xl mb-3 overflow-hidden border border-slate-200 relative">
                            <ProductExportButton domain={domain} productHandle={p.handle} />
                            <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                            {isNewProduct(p.created_at) && (
                                <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 z-10">
                                    <Sparkles className="w-3 h-3" /> NEW TEST
                                </div>
                            )}
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight mb-1 group-hover:text-orange-600 transition-colors">{p.title}</h3>
                        <div className="text-sm font-black text-slate-500">{formatPrice(p.price)}</div>
                    </a>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-100">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 0}
                        className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="text-sm font-semibold text-slate-500">
                        {currentPage + 1} / {totalPages}
                    </span>

                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages - 1}
                        className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
