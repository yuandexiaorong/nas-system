// 镜像源类型定义
export interface Mirror {
  name: string;
  type: string;
  url: string;
  speed?: number;
  isActive: boolean;
}

// 镜像源管理器类 - 单例模式
export class MirrorManager {
  private static instance: MirrorManager;
  private mirrors: Mirror[] = [];

  private constructor() {
    this.initDefaultMirrors();
  }

  public static getInstance(): MirrorManager {
    if (!MirrorManager.instance) {
      MirrorManager.instance = new MirrorManager();
    }
    return MirrorManager.instance;
  }

  private initDefaultMirrors() {
    this.mirrors = [
      {
        name: 'NPM淘宝镜像',
        type: 'npm',
        url: 'https://registry.npmmirror.com',
        isActive: true
      },
      {
        name: 'Docker中国镜像',
        type: 'docker',
        url: 'https://registry.docker-cn.com',
        isActive: true
      },
      {
        name: 'PIP清华镜像',
        type: 'pip',
        url: 'https://pypi.tuna.tsinghua.edu.cn/simple',
        isActive: true
      },
      {
        name: 'Ubuntu阿里云镜像',
        type: 'apt',
        url: 'https://mirrors.aliyun.com/ubuntu/',
        isActive: true
      }
    ];
  }

  public getMirrors(type?: string): Mirror[] {
    if (type) {
      return this.mirrors.filter(mirror => mirror.type === type);
    }
    return this.mirrors;
  }

  public async configureDockerMirror(url: string): Promise<void> {
    // TODO: 实现Docker镜像配置
    const mirror = this.mirrors.find(m => m.type === 'docker');
    if (mirror) {
      mirror.url = url;
    }
  }

  public async configureNpmMirror(url: string): Promise<void> {
    // TODO: 实现NPM镜像配置
    const mirror = this.mirrors.find(m => m.type === 'npm');
    if (mirror) {
      mirror.url = url;
    }
  }

  public async configurePipMirror(url: string): Promise<void> {
    // TODO: 实现PIP镜像配置
    const mirror = this.mirrors.find(m => m.type === 'pip');
    if (mirror) {
      mirror.url = url;
    }
  }

  public async configureAptMirror(url: string): Promise<void> {
    // TODO: 实现APT源配置
    const mirror = this.mirrors.find(m => m.type === 'apt');
    if (mirror) {
      mirror.url = url;
    }
  }

  public async configureComposerMirror(url: string): Promise<void> {
    // TODO: 实现Composer镜像配置
    const mirror = this.mirrors.find(m => m.type === 'composer');
    if (mirror) {
      mirror.url = url;
    }
  }

  public async getFastestMirror(type: string): Promise<Mirror | null> {
    // TODO: 实现获取最快镜像的逻辑
    const mirrors = this.getMirrors(type);
    if (mirrors.length === 0) {
      return null;
    }
    
    // 简单返回第一个镜像，实际应该测速后返回最快的
    return mirrors[0];
  }
} 