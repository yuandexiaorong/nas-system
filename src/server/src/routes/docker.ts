import express from 'express';

const router = express.Router();

// 获取容器列表
router.get('/containers', (req, res) => {
  // TODO: 实现容器列表获取逻辑
  res.json([
    {
      id: 'container1',
      name: 'nginx',
      status: 'running',
      image: 'nginx:latest',
      ports: ['80:80'],
      created: new Date().toISOString()
    },
    {
      id: 'container2',
      name: 'mysql',
      status: 'running',
      image: 'mysql:8',
      ports: ['3306:3306'],
      created: new Date().toISOString()
    }
  ]);
});

export const dockerRouter = router; 