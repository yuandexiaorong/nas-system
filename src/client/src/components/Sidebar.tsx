import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FolderOutlined,
  CloudServerOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘'
    },
    {
      key: '/files',
      icon: <FolderOutlined />,
      label: '文件管理'
    },
    {
      key: '/docker',
      icon: <CloudServerOutlined />,
      label: 'Docker管理'
    },
    {
      key: '/mirrors',
      icon: <CloudDownloadOutlined />,
      label: '镜像源管理'
    }
  ];

  return (
    <Sider
      theme="light"
      breakpoint="lg"
      collapsedWidth="0"
    >
      <div style={{ height: 32, margin: 16, background: 'rgba(0, 0, 0, 0.2)' }} />
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar; 