import {
	inject as injectInversify,
	injectable as injectableInversify,
	optional as optionalInversify
} from 'inversify';
import {
	Inject as injectNest,
	Injectable as injectableNest,
	Optional as optionalNest
} from '@nestjs/common';


export function inject(token: any): (target: object, key: string, index?: number) => void {
	return (target, key, index) => {
		injectInversify(token)(target, key, index);
		injectNest(token)(target, key, index);
	}
}

export function injectable(): (target: any) => any {
	return (target) => {
		injectableInversify()(target);
		injectableNest()(target);
	}
}

export function optional(): (target: any, key: string, index?: number) => void {
	return (target, key, index) => {
		optionalInversify()(target, key, index);
		optionalNest()(target, key, index);
	}
}
