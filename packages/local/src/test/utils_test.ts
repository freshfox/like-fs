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

			const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
			const fs = new TmpFilesystem({});

			const target =`sample-file-1-${Date.now()}.pdf`;
			await downloadFileFromUrl(url, fs.createWriteStream(target), {
				maxHeaderSize: 8000
			} as any);
			await should(fs.exists(target)).resolvedWith(true)

		});

		it('should download a file with an http url', async () => {

			// noinspection HttpUrlsUsage
			const url = 'http://www.africau.edu/images/default/sample.pdf';
			const fs = new TmpFilesystem({});
			const target =`sample-file-2-${Date.now()}.pdf`;
			await downloadFileFromUrl(url, fs.createWriteStream(target));
			await should(fs.exists(target)).resolvedWith(true)

		});

	});

})
