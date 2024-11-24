export const MyError = {
  FAIL_ID: 'Что-то не то с id',
  FAIL_PARSE_TOKEN: 'Проверь валидацию токена',

  USER_NOT_FOUND: 'Пользователь не найден',
  USER_ALREADY_EXISTS_LOGIN: 'Пользователь c таким логином уже существует',
  USER_ALREADY_EXISTS_EMAIL: 'Пользователь с такой почтой уже существует',
  USER_ALREADY_EXISTS: 'Пользователь уже существует',

  WRONG_IDENTIFICATION: 'Данные введены не верно',
  USER_NAME_REQUIRED: 'Пользовательское имя обязательно',
  EMAIL_REQUIRED: 'Email обязательно',
  PASSWORD_REQUIRED: 'Пароль обязателен',
  PASSWORD_REPEAT_REQUIRED: 'Необходимо повторить пароль',
  NEW_PASSWORD_REQUIRED: 'Необходимо указать новый пароль',
  PASSWORD_MISMATCH: 'Пароли не совпадают',
  VERIFICATION_EMAIL_NULL: 'Почта не подтверждена',
  VERIFICATION_EMAIL_ALREADY: 'Почта уже верефицирована',

  VERIFICATION_FAILED: 'Пользователь с таким токеном верификации не найден',
  TOKEN_EXPIRED: 'Время жизни токена подошло к концу',
  TOKEN_INVALID: 'А зачем ты даёшь мне некорректный токен?',
  TOKEN_COMPROMISED: 'Походу токен был украден',

  NOT_FOUND: 'По заданным критериям ничего не найдено',
  NOT_FOUND_BY_ID: 'По заданному ID ничего не найдено',

  UPDATE_FAILED: 'Не удалось обновить данные',
  DELETE_FAILED: 'Не удалось удалить данные',
  RESTORE_FAILED: 'Не удалось восстановить',
  CREATE_FAILED: 'Не удалось создать данные',

  SUBJECT_REQUIRED: 'Необходимо указать тему письма',
};
