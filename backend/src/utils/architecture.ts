import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from './logger';

const execAsync = promisify(exec);

export class ArchitectureManager {
  private static instance: ArchitectureManager;
  private currentArch: string = '';
  private isArm: boolean = false;
  private isX86: boolean = false;

  private constructor() {}

  public static getInstance(): ArchitectureManager {
    if (!ArchitectureManager.instance) {
      ArchitectureManager.instance = new ArchitectureManager();
    }
    return ArchitectureManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      const { stdout: archInfo } = await execAsync('uname -m');
      this.currentArch = archInfo.trim();
      this.isArm = this.currentArch.includes('arm') || this.currentArch.includes('aarch64');
      this.isX86 = this.currentArch.includes('x86') || this.currentArch.includes('amd64');
      
      logger.info(`检测到系统架构: ${this.currentArch}`);
      logger.info(`ARM支持: ${this.isArm}`);
      logger.info(`x86支持: ${this.isX86}`);
    } catch (error) {
      logger.error('架构检测失败:', error);
      throw error;
    }
  }

  public getArchitecture(): string {
    return this.currentArch;
  }

  public isArmArchitecture(): boolean {
    return this.isArm;
  }

  public isX86Architecture(): boolean {
    return this.isX86;
  }

  // 获取针对特定架构优化的ZFS参数
  public getOptimizedZfsParameters(): Record<string, string> {
    if (this.isArm) {
      return {
        'ashift': '12',  // 针对ARM的高级格式磁盘优化
        'primarycache': 'metadata', // ARM设备通常内存较小，仅缓存元数据
        'compression': 'lz4',  // ARM设备上性能最好的压缩算法
        'xattr': 'sa',  // 针对ARM优化的扩展属性存储
      };
    } else {
      return {
        'ashift': '12',
        'primarycache': 'all',  // x86设备通常内存较大，可以缓存所有数据
        'compression': 'zstd',  // x86设备上可以使用更强的压缩算法
        'xattr': 'sa',
      };
    }
  }

  // 获取架构特定的性能优化参数
  public getPerformanceParameters(): Record<string, string> {
    if (this.isArm) {
      return {
        'zfs_arc_max': '1G',  // ARM设备限制ARC大小
        'zfs_prefetch_disable': '1',  // 在ARM设备上禁用预取以节省资源
        'zfs_txg_timeout': '10',  // 更频繁的事务组提交
      };
    } else {
      return {
        'zfs_arc_max': '8G',  // x86设备可以使用更大的ARC
        'zfs_prefetch_disable': '0',  // 启用预取
        'zfs_txg_timeout': '5',  // 标准事务组超时
      };
    }
  }

  // 检查并返回可用的硬件加速特性
  public async getHardwareAcceleration(): Promise<string[]> {
    const features: string[] = [];
    
    try {
      if (this.isArm) {
        // 检查ARM的NEON支持
        const { stdout: cpuInfo } = await execAsync('grep -i neon /proc/cpuinfo');
        if (cpuInfo.includes('neon')) {
          features.push('NEON');
        }
      } else {
        // 检查x86的AES-NI支持
        const { stdout: cpuInfo } = await execAsync('grep -i aes /proc/cpuinfo');
        if (cpuInfo.includes('aes')) {
          features.push('AES-NI');
        }
      }

      // 检查通用硬件加速特性
      const { stdout: lsCpu } = await execAsync('lscpu');
      
      // 检查虚拟化支持
      if (lsCpu.includes('vmx') || lsCpu.includes('svm')) {
        features.push('Virtualization');
      }

      // 检查AVX支持
      if (lsCpu.includes('avx')) {
        features.push('AVX');
      }

      // 检查SSE支持
      if (lsCpu.includes('sse4_2')) {
        features.push('SSE4.2');
      }

    } catch (error) {
      logger.warn('硬件加速检测失败:', error);
    }

    return features;
  }

  // 获取架构特定的ZFS调优参数
  public async getZfsTuningParameters(): Promise<Record<string, string>> {
    const baseParams = this.getOptimizedZfsParameters();
    const perfParams = this.getPerformanceParameters();
    const hwAccel = await this.getHardwareAcceleration();

    const tuningParams = {
      ...baseParams,
      ...perfParams,
    };

    // 根据硬件加速特性添加额外参数
    if (hwAccel.includes('AES-NI')) {
      tuningParams['encryption'] = 'aes-256-gcm';
    }
    if (hwAccel.includes('NEON')) {
      tuningParams['compression'] = 'lz4';  // NEON优化的LZ4
    }

    return tuningParams;
  }

  // 获取Docker运行时优化参数
  public getDockerOptimizations(): Record<string, string> {
    const optimizations: Record<string, string> = {
      'default-runtime': 'runc',
      'storage-driver': 'overlay2',
    };

    if (this.isArm) {
      optimizations['experimental'] = 'true';  // 启用ARM实验特性
      optimizations['cpu-rt-runtime'] = '950000';  // ARM设备的CPU实时运行时限制
    }

    return optimizations;
  }

  // 获取系统资源限制建议
  public getResourceLimits(): Record<string, number> {
    if (this.isArm) {
      return {
        maxContainers: 20,      // ARM设备建议的最大容器数
        maxCpuPercent: 80,      // CPU使用限制
        maxMemoryPercent: 75,   // 内存使用限制
        swapLimit: 2048,        // SWAP限制(MB)
      };
    } else {
      return {
        maxContainers: 50,      // x86设备建议的最大容器数
        maxCpuPercent: 90,      // CPU使用限制
        maxMemoryPercent: 85,   // 内存使用限制
        swapLimit: 4096,        // SWAP限制(MB)
      };
    }
  }
}