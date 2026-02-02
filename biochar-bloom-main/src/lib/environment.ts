export const environment = {
  production: import.meta.env.PROD,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_KEY || '',
  /** When set, the app uses the Railway API instead of Supabase for data and auth */
  apiUrl: (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''),
  mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN || '',
  // AWS S3 Configuration
  awsRegion: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  awsAccessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  s3BucketName: import.meta.env.VITE_S3_BUCKET_NAME || 'biochar-photos',
};
