import 'reflect-metadata';
import fs, { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { IFilesystem } from './filesystem';
import stream from 'stream';
import { Stats, promises as fsPromise, mkdirSync, existsSync } from 'fs';
import { lstat, mkdir, open, readdir, readFile, rm, unlink, writeFile } from 'fs/promises';

export class LocalFilesystem implements IFilesystem {
	exists(path: string): Promise<boolean> {
		return Promise.resolve(existsSync(this.getPath(path)));
	}

	mkdir(path: string): Promise<any> {
		return mkdir(this.getPath(path));
	}

	createWriteStream(file: string, opts?: Parameters<typeof createWriteStream>[1]) {
		file = this.getPath(file);
		mkdirSync(file, { recursive: true });
		return createWriteStream(file, opts);
	}

	createReadStream(path: string, opts?: Parameters<typeof createReadStream>[1]) {
		return createReadStream(this.getPath(path), opts);
	}

	readFile(path: string, encoding: 'utf8' | 'utf-8'): Promise<string>;
	readFile(path: string, encoding?: Parameters<typeof readFile>[1]): Promise<string | Buffer> {
		return readFile(this.getPath(path), encoding);
	}

	async writeBuffer(file: string, flags: string, buffer: Buffer, position: number) {
		await this.ensureDirectoryExists(file);
		const fh = await open(this.getPath(file), flags);
		await fh.write(buffer, 0, buffer.length, position);
		await fh.close();
	}

	writeStreamToFile(file: string, stream: stream.Readable, options?: Parameters<typeof createWriteStream>[1]) {
		const absPath = this.getPath(file);
		return new Promise(async (resolve, reject) => {
			await this.ensureDirectoryExists(file);
			let fileStream = createWriteStream(absPath, options);
			stream.pipe(fileStream);
			stream.on('end', () => {
				resolve(file);
			});
			stream.on('error', reject);
		});
	}

	async writeDataToFile(
		file: string,
		data: Parameters<typeof writeFile>[1],
		options?: Parameters<typeof writeFile>[2]
	) {
		await this.ensureDirectoryExists(file);
		return writeFile(this.getPath(file), data, options);
	}

	unlink(path: string): Promise<void> {
		return unlink(this.getPath(path));
	}

	unlinkDir(path: string) {
		return rm(this.getPath(path), { recursive: true });
	}

	// noinspection JSMethodCanBeStatic
	getPath(path: string) {
		return path;
	}

	async readDir(path: string): Promise<string[]> {
		const dirExists = await this.exists(path);
		if (!dirExists) {
			return [];
		}
		return readdir(this.getPath(path));
	}

	ensureDirectoryExists(file: string): Promise<void> {
		const dir = path.dirname(this.getPath(file));
		return mkdir(dir);
	}

	lstat(file: string): Promise<Stats> {
		return lstat(this.getPath(file));
	}

	async dirSize(directory: string): Promise<number> {
		const files = await this.readDir(directory);
		let size = 0;
		for (const file of files) {
			const pathWithDirectory = path.join(directory, file);
			const stats = await this.lstat(pathWithDirectory);
			if (stats.isDirectory()) {
				const subSize = await this.dirSize(pathWithDirectory);
				size += subSize;
			} else {
				size += stats.size;
			}
		}
		return size;
	}

	async touch(path: string) {
		await this.ensureDirectoryExists(path);
		const absPath = this.getPath(path);
		return new Promise<void>((resolve, reject) => {
			const ts = Date.now();
			fs.utimes(absPath, ts, ts, (err) => {
				if (err) {
					fs.open(absPath, 'w', (err, fd) => {
						if (err) {
							return reject(err);
						}
						fs.close(fd, (err) => {
							if (err) {
								return reject(err);
							} else {
								return resolve();
							}
						});
					});
				}
				resolve();
			});
		});
	}
}
