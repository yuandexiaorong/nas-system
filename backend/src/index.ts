import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createConnection } from 'typeorm';
import { systemRouter } from './routes/system';
import { userRouter } from './routes/user';
import { storageRouter } from './routes/storage';
import { fileRouter } from './routes/file';
import { backupRouter } from './routes/backup';
import { monitoringRouter } from './routes/monitoring';
import { appsRouter } from './routes/apps';
import { tunnelRouter } from './routes/tunnel';
import { btrfsRouter } from './routes/btrfs';
import { setupPrometheus } from './utils/prometheus';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 4000;

// 中间件
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prometheus metrics
setupPrometheus(app);

// 路由
app.use('/api/system', authMiddleware, systemRouter);
app.use('/api/users', authMiddleware, userRouter);
app.use('/api/storage', authMiddleware, storageRouter);
app.use('/api/files', authMiddleware, fileRouter);
app.use('/api/backup', authMiddleware, backupRouter);
app.use('/api/monitoring', authMiddleware, monitoringRouter);
app.use('/api/apps', authMiddleware, appsRouter);
app.use('/api/tunnel', authMiddleware, tunnelRouter);
app.use('/api/btrfs', authMiddleware, btrfsRouter);

// 错误处理
app.use(errorHandler);

// 数据库连接
createConnection().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  logger.error('Database connection error:', error);
}); 