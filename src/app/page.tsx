'use client';

import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout, Layouts } from 'react-grid-layout';
import TradingViewWidget from '@/components/TradingViewWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetItem {
  i: string;
  symbol: string;
}

const initialItems: WidgetItem[] = [
  { i: 'ovx', symbol: 'FRED:OVXCLS' },
  { i: 'gvz', symbol: 'FRED:GVZCLS' },
  { i: 'vvix', symbol: 'TVC:VVIX' },
  { i: 'skew', symbol: 'NASDAQ:SDEX' },
];

const getFromLS = (key: string) => {
  if (typeof window !== 'undefined') {
    try {
      const ls = localStorage.getItem(`dataeyes-dashboard-${key}`);
      return ls ? JSON.parse(ls) : undefined;
    } catch (e) {
      console.error(`Failed to parse ${key} from LS`, e);
    }
  }
  return undefined;
};

const saveToLS = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`dataeyes-dashboard-${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save ${key} to LS`, e);
    }
  }
};

const generateDefaultLayouts = (items: { i: string }[]): Layouts => {
  const layouts: Layouts = {};
  layouts.lg = items.map((item, index) => ({
    i: item.i,
    x: (index % 2) * 6,
    y: Math.floor(index / 2) * 4,
    w: 6,
    h: 4,
  }));
  return layouts;
};

export default function Home() {
  const items = initialItems;
  const [layouts, setLayouts] = useState<Layouts>(() => {
    const savedLayouts = getFromLS('layouts');
    if (savedLayouts) {
      // Reconcile layouts with current items from code
      const currentItemIds = new Set(items.map((item) => item.i));
      Object.keys(savedLayouts).forEach(breakpoint => {
        savedLayouts[breakpoint] = savedLayouts[breakpoint].filter((layout: Layout) => currentItemIds.has(layout.i));
      });
      return savedLayouts;
    }
    return generateDefaultLayouts(items);
  });

  const onLayoutChange = (layout: Layout[], allLayouts: Layouts) => {
    saveToLS('layouts', allLayouts);
    setLayouts(allLayouts);
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={onLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable
        isResizable
        draggableHandle=".drag-handle"
      >
        {items.map((item) => (
          <div key={item.i} className="bg-gray-800/50 rounded-lg overflow-hidden flex flex-col border border-gray-700/50">
            <div className="drag-handle p-1 cursor-move flex justify-end items-center border-b border-gray-700/50" />
            <div className="flex-grow h-full">
              <TradingViewWidget symbol={item.symbol} />
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}






