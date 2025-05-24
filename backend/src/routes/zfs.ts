import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { asyncHandler } from '../middleware/asyncHandler';
import { logger } from '../utils/logger';
import { ArchitectureManager } from '../utils/architecture';

const execAsync = promisify(exec);
const router = Router();
const archManager = ArchitectureManager.getInstance();

// 获取系统架构信息
router.get('/architecture', asyncHandler(async (req, res) => {
  try {
    const arch = archManager.getArchitecture();
    const isArm = archManager.isArmArchitecture();
    const isX86 = archManager.isX86Architecture();
    const hwAccel = await archManager.getHardwareAcceleration();
    const tuningParams = await archManager.getZfsTuningParameters();

    res.json({
      architecture: arch,
      isArm,
      isX86,
      hardwareAcceleration: hwAccel,
      optimizedParameters: tuningParams
    });
  } catch (error) {
    logger.error('Error getting architecture info:', error);
    res.status(500).json({ error: '获取系统架构信息失败' });
  }
}));

// 获取所有ZFS池信息
router.get('/pools', asyncHandler(async (req, res) => {
  try {
    const { stdout } = await execAsync('zpool list -H -o name,size,allocated,free,capacity,health,dedup,fragmentation');
    const pools = stdout.trim().split('\n').map(line => {
      const [name, size, allocated, free, capacity, health, dedup, fragmentation] = line.split('\t');
      return { name, size, allocated, free, capacity, health, dedup, fragmentation };
    });
    res.json(pools);
  } catch (error) {
    logger.error('Error getting ZFS pools:', error);
    res.status(500).json({ error: '获取ZFS池信息失败' });
  }
}));

// 获取ZFS池详细信息
router.get('/pools/:name', asyncHandler(async (req, res) => {
  const { name } = req.params;
  try {
    const [statusRes, propertiesRes] = await Promise.all([
      execAsync(`zpool status ${name}`),
      execAsync(`zpool get all ${name}`)
    ]);
    res.json({
      status: statusRes.stdout,
      properties: propertiesRes.stdout
    });
  } catch (error) {
    logger.error('Error getting pool details:', error);
    res.status(500).json({ error: '获取池详细信息失败' });
  }
}));

// 创建ZFS池
router.post('/pools', asyncHandler(async (req, res) => {
  const { name, type, devices, options = [] } = req.body;
  try {
    const tuningParams = await archManager.getZfsTuningParameters();
    const optimizedOptions = [
      ...options,
      ...Object.entries(tuningParams).map(([key, value]) => `-o ${key}=${value}`)
    ];
    
    const command = ['zpool', 'create', ...optimizedOptions, name, type, ...devices].join(' ');
    await execAsync(command);
    res.json({ message: 'ZFS池创建成功' });
  } catch (error) {
    logger.error('Error creating ZFS pool:', error);
    res.status(500).json({ error: '创建ZFS池失败' });
  }
}));

// 获取所有数据集
router.get('/datasets', asyncHandler(async (req, res) => {
  try {
    const { stdout } = await execAsync('zfs list -H -o name,used,avail,refer,mountpoint,compression,quota');
    const datasets = stdout.trim().split('\n').map(line => {
      const [name, used, avail, refer, mountpoint, compression, quota] = line.split('\t');
      return { name, used, avail, refer, mountpoint, compression, quota };
    });
    res.json(datasets);
  } catch (error) {
    logger.error('Error getting datasets:', error);
    res.status(500).json({ error: '获取数据集列表失败' });
  }
}));

// 创建数据集
router.post('/datasets', asyncHandler(async (req, res) => {
  const { name, options = {} } = req.body;
  try {
    const tuningParams = await archManager.getZfsTuningParameters();
    const optimizedOptions = {
      ...tuningParams,
      ...options
    };
    
    const optionsStr = Object.entries(optimizedOptions)
      .map(([key, value]) => `-o ${key}=${value}`)
      .join(' ');
      
    await execAsync(`zfs create ${optionsStr} ${name}`);
    res.json({ message: '数据集创建成功' });
  } catch (error) {
    logger.error('Error creating dataset:', error);
    res.status(500).json({ error: '创建数据集失败' });
  }
}));

// 创建快照
router.post('/snapshots', asyncHandler(async (req, res) => {
  const { dataset, name } = req.body;
  try {
    await execAsync(`zfs snapshot ${dataset}@${name}`);
    res.json({ message: '快照创建成功' });
  } catch (error) {
    logger.error('Error creating snapshot:', error);
    res.status(500).json({ error: '创建快照失败' });
  }
}));

// 获取快照列表
router.get('/snapshots/:dataset', asyncHandler(async (req, res) => {
  const { dataset } = req.params;
  try {
    const { stdout } = await execAsync(`zfs list -H -t snapshot -o name,creation,used -r ${dataset}`);
    const snapshots = stdout.trim().split('\n').map(line => {
      const [name, creation, used] = line.split('\t');
      return { name, creation, used };
    });
    res.json(snapshots);
  } catch (error) {
    logger.error('Error listing snapshots:', error);
    res.status(500).json({ error: '获取快照列表失败' });
  }
}));

// 回滚快照
router.post('/snapshots/rollback', asyncHandler(async (req, res) => {
  const { snapshot } = req.body;
  try {
    await execAsync(`zfs rollback -r ${snapshot}`);
    res.json({ message: '快照回滚成功' });
  } catch (error) {
    logger.error('Error rolling back snapshot:', error);
    res.status(500).json({ error: '快照回滚失败' });
  }
}));

// 克隆快照
router.post('/snapshots/clone', asyncHandler(async (req, res) => {
  const { snapshot, target } = req.body;
  try {
    await execAsync(`zfs clone ${snapshot} ${target}`);
    res.json({ message: '快照克隆成功' });
  } catch (error) {
    logger.error('Error cloning snapshot:', error);
    res.status(500).json({ error: '快照克隆失败' });
  }
}));

// 设置ZFS属性
router.post('/properties', asyncHandler(async (req, res) => {
  const { target, property, value } = req.body;
  try {
    await execAsync(`zfs set ${property}=${value} ${target}`);
    res.json({ message: '属性设置成功' });
  } catch (error) {
    logger.error('Error setting property:', error);
    res.status(500).json({ error: '设置属性失败' });
  }
}));

// 执行ZFS清理
router.post('/scrub/:pool', asyncHandler(async (req, res) => {
  const { pool } = req.params;
  try {
    await execAsync(`zpool scrub ${pool}`);
    res.json({ message: '开始执行清理' });
  } catch (error) {
    logger.error('Error starting scrub:', error);
    res.status(500).json({ error: '启动清理失败' });
  }
}));

// 获取清理状态
router.get('/scrub/:pool', asyncHandler(async (req, res) => {
  const { pool } = req.params;
  try {
    const { stdout } = await execAsync(`zpool status ${pool}`);
    res.json({ status: stdout });
  } catch (error) {
    logger.error('Error getting scrub status:', error);
    res.status(500).json({ error: '获取清理状态失败' });
  }
}));

// 发送ZFS数据流
router.post('/send', asyncHandler(async (req, res) => {
  const { source, target, incremental } = req.body;
  try {
    let command = 'zfs send';
    if (incremental) {
      command += ` -i ${incremental}`;
    }
    command += ` ${source} | zfs receive ${target}`;
    await execAsync(command);
    res.json({ message: '数据发送成功' });
  } catch (error) {
    logger.error('Error sending ZFS stream:', error);
    res.status(500).json({ error: '发送数据失败' });
  }
}));

export const zfsRouter = router; 