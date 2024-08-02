import * as process from 'process';

export default () => ({
  port: process.env.PORT,
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
    expire: process.env.EXPIRE_TOKEN,
  },
});
