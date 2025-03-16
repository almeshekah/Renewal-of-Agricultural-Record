-- Update password hash for all three users with a known working hash format
-- This hash format is compatible with ASP.NET Core Identity for the password "123Qwe!"

-- Update LP Specialist password
UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAEAACcQAAAAECW6T7s8qdS35zMcuEXvsfnPTDb6BjjA5+TugRzhH5ZvRmU06v9kqkiQcZR/7COV2A=='
WHERE UserName = 'lp-specialist';

-- Update Agriculture Manager password
UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAEAACcQAAAAECW6T7s8qdS35zMcuEXvsfnPTDb6BjjA5+TugRzhH5ZvRmU06v9kqkiQcZR/7COV2A=='
WHERE UserName = 'agriculture-manager';

-- Update COO password
UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAEAACcQAAAAECW6T7s8qdS35zMcuEXvsfnPTDb6BjjA5+TugRzhH5ZvRmU06v9kqkiQcZR/7COV2A=='
WHERE UserName = 'coo';

-- Update the Security Stamps
UPDATE AbpUsers 
SET SecurityStamp = REPLACE(HEX(RANDOMBLOB(16)), '00', '')
WHERE UserName IN ('lp-specialist', 'agriculture-manager', 'coo'); 