import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { VentureSelect } from '@/features/ventures/components/VentureSelect';
import { projectFormSchema, type ProjectFormValues } from '@/lib/validators/project';
import { restClient } from '@/lib/supabase/restClient';
import type { Profile } from '@/types/database';
import {
  PROJECT_CATEGORY_LABELS,
  PROJECT_SCOPE_LABELS,
  type Project,
} from '../types/project.types';

import { useProjectMutations } from '../hooks/useProjectMutations';

interface ProjectFormProps {
  project?: Project;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const { create, update, isCreating, isUpdating } = useProjectMutations();

  // Fetch users for owner select
  const { data: users } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await restClient.query<Profile>('profiles', {
        filters: [{ column: 'is_active', operator: 'eq', value: true }],
        order: { column: 'full_name', ascending: true },
      });
      if (error) throw error;
      return (data || []) as Profile[];
    },
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description || '',
          scope: project.scope,
          category: project.category,
          status: project.status,
          health: project.health,
          ventures: project.ventures,
          ownerId: project.ownerId,
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
          targetDate: project.targetDate ? new Date(project.targetDate).toISOString().split('T')[0] : '',
          completedDate: project.completedDate
            ? new Date(project.completedDate).toISOString().split('T')[0]
            : '',
          githubProjectUrl: project.githubProjectUrl || '',
        }
      : {
          name: '',
          description: '',
          scope: 'internal',
          category: 'product_development',
          status: 'draft',
          health: 'not_started',
          ventures: [],
          ownerId: '',
          startDate: '',
          targetDate: '',
          completedDate: '',
          githubProjectUrl: '',
        },
  });

  const onSubmit = (values: ProjectFormValues) => {
    const callbacks = {
      onSuccess: () => {
        onSuccess?.();
      },
    };

    if (project) {
      update(project.id, values, callbacks);
    } else {
      create(values, callbacks);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ValidatedInput name="name" label="Project Name" />

        <ValidatedTextarea name="description" label="Description" rows={4} />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scope</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {Object.entries(PROJECT_SCOPE_LABELS).map(([value, label]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value === value}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange(value);
                            }
                          }}
                        />
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <ValidatedSelect
            name="category"
            label="Category"
            placeholder="Select category"
            options={Object.entries(PROJECT_CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </div>

        <FormField
          control={form.control}
          name="ventures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ventures *</FormLabel>
              <FormDescription>
                Select one or more ventures associated with this project
              </FormDescription>
              <FormControl>
                <VentureSelect
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ValidatedSelect
          name="ownerId"
          label="Owner"
          placeholder="Select owner"
          options={
            users?.map((user) => ({
              value: user.id,
              label: user.full_name,
            })) || []
          }
        />

        <div className="grid gap-4 md:grid-cols-2">
          <ValidatedInput name="startDate" label="Start Date" type="date" />
          <ValidatedInput name="targetDate" label="Target Date" type="date" />
        </div>

        <ValidatedInput name="githubProjectUrl" label="GitHub Project URL" type="url" />

        <Separator />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating
              ? 'Saving...'
              : project
                ? 'Update Project'
                : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

