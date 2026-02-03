import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isMinDateExceed', async: false })
export class IsMinDateExceedConstraint implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments) {
    const [relationPropertyName] = args.constraints;
    const relatedValue = args.object[relationPropertyName];
    if (!relatedValue) {
      return false;
    }

    const input = new Date(value).setHours(0, 0, 0, 0);
    const relatedInput = new Date(relatedValue).setHours(0, 0, 0, 0);
    return input > relatedInput;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Invalid end date provided`;
  }
}
