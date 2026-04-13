const { ValidationProvider } = require('../../../shared/validation/validation.provider');
const Joi = ValidationProvider.initModuleValidation();
var validation = {};

validation.load = function (req, res, next) {
    const schema_body = {
        filter: Joi.object(),
        top: Joi.number().required(),
        offset: Joi.number().required(),
        sort: Joi.object().required(),
        currentTenantId: Joi.string().optional(),
        tenantId: Joi.string().optional()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.count = function (req, res, next) {
    const schema_body = {
        filter: Joi.object(),
        currentTenantId: Joi.string().optional(),
        tenantId: Joi.string().optional()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.loadDetails = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.insert = function (req, res, next) {
    const schema_body = {
        data: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().allow('', null),
            space_id: Joi.string().required(),
            isPrivate: Joi.boolean().optional(),
            isactive: Joi.boolean(),
            members: Joi.array().items(Joi.object({
                username: Joi.string().required(),
                role: Joi.string().valid('owner', 'admin', 'member', 'guest').required(),
                status: Joi.string().valid('active', 'invited', 'inactive').default('active'),
                joined_at: Joi.number().optional()
            })).optional()
        }).required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.update = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required(),
        data: Joi.object({
            name: Joi.string(),
            description: Joi.string().allow('', null),
            isactive: Joi.boolean(),
            members: Joi.array().items(Joi.object({
                username: Joi.string().required(),
                role: Joi.string().valid('owner', 'admin', 'member', 'guest').default('member'),
                title: Joi.string().allow('', null).optional(),
                email: Joi.string().allow('', null).optional(),
                status: Joi.string().valid('active', 'invited', 'inactive').default('active'),
                joined_at: Joi.number().optional()
            })).optional(),
            customColumns: Joi.array().items(Joi.object({
                id: Joi.string().required(),
                name: Joi.string().required(),
                type: Joi.string().valid('text', 'number', 'money', 'email', 'url', 'progress', 'checkbox').required(),
                width: Joi.number().optional(),
                order: Joi.number().optional(),
                createdBy: Joi.string().optional(),
                createdAt: Joi.number().optional()
            })).optional()
        }).required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.delete = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.loadProjectBySpace = function (req, res, next) {
    const schema_body = {
        space_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.archiveProject = function (req, res, next) {
    const schema_body = { id: Joi.string().required() };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.unarchiveProject = function (req, res, next) {
    const schema_body = { id: Joi.string().required() };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.loadArchived = function (req, res, next) {
    const schema_body = {};
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

exports.validation = validation;

