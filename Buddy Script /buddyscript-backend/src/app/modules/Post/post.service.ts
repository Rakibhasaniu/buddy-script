import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { Comment } from '../Comment/comment.model';
import { Post } from './post.model';

const POSTS_PER_PAGE = 10;

const getFeed = async (userId: string, cursor?: string) => {
  const query: Record<string, unknown> = {
    $or: [
      { visibility: 'public' },
      { author: new Types.ObjectId(userId), visibility: 'private' },
    ],
  };

  if (cursor) {
    query._id = { $lt: new Types.ObjectId(cursor) };
  }

  const posts = await Post.find(query)
    .sort({ _id: -1 })
    .limit(POSTS_PER_PAGE)
    .populate('author', 'firstName lastName avatar')
    .populate('likes', 'firstName lastName avatar')
    .lean();

  // Compute accurate commentsCount from Comment collection (handles old posts too)
  if (posts.length > 0) {
    const postIds = posts.map((p) => p._id);
    const counts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));
    posts.forEach((p) => {
      p.commentsCount = countMap.get(p._id.toString()) ?? 0;
    });
  }

  const nextCursor =
    posts.length === POSTS_PER_PAGE
      ? posts[posts.length - 1]._id.toString()
      : null;

  return { posts, nextCursor };
};

const createPost = async (
  userId: string,
  payload: { text: string; visibility: 'public' | 'private' },
  file?: Express.Multer.File,
) => {
  let imageUrl = '';

  if (file) {
    const imageName = `post_${userId}_${Date.now()}`;
    const { secure_url } = (await sendImageToCloudinary(
      imageName,
      file.path,
    )) as { secure_url: string };
    imageUrl = secure_url;
  }

  const post = await Post.create({
    author: new Types.ObjectId(userId),
    text: payload.text,
    visibility: payload.visibility || 'public',
    image: imageUrl,
  });

  return post.populate('author', 'firstName lastName avatar');
};

// DELETE /posts/:id — only author can delete
const deletePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.author.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own posts');
  }

  await post.deleteOne();
  return null;
};

const toggleLike = async (postId: string, userId: string) => {
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

  const userObjectId = new Types.ObjectId(userId);
  const alreadyLiked = post.likes.some((id) => id.equals(userObjectId));

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => !id.equals(userObjectId));
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likes.push(userObjectId);
    post.likesCount += 1;
  }

  await post.save();

  return { liked: !alreadyLiked, likesCount: post.likesCount };
};

const getLikes = async (postId: string, userId: string) => {
  const post = await Post.findById(postId)
    .populate('likes', 'firstName lastName avatar')
    .lean();

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (
    post.visibility === 'private' &&
    post.author.toString() !== userId
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Post not accessible');
  }

  return post.likes;
};

export const PostServices = {
  getFeed,
  createPost,
  deletePost,
  toggleLike,
  getLikes,
};
