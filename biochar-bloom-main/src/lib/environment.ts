const rawApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const isPlaceholder = /your-railway-url|YOUR-RAILWAY-URL|your-api\.up\.railway/i.test(rawApiUrl);
/** When set (and not a placeholder), the app uses the Railway API instead of Supabase for data and auth */
const apiUrl = isPlaceholder ? '' : rawApiUrl;

if (isPlaceholder && rawApiUrl) {
  console.warn(
    '[env] VITE_API_URL is still a placeholder. Set it to your real Railway URL in .env.local and restart the dev server.\n' +
    '  From repo root: npm run web   (auto-sets URL if Railway CLI is linked)\n' +
    '  Or: npm run env:railway'
  );
}

export const environment = {
  production: import.meta.env.PROD,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_KEY || '',
  apiUrl,
  mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN || '',
  // AWS S3 Configuration
  awsRegion: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  awsAccessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  s3BucketName: import.meta.env.VITE_S3_BUCKET_NAME || 'biochar-photos',
};
