"use client";

import { TodoFilters, Priority, Status } from "@/types/todo";

interface FilterBarProps {
  filters: TodoFilters;
  onFilterChange: (filters: TodoFilters) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div>
        <label
          htmlFor="status-filter"
          className="block text-xs font-medium text-gray-500 mb-1"
        >
          Status
        </label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              status: e.target.value as Status | "all",
            })
          }
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="priority-filter"
          className="block text-xs font-medium text-gray-500 mb-1"
        >
          Priority
        </label>
        <select
          id="priority-filter"
          value={filters.priority}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              priority: e.target.value as Priority | "all",
            })
          }
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );
}
