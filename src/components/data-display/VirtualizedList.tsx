import { useRef, useCallback } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';

import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  itemClassName?: string;
  getItemKey?: (item: T, index: number) => string | number;
  emptyMessage?: string;
  gap?: number;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  estimateSize = 80,
  overscan = 5,
  className,
  itemClassName,
  getItemKey,
  emptyMessage = 'No items to display',
  gap = 8,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => estimateSize + gap, [estimateSize, gap]),
    overscan,
    getItemKey: getItemKey
      ? (index) => getItemKey(items[index], index)
      : undefined,
  });

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={cn('h-[600px] overflow-auto', className)}
      role="list"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              role="listitem"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size - gap}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className={itemClassName}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hook for virtualizing a list with dynamic heights
export function useVirtualizedList<T>(
  items: T[],
  options: {
    estimateSize?: number;
    overscan?: number;
    getItemKey?: (item: T, index: number) => string | number;
  } = {}
) {
  const { estimateSize = 80, overscan = 5, getItemKey } = options;
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey: getItemKey
      ? (index) => getItemKey(items[index], index)
      : undefined,
  });

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  };
}

// Simple virtualized table component
interface VirtualizedTableProps<T> {
  items: T[];
  columns: Array<{
    key: string;
    header: string;
    render: (item: T) => React.ReactNode;
    width?: string;
  }>;
  rowHeight?: number;
  headerHeight?: number;
  className?: string;
  getRowKey?: (item: T, index: number) => string | number;
}

export function VirtualizedTable<T>({
  items,
  columns,
  rowHeight = 48,
  headerHeight = 48,
  className,
  getRowKey,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
    getItemKey: getRowKey
      ? (index) => getRowKey(items[index], index)
      : undefined,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div
        className="flex bg-muted border-b sticky top-0 z-10"
        style={{ height: headerHeight }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className="flex items-center px-4 font-medium text-sm"
            style={{ width: column.width || `${100 / columns.length}%` }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Virtualized body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: 'calc(100% - 48px)', maxHeight: 500 }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                className="flex absolute left-0 w-full border-b hover:bg-muted/50"
                style={{
                  height: rowHeight,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className="flex items-center px-4 text-sm truncate"
                    style={{ width: column.width || `${100 / columns.length}%` }}
                  >
                    {column.render(item)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

