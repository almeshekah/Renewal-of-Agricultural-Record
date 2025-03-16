-- Reset any existing users
DELETE FROM AbpUserRoles WHERE UserId IN (
    '44444444-4444-4444-4444-444444444444', 
    '55555555-5555-5555-5555-555555555555', 
    '66666666-6666-6666-6666-666666666666'
);

DELETE FROM AbpUsers WHERE Id IN (
    '44444444-4444-4444-4444-444444444444', 
    '55555555-5555-5555-5555-555555555555', 
    '66666666-6666-6666-6666-666666666666'
);

-- Make sure all roles exist
INSERT OR IGNORE INTO AbpRoles (Id, Name, NormalizedName, IsDefault, IsStatic, IsPublic, EntityVersion, ExtraProperties, ConcurrencyStamp)
VALUES 
('59DD50F3-96E1-CDF8-15F5-3A18ACB9D287', 'LPSpecialist', 'LPSPECIALIST', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000'),
('EA036143-5771-5CDC-2BF3-3A18ACB9D28B', 'Manager', 'MANAGER', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000'),
('61424761-5F1B-5692-CCF1-3A18ACB9D28D', 'COO', 'COO', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000');

-- Create LP Specialist
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
 -- Hash for 123Qwe!
 'AQAAAAEAACcQAAAAEL9zpDQ+3Y5BF2dCPswJV+UKmPkQi4Z9f+M6VQ2JpTU7BMexj3l55ZLhchm5PWEL6A==',
 '6IKYQYLHOZHSJVTX4FDIHW6KALAYY5T4', 0, '+966555000111', 1, 1, 0,
 NULL, 1, 0, 0, 
 0, NULL, '{}', '9d0df96f16b64a1a9c9db8ae46ecd8a3',
 DATETIME('now'), NULL, NULL, NULL, 0,
 NULL, NULL);

-- Create Agriculture Manager
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
 -- Hash for 123Qwe!
 'AQAAAAEAACcQAAAAEL9zpDQ+3Y5BF2dCPswJV+UKmPkQi4Z9f+M6VQ2JpTU7BMexj3l55ZLhchm5PWEL6A==',
 '7JLZQYLHOZHSJVTX4FDIHW6KALAYY5T5', 0, '+966555000222', 1, 1, 0,
 NULL, 1, 0, 0, 
 0, NULL, '{}', 'ad0df96f16b64a1a9c9db8ae46ecd8a4',
 DATETIME('now'), NULL, NULL, NULL, 0,
 NULL, NULL);

-- Create COO
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
 -- Hash for 123Qwe!
 'AQAAAAEAACcQAAAAEL9zpDQ+3Y5BF2dCPswJV+UKmPkQi4Z9f+M6VQ2JpTU7BMexj3l55ZLhchm5PWEL6A==',
 '8KMYQYLHOZHSJVTX4FDIHW6KALAYY5T6', 0, '+966555000333', 1, 1, 0,
 NULL, 1, 0, 0, 
 0, NULL, '{}', 'bd0df96f16b64a1a9c9db8ae46ecd8a5',
 DATETIME('now'), NULL, NULL, NULL, 0,
 NULL, NULL);

-- Assign users to roles
INSERT INTO AbpUserRoles (UserId, RoleId, TenantId)
VALUES 
('44444444-4444-4444-4444-444444444444', '59DD50F3-96E1-CDF8-15F5-3A18ACB9D287', NULL), -- lp-specialist to LPSpecialist
('55555555-5555-5555-5555-555555555555', 'EA036143-5771-5CDC-2BF3-3A18ACB9D28B', NULL), -- agriculture-manager to Manager
('66666666-6666-6666-6666-666666666666', '61424761-5F1B-5692-CCF1-3A18ACB9D28D', NULL); -- coo to COO 