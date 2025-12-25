import {
  Heart,
  Globe,
  Mail,
  MapPin,
  Calendar,
  Utensils,
  Coffee,
  User,
  ExternalLink,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CustomAttributes } from '@/types/database';

interface CustomAttributesCardProps {
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

function PersonalSection({ personal }: { personal: CustomAttributes['personal'] }) {
  if (!personal) return null;

  const hasContent = Object.values(personal).some(v => v !== undefined && v !== null && v !== '');
  if (!hasContent) return null;

  return (
    <div>
      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
        <Heart className="h-4 w-4 text-rose-500" />
        Personal Details
      </h4>
      <div className="space-y-1">
        <AttributeRow
          icon={<Calendar className="h-4 w-4" />}
          label="Birthday"
          value={personal.birthday ? new Date(personal.birthday).toLocaleDateString() : undefined}
        />
        <AttributeRow
          icon={<Calendar className="h-4 w-4" />}
          label="Anniversary"
          value={personal.anniversary ? new Date(personal.anniversary).toLocaleDateString() : undefined}
        />
        <AttributeRow
          icon={<User className="h-4 w-4" />}
          label="Marital Status"
          value={personal.marital_status}
        />
        <AttributeRow
          icon={<User className="h-4 w-4" />}
          label="Dependents"
          value={personal.dependents}
        />
        <AttributeRow
          icon={<Utensils className="h-4 w-4" />}
          label="Favorite Food"
          value={personal.favorite_food}
        />
        <AttributeRow
          icon={<Utensils className="h-4 w-4" />}
          label="Favorite Restaurant"
          value={personal.favorite_restaurant}
        />
        <AttributeRow
          icon={<Coffee className="h-4 w-4" />}
          label="Favorite Drink"
          value={personal.favorite_drink}
        />
        <AttributeRow
          icon={<Coffee className="h-4 w-4" />}
          label="Coffee Order"
          value={personal.coffee_order}
        />
        <AttributeRow label="Hobbies" value={personal.hobbies} />
        <AttributeRow label="Leisure Activities" value={personal.leisure_activities} />
        <AttributeRow label="Personal Goals" value={personal.goals} />
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
        Social & Web
      </h4>
      <div className="space-y-1">
        <AttributeRow label="LinkedIn" value={social.linkedin} isUrl />
        <AttributeRow label="Twitter/X" value={social.twitter} isUrl />
        <AttributeRow label="Facebook" value={social.facebook} isUrl />
        <AttributeRow label="Instagram" value={social.instagram} isUrl />
        <AttributeRow label="Personal Website" value={social.website} isUrl />
        <AttributeRow label="Skype" value={social.skype} />
      </div>
    </div>
  );
}

function PreferencesSection({ preferences }: { preferences: CustomAttributes['preferences'] }) {
  if (!preferences) return null;

  const hasContent = Object.values(preferences).some(v => v !== undefined && v !== null && v !== '');
  if (!hasContent) return null;

  return (
    <div>
      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
        <Mail className="h-4 w-4 text-amber-500" />
        Communication Preferences
      </h4>
      <div className="space-y-1">
        <AttributeRow label="Email Opt Out" value={preferences.email_opt_out} />
        <AttributeRow label="SMS Opt Out" value={preferences.sms_opt_out} />
        {preferences.email_opt_out && preferences.email_opt_out_reason && (
          <AttributeRow label="Opt Out Reason" value={preferences.email_opt_out_reason} />
        )}
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

export function CustomAttributesCard({
  customAttributes,
  showEmptySections = false,
}: CustomAttributesCardProps) {
  const { personal, social, preferences, geo } = customAttributes;

  // Check if there's any content to display
  const hasPersonal = personal && Object.values(personal).some(v => v !== undefined && v !== null && v !== '');
  const hasSocial = social && Object.values(social).some(v => v !== undefined && v !== null && v !== '');
  const hasPreferences = preferences && Object.values(preferences).some(v => v !== undefined && v !== null && v !== '');
  const hasGeo = geo && (geo.lat !== undefined || geo.lng !== undefined || geo.created_address);

  const hasAnyContent = hasPersonal || hasSocial || hasPreferences || hasGeo;

  if (!hasAnyContent && !showEmptySections) {
    return null;
  }

  const sections = [
    hasPersonal && <PersonalSection key="personal" personal={personal} />,
    hasSocial && <SocialSection key="social" social={social} />,
    hasPreferences && <PreferencesSection key="preferences" preferences={preferences} />,
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

