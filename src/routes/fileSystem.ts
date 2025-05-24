import express from 'express';
import { FileSystemManager } from '../utils/fileSystem';

const router = express.Router();
const fileSystem = FileSystemManager.getInstance('/mnt/nas'); // 设置NAS的根目录

// 获取目录内容
router.get('/files/*', async (req, res) => {
  try {
    const dirPath = req.params[0] || '';
    const files = await fileSystem.listDirectory(dirPath);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建目录
router.post('/directory', async (req, res) => {
  try {
    const { path } = req.body;
    await fileSystem.createDirectory(path);
    res.json({ message: '目录创建成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除文件或目录
router.delete('/files/*', async (req, res) => {
  try {
    const path = req.params[0];
    const { recursive } = req.query;
    await fileSystem.delete(path, recursive === 'true');
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 移动/重命名文件或目录
router.post('/move', async (req, res) => {
  try {
    const { source, destination } = req.body;
    await fileSystem.move(source, destination);
    res.json({ message: '移动成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 复制文件或目录
router.post('/copy', async (req, res) => {
  try {
    const { source, destination } = req.body;
    await fileSystem.copy(source, destination);
    res.json({ message: '复制成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取磁盘信息
router.get('/disks', async (req, res) => {
  try {
    const disks = await fileSystem.getDiskInfo();
    res.json(disks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 修改权限
router.post('/permissions', async (req, res) => {
  try {
    const { path, mode } = req.body;
    await fileSystem.changePermissions(path, mode);
    res.json({ message: '权限修改成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 