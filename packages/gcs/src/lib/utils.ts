import {v4 as uuid} from "uuid";
import {IOnlineFilesystem} from "like-fs";

export class FirebaseUtils {

	static createUrl(bucketOrFs: string | IOnlineFilesystem, path: string, token: string) {
		let bucketName = typeof bucketOrFs === 'string' ? bucketOrFs : bucketOrFs.getBucketName();
		return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media&token=${token}`
	}

	static generateTokenAndUrl(bucket: string | IOnlineFilesystem, path: string) {
		const token = uuid();
		return {
			token,
			url: this.createUrl(bucket, path, token)
		}
	}

	static async generateFirebaseStorageUrl(fs: IOnlineFilesystem, path: string): Promise<string> {
		const {token, url} = this.generateTokenAndUrl(fs.getBucketName(), path);
		await fs.setMetadata(path, {
			metadata: {
				firebaseStorageDownloadTokens: token
			}
		});
		return url;
	}

}
