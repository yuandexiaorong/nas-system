import express from 'express';
import os from 'os';
import si from 'systeminformation';

const router = express.Router();

// 获取系统信息
router.get('/', async (req, res) => {
  try {
    // CPU
    const cpu = await si.cpu();
    const cpuLoad = await si.currentLoad();
    // 内存
    const mem = await si.mem();
    const memLayout = await si.memLayout();
    const physicalTotal = memLayout.reduce((sum, item) => sum + (item.size || 0), 0);

    // 磁盘
    let disks: any[] = [];
    try {
      disks = await si.fsSize();
    } catch (e) {
      disks = [];
    }

    // 网络
    let net: any[] = [];
    try {
      net = await si.networkStats();
    } catch (e) {
      net = [];
    }

    // 温度
    let temp: { main: number | null } = { main: null };
    try {
      const t = await si.cpuTemperature();
      temp = { main: typeof t.main === 'number' ? t.main : null };
    } catch (e) {
      temp = { main: null };
    }

    res.json({
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        speed: cpu.speed,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        load: cpuLoad.currentLoad
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
        active: mem.active,
        physicalTotal
      },
      disks,
      network: net,
      temperature: temp.main && temp.main > 0 ? temp.main : null
    });
  } catch (err) {
    console.error('系统信息接口报错:', err);
    res.status(500).json({ message: '获取系统信息失败', error: String(err) });
  }
});

export const systemRouter = router; 