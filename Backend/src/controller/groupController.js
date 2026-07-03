/**
 * ============================================
 * GROUP CONTROLLER - Tầng điều khiển Nhóm học tập
 * ============================================
 */

import { toAPIResponse } from "#models/dto/response/APIResponse.js";
import * as groupService from "#service/groupService.js";

/**
 * POST /api/v1/groups
 */
export const createGroup = async (req, res, next) => {
    try {
        const result = await groupService.createGroupService(req.user, req.body);
        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/groups
 */
export const getMyGroups = async (req, res, next) => {
    try {
        const result = await groupService.getMyGroupsService(req.user);
        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/groups/:id
 */
export const getGroupDetail = async (req, res, next) => {
    try {
        const groupId = parseInt(req.params.id);
        const result = await groupService.getGroupDetailService(groupId, req.user);
        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/groups/:id/members
 */
export const addGroupMembers = async (req, res, next) => {
    try {
        const groupId = parseInt(req.params.id);
        const result = await groupService.addGroupMembersService(groupId, req.user, req.body);
        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/groups/:id/members/:userId
 */
export const removeGroupMember = async (req, res, next) => {
    try {
        const groupId = parseInt(req.params.id);
        const userIdToRemove = parseInt(req.params.userId);
        const result = await groupService.removeGroupMemberService(groupId, userIdToRemove, req.user);
        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/groups/:id
 */
export const disbandGroup = async (req, res, next) => {
    try {
        const groupId = parseInt(req.params.id);
        const result = await groupService.disbandGroupService(groupId, req.user);
        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/groups/:id/documents
 */
export const shareDocumentToGroup = async (req, res, next) => {
    try {
        const groupId = parseInt(req.params.id);
        const result = await groupService.shareDocumentToGroupService(groupId, req.body, req.user);
        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/groups/:id/documents/:documentId
 */
export const removeDocumentFromGroup = async (req, res, next) => {
    try {
        const groupId = parseInt(req.params.id);
        const documentId = parseInt(req.params.documentId);
        const result = await groupService.removeDocumentFromGroupService(groupId, documentId, req.user);
        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/groups/:id/documents
 */
export const getGroupDocuments = async (req, res, next) => {
    try {
        const groupId = parseInt(req.params.id);
        const result = await groupService.getGroupDocumentsService(groupId, req.query, req.user);
        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/groups/:id/documents/upload
 */
export const uploadGroupDocument = async (req, res, next) => {
    try {
        const groupId = parseInt(req.params.id);
        const result = await groupService.uploadGroupDocumentService(groupId, req.user, req.file, req.body);
        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};
