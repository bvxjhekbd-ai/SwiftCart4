/**
 * Environment Variable Validator
 * Validates required environment variables and logs status without exposing values
 */

interface EnvConfig {
  name: string;
  required: boolean;
}

const ENV_VARIABLES: EnvConfig[] = [
  { name: 'DATABASE_URL', required: true },
  { name: 'SUPABASE_URL', required: true },
  { name: 'SUPABASE_ANON_KEY', required: true },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true },
  { name: 'PAYSTACK_SECRET_KEY', required: true },
  { name: 'ADMIN_API_KEY', required: false },
  { name: 'NODE_ENV', required: false },
];

export function validateEnvironmentVariables(): void {
  console.log('🔍 Validating environment variables...');
  
  const missing: string[] = [];
  const present: string[] = [];
  const optional: string[] = [];

  ENV_VARIABLES.forEach(({ name, required }) => {
    const value = process.env[name];
    
    if (value) {
      present.push(name);
      const preview = value.substring(0, 10) + '...';
      console.log(`✅ ${name}: ${preview} (${value.length} chars)`);
    } else if (required) {
      missing.push(name);
      console.error(`❌ ${name}: MISSING (REQUIRED)`);
    } else {
      optional.push(name);
      console.warn(`⚠️  ${name}: Not set (optional)`);
    }
  });

  console.log('\n📊 Environment Variables Summary:');
  console.log(`   ✅ Present: ${present.length}`);
  console.log(`   ❌ Missing Required: ${missing.length}`);
  console.log(`   ⚠️  Optional Not Set: ${optional.length}`);

  if (missing.length > 0) {
    const errorMessage = `\n🚨 DEPLOYMENT FAILED: Missing required environment variables:\n   - ${missing.join('\n   - ')}\n\nPlease set these in your Vercel dashboard under Project Settings → Environment Variables`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  console.log('✅ All required environment variables are present!\n');
}

/**
 * Validate a specific environment variable exists
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    const errorMessage = `Missing required environment variable: ${name}`;
    console.error(`❌ ${errorMessage}`);
    throw new Error(errorMessage);
  }
  return value;
}
