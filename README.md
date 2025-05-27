# 系统监控平台

一个基于 React + TypeScript + Ant Design 开发的系统监控平台，提供实时系统资源监控、进程管理等功能。

## 功能特性

- 实时系统资源监控（CPU、内存、磁盘、网络）
- 历史数据趋势图表
- 进程管理（查看、搜索、结束进程）
- 响应式设计，支持移动端

## 技术栈

- 前端：React + TypeScript + Ant Design + @ant-design/charts
- 后端：Node.js + Express + systeminformation
- 开发工具：Vite

## 快速开始

1. 克隆项目
```bash
git clone https://github.com/yourusername/system-monitor.git
cd system-monitor
```

2. 安装依赖
```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

3. 启动开发服务器
```bash
# 启动前端开发服务器
cd client
npm run dev

# 启动后端服务器
cd ../server
npm run dev
```

4. 访问应用
打开浏览器访问 http://localhost:5173

## 项目结构

```
system-monitor/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/        # 页面
│   │   └── App.tsx       # 应用入口
│   └── package.json
├── server/                # 后端代码
│   ├── src/
│   │   ├── routes/       # 路由
│   │   └── index.ts      # 服务器入口
│   └── package.json
└── README.md
```

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件 