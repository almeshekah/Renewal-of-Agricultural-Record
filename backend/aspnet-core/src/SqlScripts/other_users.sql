-- Delete any existing Agriculture Manager user
DELETE FROM AbpUsers WHERE UserName = 'agriculture-manager';

-- Insert Agriculture Manager user
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
('55555555-5555-5555-5555-555555555555', NULL, 'agriculture-manager', 'AGRICULTURE-MANAGER', 'Saeed', 'Al Ghamdi',
 'agriculture-manager@example.com', 'AGRICULTURE-MANAGER@EXAMPLE.COM', 1, 
 'AQAAAAIAAYagAAAAEO93hCT/HKaq/qv1V8+n6TvWqMzk4JZ3adD6aZ7ks5jjyVIKJUGqzdFqMz3CYuf+PA==',
 'PXYQ43MBYOOUV2RVFBJ6VPKWF4KGV7R6', 0, '+966555000222', 1, 1, 0,
 NULL, 1, 0, 0, 
 0, NULL, '{}', '00000000-0000-0000-0000-000000000000',
 '2025-03-15 23:00:00', NULL, NULL, NULL, 0,
 NULL, NULL);

-- Delete any existing COO user
DELETE FROM AbpUsers WHERE UserName = 'coo';

-- Insert COO user
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
('66666666-6666-6666-6666-666666666666', NULL, 'coo', 'COO', 'Abdullah', 'Al Otaibi',
 'coo@example.com', 'COO@EXAMPLE.COM', 1, 
 'AQAAAAIAAYagAAAAEO93hCT/HKaq/qv1V8+n6TvWqMzk4JZ3adD6aZ7ks5jjyVIKJUGqzdFqMz3CYuf+PA==',
 'GFGSSAWEUHNFWLVMIFGQ4LP6GDRN3HZN', 0, '+966555000333', 1, 1, 0,
 NULL, 1, 0, 0, 
 0, NULL, '{}', '00000000-0000-0000-0000-000000000000',
 '2025-03-15 23:00:00', NULL, NULL, NULL, 0,
 NULL, NULL);

-- Create Manager role if it doesn't exist
INSERT OR IGNORE INTO AbpRoles (Id, Name, NormalizedName, IsDefault, IsStatic, IsPublic, EntityVersion, ExtraProperties, ConcurrencyStamp)
VALUES ('22222222-2222-2222-2222-222222222222', 'Manager', 'MANAGER', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000');

-- Create COO role if it doesn't exist
INSERT OR IGNORE INTO AbpRoles (Id, Name, NormalizedName, IsDefault, IsStatic, IsPublic, EntityVersion, ExtraProperties, ConcurrencyStamp)
VALUES ('33333333-3333-3333-3333-333333333333', 'COO', 'COO', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000');

-- Assign users to roles
INSERT OR IGNORE INTO AbpUserRoles (UserId, RoleId, TenantId)
VALUES 
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', NULL), -- agriculture-manager to Manager
('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', NULL); -- coo to COO 