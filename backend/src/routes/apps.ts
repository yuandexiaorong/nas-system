import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { asyncHandler } from '../middleware/asyncHandler';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);
const router = Router();

// 获取可用应用列表
router.get('/available', asyncHandler(async (req, res) => {
  try {
    const apps = [
      {
        id: 'plex',
        name: 'Plex Media Server',
        description: '媒体服务器',
        version: 'latest',
        category: 'multimedia'
      },
      {
        id: 'nextcloud',
        name: 'Nextcloud',
        description: '私有云存储',
        version: 'latest',
        category: 'storage'
      },
      {
        id: 'jellyfin',
        name: 'Jellyfin',
        description: '开源媒体系统',
        version: 'latest',
        category: 'multimedia'
      }
    ];
    res.json(apps);
  } catch (error) {
    logger.error('Error getting available apps:', error);
    res.status(500).json({ error: '获取应用列表失败' });
  }
}));

// 获取已安装应用列表
router.get('/installed', asyncHandler(async (req, res) => {
  try {
    const { stdout } = await execAsync('docker ps --format "{{.Names}}"');
    const containers = stdout.split('\n').filter(Boolean);
    res.json(containers);
  } catch (error) {
    logger.error('Error getting installed apps:', error);
    res.status(500).json({ error: '获取已安装应用失败' });
  }
}));

// 安装应用
router.post('/install/:appId', asyncHandler(async (req, res) => {
  const { appId } = req.params;
  try {
    // 这里应该根据appId获取对应的docker-compose配置
    await execAsync(`docker-compose -f /opt/nas/apps/${appId}/docker-compose.yml up -d`);
    res.json({ message: '应用安装成功' });
  } catch (error) {
    logger.error('Error installing app:', error);
    res.status(500).json({ error: '应用安装失败' });
  }
}));

// 卸载应用
router.delete('/uninstall/:appId', asyncHandler(async (req, res) => {
  const { appId } = req.params;
  try {
    await execAsync(`docker-compose -f /opt/nas/apps/${appId}/docker-compose.yml down -v`);
    res.json({ message: '应用卸载成功' });
  } catch (error) {
    logger.error('Error uninstalling app:', error);
    res.status(500).json({ error: '应用卸载失败' });
  }
}));

// 更新应用
router.post('/update/:appId', asyncHandler(async (req, res) => {
  const { appId } = req.params;
  try {
    await execAsync(`docker-compose -f /opt/nas/apps/${appId}/docker-compose.yml pull`);
    await execAsync(`docker-compose -f /opt/nas/apps/${appId}/docker-compose.yml up -d`);
    res.json({ message: '应用更新成功' });
  } catch (error) {
    logger.error('Error updating app:', error);
    res.status(500).json({ error: '应用更新失败' });
  }
}));

export const appsRouter = router; 