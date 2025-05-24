import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Space, message, Modal, Form, Input, Select } from 'antd';
import { 
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TabPane } = Tabs;

interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: string;
  created: string;
  state: 'running' | 'stopped' | 'exited' | 'created';
}

interface ImageInfo {
  id: string;
  repository: string;
  tag: string;
  created: string;
  size: string;
}

const DockerManager: React.FC = () => {
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadContainers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/docker/containers?all=true');
      setContainers(response.data);
    } catch (error) {
      message.error('加载容器列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/docker/images');
      setImages(response.data);
    } catch (error) {
      message.error('加载镜像列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContainers();
    loadImages();
  }, []);

  const containerColumns = [
    {
      title: '容器ID',
      dataIndex: 'id',
      key: 'id',
      width: 100
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '镜像',
      dataIndex: 'image',
      key: 'image'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '端口',
      dataIndex: 'ports',
      key: 'ports'
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: ContainerInfo) => (
        <Space size="middle">
          {record.state === 'running' ? (
            <Button
              type="text"
              icon={<PauseCircleOutlined />}
              onClick={() => handleStopContainer(record.id)}
            />
          ) : (
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartContainer(record.id)}
            />
          )}
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteContainer(record.id)}
          />
        </Space>
      )
    }
  ];

  const imageColumns = [
    {
      title: '镜像ID',
      dataIndex: 'id',
      key: 'id',
      width: 100
    },
    {
      title: '仓库',
      dataIndex: 'repository',
      key: 'repository'
    },
    {
      title: '标签',
      dataIndex: 'tag',
      key: 'tag'
    },
    {
      title: '创建时间',
      dataIndex: 'created',
      key: 'created'
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size'
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: ImageInfo) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteImage(record.id)}
        />
      )
    }
  ];

  const handleStartContainer = async (id: string) => {
    try {
      await axios.post(`/api/docker/containers/${id}/start`);
      message.success('启动容器成功');
      loadContainers();
    } catch (error) {
      message.error('启动容器失败');
    }
  };

  const handleStopContainer = async (id: string) => {
    try {
      await axios.post(`/api/docker/containers/${id}/stop`);
      message.success('停止容器成功');
      loadContainers();
    } catch (error) {
      message.error('停止容器失败');
    }
  };

  const handleDeleteContainer = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该容器吗？',
      onOk: async () => {
        try {
          await axios.delete(`/api/docker/containers/${id}`);
          message.success('删除容器成功');
          loadContainers();
        } catch (error) {
          message.error('删除容器失败');
        }
      }
    });
  };

  const handleDeleteImage = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该镜像吗？',
      onOk: async () => {
        try {
          await axios.delete(`/api/docker/images/${id}`);
          message.success('删除镜像成功');
          loadImages();
        } catch (error) {
          message.error('删除镜像失败');
        }
      }
    });
  };

  const handleCreateContainer = async (values: any) => {
    try {
      await axios.post('/api/docker/containers', values);
      message.success('创建容器成功');
      setCreateModalVisible(false);
      form.resetFields();
      loadContainers();
    } catch (error) {
      message.error('创建容器失败');
    }
  };

  return (
    <div>
      <Tabs defaultActiveKey="containers">
        <TabPane tab="容器管理" key="containers">
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              创建容器
            </Button>
          </div>
          <Table
            columns={containerColumns}
            dataSource={containers}
            loading={loading}
            rowKey="id"
          />
        </TabPane>
        <TabPane tab="镜像管理" key="images">
          <Table
            columns={imageColumns}
            dataSource={images}
            loading={loading}
            rowKey="id"
          />
        </TabPane>
      </Tabs>

      <Modal
        title="创建容器"
        visible={createModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setCreateModalVisible(false)}
      >
        <Form
          form={form}
          onFinish={handleCreateContainer}
          layout="vertical"
        >
          <Form.Item
            name="image"
            label="镜像"
            rules={[{ required: true }]}
          >
            <Select>
              {images.map(image => (
                <Select.Option key={image.id} value={`${image.repository}:${image.tag}`}>
                  {`${image.repository}:${image.tag}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="容器名称"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ports"
            label="端口映射"
            extra="格式：主机端口:容器端口，例如 8080:80"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DockerManager; 