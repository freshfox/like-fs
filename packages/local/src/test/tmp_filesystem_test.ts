import {TmpFilesystem} from "../lib/filesystem/tmp_file_system";
import {randomString} from "../lib/filesystem/utils";
import {createFilesystemTestSuite} from "./filesystem_test_suite";
import should from 'should';

describe('TmpFilesystem', () => {

	const fs = new TmpFilesystem({
		tmpDirectory: `/tmp/node-fs-local`
	});

	createFilesystemTestSuite(randomString(), fs);

	describe('#dirStat()', () => {
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

	describe('#touch', () => {

		it('should touch a file', async () => {
			const file = 'touch-me.txt';
			await fs.touch(file);
			await fs.touch(file);
			const exists = await fs.exists(file);
			should(exists).true()
		});

	});

	describe('#writeBuffer', function () {

		it('should overwrite contents of a file at the beginning', async () => {

			const file = 'overriding.txt';

			const buf1 = Buffer.from('Hello world', 'utf8');
			await fs.writeBuffer(file, 'w', buf1, 0);
			const buf2 = Buffer.from('Other', 'utf8');
			await fs.writeBuffer(file, 'r+', buf2, 0);

			const content = await fs.readFile(file, 'utf8');
			should(content).eql('Other world');

		});
	});

	describe('#unlinkDir', function () {

		it('should delete a directory with subdirectories', async () => {

			const base = 'unlink-me';
			const dir = base + '/' + randomString();

			await fs.touch(dir + '/test1.txt');
			await fs.touch(dir + '/subdir/test2.txt');
			await fs.unlinkDir(dir);

			await fs.exists(base).should.resolvedWith(true);
			await fs.exists(dir).should.resolvedWith(false);

		});

	});

});
