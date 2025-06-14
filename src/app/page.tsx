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

const breakpoints = { lg: 1200, md: 1000, sm: 760, xs: 480, xxs: 0 };
const cols = { lg: 60, md: 50, sm: 38, xs: 24, xxs: 16 };

const generateDefaultLayouts = (items: WidgetItem[]): Layouts => {
  const layouts: Layouts = {};
  const h = 20; // 400px height / 20px rowHeight

  for (const bp in breakpoints) {
    const key = bp as keyof typeof breakpoints;
    const bpCols = cols[key];
    layouts[key] = items.map((item, index) => {
      if (key === 'lg' || key === 'md' || key === 'sm') {
        // 2 columns layout
        return {
          i: item.i,
          x: (index % 2) * Math.floor(bpCols / 2),
          y: Math.floor(index / 2) * h,
          w: Math.floor(bpCols / 2),
          h: h,
        };
      } else {
        // 1 column layout
        return {
          i: item.i,
          x: 0,
          y: index * h,
          w: bpCols,
          h: h,
        };
      }
    });
  }
  return layouts;
};

export default function Home() {
  const items = initialItems;
  const [layouts, setLayouts] = useState<Layouts>(() => {
    const savedLayouts = getFromLS('layouts-v2');
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
    saveToLS('layouts-v2', allLayouts);
    setLayouts(allLayouts);
  };

  return (
    <div className="bg-gray-900 min-h-screen dot-grid">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={onLayoutChange}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={20}
        margin={[0, 0]}
        containerPadding={[20, 20]}
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






