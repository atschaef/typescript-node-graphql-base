export interface UploadOptions {
  maxFieldSize?: number
  maxFileSize?: number
  maxFiles?: number
}

export function apolloUploadExpress(opt?: UploadOptions): any

export const GraphQLUpload: any
