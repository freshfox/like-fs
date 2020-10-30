import {Test} from "@nestjs/testing";
import {Filesystem, FilesystemNestModule, IFilesystem, LocalFilesystem, TmpFilesystem} from "../lib";
import {Inject, Injectable, Module, Provider} from "@nestjs/common";
import 'should';

describe('NestJS', function () {
	let counter = 0;
	it('should inject a custom default fs implementation', async () => {

		const authProviders: Provider[] = [{
			provide: 'myfs-config',
			useFactory: () => {
				console.log('Getting auth');
				return {counter: ++counter};
			}
		}]

		@Module({
			providers: authProviders,
			exports: authProviders
		})
		class AuthModule {

		}

		@Injectable()
		class MyFs extends LocalFilesystem {

			constructor(@Inject('myfs-config') private config: any) {
				super();
				console.log('123', config);
			}
		}

		@Module({
			imports: [
				AuthModule,
				FilesystemNestModule.register({
					imports: [AuthModule],
					fsProvider: {
						useClass: MyFs
					},
					tmpConfig: {
						useValue: {}
					}
				})
			]
		})
		class ConsumerModule {

		}

		const module = await Test.createTestingModule({
			imports: [ConsumerModule],
			exports: [ConsumerModule]
		}).compile();

		const fs = module.get<IFilesystem>(Filesystem);
		fs.should.instanceOf(MyFs);

		const config = module.get('myfs-config');
		console.log(config);

	});

});
