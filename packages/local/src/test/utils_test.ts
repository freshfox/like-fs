import {awaitWriteFinish, downloadFileFromUrl, TmpFilesystem, writeToStream} from "../lib";
import should from 'should';

describe('Utils', function () {

	describe('#awaitWriteFinish()', function () {

		it('should immediately finish an already finished write stream', async () => {

			const file = `test-${Date.now()}.txt`
			const fs = new TmpFilesystem({});
			await fs.writeDataToFile(file, 'Data');
			const write = fs.createWriteStream(file);
			await new Promise<void>((resolve, reject) => {
				write.end((err) => {
					if (err) return reject(err);
					resolve();
				});
			});
			await awaitWriteFinish(write);
		});

	});

	describe('#downloadFileFromUrl()', function () {

		it('should download a file with an https url', async () => {

			const url = 'https://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf';
			const fs = new TmpFilesystem({});

			const target =`sample-file-1-${Date.now()}.pdf`;
			await downloadFileFromUrl(url, fs.createWriteStream(target));
			await should(fs.exists(target)).resolvedWith(true)

		});

		it('should download a file with an http url', async () => {

			const url = 'http://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf';
			const fs = new TmpFilesystem({});
			const target =`sample-file-2-${Date.now()}.pdf`;
			await downloadFileFromUrl(url, fs.createWriteStream(target));
			await should(fs.exists(target)).resolvedWith(true)

		});

	});

})
