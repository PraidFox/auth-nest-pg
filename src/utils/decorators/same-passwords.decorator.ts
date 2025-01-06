import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { RegisterDto } from '../../auth/dto/auth.dto';
import { MyError } from '../constants/errors';

@ValidatorConstraint({ name: 'IsPasswordMatching', async: false })
export class IsPasswordMatching implements ValidatorConstraintInterface {
  validate(passwordRepeat: string, args: ValidationArguments) {
    const obj = args.object as RegisterDto;
    return obj.password === passwordRepeat;
  }

  // defaultMessage(validationArguments?: ValidationArguments): string {
  defaultMessage(): string {
    return MyError.PASSWORD_MISMATCH;
  }
}
