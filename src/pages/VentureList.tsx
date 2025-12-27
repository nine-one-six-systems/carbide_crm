import { useState } from 'react';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';

import { useVentures } from '@/features/ventures/hooks/useVentures';
import { useCreateVenture } from '@/features/ventures/hooks/useCreateVenture';
import { VentureCard } from '@/features/ventures/components/VentureCard';
import { VentureForm } from '@/features/ventures/components/VentureForm';
import type { VentureFilters, VentureFormValues, VentureStatus } from '@/features/ventures/types/venture.types';

export function VentureList() {
  const [filters, setFilters] = useState<VentureFilters>({
    status: 'all',
    search: '',
  });
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: ventures, isLoading } = useVentures(filters);
  const createVenture = useCreateVenture();

  const handleCreateVenture = (values: VentureFormValues) => {
    createVenture.mutate(values, {
      onSuccess: () => {
        setShowCreateForm(false);
      },
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ventures</h1>
          <p className="text-muted-foreground">
            Manage the NineOneSix venture portfolio
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Venture
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search ventures..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            setFilters({ ...filters, status: value as VentureStatus | 'all' })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="incubating">Incubating</SelectItem>
            <SelectItem value="sunset">Sunset</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as 'cards' | 'table')}
        >
          <ToggleGroupItem value="cards" aria-label="Card view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ventures?.map((venture) => (
            <VentureCard key={venture.id} venture={venture} />
          ))}
          {ventures?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No ventures found. Create your first venture to get started.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          {/* Table view - simplified for now */}
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Relationships</th>
                <th className="p-3 text-left font-medium">Organizations</th>
                <th className="p-3 text-left font-medium">Team</th>
              </tr>
            </thead>
            <tbody>
              {ventures?.map((venture) => (
                <tr key={venture.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{venture.name}</td>
                  <td className="p-3">{venture.status}</td>
                  <td className="p-3">{venture.relationship_count}</td>
                  <td className="p-3">{venture.organization_count}</td>
                  <td className="p-3">{venture.team_member_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Form Modal */}
      <VentureForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateVenture}
        isLoading={createVenture.isPending}
      />
    </div>
  );
}

export default VentureList;

