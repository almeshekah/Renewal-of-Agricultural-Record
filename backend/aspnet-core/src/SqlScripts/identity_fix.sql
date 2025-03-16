-- This script sets passwords to use direct clear text storage temporarily
-- This is ONLY for diagnostic purposes to help identify password validation issues
-- In a production environment, never use this approach!

-- First, update the users to not require password change
UPDATE AbpUsers SET ShouldChangePasswordOnNextLogin = 0 WHERE UserName IN ('admin', 'lp-specialist', 'agriculture-manager', 'coo');

-- Store clear passwords for diagnostic purposes - USE THIS ONLY FOR TESTING!
-- This approach bypasses password validation and uses the string directly from the database
-- Format: ClearPassword=123Qwe!;IsEncrypted=false;HashAlgorithm=SHA1
UPDATE AbpUsers 
SET PasswordHash = 'ClearPassword=123Qwe!;IsEncrypted=false;HashAlgorithm=SHA1',
    SecurityStamp = 'CLEAR_PASSWORD_DEBUG',
    ConcurrencyStamp = lower(hex(randomblob(16))),
    EntityVersion = EntityVersion + 1
WHERE UserName = 'lp-specialist';

UPDATE AbpUsers 
SET PasswordHash = 'ClearPassword=123Qwe!;IsEncrypted=false;HashAlgorithm=SHA1',
    SecurityStamp = 'CLEAR_PASSWORD_DEBUG',
    ConcurrencyStamp = lower(hex(randomblob(16))),
    EntityVersion = EntityVersion + 1
WHERE UserName = 'agriculture-manager';

UPDATE AbpUsers 
SET PasswordHash = 'ClearPassword=123Qwe!;IsEncrypted=false;HashAlgorithm=SHA1',
    SecurityStamp = 'CLEAR_PASSWORD_DEBUG',
    ConcurrencyStamp = lower(hex(randomblob(16))),
    EntityVersion = EntityVersion + 1
WHERE UserName = 'coo';

UPDATE AbpUsers 
SET PasswordHash = 'ClearPassword=1q2w3E*;IsEncrypted=false;HashAlgorithm=SHA1',
    SecurityStamp = 'CLEAR_PASSWORD_DEBUG',
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