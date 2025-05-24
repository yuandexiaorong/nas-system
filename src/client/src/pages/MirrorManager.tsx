import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Select } from 'antd';
import axios from 'axios';

interface MirrorConfig {
  type: string;
  url: string;
}

const { Option } = Select;

const MirrorManager: React.FC = () => {
  const [mirrors, setMirrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const mirrorTypes = [
    { label: 'Docker镜像源', value: 'docker' },
    { label: 'NPM镜像源', value: 'npm' },
    { label: 'PIP镜像源', value: 'pip' },
    { label: 'APT镜像源', value: 'apt' }
  ];

  const loadMirrors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/mirrors');
      setMirrors(response.data);
    } catch (error) {
      message.error('加载镜像源配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMirrors();
  }, []);

  const handleSubmit = async (values: MirrorConfig) => {
    try {
      await axios.post(`/api/mirrors/${values.type}`, {
        url: values.url
      });
      message.success('镜像源配置更新成功');
      loadMirrors();
      form.resetFields();
    } catch (error) {
      message.error('镜像源配置更新失败');
    }
  };

  return (
    <div>
      <h2>镜像源管理</h2>
      <Card title="添加/更新镜像源" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="type"
            label="镜像类型"
            rules={[{ required: true, message: '请选择镜像类型' }]}
          >
            <Select>
              {mirrorTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="url"
            label="镜像地址"
            rules={[
              { required: true, message: '请输入镜像地址' },
              { type: 'url', message: '请输入有效的URL地址' }
            ]}
          >
            <Input placeholder="请输入镜像源地址" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="当前配置">
        {mirrorTypes.map(type => (
          <div key={type.value} style={{ marginBottom: 16 }}>
            <h3>{type.label}</h3>
            <p>{mirrors[type.value] || '未配置'}</p>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default MirrorManager; 