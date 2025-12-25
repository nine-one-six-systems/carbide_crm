import { useState } from 'react';
import { Plus, X, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CustomAttributeFilter } from '@/types/api';
import { useCustomFields } from '@/features/settings/hooks/useCustomFields';

interface CustomAttributeFiltersProps {
  filters: CustomAttributeFilter[];
  onFiltersChange: (filters: CustomAttributeFilter[]) => void;
  entityType?: 'contact' | 'organization';
}

const OPERATOR_OPTIONS = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'gt', label: 'Greater than' },
  { value: 'lt', label: 'Less than' },
  { value: 'gte', label: 'Greater or equal' },
  { value: 'lte', label: 'Less or equal' },
];

export function CustomAttributeFilters({
  filters,
  onFiltersChange,
  entityType = 'contact',
}: CustomAttributeFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newFilter, setNewFilter] = useState<Partial<CustomAttributeFilter>>({
    operator: 'contains',
  });

  const { data: fieldDefinitions } = useCustomFields(entityType);

  // Group fields by category
  const fieldsByCategory = fieldDefinitions?.reduce(
    (acc, field) => {
      const category = field.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(field);
      return acc;
    },
    {} as Record<string, typeof fieldDefinitions>
  );

  const handleAddFilter = () => {
    if (newFilter.category && newFilter.key && newFilter.value) {
      onFiltersChange([
        ...filters,
        {
          category: newFilter.category,
          key: newFilter.key,
          value: newFilter.value,
          operator: newFilter.operator as CustomAttributeFilter['operator'],
        },
      ]);
      setNewFilter({ operator: 'contains' });
      setIsOpen(false);
    }
  };

  const handleRemoveFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  const handleFieldSelect = (fieldKey: string) => {
    // Find the field definition to get its category
    for (const [category, fields] of Object.entries(fieldsByCategory || {})) {
      const field = fields?.find((f) => f.key === fieldKey);
      if (field) {
        setNewFilter({
          ...newFilter,
          category,
          key: fieldKey,
        });
        break;
      }
    }
  };

  const getFilterLabel = (filter: CustomAttributeFilter): string => {
    const field = fieldDefinitions?.find(
      (f) => f.key === filter.key && f.category === filter.category
    );
    return field?.label || filter.key;
  };

  const getOperatorLabel = (operator?: string): string => {
    return OPERATOR_OPTIONS.find((o) => o.value === operator)?.label || 'Contains';
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter, index) => (
          <Badge key={index} variant="secondary" className="gap-1 pr-1">
            <span className="text-xs text-muted-foreground">
              {getFilterLabel(filter)}
            </span>
            <span className="text-xs">{getOperatorLabel(filter.operator)}</span>
            <span className="font-medium">{filter.value}</span>
            <button
              type="button"
              onClick={() => handleRemoveFilter(index)}
              className="ml-1 rounded-full p-0.5 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-3 w-3" />
              <Plus className="h-3 w-3" />
              Add Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Add Custom Attribute Filter</h4>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Field</label>
                <Select
                  value={newFilter.key}
                  onValueChange={handleFieldSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(fieldsByCategory || {}).map(
                      ([category, fields]) => (
                        <div key={category}>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                            {category}
                          </div>
                          {fields?.map((field) => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </div>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Operator</label>
                <Select
                  value={newFilter.operator}
                  onValueChange={(value) =>
                    setNewFilter({
                      ...newFilter,
                      operator: value as CustomAttributeFilter['operator'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATOR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Value</label>
                <Input
                  placeholder="Enter value"
                  value={newFilter.value || ''}
                  onChange={(e) =>
                    setNewFilter({ ...newFilter, value: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFilter();
                    }
                  }}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddFilter}
                  disabled={!newFilter.category || !newFilter.key || !newFilter.value}
                >
                  Add Filter
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

