import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { Comment } from '../Comment/comment.model';
import { Reply } from './reply.model';

// GET /comments/:commentId/replies
const getReplies = async (commentId: string) => {
  const comment = await Comment.findById(commentId).lean();

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const replies = await Reply.find({
    comment: new Types.ObjectId(commentId),
  })
    .sort({ createdAt: 1 }) // oldest first — natural conversation order
    .populate('author', 'firstName lastName avatar')
    .populate('likes', 'firstName lastName avatar')
    .lean();

  return replies;
};

// POST /comments/:commentId/replies
const createReply = async (
  commentId: string,
  userId: string,
  text: string,
) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const reply = await Reply.create({
    comment: new Types.ObjectId(commentId),
    author: new Types.ObjectId(userId),
    text,
  });

  // increment cached repliesCount on the parent comment
  await Comment.findByIdAndUpdate(commentId, {
    $inc: { repliesCount: 1 },
  });

  return reply.populate('author', 'firstName lastName avatar');
};

// DELETE /replies/:id
const deleteReply = async (replyId: string, userId: string) => {
  const reply = await Reply.findById(replyId);

  if (!reply) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reply not found');
  }

  if (reply.author.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own replies',
    );
  }

  // decrement cached repliesCount on the parent comment
  await Comment.findByIdAndUpdate(reply.comment, {
    $inc: { repliesCount: -1 },
  });

  await reply.deleteOne();
  return null;
};

// PATCH /replies/:id/like — toggle like
const toggleLike = async (replyId: string, userId: string) => {
  const reply = await Reply.findById(replyId);

  if (!reply) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reply not found');
  }

  const userObjectId = new Types.ObjectId(userId);
  const alreadyLiked = reply.likes.some((id) => id.equals(userObjectId));

  if (alreadyLiked) {
    reply.likes = reply.likes.filter((id) => !id.equals(userObjectId));
    reply.likesCount = Math.max(0, reply.likesCount - 1);
  } else {
    reply.likes.push(userObjectId);
    reply.likesCount += 1;
  }

  await reply.save();

  return { liked: !alreadyLiked, likesCount: reply.likesCount };
};

// GET /replies/:id/likes
const getLikes = async (replyId: string) => {
  const reply = await Reply.findById(replyId)
    .populate('likes', 'firstName lastName avatar')
    .lean();

  if (!reply) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reply not found');
  }

  return reply.likes;
};

export const ReplyServices = {
  getReplies,
  createReply,
  deleteReply,
  toggleLike,
  getLikes,
};
