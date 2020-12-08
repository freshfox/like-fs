import {DynamicModule, Provider} from "@nestjs/common";
import {GCSFilesystem, GCStorage, GCStorageConfig, IGCStorageConfig} from "./gcs_filesystem";
import {Storage} from "@google-cloud/storage";

export class GCSFilesystemModule {

	static forRoot(config: IGCStorageConfig): DynamicModule {
		const storage = new Storage(config.storageOptions);
		const providers: Provider[] = [
			GCSFilesystem,
			{
				provide: GCStorageConfig,
				useValue: config
			},
			{
				provide: GCStorage,
				useValue: storage
			}
		]
		return {
			module: GCSFilesystemModule,
			providers: providers,
			exports: providers,
		}
	}

}
