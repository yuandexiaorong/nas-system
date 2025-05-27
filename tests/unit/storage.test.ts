import { StorageService } from '../../src/services/storage';
import { StoragePool } from '../../src/models/storage';
import { mock, MockProxy } from 'jest-mock-extended';

describe('StorageService', () => {
    let storageService: StorageService;
    let mockStoragePool: MockProxy<StoragePool>;

    beforeEach(() => {
        mockStoragePool = mock<StoragePool>();
        storageService = new StorageService(mockStoragePool);
    });

    describe('createStoragePool', () => {
        it('should create storage pool successfully', async () => {
            const poolData = {
                name: 'test-pool',
                type: 'zfs',
                disks: ['/dev/sda', '/dev/sdb']
            };

            mockStoragePool.create.mockResolvedValue({
                id: 1,
                name: poolData.name,
                type: poolData.type,
                status: 'active',
                total_size: 1000000000,
                used_size: 0,
                created_at: new Date(),
                updated_at: new Date()
            });

            const result = await storageService.createStoragePool(poolData);

            expect(result).toBeDefined();
            expect(result.name).toBe(poolData.name);
            expect(result.type).toBe(poolData.type);
            expect(result.status).toBe('active');
            expect(mockStoragePool.create).toHaveBeenCalledWith(poolData);
        });

        it('should throw error when disk not found', async () => {
            const poolData = {
                name: 'test-pool',
                type: 'zfs',
                disks: ['/dev/nonexistent']
            };

            mockStoragePool.create.mockRejectedValue(new Error('Disk not found'));

            await expect(storageService.createStoragePool(poolData))
                .rejects
                .toThrow('Disk not found');
        });
    });

    describe('createDataset', () => {
        it('should create dataset successfully', async () => {
            const datasetData = {
                name: 'test-dataset',
                pool_id: 1,
                quota: 1000000000,
                compression: 'lz4'
            };

            mockStoragePool.createDataset.mockResolvedValue({
                id: 1,
                name: datasetData.name,
                pool_id: datasetData.pool_id,
                quota: datasetData.quota,
                compression: datasetData.compression,
                created_at: new Date(),
                updated_at: new Date()
            });

            const result = await storageService.createDataset(datasetData);

            expect(result).toBeDefined();
            expect(result.name).toBe(datasetData.name);
            expect(result.pool_id).toBe(datasetData.pool_id);
            expect(mockStoragePool.createDataset).toHaveBeenCalledWith(datasetData);
        });
    });

    describe('createSnapshot', () => {
        it('should create snapshot successfully', async () => {
            const snapshotData = {
                name: 'test-snapshot',
                dataset_id: 1,
                recursive: true
            };

            mockStoragePool.createSnapshot.mockResolvedValue({
                id: 1,
                name: snapshotData.name,
                dataset_id: snapshotData.dataset_id,
                created_at: new Date()
            });

            const result = await storageService.createSnapshot(snapshotData);

            expect(result).toBeDefined();
            expect(result.name).toBe(snapshotData.name);
            expect(result.dataset_id).toBe(snapshotData.dataset_id);
            expect(mockStoragePool.createSnapshot).toHaveBeenCalledWith(snapshotData);
        });
    });
}); 