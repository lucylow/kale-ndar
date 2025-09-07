import React from 'react';
import { Button } from '@/components/ui/button';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <Button
      asChild
      variant="outline"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-background border-2 border-primary"
    >
      <a href={href}>
        {children}
      </a>
    </Button>
  );
};

export default SkipLink;