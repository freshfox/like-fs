import {downloadFileFromUrl, TmpFilesystem} from "../lib";
import should from 'should';

describe('Utils', function () {

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
