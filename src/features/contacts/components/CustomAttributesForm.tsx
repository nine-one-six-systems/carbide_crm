import { useFormContext } from 'react-hook-form';

import { Calendar, Coffee, Globe, Mail, MapPin } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MARITAL_STATUS_OPTIONS = [
  'Single',
  'Married',
  'Divorced',
  'Widowed',
  'Partnered',
  'Other',
];

export function CustomAttributesForm() {
  const form = useFormContext();

  return (
    <Accordion type="multiple" className="w-full" defaultValue={[]}>
      {/* Key Info Section - Important CRM data */}
      <AccordionItem value="key-info">
        <AccordionTrigger className="text-sm">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Key Dates & Family Info
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="custom_attributes.personal.birthday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birthday</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.personal.anniversary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anniversary</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.personal.marital_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital Status</FormLabel>
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MARITAL_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.personal.dependents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dependents/Children</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 2 children"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Interests & Preferences Section */}
      <AccordionItem value="interests">
        <AccordionTrigger className="text-sm">
          <span className="flex items-center gap-2">
            <Coffee className="h-4 w-4 text-amber-600" />
            Interests & Favorites
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <p className="text-xs text-muted-foreground mb-4">
            Personal preferences to help build rapport and personalize
            interactions.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="custom_attributes.personal.coffee_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coffee/Drink Order</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Venti Oat Milk Latte"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.personal.favorite_restaurant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favorite Restaurant</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Uchi"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.personal.favorite_food"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favorite Cuisine/Food</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Italian, Sushi"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.personal.favorite_drink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favorite Beverage</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Bourbon, Red Wine"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.personal.hobbies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hobbies</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Golf, Reading, Photography"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.personal.leisure_activities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leisure Activities</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Travel, Hiking, Concerts"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="custom_attributes.personal.goals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personal Goals/Aspirations</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Retire early, Start a business"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Social Section */}
      <AccordionItem value="social">
        <AccordionTrigger className="text-sm">
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            Social & Web Profiles
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="custom_attributes.social.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.social.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter/X</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://twitter.com/..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.social.facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://facebook.com/..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.social.instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://instagram.com/..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.social.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.social.skype"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skype</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Skype username"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Communication Preferences Section */}
      <AccordionItem value="preferences">
        <AccordionTrigger className="text-sm">
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-green-500" />
            Communication Preferences
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="custom_attributes.preferences.email_opt_out"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Email Opt Out</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Contact has opted out of email communications
                  </p>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="custom_attributes.preferences.sms_opt_out"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>SMS Opt Out</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Contact has opted out of SMS/text communications
                  </p>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="custom_attributes.preferences.email_opt_out_reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opt Out Reason</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter reason for opt out"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Geolocation Section */}
      <AccordionItem value="geo">
        <AccordionTrigger className="text-sm">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-rose-500" />
            Geolocation (Advanced)
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <p className="text-xs text-muted-foreground">
            Geographic coordinates for mapping and territory management.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="custom_attributes.geo.lat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 30.2672"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === '' ? undefined : parseFloat(val));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_attributes.geo.lng"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="e.g., -97.7431"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === '' ? undefined : parseFloat(val));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
