import { LocalFilesystem } from './local_file_system';
import { ITmpFilesystemConfig, TmpFilesystem, TmpFilesystemConfig } from './tmp_file_system';
import { DynamicModule, Provider } from '@nestjs/common';
import { DynamicModuleBuilder, ExternalProvider } from './di';

const baseProviders: Provider[] = [TmpFilesystem, LocalFilesystem];

export class FilesystemNestModule {
	static forRoot(config: ITmpFilesystemConfig): DynamicModule {
		const provider: Provider[] = [
			LocalFilesystem,
			TmpFilesystem,
			{
				provide: TmpFilesystemConfig,
				useValue: config,
			},
		];
		return {
			module: FilesystemNestModule,
			providers: provider,
			exports: provider,
		};
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
