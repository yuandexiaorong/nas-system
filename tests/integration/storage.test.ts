import request from 'supertest';
import { app } from '../../src/app';
import { StoragePool } from '../../src/models/storage';
import { db } from '../../src/db';

describe('Storage API', () => {
    let token: string;
    let testPool: StoragePool;

    beforeAll(async () => {
        // 登录获取token
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'admin123'
            });
        token = response.body.token;

        // 清理测试数据
        await db.query('DELETE FROM storage_pools WHERE name LIKE $1', ['test-%']);
    });

    afterAll(async () => {
        // 清理测试数据
        await db.query('DELETE FROM storage_pools WHERE name LIKE $1', ['test-%']);
        await db.end();
    });

    describe('POST /api/storage/pools', () => {
        it('should create storage pool', async () => {
            const response = await request(app)
                .post('/api/storage/pools')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'test-pool',
                    type: 'zfs',
                    disks: ['/dev/sda', '/dev/sdb']
                });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('test-pool');
            expect(response.body.type).toBe('zfs');
            expect(response.body.status).toBe('active');

            testPool = response.body;
        });

        it('should return 400 when pool name exists', async () => {
            const response = await request(app)
                .post('/api/storage/pools')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'test-pool',
                    type: 'zfs',
                    disks: ['/dev/sda', '/dev/sdb']
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Storage pool name already exists');
        });
    });

    describe('POST /api/storage/datasets', () => {
        it('should create dataset', async () => {
            const response = await request(app)
                .post('/api/storage/datasets')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'test-dataset',
                    pool_id: testPool.id,
                    quota: 1000000000,
                    compression: 'lz4'
                });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('test-dataset');
            expect(response.body.pool_id).toBe(testPool.id);
            expect(response.body.quota).toBe(1000000000);
        });
    });

    describe('POST /api/storage/snapshots', () => {
        it('should create snapshot', async () => {
            const response = await request(app)
                .post('/api/storage/snapshots')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'test-snapshot',
                    dataset_id: 1,
                    recursive: true
                });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('test-snapshot');
            expect(response.body.dataset_id).toBe(1);
        });
    });

    describe('GET /api/storage/pools', () => {
        it('should list storage pools', async () => {
            const response = await request(app)
                .get('/api/storage/pools')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).toHaveProperty('type');
            expect(response.body[0]).toHaveProperty('status');
        });
    });

    describe('GET /api/storage/pools/:id', () => {
        it('should get storage pool details', async () => {
            const response = await request(app)
                .get(`/api/storage/pools/${testPool.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(testPool.id);
            expect(response.body.name).toBe(testPool.name);
            expect(response.body.type).toBe(testPool.type);
        });

        it('should return 404 when pool not found', async () => {
            const response = await request(app)
                .get('/api/storage/pools/999999')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Storage pool not found');
        });
    });

    describe('DELETE /api/storage/pools/:id', () => {
        it('should delete storage pool', async () => {
            const response = await request(app)
                .delete(`/api/storage/pools/${testPool.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Storage pool deleted successfully');
        });

        it('should return 404 when pool not found', async () => {
            const response = await request(app)
                .delete('/api/storage/pools/999999')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Storage pool not found');
        });
    });
}); 