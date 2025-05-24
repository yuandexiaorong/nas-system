import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Progress, Statistic } from 'antd';
import { Area } from '@ant-design/plots';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

interface SystemInfo {
  cpu: {
    usage: number;
    temperature: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
  network: {
    upload: number;
    download: number;
  };
}

const Dashboard: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cpuHistory, setCpuHistory] = useState<{ time: string; usage: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [systemRes, cpuRes] = await Promise.all([
          axios.get('/api/monitoring/system'),
          axios.get('/api/monitoring/cpu')
        ]);

        setSystemInfo(systemRes.data);
        const currentTime = new Date().toLocaleTimeString();
        setCpuHistory(prev => [...prev, { time: currentTime, usage: cpuRes.data.currentLoad.currentLoad }].slice(-20));
      } catch (error) {
        console.error('Error fetching system info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingOutlined style={{ fontSize: 24 }} spin />;
  }

  return (
    <div>
      <h2>系统监控</h2>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card title="CPU使用率">
            <Progress
              type="dashboard"
              percent={systemInfo?.cpu.usage}
              status={systemInfo?.cpu.usage > 80 ? 'exception' : 'normal'}
            />
            <Statistic
              title="温度"
              value={systemInfo?.cpu.temperature}
              suffix="°C"
              precision={1}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="内存使用">
            <Progress
              type="dashboard"
              percent={((systemInfo?.memory.used || 0) / (systemInfo?.memory.total || 1)) * 100}
            />
            <Statistic
              title="可用内存"
              value={systemInfo?.memory.free}
              suffix="GB"
              precision={1}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="存储空间">
            <Progress
              type="dashboard"
              percent={((systemInfo?.disk.used || 0) / (systemInfo?.disk.total || 1)) * 100}
            />
            <Statistic
              title="可用空间"
              value={systemInfo?.disk.free}
              suffix="GB"
              precision={1}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="网络流量">
            <Statistic
              title="上传"
              value={systemInfo?.network.upload}
              suffix="MB/s"
              precision={2}
            />
            <Statistic
              title="下载"
              value={systemInfo?.network.download}
              suffix="MB/s"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Card title="CPU使用率历史" style={{ marginTop: 16 }}>
        <Area
          data={cpuHistory}
          xField="time"
          yField="usage"
          smooth
          animation={{
            appear: {
              animation: 'wave-in',
              duration: 1000,
            },
          }}
        />
      </Card>
    </div>
  );
};

export default Dashboard; 