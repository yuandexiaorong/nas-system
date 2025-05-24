import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { asyncHandler } from '../middleware/asyncHandler';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);
const router = Router();

// 获取RAID状态
router.get('/raid/status', asyncHandler(async (req, res) => {
  try {
    const { stdout } = await execAsync('mdadm --detail /dev/md0');
    res.json({ status: stdout });
  } catch (error) {
    logger.error('Error getting RAID status:', error);
    res.status(500).json({ error: 'Failed to get RAID status' });
  }
}));

// 创建RAID1阵列
router.post('/raid/create', asyncHandler(async (req, res) => {
  const { devices } = req.body;
  if (!Array.isArray(devices) || devices.length !== 2) {
    return res.status(400).json({ error: 'Invalid devices array' });
  }

  try {
    await execAsync(`mdadm --create /dev/md0 --level=1 --raid-devices=2 ${devices.join(' ')}`);
    res.json({ message: 'RAID1 array created successfully' });
  } catch (error) {
    logger.error('Error creating RAID array:', error);
    res.status(500).json({ error: 'Failed to create RAID array' });
  }
}));

// 获取存储池信息
router.get('/pools', asyncHandler(async (req, res) => {
  try {
    const { stdout } = await execAsync('zpool list -H -o name,size,allocated,free,capacity,health');
    const pools = stdout.trim().split('\n').map(line => {
      const [name, size, allocated, free, capacity, health] = line.split('\t');
      return { name, size, allocated, free, capacity, health };
    });
    res.json(pools);
  } catch (error) {
    logger.error('Error getting storage pools:', error);
    res.status(500).json({ error: 'Failed to get storage pools' });
  }
}));

// 创建ZFS存储池
router.post('/pools', asyncHandler(async (req, res) => {
  const { name, devices, raidLevel } = req.body;
  if (!name || !Array.isArray(devices) || !raidLevel) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    await execAsync(`zpool create ${name} ${raidLevel} ${devices.join(' ')}`);
    res.json({ message: 'Storage pool created successfully' });
  } catch (error) {
    logger.error('Error creating storage pool:', error);
    res.status(500).json({ error: 'Failed to create storage pool' });
  }
}));

// 创建ZFS数据集
router.post('/datasets', asyncHandler(async (req, res) => {
  const { pool, name, quota, compression } = req.body;
  if (!pool || !name) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    let command = `zfs create ${pool}/${name}`;
    if (quota) command += ` -o quota=${quota}`;
    if (compression) command += ` -o compression=${compression}`;
    
    await execAsync(command);
    res.json({ message: 'Dataset created successfully' });
  } catch (error) {
    logger.error('Error creating dataset:', error);
    res.status(500).json({ error: 'Failed to create dataset' });
  }
}));

// 获取快照列表
router.get('/snapshots/:dataset', asyncHandler(async (req, res) => {
  const { dataset } = req.params;
  try {
    const { stdout } = await execAsync(`zfs list -t snapshot -o name,creation,used -H ${dataset}`);
    const snapshots = stdout.trim().split('\n').map(line => {
      const [name, creation, used] = line.split('\t');
      return { name, creation, used };
    });
    res.json(snapshots);
  } catch (error) {
    logger.error('Error getting snapshots:', error);
    res.status(500).json({ error: 'Failed to get snapshots' });
  }
}));

// 创建快照
router.post('/snapshots', asyncHandler(async (req, res) => {
  const { dataset, name } = req.body;
  if (!dataset || !name) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    await execAsync(`zfs snapshot ${dataset}@${name}`);
    res.json({ message: 'Snapshot created successfully' });
  } catch (error) {
    logger.error('Error creating snapshot:', error);
    res.status(500).json({ error: 'Failed to create snapshot' });
  }
}));

export const storageRouter = router; 