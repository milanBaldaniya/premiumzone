import { useState } from 'react';
import { Upload, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useUploadImageMutation, useRemoveImageMutation } from '../store/api/adminApi';

/**
 * Multi-image uploader backed by the backend's generic Cloudinary endpoint.
 * Emits an array of { url, publicId } via onChange — ready to store on a product.
 *
 * Props:
 *   value:    [{ url, publicId }]
 *   onChange: (images) => void
 *   folder:   Cloudinary sub-folder (default 'products')
 *   max:      maximum number of images
 */
export default function ImageUploader({ value = [], onChange, folder = 'products', max = 8 }) {
  const { message } = App.useApp();
  const [uploadImage] = useUploadImageMutation();
  const [removeImage] = useRemoveImageMutation();
  // Uploaded images live in `value` (owned by the parent form). This only tracks
  // files still in flight — keeping a separate copy of "done" files here too was
  // the bug: it raced against `value` and got wiped mid-upload on every re-sync.
  const [pending, setPending] = useState([]);

  const doneFiles = (value || []).map((img, i) => ({
    uid: img.publicId || `existing-${i}`,
    name: `image-${i}`,
    status: 'done',
    url: img.url,
    publicId: img.publicId,
  }));
  const fileList = [...doneFiles, ...pending];

  const customRequest = async ({ file, onSuccess, onError }) => {
    setPending((p) => [...p, { uid: file.uid, name: file.name, status: 'uploading', percent: 60 }]);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await uploadImage({ formData, folder }).unwrap();
      onSuccess(res.data);
      setPending((p) => p.filter((f) => f.uid !== file.uid));
      onChange?.([...(value || []), { url: res.data.url, publicId: res.data.publicId }]);
    } catch (err) {
      message.error('Upload failed');
      setPending((p) => p.filter((f) => f.uid !== file.uid));
      onError(err);
    }
  };

  const handleRemove = (file) => {
    if (file.status !== 'done') {
      setPending((p) => p.filter((f) => f.uid !== file.uid));
      return;
    }
    onChange?.((value || []).filter((img) => (img.publicId || null) !== file.publicId));

    // Image already lives in Cloudinary (either pre-existing or just uploaded) — clean it up now
    // rather than waiting on the form's save, which otherwise just overwrites the DB reference.
    if (file.publicId) {
      removeImage(file.publicId)
        .unwrap()
        .catch(() => message.error('Removed from form, but failed to delete from storage'));
    }
  };

  return (
    <Upload
      listType="picture-card"
      fileList={fileList}
      customRequest={customRequest}
      accept="image/*"
      onRemove={handleRemove}
    >
      {fileList.length >= max ? null : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      )}
    </Upload>
  );
}
