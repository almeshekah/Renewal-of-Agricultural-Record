-- Update users with simpler passwords using a different hash format
-- This uses a more recent ASP.NET Core Identity hash format

-- First reset the password hash to NULL for all users
UPDATE AbpUsers 
SET PasswordHash = NULL
WHERE UserName IN ('lp-specialist', 'agriculture-manager', 'coo');

-- Update LP Specialist with Version 3 hash format
UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAIAAYagAAAAEP929OYQEWrw1AaFXX4VuLOCZ71Nv7yNhZYKZNnSBfFuypYJdDJzojPkXRFBDN7WjA=='
WHERE UserName = 'lp-specialist';

-- Update Agriculture Manager with Version 3 hash format
UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAIAAYagAAAAEP929OYQEWrw1AaFXX4VuLOCZ71Nv7yNhZYKZNnSBfFuypYJdDJzojPkXRFBDN7WjA=='
WHERE UserName = 'agriculture-manager';

-- Update COO with Version 3 hash format
UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAIAAYagAAAAEP929OYQEWrw1AaFXX4VuLOCZ71Nv7yNhZYKZNnSBfFuypYJdDJzojPkXRFBDN7WjA=='
WHERE UserName = 'coo';

-- Update security stamps
UPDATE AbpUsers 
SET SecurityStamp = LOWER(REPLACE(HEX(RANDOMBLOB(16)), '00', ''))
WHERE UserName IN ('lp-specialist', 'agriculture-manager', 'coo');

-- Update version
UPDATE AbpUsers
SET EntityVersion = EntityVersion + 1
WHERE UserName IN ('lp-specialist', 'agriculture-manager', 'coo'); 