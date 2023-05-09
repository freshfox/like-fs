import { Module, Provider } from '@nestjs/common';
import { GCSFilesystem, LikeFsBucket, GCSFilesystemModule } from '../lib';
import { Test } from '@nestjs/testing';
import { Bucket, Storage } from '@google-cloud/storage';
import 'should';

describe('Dependency Injection', function () {
	describe('NestJS', function () {
		describe('Static', function () {
			it('should get a GCS fs instance', async () => {
				const module = GCSFilesystemModule.forRoot(new Storage().bucket('my-test-bucket'));

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

				const storage = moduleRef.get(LikeFsBucket);
				storage.should.instanceOf(Bucket);
			});
		});

		it('should configure GCSFilesystemModule asynchronously via useFactory, import and external dependency ', async () => {
			const GCS_CONFIG = 'GCS_CONFIG';
			interface IGCStorageConfig {
				storageBucket: string;
			}

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
						bucketProvider: {
							useFactory: (config: IGCStorageConfig) => {
								return new Storage().bucket(config.storageBucket);
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

			const storage = moduleRef.get(LikeFsBucket);
			storage.should.instanceOf(Bucket);
		});
	});
});
