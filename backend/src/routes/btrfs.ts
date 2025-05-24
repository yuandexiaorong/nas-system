import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { asyncHandler } from '../middleware/asyncHandler';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);
const router = Router();

// 获取Btrfs文件系统信息
router.get('/info', asyncHandler(async (req, res) => {
  try {
    const { stdout } = await execAsync('btrfs filesystem show');
    res.json({ info: stdout });
  } catch (error) {
    logger.error('Error getting Btrfs info:', error);
    res.status(500).json({ error: '获取Btrfs信息失败' });
  }
}));

// 创建快照
router.post('/snapshot', asyncHandler(async (req, res) => {
  const { source, destination } = req.body;
  try {
    await execAsync(`btrfs subvolume snapshot ${source} ${destination}`);
    res.json({ message: '快照创建成功' });
  } catch (error) {
    logger.error('Error creating snapshot:', error);
    res.status(500).json({ error: '创建快照失败' });
  }
}));

// 列出快照
router.get('/snapshots', asyncHandler(async (req, res) => {
  const { path } = req.query;
  try {
    const { stdout } = await execAsync(`btrfs subvolume list ${path}`);
    const snapshots = stdout.split('\n')
      .filter(Boolean)
      .map(line => {
        const parts = line.split(' ');
        return {
          id: parts[1],
          path: parts[parts.length - 1]
        };
      });
    res.json(snapshots);
  } catch (error) {
    logger.error('Error listing snapshots:', error);
    res.status(500).json({ error: '获取快照列表失败' });
  }
}));

// 删除快照
router.delete('/snapshot/:id', asyncHandler(async (req, res) => {
  const { path } = req.query;
  try {
    await execAsync(`btrfs subvolume delete ${path}`);
    res.json({ message: '快照删除成功' });
  } catch (error) {
    logger.error('Error deleting snapshot:', error);
    res.status(500).json({ error: '删除快照失败' });
  }
}));

// 执行数据校验
router.post('/scrub/start', asyncHandler(async (req, res) => {
  const { path } = req.body;
  try {
    await execAsync(`btrfs scrub start ${path}`);
    res.json({ message: '数据校验开始' });
  } catch (error) {
    logger.error('Error starting scrub:', error);
    res.status(500).json({ error: '启动数据校验失败' });
  }
}));

// 获取数据校验状态
router.get('/scrub/status', asyncHandler(async (req, res) => {
  const { path } = req.query;
  try {
    const { stdout } = await execAsync(`btrfs scrub status ${path}`);
    res.json({ status: stdout });
  } catch (error) {
    logger.error('Error getting scrub status:', error);
    res.status(500).json({ error: '获取数据校验状态失败' });
  }
}));

// 执行数据平衡
router.post('/balance/start', asyncHandler(async (req, res) => {
  const { path } = req.body;
  try {
    await execAsync(`btrfs balance start ${path}`);
    res.json({ message: '数据平衡开始' });
  } catch (error) {
    logger.error('Error starting balance:', error);
    res.status(500).json({ error: '启动数据平衡失败' });
  }
}));

// 获取数据平衡状态
router.get('/balance/status', asyncHandler(async (req, res) => {
  const { path } = req.query;
  try {
    const { stdout } = await execAsync(`btrfs balance status ${path}`);
    res.json({ status: stdout });
  } catch (error) {
    logger.error('Error getting balance status:', error);
    res.status(500).json({ error: '获取数据平衡状态失败' });
  }
}));

export const btrfsRouter = router; 