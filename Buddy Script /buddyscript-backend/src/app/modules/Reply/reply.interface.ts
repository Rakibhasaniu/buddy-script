import { Types } from 'mongoose';

export interface TReply {
  comment: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  likes: Types.ObjectId[];
  likesCount: number;
}
