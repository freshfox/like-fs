import {DynamicModule, Module, ModuleMetadata} from "@nestjs/common";
import {FilesystemNestModule} from "node-fs-local";
import {FirebaseFilesystem} from "./firebase_filesystem";

const moduleDesc: ModuleMetadata = {
	imports: [FilesystemNestModule],
	providers: [
		FirebaseFilesystem
	],
	exports: [
		FirebaseFilesystem
	],
}

@Module(moduleDesc)
export class FirebaseFilesystemModule {

	static forRoot(): DynamicModule {
		return {
			module: FirebaseFilesystemModule,
			...moduleDesc
		}
	}

}
