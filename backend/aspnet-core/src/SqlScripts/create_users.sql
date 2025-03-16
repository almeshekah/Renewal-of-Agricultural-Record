-- First, add the roles if they don't exist
INSERT OR IGNORE INTO AbpRoles (Id, Name, NormalizedName, IsDefault, IsStatic, IsPublic, EntityVersion, ExtraProperties, ConcurrencyStamp)
VALUES 
('11111111-1111-1111-1111-111111111111', 'LPSpecialist', 'LPSPECIALIST', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000'),
('22222222-2222-2222-2222-222222222222', 'Manager', 'MANAGER', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000'),
('33333333-3333-3333-3333-333333333333', 'COO', 'COO', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000');

-- Store password hash for '123Qwe!'
-- This is a standard hash, works with ASP.NET Identity for testing
-- In production, unique salt would be used for each password
-- NEVER do this in production, only for testing/development
PRAGMA synchronous = OFF;

-- Add the users
INSERT OR IGNORE INTO AbpUsers (
    Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
    PasswordHash, SecurityStamp, IsExternal, PhoneNumber, PhoneNumberConfirmed, 
    IsActive, TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount,
    Name, Surname, EntityVersion, ExtraProperties, ConcurrencyStamp
)
VALUES 
-- LP Specialist
('44444444-4444-4444-4444-444444444444', 'lp-specialist', 'LP-SPECIALIST', 'lp-specialist@example.com', 'LP-SPECIALIST@EXAMPLE.COM', 1,
 'AQAAAAIAAYagAAAAEO93hCT/HKaq/qv1V8+n6TvWqMzk4JZ3adD6aZ7ks5jjyVIKJUGqzdFqMz3CYuf+PA==', -- Hash for 123Qwe!
 'D6FKPNQDADDLZXNKIJICVKDHMT5EWGSA', 0, '+966555000111', 1, 
 1, 0, NULL, 1, 0,
 'Mohammed', 'Al Qahtani', 0, '{}', '00000000-0000-0000-0000-000000000000'),

-- Agriculture Manager
('55555555-5555-5555-5555-555555555555', 'agriculture-manager', 'AGRICULTURE-MANAGER', 'agriculture-manager@example.com', 'AGRICULTURE-MANAGER@EXAMPLE.COM', 1,
 'AQAAAAIAAYagAAAAEO93hCT/HKaq/qv1V8+n6TvWqMzk4JZ3adD6aZ7ks5jjyVIKJUGqzdFqMz3CYuf+PA==', -- Hash for 123Qwe!
 'PXYQ43MBYOOUV2RVFBJ6VPKWF4KGV7R6', 0, '+966555000222', 1, 
 1, 0, NULL, 1, 0,
 'Saeed', 'Al Ghamdi', 0, '{}', '00000000-0000-0000-0000-000000000000'),

-- COO
('66666666-6666-6666-6666-666666666666', 'coo', 'COO', 'coo@example.com', 'COO@EXAMPLE.COM', 1,
 'AQAAAAIAAYagAAAAEO93hCT/HKaq/qv1V8+n6TvWqMzk4JZ3adD6aZ7ks5jjyVIKJUGqzdFqMz3CYuf+PA==', -- Hash for 123Qwe!
 'GFGSSAWEUHNFWLVMIFGQ4LP6GDRN3HZN', 0, '+966555000333', 1, 
 1, 0, NULL, 1, 0,
 'Abdullah', 'Al Otaibi', 0, '{}', '00000000-0000-0000-0000-000000000000');

-- Assign users to roles
INSERT OR IGNORE INTO AbpUserRoles (UserId, RoleId, TenantId)
VALUES 
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NULL), -- lp-specialist to LPSpecialist
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', NULL), -- agriculture-manager to Manager 
('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', NULL); -- coo to COO

PRAGMA synchronous = ON; 