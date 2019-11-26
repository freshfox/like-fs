import {FirebaseFilesystem} from '../lib/firebase_filesystem';
import {randomString} from 'node-fs-local';
import {createFilesystemTestSuite} from 'node-fs-local/dist/test';
import * as admin from 'firebase-admin';
import {loadEnv} from './index';
import * as should from 'should';

describe('FirebaseFilesystem', function () {

	loadEnv();

	admin.initializeApp({
		credential: admin.credential.applicationDefault(),
		storageBucket: process.env.STORAGE_BUCKET,
		databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
	});

	const fs = new FirebaseFilesystem(admin.storage());
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
