'use client';

import { fetchFeed, resetFeed } from '@/store/slices/postSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useAuthInit } from '@/hooks/useAuthInit';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Navbar from '../shared/Navbar';
import Spinner from '../shared/Spinner';
import CreatePost from './CreatePost';
import PostCard from './PostCard';

export default function FeedClient() {
  useAuthInit();

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { posts, isLoading, hasMore, nextCursor } = useAppSelector((s) => s.posts);
  const loaderRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // auth guard
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  // initial feed load
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      dispatch(resetFeed());
      dispatch(fetchFeed(null));
    }
  }, [dispatch]);

  // infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && nextCursor) {
          dispatch(fetchFeed(nextCursor));
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [dispatch, hasMore, isLoading, nextCursor]);

  if (!user) return <Spinner />;

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_main_layout">
        <Navbar />

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">

              {/* Left Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
                      <ul className="_left_inner_area_explore_list">
                        {['Learning', 'Insights', 'Find friends', 'Bookmarks', 'Groups', 'Settings'].map((item) => (
                          <li key={item} className="_left_inner_area_explore_item">
                            <a href="#0" className="_left_inner_area_explore_link">{item}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle — Feed */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    <CreatePost />

                    {posts.length === 0 && !isLoading && (
                      <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_b24 text-center _mar_b16">
                        <p style={{ color: '#666' }}>No posts yet. Be the first to post!</p>
                      </div>
                    )}

                    {posts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}

                    {/* Infinite scroll trigger */}
                    <div ref={loaderRef} style={{ height: 20 }} />

                    {isLoading && <Spinner />}

                    {!hasMore && posts.length > 0 && (
                      <p className="text-center py-3" style={{ color: '#999', fontSize: 13 }}>
                        You&apos;re all caught up!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_right_sidebar_wrap">
                  <div className="_layout_right_sidebar_inner">
                    <div className="_right_inner_area _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_title5 _mar_b16">Suggested People</h4>
                      <p style={{ fontSize: 13, color: '#999' }}>Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
