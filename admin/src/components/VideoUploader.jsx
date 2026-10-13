import { useState } from 'react';
import { Upload, App, Button, Spin, Progress } from 'antd';
import { InboxOutlined, DeleteOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useUploadVideoMutation, useRemoveAssetMutation } from '../store/api/adminApi';

const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];
const MAX_SIZE_MB = 50;

/**
 * Single-video uploader backed by the backend's generic Cloudinary video endpoint.
 * Mirrors ImageUploader's shape — emits { url, publicId, duration } (or null) via onChange.
 *
 * Props:
 *   value:    { url, publicId, duration } | null
 *   onChange: (video | null) => void
 *   folder:   Cloudinary sub-folder (default 'products')
 */
export default function VideoUploader({ value, onChange, folder = 'products' }) {
  const { message } = App.useApp();
  const [uploadVideo] = useUploadVideoMutation();
  const [removeAsset] = useRemoveAssetMutation();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const beforeUpload = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      message.error('Unsupported video format — use MP4, WebM, MOV or OGG');
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      message.error(`Video must be ${MAX_SIZE_MB}MB or smaller`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    try {
      const res = await uploadVideo({ formData, folder }).unwrap();
      onSuccess(res.data);
      onChange?.(res.data);
      message.success('Video uploaded');
    } catch (err) {
      message.error(err?.data?.message || 'Video upload failed');
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    setRemoving(true);
    try {
      if (value.publicId) {
        await removeAsset({ publicId: value.publicId, resourceType: 'video' }).unwrap();
      }
      onChange?.(null);
    } catch {
      message.error('Could not delete video from storage — it was still removed from this product');
      onChange?.(null);
    } finally {
      setRemoving(false);
    }
  };

  if (value?.url) {
    return (
      <div style={{ maxWidth: 420 }}>
        <video
          src={value.url}
          controls
          preload="metadata"
          style={{ width: '100%', borderRadius: 8, background: '#000' }}
        />
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleRemove}
          loading={removing}
          style={{ marginTop: 10 }}
        >
          Remove Video
        </Button>
      </div>
    );
  }

  return (
    <Upload.Dragger
      accept="video/mp4,video/webm,video/quicktime,video/ogg"
      showUploadList={false}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      disabled={uploading}
      style={{ maxWidth: 420 }}
    >
      {uploading ? (
        <div style={{ padding: 16 }}>
          <Spin />
          <p style={{ marginTop: 12 }}>Uploading video…</p>
          <Progress percent={70} showInfo={false} status="active" />
        </div>
      ) : (
        <div style={{ padding: 16 }}>
          <p className="ant-upload-drag-icon">
            <VideoCameraOutlined />
          </p>
          <p className="ant-upload-text">Click or drag a video to upload</p>
          <p className="ant-upload-hint">MP4, WebM, MOV or OGG — up to {MAX_SIZE_MB}MB</p>
        </div>
      )}
    </Upload.Dragger>
  );
}
