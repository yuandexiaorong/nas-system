import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { 
  HddOutlined, 
  CloudServerOutlined, 
  CloudDownloadOutlined,
  FileOutlined 
} from '@ant-design/icons';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h2>系统概览</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="存储空间使用"
              value={68.2}
              suffix="%"
              prefix={<HddOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="运行容器数"
              value={12}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="镜像源数量"
              value={4}
              prefix={<CloudDownloadOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="文件总数"
              value={1234}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 