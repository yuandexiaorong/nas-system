import express from 'express';
import { DockerManager } from '../utils/dockerManager';

const router = express.Router();
const docker = DockerManager.getInstance();

// 获取容器列表
router.get('/containers', async (req, res) => {
  try {
    const { all } = req.query;
    const containers = await docker.listContainers(all === 'true');
    res.json(containers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取镜像列表
router.get('/images', async (req, res) => {
  try {
    const images = await docker.listImages();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动容器
router.post('/containers/:id/start', async (req, res) => {
  try {
    await docker.startContainer(req.params.id);
    res.json({ message: '容器启动成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 停止容器
router.post('/containers/:id/stop', async (req, res) => {
  try {
    await docker.stopContainer(req.params.id);
    res.json({ message: '容器停止成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除容器
router.delete('/containers/:id', async (req, res) => {
  try {
    const { force } = req.query;
    await docker.removeContainer(req.params.id, force === 'true');
    res.json({ message: '容器删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 拉取镜像
router.post('/images/pull', async (req, res) => {
  try {
    const { image } = req.body;
    await docker.pullImage(image);
    res.json({ message: '镜像拉取成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除镜像
router.delete('/images/:id', async (req, res) => {
  try {
    const { force } = req.query;
    await docker.removeImage(req.params.id, force === 'true');
    res.json({ message: '镜像删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建容器
router.post('/containers', async (req, res) => {
  try {
    const containerId = await docker.createContainer(req.body);
    res.json({ id: containerId, message: '容器创建成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取容器日志
router.get('/containers/:id/logs', async (req, res) => {
  try {
    const { tail } = req.query;
    const logs = await docker.getContainerLogs(req.params.id, parseInt(tail as string) || 100);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取容器统计信息
router.get('/containers/:id/stats', async (req, res) => {
  try {
    const stats = await docker.getContainerStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取Docker系统信息
router.get('/system/info', async (req, res) => {
  try {
    const info = await docker.getSystemInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 