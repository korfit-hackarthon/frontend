import { useState, useMemo } from 'react';

interface UseVirtualScrollOptions {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollResult {
  virtualItems: any[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
}

export function useVirtualScroll({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualScrollOptions): VirtualScrollResult {
  const [scrollTop, _setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;

  const { startIndex, endIndex, virtualItems, offsetY } = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      items.length - 1,
      startIndex + visibleCount + overscan * 2
    );

    const virtualItems = items.slice(startIndex, endIndex + 1);
    const offsetY = startIndex * itemHeight;

    return {
      startIndex,
      endIndex,
      virtualItems,
      offsetY,
    };
  }, [items, itemHeight, scrollTop, visibleCount, overscan]);

  return {
    virtualItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
  };
}

export function createVirtualScrollHandler(
  setScrollTop: (scrollTop: number) => void
) {
  return (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };
}
