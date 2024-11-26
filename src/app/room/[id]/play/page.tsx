import { TypographyH1 } from '@/components/ui/typography';
import { cookies } from 'next/headers';
import { PlayClientPage } from './components/play-client-page';
const RoomPlayPage = () => {
  const userId = cookies().get('userId');

  if (!userId || !userId?.value) {
    return <TypographyH1>Unauthorized</TypographyH1>;
  }

  return <PlayClientPage userId={userId.value} />;
};

export default RoomPlayPage;
