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
  Tabs,
  Progress,
  Tag,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  SyncOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CameraOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { formatBytes } from '../utils/format';

const { TabPane } = Tabs;
const { Option } = Select;

interface ZFSPool {
  name: string;
  size: string;
  allocated: string;
  free: string;
  capacity: string;
  health: string;
  dedup: string;
  fragmentation: string;
}

interface ZFSDataset {
  name: string;
  used: string;
  avail: string;
  refer: string;
  mountpoint: string;
  compression: string;
  quota: string;
}

interface ZFSSnapshot {
  name: string;
  creation: string;
  used: string;
}

interface ArchitectureInfo {
  architecture: string;
  isArm: boolean;
  isX86: boolean;
  hardwareAcceleration: string[];
  optimizedParameters: Record<string, string>;
}

const ZFSManager: React.FC = () => {
  const [pools, setPools] = useState<ZFSPool[]>([]);
  const [datasets, setDatasets] = useState<ZFSDataset[]>([]);
  const [snapshots, setSnapshots] = useState<ZFSSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [createPoolModal, setCreatePoolModal] = useState(false);
  const [createDatasetModal, setCreateDatasetModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<string>('');
  const [form] = Form.useForm();
  const [archInfo, setArchInfo] = useState<ArchitectureInfo | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poolsRes, datasetsRes, archRes] = await Promise.all([
        axios.get('/api/zfs/pools'),
        axios.get('/api/zfs/datasets'),
        axios.get('/api/zfs/architecture')
      ]);
      setPools(poolsRes.data);
      setDatasets(datasetsRes.data);
      setArchInfo(archRes.data);
    } catch (error) {
      message.error('获取ZFS信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePool = async (values: any) => {
    try {
      await axios.post('/api/zfs/pools', values);
      message.success('ZFS池创建成功');
      fetchData();
      setCreatePoolModal(false);
      form.resetFields();
    } catch (error) {
      message.error('创建ZFS池失败');
    }
  };

  const handleCreateDataset = async (values: any) => {
    try {
      await axios.post('/api/zfs/datasets', values);
      message.success('数据集创建成功');
      fetchData();
      setCreateDatasetModal(false);
      form.resetFields();
    } catch (error) {
      message.error('创建数据集失败');
    }
  };

  const handleCreateSnapshot = async (dataset: string) => {
    try {
      const name = new Date().toISOString().replace(/[:.]/g, '-');
      await axios.post('/api/zfs/snapshots', {
        dataset,
        name
      });
      message.success('快照创建成功');
      fetchData();
    } catch (error) {
      message.error('创建快照失败');
    }
  };

  const handleScrub = async (pool: string) => {
    try {
      await axios.post(`/api/zfs/scrub/${pool}`);
      message.success('开始执行清理');
    } catch (error) {
      message.error('启动清理失败');
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
    },
    {
      title: '已用空间',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (text: string) => (
        <Progress
          percent={parseInt(text)}
          status={parseInt(text) > 80 ? 'exception' : 'normal'}
        />
      ),
    },
    {
      title: '可用空间',
      dataIndex: 'free',
      key: 'free',
    },
    {
      title: '状态',
      dataIndex: 'health',
      key: 'health',
      render: (text: string) => {
        const color = text === 'ONLINE' ? 'success' : 'error';
        const icon = text === 'ONLINE' ? <CheckCircleOutlined /> : <WarningOutlined />;
        return <Tag icon={icon} color={color}>{text}</Tag>;
      },
    },
    {
      title: '重复数据删除率',
      dataIndex: 'dedup',
      key: 'dedup',
    },
    {
      title: '碎片率',
      dataIndex: 'fragmentation',
      key: 'fragmentation',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: ZFSPool) => (
        <Space size="middle">
          <Tooltip title="创建快照">
            <Button
              type="link"
              icon={<CameraOutlined />}
              onClick={() => handleCreateSnapshot(record.name)}
            />
          </Tooltip>
          <Tooltip title="执行清理">
            <Button
              type="link"
              icon={<SyncOutlined />}
              onClick={() => handleScrub(record.name)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const datasetColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '已用空间',
      dataIndex: 'used',
      key: 'used',
    },
    {
      title: '可用空间',
      dataIndex: 'avail',
      key: 'avail',
    },
    {
      title: '引用空间',
      dataIndex: 'refer',
      key: 'refer',
    },
    {
      title: '挂载点',
      dataIndex: 'mountpoint',
      key: 'mountpoint',
    },
    {
      title: '压缩',
      dataIndex: 'compression',
      key: 'compression',
    },
    {
      title: '配额',
      dataIndex: 'quota',
      key: 'quota',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: ZFSDataset) => (
        <Space size="middle">
          <Tooltip title="创建快照">
            <Button
              type="link"
              icon={<CameraOutlined />}
              onClick={() => handleCreateSnapshot(record.name)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div>
            <strong>系统架构：</strong> {archInfo?.architecture || '未知'}
            {archInfo?.isArm && <Tag color="blue" style={{ marginLeft: 8 }}>ARM优化</Tag>}
            {archInfo?.isX86 && <Tag color="blue" style={{ marginLeft: 8 }}>x86优化</Tag>}
          </div>
          {archInfo?.hardwareAcceleration.length > 0 && (
            <div>
              <strong>硬件加速：</strong>
              {archInfo.hardwareAcceleration.map(feature => (
                <Tag color="green" key={feature} style={{ marginLeft: 8 }}>{feature}</Tag>
              ))}
            </div>
          )}
          <div>
            <strong>优化参数：</strong>
            {archInfo?.optimizedParameters && Object.entries(archInfo.optimizedParameters).map(([key, value]) => (
              <Tag color="purple" key={key} style={{ marginLeft: 8 }}>{key}: {value}</Tag>
            ))}
          </div>
        </Space>
      </Card>

      <Tabs defaultActiveKey="1">
        <TabPane tab="存储池" key="1">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreatePoolModal(true)}
                >
                  创建存储池
                </Button>
                <Button
                  icon={<SyncOutlined />}
                  onClick={fetchData}
                >
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
          </Card>
        </TabPane>

        <TabPane tab="数据集" key="2">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateDatasetModal(true)}
              >
                创建数据集
              </Button>

              <Table
                columns={datasetColumns}
                dataSource={datasets}
                loading={loading}
                rowKey="name"
              />
            </Space>
          </Card>
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
            label="池名称"
            rules={[{ required: true, message: '请输入存储池名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="RAID类型"
            rules={[{ required: true, message: '请选择RAID类型' }]}
          >
            <Select>
              <Option value="mirror">镜像 (RAID1)</Option>
              <Option value="raidz">RAIDZ (RAID5)</Option>
              <Option value="raidz2">RAIDZ2 (RAID6)</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="devices"
            label="选择设备"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select mode="multiple">
              <Option value="/dev/sda">/dev/sda</Option>
              <Option value="/dev/sdb">/dev/sdb</Option>
              <Option value="/dev/sdc">/dev/sdc</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="创建数据集"
        open={createDatasetModal}
        onOk={() => form.submit()}
        onCancel={() => {
          setCreateDatasetModal(false);
          form.resetFields();
        }}
      >
        <Form form={form} onFinish={handleCreateDataset}>
          <Form.Item
            name="name"
            label="数据集名称"
            rules={[{ required: true, message: '请输入数据集名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="options.compression"
            label="压缩算法"
          >
            <Select>
              <Option value="lz4">LZ4</Option>
              <Option value="gzip">GZIP</Option>
              <Option value="zstd">ZSTD</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="options.quota"
            label="配额"
          >
            <Input suffix="GB" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ZFSManager; 