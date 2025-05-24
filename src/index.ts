import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import fileSystemRoutes from './routes/fileSystem';
import dockerRoutes from './routes/docker';
import { MirrorManager } from './utils/mirrors';

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

app.post('/api/mirrors/:type', async (req, res) => {
  try {
    const mirrorManager = MirrorManager.getInstance();
    const { type } = req.params;
    const { url } = req.body;

    switch (type) {
      case 'docker':
        await mirrorManager.configureDockerMirror(url);
        break;
      case 'npm':
        await mirrorManager.configureNpmMirror(url);
        break;
      case 'pip':
        await mirrorManager.configurePipMirror(url);
        break;
      case 'apt':
        await mirrorManager.configureAptMirror(url);
        break;
      default:
        throw new Error('不支持的镜像类型');
    }

    res.json({ message: '镜像配置成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 文件系统路由
app.use('/api/fs', fileSystemRoutes);

// Docker管理路由
app.use('/api/docker', dockerRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`NAS系统服务已启动，监听端口 ${port}`);
}); 