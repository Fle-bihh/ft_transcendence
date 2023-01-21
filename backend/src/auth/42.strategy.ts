import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-42';
// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class ApiStrategy extends PassportStrategy(Strategy) {
//   constructor() {
//     super({
//       clientID: 'u-s4t2ud-2ba494ca541577ab12aead4ea4f59fc22b4c2bea05058775f2524344f2e602a9',
//       clientSecret: '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',
//       callbackURL: 'http://127.0.0.1:3000/home',
//     });
//   }

//   async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
//     // Use the user information obtained from the 42 API to authenticate the user
//     // and generate a JWT token for them
//     const user = { ...profile._json, accessToken, refreshToken };
//     done(null, user);
//   }
// }
