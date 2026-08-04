import { useState, useEffect } from 'react';
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
  const [fileList, setFileList] = useState([]);

  // Sync incoming value → AntD fileList (e.g. when editing an existing product)
  useEffect(() => {
    setFileList(
      (value || []).map((img, i) => ({
        uid: img.publicId || `existing-${i}`,
        name: `image-${i}`,
        status: 'done',
        url: img.url,
        publicId: img.publicId,
      }))
    );
  }, [value]);

  const emit = (list) => {
    const images = list
      .filter((f) => f.status === 'done' && (f.url || f.response?.url))
      .map((f) => ({ url: f.url || f.response.url, publicId: f.publicId || f.response?.publicId }));
    onChange?.(images);
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await uploadImage({ formData, folder }).unwrap();
      onSuccess(res.data);
    } catch (err) {
      message.error('Upload failed');
      onError(err);
    }
  };

  return (
    <Upload
      listType="picture-card"
      fileList={fileList}
      customRequest={customRequest}
      accept="image/*"
      onChange={({ fileList: list }) => {
        setFileList(list);
        emit(list);
      }}
      onRemove={(file) => {
        const next = fileList.filter((f) => f.uid !== file.uid);
        setFileList(next);
        emit(next);

        // Image already lives in Cloudinary (either pre-existing or just uploaded) — clean it up now
        // rather than waiting on the form's save, which otherwise just overwrites the DB reference.
        const publicId = file.publicId || file.response?.publicId;
        if (publicId) {
          removeImage(publicId)
            .unwrap()
            .catch(() => message.error('Removed from form, but failed to delete from storage'));
        }
      }}
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
