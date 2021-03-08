import {GCSFilesystem} from '../lib/gcs_filesystem';
import {awaitWriteFinish, randomString, TmpFilesystem, writeToStream} from 'like-fs';
import {createFilesystemTestSuite} from 'like-fs/dist/test';
import {loadEnv} from './index';
import should from 'should';
import {Storage} from "@google-cloud/storage";

describe('GCSFilesystem', function () {

	loadEnv();

	const fs = new GCSFilesystem(new Storage(), {
		storageBucket: process.env.STORAGE_BUCKET,
	});
	const testDir = randomString();
	const tmpFs = new TmpFilesystem({});

	createFilesystemTestSuite(testDir, fs);

	const dateIn = (days: number) => {
		const date = new Date();
		date.setDate(date.getDate() + days);
		return date;
	};

	it('should write and read a file starting with a /', async () => {
		const file = `/${testDir}/text.txt`;
		await fs.writeStreamToFile(file, writeToStream('test'));
		await tmpFs.writeStreamToFile('text.txt', fs.createReadStream(file));
		const data = await tmpFs.readFile('text.txt', 'utf8');
		data.should.eql('test');
	});

	describe('#getDownloadUrl()', () => {

		it('should create a download url', async () => {
			const downloadUrl = await fs.getDownloadUrl(`${testDir}/image.jpg`, dateIn(3), null);
			should(downloadUrl).type('string')
		});
	});

	describe('#getBucketName()', function () {
		it('should get the buckets name', async () => {
			const name = fs.getBucketName();
			should(name).eql(process.env.STORAGE_BUCKET).type('string');
		});
	});
});
