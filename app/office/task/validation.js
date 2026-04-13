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
        title: Joi.string().required(),
        description: Joi.string().allow('', null).optional(),
        status: Joi.string().optional(),
        priority: Joi.string().optional(),
        startDate: Joi.alternatives().try(Joi.string(), Joi.date(), Joi.number()).allow(null).optional(),
        dueDate: Joi.alternatives().try(Joi.string(), Joi.date(), Joi.number()).allow(null).optional(),
        attachments: Joi.array().optional(),
        assignees: Joi.array().optional(),
        projectId: Joi.string().optional(),
        project_id: Joi.string().optional(),
        space_id: Joi.string().optional(),
        isactive: Joi.boolean().optional(),
        parent_id: Joi.string().allow('', null).optional(),
        dependencies: Joi.array().items(Joi.string()).optional(),
        tags: Joi.array().items(Joi.string()).optional()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.update = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required(),
        data: Joi.object({
            name: Joi.string().optional(),
            title: Joi.string().optional(),
            description: Joi.string().allow('', null).optional(),
            status: Joi.string().optional(),
            priority: Joi.string().optional(),
            startDate: Joi.alternatives().try(Joi.string(), Joi.date(), Joi.number()).allow(null).optional(),
            dueDate: Joi.alternatives().try(Joi.string(), Joi.date(), Joi.number()).allow(null).optional(),
            assignees: Joi.array().optional(),
            isactive: Joi.boolean().optional(),
            parent_id: Joi.string().allow('', null).optional(),
            dependencies: Joi.array().items(Joi.string()).optional(),
            tags: Joi.array().items(Joi.string()).optional(),
            customFields: Joi.object().pattern(Joi.string(), Joi.any()).optional()
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

validation.loadTaskByProject = function (req, res, next) {
    const schema_body = {
        project_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.addComment = function (req, res, next) {
    const schema_body = {
        task_id: Joi.string().required(),
        content: Joi.string().allow('', null).optional(),
        attachments: Joi.array().optional(),
        mentions: Joi.array().optional()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.updateComment = function (req, res, next) {
    const schema_body = {
        task_id: Joi.string().required(),
        comment_id: Joi.string().required(),
        content: Joi.string().allow('', null).optional(),
        attachments: Joi.array().optional(),
        mentions: Joi.array().optional()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.deleteComment = function (req, res, next) {
    const schema_body = {
        task_id: Joi.string().required(),
        comment_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.duplicate = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.archive = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.loadArchived = function (req, res, next) {
    const schema_body = {};
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.unarchive = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.sendEmail = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required(),
        toEmail: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

exports.validation = validation;

