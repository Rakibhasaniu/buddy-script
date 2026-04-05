import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { Post } from '../Post/post.model';
import { Comment } from './comment.model';

const COMMENTS_PER_PAGE = 10;

const getComments = async (postId: string, userId: string, cursor?: string) => {
  const post = await Post.findById(postId).lean();

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (
    post.visibility === 'private' &&
    post.author.toString() !== userId
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Post not accessible');
  }

  const query: Record<string, unknown> = {
    post: new Types.ObjectId(postId),
  };

  if (cursor) {
    query._id = { $lt: new Types.ObjectId(cursor) };
  }

  const comments = await Comment.find(query)
    .sort({ _id: -1 })
    .limit(COMMENTS_PER_PAGE)
    .populate('author', 'firstName lastName avatar')
    .populate('likes', 'firstName lastName avatar')
    .lean();

  const nextCursor =
    comments.length === COMMENTS_PER_PAGE
      ? comments[comments.length - 1]._id.toString()
      : null;

  return { comments, nextCursor };
};

const createComment = async (
  postId: string,
  userId: string,
  text: string,
) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (
    post.visibility === 'private' &&
    post.author.toString() !== userId
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Post not accessible');
  }

  const comment = await Comment.create({
    post: new Types.ObjectId(postId),
    author: new Types.ObjectId(userId),
    text,
  });

  return comment.populate('author', 'firstName lastName avatar');
};

const deleteComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  if (comment.author.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own comments',
    );
  }

  await comment.deleteOne();
  return null;
};

const toggleLike = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const userObjectId = new Types.ObjectId(userId);
  const alreadyLiked = comment.likes.some((id) => id.equals(userObjectId));

  if (alreadyLiked) {
    comment.likes = comment.likes.filter((id) => !id.equals(userObjectId));
    comment.likesCount = Math.max(0, comment.likesCount - 1);
  } else {
    comment.likes.push(userObjectId);
    comment.likesCount += 1;
  }

  await comment.save();

  return { liked: !alreadyLiked, likesCount: comment.likesCount };
};

const getLikes = async (commentId: string) => {
  const comment = await Comment.findById(commentId)
    .populate('likes', 'firstName lastName avatar')
    .lean();

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  return comment.likes;
};

export const CommentServices = {
  getComments,
  createComment,
  deleteComment,
  toggleLike,
  getLikes,
};
