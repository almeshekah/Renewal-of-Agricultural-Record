-- This script sets empty passwords for all users to allow easy login

-- Update the security settings
UPDATE AbpUsers SET ShouldChangePasswordOnNextLogin = 0 WHERE UserName IN ('admin', 'lp-specialist', 'agriculture-manager', 'coo');

-- Set all password hashes to NULL (empty password)
UPDATE AbpUsers 
SET PasswordHash = NULL,
    SecurityStamp = lower(hex(randomblob(16))),
    ConcurrencyStamp = lower(hex(randomblob(16))),
    EntityVersion = EntityVersion + 1
WHERE UserName IN ('admin', 'lp-specialist', 'agriculture-manager', 'coo');

-- Make sure roles are properly assigned
DELETE FROM AbpUserRoles WHERE UserId IN (
    SELECT Id FROM AbpUsers WHERE UserName IN ('lp-specialist', 'agriculture-manager', 'coo')
);

-- Insert role assignments
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