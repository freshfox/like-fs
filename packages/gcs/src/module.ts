import { DynamicModule, FactoryProvider, ModuleMetadata } from '@nestjs/common';
import { GCSFilesystem, LikeFsBucket } from './gcs_filesystem';
import type { Bucket } from '@google-cloud/storage';
import { ClassProvider, ExistingProvider, ValueProvider } from '@nestjs/common/interfaces/modules/provider.interface';

export class GCSFilesystemModule {
	static forRoot(storage: Bucket): DynamicModule {
		return {
			module: GCSFilesystemModule,
			providers: [
				GCSFilesystem,
				{
					provide: LikeFsBucket,
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
			providers: [GCSFilesystem, provide(LikeFsBucket, options.bucketProvider)],
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
	bucketProvider: ExternalProvider<Bucket>;
}
