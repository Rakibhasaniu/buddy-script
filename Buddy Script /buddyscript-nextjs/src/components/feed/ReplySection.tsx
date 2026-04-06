'use client';

import { createReply, fetchReplies, toggleReplyLike } from '@/store/slices/replySlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect, useState } from 'react';
import Avatar from '../shared/Avatar';

export default function ReplySection({ commentId }: { commentId: string }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const replyData = useAppSelector((s) => s.replies.byCommentId[commentId]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!replyData) {
      dispatch(fetchReplies(commentId));
    }
  }, [dispatch, commentId, replyData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await dispatch(createReply({ commentId, text }));
    setText('');
  };

  const replies = replyData?.replies || [];

  return (
    <div className="_feed_inner_timeline_cooment_area" style={{ paddingLeft: 0 }}>
      {/* Reply list */}
      <div className="_timline_comment_main">
        {replies.map((reply) => (
          <div key={reply._id} className="_comment_main">
            <div className="_comment_image">
              <a href="#0" className="_comment_image_link">
                <Avatar src={reply.author.avatar} name={reply.author.firstName} size={28} className="_comment_img1" />
              </a>
            </div>
            <div className="_comment_area">
              <div className="_comment_details">
                <div className="_comment_details_top">
                  <div className="_comment_name">
                    <a href="#0">
                      <h4 className="_comment_name_title">
                        {reply.author.firstName} {reply.author.lastName}
                      </h4>
                    </a>
                  </div>
                </div>
                <div className="_comment_status">
                  <p className="_comment_status_text">
                    <span>{reply.text}</span>
                  </p>
                </div>
                <div className="_total_reactions">
                  <div className="_total_react">
                    <span className="_reaction_like">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                    </span>
                  </div>
                  {reply.likesCount > 0 && (
                    <span className="_total">{reply.likesCount}</span>
                  )}
                </div>
                <div className="_comment_reply">
                  <div className="_comment_reply_num">
                    <ul className="_comment_reply_list">
                      <li>
                        <button
                          type="button"
                          className="border-0 bg-transparent p-0"
                          onClick={() => dispatch(toggleReplyLike({ replyId: reply._id, commentId }))}
                        >
                          <span>Like.</span>
                        </button>
                      </li>
                      <li><span>Share</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply input */}
      <div className="_feed_inner_comment_box">
        <form className="_feed_inner_comment_box_form" onSubmit={handleSubmit}>
          <div className="_feed_inner_comment_box_content">
            <div className="_feed_inner_comment_box_content_image">
              <Avatar src={user?.avatar} name={user?.firstName || 'U'} size={28} className="_comment_img" />
            </div>
            <div className="_feed_inner_comment_box_content_txt">
              <textarea
                className="form-control _comment_textarea"
                placeholder="Write a reply..."
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
          </div>
        </form>
      </div>
    </div>
  );
}
