import Joi from "joi";

export const configValidationSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432).required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  CLIENT_ID: Joi.string().required(),
  CLIENT_SECRET: Joi.string().required(),
  REDIRECT_URI: Joi.string().required(),
});
