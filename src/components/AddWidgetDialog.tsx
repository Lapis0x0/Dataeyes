'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface AddWidgetDialogProps {
  onAdd: (symbol: string) => void;
}

export default function AddWidgetDialog({ onAdd }: AddWidgetDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [symbol, setSymbol] = useState('');

  const handleAdd = () => {
    if (symbol.trim()) {
      onAdd(symbol.trim());
      setSymbol('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new widget</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter symbol (e.g., BINANCE:BTCUSDT)"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleAdd}>Add Widget</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}