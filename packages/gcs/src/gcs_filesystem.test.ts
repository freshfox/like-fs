import { createFilesystemTestSuite, randomString, TmpFilesystem, writeToStream } from 'like-fs';
import should from 'should';
import { GCSFilesystem } from './gcs_filesystem';
import { getFirebaseFilesystem } from './test-utils';
import { FirebaseStorageUtils } from './utils';

describe('GCSFilesystem', function () {
	const fs = getFirebaseFilesystem();
	const testDir = randomString();
	const tmpFs = new TmpFilesystem();

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

	it('should create a public write stream', async () => {
		const file = `/${testDir}/text-public.txt`;
		const { token } = FirebaseStorageUtils.generateTokenAndUrl(fs, file);
		await fs.writeStreamToFile(file, writeToStream('test'), FirebaseStorageUtils.appendTokenToOptions(null, token));
		await tmpFs.writeStreamToFile('text-public-downloaded.txt', fs.createReadStream(file));
		const data = await tmpFs.readFile('text-public-downloaded.txt', 'utf8');
		data.should.eql('test');
	});

	describe('#getBucketName()', function () {
		it('should get the buckets name', async () => {
			const name = fs.getBucketName();
			should(name).eql(process.env.GCS_BUCKET).type('string');
		});
	});
});
