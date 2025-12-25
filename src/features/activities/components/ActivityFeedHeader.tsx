import { useState } from 'react';

import { AtSign } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { useActivityMutations } from '../hooks/useActivityMutations';

interface ActivityFeedHeaderProps {
  contactId: string;
}

export function ActivityFeedHeader({ contactId }: ActivityFeedHeaderProps) {
  const [noteText, setNoteText] = useState('');
  const { create, isCreating } = useActivityMutations();

  const handleCreateNote = async () => {
    if (!noteText.trim()) return;

    try {
      await create({
        type: 'note',
        contact_id: contactId,
        notes: noteText.trim(),
        occurred_at: new Date().toISOString(),
      });
      setNoteText('');
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCreateNote();
    }
  };

  return (
    <div className="p-4 border-b bg-white">
      <div className="relative">
        <Textarea
          placeholder="Add notes or type @name to notify"
          className="min-h-[80px] resize-none pr-24"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isCreating}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <AtSign className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={handleCreateNote}
            disabled={!noteText.trim() || isCreating}
          >
            Create Note
          </Button>
        </div>
      </div>
    </div>
  );
}

