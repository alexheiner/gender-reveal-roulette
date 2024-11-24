import { TypographyH2 } from '@/components/ui/typography';
import React, { type PropsWithChildren } from 'react';

const RoomPlayAdminLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className='flex min-h-screen items-center justify-center w-full px-5'>
      <div className='max-w-[800px] w-full mx-auto space-y-5'>
        <div>
          <div className='text-center mb-5'>
            <TypographyH2>Users joined</TypographyH2>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default RoomPlayAdminLayout;
