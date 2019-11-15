import * as path from 'path';
import {IFilesystem} from "./filesystem";
import {awaitWriteFinish} from "./utils";

export function createFilesystemTestSuite(baseDirectory: string, fs: IFilesystem) {

	function createPath(...paths) {
		return path.join(baseDirectory, ...paths);
	}

	const should = require('should');

	it('should write a file and check if it exists', async () => {

		const date = Date.now();
		const path = createPath(`test_${date}.txt`);
		const stream = await fs.createWriteStream(path);
		stream.write('ms' + date);
		stream.end();
		await awaitWriteFinish(stream);
		await wait(100);

		const exists = await fs.exists(path);
		should(exists).true();
	});

	it('should write and read a file', async () => {

		const date = Date.now();
		const path = createPath(`test_${date}.txt`);
		const stream = await fs.createWriteStream(path);
		stream.write('Now: ');
		stream.write(date + '');
		stream.end();
		await awaitWriteFinish(stream);
		await wait(100);

		const content = await fs.readFile(path, 'utf8');
		should(content).type('string');
		should(content).eql('Now: ' + date);
	});

	it('should create and delete a file', async () => {

		const date = Date.now();
		const path = createPath(`test_${date}.txt`);

		should(await fs.exists(path)).false();

		const stream = await fs.createWriteStream(path);
		stream.write('test');
		stream.end();
		await awaitWriteFinish(stream);
		await wait(200);

		should(await fs.exists(path)).true();
		await fs.unlink(path);
		await wait(100);
		should(await fs.exists(path)).false();

	});

	it('should list files in a directory', async () => {

		const dir = `dir_${Date.now()}`;
		const files = ['test_1.txt', 'test_2.txt', 'test_3.txt'];

		for (const file of files) {
			const stream = await fs.createWriteStream(createPath(dir, file));
			stream.write('test');
			stream.end();
			await awaitWriteFinish(stream);
		}

		const readFiles = await fs.readDir(createPath(dir));
		should(readFiles).eql(files);
	});

	it('should not throw an error if directory doesn\'t exist', async () => {

		const files = await fs.readDir(createPath(`some_dir_${Date.now()}`));
		should(files).length(0);

	});
}

function wait(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	});
}
