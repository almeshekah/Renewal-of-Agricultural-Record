-- Delete any existing user with the same username
DELETE FROM AbpUsers WHERE UserName = 'lp-specialist';

-- Insert LP Specialist user
INSERT INTO AbpUsers (
    Id, TenantId, UserName, NormalizedUserName, Name, Surname,
    Email, NormalizedEmail, EmailConfirmed, PasswordHash, SecurityStamp,
    IsExternal, PhoneNumber, PhoneNumberConfirmed, IsActive, TwoFactorEnabled,
    LockoutEnd, LockoutEnabled, AccessFailedCount, ShouldChangePasswordOnNextLogin,
    EntityVersion, LastPasswordChangeTime, ExtraProperties, ConcurrencyStamp,
    CreationTime, CreatorId, LastModificationTime, LastModifierId, IsDeleted,
    DeleterId, DeletionTime
)
VALUES 
('44444444-4444-4444-4444-444444444444', NULL, 'lp-specialist', 'LP-SPECIALIST', 'Mohammed', 'Al Qahtani',
 'lp-specialist@example.com', 'LP-SPECIALIST@EXAMPLE.COM', 1, 
 'AQAAAAIAAYagAAAAEO93hCT/HKaq/qv1V8+n6TvWqMzk4JZ3adD6aZ7ks5jjyVIKJUGqzdFqMz3CYuf+PA==',
 'D6FKPNQDADDLZXNKIJICVKDHMT5EWGSA', 0, '+966555000111', 1, 1, 0,
 NULL, 1, 0, 0, 
 0, NULL, '{}', '00000000-0000-0000-0000-000000000000',
 '2025-03-15 23:00:00', NULL, NULL, NULL, 0,
 NULL, NULL);

-- Create LPSpecialist role if it doesn't exist
INSERT OR IGNORE INTO AbpRoles (Id, Name, NormalizedName, IsDefault, IsStatic, IsPublic, EntityVersion, ExtraProperties, ConcurrencyStamp)
VALUES ('11111111-1111-1111-1111-111111111111', 'LPSpecialist', 'LPSPECIALIST', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000');

-- Assign user to role
INSERT OR IGNORE INTO AbpUserRoles (UserId, RoleId, TenantId)
VALUES ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NULL); 