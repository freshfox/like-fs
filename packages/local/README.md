# like-fs
> A thin abstraction layer for accessing local and cloud filesystems with an API like-fs

[![npm version](https://badge.fury.io/js/like-fs.svg)](https://badge.fury.io/js/like-fs)
[![Dependencies](https://david-dm.org/freshfox/like-fs.svg)](https://david-dm.org/freshfox/like-fs#info=dependencies)
[![img](https://david-dm.org/freshfox/like-fs/dev-status.svg)](https://david-dm.org/freshfox/like-fs/#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/test/github/freshfox/like-fs/badge.svg)](https://snyk.io/test/github/freshfox/like-fs)

## Table of Contents

* [Overview](#overview)
* [Example](#example)
* [Installation](#installation)
* [Reference](#reference)
* [Cloud Filesystem](#cloud-filesystem)

## Overview
`like-fs` is a thin layer of abstraction for accessing filesystems.
This package includes two main classes. Those are `LocalFilesystem` and
the `TmpFilesystem`. The most basic way to access the local filesystem is the `LocalFilesystem`.
It is a simple wrapper around node's standard `fs` module, exposing the same API
as the `fs` module. When possible, all functions are asynchronous returning a `Promise`
so `async/await` can be used.

A key benefit of using this package is that directories don't have to be created,
since every write operation, be it using streams or
writing files directly, will ensure that the directory structure exists beforehand.

The `TmpFilesystem` is used to access files in the tmp directory. The difference between
this and the `LocalFilesystem` is that the root is mounted to a directory in `/tmp`.
All method calls to the `TmpFilesystem` are relative to this configured directory.
So for example when calling `fs.createReadStream('/images/logo.png')`
you're actually creating a `ReadStream` to `/tmp/<some-dir>/images/logo.png`

The package also includes an interface `IOnlineFilesystem` for implementations to access filesystems like
` AWS S3`, `Google Cloud Storage`, `Firebase Storage`, etc.

`like-fs` is written in Typescript and is fully compatible with the dependency injection library Inversify and NestJS.

## Example
```typescript
import * as os from 'os';
import {TmpFilesystem, awaitWriteFinish} from "like-fs";

const fs = new TmpFilesystem({
	tmpDirectory: os.tmpdir() + '/my-project'
});

const readStream = fs.createReadStream('images/logo.png');
await fs.writeStreamToFile('images/logo-copy.png', readStream);

// awaitWriteFinish() is a helper function in utils.ts
await awaitWriteFinish(
	fs.createReadStream('images/logo.png')
		.pipe(fs.createWriteStream('images/logo-copy.png'))
);
```
## Installation
The package is available via the `npm` registry

```
$ npm install like-fs
$ yarn add like-fs
```

## Reference

### LocalFilesystem

#### .createWriteStream(path: string, opts?: any): Writable;
> Returns a WriteStream from the standard `fs` module.
See [fs.createWriteStream()](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options)
for more details

#### .createReadStream(path: string, opts?: any): Readable;
> Returns a ReadStream from the standard `fs` module.
See [fs.createReadStream()](https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options)
for more details

#### .readFile(path: string, encoding?: string): Promise<string|Buffer>;
> Reads the file with the given encoding. If encoding is `utf8`
The return value will be a string, otherwise it'll be a `Buffer`

#### .exists(path: string): Promise<boolean>;
> Returns `true` if the file exists, otherwise will return `false`

#### .writeStreamToFile(path: string, stream: Readable, options?): Promise<any>;
> This is a helper function to asynchronously write a given ReadStream
to a file. The `Promise` resolves once the write finishes.

### .writeDataToFile(path: string, data: any, options?: any)
> Works exactly like [fs.writeFile()](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback)

#### .unlink(path: string): Promise<any>;
> Deletes the given file if it exists

#### .mkdir(path: string): Promise<void>;
> Creates a directory structure like `mkdir -p`. You only need this
when you want to create a directory without writing a file. All methods
which write files will automatically create the required directory
structure beforehand.

#### .readDir(path: string): Promise<string[]>
> Returns a string array of paths of the containing files and directories
All paths are relative to the given path.

#### .lstat(path: string): Promise<Stats>
> Returns the size of a file

#### .dirSize(directory: string): Promise<number>
> Recursively calculates the sizes of all files and directories below
the given path and returns the number in bytes

#### .touch(path: string): Promise<void>
> Creates an empty file at the given path

### TmpFilesystem

Has the same methods as the `LocalFilesystem` with the only difference
that all paths are relative to a directory in the `/tmp` directory.
The path to this directory can be configured via the constructor

## Cloud Filesystem
This package includes an interface `IOnlineFilesystem` which can be used
to implement filesystems for different cloud storage providers.

Current implementations are
 - [like-fs-gcs](https://github.com/freshfox/like-fs/tree/master/packages/gcs) for Firebase and Google Cloud Storage

The interface `IOnlineFilesystem` exposes the same API as the local filesystems
with two additional functions `getDownloadUrl()` and `getUploadUrl()`.

This allows you to easily us the `TmpFilesystem` during development and testing
and replace it with an actual implementation in your production environment
