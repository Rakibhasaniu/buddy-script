'use client';

import { createComment, fetchComments, toggleCommentLike } from '@/store/slices/commentSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect, useState } from 'react';
import Avatar from '../shared/Avatar';
import ReplySection from './ReplySection';

export default function CommentSection({ postId }: { postId: string }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const commentData = useAppSelector((s) => s.comments.byPostId[postId]);
  const [text, setText] = useState('');
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(fetchComments({ postId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await dispatch(createComment({ postId, text }));
    setText('');
  };

  const comments = commentData?.comments || [];

  return (
    <div className="_feed_inner_timeline_cooment_area">
      {/* Comment input box */}
      <div className="_feed_inner_comment_box">
        <form className="_feed_inner_comment_box_form" onSubmit={handleSubmit}>
          <div className="_feed_inner_comment_box_content">
            <div className="_feed_inner_comment_box_content_image">
              <Avatar src={user?.avatar} name={user?.firstName || 'U'} size={36} className="_comment_img" />
            </div>
            <div className="_feed_inner_comment_box_content_txt">
              <textarea
                className="form-control _comment_textarea"
                placeholder="Write a comment"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (text.trim()) handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
              />
            </div>
          </div>
          <div className="_feed_inner_comment_box_icon">
            <button type="submit" className="_feed_inner_comment_box_icon_btn" disabled={!text.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 14 13">
                <path fill="#377DFF" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z" clipRule="evenodd" />
              </svg>
            </button>
            <button type="button" className="_feed_inner_comment_box_icon_btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Comment list */}
      <div className="_timline_comment_main">
        {comments.map((comment) => (
          <div key={comment._id} className="_comment_main">
            <div className="_comment_image">
              <a href="#0" className="_comment_image_link">
                <Avatar src={comment.author.avatar} name={comment.author.firstName} size={36} className="_comment_img1" />
              </a>
            </div>
            <div className="_comment_area">
              <div className="_comment_details">
                <div className="_comment_details_top">
                  <div className="_comment_name">
                    <a href="#0">
                      <h4 className="_comment_name_title">
                        {comment.author.firstName} {comment.author.lastName}
                      </h4>
                    </a>
                  </div>
                </div>
                <div className="_comment_status">
                  <p className="_comment_status_text">
                    <span>{comment.text}</span>
                  </p>
                </div>
                <div className="_total_reactions">
                  <div className="_total_react">
                    <span className="_reaction_like">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                    </span>
                    <span className="_reaction_heart">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </span>
                  </div>
                  {comment.likesCount > 0 && (
                    <span className="_total">{comment.likesCount}</span>
                  )}
                </div>
                <div className="_comment_reply">
                  <div className="_comment_reply_num">
                    <ul className="_comment_reply_list">
                      <li>
                        <button
                          type="button"
                          className="border-0 bg-transparent p-0"
                          onClick={() => dispatch(toggleCommentLike({ commentId: comment._id, postId }))}
                        >
                          <span>Like.</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="border-0 bg-transparent p-0"
                          onClick={() =>
                            setOpenReplies((prev) => ({ ...prev, [comment._id]: !prev[comment._id] }))
                          }
                        >
                          <span>Reply{comment.repliesCount > 0 ? ` (${comment.repliesCount})` : ''}.</span>
                        </button>
                      </li>
                      <li><span>Share</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              {openReplies[comment._id] && (
                <ReplySection commentId={comment._id} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
