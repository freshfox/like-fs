import {Readable, Writable} from 'stream';
import crypto from 'crypto';
import {get as getHttps} from 'https';
import {get as getHttp, IncomingMessage} from "http";

export function awaitWriteFinish(stream: Writable): Promise<void> {
	if (stream['writable'] === false) {
		return;
	}
	return new Promise<void>((resolve, reject) => {
		stream.once('finish', resolve);
		stream.once('error', reject)
	});
}

export function randomString() {
	return crypto.randomBytes(20).toString('hex');
}

export function writeToStream(data: any): Readable {
	const s = new Readable();
	s._read = function noop() {};
	s.push(data);
	s.push(null);
	return s;
}

class ResponseError extends Error {

	constructor(readonly response: IncomingMessage) {
		super(`Request returned status code ${response.statusCode}`);
	}

}

export async function downloadFileFromUrl(url: string, writeStream: Writable) {
	const resp = await new Promise<IncomingMessage>((resolve, reject) => {

		let get = getHttp;
		if (url.startsWith('https')) {
			get = getHttps
		}

		get(url, (resp) => {
			if (resp.statusCode >= 400) {
				reject(new ResponseError(resp));
			} else {
				resolve(resp)
			}
		});
	});
	resp.pipe(writeStream);
	return awaitWriteFinish(writeStream)
}
