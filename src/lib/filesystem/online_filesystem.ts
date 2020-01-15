import {IFilesystem} from './filesystem';

export interface IOnlineFilesystem<Meta = any> extends IFilesystem {

	getUploadUrl(path: string, validUntil: Date, options?: GetUrlOptions): Promise<string>;

	getDownloadUrl(path: string, validUntil: Date, options?: GetUrlOptions): Promise<string>;

	setMetadata(path: string, metadata: Meta): Promise<Meta>;

	getMetadata(path: string): Promise<Meta>

}

export interface GetUrlOptions {
	contentType?: string;
	[key: string]: any
}
