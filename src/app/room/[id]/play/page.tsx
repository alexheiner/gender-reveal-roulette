'use client';
import { useAuth } from '@/components/providers/auth-provider';
import { TypographyH1 } from '@/components/ui/typography';
import { PlayClientPage } from './components/play-client-page';
const RoomPlayPage = () => {
  const { user } = useAuth();
  const userId = user?.uid;

  if (!userId) {
    return <TypographyH1>Not signed in</TypographyH1>;
  }

  return <PlayClientPage userId={userId} />;
};

export default RoomPlayPage;
