<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Backend System Overview (NestJS + Prisma)

This backend is a full-featured, modular, and scalable system built with **NestJS**, **Prisma**, **Zod**, and **PostgreSQL**. It provides a solid architecture for authentication, authorization (RBAC), user profile management, language and permission modules, and more.

## 🔧 Tech Stack
- **NestJS**: Modular backend framework
- **Prisma**: Type-safe ORM for PostgreSQL
- **Zod**: Type validation and schema definition
- **JWT**: Secure token-based auth (Access + Refresh tokens)
- **Resend API**: Email sending (OTP)
- **Supertest**: E2E testing

## 📁 Modules

### 🔐 Auth Module
- Google OAuth
- Email/password login
- OTP (email-based) with resend + expiry
- 2FA using TOTP (via `otpauth`)
- Guards: `AccessTokenGuard`, `APIKeyGuard`, `AuthenticationGuard`

### 🧑 Role Management
- CRUD for roles
- Assign permissions to roles
- Prevent edits on base roles: `ADMIN`, `SELLER`, `CLIENT`
- Validate permission IDs on update

### ✅ Permission Management
- Permissions include: `method`, `path`, `module`, `name`
- Only soft delete unless `isHard` is passed
- Uniqueness validation on `(path + method)`

### 🌐 Language Management
- CRUD for language IDs and names
- Hard and soft delete support
- All schema-level validation handled with Zod

### 👤 Profile Management
- Get user profile (include `role`, `permissions` if specified)
- Update profile (name, phone, avatar)
- Change password (with verification)

## 🔒 Authorization
- Every route is protected by default via `AuthenticationGuard`
- Uses metadata decorator `@Auth()` to define allowed auth types (`BEARER`, `API_KEY`, `NONE`) and guard condition (`AND`, `OR`)
- RBAC is enforced via:
  - AccessToken payload (userId, roleId, roleName)
  - RoleRepository: match route `path + method` in DB permissions
  - Guards throw `InsufficientPermissionException` when blocked

## 📦 Shared Services & Utilities
- `HashingService`: Bcrypt password hashing
- `TokenService`: JWT encode/decode/verify
- `MailingService`: Sends OTP email using React-based template (resend)
- `TwoFactorAuthService`: TOTP secret generation & verification
- `env-config`: Strongly typed `.env` validation with `zod`

## 🧪 Testing
- Uses `supertest` + `jest-e2e` for HTTP testing
- Sample: `test/app.e2e-spec.ts`

## 📌 Design Highlights
- Modularized by domain: each feature has `controller`, `service`, `repo`, `dto`, `model`, `error`, `constant`
- Zod-based validation + transformation at DTO level (`nestjs-zod`)
- Custom `ZodValidationPipe` and `ZodLocalValidationPipe`
- Global error handling (`CatchEverythingFilter`)
- Extensible and consistent error messages (`CommonErrorMessages`)

## 📚 Additional Notes
- Uses Prisma `$queryRaw` only in special cases (e.g. caching role id lookup)
- Supports both hard delete and soft delete logic via flags
- Guard logic can dynamically combine strategies with `AND`/`OR` conditions
- OTP email template: `src/shared/email-templates/otp.html`
- Admin seed via `.env`: `ADMIN_NAME`, `ADMIN_EMAIL`, etc.


## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
