import {loadEnv} from "./index";
import {GCSFilesystem} from "../lib";
import {Storage} from "@google-cloud/storage";
import {awaitWriteFinish, randomString} from "like-fs";
import 'should';

describe('Utils', function () {

	loadEnv();

	const fs = new GCSFilesystem(new Storage(), {
		storageBucket: process.env.STORAGE_BUCKET,
	});
	const testDir = randomString();

	describe('#awaitWriteFinish()', function () {

		it('should await an write stream finish', async () => {

			const file = `${testDir}/test-1.txt`;
			const write = fs.createWriteStream(file);
			setTimeout(() => {
				write.write('Data', 'utf8', () => {
					write.end();
				})
			}, 100);
			await awaitWriteFinish(write);
			await fs.readFile(file, 'utf8').should.resolvedWith('Data');

		});

		it('should await an already finished write stream', async () => {

			const file = `${testDir}/test-2.txt`;
			const write = fs.createWriteStream(file);
			await new Promise((resolve) => {
				write.write('Data', 'utf8', () => {
					write.end(resolve);
				});
			})
			await awaitWriteFinish(write);
			await fs.readFile(file, 'utf8').should.resolvedWith('Data');

		});

	});

});
