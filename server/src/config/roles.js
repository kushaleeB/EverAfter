/**
 * RBAC permission matrix.
 *
 * Global roles (User.role): customer | admin
 * Event roles (EventCollaborator.role): owner | partner | planner | viewer
 *
 * Owners are implicit via events.owner_id — not stored in event_collaborators.
 */

export const PERMISSIONS = {
  EVENT_READ: 'event:read',
  EVENT_WRITE: 'event:write',
  EVENT_DELETE: 'event:delete',
  INVITATION_READ: 'invitation:read',
  INVITATION_WRITE: 'invitation:write',
  INVITATION_PUBLISH: 'invitation:publish',
  GUEST_READ: 'guest:read',
  GUEST_WRITE: 'guest:write',
  GUEST_DELETE: 'guest:delete',
  RSVP_READ: 'rsvp:read',
  MEDIA_READ: 'media:read',
  MEDIA_WRITE: 'media:write',
  MEDIA_DELETE: 'media:delete',
  COLLABORATOR_MANAGE: 'collaborator:manage',
  ADMIN_ALL: 'admin:*',
};

const EVENT_ROLE_PERMISSIONS = {
  owner: Object.values(PERMISSIONS).filter((p) => p !== PERMISSIONS.ADMIN_ALL),
  partner: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.EVENT_WRITE,
    PERMISSIONS.INVITATION_READ,
    PERMISSIONS.INVITATION_WRITE,
    PERMISSIONS.INVITATION_PUBLISH,
    PERMISSIONS.GUEST_READ,
    PERMISSIONS.GUEST_WRITE,
    PERMISSIONS.RSVP_READ,
    PERMISSIONS.MEDIA_READ,
    PERMISSIONS.MEDIA_WRITE,
  ],
  planner: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.INVITATION_READ,
    PERMISSIONS.GUEST_READ,
    PERMISSIONS.GUEST_WRITE,
    PERMISSIONS.GUEST_DELETE,
    PERMISSIONS.RSVP_READ,
    PERMISSIONS.MEDIA_READ,
  ],
  viewer: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.INVITATION_READ,
    PERMISSIONS.GUEST_READ,
    PERMISSIONS.RSVP_READ,
    PERMISSIONS.MEDIA_READ,
  ],
};

export function getEventPermissions(eventRole) {
  return EVENT_ROLE_PERMISSIONS[eventRole] ?? [];
}

export function hasPermission(userPermissions, required) {
  if (userPermissions.includes(PERMISSIONS.ADMIN_ALL)) return true;
  return userPermissions.includes(required);
}
