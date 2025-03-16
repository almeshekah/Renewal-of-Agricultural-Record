-- Reset password hashes to a clean, known working format for all users

-- Update the admin user
UPDATE AbpUsers
SET PasswordHash = 'AQAAAAEAACcQAAAAEMq7GC9T9W+0bZj39qj5YwnZXwHv92v1z9fWUcO7DJGIQkTGqmQn9fy1oH1hbKuRzA==',
    SecurityStamp = '7GPQQY36BMFA6EUWMGN2SJTCZMCY5QG6',
    ConcurrencyStamp = lower(hex(randomblob(16))),
    EntityVersion = EntityVersion + 1,
    ShouldChangePasswordOnNextLogin = 0
WHERE UserName = 'admin';

-- Update lp-specialist
UPDATE AbpUsers
SET PasswordHash = 'AQAAAAEAACcQAAAAEMq7GC9T9W+0bZj39qj5YwnZXwHv92v1z9fWUcO7DJGIQkTGqmQn9fy1oH1hbKuRzA==',
    SecurityStamp = '7GPQQY36BMFA6EUWMGN2SJTCZMCY5QG7',
    ConcurrencyStamp = lower(hex(randomblob(16))),
    EntityVersion = EntityVersion + 1,
    ShouldChangePasswordOnNextLogin = 0
WHERE UserName = 'lp-specialist';

-- Update agriculture-manager
UPDATE AbpUsers
SET PasswordHash = 'AQAAAAEAACcQAAAAEMq7GC9T9W+0bZj39qj5YwnZXwHv92v1z9fWUcO7DJGIQkTGqmQn9fy1oH1hbKuRzA==',
    SecurityStamp = '7GPQQY36BMFA6EUWMGN2SJTCZMCY5QG8',
    ConcurrencyStamp = lower(hex(randomblob(16))),
    EntityVersion = EntityVersion + 1,
    ShouldChangePasswordOnNextLogin = 0
WHERE UserName = 'agriculture-manager';

-- Update coo
UPDATE AbpUsers
SET PasswordHash = 'AQAAAAEAACcQAAAAEMq7GC9T9W+0bZj39qj5YwnZXwHv92v1z9fWUcO7DJGIQkTGqmQn9fy1oH1hbKuRzA==',
    SecurityStamp = '7GPQQY36BMFA6EUWMGN2SJTCZMCY5QG9',
    ConcurrencyStamp = lower(hex(randomblob(16))),
    EntityVersion = EntityVersion + 1,
    ShouldChangePasswordOnNextLogin = 0
WHERE UserName = 'coo';

-- Clean any duplicate role assignments
DELETE FROM AbpUserRoles 
WHERE UserId IN (
    SELECT Id FROM AbpUsers 
    WHERE UserName IN ('lp-specialist', 'agriculture-manager', 'coo')
);

-- Create role assignments with correct roles
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

-- Vacuum the database to clean up and optimize
VACUUM; 