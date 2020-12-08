import {Module} from "@nestjs/common";
import {GCSFilesystem, GCStorage, GCStorageConfig} from "../lib";
import {Test} from "@nestjs/testing";
import 'should';
import {Container} from "inversify";
import {GCSFilesystemModule} from "../lib/module";
import {Storage} from "@google-cloud/storage";

describe('Dependency Injection', function () {

	describe('NestJS', function () {

		const module = GCSFilesystemModule.forRoot({
			storageBucket: 'my-test-bucket',
		});

		@Module({
			imports: [module],
			exports: [module],
		})
		class TestModule {}

		it('should get a GCS fs instance', async () => {

			const moduleRef = await Test.createTestingModule({
				imports: [TestModule],
				exports: [TestModule]
			}).compile();

			const fs = moduleRef.get(GCSFilesystem);
			fs.should.instanceOf(GCSFilesystem);

			const storage = moduleRef.get(GCStorage);
			storage.should.instanceOf(Storage);
		});
	});

	describe('Inversify', function () {

		it('should get a GCS fs instance', async () => {

			const container = new Container();
			container.bind(GCSFilesystem).toSelf().inSingletonScope();
			container.bind(GCStorage).toConstantValue(null);
			container.bind(GCStorageConfig).toConstantValue(null);

			const fs = container.get(GCSFilesystem);
			fs.should.instanceOf(GCSFilesystem);

		});

	});

});
