import dotenv from 'dotenv';

dotenv.config();

interface Config {
  BASE_URL: string;
  PORT: number;
  EMAIL_VERIFICATION_REDIRECT_URI: string;
  PASSWORD_RESET_REDIRECT_URI: string;
  DB_CONNECTION_URI: string;
  NODE_ENV: string;
  SALT_ROUNDS: number;
  SUBSCRIPTION_TRIAL_DAYS: number;
  AWS_REGION: string;
  AWS_DEFAULT_REGION: string;
  AWS_S3_BUCKET: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_ACCESS_KEY: string;
  JWT_SECRET: string;
  JWT_EXPIRATION_TIME: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  MAX_JSON_SIZE: string;
  MAX_FILE_SIZE: number;
  URL_ENCODED: boolean;
  REQUEST_LIMIT_TIME: number;
  REQUEST_LIMIT_NUMBER: number;
  WEB_CACHE: boolean;
  EXPRESS_FILE_UPLOAD_CONFIG: object;
  REDIS_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: string;
  KEYCLOAK_HOST: string;
  KEYCLOAK_REALM: string;
  KEYCLOAK_ADMIN_CLIENT_ID: string;
  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_CLIENT_SECRET: string;
  KEYCLOAK_ADMIN_PASSWORD: string;
  KEYCLOAK_ADMIN_USERNAME: string;
  KEYCLOAK_GRANT_TYPE: string;
}

const config: Config = {
  BASE_URL: process.env.BASE_URL as string,
  PORT: parseInt(process.env.PORT as string, 10),
  EMAIL_VERIFICATION_REDIRECT_URI: process.env.EMAIL_VERIFICATION_REDIRECT_URI as string,
  PASSWORD_RESET_REDIRECT_URI: process.env.PASSWORD_RESET_REDIRECT_URI as string,
  DB_CONNECTION_URI: process.env.DB_CONNECTION_URI as string,
  NODE_ENV: process.env.NODE_ENV as string,
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS as string, 10),
  SUBSCRIPTION_TRIAL_DAYS: parseInt(process.env.SUBSCRIPTION_TRIAL_DAYS as string, 10),
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME as string,
  EMAIL_HOST: process.env.EMAIL_HOST as string,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT as string, 10),
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
  AWS_REGION: process.env.AWS_REGION as string,
  AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION as string,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET as string,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY as string,
  MAX_JSON_SIZE: process.env.MAX_JSON_SIZE as string,
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE as string, 10),
  URL_ENCODED: process.env.URL_ENCODED === 'true' ? true : false,
  REQUEST_LIMIT_TIME: parseInt(process.env.REQUEST_LIMIT_TIME as string, 10),
  REQUEST_LIMIT_NUMBER: parseInt(process.env.REQUEST_LIMIT_NUMBER as string, 10),
  WEB_CACHE: process.env.WEB_CACHE === 'true' ? true : false,
  EXPRESS_FILE_UPLOAD_CONFIG: {
    createParentPath: true,
    preserveExtension: true,
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE as string, 10),
    },
  },
  REDIS_URL: process.env.REDIS_URL as string,
  REDIS_HOST: process.env.REDIS_HOST as string,
  REDIS_PORT: process.env.REDIS_PORT as string,
  KEYCLOAK_HOST: process.env.KEYCLOAK_HOST as string,
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM as string,
  KEYCLOAK_ADMIN_CLIENT_ID: process.env.KEYCLOAK_ADMIN_CLIENT_ID as string,
  KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID as string,
  KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET as string,
  KEYCLOAK_ADMIN_PASSWORD: process.env.KEYCLOAK_ADMIN_PASSWORD as string,
  KEYCLOAK_ADMIN_USERNAME: process.env.KEYCLOAK_ADMIN_USERNAME as string,
  KEYCLOAK_GRANT_TYPE: process.env.KEYCLOAK_GRANT_TYPE as string,
};

export default config;
