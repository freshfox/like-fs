import {LocalFilesystem} from './local_file_system';
import path from 'path';
import {inject, injectable} from 'inversify';
import {randomString} from "./utils";
import {Inject, Injectable} from "@nestjs/common";

export const TmpFilesystemConfig = Symbol.for('LikeFS.TmpFilesystemConfig');

@injectable() @Injectable()
export class TmpFilesystem extends LocalFilesystem {

	private readonly directory = `/tmp/${randomString()}`;

	constructor(@inject(TmpFilesystemConfig) @Inject(TmpFilesystemConfig) private config: ITmpFilesystemConfig) {
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
