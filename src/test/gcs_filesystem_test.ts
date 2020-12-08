import {GCSFilesystem} from '../lib/gcs_filesystem';
import {randomString} from 'node-fs-local';
import {createFilesystemTestSuite} from 'node-fs-local/dist/test';
import {loadEnv} from './index';
import * as should from 'should';
import {Storage} from "@google-cloud/storage";

describe('GCSFilesystem', function () {

	loadEnv();

	const fs = new GCSFilesystem(new Storage(), {
		storageBucket: process.env.STORAGE_BUCKET
	});
	const testDir = randomString();

	createFilesystemTestSuite(testDir, fs);

	const dateIn = (days: number) => {
		const date = new Date();
		date.setDate(date.getDate() + days);
		return date;
	};

	describe('#getDownloadUrl()', () => {

		it('should create a download url', async () => {
			const downloadUrl = await fs.getDownloadUrl(`${testDir}/image.jpg`, dateIn(3), null);
			should(downloadUrl).type('string')
		});

	});
});
