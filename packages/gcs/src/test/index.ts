import env from 'node-env-file';
import fs from 'fs';
import { initializeApp, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { Storage } from '@google-cloud/storage';
import { GCSFilesystem } from '../lib';

export function loadEnv() {
	const path = __dirname + '/../../.env';
	if (fs.existsSync(path)) {
		env(path);
	}
}

let app: App;
export function getFirebaseFilesystem() {
	if (!app) {
		app = initializeApp({
			projectId: process.env.GCLOUD_PROJECT,
			storageBucket: process.env.GCS_BUCKET,
		});
	}
	return new GCSFilesystem(getStorage(app).bucket());
}

export function getGCPFilesystem() {
	return new GCSFilesystem(new Storage().bucket(process.env.GCS_BUCKET));
}
