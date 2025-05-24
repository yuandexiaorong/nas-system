import React from 'react';
import { Modal, Image, Typography } from 'antd';
import { FileTextOutlined, PlayCircleOutlined, PictureOutlined } from '@ant-design/icons';
import ReactPlayer from 'react-player';

const { Text } = Typography;

interface FilePreviewProps {
  visible: boolean;
  onClose: () => void;
  file: {
    name: string;
    type: string;
    url: string;
    size: number;
  };
}

const FilePreview: React.FC<FilePreviewProps> = ({ visible, onClose, file }) => {
  const renderPreview = () => {
    const fileType = file.type.split('/')[0];

    switch (fileType) {
      case 'image':
        return (
          <Image
            src={file.url}
            alt={file.name}
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
          />
        );
      case 'video':
        return (
          <ReactPlayer
            url={file.url}
            controls
            width="100%"
            height="auto"
            style={{ maxHeight: '70vh' }}
          />
        );
      case 'audio':
        return (
          <ReactPlayer
            url={file.url}
            controls
            width="100%"
            height={50}
          />
        );
      case 'text':
        return (
          <iframe
            src={file.url}
            style={{ width: '100%', height: '70vh', border: 'none' }}
            title={file.name}
          />
        );
      default:
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <Text>此文件类型不支持预览</Text>
          </div>
        );
    }
  };

  const getIcon = () => {
    const fileType = file.type.split('/')[0];
    switch (fileType) {
      case 'image':
        return <PictureOutlined />;
      case 'video':
      case 'audio':
        return <PlayCircleOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {getIcon()}
          <span>{file.name}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width="80%"
      footer={null}
    >
      {renderPreview()}
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          文件大小: {(file.size / 1024 / 1024).toFixed(2)} MB
        </Text>
      </div>
    </Modal>
  );
};

export default FilePreview; 