import { randomUUID } from 'crypto';
import { IOnlineFilesystem } from 'like-fs';
import { GCSFilesystem, sanitizePath } from './gcs_filesystem';
import { CreateWriteStreamOptions } from '@google-cloud/storage';

export class FirebaseStorageUtils {
	static readonly META_TOKEN_KEY = 'firebaseStorageDownloadTokens';

	static createUrl(apiEndpoint: string, bucket: string, path: string, token: string) {
		return `${apiEndpoint}/v0/b/${bucket}/o/${encodeURIComponent(sanitizePath(path))}?alt=media&token=${token}`;
	}

	static generateTokenAndUrl(fs: IOnlineFilesystem, path: string) {
		const { apiEndpoint, bucket } = this.getConfig(fs);
		const token = randomUUID();
		return {
			token,
			url: this.createUrl(apiEndpoint, bucket, path, token),
		};
	}

	static async setNewFirebaseStorageUrl(fs: IOnlineFilesystem, path: string): Promise<string> {
		const { token, url } = this.generateTokenAndUrl(fs, path);
		await fs.setMetadata(path, {
			metadata: {
				[FirebaseStorageUtils.META_TOKEN_KEY]: token,
			},
		});
		return url;
	}

	static appendTokenToOptions(opts: CreateWriteStreamOptions | null, token: string): CreateWriteStreamOptions {
		opts = opts || {};
		opts.metadata = opts.metadata || {};
		opts.metadata.metadata = opts.metadata.metadata || {};
		opts.metadata.metadata[FirebaseStorageUtils.META_TOKEN_KEY] = token;
		return opts;
	}

	static async readToken(fs: IOnlineFilesystem, path: string): Promise<string | null> {
		const meta = await fs.getMetadata(path);
		if (meta.metadata) {
			return meta.me[FirebaseStorageUtils.META_TOKEN_KEY] || null;
		}
		return null;
	}

	private static getConfig(fs: IOnlineFilesystem) {
		if (fs instanceof GCSFilesystem) {
			return {
				bucket: fs.getBucketName(),
				apiEndpoint: fs.getApiEndpoint(),
			};
		}
		throw new Error(`${fs.constructor.name} must be an instance of GCSFilesystem`);
	}
}
