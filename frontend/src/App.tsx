import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FileManager from './pages/FileManager';
import StorageManager from './pages/StorageManager';
import UserManager from './pages/UserManager';
import SystemSettings from './pages/SystemSettings';
import BackupManager from './pages/BackupManager';
import './App.css';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/files" element={<FileManager />} />
              <Route path="/storage" element={<StorageManager />} />
              <Route path="/users" element={<UserManager />} />
              <Route path="/settings" element={<SystemSettings />} />
              <Route path="/backup" element={<BackupManager />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App; 