export type Room = {
  id: string;
  maxPlayers: number;
  currentPlayers: number;
  active: boolean;
  roomCode: string;
};

export type RealtimeRoom = {
  id: string;
  gameState: RealtimeGameState;
  players: Record<string, Player>;
  turns: Record<number, Turn>;
  hostId: string;
  hostName: string;
};

export type RealtimeGameState = {
  ready: boolean;
  active: boolean;
  currentTurn: Turn | null;
  genderRevealed: boolean;
  revealerId: string | null;
  gender: Gender;
};

export type Gender = 'boy' | 'girl';

export type Player = {
  id: string;
  name: string;
  status: PlayerStatus;
  turnOrder: number;
};

export type Turn = {
  turnId: number;
  playerId: string;
  playerName: string;
};

export type PlayerStatus = 'joined' | 'ready' | 'disconnected';
