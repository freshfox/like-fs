import 'reflect-metadata';
import * as fs from 'fs';
import {injectable} from 'inversify';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import {IFilesystem} from './filesystem';
import * as stream from "stream";
import {Stats} from "fs";

@injectable()
export class LocalFilesystem implements IFilesystem {

	exists(path: string): Promise<boolean> {
		return new Promise((resolve) => {
			fs.access(this.getPath(path), (err) => {
				resolve(!err);
			})
		});
	}

	mkdir(path: string): Promise<any> {
		return this.ensureDirectoryExists(path);
	}

	createWriteStream(file: string, opts?: any) {
		file = this.getPath(file);
		mkdirp.sync(path.dirname(file));
		return fs.createWriteStream(file, opts);
	}

	createReadStream(path: string, opts?: any) {
		return fs.createReadStream(this.getPath(path), opts);
	}

	readFile(path: string, encoding): Promise<string | Buffer> {
		return new Promise((resolve, reject) => {
			fs.readFile(this.getPath(path), encoding, (err, content) => {
				if (err) {
					reject(err);
				} else {
					resolve(content);
				}
			})
		});
	}

	writeStreamToFile(file: string, stream: stream.Readable, options?) {
		const absPath = this.getPath(file);
		return new Promise(async (resolve, reject) => {
			await this.ensureDirectoryExists(file);
			let fileStream = fs.createWriteStream(absPath, options);
			stream.pipe(fileStream);
			stream.on('end', () => {
				resolve(file);
			});
			stream.on('error', reject);
		});
	}

	async writeDataToFile(file: string, data, options?) {
		const absPath = this.getPath(file);
		await this.ensureDirectoryExists(file);
		return new Promise((resolve, reject) => {
			fs.writeFile(absPath, data, options, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(absPath);
				}
			});
		});
	}

	unlink(path: string) {
		return new Promise((resolve, reject) => {
			fs.unlink(this.getPath(path), (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
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
		return new Promise((resolve, reject) => {
			fs.readdir(this.getPath(path), (err, files) => {
				if (err) {
					reject(err);
				} else {
					resolve(files);
				}
			});
		});
	}

	ensureDirectoryExists(file: string) {
		const dir = path.dirname(this.getPath(file));
		return new Promise((resolve, reject) => {
			mkdirp(dir, (err) => {
				if (err) {
					return reject(err);
				}
				return resolve();
			});
		});
	}

	lstat(file: string): Promise<Stats> {
		const absPath = this.getPath(file);
		return new Promise((resolve, reject) => {
			fs.lstat(absPath, (err, stats) => {
				if (err) {
					reject(err);
				} else {
					resolve(stats);
				}
			})
		});
	}

	async dirSize(directory: string): Promise<number> {
		const files = await this.readDir(directory);
		let size = 0;
		for (const file of files) {
			const abs = path.join(directory, file);
			const stats = await this.lstat(abs);
			if (stats.isDirectory()) {
				const subSize = await this.dirSize(abs);
				size += subSize;
			} else {
				size += stats.size;
			}
		}
		return size;
	}
}
