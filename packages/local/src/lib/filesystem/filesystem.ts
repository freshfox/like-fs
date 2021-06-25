import {Readable, Writable} from "stream";

export const FilesystemConfig = Symbol.for('LikeFS.FilesystemConfig');

export const Filesystem = Symbol.for('LikeFS.Filesystem');

export interface IFilesystem {

	createWriteStream(path: string, opts?: any): Writable;

	createReadStream(path: string, opts?: any): Readable;

	readFile(path: string, encoding?: string): Promise<string|Buffer>;

	exists(path: string): Promise<boolean>;

	writeStreamToFile(path: string, stream: Readable, options?): Promise<any>;

	unlink(path: string): Promise<void>;

	mkdir(path: string): Promise<void>;

	readDir(path: string): Promise<string[]>

	lstat(path: string): Promise<Stats>

}

export interface Stats {
	/**
	 * File size in bytes
	 */
	size: number

	/**
	 * Date when the file was modified
	 */
	mtime: Date;

	/**
	 * Date when the file was created
	 */
	birthtime: Date;

}
