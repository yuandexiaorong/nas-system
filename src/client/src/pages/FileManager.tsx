import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Upload, Modal, Input, Breadcrumb, Dropdown, Menu } from 'antd';
import {
  FileOutlined,
  FolderOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderAddOutlined,
  MoreOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

interface FileItem {
  name: string;
  isDir: boolean;
  size: number;
  mtime: string;
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [loading, setLoading] = useState(false);
  const [renameModal, setRenameModal] = useState<{ visible: boolean; oldName: string; newName: string; }>({ visible: false, oldName: '', newName: '' });
  const [mkdirModal, setMkdirModal] = useState<{ visible: boolean; name: string }>({ visible: false, name: '' });
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; file: FileItem | null }>({ visible: false, file: null });
  const [previewContent, setPreviewContent] = useState<string>('');
  const [previewType, setPreviewType] = useState<'image' | 'text' | 'audio' | 'video' | 'other'>('other');

  // 加载文件列表
  const loadFiles = async (path: string) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/files', { params: { path }, headers: { 'Cache-Control': 'no-cache' } });
      setFiles(response.data.list);
      setCurrentPath(response.data.path || '/');
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('加载文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(currentPath);
    // eslint-disable-next-line
  }, [currentPath]);

  // 路径导航
  const pathSegments = (currentPath || '/').split('/').filter(Boolean);
  const breadcrumbItems = [
    <Breadcrumb.Item key="root" onClick={() => setCurrentPath('/')}>根目录</Breadcrumb.Item>,
    ...pathSegments.map((seg, idx) => {
      const path = '/' + pathSegments.slice(0, idx + 1).join('/');
      return <Breadcrumb.Item key={path} onClick={() => setCurrentPath(path)}>{seg}</Breadcrumb.Item>;
    })
  ];

  // 新建文件夹
  const handleMkdir = async () => {
    if (!mkdirModal.name) return;
    try {
      await axios.post('/api/files/mkdir', null, { params: { path: currentPath + (currentPath.endsWith('/') ? '' : '/') + mkdirModal.name } });
      message.success('文件夹创建成功');
      setMkdirModal({ visible: false, name: '' });
      loadFiles(currentPath);
    } catch {
      message.error('文件夹创建失败');
    }
  };

  // 删除
  const handleDelete = (file: FileItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${file.name} 吗？`,
      onOk: async () => {
        try {
          await axios.delete('/api/files', { params: { path: currentPath + (currentPath.endsWith('/') ? '' : '/') + file.name } });
          message.success('删除成功');
          loadFiles(currentPath);
        } catch {
          message.error('删除失败');
        }
      }
    });
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个文件/文件夹吗？`,
      onOk: async () => {
        try {
          await axios.post('/api/files/batch-delete', {
            paths: selectedRowKeys.map(name => currentPath + (currentPath.endsWith('/') ? '' : '/') + name)
          });
          message.success('批量删除成功');
          loadFiles(currentPath);
        } catch {
          message.error('批量删除失败');
        }
      }
    });
  };

  // 重命名
  const handleRename = async () => {
    if (!renameModal.newName) return;
    try {
      await axios.post('/api/files/rename', {
        oldPath: currentPath + (currentPath.endsWith('/') ? '' : '/') + renameModal.oldName,
        newPath: currentPath + (currentPath.endsWith('/') ? '' : '/') + renameModal.newName
      });
      message.success('重命名成功');
      setRenameModal({ visible: false, oldName: '', newName: '' });
      loadFiles(currentPath);
    } catch {
      message.error('重命名失败');
    }
  };

  // 下载
  const handleDownload = (file: FileItem) => {
    const url = `/api/files/download?path=${encodeURIComponent(currentPath + (currentPath.endsWith('/') ? '' : '/') + file.name)}`;
    window.open(url, '_blank');
  };

  // 批量下载（逐个下载）
  const handleBatchDownload = () => {
    if (selectedRowKeys.length === 0) return;
    selectedRowKeys.forEach(name => {
      const url = `/api/files/download?path=${encodeURIComponent(currentPath + (currentPath.endsWith('/') ? '' : '/') + name)}`;
      window.open(url, '_blank');
    });
  };

  // 文件预览
  const handlePreview = async (file: FileItem) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const url = `/api/files/download?path=${encodeURIComponent(currentPath + (currentPath.endsWith('/') ? '' : '/') + file.name)}&preview=1`;
    if (["png","jpg","jpeg","gif","bmp","webp","svg"].includes(ext)) {
      setPreviewType('image');
      setPreviewContent(url);
    } else if (["txt","md","log","json","js","ts","css","html","py","sh","ini","conf","yaml","yml"].includes(ext)) {
      setPreviewType('text');
      const res = await axios.get(url);
      setPreviewContent(res.data);
    } else if (["mp3","wav","ogg","aac"].includes(ext)) {
      setPreviewType('audio');
      setPreviewContent(url);
    } else if (["mp4","webm","ogg","mov","avi","mkv"].includes(ext)) {
      setPreviewType('video');
      setPreviewContent(url);
    } else {
      setPreviewType('other');
      setPreviewContent(url);
    }
    setPreviewModal({ visible: true, file });
  };

  // 右键菜单
  const menu = (file: FileItem) => (
    <Menu>
      <Menu.Item key="preview" icon={<EyeOutlined />} onClick={() => handlePreview(file)}>
        预览
      </Menu.Item>
      <Menu.Item key="download" icon={<DownloadOutlined />} onClick={() => handleDownload(file)}>
        下载
      </Menu.Item>
      <Menu.Item key="rename" icon={<EditOutlined />} onClick={() => setRenameModal({ visible: true, oldName: file.name, newName: file.name })}>
        重命名
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={() => handleDelete(file)}>
        删除
      </Menu.Item>
    </Menu>
  );

  // 表格列
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: FileItem) => (
        <Space>
          {record.isDir ? <FolderOutlined /> : <FileOutlined />}
          <span style={{ cursor: record.isDir ? 'pointer' : 'default' }}
            onDoubleClick={() => record.isDir ? setCurrentPath(currentPath + (currentPath.endsWith('/') ? '' : '/') + record.name) : handlePreview(record)}>
            {text}
          </span>
        </Space>
      )
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number, record: FileItem) => record.isDir ? '-' : (size < 1024 ? `${size} B` : size < 1024 * 1024 ? `${(size / 1024).toFixed(2)} KB` : size < 1024 * 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(2)} MB` : `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`)
    },
    {
      title: '修改时间',
      dataIndex: 'mtime',
      key: 'mtime',
      render: (mtime: string) => new Date(mtime).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: FileItem) => (
        <Dropdown overlay={menu(record)} trigger={['click']}>
          <Button icon={<MoreOutlined />} size="small" onClick={e => { e.stopPropagation(); setSelectedFile(record); }} />
        </Dropdown>
      )
    }
  ];

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>{breadcrumbItems}</Breadcrumb>
      <Space style={{ marginBottom: 16 }}>
        <Upload
          action={`/api/files/upload?path=${encodeURIComponent(currentPath)}`}
          showUploadList={false}
          multiple
          onChange={info => {
            if (info.file.status === 'done') {
              message.success(`${info.file.name} 上传成功`);
              loadFiles(currentPath);
            } else if (info.file.status === 'error') {
              message.error(`${info.file.name} 上传失败`);
            }
          }}
        >
          <Button icon={<UploadOutlined />}>上传文件</Button>
        </Upload>
        <Button icon={<FolderAddOutlined />} onClick={() => setMkdirModal({ visible: true, name: '' })}>新建文件夹</Button>
        <Button icon={<DeleteOutlined />} danger disabled={selectedRowKeys.length === 0} onClick={handleBatchDelete}>批量删除</Button>
        <Button icon={<DownloadOutlined />} disabled={selectedRowKeys.length === 0} onClick={handleBatchDownload}>批量下载</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={files}
        loading={loading}
        rowKey={record => record.name}
        pagination={false}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          getCheckboxProps: record => ({ disabled: record.isDir }) // 只允许文件多选
        }}
        onRow={record => ({
          onDoubleClick: () => {
            if (record.isDir) {
              setCurrentPath(currentPath + (currentPath.endsWith('/') ? '' : '/') + record.name);
            } else {
              handlePreview(record);
            }
          },
          onContextMenu: event => {
            event.preventDefault();
            setSelectedFile(record);
          }
        })}
      />
      {/* 重命名弹窗 */}
      <Modal
        title="重命名"
        open={renameModal.visible}
        onOk={handleRename}
        onCancel={() => setRenameModal({ visible: false, oldName: '', newName: '' })}
      >
        <Input
          value={renameModal.newName}
          onChange={e => setRenameModal({ ...renameModal, newName: e.target.value })}
          placeholder="请输入新名称"
        />
      </Modal>
      {/* 新建文件夹弹窗 */}
      <Modal
        title="新建文件夹"
        open={mkdirModal.visible}
        onOk={handleMkdir}
        onCancel={() => setMkdirModal({ visible: false, name: '' })}
      >
        <Input
          value={mkdirModal.name}
          onChange={e => setMkdirModal({ ...mkdirModal, name: e.target.value })}
          placeholder="请输入文件夹名称"
        />
      </Modal>
      {/* 文件预览弹窗 */}
      <Modal
        title={previewModal.file?.name}
        open={previewModal.visible}
        onCancel={() => setPreviewModal({ visible: false, file: null })}
        footer={null}
        width={previewType === 'image' ? 800 : 600}
      >
        {previewType === 'image' && <img src={previewContent} alt="预览" style={{ maxWidth: '100%' }} />}
        {previewType === 'text' && <pre style={{ maxHeight: 500, overflow: 'auto', background: '#f6f6f6', padding: 12 }}>{previewContent}</pre>}
        {previewType === 'audio' && <audio src={previewContent} controls style={{ width: '100%' }} />}
        {previewType === 'video' && <video src={previewContent} controls style={{ width: '100%' }} />}
        {previewType === 'other' && <a href={previewContent} target="_blank" rel="noopener noreferrer">点击下载/预览</a>}
      </Modal>
    </div>
  );
};

export default FileManager; 