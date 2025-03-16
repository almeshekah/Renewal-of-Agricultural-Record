-- Create a minimal user with a very simple password hash
-- This uses the format that works with ASP.NET Core Identity for .NET 6

-- Create the admin role
INSERT OR IGNORE INTO AbpRoles (Id, Name, NormalizedName, IsDefault, IsStatic, IsPublic, EntityVersion, ExtraProperties, ConcurrencyStamp)
VALUES 
('0345204E-6585-3F60-B701-3A18ACB9CFE2', 'admin', 'ADMIN', 1, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000');

-- Create a simple user with admin role
INSERT OR REPLACE INTO AbpUsers (
    Id, TenantId, UserName, NormalizedUserName, Name, Surname,
    Email, NormalizedEmail, EmailConfirmed, PasswordHash, SecurityStamp,
    IsExternal, PhoneNumber, PhoneNumberConfirmed, IsActive, TwoFactorEnabled,
    LockoutEnd, LockoutEnabled, AccessFailedCount, ShouldChangePasswordOnNextLogin,
    EntityVersion, LastPasswordChangeTime, ExtraProperties, ConcurrencyStamp,
    CreationTime, CreatorId, LastModificationTime, LastModifierId, IsDeleted,
    DeleterId, DeletionTime
)
VALUES 
('2DB77BA0-8EFE-1CA6-D4C0-3A18ACB9CDCF', NULL, 'admin', 'ADMIN', 'Admin', 'User',
 'admin@abp.io', 'ADMIN@ABP.IO', 1, 
 'AQAAAAEAACcQAAAAEDXOLwrJE6A9MukrCJFM3Ycw+3TO9U5/5qlmoPt6EYyfGvG+XvLwXXRrxFQPgmXBTA==',
 'KKZCPQPWMTLKXVEKXZFF6VDXRSWC3NAY', 0, '+966555999999', 1, 1, 0,
 NULL, 1, 0, 0, 
 0, NULL, '{}', '625bdb53e9bc49478cab29edb6069e7d',
 DATETIME('now'), NULL, NULL, NULL, 0,
 NULL, NULL);

-- Simple user role assignment
INSERT OR REPLACE INTO AbpUserRoles (UserId, RoleId, TenantId)
VALUES ('2DB77BA0-8EFE-1CA6-D4C0-3A18ACB9CDCF', '0345204E-6585-3F60-B701-3A18ACB9CFE2', NULL);

-- Now create a test user
INSERT OR REPLACE INTO AbpUsers (
    Id, TenantId, UserName, NormalizedUserName, Name, Surname,
    Email, NormalizedEmail, EmailConfirmed, PasswordHash, SecurityStamp,
    IsExternal, PhoneNumber, PhoneNumberConfirmed, IsActive, TwoFactorEnabled,
    LockoutEnd, LockoutEnabled, AccessFailedCount, ShouldChangePasswordOnNextLogin,
    EntityVersion, LastPasswordChangeTime, ExtraProperties, ConcurrencyStamp,
    CreationTime, CreatorId, LastModificationTime, LastModifierId, IsDeleted,
    DeleterId, DeletionTime
)
VALUES 
('44444444-4444-4444-4444-444444444444', NULL, 'test', 'TEST', 'Test', 'User',
 'test@example.com', 'TEST@EXAMPLE.COM', 1, 
 'AQAAAAEAACcQAAAAEDXOLwrJE6A9MukrCJFM3Ycw+3TO9U5/5qlmoPt6EYyfGvG+XvLwXXRrxFQPgmXBTA==',
 'KKZCPQPWMTLKXVEKXZFF6VDXRSWC3NAY', 0, '+966555999999', 1, 1, 0,
 NULL, 1, 0, 0, 
 0, NULL, '{}', '625bdb53e9bc49478cab29edb6069e7c',
 DATETIME('now'), NULL, NULL, NULL, 0,
 NULL, NULL); 