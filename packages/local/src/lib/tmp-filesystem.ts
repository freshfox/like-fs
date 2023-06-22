import { join } from 'path';
import { randomString } from './utils';
import { tmpdir } from 'os';
import { LocalFilesystem } from './local-filesystem';

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
