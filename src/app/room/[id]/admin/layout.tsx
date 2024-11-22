import React, { type PropsWithChildren } from 'react';

const RoomPlayAdminLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className='flex min-h-screen items-center justify-center w-full px-5'>
      <div className='max-w-[800px] w-full mx-auto space-y-5'>
        <h1 className='font-semibold text-2xl text-center mb-6'>Admin</h1>
        <div>
          <h2 className='mb-5 text-xl font-semibold text-center'>Users joined</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default RoomPlayAdminLayout;
