import { Mail, Phone, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Contact } from '@/types/database';

interface ContactCardProps {
  contact: Contact;
  className?: string;
}

export function ContactCard({ contact, className }: ContactCardProps) {
  const fullName = `${contact.first_name} ${contact.last_name}`;
  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase();

  const primaryEmail = contact.emails?.find((e) => e.is_primary)?.value;
  const primaryPhone = contact.phones?.find((p) => p.is_primary)?.value;

  return (
    <Link to={`/contacts/${contact.id}`} className={cn('block', className)}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={contact.avatar_url || undefined} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{fullName}</h3>
              {contact.job_title && (
                <p className="text-sm text-muted-foreground truncate">{contact.job_title}</p>
              )}
              <div className="mt-2 space-y-1">
                {primaryEmail && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{primaryEmail}</span>
                  </div>
                )}
                {primaryPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span className="truncate">{primaryPhone}</span>
                  </div>
                )}
              </div>
              {contact.tags && contact.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {contact.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {contact.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{contact.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

