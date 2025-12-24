import { z } from 'zod';

export const taskFormSchema = z.object({
  contact_id: z.string().uuid().optional().nullable(),
  organization_id: z.string().uuid().optional().nullable(),
  relationship_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Task title is required').max(200),
  task_type: z
    .enum(['call', 'email', 'text', 'meeting', 'send_mailer', 'other'])
    .optional()
    .nullable(),
  due_date: z.string().refine(
    (date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    },
    { message: 'Please enter a valid date' }
  ),
  assigned_to: z.string().uuid().optional(),
  notes: z.string().max(5000).optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const taskUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'completed', 'triaged', 'dismissed']).optional(),
  completed_by: z.string().uuid().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export type TaskUpdateValues = z.infer<typeof taskUpdateSchema>;

export const taskSearchSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  status: z.array(z.enum(['pending', 'completed', 'triaged', 'dismissed'])).optional(),
  taskType: z
    .array(z.enum(['call', 'email', 'text', 'meeting', 'send_mailer', 'other']))
    .optional(),
  assignedTo: z.string().uuid().optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
  contactId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
});

export type TaskSearchParams = z.infer<typeof taskSearchSchema>;

