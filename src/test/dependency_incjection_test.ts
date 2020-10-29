import {Module} from "@nestjs/common";
import {FirebaseFilesystem, FirebaseStorage} from "../lib";
import {Test} from "@nestjs/testing";
import 'should';
import {Container} from "inversify";

describe('Dependency Injection', function () {

	describe('NestJS', function () {

		@Module({
			providers: [
				FirebaseFilesystem,
				{
					provide: FirebaseStorage,
					useValue: null
				}
			],
			exports: [FirebaseFilesystem],
		})
		class TestModule {}

		it('should get a Firebase fs instance', async () => {

			const moduleRef = await Test.createTestingModule({
				imports: [TestModule],
				exports: [TestModule]
			}).compile();

			const fs = moduleRef.get(FirebaseFilesystem);
			fs.should.instanceOf(FirebaseFilesystem);
		});
	});

	describe('Inversify', function () {

		it('should get a Firebase fs instance', async () => {

			const container = new Container();
			container.bind(FirebaseFilesystem).toSelf().inSingletonScope();
			container.bind(FirebaseStorage).toConstantValue(null);

			const fs = container.get(FirebaseFilesystem);
			fs.should.instanceOf(FirebaseFilesystem);

		});

	});

});
