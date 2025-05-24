import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { asyncHandler } from '../middleware/asyncHandler';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);
const router = Router();

// 获取VPN状态
router.get('/status', asyncHandler(async (req, res) => {
  try {
    const { stdout } = await execAsync('systemctl status openvpn@server');
    const isRunning = stdout.includes('active (running)');
    res.json({ status: isRunning ? 'running' : 'stopped' });
  } catch (error) {
    logger.error('Error getting VPN status:', error);
    res.status(500).json({ error: '获取VPN状态失败' });
  }
}));

// 生成客户端配置
router.post('/client/generate', asyncHandler(async (req, res) => {
  const { clientName } = req.body;
  try {
    await execAsync(`/opt/nas/scripts/generate-vpn-client.sh ${clientName}`);
    res.json({ message: '客户端配置生成成功' });
  } catch (error) {
    logger.error('Error generating client config:', error);
    res.status(500).json({ error: '生成客户端配置失败' });
  }
}));

// 吊销客户端证书
router.post('/client/revoke', asyncHandler(async (req, res) => {
  const { clientName } = req.body;
  try {
    await execAsync(`/opt/nas/scripts/revoke-vpn-client.sh ${clientName}`);
    res.json({ message: '客户端证书吊销成功' });
  } catch (error) {
    logger.error('Error revoking client cert:', error);
    res.status(500).json({ error: '吊销客户端证书失败' });
  }
}));

// 获取客户端列表
router.get('/clients', asyncHandler(async (req, res) => {
  try {
    const { stdout } = await execAsync('ls /etc/openvpn/client-configs/');
    const clients = stdout.split('\n').filter(name => name.endsWith('.ovpn'));
    res.json(clients);
  } catch (error) {
    logger.error('Error getting client list:', error);
    res.status(500).json({ error: '获取客户端列表失败' });
  }
}));

// 启动VPN服务
router.post('/start', asyncHandler(async (req, res) => {
  try {
    await execAsync('systemctl start openvpn@server');
    res.json({ message: 'VPN服务启动成功' });
  } catch (error) {
    logger.error('Error starting VPN service:', error);
    res.status(500).json({ error: 'VPN服务启动失败' });
  }
}));

// 停止VPN服务
router.post('/stop', asyncHandler(async (req, res) => {
  try {
    await execAsync('systemctl stop openvpn@server');
    res.json({ message: 'VPN服务停止成功' });
  } catch (error) {
    logger.error('Error stopping VPN service:', error);
    res.status(500).json({ error: 'VPN服务停止失败' });
  }
}));

export const tunnelRouter = router; 