import {FirebaseStorageUtils} from "../lib";
import {awaitWriteFinish, randomString} from "like-fs";
import 'should';
import {getFirebaseFilesystem, getGCPFilesystem, loadEnv} from "../test";

describe('Utils', function () {

	loadEnv();
	const fs = getFirebaseFilesystem();
	const testDir = randomString();

	describe('#FirebaseStorageUtils', function () {

		it('should get api endpoint with a GCP Storage', async () => {
			const fs = getGCPFilesystem();
			const result = FirebaseStorageUtils.generateTokenAndUrl(fs, 'test.jpg');
			result.url.should.type('string').startWith('http');
			result.token.should.type('string');
		});

		it('should generate a url with a Firebase Storage', async () => {
			const result = FirebaseStorageUtils.generateTokenAndUrl(fs, 'test.jpg');
			result.url.should.type('string').startWith('http');
			result.token.should.type('string');
		});

	})

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
