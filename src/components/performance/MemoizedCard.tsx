import { memo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MemoizedCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const MemoizedCard = memo(function MemoizedCard({
  title,
  children,
  className,
}: MemoizedCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
});

