import {
  Globe,
  MapPin,
  Building2,
  Hash,
  Users,
  ExternalLink,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CustomAttributes } from '@/types/database';

interface OrgCustomAttributesCardProps {
  customAttributes: CustomAttributes;
  showEmptySections?: boolean;
}

interface AttributeRowProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number | boolean | undefined | null;
  isUrl?: boolean;
}

function AttributeRow({ icon, label, value, isUrl }: AttributeRowProps) {
  if (value === undefined || value === null || value === '') return null;

  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);

  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isUrl ? (
          <a
            href={displayValue}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {displayValue.replace(/^https?:\/\//, '').split('/')[0]}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="text-sm truncate">{displayValue}</p>
        )}
      </div>
    </div>
  );
}

function SocialSection({ social }: { social: CustomAttributes['social'] }) {
  if (!social) return null;

  const hasContent = Object.values(social).some(v => v !== undefined && v !== null && v !== '');
  if (!hasContent) return null;

  return (
    <div>
      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
        <Globe className="h-4 w-4 text-blue-500" />
        Social Media
      </h4>
      <div className="space-y-1">
        <AttributeRow label="LinkedIn" value={social.linkedin} isUrl />
        <AttributeRow label="Twitter/X" value={social.twitter} isUrl />
        <AttributeRow label="Facebook" value={social.facebook} isUrl />
        <AttributeRow label="Instagram" value={social.instagram} isUrl />
        <AttributeRow label="Skype" value={social.skype} />
      </div>
    </div>
  );
}

function OperationsSection({ operations }: { operations: CustomAttributes['operations'] }) {
  if (!operations) return null;

  const hasContent = Object.values(operations).some(v => v !== undefined && v !== null && v !== '');
  if (!hasContent) return null;

  return (
    <div>
      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
        <Building2 className="h-4 w-4 text-purple-500" />
        Operations
      </h4>
      <div className="space-y-1">
        <AttributeRow label="Vehicles" value={operations.vehicles} />
        <AttributeRow label="Number of Locations" value={operations.location_count} />
        <AttributeRow label="Time Zone" value={operations.timezone} />
      </div>
    </div>
  );
}

function IdentifiersSection({ identifiers }: { identifiers: CustomAttributes['identifiers'] }) {
  if (!identifiers) return null;

  const hasContent = Object.values(identifiers).some(v => v !== undefined && v !== null && v !== '');
  if (!hasContent) return null;

  return (
    <div>
      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
        <Hash className="h-4 w-4 text-amber-500" />
        Identifiers
      </h4>
      <div className="space-y-1">
        <AttributeRow label="Site Code" value={identifiers.site_code} />
      </div>
    </div>
  );
}

function ContactsSection({ contacts }: { contacts: CustomAttributes['contacts'] }) {
  if (!contacts) return null;

  const hasContent = Object.values(contacts).some(v => v !== undefined && v !== null && v !== '');
  if (!hasContent) return null;

  return (
    <div>
      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
        <Users className="h-4 w-4 text-rose-500" />
        Points of Contact
      </h4>
      <div className="space-y-1">
        <AttributeRow label="Admin POC" value={contacts.admin_poc} />
        <AttributeRow label="On-Site POC" value={contacts.onsite_poc} />
      </div>
    </div>
  );
}

function GeoSection({ geo }: { geo: CustomAttributes['geo'] }) {
  if (!geo) return null;

  const hasContent = geo.lat !== undefined || geo.lng !== undefined || geo.created_address;
  if (!hasContent) return null;

  return (
    <div>
      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-green-500" />
        Location
      </h4>
      <div className="space-y-1">
        {geo.lat !== undefined && geo.lng !== undefined && (
          <AttributeRow
            label="Coordinates"
            value={`${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}`}
          />
        )}
        <AttributeRow label="Created Address" value={geo.created_address} />
      </div>
    </div>
  );
}

export function OrgCustomAttributesCard({
  customAttributes,
  showEmptySections = false,
}: OrgCustomAttributesCardProps) {
  const { social, operations, identifiers, contacts, geo } = customAttributes;

  // Check if there's any content to display
  const hasSocial = social && Object.values(social).some(v => v !== undefined && v !== null && v !== '');
  const hasOperations = operations && Object.values(operations).some(v => v !== undefined && v !== null && v !== '');
  const hasIdentifiers = identifiers && Object.values(identifiers).some(v => v !== undefined && v !== null && v !== '');
  const hasContacts = contacts && Object.values(contacts).some(v => v !== undefined && v !== null && v !== '');
  const hasGeo = geo && (geo.lat !== undefined || geo.lng !== undefined || geo.created_address);

  const hasAnyContent = hasSocial || hasOperations || hasIdentifiers || hasContacts || hasGeo;

  if (!hasAnyContent && !showEmptySections) {
    return null;
  }

  const sections = [
    hasOperations && <OperationsSection key="operations" operations={operations} />,
    hasIdentifiers && <IdentifiersSection key="identifiers" identifiers={identifiers} />,
    hasContacts && <ContactsSection key="contacts" contacts={contacts} />,
    hasSocial && <SocialSection key="social" social={social} />,
    hasGeo && <GeoSection key="geo" geo={geo} />,
  ].filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section, index) => (
          <div key={index}>
            {section}
            {index < sections.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
        {!hasAnyContent && showEmptySections && (
          <p className="text-sm text-muted-foreground">No additional information available.</p>
        )}
      </CardContent>
    </Card>
  );
}

