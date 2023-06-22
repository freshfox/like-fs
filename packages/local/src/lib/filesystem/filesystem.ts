import { Readable, Writable } from 'stream';

export interface IFilesystem {
	createWriteStream(path: string, opts?: any): Writable;

	createReadStream(path: string, opts?: any): Readable;

	readFile(path: string, encoding?: any): Promise<string | Buffer>;

	exists(path: string): Promise<boolean>;

	writeStreamToFile(path: string, stream: Readable, options?: any): Promise<any>;

	unlink(path: string): Promise<void>;

	mkdir(path: string): Promise<void>;

	readDir(path: string): Promise<string[]>;

	lstat(path: string): Promise<Stats>;
}

export interface Stats {
	/**
	 * File size in bytes
	 */
	size: number;

	/**
	 * Date when the file was modified
	 */
	mtime: Date;

	/**
	 * Date when the file was created
	 */
	birthtime: Date;
}
