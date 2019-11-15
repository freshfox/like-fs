import {Writable} from "stream";

export function awaitWriteFinish(stream: Writable) {
	return new Promise((resolve, reject) => {
		stream.on('finish', resolve);
		stream.on('error', reject)
	});
}
