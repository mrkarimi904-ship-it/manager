import { HttpException, Inject, Injectable } from '@nestjs/common';
import * as dtos from './dtos';

import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';

import { DbService } from 'src/db/db.service';
import { generalResponse } from 'src/app.consts';

@Injectable()
export class SettingsService {

  constructor(private db: DbService, @Inject(CACHE_MANAGER) private cacheManager: Cache, private readonly axios: HttpService) {}

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
    const passwordRegex: RegExp = this.generatePasswordRegex2(info)
    return passwordRegex.test(password)
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

  generatePasswordRegex2({ minimumCharactersCount, haveSpecialCharacters, haveUppercaseCharacters, haveLowercaseCharacters, haveDigits }): RegExp {
    const regexComponents = [];
    const minLength = `(?=.{${minimumCharactersCount},})`;
    if (haveSpecialCharacters) { regexComponents.push('(?=.*[!@#$%^&*(),.?":{}|<>])'); }
    if (haveUppercaseCharacters) { regexComponents.push('(?=.*[A-Z])'); }
    if (haveLowercaseCharacters) { regexComponents.push('(?=.*[a-z])'); }
    if (haveDigits) { regexComponents.push('(?=.*\\d)'); }
    const regexPattern = `^${minLength}${regexComponents.join('')}.*$`;
    return new RegExp(regexPattern);
  }


  async getlicense(user: any): Promise<generalResponse> {
    try {
      let license = await this.cacheManager.get(`license`) as any;
      let license_data = await this.cacheManager.get(`license_data`) as any;
      if (!license || !license_data) {
        try {
          license = await this.axios.axiosRef.get('http://host.docker.internal:3030/license')
          license_data = license.data
          license = 'valid'
        } catch (error_axios) {
          if (error_axios?.response?.data) { license_data = error_axios?.response?.data } else { license_data = 'unknown' }
          license = 'trial'
        }
        await this.cacheManager.set(`license`, license)
        await this.cacheManager.set(`license_data`, license_data)
      }
      if (!license) { throw { message: 'Unknown license' } }
      return { status: true, data:{ license: license, info: license_data }, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getlicenseCode(user: any): Promise<generalResponse> {
    try {
      const hid = await this.axios.axiosRef.get('http://host.docker.internal:3030/hardware-id')
      return { status: true, data:{ id: hid.data }, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async can_add_new_camera(): Promise<boolean> {
    let license_data = await this.cacheManager.get(`license_data`) as any;
    if (!license_data) {
      try {
        license_data = await this.axios.axiosRef.get('http://host.docker.internal:3030/license')
        license_data = license_data.data
      } catch (error_axios) {
        console.log(error_axios)
        return false
      }
      await this.cacheManager.set(`license_data`, license_data)
    }
    const available_cameras = license_data.num_cameras
    const total_cameras = await this.db.camera.count()
    if (total_cameras < 5) { return true }
    if (available_cameras > total_cameras) { return true }
    return false
  }

}
