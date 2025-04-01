import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user.service';

const usersValidation = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email address is required',
    }),
  password: Joi.string()
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
      ),
    )
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long.',
      'any.required': 'Password is required.',
    }),
  firstName: Joi.string().min(3).max(20).required().messages({
    'string.min': 'First name must be at least 3 characters long',
    'string.max': 'First name cannot exceed 20 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(3).max(20).required().messages({
    'string.min': 'Last name must be at least 3 characters long',
    'string.max': 'Last name cannot exceed 20 characters',
    'any.required': 'Last name is required',
  }),
  role: Joi.string()
    .valid('ADMIN')
    .messages({
      'any.only': 'Role must be one of the predefined roles.',
      'any.required': 'Role is required',
    }),
  phone: Joi.string()
    .trim()
    .regex(/^\+[1-9]\d{1,14}$/)
    .messages({
      'string.pattern.base':
        "Please enter a valid phone number in international format starting with '+' with country code",
      'any.required': 'Phone number is required',
    }),
});

export const validateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { error } = usersValidation.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).json({
        status: 'fail',
        data: {
          message: error.details[0].message,
        },
      });
      return;
    }

    const { email } = req.body;
    if (!email) {
      res.status(400).json({
        message: 'Email address is required',
      });
      return;
    }

    const user = await UserService.getUserByEmail(email);
    if (user) {
      res.status(409).json({
        message: 'User already exists. Please login again',
      });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
};
