'use client';
import type {} from '@/types';
import React from 'react';
import { Loader2 } from 'lucide-react';
import { TypographyLarge } from '@/components/ui/typography';
export const WaitingForHost = () => {
  return (
    <div className='flex gap-5 items-center'>
      <TypographyLarge>Waiting for host to start the game...</TypographyLarge>
      <Loader2 className='animate-spin' size={24} />
    </div>
  );
};
