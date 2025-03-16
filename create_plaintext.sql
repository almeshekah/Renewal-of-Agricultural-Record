-- Create a simple user with a known working password hash for the password 123Qwe!
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
('88888888-8888-8888-8888-888888888888', NULL, 'simple', 'SIMPLE', 'Simple', 'User',
 'simple@example.com', 'SIMPLE@EXAMPLE.COM', 1, 
 -- Hash for password 123Qwe!
 'AQAAAAEAACcQAAAAEL9zpDQ+3Y5BF2dCPswJV+UKmPkQi4Z9f+M6VQ2JpTU7BMexj3l55ZLhchm5PWEL6A==',
 '6IKYQYLHOZHSJVTX4FDIHW6KALAYY5T4', 0, '+966555111111', 1, 1, 0,
 NULL, 1, 0, 0, 
 0, NULL, '{}', '9d0df96f16b64a1a9c9db8ae46ecd8a3',
 DATETIME('now'), NULL, NULL, NULL, 0,
 NULL, NULL);

-- Add user to admin role
INSERT OR REPLACE INTO AbpUserRoles (UserId, RoleId, TenantId)
VALUES ('88888888-8888-8888-8888-888888888888', '0345204E-6585-3F60-B701-3A18ACB9CFE2', NULL); 