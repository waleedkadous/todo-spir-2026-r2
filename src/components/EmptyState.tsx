"use client";

export function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-4">
        {hasFilters ? "🔍" : "📝"}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        {hasFilters ? "No matching todos" : "No todos yet"}
      </h3>
      <p className="text-sm text-gray-500">
        {hasFilters
          ? "Try adjusting your filters to see more results."
          : "Create your first todo to get started."}
      </p>
    </div>
  );
}
