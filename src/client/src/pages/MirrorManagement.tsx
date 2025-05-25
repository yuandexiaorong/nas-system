import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Typography, Select, Space, message } from 'antd';
import MirrorCard from '../components/MirrorCard';
import { Mirror } from '../types/mirror';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const API_BASE_URL = 'http://localhost:3001';

const MirrorManagement: React.FC = () => {
  const [mirrors, setMirrors] = useState<Mirror[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const fetchMirrors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/mirrors` + (selectedType !== 'all' ? `?type=${selectedType}` : ''));
      if (!response.ok) {
        throw new Error('获取镜像列表失败');
      }
      const data = await response.json();
      setMirrors(data);
    } catch (error) {
      console.error('获取镜像列表失败:', error);
      message.error('获取镜像列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMirrors();
  }, [selectedType]);

  const handleMirrorUpdate = async (updatedMirror: Mirror) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mirrors/${updatedMirror.type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMirror),
      });

      if (!response.ok) {
        throw new Error('更新失败');
      }

      const data = await response.json();
      setMirrors(mirrors.map(mirror => 
        mirror.type === updatedMirror.type ? data : mirror
      ));
      message.success('更新成功');
    } catch (error) {
      console.error('更新失败:', error);
      message.error('更新失败');
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