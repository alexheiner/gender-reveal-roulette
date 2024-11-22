import { updateRealtime } from './actions';
import { JoinRoomClientPage } from './components/join-room-client-page';
const RoomJoinPage = () => {
  return <JoinRoomClientPage updateRealtime={updateRealtime} />;
};

export default RoomJoinPage;
