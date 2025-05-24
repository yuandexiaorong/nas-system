import { Router } from 'express';
import * as si from 'systeminformation';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// 获取系统基本信息
router.get('/system', asyncHandler(async (req, res) => {
  const data = {
    cpu: await si.cpu(),
    mem: await si.mem(),
    os: await si.osInfo(),
    system: await si.system(),
    time: await si.time()
  };
  res.json(data);
}));

// 获取CPU使用情况
router.get('/cpu', asyncHandler(async (req, res) => {
  const data = {
    currentLoad: await si.currentLoad(),
    temperature: await si.cpuTemperature()
  };
  res.json(data);
}));

// 获取内存使用情况
router.get('/memory', asyncHandler(async (req, res) => {
  const data = await si.mem();
  res.json(data);
}));

// 获取磁盘信息
router.get('/disks', asyncHandler(async (req, res) => {
  const data = {
    diskLayout: await si.diskLayout(),
    fsSize: await si.fsSize(),
    blockDevices: await si.blockDevices()
  };
  res.json(data);
}));

// 获取网络信息
router.get('/network', asyncHandler(async (req, res) => {
  const data = {
    interfaces: await si.networkInterfaces(),
    stats: await si.networkStats(),
    connections: await si.networkConnections()
  };
  res.json(data);
}));

// 获取进程信息
router.get('/processes', asyncHandler(async (req, res) => {
  const data = await si.processes();
  res.json(data);
}));

// 获取SMART状态
router.get('/smart/:device', asyncHandler(async (req, res) => {
  try {
    const data = await si.smartctlInfo(req.params.device);
    res.json(data);
  } catch (error) {
    logger.error('Error getting SMART info:', error);
    res.status(500).json({ error: 'Failed to get SMART information' });
  }
}));

export const monitoringRouter = router; 