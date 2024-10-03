import * as process from 'process';

export default () => ({
  port: process.env.PORT,
  url: process.env.URL,
  db: {
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORT,
    name: process.env.DB_NAME,
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
  },
  jwt: {
    secret: process.env.SECRET_JWT,
    expireAccess: process.env.EXPIRE_ACCESS_TOKEN,
    expireRefresh: process.env.EXPIRE_REFRESH_TOKEN,
    expireVerify: process.env.EXPIRE_VERIFY_TOKEN,
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    name: process.env.MAIL_NAME,
    password: process.env.MAIL_PASSWORD,
  },
});
