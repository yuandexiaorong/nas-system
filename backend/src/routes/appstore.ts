import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { asyncHandler } from '../middleware/asyncHandler';
import { logger } from '../utils/logger';
import { defaultApplications, Application } from '../models/Application';
import { ArchitectureManager } from '../utils/architecture';

const execAsync = promisify(exec);
const router = Router();
const archManager = ArchitectureManager.getInstance();

// 获取应用列表
router.get('/apps', asyncHandler(async (req, res) => {
  const { category, architecture } = req.query;
  let apps = [...defaultApplications];

  // 根据类别筛选
  if (category) {
    apps = apps.filter(app => app.category === category);
  }

  // 根据架构筛选
  if (architecture) {
    apps = apps.filter(app => app.architecture.includes(architecture as string));
  }

  // 获取已安装的应用
  const { stdout } = await execAsync('docker ps --format "{{.Names}}"');
  const runningContainers = stdout.split('\n').filter(Boolean);

  // 标记已安装的应用
  apps = apps.map(app => ({
    ...app,
    installed: runningContainers.includes(app.id)
  }));

  res.json(apps);
}));

// 获取应用类别
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = [...new Set(defaultApplications.map(app => app.category))];
  res.json(categories);
}));

// 获取应用详情
router.get('/apps/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const app = defaultApplications.find(app => app.id === id);
  
  if (!app) {
    return res.status(404).json({ error: '应用不存在' });
  }

  // 获取容器状态
  try {
    const { stdout } = await execAsync(`docker ps -a --filter "name=^${id}$" --format "{{.Status}}"`);
    const status = stdout.trim();
    res.json({
      ...app,
      status: status || 'not installed'
    });
  } catch (error) {
    res.json({
      ...app,
      status: 'unknown'
    });
  }
}));

// 安装应用
router.post('/apps/:id/install', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const app = defaultApplications.find(app => app.id === id);
  
  if (!app) {
    return res.status(404).json({ error: '应用不存在' });
  }

  // 检查架构兼容性
  const currentArch = archManager.getArchitecture();
  if (!app.architecture.some(arch => currentArch.includes(arch))) {
    return res.status(400).json({ error: '当前系统架构不支持此应用' });
  }

  // 创建应用目录
  const appPath = join('/apps', app.id);
  await mkdir(appPath, { recursive: true });

  // 写入docker-compose配置
  const composePath = join(appPath, 'docker-compose.yml');
  await writeFile(composePath, app.dockerCompose);

  try {
    // 拉取镜像
    await execAsync(`cd ${appPath} && docker-compose pull`);
    
    // 启动容器
    await execAsync(`cd ${appPath} && docker-compose up -d`);
    
    res.json({ message: '应用安装成功' });
  } catch (error) {
    logger.error('安装应用失败:', error);
    res.status(500).json({ error: '安装应用失败' });
  }
}));

// 卸载应用
router.post('/apps/:id/uninstall', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const app = defaultApplications.find(app => app.id === id);
  
  if (!app) {
    return res.status(404).json({ error: '应用不存在' });
  }

  try {
    const appPath = join('/apps', app.id);
    
    // 停止并删除容器
    await execAsync(`cd ${appPath} && docker-compose down -v`);
    
    res.json({ message: '应用卸载成功' });
  } catch (error) {
    logger.error('卸载应用失败:', error);
    res.status(500).json({ error: '卸载应用失败' });
  }
}));

// 启动应用
router.post('/apps/:id/start', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appPath = join('/apps', id);
  
  try {
    await execAsync(`cd ${appPath} && docker-compose start`);
    res.json({ message: '应用启动成功' });
  } catch (error) {
    logger.error('启动应用失败:', error);
    res.status(500).json({ error: '启动应用失败' });
  }
}));

// 停止应用
router.post('/apps/:id/stop', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appPath = join('/apps', id);
  
  try {
    await execAsync(`cd ${appPath} && docker-compose stop`);
    res.json({ message: '应用停止成功' });
  } catch (error) {
    logger.error('停止应用失败:', error);
    res.status(500).json({ error: '停止应用失败' });
  }
}));

// 获取应用日志
router.get('/apps/:id/logs', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appPath = join('/apps', id);
  
  try {
    const { stdout } = await execAsync(`cd ${appPath} && docker-compose logs --tail=100`);
    res.json({ logs: stdout });
  } catch (error) {
    logger.error('获取应用日志失败:', error);
    res.status(500).json({ error: '获取应用日志失败' });
  }
}));

export const appstoreRouter = router; 