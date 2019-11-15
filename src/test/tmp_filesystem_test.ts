import {TmpFilesystem} from "../lib/filesystem/tmp_file_system";
import {randomString} from "../lib/filesystem/utils";
import {createFilesystemTestSuite} from "../lib/filesystem/filesystem_test_suite";
import * as should from 'should';

describe('TmpFilesystem', () => {

	const fs = new TmpFilesystem({
		tmpDirectory: `/tmp/node-fs-local`
	});

	createFilesystemTestSuite(randomString(), fs);

	describe('#dirStat', () => {
		it('should get directory stats', async () => {

			const dir = 'some-dir';
			const subDir = `${dir}/some-sub-dir`;
			let data = 'The content of this file should not change';
			await fs.writeDataToFile(`${dir}/fixed_size_file_0.txt`, data);
			await fs.writeDataToFile(`${dir}/fixed_size_file_1.txt`, data);
			await fs.writeDataToFile(`${dir}/fixed_size_file_2.txt`, data);
			await fs.writeDataToFile(`${dir}/fixed_size_file_3.txt`, data);

			await fs.writeDataToFile(`${subDir}/fixed_size_file_4.txt`, data);
			await fs.writeDataToFile(`${subDir}/fixed_size_file_5.txt`, data);
			await fs.writeDataToFile(`${subDir}/fixed_size_file_6.txt`, data);
			await fs.writeDataToFile(`${subDir}/fixed_size_file_7.txt`, data);

			const start = Date.now();
			const size = await fs.dirSize(dir);
			should(size).eql(8 * data.length);

		});
	});

});
