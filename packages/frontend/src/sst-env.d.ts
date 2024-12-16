/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_REGION: string
  readonly VITE_USER_POOL_ID: string
  readonly VITE_USER_POOL_CLIENT_ID: string
  readonly VITE_IDENTITY_POOL_ID: string
  readonly VITE_MATERIALS_BUCKET_NAME: string
  readonly VITE_CREATE_EXAM_FUNCTION_URL: string
  readonly VITE_GENERATE_AUDIO_URL: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}