# NAS系统

一个功能强大的NAS系统，专为中国用户优化，提供完整的存储管理和应用部署解决方案。

![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/yuandexiaorong/nas-system)
![GitHub repo size](https://img.shields.io/github/repo-size/yuandexiaorong/nas-system)
![GitHub language count](https://img.shields.io/github/languages/count/yuandexiaorong/nas-system)
![GitHub top language](https://img.shields.io/github/languages/top/yuandexiaorong/nas-system)

## 主要特性

### 存储管理
- ZFS文件系统支持
  - 存储池管理
  - 数据集管理
  - 快照管理
  - 性能优化
- 文件共享
  - SMB/CIFS 协议支持
  - NFS 协议支持
  - WebDAV 支持
  - FTP 服务

### 应用市场
- 媒体服务
  - Jellyfin（视频流媒体）
  - Plex（视频流媒体）
  - Emby（视频流媒体）
- 云存储
  - Nextcloud（私有云盘）
  - Seafile（文件同步）
- 下载工具
  - Transmission（BT下载）
  - qBittorrent（BT下载）
  - Aria2（多协议下载）
- 其他应用
  - Home Assistant（智能家居）
  - Portainer（Docker管理）
  - 萤火虫（文件管理）

### 系统监控
- 资源监控
  - CPU 使用率
  - 内存使用情况
  - 磁盘 I/O
  - 网络流量
- 进程管理
  - 进程列表
  - 资源占用
  - 进程控制
- 系统日志
  - 系统日志查看
  - 应用日志查看
  - 日志分析

### 中国本地化优化
- 软件源镜像加速
  - Docker：阿里云、腾讯云、网易、中科大
  - NPM：淘宝、华为云
  - PIP：阿里云、清华、豆瓣
  - APT：阿里云、清华、中科大
  - GitHub：清华、中科大
  - Composer：阿里云、腾讯云
- 网络优化
  - 智能DNS
  - 网络测速
  - 端口转发
- 安全防护
  - 防火墙配置
  - 入侵检测
  - 漏洞扫描

## 系统要求

### 硬件要求
- CPU：x86_64 或 ARM 架构
- 内存：至少 4GB RAM（推荐 8GB 以上）
- 存储：系统盘 20GB 以上
- 网络：千兆网卡

### 软件要求
- 操作系统：Linux（推荐 Ubuntu 20.04+）
- Docker：20.10+
- Node.js：16+
- Python：3.8+

## 快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/yuandexiaorong/nas-system.git
cd nas-system
```

### 2. 安装依赖
```bash
# 安装系统依赖
sudo apt update
sudo apt install -y docker.io docker-compose nodejs npm python3 python3-pip

# 安装项目依赖
npm install
```

### 3. 配置环境
```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置文件
nano .env
```

### 4. 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

### 5. 访问系统
打开浏览器访问：http://localhost:3000

## 详细配置

### 存储配置
1. 创建存储池
   - 进入存储管理页面
   - 点击"创建存储池"
   - 选择磁盘和RAID级别
   - 设置存储池名称和属性

2. 创建数据集
   - 在存储池中创建数据集
   - 设置配额和压缩
   - 配置权限

3. 配置共享
   - 选择共享协议（SMB/NFS/WebDAV）
   - 设置访问权限
   - 配置用户认证

### 应用配置
1. 安装应用
   - 进入应用市场
   - 选择需要的应用
   - 点击安装
   - 等待安装完成

2. 配置应用
   - 设置应用参数
   - 配置存储位置
   - 设置访问权限

### 系统监控
1. 资源监控
   - 查看实时资源使用情况
   - 设置告警阈值
   - 配置通知方式

2. 进程管理
   - 查看进程列表
   - 监控资源占用
   - 管理进程状态

## 开发指南

### 目录结构
```
.
├── backend/          # 后端代码
│   ├── src/         # 源代码
│   │   ├── api/    # API接口
│   │   ├── models/ # 数据模型
│   │   └── utils/  # 工具函数
│   └── tests/      # 测试代码
├── frontend/        # 前端代码
│   ├── src/        # 源代码
│   │   ├── components/ # 组件
│   │   ├── pages/     # 页面
│   │   └── utils/     # 工具函数
│   └── public/     # 静态资源
├── docs/           # 文档
└── scripts/        # 脚本文件
```

### 技术栈
- 后端
  - Node.js + TypeScript
  - Express 框架
  - PostgreSQL 数据库
  - Redis 缓存
- 前端
  - React + TypeScript
  - Ant Design 组件库
  - Redux 状态管理
- 部署
  - Docker 容器化
  - Nginx 反向代理
  - PM2 进程管理

### 开发流程
1. 创建功能分支
```bash
git checkout -b feature/your-feature
```

2. 开发新功能
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

3. 提交代码
```bash
git add .
git commit -m "feat: 添加新功能"
git push origin feature/your-feature
```

4. 创建 Pull Request
- 在 GitHub 上创建 Pull Request
- 等待代码审查
- 合并到主分支

## 常见问题

### 1. 安装问题
Q: 安装依赖时出现错误
A: 检查 Node.js 版本是否兼容，尝试清除 npm 缓存：
```bash
npm cache clean --force
```

### 2. 运行问题
Q: 服务无法启动
A: 检查端口是否被占用，查看日志文件：
```bash
tail -f logs/app.log
```

### 3. 性能问题
Q: 系统运行缓慢
A: 检查资源使用情况，优化配置：
```bash
# 查看系统资源
htop
# 查看磁盘使用
df -h
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 版本历史

- v1.0.0 (2025-05-27)
  - 初始版本发布
  - 基础存储管理功能
  - 应用市场支持
  - 系统监控功能

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目维护者：yuandexiaorong
- 邮箱：your.email@example.com
- GitHub：[yuandexiaorong](https://github.com/yuandexiaorong) 