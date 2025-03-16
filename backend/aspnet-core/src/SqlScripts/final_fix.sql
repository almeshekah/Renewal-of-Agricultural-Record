-- Update all passwords to a simpler format
-- This hash is for the password '123Qwe!'
-- We're setting the same password for all users to ensure consistency

UPDATE AbpUsers 
SET PasswordHash = 'AQAAAAEAACcQAAAAENB9s/HK7Uy/O/BXVx056QmU9A4GSfWJxiTb2KBXWIxM3pWUgvXg8YuBmaJJA8/Xzw=='
WHERE UserName IN ('lp-specialist', 'agriculture-manager', 'coo', 'testadmin');

-- Update concurrency stamps and version
UPDATE AbpUsers
SET 
  ConcurrencyStamp = LOWER(REPLACE(HEX(RANDOMBLOB(16)), '00', '')),
  EntityVersion = EntityVersion + 1,
  SecurityStamp = LOWER(REPLACE(HEX(RANDOMBLOB(16)), '00', '')),
  LastModificationTime = DATETIME('now')
WHERE UserName IN ('lp-specialist', 'agriculture-manager', 'coo', 'testadmin');

-- Make sure ShouldChangePasswordOnNextLogin is false
UPDATE AbpUsers
SET ShouldChangePasswordOnNextLogin = 0
WHERE UserName IN ('lp-specialist', 'agriculture-manager', 'coo', 'testadmin'); 