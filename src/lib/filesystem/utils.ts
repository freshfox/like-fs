import {Readable, Writable} from 'stream';
import * as crypto from 'crypto';

export function awaitWriteFinish(stream: Writable) {
	return new Promise((resolve, reject) => {
		stream.on('finish', resolve);
		stream.on('error', reject)
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
