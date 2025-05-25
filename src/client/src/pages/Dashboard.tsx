import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import {
  HddOutlined,
  CloudServerOutlined,
  CloudDownloadOutlined,
  FileOutlined,
  DashboardOutlined
} from '@ant-design/icons';

interface SystemInfo {
  cpu: {
    manufacturer: string;
    brand: string;
    speed: string;
    cores: number;
    physicalCores: number;
    load: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    active: number;
    physicalTotal?: number;
  };
  disks: any[];
  network: any[];
  temperature: number | null;
}

const Dashboard: React.FC = () => {
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/system', { headers: { 'Cache-Control': 'no-cache' } })
      .then(res => res.json())
      .then(data => {
        setSystem(data);
        setLoading(false);
      })
      .catch(() => {
        message.error('获取系统信息失败');
        setLoading(false);
      });
  }, []);

  if (loading) return <Spin />;

  // 内存总量优先用physicalTotal
  const memTotal = system?.memory.physicalTotal || system?.memory.total || 0;
  const memUsed = system?.memory.used || 0;

  // 所有磁盘使用率加权平均
  let diskUsage = 0;
  if (system?.disks && system.disks.length > 0) {
    const totalSize = system.disks.reduce((sum, d) => sum + d.size, 0);
    const totalUsed = system.disks.reduce((sum, d) => sum + d.used, 0);
    diskUsage = totalSize > 0 ? (totalUsed / totalSize) * 100 : 0;
  }

  return (
    <div>
      <h2>系统概览</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="CPU负载"
              value={system?.cpu.load?.toFixed(2)}
              suffix="%"
              prefix={<DashboardOutlined />}
            />
            <div style={{fontSize:12}}>{system?.cpu.brand} ({system?.cpu.cores}核)</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="内存使用"
              value={memTotal ? ((memUsed / memTotal) * 100).toFixed(2) : 0}
              suffix="%"
              prefix={<CloudServerOutlined />}
            />
            <div style={{fontSize:12}}>
              {(memUsed / 1024 / 1024 / 1024).toFixed(2)}GB / {(memTotal / 1024 / 1024 / 1024).toFixed(2)}GB
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="磁盘使用"
              value={diskUsage.toFixed(2)}
              suffix="%"
              prefix={<HddOutlined />}
            />
            <div style={{fontSize:12}}>
              {system?.disks && system.disks.length > 0
                ? system.disks.map((disk, idx) => (
                    <div key={idx}>
                      {disk.fs}: {(disk.used / 1024 / 1024 / 1024).toFixed(2)}GB / {(disk.size / 1024 / 1024 / 1024).toFixed(2)}GB
                    </div>
                  ))
                : ''}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="CPU温度"
              value={system && system.temperature !== null ? system.temperature : '-'}
              suffix="℃"
              prefix={<CloudDownloadOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 