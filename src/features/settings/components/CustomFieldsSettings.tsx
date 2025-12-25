import { useState } from 'react';
import {
  Pencil,
  Trash2,
  User,
  Building2,
  Users,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CustomFieldDefinition } from '@/types/database';
import { useCustomFields, useCustomFieldMutations } from '../hooks/useCustomFields';
import { CustomFieldEditor } from './CustomFieldEditor';

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  boolean: 'Yes/No',
  select: 'Select',
  multiselect: 'Multi-Select',
  url: 'URL',
  email: 'Email',
};

const CATEGORY_LABELS: Record<string, string> = {
  personal: 'Personal',
  social: 'Social',
  preferences: 'Preferences',
  geo: 'Geolocation',
  operations: 'Operations',
  identifiers: 'Identifiers',
  contacts: 'Points of Contact',
  legacy: 'Legacy',
  custom: 'Custom',
};

interface CategoryGroupProps {
  category: string;
  fields: CustomFieldDefinition[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function CategoryGroup({ category, fields, onDelete, isDeleting }: CategoryGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="font-medium">
            {CATEGORY_LABELS[category] || category}
          </span>
          <Badge variant="secondary" className="ml-2">
            {fields.length}
          </Badge>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.label}</span>
                      {field.is_required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                      {field.show_on_card && (
                        <Badge variant="outline" className="text-xs">
                          Card
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {field.key}
                    </code>
                  </TableCell>
                  <TableCell>{FIELD_TYPE_LABELS[field.field_type]}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {(field.entity_type === 'contact' || field.entity_type === 'both') && (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                      {(field.entity_type === 'organization' || field.entity_type === 'both') && (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CustomFieldEditor
                        field={field}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Field</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the "{field.label}" field?
                              This action cannot be undone. Existing data using this field
                              will not be removed but will no longer be editable.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(field.id)}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export function CustomFieldsSettings() {
  const { data: fields, isLoading } = useCustomFields();
  const { delete: deleteField, isDeleting } = useCustomFieldMutations();

  // Group fields by category
  const fieldsByCategory = fields?.reduce(
    (acc, field) => {
      const category = field.category || 'custom';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(field);
      return acc;
    },
    {} as Record<string, CustomFieldDefinition[]>
  );

  // Sort categories
  const sortedCategories = Object.keys(fieldsByCategory || {}).sort((a, b) => {
    const order = ['personal', 'social', 'preferences', 'geo', 'operations', 'identifiers', 'contacts', 'legacy', 'custom'];
    return order.indexOf(a) - order.indexOf(b);
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteField(id);
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Custom Fields</CardTitle>
            <CardDescription>
              Manage custom fields for contacts and organizations
            </CardDescription>
          </div>
          <CustomFieldEditor />
        </div>
      </CardHeader>
      <CardContent>
        {sortedCategories.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No custom fields</h3>
            <p className="text-muted-foreground">
              Create custom fields to capture additional information about contacts and organizations.
            </p>
            <div className="mt-4">
              <CustomFieldEditor />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCategories.map((category) => (
              <CategoryGroup
                key={category}
                category={category}
                fields={fieldsByCategory![category]}
                onDelete={handleDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

