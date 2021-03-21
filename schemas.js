const joi = require('joi');

module.exports.reviewSchema = joi.object({
    review: joi.object({
        name: joi.string().required(),
        email: joi.string().required(),
        rating: joi.number().required(),
        body: joi.string().required()
    }).required()
})