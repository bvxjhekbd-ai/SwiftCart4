/**
 * Environment Variable Validation Runner
 * This file validates environment variables when any serverless function starts
 * Import this at the top of your API functions to ensure env vars are checked
 */
import { validateEnvironmentVariables } from './_utils/env-validator';

// Run validation on module load
validateEnvironmentVariables();

export { validateEnvironmentVariables };
