import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosPrivate } from '@/lib/axios';
import { IComment, ICommentState } from '@/types';

const initialState: ICommentState = {
  byPostId: {},
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchComments = createAsyncThunk(
  'comments/fetch',
  async (
    { postId, cursor }: { postId: string; cursor?: string },
    { rejectWithValue },
  ) => {
    try {
      const url = cursor
        ? `/posts/${postId}/comments?cursor=${cursor}`
        : `/posts/${postId}/comments`;
      const res = await axiosPrivate.get(url);
      return {
        postId,
        ...res.data.data,
      } as { postId: string; comments: IComment[]; nextCursor: string | null };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to load comments');
    }
  },
);

export const createComment = createAsyncThunk(
  'comments/create',
  async (
    { postId, text }: { postId: string; text: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await axiosPrivate.post(`/posts/${postId}/comments`, { text });
      return { postId, comment: res.data.data as IComment };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  },
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (
    { commentId, postId }: { commentId: string; postId: string },
    { rejectWithValue },
  ) => {
    try {
      await axiosPrivate.delete(`/comments/${commentId}`);
      return { commentId, postId };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  },
);

export const toggleCommentLike = createAsyncThunk(
  'comments/toggleLike',
  async (
    { commentId, postId }: { commentId: string; postId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await axiosPrivate.patch(`/comments/${commentId}/like`);
      return { commentId, postId, ...res.data.data } as {
        commentId: string;
        postId: string;
        liked: boolean;
        likesCount: number;
      };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle like');
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch comments
    builder
      .addCase(fetchComments.pending, (state, action) => {
        const { postId } = action.meta.arg;
        if (!state.byPostId[postId]) {
          state.byPostId[postId] = { comments: [], nextCursor: null, isLoading: true };
        } else {
          state.byPostId[postId].isLoading = true;
        }
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments, nextCursor } = action.payload;
        const existing = state.byPostId[postId]?.comments || [];
        state.byPostId[postId] = {
          comments: [...existing, ...comments],
          nextCursor,
          isLoading: false,
        };
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const { postId } = action.meta.arg;
        if (state.byPostId[postId]) {
          state.byPostId[postId].isLoading = false;
        }
      });

    // create comment — prepend
    builder.addCase(createComment.fulfilled, (state, action) => {
      const { postId, comment } = action.payload;
      if (!state.byPostId[postId]) {
        state.byPostId[postId] = { comments: [], nextCursor: null, isLoading: false };
      }
      state.byPostId[postId].comments = [
        comment,
        ...state.byPostId[postId].comments,
      ];
    });

    // delete comment
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      const { commentId, postId } = action.payload;
      if (state.byPostId[postId]) {
        state.byPostId[postId].comments = state.byPostId[postId].comments.filter(
          (c) => c._id !== commentId,
        );
      }
    });

    // toggle like
    builder.addCase(toggleCommentLike.fulfilled, (state, action) => {
      const { commentId, postId, likesCount } = action.payload;
      const comment = state.byPostId[postId]?.comments.find(
        (c) => c._id === commentId,
      );
      if (comment) {
        comment.likesCount = likesCount;
      }
    });
  },
});

export default commentSlice.reducer;
