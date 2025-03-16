-- Delete the user first
DELETE FROM AbpUserRoles WHERE UserId = '44444444-4444-4444-4444-444444444444';
DELETE FROM AbpUsers WHERE Id = '44444444-4444-4444-4444-444444444444';

-- Insert a completely fresh user
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
 'AQAAAAIAAYagAAAAEPdtALXXfpOdFyYeLH86nXDCQnYZkP/JiVPIK+BbU0iOYCGT14mK3Rdi/zoIUMYVwQ==',
 '7XM6WZWGFIRLPKR4BVSTKUOYHPTWD6DF', 0, '+966555000111', 1, 1, 0,
 NULL, 1, 0, 0, 
 0, NULL, '{}', '8f20b45952e2416eb2da8e9073a74a94',
 DATETIME('now'), NULL, NULL, NULL, 0,
 NULL, NULL);

-- Make sure the role exists
INSERT OR IGNORE INTO AbpRoles (Id, Name, NormalizedName, IsDefault, IsStatic, IsPublic, EntityVersion, ExtraProperties, ConcurrencyStamp)
VALUES 
('11111111-1111-1111-1111-111111111111', 'LPSpecialist', 'LPSPECIALIST', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000');

-- Assign the user to role
INSERT OR IGNORE INTO AbpUserRoles (UserId, RoleId, TenantId)
VALUES ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NULL);

-- Also create a test admin user with the same password
INSERT OR IGNORE INTO AbpUsers (
    Id, TenantId, UserName, NormalizedUserName, Name, Surname,
    Email, NormalizedEmail, EmailConfirmed, PasswordHash, SecurityStamp,
    IsExternal, PhoneNumber, PhoneNumberConfirmed, IsActive, TwoFactorEnabled,
    LockoutEnd, LockoutEnabled, AccessFailedCount, ShouldChangePasswordOnNextLogin,
    EntityVersion, LastPasswordChangeTime, ExtraProperties, ConcurrencyStamp,
    CreationTime, CreatorId, LastModificationTime, LastModifierId, IsDeleted,
    DeleterId, DeletionTime
)
VALUES 
('77777777-7777-7777-7777-777777777777', NULL, 'testadmin', 'TESTADMIN', 'Test', 'Admin',
 'testadmin@example.com', 'TESTADMIN@EXAMPLE.COM', 1, 
 'AQAAAAIAAYagAAAAEPdtALXXfpOdFyYeLH86nXDCQnYZkP/JiVPIK+BbU0iOYCGT14mK3Rdi/zoIUMYVwQ==',
 'SDFLK3J42LJFLSKDJFOIWEJRLSKDJFLS', 0, '+966555999999', 1, 1, 0,
 NULL, 1, 0, 0, 
 0, NULL, '{}', 'ab2ec529a7694a7d96bde7a8c5a4bc19',
 DATETIME('now'), NULL, NULL, NULL, 0,
 NULL, NULL); 