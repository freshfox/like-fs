import { DynamicModule, FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import { GCSFilesystem, GCStorage, GCStorageConfig, IGCStorageConfig } from './gcs_filesystem';
import type { Storage as GCPStorage } from '@google-cloud/storage';
import type { Storage as FirebaseStorage } from 'firebase-admin/storage';
import { ClassProvider, ExistingProvider, ValueProvider } from '@nestjs/common/interfaces/modules/provider.interface';

export class GCSFilesystemModule {
	static forRoot(storage: GCPStorage | FirebaseStorage, config: IGCStorageConfig): DynamicModule {
		return {
			module: GCSFilesystemModule,
			providers: [
				GCSFilesystem,
				{
					provide: GCStorageConfig,
					useValue: config,
				},
				{
					provide: GCStorage,
					useValue: storage,
				},
			],
			exports: [GCSFilesystem],
		};
	}

	static forRootAsync(options: GCSFilesystemModuleOptions): DynamicModule {
		return {
			imports: options.imports || [],
			module: GCSFilesystemModule,
			providers: [
				GCSFilesystem,
				provide(GCStorage, options.storageProvider),
				provide(GCStorageConfig, options.configProvider),
			],
			exports: [GCSFilesystem],
		};
	}
}

export type Provider<T> = ClassProvider<T> | ValueProvider<T> | FactoryProvider<T> | ExistingProvider<T>;

export type ExternalProvider<T> = Omit<Provider<T>, 'provide'>;

function provide<T>(p: Provider<T>['provide'], external: ExternalProvider<T>): Provider<T> {
	return {
		provide: p,
		...external,
	} as Provider<T>;
}

export interface GCSFilesystemModuleOptions {
	imports: ModuleMetadata['imports'];
	storageProvider: ExternalProvider<GCPStorage | FirebaseStorage>;
	configProvider: ExternalProvider<IGCStorageConfig>;
}
