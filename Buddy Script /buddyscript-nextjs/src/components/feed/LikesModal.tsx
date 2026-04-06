'use client';

import { IUser } from '@/types';

interface Props {
  users: IUser[];
  onClose: () => void;
}

// TODO: implement likes modal showing who liked
export default function LikesModal({ users: _users, onClose: _onClose }: Props) {
  return null;
}
