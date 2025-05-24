import React from 'react';
import { Layout, Row, Col, Typography, Select, Space } from 'antd';
import MirrorCard from '../components/MirrorCard';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const MirrorManagement: React.FC = () => {
  const [mirrors, setMirrors] = React.useState([]);
  const [selectedType, setSelectedType] = React.useState<string>('all');
  const [loading, setLoading] = React.useState(false);

  const fetchMirrors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mirrors' + (selectedType !== 'all' ? `?type=${selectedType}` : ''));
      const data = await response.json();
      setMirrors(data);
    } catch (error) {
      console.error('获取镜像列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMirrors();
  }, [selectedType]);

  const handleMirrorUpdate = async (updatedMirror) => {
    try {
      const response = await fetch(`/api/mirrors/${updatedMirror.type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: updatedMirror.url }),
      });
      
      if (!response.ok) {
        throw new Error('更新失败');
      }

      await fetchMirrors();
    } catch (error) {
      throw error;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <Row justify="space-between" align="middle" style={{ height: '100%' }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>镜像源管理</Title>
          </Col>
          <Col>
            <Space>
              <span>镜像类型：</span>
              <Select
                value={selectedType}
                onChange={setSelectedType}
                style={{ width: 120 }}
              >
                <Option value="all">全部</Option>
                <Option value="npm">NPM</Option>
                <Option value="docker">Docker</Option>
                <Option value="pip">PIP</Option>
                <Option value="apt">APT</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Row gutter={[16, 16]}>
          {mirrors.map((mirror) => (
            <Col key={mirror.type} xs={24} sm={12} lg={8}>
              <MirrorCard
                mirror={mirror}
                onUpdate={handleMirrorUpdate}
              />
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default MirrorManagement; 