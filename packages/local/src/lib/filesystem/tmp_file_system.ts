import { LocalFilesystem } from './local_file_system';
import { join } from 'path';
import { randomString } from './utils';
import { Injectable } from '@nestjs/common';
import { tmpdir } from 'os';

@Injectable()
export class TmpFilesystem extends LocalFilesystem {
	private readonly directory: string;

	constructor(private config?: ITmpFilesystemConfig) {
		super();
		this.directory = `/${tmpdir()}/${this.config?.tmpDirectory || randomString()}`;
	}

	getPath(file: string) {
		return join(this.directory, file);
	}
}

export interface ITmpFilesystemConfig {
	tmpDirectory: string;
}
