import {injectable} from "inversify";
import {Injectable} from "@nestjs/common";
import {TmpFilesystem} from "./tmp_file_system";
import {IOnlineFilesystem} from "./online_filesystem";

@injectable() @Injectable()
class FakeOnlineFilesystem extends TmpFilesystem implements IOnlineFilesystem {

	private metadata: { [path: string]: any; } = {};

	getDownloadUrl(file: string) {
		return Promise.resolve(file);
	}

	getUploadUrl(file: string) {
		return Promise.resolve(file);
	}

	setMetadata(path: string, metadata: any) {
		return Promise.resolve(this.metadata[path] = metadata);
	}

	getMetadata(path: string): Promise<any> {
		return Promise.resolve(this.metadata[path]);
	}

	getBucketName(): string {
		return 'imaginary_bucket';
	}
}
