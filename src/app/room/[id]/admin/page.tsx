import { db } from '@/lib/firebase';
import { AdminClientPage } from './components/admin-client-page';
import type { Room } from '@/types';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';

type Params = {
  params: {
    id: string;
  };
};

const RoomAdminPage = async ({ params }: Params) => {
  const docRef = collection(db, 'rooms');
  const q = query(docRef, where('id', '==', params.id), limit(1));

  const querySnapshot = await getDocs(q);
  const room = querySnapshot.docs[0].data() as Room | undefined;

  return <AdminClientPage roomCode={room?.roomCode || ''} />;
};

export default RoomAdminPage;
