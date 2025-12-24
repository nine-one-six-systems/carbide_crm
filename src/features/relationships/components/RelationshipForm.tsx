import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useContacts } from '@/features/contacts/hooks/useContacts';
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations';
import {
  businessRelationshipFormSchema,
  businessRelationshipTypes,
  ventures,
  type BusinessRelationshipFormValues,
} from '@/lib/validators/relationship';

interface RelationshipFormProps {
  defaultValues?: Partial<BusinessRelationshipFormValues>;
  onSubmit: (data: BusinessRelationshipFormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const typeLabels: Record<string, string> = {
  b2b_client: 'B2B Client',
  b2c_client: 'B2C Client',
  non_business_investment: 'Non-Business Investment',
  business_investment_external: 'External Business Investment',
  internal_business_opportunity: 'Internal Business Opportunity',
  portfolio_company: 'Portfolio Company',
  partnership_opportunity: 'Partnership Opportunity',
  individual_partnership: 'Individual Partnership',
  investor: 'Investor',
  meridian_44_participant: 'Meridian 44 Participant',
};

const ventureLabels: Record<string, string> = {
  forge: 'Forge',
  hearth: 'Hearth',
  anvil: 'Anvil',
  crucible: 'Crucible',
  foundry: 'Foundry',
  carbide: 'Carbide',
  lucepta: 'Lucepta',
  meridian_44: 'Meridian 44',
  trade_stone_group: 'Trade Stone Group',
};

const stageOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
];

export function RelationshipForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: RelationshipFormProps) {
  const { user } = useAuth();
  const { data: contactsData } = useContacts({ pageSize: 100 });
  const { data: organizationsData } = useOrganizations({ pageSize: 100 });

  const form = useForm<BusinessRelationshipFormValues>({
    resolver: zodResolver(businessRelationshipFormSchema),
    defaultValues: {
      type: defaultValues?.type,
      contact_id: defaultValues?.contact_id || null,
      organization_id: defaultValues?.organization_id || null,
      stage: defaultValues?.stage || 'lead',
      ventures: defaultValues?.ventures || [],
      owner_id: defaultValues?.owner_id || user?.id || '',
      attributes: defaultValues?.attributes || {},
    },
  });

  const selectedType = form.watch('type');
  const selectedVentures = form.watch('ventures') || [];

  const handleVentureToggle = (venture: string, checked: boolean) => {
    const current = form.getValues('ventures') || [];
    if (checked) {
      form.setValue('ventures', [...current, venture as typeof ventures[number]]);
    } else {
      form.setValue('ventures', current.filter((v) => v !== venture));
    }
  };

  // Determine which type-specific fields to show
  const isClient = selectedType === 'b2b_client' || selectedType === 'b2c_client';
  const isInvestment = selectedType?.includes('investment') || selectedType === 'portfolio_company';
  const isPartnership = selectedType?.includes('partnership');

  const contacts = contactsData?.data || [];
  const organizations = organizationsData?.data || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ValidatedSelect
              name="type"
              label="Relationship Type"
              options={businessRelationshipTypes.map((type) => ({
                value: type,
                label: typeLabels[type] || type,
              }))}
              placeholder="Select relationship type"
            />

            <div className="grid grid-cols-2 gap-4">
              <ValidatedSelect
                name="contact_id"
                label="Contact (optional)"
                options={[
                  { value: '', label: 'None' },
                  ...contacts.map((c) => ({
                    value: c.id,
                    label: `${c.first_name} ${c.last_name}`,
                  })),
                ]}
                placeholder="Select contact"
              />

              <ValidatedSelect
                name="organization_id"
                label="Organization (optional)"
                options={[
                  { value: '', label: 'None' },
                  ...organizations.map((o) => ({
                    value: o.id,
                    label: o.name,
                  })),
                ]}
                placeholder="Select organization"
              />
            </div>

            <ValidatedSelect
              name="stage"
              label="Pipeline Stage"
              options={stageOptions}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {ventures.map((venture) => (
                <Label
                  key={venture}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded border hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedVentures.includes(venture)}
                    onCheckedChange={(checked) =>
                      handleVentureToggle(venture, checked as boolean)
                    }
                  />
                  <span className="text-sm">{ventureLabels[venture]}</span>
                </Label>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedType && (
          <Card>
            <CardHeader>
              <CardTitle>
                {typeLabels[selectedType] || selectedType} Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isClient && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <ValidatedInput
                      name="attributes.contract_value"
                      label="Contract Value ($)"
                      type="number"
                      placeholder="0.00"
                    />
                    <ValidatedInput
                      name="attributes.estimated_value"
                      label="Estimated Value ($)"
                      type="number"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <ValidatedInput
                      name="attributes.contract_start_date"
                      label="Contract Start Date"
                      type="date"
                    />
                    <ValidatedInput
                      name="attributes.contract_end_date"
                      label="Contract End Date"
                      type="date"
                    />
                  </div>
                </>
              )}

              {isInvestment && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <ValidatedInput
                      name="attributes.investment_amount"
                      label="Investment Amount ($)"
                      type="number"
                      placeholder="0.00"
                    />
                    <ValidatedInput
                      name="attributes.equity_percentage"
                      label="Equity Percentage (%)"
                      type="number"
                      placeholder="0"
                    />
                  </div>
                  <ValidatedInput
                    name="attributes.investment_date"
                    label="Investment Date"
                    type="date"
                  />
                </>
              )}

              {isPartnership && (
                <>
                  <ValidatedInput
                    name="attributes.partnership_type"
                    label="Partnership Type"
                    placeholder="e.g., Revenue Share, Joint Venture"
                  />
                  <ValidatedInput
                    name="attributes.revenue_share"
                    label="Revenue Share (%)"
                    type="number"
                    placeholder="0"
                  />
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <ValidatedSelect
                  name="attributes.priority"
                  label="Priority"
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                  placeholder="Select priority"
                />
                <ValidatedInput
                  name="attributes.expected_close_date"
                  label="Expected Close Date"
                  type="date"
                />
              </div>

              <ValidatedTextarea
                name="attributes.notes"
                label="Notes"
                placeholder="Additional notes about this relationship..."
                rows={4}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Relationship'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

