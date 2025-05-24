import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Upload,
  Modal,
  Input,
  message,
  Breadcrumb,
  Card,
  Row,
  Col,
  Switch,
  Tooltip,
  Progress
} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  AppstoreOutlined,
  BarsOutlined,
  EyeOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { formatBytes } from '../utils/format';
import FilePreview from '../components/FilePreview';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedAt: string;
  type?: string;
}

const FileManager: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/files/list/${path}`);
      setFiles(response.data);
    } catch (error) {
      message.error('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const handlePathClick = (path: string) => {
    setCurrentPath(path);
  };

  const handleCreateFolder = async () => {
    try {
      await axios.post(`/api/files/mkdir/${currentPath}/${newFolderName}`);
      message.success('文件夹创建成功');
      fetchFiles(currentPath);
      setNewFolderModal(false);
      setNewFolderName('');
    } catch (error) {
      message.error('创建文件夹失败');
    }
  };

  const handleDelete = async (files: FileItem[]) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${files.length} 个项目吗？`,
      onOk: async () => {
        try {
          await Promise.all(
            files.map(file => axios.delete(`/api/files/${file.path}`))
          );
          message.success('删除成功');
          fetchFiles(currentPath);
          setSelectedFiles([]);
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleShare = (file: FileItem) => {
    // 实现文件分享功能
    message.info('分享功能开发中');
  };

  const renderGridView = () => {
    return (
      <Row gutter={[16, 16]}>
        {files.map(file => (
          <Col span={4} key={file.path}>
            <Card
              hoverable
              style={{ textAlign: 'center' }}
              actions={[
                <Tooltip title="预览">
                  <EyeOutlined onClick={() => setPreviewFile(file)} />
                </Tooltip>,
                <Tooltip title="分享">
                  <ShareAltOutlined onClick={() => handleShare(file)} />
                </Tooltip>,
                <Tooltip title="删除">
                  <DeleteOutlined onClick={() => handleDelete([file])} />
                </Tooltip>
              ]}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>
                {file.isDirectory ? <FolderOutlined /> : <FileOutlined />}
              </div>
              <div style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {file.name}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {formatBytes(file.size)}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: FileItem) => (
        <Space>
          {record.isDirectory ? <FolderOutlined /> : <FileOutlined />}
          <span
            style={{ cursor: record.isDirectory ? 'pointer' : 'default' }}
            onClick={() => record.isDirectory && handlePathClick(`${currentPath}/${record.name}`)}
          >
            {text}
          </span>
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatBytes(size),
    },
    {
      title: '修改时间',
      dataIndex: 'modifiedAt',
      key: 'modifiedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: FileItem) => (
        <Space size="middle">
          <Tooltip title="预览">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => setPreviewFile(record)}
            />
          </Tooltip>
          <Tooltip title="分享">
            <Button
              type="link"
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(record)}
            />
          </Tooltip>
          {!record.isDirectory && (
            <Tooltip title="下载">
              <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => window.open(`/api/files/download/${record.path}`)}
              />
            </Tooltip>
          )}
          <Tooltip title="删除">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete([record])}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Space>
              <Upload
                action={`/api/files/upload/${currentPath}`}
                multiple
                onChange={info => {
                  if (info.file.status === 'uploading') {
                    setUploadProgress(Math.round(info.file.percent || 0));
                  }
                  if (info.file.status === 'done') {
                    message.success(`${info.file.name} 上传成功`);
                    setUploadProgress(0);
                    fetchFiles(currentPath);
                  } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 上传失败`);
                    setUploadProgress(0);
                  }
                }}
              >
                <Button type="primary" icon={<UploadOutlined />}>
                  上传文件
                </Button>
              </Upload>
              <Button icon={<FolderOutlined />} onClick={() => setNewFolderModal(true)}>
                新建文件夹
              </Button>
              {selectedFiles.length > 0 && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(selectedFiles)}
                >
                  批量删除
                </Button>
              )}
            </Space>
            <Space>
              <Switch
                checkedChildren={<AppstoreOutlined />}
                unCheckedChildren={<BarsOutlined />}
                checked={viewMode === 'grid'}
                onChange={(checked) => setViewMode(checked ? 'grid' : 'list')}
              />
            </Space>
          </Space>

          <Breadcrumb>
            <Breadcrumb.Item>
              <a onClick={() => handlePathClick('')}>根目录</a>
            </Breadcrumb.Item>
            {currentPath.split('/').filter(Boolean).map((part, index, array) => (
              <Breadcrumb.Item key={index}>
                <a onClick={() => handlePathClick(array.slice(0, index + 1).join('/'))}>
                  {part}
                </a>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>

          {uploadProgress > 0 && (
            <Progress percent={uploadProgress} status="active" />
          )}

          {viewMode === 'list' ? (
            <Table
              columns={columns}
              dataSource={files}
              loading={loading}
              rowKey="path"
              rowSelection={{
                onChange: (selectedRowKeys, selectedRows) => {
                  setSelectedFiles(selectedRows);
                },
              }}
            />
          ) : (
            renderGridView()
          )}
        </Space>
      </Card>

      <Modal
        title="新建文件夹"
        open={newFolderModal}
        onOk={handleCreateFolder}
        onCancel={() => {
          setNewFolderModal(false);
          setNewFolderName('');
        }}
      >
        <Input
          placeholder="请输入文件夹名称"
          value={newFolderName}
          onChange={e => setNewFolderName(e.target.value)}
        />
      </Modal>

      {previewFile && (
        <FilePreview
          visible={!!previewFile}
          onClose={() => setPreviewFile(null)}
          file={{
            name: previewFile.name,
            type: previewFile.type || 'unknown',
            url: `/api/files/preview/${previewFile.path}`,
            size: previewFile.size
          }}
        />
      )}
    </div>
  );
};

export default FileManager; 