import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Progress,
  Tabs,
} from 'antd';
import {
  HddOutlined,
  PlusOutlined,
  SyncOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { formatBytes } from '../utils/format';

const { TabPane } = Tabs;
const { Option } = Select;

interface StoragePool {
  name: string;
  size: string;
  allocated: string;
  free: string;
  capacity: string;
  health: string;
}

interface RaidStatus {
  status: string;
  level: string;
  devices: string[];
  state: string;
}

const StorageManager: React.FC = () => {
  const [pools, setPools] = useState<StoragePool[]>([]);
  const [raidStatus, setRaidStatus] = useState<RaidStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [createPoolModal, setCreatePoolModal] = useState(false);
  const [createRaidModal, setCreateRaidModal] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poolsRes, raidRes] = await Promise.all([
        axios.get('/api/storage/pools'),
        axios.get('/api/storage/raid/status'),
      ]);
      setPools(poolsRes.data);
      setRaidStatus(raidRes.data);
    } catch (error) {
      message.error('获取存储信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePool = async (values: any) => {
    try {
      await axios.post('/api/storage/pools', values);
      message.success('存储池创建成功');
      fetchData();
      setCreatePoolModal(false);
      form.resetFields();
    } catch (error) {
      message.error('创建存储池失败');
    }
  };

  const handleCreateRaid = async (values: any) => {
    try {
      await axios.post('/api/storage/raid/create', values);
      message.success('RAID阵列创建成功');
      fetchData();
      setCreateRaidModal(false);
      form.resetFields();
    } catch (error) {
      message.error('创建RAID阵列失败');
    }
  };

  const poolColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '总容量',
      dataIndex: 'size',
      key: 'size',
      render: (text: string) => formatBytes(parseInt(text)),
    },
    {
      title: '已用空间',
      dataIndex: 'allocated',
      key: 'allocated',
      render: (text: string, record: StoragePool) => (
        <Progress
          percent={parseInt(record.capacity)}
          status={parseInt(record.capacity) > 80 ? 'exception' : 'normal'}
        />
      ),
    },
    {
      title: '可用空间',
      dataIndex: 'free',
      key: 'free',
      render: (text: string) => formatBytes(parseInt(text)),
    },
    {
      title: '状态',
      dataIndex: 'health',
      key: 'health',
      render: (text: string) => (
        <Space>
          {text === 'ONLINE' ? (
            <span style={{ color: '#52c41a' }}>正常</span>
          ) : (
            <span style={{ color: '#f5222d' }}>异常</span>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <HddOutlined />
              存储池管理
            </span>
          }
          key="1"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreatePoolModal(true)}
              >
                创建存储池
              </Button>
              <Button icon={<SyncOutlined />} onClick={fetchData}>
                刷新
              </Button>
            </Space>

            <Table
              columns={poolColumns}
              dataSource={pools}
              loading={loading}
              rowKey="name"
            />
          </Space>
        </TabPane>

        <TabPane
          tab={
            <span>
              <WarningOutlined />
              RAID管理
            </span>
          }
          key="2"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateRaidModal(true)}
            >
              创建RAID阵列
            </Button>

            <Card title="RAID状态" loading={loading}>
              {raidStatus && (
                <>
                  <p>RAID级别: {raidStatus.level}</p>
                  <p>状态: {raidStatus.state}</p>
                  <p>磁盘: {raidStatus.devices.join(', ')}</p>
                </>
              )}
            </Card>
          </Space>
        </TabPane>
      </Tabs>

      <Modal
        title="创建存储池"
        open={createPoolModal}
        onOk={() => form.submit()}
        onCancel={() => {
          setCreatePoolModal(false);
          form.resetFields();
        }}
      >
        <Form form={form} onFinish={handleCreatePool}>
          <Form.Item
            name="name"
            label="存储池名称"
            rules={[{ required: true, message: '请输入存储池名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="devices"
            label="选择设备"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select mode="multiple" placeholder="选择要添加的设备">
              <Option value="/dev/sda">/dev/sda</Option>
              <Option value="/dev/sdb">/dev/sdb</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="raidLevel"
            label="RAID级别"
            rules={[{ required: true, message: '请选择RAID级别' }]}
          >
            <Select>
              <Option value="mirror">RAID1 (镜像)</Option>
              <Option value="raidz">RAID5</Option>
              <Option value="raidz2">RAID6</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="创建RAID阵列"
        open={createRaidModal}
        onOk={() => form.submit()}
        onCancel={() => {
          setCreateRaidModal(false);
          form.resetFields();
        }}
      >
        <Form form={form} onFinish={handleCreateRaid}>
          <Form.Item
            name="devices"
            label="选择设备"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select mode="multiple" placeholder="选择要添加的设备">
              <Option value="/dev/sda">/dev/sda</Option>
              <Option value="/dev/sdb">/dev/sdb</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="level"
            label="RAID级别"
            rules={[{ required: true, message: '请选择RAID级别' }]}
          >
            <Select>
              <Option value="1">RAID1 (镜像)</Option>
              <Option value="5">RAID5</Option>
              <Option value="6">RAID6</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StorageManager; 