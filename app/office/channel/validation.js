const { ValidationProvider } = require('../../../shared/validation/validation.provider');
const Joi = ValidationProvider.initModuleValidation();
var validation = {};

validation.load = function (req, res, next) {
    const schema_body = {
        top: Joi.number().optional().default(100),
        offset: Joi.number().optional().default(0)
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.loadBySpace = function (req, res, next) {
    const schema_body = {
        space_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.loadDetails = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.insert = function (req, res, next) {
    const schema_body = {
        data: Joi.object({
            name: Joi.string().required(),
            space_id: Joi.string().required(),
            description: Joi.string().optional().allow(''),
            members: Joi.array().items(Joi.string()).optional()
        }).required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.update = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required(),
        data: Joi.object({
            name: Joi.string().optional(),
            description: Joi.string().optional().allow('')
        }).required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.delete = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.loadMessages = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required(),
        limit: Joi.number().optional().default(50),
        before: Joi.string().optional().allow(null)
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.sendMessage = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required(),
        text: Joi.string().required().min(1),
        reply_to: Joi.object({
            message_id: Joi.string().required(),
            text: Joi.string().required(),
            sender: Joi.string().required()
        }).optional().allow(null)
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.findOrCreateDM = function (req, res, next) {
    const schema_body = {
        target_email: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.editMessage = function (req, res, next) {
    const schema_body = {
        message_id: Joi.string().required(),
        text: Joi.string().required().min(1),
        channel_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.deleteMessage = function (req, res, next) {
    const schema_body = {
        message_id: Joi.string().required(),
        channel_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.reactToMessage = function (req, res, next) {
    const schema_body = {
        message_id: Joi.string().required(),
        emoji: Joi.string().required(),
        channel_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.markRead = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.getUnreadCounts = function (req, res, next) {
    const schema_body = {};
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.getReadReceipts = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.getMemberAvatars = function (req, res, next) {
    const schema_body = {
        usernames: Joi.array().items(Joi.string()).required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.pinMessage = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required(),
        message_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.unpinMessage = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required(),
        message_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.getPinnedMessages = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.sendMessageWithAttachments = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required(),
        text: Joi.string().allow('').optional(),
        type: Joi.string().optional(),
        attachments: Joi.array().optional(),
        reply_to: Joi.object().allow(null).optional()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.toggleMuteChannel = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.getChannelMembers = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.addMembers = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required(),
        members: Joi.array().items(Joi.string()).min(1).required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

validation.removeMember = function (req, res, next) {
    const schema_body = {
        channel_id: Joi.string().required(),
        member: Joi.string().required()
    };
    ValidationProvider.createMiddleware(schema_body, req, res, next);
};

exports.validation = validation;
