import { randomUUID } from 'crypto';
import { IOnlineFilesystem } from 'like-fs';
import { GCSFilesystem } from './gcs_filesystem';

export class FirebaseStorageUtils {
	static createUrl(apiEndpoint: string, bucket: string, path: string, token: string) {
		return `${apiEndpoint}/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
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
				firebaseStorageDownloadTokens: token,
			},
		});
		return url;
	}

	static async readToken(fs: IOnlineFilesystem, path: string): Promise<string | null> {
		const meta = await fs.getMetadata(path);
		return meta.metadata?.firebaseStorageDownloadTokens || null;
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
