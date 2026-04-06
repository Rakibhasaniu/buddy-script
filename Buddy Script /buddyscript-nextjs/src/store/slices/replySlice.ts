import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosPrivate } from '@/lib/axios';
import { IReply, IReplyState } from '@/types';

const initialState: IReplyState = {
  byCommentId: {},
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchReplies = createAsyncThunk(
  'replies/fetch',
  async (commentId: string, { rejectWithValue }) => {
    try {
      const res = await axiosPrivate.get(`/comments/${commentId}/replies`);
      return { commentId, replies: res.data.data as IReply[] };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to load replies');
    }
  },
);

export const createReply = createAsyncThunk(
  'replies/create',
  async (
    { commentId, text }: { commentId: string; text: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await axiosPrivate.post(`/comments/${commentId}/replies`, { text });
      return { commentId, reply: res.data.data as IReply };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to add reply');
    }
  },
);

export const deleteReply = createAsyncThunk(
  'replies/delete',
  async (
    { replyId, commentId }: { replyId: string; commentId: string },
    { rejectWithValue },
  ) => {
    try {
      await axiosPrivate.delete(`/replies/${replyId}`);
      return { replyId, commentId };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to delete reply');
    }
  },
);

export const toggleReplyLike = createAsyncThunk(
  'replies/toggleLike',
  async (
    { replyId, commentId }: { replyId: string; commentId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await axiosPrivate.patch(`/replies/${replyId}/like`);
      return { replyId, commentId, ...res.data.data } as {
        replyId: string;
        commentId: string;
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

const replySlice = createSlice({
  name: 'replies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch replies
    builder
      .addCase(fetchReplies.pending, (state, action) => {
        const commentId = action.meta.arg;
        if (!state.byCommentId[commentId]) {
          state.byCommentId[commentId] = { replies: [], isLoading: true };
        } else {
          state.byCommentId[commentId].isLoading = true;
        }
      })
      .addCase(fetchReplies.fulfilled, (state, action) => {
        const { commentId, replies } = action.payload;
        state.byCommentId[commentId] = { replies, isLoading: false };
      })
      .addCase(fetchReplies.rejected, (state, action) => {
        const commentId = action.meta.arg;
        if (state.byCommentId[commentId]) {
          state.byCommentId[commentId].isLoading = false;
        }
      });

    // create reply — append (oldest first order)
    builder.addCase(createReply.fulfilled, (state, action) => {
      const { commentId, reply } = action.payload;
      if (!state.byCommentId[commentId]) {
        state.byCommentId[commentId] = { replies: [], isLoading: false };
      }
      state.byCommentId[commentId].replies.push(reply);
    });

    // delete reply
    builder.addCase(deleteReply.fulfilled, (state, action) => {
      const { replyId, commentId } = action.payload;
      if (state.byCommentId[commentId]) {
        state.byCommentId[commentId].replies = state.byCommentId[
          commentId
        ].replies.filter((r) => r._id !== replyId);
      }
    });

    // toggle like
    builder.addCase(toggleReplyLike.fulfilled, (state, action) => {
      const { replyId, commentId, likesCount } = action.payload;
      const reply = state.byCommentId[commentId]?.replies.find(
        (r) => r._id === replyId,
      );
      if (reply) {
        reply.likesCount = likesCount;
      }
    });
  },
});

export default replySlice.reducer;
