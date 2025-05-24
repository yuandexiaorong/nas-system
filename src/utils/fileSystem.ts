import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface FileInfo {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modifiedTime: Date;
  permissions: string;
}

export interface DiskInfo {
  device: string;
  mountPoint: string;
  fsType: string;
  totalSpace: number;
  usedSpace: number;
  availableSpace: number;
}

export class FileSystemManager {
  private static instance: FileSystemManager;
  private baseDir: string;

  private constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  public static getInstance(baseDir: string): FileSystemManager {
    if (!FileSystemManager.instance) {
      FileSystemManager.instance = new FileSystemManager(baseDir);
    }
    return FileSystemManager.instance;
  }

  // 列出目录内容
  public async listDirectory(dirPath: string): Promise<FileInfo[]> {
    const fullPath = path.join(this.baseDir, dirPath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    
    const fileInfos: FileInfo[] = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(fullPath, entry.name);
        const stats = await fs.stat(entryPath);
        
        return {
          name: entry.name,
          path: path.relative(this.baseDir, entryPath),
          type: entry.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modifiedTime: stats.mtime,
          permissions: (stats.mode & 0o777).toString(8)
        };
      })
    );

    return fileInfos;
  }

  // 创建目录
  public async createDirectory(dirPath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, dirPath);
    await fs.mkdir(fullPath, { recursive: true });
  }

  // 删除文件或目录
  public async delete(targetPath: string, recursive = false): Promise<void> {
    const fullPath = path.join(this.baseDir, targetPath);
    if (recursive) {
      await fs.rm(fullPath, { recursive: true, force: true });
    } else {
      await fs.unlink(fullPath);
    }
  }

  // 移动/重命名文件或目录
  public async move(sourcePath: string, destPath: string): Promise<void> {
    const fullSourcePath = path.join(this.baseDir, sourcePath);
    const fullDestPath = path.join(this.baseDir, destPath);
    await fs.rename(fullSourcePath, fullDestPath);
  }

  // 复制文件或目录
  public async copy(sourcePath: string, destPath: string): Promise<void> {
    const fullSourcePath = path.join(this.baseDir, sourcePath);
    const fullDestPath = path.join(this.baseDir, destPath);
    await fs.cp(fullSourcePath, fullDestPath, { recursive: true });
  }

  // 获取磁盘信息
  public async getDiskInfo(): Promise<DiskInfo[]> {
    try {
      const { stdout } = await execAsync('df -h --output=source,target,fstype,size,used,avail');
      const lines = stdout.trim().split('\n').slice(1); // 跳过标题行
      
      return lines.map(line => {
        const [device, mountPoint, fsType, total, used, available] = line.split(/\s+/);
        return {
          device,
          mountPoint,
          fsType,
          totalSpace: this.parseSize(total),
          usedSpace: this.parseSize(used),
          availableSpace: this.parseSize(available)
        };
      });
    } catch (error) {
      throw new Error(`获取磁盘信息失败: ${error.message}`);
    }
  }

  // 检查文件/目录权限
  public async checkPermissions(targetPath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.baseDir, targetPath);
      await fs.access(fullPath, fs.constants.R_OK | fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  // 修改文件/目录权限
  public async changePermissions(targetPath: string, mode: string): Promise<void> {
    const fullPath = path.join(this.baseDir, targetPath);
    await fs.chmod(fullPath, parseInt(mode, 8));
  }

  private parseSize(size: string): number {
    const units = {
      'B': 1,
      'K': 1024,
      'M': 1024 ** 2,
      'G': 1024 ** 3,
      'T': 1024 ** 4
    };
    
    const match = size.match(/^(\d+(?:\.\d+)?)([BKMGT])?$/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = (match[2] || 'B').toUpperCase();
    
    return value * units[unit];
  }
} 