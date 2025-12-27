import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Archive, MoreHorizontal, Trash2, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

import type { Venture } from '../types/venture.types';
import { VENTURE_STATUS_COLORS } from '../types/venture.types';
import { VentureForm } from './VentureForm';
import { useUpdateVenture } from '../hooks/useUpdateVenture';
import { useArchiveVenture } from '../hooks/useDeleteVenture';

interface VentureHeaderProps {
  venture: Venture;
}

export function VentureHeader({ venture }: VentureHeaderProps) {
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const updateVenture = useUpdateVenture(venture.slug);
  const archiveVenture = useArchiveVenture();

  const handleUpdate = (values: any) => {
    updateVenture.mutate(
      { id: venture.id, values },
      {
        onSuccess: (data) => {
          setShowEditForm(false);
          // If slug changed, navigate to new URL
          if (data.slug !== venture.slug) {
            navigate(`/ventures/${data.slug}`, { replace: true });
          }
        },
      }
    );
  };

  const handleArchive = () => {
    archiveVenture.mutate(venture.id, {
      onSuccess: () => {
        navigate('/ventures');
      },
    });
  };

  return (
    <>
      <div className="sticky top-0 z-10 border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/ventures')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3">
              {venture.logo_url ? (
                <img
                  src={venture.logo_url}
                  alt={`${venture.name} logo`}
                  className="h-12 w-12 rounded-lg object-contain"
                />
              ) : (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-white font-bold text-xl"
                  style={{ backgroundColor: venture.primary_color || '#6B7280' }}
                >
                  {venture.name.charAt(0)}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{venture.name}</h1>
                  <Badge
                    variant="outline"
                    className={cn(VENTURE_STATUS_COLORS[venture.status])}
                  >
                    {venture.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {venture.website && (
                    <a
                      href={venture.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:underline"
                    >
                      {venture.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {venture.website && venture.founded_date && <span>·</span>}
                  {venture.founded_date && (
                    <span>
                      Founded {new Date(venture.founded_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowEditForm(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Venture
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowArchiveDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <VentureForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        venture={venture}
        onSubmit={handleUpdate}
        isLoading={updateVenture.isPending}
      />

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {venture.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the venture from active lists and prevent new relationships from being
              tagged with it. Existing relationships will retain their tags.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

