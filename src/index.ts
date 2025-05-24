import express from 'express';
import { MirrorManager } from './utils/mirrors';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

// 镜像源管理路由
app.get('/api/mirrors', (req, res) => {
  const mirrorManager = MirrorManager.getInstance();
  const type = req.query.type as string;
  const mirrors = mirrorManager.getMirrors(type);
  res.json(mirrors);
});

app.post('/api/mirrors/docker', async (req, res) => {
  try {
    const mirrorManager = MirrorManager.getInstance();
    await mirrorManager.configureDockerMirror(req.body.url);
    res.json({ message: 'Docker镜像配置成功' });
  } catch (error) {
    res.status(500).json({ error: '配置Docker镜像失败' });
  }
});

app.post('/api/mirrors/npm', async (req, res) => {
  try {
    const mirrorManager = MirrorManager.getInstance();
    await mirrorManager.configureNpmMirror(req.body.url);
    res.json({ message: 'NPM镜像配置成功' });
  } catch (error) {
    res.status(500).json({ error: '配置NPM镜像失败' });
  }
});

app.post('/api/mirrors/pip', async (req, res) => {
  try {
    const mirrorManager = MirrorManager.getInstance();
    await mirrorManager.configurePipMirror(req.body.url);
    res.json({ message: 'PIP镜像配置成功' });
  } catch (error) {
    res.status(500).json({ error: '配置PIP镜像失败' });
  }
});

app.post('/api/mirrors/apt', async (req, res) => {
  try {
    const mirrorManager = MirrorManager.getInstance();
    await mirrorManager.configureAptMirror(req.body.url);
    res.json({ message: 'APT源配置成功' });
  } catch (error) {
    res.status(500).json({ error: '配置APT源失败' });
  }
});

app.post('/api/mirrors/composer', async (req, res) => {
  try {
    const mirrorManager = MirrorManager.getInstance();
    await mirrorManager.configureComposerMirror(req.body.url);
    res.json({ message: 'Composer镜像配置成功' });
  } catch (error) {
    res.status(500).json({ error: '配置Composer镜像失败' });
  }
});

app.get('/api/mirrors/fastest', async (req, res) => {
  try {
    const type = req.query.type as string;
    if (!type) {
      return res.status(400).json({ error: '请指定镜像类型' });
    }
    
    const mirrorManager = MirrorManager.getInstance();
    const fastestMirror = await mirrorManager.getFastestMirror(type);
    res.json(fastestMirror);
  } catch (error) {
    res.status(500).json({ error: '获取最快镜像失败' });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`NAS系统服务已启动，监听端口 ${port}`);
}); 