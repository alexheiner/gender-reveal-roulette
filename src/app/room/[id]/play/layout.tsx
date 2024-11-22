import { TypographyH1 } from '@/components/ui/typography';
import React, { type PropsWithChildren } from 'react';

const RoomPlayLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className='min-h-screen p-4'>
      <TypographyH1>Room</TypographyH1>
      <main>{children}</main>
    </div>
  );
};

export default RoomPlayLayout;
