import * as env from 'node-env-file';
import * as fs from "fs";

export function loadEnv() {
	const path = __dirname + '/../../.env';
	if(fs.existsSync(path)){
		env(path);
	}
}
