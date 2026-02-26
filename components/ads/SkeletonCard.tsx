export function SkeletonCard() {
    return (
        <div className="bg-charcoal rounded-2xl overflow-hidden border border-charcoal-border">
            {/* Video skeleton — 9:16 */}
            <div className="aspect-9-16 shimmer" />

            {/* Store info skeleton */}
            <div className="flex items-center gap-2.5 px-3 pt-3 pb-1">
                <div className="w-7 h-7 rounded-lg shimmer flex-shrink-0" />
                <div className="flex-1 h-4 rounded-md shimmer" />
                <div className="w-12 h-4 rounded-full shimmer" />
            </div>

            {/* Ad copy skeleton */}
            <div className="px-3 pb-2 space-y-1.5">
                <div className="h-3 rounded shimmer w-full" />
                <div className="h-3 rounded shimmer w-4/5" />
            </div>

            {/* Actions skeleton */}
            <div className="flex gap-2 px-3 pb-3">
                <div className="flex-1 h-8 rounded-xl shimmer" />
                <div className="w-16 h-8 rounded-xl shimmer" />
            </div>
        </div>
    );
}
