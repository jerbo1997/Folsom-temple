import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsCurrentMinDateConstraint
  implements ValidatorConstraintInterface {
  validate(value: string[], _args?: ValidationArguments) {
    const newDates = []
    value.forEach((it) => {
      const inputDate = new Date(it).setHours(0, 0, 0, 0);
      const currentDate = new Date().setHours(0, 0, 0, 0);
      console.log('>>>>>>>', inputDate, currentDate);
      if (inputDate > currentDate) { newDates.push(inputDate) }
    })
    return newDates.length === value.length;
  }
}

export function IsCurrentMinDate(args?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: args,
      constraints: [],
      validator: IsCurrentMinDateConstraint,
    });
  };
}
