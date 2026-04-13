const { ValidationProvider } = require('../../../shared/validation/validation.provider');
const Joi = ValidationProvider.initModuleValidation();
var validation = {};

validation.load = function (req, res, next) {
    const schema_body = {
        filter: Joi.object().optional(),
        top: Joi.number().optional().default(100),
        offset: Joi.number().optional().default(0),
        sort: Joi.object().optional().default({ created_at: -1 }),
        tenant_id: Joi.string().optional(),
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
        id: Joi.string().required(),
        _service: Joi.any(),
        username: Joi.string().optional(),
        session: Joi.any()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.loadWithProjects = function (req, res, next) {
    const schema_body = {
        tenant_id: Joi.string().required(),
        filter: Joi.object().optional(),
        project_filter: Joi.object().optional(),
        top: Joi.number().optional().default(100),
        offset: Joi.number().optional().default(0),
        sort: Joi.object().optional().default({ created_at: -1 }),
        project_top: Joi.number().optional().default(100),
        project_offset: Joi.number().optional().default(0),
        project_sort: Joi.object().optional().default({ created_at: -1 })
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.insert = function (req, res, next) {
    const schema_body = {
        data: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().allow('', null),
            icon: Joi.string().allow('', null),
            iconColor: Joi.string().allow('', null),
            isPrivate: Joi.boolean(),
            defaultPermission: Joi.string().allow('', null),
            isactive: Joi.boolean(),
            workflowTemplate: Joi.string().allow('', null),
            statuses: Joi.alternatives().try(Joi.array().items(Joi.object()), Joi.object()).optional(),
            members: Joi.array().items(Joi.object({
                username: Joi.string().required(),
                role: Joi.string().valid('owner', 'admin', 'member', 'guest').required(),
                status: Joi.string().valid('active', 'invited', 'inactive').default('active'),
                joined_at: Joi.number().optional()
            })).optional(),
            projects: Joi.array().items(Joi.string()).optional()
        }).required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.update = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required(),
        data: Joi.object({
            name: Joi.string().allow(''),
            description: Joi.string().allow('', null),
            icon: Joi.string().allow('', null),
            iconColor: Joi.string().allow('', null),
            isPrivate: Joi.boolean(),
            projects: Joi.any(), // Allow projects update (flexible for array or operators)
            defaultPermission: Joi.string().allow('', null),
            isactive: Joi.boolean(),
            workflowTemplate: Joi.string().allow('', null),
            statuses: Joi.alternatives().try(Joi.array().items(Joi.object()), Joi.object()).optional(),
            members: Joi.array().items(Joi.object({
                username: Joi.string().required(),
                role: Joi.string().valid('owner', 'admin', 'member', 'guest').required(),
                status: Joi.string().valid('active', 'invited', 'inactive').default('active'),
                joined_at: Joi.number().optional()
            })).optional(),
        }).required().min(1)
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.loadMembers = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required(),
        _service: Joi.any(),
        username: Joi.string().optional(),
        session: Joi.any()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.delete = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.hide = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.pin = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.addMember = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required(),
        member: Joi.object({
            username: Joi.string().required(),
            role: Joi.string().valid('owner', 'admin', 'member', 'guest').default('member'),
            status: Joi.string().valid('active', 'invited', 'inactive').default('active'),
            joined_at: Joi.number().optional()
        }).required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.loadTaskInSpace = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required(),
        filter: Joi.object().optional(),
        top: Joi.number().optional().default(100),
        offset: Joi.number().optional().default(0),
        sort: Joi.object().optional().default({ created_at: -1 }),
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.invite = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required(),
        email: Joi.string().regex(/^[a-zA-Z0-9._%+-]+@gmail\.com$/).required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.acceptInvite = function (req, res, next) {
    const schema_body = {
        token: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.removeMember = function (req, res, next) {
    const schema_body = {
        id: Joi.string().required(),
        memberUsername: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.archiveSpace = function (req, res, next) {
    const schema_body = { id: Joi.string().required() };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.unarchiveSpace = function (req, res, next) {
    const schema_body = { id: Joi.string().required() };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

validation.loadArchived = function (req, res, next) {
    const schema_body = {};
    ValidationProvider.createMiddleware(schema_body, req, res, next);
}

exports.validation = validation;

