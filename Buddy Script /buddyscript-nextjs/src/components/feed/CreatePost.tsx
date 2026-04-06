'use client';

import { createPost } from '@/store/slices/postSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useRef, useState } from 'react';

export default function CreatePost() {
  const dispatch = useAppDispatch();
  const { isCreating } = useAppSelector((s) => s.posts);
  const { user } = useAppSelector((s) => s.auth);

  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const formData = new FormData();
    formData.append('text', text);
    formData.append('visibility', visibility);
    if (imageFile) formData.append('image', imageFile);

    const result = await dispatch(createPost(formData));
    if (createPost.fulfilled.match(result)) {
      setText('');
      setImageFile(null);
      setImagePreview('');
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <form onSubmit={handleSubmit}>
        <div className="_feed_inner_text_area_box">
          <div className="_feed_inner_text_area_box_image">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="_txt_img" />
            ) : (
              <div
                className="_txt_img rounded-circle d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                style={{ width: 44, height: 44, fontSize: 16 }}
              >
                {user?.firstName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="form-floating _feed_inner_text_area_box_form">
            <textarea
              className="form-control _textarea"
              placeholder="Write something..."
              id="floatingTextarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <label className="_feed_textarea_label" htmlFor="floatingTextarea">
              Write something...
            </label>
          </div>
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="mt-2 position-relative d-inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxHeight: 200, borderRadius: 8, maxWidth: '100%' }}
            />
            <button
              type="button"
              onClick={() => { setImageFile(null); setImagePreview(''); }}
              className="btn btn-sm btn-danger position-absolute top-0 end-0"
              style={{ borderRadius: '50%', padding: '2px 6px' }}
            >
              ×
            </button>
          </div>
        )}

        <div className="_feed_inner_text_area_bottom">
          <div className="_feed_inner_text_area_item">
            {/* Photo button */}
            <div className="_feed_inner_text_area_bottom_photo _feed_common">
              <button
                type="button"
                className="_feed_inner_text_area_bottom_photo_link"
                onClick={() => fileRef.current?.click()}
              >
                <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z" />
                  </svg>
                </span>
                Photo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleImageChange}
              />
            </div>

            {/* Visibility toggle */}
            <div className="_feed_inner_text_area_bottom_article _feed_common">
              <button
                type="button"
                className="_feed_inner_text_area_bottom_photo_link"
                onClick={() => setVisibility((v) => v === 'public' ? 'private' : 'public')}
              >
                <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                  {visibility === 'public' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path fill="#666" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93V18a1 1 0 00-2 0v1.93C5.517 19.436 3 16.072 3 12c0-4.072 2.517-7.436 6-8.93V5a1 1 0 002 0V3.07A9.004 9.004 0 0121 12c0 4.072-2.517 7.436-6 8.93z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path fill="#666" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                  )}
                </span>
                {visibility === 'public' ? 'Public' : 'Private'}
              </button>
            </div>
          </div>

          <div className="_feed_inner_text_area_btn">
            <button
              type="submit"
              className="_feed_inner_text_area_btn_link"
              disabled={isCreating || !text.trim()}
            >
              <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
              </svg>
              <span>{isCreating ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
