import {LocalFilesystem} from './local_file_system';
import {join} from 'path';
import {randomString} from "./utils";
import {Inject, Injectable} from "@nestjs/common";

export const TmpFilesystemConfig = Symbol.for('LikeFS.TmpFilesystemConfig');

@Injectable()
export class TmpFilesystem extends LocalFilesystem {

	private readonly directory = `/tmp/${randomString()}`;

	constructor(@Inject(TmpFilesystemConfig) private config: ITmpFilesystemConfig) {
		super();
		if (this.config.tmpDirectory) {
			this.directory = this.config.tmpDirectory;
		}
	}

	getPath(file: string) {
		return join(this.directory, file)
	}

}

export interface ITmpFilesystemConfig {
	tmpDirectory?: string;
}
