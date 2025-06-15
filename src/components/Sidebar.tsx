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
import { Plus, Settings, Trash2 } from 'lucide-react';
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
}

export function Sidebar({
  tabs,
  activeTab,
  onTabChange,
  onAddTab,
  onRemoveTab,
  onRenameTab,
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
      <div className="bg-gray-900/70 backdrop-blur-sm border-r border-gray-700/50 flex flex-col h-full">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">分区</h2>
        </div>
        <div className="flex-grow p-2 overflow-y-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'secondary' : 'ghost'}
              className="w-full justify-start mb-2 group"
              onClick={() => onTabChange(tab.id)}
            >
              <span className="truncate flex-grow text-left">{tab.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  openSettings(tab);
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-700/50">
          <Button variant="outline" className="w-full" onClick={onAddTab}>
            <Plus className="h-4 w-4 mr-2" />
            添加分区
          </Button>
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