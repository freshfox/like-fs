import {LocalFilesystem} from './local_file_system';
import {Filesystem, IFilesystem} from './filesystem';
import {ITmpFilesystemConfig, TmpFilesystem, TmpFilesystemConfig} from './tmp_file_system';
import {ContainerModule, interfaces} from 'inversify';
import {DynamicModule, Module, Provider} from "@nestjs/common";
import {DynamicModuleBuilder, ExternalProvider} from "./di";

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

const baseProviders: Provider[] = [
	TmpFilesystem,
	LocalFilesystem,
];

export class FilesystemNestModule {

	static forRoot(config: ITmpFilesystemConfig): DynamicModule {
		return {
			module: FilesystemNestModule,
			providers: [
				LocalFilesystem,
				TmpFilesystem,
				{
					provide: TmpFilesystemConfig,
					useValue: config
				}
			],
			exports: [FilesystemNestModule]
		}
	}

	static register(tmpConfig: ExternalProvider<ITmpFilesystemConfig>): DynamicModuleBuilder {
		return new FilesystemNestModuleBuilder(tmpConfig);
	}
}

class FilesystemNestModuleBuilder extends DynamicModuleBuilder {

	constructor(tmpConfig: ExternalProvider<ITmpFilesystemConfig>) {
		super(FilesystemNestModule);
		this.addExternalProvider(TmpFilesystemConfig, tmpConfig);
		this.exports(...baseProviders);
	}

}
