'use client';

import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout, Layouts } from 'react-grid-layout';
import TradingViewWidget from '@/components/TradingViewWidget';
import { X } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import type { Tab as SidebarTab } from '@/components/Sidebar';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetItem {
  i: string;
  symbol: string;
}

interface Tab extends SidebarTab {
  items: WidgetItem[];
  layouts: Layouts;
}

const initialTabs: Tab[] = [
  {
    id: 'crypto',
    name: '加密货币',
    items: [
      { i: 'btc', symbol: 'BINANCE:BTCUSDT' },
      { i: 'eth', symbol: 'BINANCE:ETHUSDT' },
      { i: 'sol', symbol: 'BINANCE:SOLUSDT' },
    ],
    layouts: {},
  },
  {
    id: 'stocks',
    name: '股票',
    items: [
      { i: 'aapl', symbol: 'NASDAQ:AAPL' },
      { i: 'tsla', symbol: 'NASDAQ:TSLA' },
    ],
    layouts: {},
  },
  {
    id: 'forex',
    name: '外汇',
    items: [
      { i: 'eurusd', symbol: 'FX:EURUSD' },
    ],
    layouts: {},
  },
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

const DashboardGrid = ({
  tab,
  onUpdate,
}: {
  tab: Tab;
  onUpdate: (updatedTab: Tab) => void;
}) => {
  const onLayoutChange = (_: Layout[], allLayouts: Layouts) => {
    onUpdate({ ...tab, layouts: allLayouts });
  };

  const onRemoveWidget = (widgetId: string) => {
    const newItems = tab.items.filter((item) => item.i !== widgetId);
    const newLayouts = { ...tab.layouts };
    for (const bp in newLayouts) {
      newLayouts[bp] = newLayouts[bp].filter(
        (layout) => layout.i !== widgetId
      );
    }
    onUpdate({ ...tab, items: newItems, layouts: newLayouts });
  };

  return (
    <ResponsiveGridLayout
      className="layout h-full dot-grid p-4"
      layouts={tab.layouts}
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
      {tab.items.map((item) => (
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
  );
};

export default function Home() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedTabs = getFromLS('tabs');
    if (savedTabs && savedTabs.length > 0) {
      setTabs(savedTabs);
      setActiveTab(savedTabs[0].id);
    } else {
      const tabsWithLayouts = initialTabs.map(tab => ({
        ...tab,
        layouts: generateDefaultLayouts(tab.items),
      }));
      setTabs(tabsWithLayouts);
      setActiveTab(tabsWithLayouts[0].id);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      saveToLS('tabs', tabs);
    }
  }, [tabs, isMounted]);

  const handleTabUpdate = (updatedTab: Tab) => {
    setTabs(tabs.map((t) => (t.id === updatedTab.id ? updatedTab : t)));
  };

  const onAddWidget = () => {
    const defaultSymbol = 'BINANCE:BTCUSDT';
    const newItem: WidgetItem = {
      i: `new-${Date.now()}`,
      symbol: defaultSymbol,
    };
    const activeTabIndex = tabs.findIndex(t => t.id === activeTab);
    if (activeTabIndex === -1) return;

    const newTabs = [...tabs];
    const currentTab = newTabs[activeTabIndex];
    const newItems = [...currentTab.items, newItem];
    
    const newLayouts = { ...currentTab.layouts };
    for (const bp in breakpoints) {
      const key = bp as keyof typeof breakpoints;
      const bpCols = cols[key];
      const h = 20;
      const newLayoutItem = {
        i: newItem.i,
        x: (currentTab.items.length % 2) * Math.floor(bpCols / 2),
        y: Infinity,
        w: Math.floor(bpCols / 2),
        h: h,
      };
      newLayouts[key] = [...(newLayouts[key] || []), newLayoutItem];
    }
    
    newTabs[activeTabIndex] = { ...currentTab, items: newItems, layouts: newLayouts };
    setTabs(newTabs);
  };

  const resetDashboard = () => {
    const activeTabIndex = tabs.findIndex(t => t.id === activeTab);
    if (activeTabIndex === -1) return;

    const newTabs = [...tabs];
    const currentTab = newTabs[activeTabIndex];
    const initialTab = initialTabs.find(t => t.id === currentTab.id) || initialTabs[0];
    
    newTabs[activeTabIndex] = {
      ...currentTab,
      items: initialTab.items,
      layouts: generateDefaultLayouts(initialTab.items),
    };
    setTabs(newTabs);
  };

  const onAddTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      name: `新分区 ${tabs.length + 1}`,
      items: [],
      layouts: generateDefaultLayouts([]),
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
  };

  const onRemoveTab = (tabId: string) => {
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    } else if (newTabs.length === 0) {
      setActiveTab('');
    }
  };

  const onRenameTab = (tabId: string, newName: string) => {
    setTabs(tabs.map(t => t.id === tabId ? { ...t, name: newName } : t));
  };

  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <div className="bg-[#161A1E] h-screen flex flex-col">
      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel defaultSize={20} minSize={5} maxSize={30} collapsible>
          <Sidebar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddTab={onAddTab}
            onRemoveTab={onRemoveTab}
            onRenameTab={onRenameTab}
            onAddWidget={onAddWidget}
            onResetDashboard={resetDashboard}
          />
        </Panel>
        <PanelResizeHandle className="w-px bg-[#22252A] hover:bg-[#F0B90B] transition-colors" />
        <Panel>
          <main className="h-full overflow-y-auto dot-grid p-4">
            {isMounted && currentTab && (
              <DashboardGrid tab={currentTab} onUpdate={handleTabUpdate} />
            )}
          </main>
        </Panel>
      </PanelGroup>
    </div>
  );
}
