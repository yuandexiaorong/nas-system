import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const MIRRORS_FILE = path.join(__dirname, '../../../mirrors.json');

// 默认镜像源
const defaultMirrors = [
  { type: 'npm', name: 'NPM镜像', url: 'https://registry.npmmirror.com', status: 'active', isActive: true, lastSync: new Date().toISOString(), speed: 50 },
  { type: 'docker', name: 'Docker Hub镜像', url: 'https://mirror.ccs.tencentyun.com', status: 'active', isActive: true, lastSync: new Date().toISOString(), speed: 80 },
  { type: 'pip', name: 'PyPI镜像', url: 'https://pypi.tuna.tsinghua.edu.cn/simple', status: 'active', isActive: true, lastSync: new Date().toISOString(), speed: 65 }
];

// 加载镜像源
function loadMirrors() {
  if (fs.existsSync(MIRRORS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MIRRORS_FILE, 'utf-8'));
    } catch {
      return defaultMirrors;
    }
  }
  return defaultMirrors;
}

// 保存镜像源
function saveMirrors(mirrors: any[]) {
  fs.writeFileSync(MIRRORS_FILE, JSON.stringify(mirrors, null, 2), 'utf-8');
}

let mirrors = loadMirrors();

// 获取镜像列表
router.get('/', (req, res) => {
  const { type } = req.query;
  if (type && type !== 'all') {
    const filteredMirrors = mirrors.filter((mirror: any) => mirror.type === type);
    res.json(filteredMirrors);
  } else {
    res.json(mirrors);
  }
});

// 更新镜像配置
router.post('/:type', (req, res) => {
  const { type } = req.params;
  const updatedMirror = req.body;
  const index = mirrors.findIndex((mirror: any) => mirror.type === type);
  if (index === -1) {
    res.status(404).json({ message: '镜像不存在' });
    return;
  }
  mirrors[index] = { ...mirrors[index], ...updatedMirror };
  saveMirrors(mirrors);
  res.json(mirrors[index]);
});

export const mirrorsRouter = router; 