import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserEntity } from '../../users/entities/user.entity';

//TODO подумать над тем, оставить такое в сервисах или здесь (и посмотреть как сделать правильно инъекцию validatorconstraint add injection)
@ValidatorConstraint({ name: 'UserExistsConstraint', async: true })
export class UserExistsConstraint implements ValidatorConstraintInterface {
  async validate(emailOrLogin: string) {
    const userEntity = await UserEntity.findOne({
      where: [{ login: emailOrLogin }, { email: emailOrLogin }],
    });

    return !!userEntity;
  }
  defaultMessage(): string {
    return 'Пользователь не найден';
  }
}
