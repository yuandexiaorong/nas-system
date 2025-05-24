import React from 'react';
import { Layout } from 'antd';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FileManager from './pages/FileManager';
import DockerManager from './pages/DockerManager';
import MirrorManager from './pages/MirrorManager';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/files" element={<FileManager />} />
            <Route path="/docker" element={<DockerManager />} />
            <Route path="/mirrors" element={<MirrorManager />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App; 