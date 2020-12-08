import {DynamicModule} from "@nestjs/common";
import {FilesystemNestModule, ITmpFilesystemConfig} from "node-fs-local";
import {GCSFilesystem} from "./gcs_filesystem";

export class GCSFilesystemModule {

	static forRoot(config: ITmpFilesystemConfig): DynamicModule {
		const fsModule = FilesystemNestModule.forRoot(config);
		return {
			module: GCSFilesystemModule,
			imports: [FilesystemNestModule],
			providers: [
				GCSFilesystem
			],
			exports: [
				GCSFilesystem,
				fsModule
			],
		}
	}

}
