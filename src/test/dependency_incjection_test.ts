import {Module} from "@nestjs/common";
import {GCSFilesystem, GCStorage, GCStorageConfig} from "../lib";
import {Test} from "@nestjs/testing";
import 'should';
import {Container} from "inversify";
import {GCSFilesystemModule} from "../lib/module";

describe('Dependency Injection', function () {

	describe('NestJS', function () {

		const module = GCSFilesystemModule.forRoot(null, null);

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
