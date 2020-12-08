import {DynamicModule, Provider} from "@nestjs/common";
import {GCSFilesystem, GCStorage, GCStorageConfig, IGCStorageConfig} from "./gcs_filesystem";
import {Storage} from "@google-cloud/storage";

export class GCSFilesystemModule {

	static forRoot(storage: Storage, config: IGCStorageConfig): DynamicModule {
		const providers: Provider[] = [
			GCSFilesystem,
			{
				provide: GCStorage,
				useValue: storage
			},
			{
				provide: GCStorageConfig,
				useValue: config
			}
		]
		return {
			module: GCSFilesystemModule,
			providers: providers,
			exports: providers,
		}
	}

}
