import * as stream from 'stream';
import type { CreateWriteStreamOptions, GetSignedUrlConfig, Bucket } from '@google-cloud/storage';
import { Storage as FStorage } from 'firebase-admin/storage';
import { awaitWriteFinish, GetUrlOptions, IOnlineFilesystem, Stats } from 'like-fs';

export interface GCFileMetaData {
	kind?: string;
	id?: string;
	name?: string;
	contentType?: string;
	size?: string;
	timeCreated?: string;
	updated?: string;
	metadata: {
		[key: string]: string | number | undefined;
		firebaseStorageDownloadTokens?: string;
	};
}

export const LikeFsBucket = Symbol.for('LikeFS.LikeFsBucket');

type BucketFn = FStorage['bucket'];
type FBucket = ReturnType<BucketFn>;

export class GCSFilesystem implements IOnlineFilesystem<GCFileMetaData> {
	constructor(private readonly bucket: Bucket | FBucket) {}

	createWriteStream(file: string, opts?: CreateWriteStreamOptions): stream.Writable {
		return this.bucket.file(GCSFilesystem.sanitizePath(file)).createWriteStream({
			...opts,
			resumable: false,
		});
	}

	createReadStream(path: string, opts?: any): stream.Readable {
		return this.bucket.file(GCSFilesystem.sanitizePath(path)).createReadStream(opts);
	}

	async exists(path: string): Promise<boolean> {
		return (await this.bucket.file(GCSFilesystem.sanitizePath(path)).exists())[0];
	}

	mkdir(path: string): Promise<void> {
		return Promise.resolve();
	}

	async readFile(path: string, encoding?: string): Promise<string | Buffer> {
		const data = await this.bucket.file(path).download();
		const buffer = data[0];
		if (encoding === 'utf8') {
			return buffer.toString(encoding);
		}
		return buffer;
	}

	unlink(path: string): Promise<any> {
		return this.bucket.file(GCSFilesystem.sanitizePath(path)).delete();
	}

	writeStreamToFile(path: string, stream: stream.Readable, options?: CreateWriteStreamOptions): Promise<any> {
		const writeStream = this.createWriteStream(path, options);
		stream.pipe(writeStream);
		return awaitWriteFinish(writeStream);
	}

	async readDir(path: string): Promise<string[]> {
		path = path[path.length - 1] === '/' ? path : `${path}/`;
		const resp = await this.bucket.getFiles({
			prefix: path,
		});
		const files = resp[0];
		return files
			.map((file) => {
				const name = file.metadata.name;
				return name.substr(path.length);
			})
			.filter((s) => s);
	}

	async getUploadUrl(path: string, validUntil: Date, opts?: Partial<GetSignedUrlConfig>) {
		opts = opts || {};
		const resp = await this.bucket.file(GCSFilesystem.sanitizePath(path)).getSignedUrl(<GetSignedUrlConfig>{
			version: 'v4',
			action: 'write',
			expires: validUntil,
			...opts,
		});
		return resp[0];
	}

	async getDownloadUrl(path: string, validUntil: Date, options?: GetUrlOptions): Promise<string> {
		const dateStr = validUntil.toISOString().substring(0, 10);
		const resp = await this.bucket.file(GCSFilesystem.sanitizePath(path)).getSignedUrl({
			action: 'read',
			expires: dateStr,
			contentType: options && options.contentType ? options.contentType : undefined,
		});
		return resp[0];
	}

	async lstat(path: string): Promise<Stats> {
		const metadata = await this.getMetadata(GCSFilesystem.sanitizePath(path));
		return {
			size: parseInt(metadata.size || '0', 10) || 0,
			birthtime: new Date(metadata.timeCreated || 0),
			mtime: new Date(metadata.updated || 0),
		};
	}

	async getMetadata(path: string): Promise<GCFileMetaData> {
		const meta = await this.bucket.file(GCSFilesystem.sanitizePath(path)).getMetadata();
		return meta[0];
	}

	async setMetadata(path: string, metadata: GCFileMetaData): Promise<GCFileMetaData> {
		const res = await this.bucket.file(GCSFilesystem.sanitizePath(path)).setMetadata(metadata, {});
		return res[0];
	}

	makePublic(path: string) {
		return this.bucket.file(GCSFilesystem.sanitizePath(path)).makePublic();
	}

	getPublicUrl(path: string) {
		return `https://${this.getBucketName()}.storage.googleapis.com/${GCSFilesystem.sanitizePath(path)}`;
	}

	getBucketName() {
		return this.bucket.name;
	}

	getApiEndpoint(): string {
		return this.bucket.storage.apiEndpoint;
	}

	private static sanitizePath(path: string) {
		if (path.startsWith('/')) {
			return path.substring(1);
		}
		return path;
	}
}
