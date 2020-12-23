import {DynamicModule, FactoryProvider, ModuleMetadata, Provider, Type} from "@nestjs/common";
import {GCSFilesystem, GCStorage, GCStorageConfig, IGCStorageConfig} from "./gcs_filesystem";
import {Storage} from "@google-cloud/storage";

export class GCSFilesystemModule {

	static forRoot(config: IGCStorageConfig): DynamicModule {
		return {
			module: GCSFilesystemModule,
			providers: [
				GCSFilesystem,
				{
					provide: GCStorageConfig,
					useValue: config
				},
				{
					provide: GCStorage,
					useValue: new Storage(config.storageOptions)
				}
			],
			exports: [
				GCSFilesystem
			],
		}
	}

	static forRootAsync(options: GCSFilesystemModuleAsyncOptions): DynamicModule{
		return {
			imports: options.imports || [],
			module: GCSFilesystemModule,
			providers: [
				GCSFilesystem,
				{
					provide: GCStorage,
					useFactory: (config: IGCStorageConfig) => {
						return new Storage(config.storageOptions);
					},
					inject: [GCStorageConfig]
				},
				...this.createConnectProviders(options)
			],
			exports: [
				GCSFilesystem
			],
		};
	}

	private static createConnectProviders(
		options: GCSFilesystemModuleAsyncOptions,
	): Provider[] {
		if (options.useExisting || options.useFactory) {
			return [this.createConnectOptionsProvider(options)];
		}

		// for useClass
		return [
			this.createConnectOptionsProvider(options),
			{
				provide: options.useClass,
				useClass: options.useClass,
			},
		];
	}

	private static createConnectOptionsProvider(
		options: GCSFilesystemModuleAsyncOptions,
	): Provider {
		if (options.useFactory) {

			// for useFactory
			return {
				provide: GCStorageConfig,
				useFactory: options.useFactory,
				inject: options.inject || [],
			};
		}

		// For useExisting...
		return {
			provide: GCStorageConfig,
			useFactory: async (optionsFactory: GCSFilesystemOptionsFactory) =>
				await optionsFactory.createGCSFilesystemOptions(),
			inject: [options.useExisting || options.useClass],
		};
	}
}

export interface GCSFilesystemOptionsFactory {
	createGCSFilesystemOptions(): Promise<IGCStorageConfig> | IGCStorageConfig;
}

export interface GCSFilesystemModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {

	/**
	 * Existing Provider to be used.
	 */
	useExisting?: Type<GCSFilesystemOptionsFactory>;

	/**
	 * Type (class name) of provider (instance to be registered and injected).
	 */
	useClass?: Type<GCSFilesystemOptionsFactory>;

	/**
	 * Factory function that returns an instance of the provider to be injected.
	 */
	useFactory?: (
		...args: any[]
	) => Promise<IGCStorageConfig> | IGCStorageConfig;

	/**
	 * Optional list of providers to be injected into the context of the Factory function.
	 */
	inject?: FactoryProvider['inject'];
}
