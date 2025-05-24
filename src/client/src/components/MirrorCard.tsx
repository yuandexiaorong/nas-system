import React from 'react';
import { Card, Button, Input, Switch, Space, message } from 'antd';
import { EditOutlined, SaveOutlined, SyncOutlined } from '@ant-design/icons';

interface Mirror {
  name: string;
  type: string;
  url: string;
  isActive: boolean;
  speed?: number;
}

interface MirrorCardProps {
  mirror: Mirror;
  onUpdate: (mirror: Mirror) => Promise<void>;
}

const MirrorCard: React.FC<MirrorCardProps> = ({ mirror, onUpdate }) => {
  const [editing, setEditing] = React.useState(false);
  const [url, setUrl] = React.useState(mirror.url);
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onUpdate({ ...mirror, url });
      setEditing(false);
      message.success('镜像配置已更新');
    } catch (error) {
      message.error('更新失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setLoading(true);
      // TODO: 实现镜像测速
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('测速完成：50ms');
    } catch (error) {
      message.error('测速失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={mirror.name}
      extra={
        <Space>
          <Switch
            checkedChildren="启用"
            unCheckedChildren="禁用"
            checked={mirror.isActive}
            onChange={checked => onUpdate({ ...mirror, isActive: checked })}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => setEditing(!editing)}
            type={editing ? 'primary' : 'default'}
          />
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {editing ? (
          <Input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="请输入镜像地址"
            addonAfter={
              <Button
                type="link"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={loading}
              >
                保存
              </Button>
            }
          />
        ) : (
          <div>当前地址：{mirror.url}</div>
        )}
        <div>
          类型：{mirror.type}
          {mirror.speed && <span style={{ marginLeft: 8 }}>速度：{mirror.speed}ms</span>}
        </div>
        <Button
          icon={<SyncOutlined />}
          onClick={handleTest}
          loading={loading}
        >
          测试速度
        </Button>
      </Space>
    </Card>
  );
};

export default MirrorCard; 