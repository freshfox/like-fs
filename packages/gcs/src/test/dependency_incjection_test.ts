import { Module, Provider } from '@nestjs/common';
import { GCSFilesystem, GCStorage, IGCStorageConfig } from '../lib';
import { Test } from '@nestjs/testing';
import 'should';
import { GCSFilesystemModule } from '../lib/module';
import { Storage } from '@google-cloud/storage';

describe('Dependency Injection', function () {
	describe('NestJS', function () {
		describe('Static', function () {
			it('should get a GCS fs instance', async () => {
				const module = GCSFilesystemModule.forRoot(new Storage(), {
					storageBucket: 'my-test-bucket',
				});

				@Module({
					imports: [module],
					exports: [module],
				})
				class TestModule {}

				const moduleRef = await Test.createTestingModule({
					imports: [TestModule],
					exports: [TestModule],
				}).compile();

				const fs = moduleRef.get(GCSFilesystem);
				fs.should.instanceOf(GCSFilesystem);

				const storage = moduleRef.get(GCStorage);
				storage.should.instanceOf(Storage);
			});
		});

		it('should configure GCSFilesystemModule asynchronously via useFactory, import and external dependency ', async () => {
			const GCS_CONFIG = 'GCS_CONFIG';
			const config: IGCStorageConfig = {
				storageBucket: 'bucket',
			};
			const configProviders: Provider[] = [
				{
					provide: GCS_CONFIG,
					useValue: config,
				},
			];
			@Module({
				providers: configProviders,
				exports: configProviders,
			})
			class ConfigModule {}

			@Module({
				imports: [
					GCSFilesystemModule.forRootAsync({
						imports: [ConfigModule],
						storageProvider: {
							useValue: new Storage(),
						},
						configProvider: {
							useFactory: (config: IGCStorageConfig) => {
								return config;
							},
							inject: [GCS_CONFIG],
						},
					}),
				],
			})
			class TestModule {}

			const moduleRef = await Test.createTestingModule({
				imports: [TestModule],
				exports: [TestModule],
			}).compile();

			const fs = moduleRef.get(GCSFilesystem);
			fs.should.instanceOf(GCSFilesystem);

			const storage = moduleRef.get(GCStorage);
			storage.should.instanceOf(Storage);
		});
	});
});
