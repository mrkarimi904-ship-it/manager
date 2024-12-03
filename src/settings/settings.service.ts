import { HttpException, Injectable } from '@nestjs/common';
import * as dtos from './dtos';

import { DbService } from 'src/db/db.service';
import { generalResponse } from 'src/app.consts';

@Injectable()
export class SettingsService {

  constructor(private db: DbService) {}

  async getPasswordComplexities(user: any): Promise<generalResponse> {
    try {
      const info = await this.db.setting_password_complexity.findFirst()
      const { minimumCharactersCount, haveSpecialCharacters, haveUppercaseCharacters, haveLowercaseCharacters, haveDigits } = info
      let strength: any = 0
      if (minimumCharactersCount > 8) { strength++ }
      if (haveSpecialCharacters === true) { strength++ }
      if (haveUppercaseCharacters === true) { strength++ }
      if (haveLowercaseCharacters === true) { strength++ }
      if (haveDigits === true) { strength++ }
      if (strength < 2) { strength = 'Weak' }
      else if (strength < 4) { strength = 'Normal' }
      else { strength = 'Strong' }
      const passwordRegex = this.generatePasswordRegex(info)
      const result = {
        passwordStrength : strength,
        minimumCharactersCount: info.minimumCharactersCount,
        haveSpecialCharacters: info.haveSpecialCharacters,
        haveUppercaseCharacters: info.haveUppercaseCharacters,
        haveLowercaseCharacters: info.haveLowercaseCharacters,
        haveDigits: info.haveLowercaseCharacters,
        specialCharacterRegex: '[!@#$%^&*(),.?":{}|<>]',
        lowercaseCharacterRegex: '[a-z]',
        uppercaseCharacterRegex: '[A-Z]',
        digitsRegex: '[0-9]',
        passwordRegex: passwordRegex
      }
      return { status: true, data:result, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async setPasswordComplexities(user: any, body: dtos.passwordComplexityDto): Promise<generalResponse> {
    try {
      await this.db.setting_password_complexity.updateMany({ data: body })
      const info = await this.db.setting_password_complexity.findFirst()
      const { minimumCharactersCount, haveSpecialCharacters, haveUppercaseCharacters, haveLowercaseCharacters, haveDigits } = info
      let strength: any = 0
      if (minimumCharactersCount > 8) { strength++ }
      if (haveSpecialCharacters === true) { strength++ }
      if (haveUppercaseCharacters === true) { strength++ }
      if (haveLowercaseCharacters === true) { strength++ }
      if (haveDigits === true) { strength++ }
      if (strength < 2) { strength = 'Weak' }
      else if (strength < 4) { strength = 'Normal' }
      else { strength = 'Strong' }
      const passwordRegex = this.generatePasswordRegex(info)
      const result = {
        passwordStrength : strength,
        minimumCharactersCount: info.minimumCharactersCount,
        haveSpecialCharacters: info.haveSpecialCharacters,
        haveUppercaseCharacters: info.haveUppercaseCharacters,
        haveLowercaseCharacters: info.haveLowercaseCharacters,
        haveDigits: info.haveLowercaseCharacters,
        specialCharacterRegex: '[!@#$%^&*(),.?":{}|<>]',
        lowercaseCharacterRegex: '[a-z]',
        uppercaseCharacterRegex: '[A-Z]',
        digitsRegex: '[0-9]',
        passwordRegex: passwordRegex
      }
      return { status: true, data:result, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async checkPasswordComplexities(password: string) {
    const info = await this.db.setting_password_complexity.findFirst()
    const passwordRegex = this.generatePasswordRegex(info)
    const x = new RegExp(passwordRegex)
    return x.test(password)
  }

  generatePasswordRegex({ minimumCharactersCount, haveSpecialCharacters, haveUppercaseCharacters, haveLowercaseCharacters, haveDigits }): string {
      const regexComponents = [];
      const minLength = `(?=.{${minimumCharactersCount},})`;
      if (haveSpecialCharacters) { regexComponents.push('(?=.*[!@#$%^&*(),.?":{}|<>])'); }
      if (haveUppercaseCharacters) { regexComponents.push('(?=.*[A-Z])'); }
      if (haveLowercaseCharacters) { regexComponents.push('(?=.*[a-z])'); }
      if (haveDigits) { regexComponents.push('(?=.*\\d)'); }
      const regexPattern = `^${minLength}${regexComponents.join('')}.*$`;
      return new RegExp(regexPattern).toString();
  }

}
