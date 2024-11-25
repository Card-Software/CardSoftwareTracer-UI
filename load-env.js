// load-env.js
const dotenv = require('dotenv');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
const useLocal = env === 'development' && true; // Set to true to use local in development

// Load .env file as the base
dotenv.config({ path: '.env' });

// Load environment-specific files
if (env === 'development') {
  if (useLocal && fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
  } else if (fs.existsSync('.env.dev')) {
    dotenv.config({ path: '.env.dev' });
  }
} else if (env === 'production' && fs.existsSync('.env.prod')) {
  dotenv.config({ path: '.env.prod' });
}

console.log(`Running in ${env} mode`);
console.log(`API URL: ${process.env.NEXT_PUBLIC_TRACER_APP_API_URL}`);
