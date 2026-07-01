import Joi from "joi";

const registerValidation = Joi.object({
    username: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().min(3).max(100).required(),
    password: Joi.string().min(3).max(100).required()
});

const loginValidation = Joi.object({
    email: Joi.string().email().max(100).required(),
    password: Joi.string().max(100).required()
});

const updateProfileValidation = Joi.object({
    bio: Joi.string().max(160).optional().allow("", null),
    avatar: Joi.string().optional().allow(null),
    cover: Joi.string().optional().allow(null)
});

const getUserValidation = Joi.number().required().positive();

export { registerValidation, loginValidation, getUserValidation, updateProfileValidation };