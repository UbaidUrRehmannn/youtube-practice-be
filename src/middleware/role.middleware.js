import constant, { resourceTypes, resourcePermissions } from '../constant.js';
import ApiError from '../utils/errorhandler.js';
import asyncHandler from '../utils/asynchandler.js';

/**
 * Flexible, version-agnostic Role-based access control middleware.
 * Supports any resource type (users, videos, tweets, comments, etc.) and any API version.
 * Uses centralized permissions from constant.js for easy expansion.
 * Usage: router.use(requireRoutePermission)
 */
const requireRoutePermission = asyncHandler(async (req, res, next) => {
    // 1. Bypass for public routes
    if (constant.publicRouts.some(route => req.path.includes(route))) {
        return next();
    }

    // 2. Ensure user and role are present
    if (!req.user || !req.user.role) {
        throw new ApiError(401, 'Unauthorized: No user or role found');
    }

    // 3. Admins can access everything
    if (req.user.role === 'admin') return next();

    // 4. Remove any /api/v{number}/ prefix for version-agnostic matching
    let currentPath = req.path.replace(/^\/api\/v[0-9]+\//, '/');
    // Remove leading slash for consistency
    currentPath = currentPath.replace(/^\/+/, '');

    // 5. Split path into segments (e.g., "user/refreshToken" -> ["user", "refreshToken"])
    const pathSegments = currentPath.split('/').filter(Boolean);
    if (pathSegments.length === 0) {
        throw new ApiError(403, 'Forbidden: Invalid route');
    }

    // 6. Extract resource type and action
    const resourceType = pathSegments[0]; // e.g., "user", "video", "tweet"
    const action = pathSegments[1] || ''; // e.g., "refreshToken", "allUsers", or empty for /user
    const hasId = pathSegments.length > 2; // e.g., /user/123/update

    // 7. Check if resource type is supported
    if (!resourceTypes.includes(resourceType)) {
        throw new ApiError(403, `Forbidden: Resource type '${resourceType}' not supported`);
    }

    // 8. Get permissions for this resource type
    const perms = resourcePermissions[resourceType];
    if (!perms) {
        throw new ApiError(403, `Forbidden: No permissions defined for resource '${resourceType}'`);
    }

    // 9. Determine user role and allowed actions
    // Public actions (no auth required, but you may want to check for req.user)
    if (perms.public && perms.public.includes(action)) {
        return next();
    }
    // Authenticated actions (all logged-in users)
    if (perms.authenticated && perms.authenticated.includes(action)) {
        return next();
    }
    // Moderator actions
    if (req.user.role === 'moderator' && perms.moderator && perms.moderator.includes(action)) {
        return next();
    }
    // Admin actions (already handled above, but included for completeness)
    if (req.user.role === 'admin' && perms.admin && perms.admin.includes(action)) {
        return next();
    }
    // Owner actions (for future: check if user owns the resource)
    if (perms.owner && perms.owner.includes(action)) {
        // TODO: Implement owner check logic if needed
        // For now, allow all authenticated users for owner actions
        return next();
    }
    // ID-based actions (e.g., /user/:id/update)
    // You can expand this logic for more complex patterns
    if (hasId) {
        // Example: allow updateUser/:id for moderator
        if (req.user.role === 'moderator' && perms.moderator && perms.moderator.some(a => a.includes('/:id'))) {
            return next();
        }
        if (req.user.role === 'admin' && perms.admin && perms.admin.some(a => a.includes('/:id'))) {
            return next();
        }
        if (perms.owner && perms.owner.some(a => a.includes('/:id'))) {
            // TODO: Implement owner check logic
            return next();
        }
    }

    // 10. If no permission matched, deny access
    throw new ApiError(403, 'Forbidden: You do not have permission to access this resource');
});

export default requireRoutePermission; 