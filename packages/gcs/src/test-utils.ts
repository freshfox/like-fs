import { App, initializeApp } from 'firebase-admin/app';
import { GCSFilesystem } from './gcs_filesystem';
import { getStorage } from 'firebase-admin/storage';
import { Storage } from '@google-cloud/storage';
import * as process from 'process';

let app: App;
export function getGCPFilesystem() {
	if (process.env.GCS_BUCKET) {
		return new GCSFilesystem(new Storage().bucket(process.env.GCS_BUCKET));
	}
	throw new Error('GCS_BUCKET must be set');
}

export function getFirebaseFilesystem() {
	if (!app) {
		app = initializeApp({
			projectId: process.env.GCLOUD_PROJECT,
			storageBucket: process.env.GCS_BUCKET,
		});
	}
	return new GCSFilesystem(getStorage(app).bucket());
}
