import React from 'react';
import { Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitch: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <Switch
        checked={isDarkMode}
        onChange={toggleTheme}
        checkedChildren={<BulbFilled />}
        unCheckedChildren={<BulbOutlined />}
      />
    </div>
  );
};

export default ThemeSwitch; 