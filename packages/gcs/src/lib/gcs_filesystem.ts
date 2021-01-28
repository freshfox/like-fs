import * as stream from 'stream';
import {GetSignedUrlConfig, Storage, StorageOptions} from '@google-cloud/storage';
import {awaitWriteFinish, GetUrlOptions, IOnlineFilesystem, Stats} from 'like-fs';
import {v4 as uuid} from 'uuid';
import {inject, injectable} from "./di";
import {FirebaseUtils} from "./utils";

export interface GCFileMetaData {
	kind?: string,
	id?: string;
	name?: string;
	contentType?: string;
	size?: string;
	timeCreated?: string;
	updated?: string;
	metadata: {
		[key: string]: string | number;
		firebaseStorageDownloadTokens?: string
	}
}

export const GCStorage = Symbol('GCStorage');
export const GCStorageConfig = Symbol('GCStorageConfig');

export interface IGCStorageConfig {
	storageBucket: string;
	storageOptions?: StorageOptions;
}

@injectable()
export class GCSFilesystem implements IOnlineFilesystem<GCFileMetaData> {

	constructor(@inject(GCStorage) private readonly storage: Storage,
				@inject(GCStorageConfig) private readonly config: IGCStorageConfig) {
	}

	createWriteStream(file: string, opts?: any): stream.Writable {
		return this.getBucket().file(file).createWriteStream({
			...opts,
			resumable: false,
		});
	}

	createReadStream(path: string, opts?: any): stream.Readable {
		return this.getBucket().file(path).createReadStream(opts);
	}

	async exists(path: string): Promise<boolean> {
		return (await this.getBucket().file(path).exists())[0];
	}

	mkdir(path: string): Promise<void> {
		return Promise.resolve();
	}

	async readFile(path: string, encoding?: string): Promise<string | Buffer> {
		const data = await this.getBucket().file(path).download();
		const buffer = data[0];
		if (encoding === 'utf8') {
			return buffer.toString(encoding);
		}
		return buffer;
	}

	unlink(path: string): Promise<any> {
		return this.getBucket().file(path).delete();
	}

	writeStreamToFile(path: string, stream: stream.Readable, options?: any): Promise<any> {
		const writeStream = this.createWriteStream(path, options);
		stream.pipe(writeStream);
		return awaitWriteFinish(writeStream);
	}

	async readDir(path: string): Promise<string[]> {
		path = path[path.length - 1] === '/' ? path : `${path}/`;
		const resp = await this.getBucket().getFiles({
			prefix: path
		});
		const files = resp[0];
		return files.map((file) => {
			const name = file.metadata.name;
			return name.substr(path.length);
		}).filter(s => s);
	}

	async getUploadUrl(path: string, validUntil: Date, opts?: Partial<GetSignedUrlConfig>) {
		opts = opts || {};
		const resp = await this.getBucket().file(path).getSignedUrl(<GetSignedUrlConfig>{
			version: 'v4',
			contentType: 'video/mp4',
			action: 'write',
			expires: validUntil,
		});
		return resp[0];
	}

	async getDownloadUrl(path: string, validUntil: Date, options?: GetUrlOptions): Promise<string> {
		const dateStr = validUntil.toISOString().substring(0, 10);
		const resp = await this.getBucket().file(path).getSignedUrl({
			action: 'read',
			expires: dateStr,
			contentType: options && options.contentType ? options.contentType : null
		});
		return resp[0];
	}

	async lstat(path: string): Promise<Stats> {
		const metadata = await this.getMetadata(path);
		const size = parseInt(metadata.size, 10) || 0;
		return {size};
	}

	async getMetadata(path: string): Promise<GCFileMetaData> {
		const meta = await this.getBucket().file(path).getMetadata();
		return meta[0];
	}

	async setMetadata(path: string, metadata: GCFileMetaData): Promise<GCFileMetaData> {
		const res = await this.getBucket().file(path).setMetadata(metadata, {});
		return res[0];
	}

	makePublic(path: string) {
		return this.getBucket().file(path).makePublic();
	}

	getPublicUrl(path: string) {
		return `https://${this.config.storageBucket}.storage.googleapis.com/${path}`;
	}

	private getBucket() {
		return this.storage.bucket(this.config.storageBucket);
	}

	/**@deprecated Use FirebaseUtils instead*/
	static createUrl(bucket: string, path: string, token: string){
		return FirebaseUtils.createUrl(bucket, path, token);
	}

	/**@deprecated Use FirebaseUtils instead*/
	static generateTokenAndUrl(bucket: string, path: string) {
		return FirebaseUtils.generateTokenAndUrl(bucket, path);
	}
}
