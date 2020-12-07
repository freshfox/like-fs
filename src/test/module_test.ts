import {Test} from "@nestjs/testing";
import {Filesystem, FilesystemNestModule, IFilesystem, LocalFilesystem, TmpFilesystem} from "../lib";
import {Inject, Injectable, Module, Provider} from "@nestjs/common";
import 'should';

describe('NestJS', function () {
	let counter = 0;
	xit('should inject a custom default fs implementation', async () => {

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
				FilesystemNestModule.register({
					useFactory: (config) => {
					    return {
					    	tmpDirectory: `/tmp/` + config.counter
						}
					},
					inject: ['myfs-config']
				})
					.imports([AuthModule])
					.build()
			],
			providers: [{
				provide: Filesystem,
				useExisting: TmpFilesystem
			}]
		})
		class ConsumerModule {

		}

		const module = await Test.createTestingModule({
			imports: [ConsumerModule],
		}).compile();

		const fs = module.get<IFilesystem>(Filesystem);
		fs.should.instanceOf(TmpFilesystem);

		const config = module.get('myfs-config');
		console.log(config);

	});

	it('should inject TmpFilesystem', async () => {
		const mod = FilesystemNestModule.forRoot({tmpDirectory: '/tmp/node-fs-local'})
		const module = await Test.createTestingModule({
			imports: [mod],
			exports: [mod]
		}).compile();

		const fs = module.get(TmpFilesystem);
		console.log(fs);

	});

});
