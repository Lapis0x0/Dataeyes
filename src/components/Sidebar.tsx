"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Settings, Trash2, MoreHorizontal, Layout as LayoutIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  name: string;
}

interface SidebarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onAddTab: () => void;
  onRemoveTab: (tabId: string) => void;
  onRenameTab: (tabId: string, newName: string) => void;
  onAddWidget: () => void;
  onResetDashboard: () => void;
}

export function Sidebar({
  tabs,
  activeTab,
  onTabChange,
  onAddTab,
  onRemoveTab,
  onRenameTab,
  onAddWidget,
  onResetDashboard,
}: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTab, setEditingTab] = useState<Tab | null>(null);
  const [newTabName, setNewTabName] = useState('');

  const openSettings = (tab: Tab) => {
    setEditingTab(tab);
    setNewTabName(tab.name);
    setIsSettingsOpen(true);
  };

  const handleSave = () => {
    if (editingTab && newTabName) {
      onRenameTab(editingTab.id, newTabName);
      setIsSettingsOpen(false);
      setEditingTab(null);
    }
  };

  const handleRemove = () => {
    if (editingTab) {
      onRemoveTab(editingTab.id);
      setIsSettingsOpen(false);
      setEditingTab(null);
    }
  };

  return (
    <>
      <div className="bg-[#161A1E] border-r border-[#22252A] flex flex-col h-full">
        <div className="p-4 flex items-center h-16 shrink-0">
          <h2 className="text-lg font-semibold text-[#EAECEF] truncate">Dashboards</h2>
        </div>
        <div className="flex-grow px-2 overflow-y-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn(
                'w-full justify-start mb-1 group h-10 px-3 text-[#707A8A] hover:bg-[rgba(234,236,239,0.04)] hover:text-[#EAECEF] rounded-lg',
                activeTab === tab.id && 'bg-[rgba(234,236,239,0.08)] text-[#EAECEF]'
              )}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="truncate flex-grow text-left font-medium">{tab.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 ml-auto opacity-0 group-hover:opacity-100 flex-shrink-0 hover:bg-[rgba(234,236,239,0.06)]"
                onClick={(e) => {
                  e.stopPropagation();
                  openSettings(tab);
                }}
              >
                <Settings size={16} />
              </Button>
            </Button>
          ))}
        </div>
        <div className="p-2 border-t border-[#22252A] shrink-0 flex items-center">
          <Button variant="ghost" className="flex-grow justify-start text-[#707A8A] hover:text-[#EAECEF] h-10 px-3" onClick={onAddTab}>
            <Plus size={16} className="mr-3" />
            <span className="font-medium">添加分区</span>
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-[#707A8A] hover:text-[#EAECEF]">
                <MoreHorizontal size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 bg-[#161A1E] border-[#22252A] text-white mb-2">
              <div className="grid gap-1">
                <Button variant="ghost" onClick={onAddWidget} className="justify-start hover:bg-[rgba(234,236,239,0.06)]">
                  <Plus className="mr-2 h-4 w-4" />
                  添加组件
                </Button>
                <Button variant="ghost" onClick={onResetDashboard} className="justify-start hover:bg-[rgba(234,236,239,0.06)]">
                  <LayoutIcon className="mr-2 h-4 w-4" />
                  重置当前分区
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>分区设置</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              placeholder="分区名称"
            />
          </div>
          <DialogFooter className="justify-between">
            <Button variant="destructive" onClick={handleRemove}>
              <Trash2 className="mr-2 h-4 w-4" /> 删除分区
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}