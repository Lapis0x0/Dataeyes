'use client';

import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout, Layouts } from 'react-grid-layout';
import TradingViewWidget from '@/components/TradingViewWidget';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Menu, Plus, Layout as LayoutIcon, X } from 'lucide-react';

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

const saveToLS = (key: string, value: unknown) => {
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
        return {
          i: item.i,
          x: (index % 2) * Math.floor(bpCols / 2),
          y: Math.floor(index / 2) * h,
          w: Math.floor(bpCols / 2),
          h: h,
        };
      } else {
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
  const [items, setItems] = useState<WidgetItem[]>(initialItems);
  const [layouts, setLayouts] = useState<Layouts>(generateDefaultLayouts(initialItems));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedItems = getFromLS('items');
    const itemsToUse = savedItems || initialItems;
    setItems(itemsToUse);

    const savedLayouts = getFromLS('layouts-v2');
    if (savedLayouts) {
      const currentItemIds = new Set(itemsToUse.map((item: WidgetItem) => item.i));
      Object.keys(savedLayouts).forEach(breakpoint => {
        savedLayouts[breakpoint] = savedLayouts[breakpoint].filter((layout: Layout) => currentItemIds.has(layout.i));
      });
      setLayouts(savedLayouts);
    } else {
      setLayouts(generateDefaultLayouts(itemsToUse));
    }
    
    setIsMounted(true);
  }, []);

  const onLayoutChange = (layout: Layout[], allLayouts: Layouts) => {
    if (isMounted) {
      saveToLS('layouts-v2', allLayouts);
      setLayouts(allLayouts);
    }
  };

  const resetDashboard = () => {
    setItems(initialItems);
    saveToLS('items', initialItems);
    const defaultLayouts = generateDefaultLayouts(initialItems);
    setLayouts(defaultLayouts);
    saveToLS('layouts-v2', defaultLayouts);
  };

  const onAddWidget = () => {
    const defaultSymbol = 'BINANCE:BTCUSDT';
    const newItem: WidgetItem = {
      i: `new-${Date.now()}`,
      symbol: defaultSymbol,
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    saveToLS('items', newItems);
    const newLayouts = { ...layouts };
    for (const bp in breakpoints) {
      const key = bp as keyof typeof breakpoints;
      const bpCols = cols[key];
      const h = 20;
      const newLayoutItem = {
        i: newItem.i,
        x: (items.length % 2) * Math.floor(bpCols / 2),
        y: Infinity,
        w: Math.floor(bpCols / 2),
        h: h,
      };
      newLayouts[key] = [...(newLayouts[key] || []), newLayoutItem];
    }
    setLayouts(newLayouts);
    saveToLS('layouts-v2', newLayouts);
  };

  const onRemoveWidget = (widgetId: string) => {
    const newItems = items.filter((item) => item.i !== widgetId);
    setItems(newItems);
    saveToLS('items', newItems);
    const newLayouts = { ...layouts };
    for (const bp in newLayouts) {
      newLayouts[bp] = newLayouts[bp].filter((layout) => layout.i !== widgetId);
    }
    setLayouts(newLayouts);
    saveToLS('layouts-v2', newLayouts);
  };

  return (
    <div className="bg-gray-900 min-h-screen dot-grid p-4">
      <div className="fixed bottom-4 right-4 z-50">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="grid gap-4">
              <Button variant="ghost" onClick={onAddWidget}>
                <Plus className="mr-2 h-4 w-4" />
                Add Widget
              </Button>
              <Button variant="ghost" onClick={resetDashboard}>
                <LayoutIcon className="mr-2 h-4 w-4" />
                Reset Dashboard
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isMounted ? (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={onLayoutChange}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={20}
          margin={[10, 10]}
          containerPadding={[0, 0]}
          isDraggable
          isResizable
          draggableHandle=".drag-handle"
        >
          {items.map((item) => (
            <div
              key={item.i}
              className="bg-gray-800/50 rounded-lg overflow-hidden flex flex-col border-2 border-gray-700/50"
            >
              <div className="drag-handle p-2 cursor-move flex justify-end items-center border-b border-gray-700/50">
                <button
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onRemoveWidget(item.i);
                  }}
                  className="p-1 rounded-full text-gray-500 hover:text-white hover:bg-gray-700"
                  aria-label="Remove widget"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-grow h-full">
                <TradingViewWidget symbol={item.symbol} />
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      ) : null}
    </div>
  );
}
