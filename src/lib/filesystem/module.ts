import {LocalFilesystem} from './local_file_system';
import {Filesystem, IFilesystem} from './filesystem';
import {ITmpFilesystemConfig, TmpFilesystem, TmpFilesystemConfig} from './tmp_file_system';
import {ContainerModule, interfaces} from 'inversify';
import {
	ClassProvider,
	DynamicModule,
	FactoryProvider,
	Module,
	ModuleMetadata,
	Provider,
	Type,
	ValueProvider
} from "@nestjs/common";

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

export interface IFilesystemModuleOptions extends Pick<ModuleMetadata, 'imports'> {
	fsProvider: ExternalProvider<IFilesystem>,
	tmpConfig?: ExternalProvider<ITmpFilesystemConfig>
}

type ExternalProvider<T> =
	Omit<ClassProvider<T>, 'provide'> |
	Omit<FactoryProvider<T>, 'provide'> |
	Omit<ValueProvider<T>, 'provide'>;

type InjectionToken = ClassProvider['provide'];

function addExternalProvider<T>(providers: Provider[], provide: InjectionToken, external: ExternalProvider<T>) {
	const classProvider = external as Omit<ClassProvider<T>, 'provide'>;
	if ((external as ClassProvider).useClass) {
		providers.push({
			provide: classProvider.useClass,
			useClass: classProvider.useClass,
			scope: classProvider.scope
		});
	}
	providers.push({
		...external,
		provide: provide
	});
}

@Module({
	providers: baseProviders,
	exports: baseProviders,
})
export class FilesystemNestModule {

	static forRoot(fs: Type<IFilesystem>, config: ITmpFilesystemConfig): DynamicModule {
		return this.register({
			fsProvider: {
				useClass: fs
			},
			tmpConfig: {
				useValue: config
			}
		});
	}

	static register(options: IFilesystemModuleOptions): DynamicModule {
		const providers = [
			...baseProviders
		];
		addExternalProvider(providers, Filesystem, options.fsProvider);
		if (options.tmpConfig) {
			addExternalProvider(providers, TmpFilesystemConfig, options.tmpConfig);
		}
		return {
			module: FilesystemNestModule,
			imports: options.imports || [],
			providers: providers,
			exports: providers
		};
	}
}
