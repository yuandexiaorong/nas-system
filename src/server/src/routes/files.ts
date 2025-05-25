import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import mimeTypes from 'mime-types';
import archiver from 'archiver';

const router = express.Router();

// 明确WSL环境下路径
const ROOT = '/mnt/d/aicode/files';
if (!fs.existsSync(ROOT)) fs.mkdirSync(ROOT, { recursive: true });

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dir = path.join(ROOT, req.query.path as string || '/');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err as Error, '');
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// 获取文件列表
router.get('/', (req, res) => {
  try {
    const relPath = req.query.path as string || '/';
    const absPath = path.join(ROOT, relPath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ message: '目录不存在' });
    const list = fs.readdirSync(absPath).map(name => {
      const stat = fs.statSync(path.join(absPath, name));
      return {
        name,
        isDir: stat.isDirectory(),
        size: stat.size,
        mtime: stat.mtime
      };
    });
    res.json({ path: relPath, list });
  } catch (err) {
    res.status(500).json({ message: '读取文件列表失败', error: String(err) });
  }
});

// 上传文件
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    res.json({ message: '上传成功', file: req.file });
  } catch (err) {
    res.status(500).json({ message: '上传失败', error: String(err) });
  }
});

// 下载文件/预览
router.get('/download', (req, res) => {
  try {
    const relPath = req.query.path as string;
    if (!relPath) return res.status(400).json({ message: '缺少path参数' });
    const absPath = path.join(ROOT, relPath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ message: '文件不存在' });
    const filename = path.basename(absPath);
    const mimeType = mimeTypes.lookup(absPath) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', req.query.preview ? 'inline' : `attachment; filename="${encodeURIComponent(filename)}"`);
    fs.createReadStream(absPath).pipe(res);
  } catch (err) {
    res.status(500).json({ message: '下载失败', error: String(err) });
  }
});

// 删除文件/文件夹
router.delete('/', (req, res) => {
  try {
    const relPath = req.query.path as string;
    if (!relPath) return res.status(400).json({ message: '缺少path参数' });
    const absPath = path.join(ROOT, relPath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ message: '文件不存在' });
    const stat = fs.statSync(absPath);
    if (stat.isDirectory()) {
      fs.rmSync(absPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(absPath);
    }
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: String(err) });
  }
});

// 批量删除
router.post('/batch-delete', (req, res) => {
  try {
    const { paths } = req.body;
    if (!Array.isArray(paths)) return res.status(400).json({ message: '参数错误' });
    for (const relPath of paths) {
      const absPath = path.join(ROOT, relPath);
      if (fs.existsSync(absPath)) {
        const stat = fs.statSync(absPath);
        if (stat.isDirectory()) {
          fs.rmSync(absPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(absPath);
        }
      }
    }
    res.json({ message: '批量删除成功' });
  } catch (err) {
    res.status(500).json({ message: '批量删除失败', error: String(err) });
  }
});

// 重命名
router.post('/rename', (req, res) => {
  try {
    const { oldPath, newPath } = req.body;
    if (!oldPath || !newPath) return res.status(400).json({ message: '参数错误' });
    const absOld = path.join(ROOT, oldPath);
    const absNew = path.join(ROOT, newPath);
    if (!fs.existsSync(absOld)) return res.status(404).json({ message: '原文件不存在' });
    fs.renameSync(absOld, absNew);
    res.json({ message: '重命名成功' });
  } catch (err) {
    res.status(500).json({ message: '重命名失败', error: String(err) });
  }
});

// 新建文件夹
router.post('/mkdir', (req, res) => {
  try {
    const relPath = req.query.path as string;
    if (!relPath) return res.status(400).json({ message: '缺少path参数' });
    const absPath = path.join(ROOT, relPath);
    if (fs.existsSync(absPath)) return res.status(400).json({ message: '文件夹已存在' });
    fs.mkdirSync(absPath, { recursive: true });
    res.json({ message: '文件夹创建成功' });
  } catch (err) {
    res.status(500).json({ message: '文件夹创建失败', error: String(err) });
  }
});

// 批量下载zip
router.post('/batch-download', async (req, res) => {
  try {
    const { paths } = req.body;
    if (!Array.isArray(paths) || paths.length === 0) return res.status(400).json({ message: '参数错误' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="download.zip"');
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err: Error) => res.status(500).end());
    archive.pipe(res);
    for (const relPath of paths) {
      const absPath = path.join(ROOT, relPath);
      if (fs.existsSync(absPath)) {
        const stat = fs.statSync(absPath);
        if (stat.isDirectory()) {
          archive.directory(absPath, relPath.replace(/^\/+/, ''));
        } else {
          archive.file(absPath, { name: relPath.replace(/^\/+/, '') });
        }
      }
    }
    archive.finalize();
  } catch (err) {
    res.status(500).json({ message: '批量下载失败', error: String(err) });
  }
});

export const filesRouter = router; 