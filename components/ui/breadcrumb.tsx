'use client';

import * as React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-2', className)}>
      <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Home">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.href && index < items.length - 1 ? (
            <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground text-sm font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export { Breadcrumb, type BreadcrumbItem };
