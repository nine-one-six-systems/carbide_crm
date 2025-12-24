import { useState } from 'react';

import { PageContainer } from '@/components/layout/PageContainer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PipelineKanban } from '@/features/relationships/components/PipelineKanban';

const relationshipTypes = [
  { value: 'b2b_client', label: 'B2B Clients' },
  { value: 'b2c_client', label: 'B2C Clients' },
  { value: 'investor', label: 'Investors' },
  { value: 'meridian_44_participant', label: 'Meridian 44 Participants' },
];

const b2bStages = [
  { value: 'Lead', label: 'Lead' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Discovery', label: 'Discovery' },
  { value: 'Proposal', label: 'Proposal' },
  { value: 'Negotiation', label: 'Negotiation' },
  { value: 'Won', label: 'Won' },
  { value: 'Lost', label: 'Lost' },
  { value: 'Active', label: 'Active' },
  { value: 'Churned', label: 'Churned' },
];

const investorStages = [
  { value: 'Prospect', label: 'Prospect' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Interested', label: 'Interested' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Due Diligence', label: 'Due Diligence' },
  { value: 'Terms', label: 'Terms' },
  { value: 'Committed', label: 'Committed' },
  { value: 'Funded', label: 'Funded' },
  { value: 'Active', label: 'Active' },
  { value: 'Passed', label: 'Passed' },
];

const meridian44Stages = [
  { value: 'Identified', label: 'Identified' },
  { value: 'Outreach', label: 'Outreach' },
  { value: 'Interested', label: 'Interested' },
  { value: 'Onboarding', label: 'Onboarding' },
  { value: 'Active Contributor', label: 'Active Contributor' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Declined', label: 'Declined' },
];

function getStagesForType(type: string) {
  switch (type) {
    case 'b2b_client':
    case 'b2c_client':
      return b2bStages;
    case 'investor':
      return investorStages;
    case 'meridian_44_participant':
      return meridian44Stages;
    default:
      return b2bStages;
  }
}

export default function PipelinesPage() {
  const [selectedType, setSelectedType] = useState('b2b_client');
  const stages = getStagesForType(selectedType);

  return (
    <PageContainer
      title="Pipelines"
      description="Manage business relationships and track progress through stages"
      actions={
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select pipeline type" />
          </SelectTrigger>
          <SelectContent>
            {relationshipTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <PipelineKanban type={selectedType} stages={stages} />
    </PageContainer>
  );
}
