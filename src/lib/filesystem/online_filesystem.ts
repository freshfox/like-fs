import {IFilesystem} from './filesystem';

export interface IOnlineFilesystem extends IFilesystem {

	getUploadUrl(path: string, validUntil: Date, options?: GetUrlOptions): Promise<string>;

	getDownloadUrl(path: string, validUntil: Date, options?: GetUrlOptions): Promise<string>;

	setMetadata<M>(path: string, metadata: M): Promise<any>;

	getMetadata<M>(path: string): Promise<M>

}

export interface GetUrlOptions {
	contentType?: string;
	[key: string]: any
}
