import {FirebaseFilesystem} from "../lib/firebase_filesystem";
import {randomString} from "node-fs-local";
import {createFilesystemTestSuite} from "node-fs-local/dist/test";

describe('FirebaseFilesystem', function () {

	const fs = new FirebaseFilesystem(null);
	const testDir = randomString();

	createFilesystemTestSuite(testDir, fs);

	const dateIn = (days: number) => {
		const date = new Date();
		date.setDate(date.getDate() + days);
		return days;
	};

	describe('#getDownloadUrl()', () => {

		it('should asd', async () => {
			const downloadUrl = await fs.getDownloadUrl(`${testDir}/image.jpg`, dateIn(3), null);
		});

	});
});
