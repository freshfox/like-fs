import {
	ClassProvider,
	DynamicModule,
	FactoryProvider,
	ModuleMetadata,
	Provider,
	Type,
	ValueProvider
} from "@nestjs/common";
import {ExistingProvider} from "@nestjs/common/interfaces/modules/provider.interface";

export class DynamicModuleBuilder {

	private _imports: ImportType;
	private _providers: Provider[] = [];
	private _exports: Provider[] = [];

	constructor(private moduleType: Type<any>) {
	}

	imports(imports: ImportType) {
		this._imports = imports;
		return this;
	}

	providers(...providers: Provider[]) {
		this._providers.push(...providers);
		return this;
	}

	protected exports(...exports: Provider[]) {
		this._exports.push(...exports);
		return this;
	}

	protected addExternalProvider<T>(provide: InjectionToken, external: ExternalProvider<T>) {
		const classProvider = external as Omit<ClassProvider<T>, 'provide'>;
		if ((external as ClassProvider).useClass) {
			this._providers.push({
				provide: classProvider.useClass,
				useClass: classProvider.useClass,
				scope: classProvider.scope
			});
		}
		this._providers.push({
			...external,
			provide: provide
		});
	}

	build(): DynamicModule {
		return {
			module: this.moduleType,
			imports: this._imports || [],
			providers: this._providers,
			exports: this._exports
		}
	}

}

export type ImportType = ModuleMetadata['imports'];

export type ExternalProvider<T> =
	Omit<ClassProvider<T>, 'provide'> |
	Omit<FactoryProvider<T>, 'provide'> |
	Omit<ValueProvider<T>, 'provide'> |
	Omit<ExistingProvider<T>, 'provide'>;

export type InjectionToken = ClassProvider['provide'];
