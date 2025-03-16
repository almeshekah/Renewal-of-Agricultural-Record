-- This script sets up users with proper ASP.NET Core Identity v3 password hash format
-- The hash below is for the password '123Qwe!'

-- Update the users not to require password change
UPDATE AbpUsers SET ShouldChangePasswordOnNextLogin = 0 WHERE UserName IN ('admin', 'lp-specialist', 'agriculture-manager', 'coo');

-- Update users with proper ASP.NET Core Identity v3 password hash for '123Qwe!'
UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAEAACcQAAAAEFsKFgN6qFKMUbKJ2Z1ct+hXOm9a9q0LNn2FCPyRNEJWGj+0JBwn3xWlUhV27n6ITA==',
    SecurityStamp = 'NPGMKSJFMEEOIHMEPC7DMGCPJ7QNZMTP',
    ConcurrencyStamp = lower(hex(randomblob(16))),
    EntityVersion = EntityVersion + 1
WHERE UserName = 'lp-specialist';

UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAEAACcQAAAAEFsKFgN6qFKMUbKJ2Z1ct+hXOm9a9q0LNn2FCPyRNEJWGj+0JBwn3xWlUhV27n6ITA==',
    SecurityStamp = 'NPGMKSJFMEEOIHMEPC7DMGCPJ7QNZMTQ',
    ConcurrencyStamp = lower(hex(randomblob(16))),
    EntityVersion = EntityVersion + 1
WHERE UserName = 'agriculture-manager';

UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAEAACcQAAAAEFsKFgN6qFKMUbKJ2Z1ct+hXOm9a9q0LNn2FCPyRNEJWGj+0JBwn3xWlUhV27n6ITA==',
    SecurityStamp = 'NPGMKSJFMEEOIHMEPC7DMGCPJ7QNZMTR',
    ConcurrencyStamp = lower(hex(randomblob(16))),
    EntityVersion = EntityVersion + 1
WHERE UserName = 'coo';

-- Update admin with proper ASP.NET Core Identity v3 password hash for '1q2w3E*'
UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAEAACcQAAAAEHxkL9i1Z9QnkdAZZ0Ku6O/sXgvIBDtD7/WmtaYxTBfUu5NQiGAE3s6v5rQ8Vq7HUA==',
    SecurityStamp = 'NPGMKSJFMEEOIHMEPC7DMGCPJ7QNZMTS',
    ConcurrencyStamp = lower(hex(randomblob(16))),
    EntityVersion = EntityVersion + 1
WHERE UserName = 'admin';

-- Ensure all users have proper role assignments
DELETE FROM AbpUserRoles WHERE UserId IN (
    SELECT Id FROM AbpUsers WHERE UserName IN ('lp-specialist', 'agriculture-manager', 'coo')
);

-- Insert role assignments using proper role IDs
INSERT INTO AbpUserRoles (UserId, RoleId, TenantId)
SELECT 
    (SELECT Id FROM AbpUsers WHERE UserName = 'lp-specialist'),
    (SELECT Id FROM AbpRoles WHERE Name = 'LPSpecialist'),
    NULL
UNION
SELECT 
    (SELECT Id FROM AbpUsers WHERE UserName = 'agriculture-manager'),
    (SELECT Id FROM AbpRoles WHERE Name = 'Manager'),
    NULL
UNION
SELECT 
    (SELECT Id FROM AbpUsers WHERE UserName = 'coo'),
    (SELECT Id FROM AbpRoles WHERE Name = 'COO'),
    NULL;

-- Optimize the database
VACUUM; 