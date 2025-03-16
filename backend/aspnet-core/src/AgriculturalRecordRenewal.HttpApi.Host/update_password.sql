-- Update the password for lp-specialist to a known working format
-- This is a password hash for '1q2w3E*' that is compatible with ASP.NET Core Identity

-- First, update the password hash
UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAEAACcQAAAAEL9zpDQ+3Y5BF2dCPswJV+UKmPkQi4Z9f+M6VQ2JpTU7BMexj3l55ZLhchm5PWEL6A=='
WHERE UserName = 'lp-specialist';

-- Update the security stamp
UPDATE AbpUsers 
SET SecurityStamp = '6IKYQYLHOZHSJVTX4FDIHW6KALAYY5T4'
WHERE UserName = 'lp-specialist';

-- Update the concurrency stamp
UPDATE AbpUsers 
SET ConcurrencyStamp = '9d0df96f16b64a1a9c9db8ae46ecd8a3'
WHERE UserName = 'lp-specialist';

-- Update the entity version
UPDATE AbpUsers 
SET EntityVersion = EntityVersion + 1
WHERE UserName = 'lp-specialist';

-- Update the password for agriculture-manager
UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAEAACcQAAAAEL9zpDQ+3Y5BF2dCPswJV+UKmPkQi4Z9f+M6VQ2JpTU7BMexj3l55ZLhchm5PWEL6A=='
WHERE UserName = 'agriculture-manager';

-- Update the security stamp
UPDATE AbpUsers 
SET SecurityStamp = '7JLZQYLHOZHSJVTX4FDIHW6KALAYY5T5'
WHERE UserName = 'agriculture-manager';

-- Update the concurrency stamp
UPDATE AbpUsers 
SET ConcurrencyStamp = 'ad0df96f16b64a1a9c9db8ae46ecd8a4'
WHERE UserName = 'agriculture-manager';

-- Update the entity version
UPDATE AbpUsers 
SET EntityVersion = EntityVersion + 1
WHERE UserName = 'agriculture-manager';

-- Update the password for coo
UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAEAACcQAAAAEL9zpDQ+3Y5BF2dCPswJV+UKmPkQi4Z9f+M6VQ2JpTU7BMexj3l55ZLhchm5PWEL6A=='
WHERE UserName = 'coo';

-- Update the security stamp
UPDATE AbpUsers 
SET SecurityStamp = '8KMYQYLHOZHSJVTX4FDIHW6KALAYY5T6'
WHERE UserName = 'coo';

-- Update the concurrency stamp
UPDATE AbpUsers 
SET ConcurrencyStamp = 'bd0df96f16b64a1a9c9db8ae46ecd8a5'
WHERE UserName = 'coo';

-- Update the entity version
UPDATE AbpUsers 
SET EntityVersion = EntityVersion + 1
WHERE UserName = 'coo'; 