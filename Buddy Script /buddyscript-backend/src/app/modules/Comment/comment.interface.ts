import { Types } from 'mongoose';

export interface TComment {
  post: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  likes: Types.ObjectId[];
  likesCount: number;
  repliesCount: number;
}
