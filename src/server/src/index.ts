import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { mirrorsRouter } from './routes/mirrors';
import { filesRouter } from './routes/files';
import { dockerRouter } from './routes/docker';
import { systemRouter } from './routes/system';

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// 路由
app.use('/api/mirrors', mirrorsRouter);
app.use('/api/files', filesRouter);
app.use('/api/docker', dockerRouter);
app.use('/api/system', systemRouter);

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 