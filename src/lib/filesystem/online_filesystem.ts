import {IFilesystem} from './filesystem';

export interface IOnlineFilesystem extends IFilesystem {

	getUploadUrl(path: string, validUntil: Date, options?: GetUrlOptions): Promise<string>;

	getDownloadUrl(path: string, validUntil: Date, options?: GetUrlOptions): Promise<string>;

	setMetadata(path: string, metadata: any): Promise<any>;

	getMetadata(path: string): Promise<any>

}

export interface GetUrlOptions {
	contentType?: string;
	[key: string]: any
}
