import env from 'node-env-file';
import fs from "fs";

export function loadEnv() {
	const path = __dirname + '/../../.env';
	if(fs.existsSync(path)){
		env(path);
	}
}
