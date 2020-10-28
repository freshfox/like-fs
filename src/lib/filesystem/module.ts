import {LocalFilesystem} from './local_file_system';
import {Filesystem, IFilesystem} from './filesystem';
import {ITmpFilesystemConfig, TmpFilesystem, TmpFilesystemConfig} from './tmp_file_system';
import {ContainerModule, interfaces} from 'inversify';
import {DynamicModule, Module, Provider} from "@nestjs/common";

export class FilesystemModule extends ContainerModule {

	constructor(fs: interfaces.Newable<IFilesystem>, config?: ITmpFilesystemConfig) {
		super((bind) => {
			bind(TmpFilesystem).toSelf().inSingletonScope();
			bind(LocalFilesystem).toSelf().inSingletonScope();
			bind<IFilesystem>(Filesystem).to(fs).inSingletonScope();
			if (config) {
				bind(TmpFilesystemConfig).toConstantValue(config);
			}
		})
	}

	/**@deprecated*/
	static create(fs: interfaces.Newable<IFilesystem>, config?: ITmpFilesystemConfig): ContainerModule {
		return new FilesystemModule(fs, config);
	}
}

const providers: Provider[] = [
	TmpFilesystem,
	LocalFilesystem,
];

@Module({
	providers: providers,
	exports: providers,
})
export class FilesystemNestModule {

	static forRoot(fs: interfaces.Newable<IFilesystem>, config?: ITmpFilesystemConfig): DynamicModule {
		return {
			module: FilesystemNestModule,
			providers: [
				...providers,
				{
					provide: Filesystem,
					useClass: fs
				},
				{
					provide: TmpFilesystemConfig,
					useValue: config
				}
			],
			exports: providers
		}
	}

}
