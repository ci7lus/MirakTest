declare module "vm" {
  export declare class SourceTextModule {
    constructor(
      code: string,
      options?: {
        identifier?: stirng
        cachedData?: Buffer | TypedArray | DataView
        context?: Context | Object
        lineOffset?: number
        columnOffset?: number
        initializeImportMeta?: (meta: unknown, module: this) => {} // TODO
        importModuleDynamically?: unknown // TODO
      }
    ): this
    link(
      callback: (specifier: string, referencingModule: NodeModule) => NodeModule
    ): Promise<void>
    evaluate(options?: {
      timeout?: number
      breakOnSigint?: boolean
    }): Promise<void>
    namespace: unknown
  }
}
