import {LocalFilesystem} from './local_file_system';
import * as path from 'path';
import {inject, injectable} from 'inversify';
import {randomString} from "./utils";

export const TmpFilesystemConfig = Symbol('TmpFilesystemConfig');

@injectable()
export class TmpFilesystem extends LocalFilesystem {

	private readonly directory = `/tmp/${randomString()}`;

	constructor(@inject(TmpFilesystemConfig) private config: ITmpFilesystemConfig) {
		super();
		if (this.config.tmpDirectory) {
			this.directory = this.config.tmpDirectory;
		}
	}

	getPath(file: string) {
		return path.join(this.directory, file)
	}

}

export interface ITmpFilesystemConfig {
	tmpDirectory?: string;
}
