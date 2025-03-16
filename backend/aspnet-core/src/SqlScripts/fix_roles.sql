-- Make sure the roles exist
INSERT OR IGNORE INTO AbpRoles (Id, Name, NormalizedName, IsDefault, IsStatic, IsPublic, EntityVersion, ExtraProperties, ConcurrencyStamp)
VALUES 
('11111111-1111-1111-1111-111111111111', 'LPSpecialist', 'LPSPECIALIST', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000'),
('22222222-2222-2222-2222-222222222222', 'Manager', 'MANAGER', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000'),
('33333333-3333-3333-3333-333333333333', 'COO', 'COO', 0, 1, 1, 0, '{}', '00000000-0000-0000-0000-000000000000');

-- Delete any existing role assignments for these users
DELETE FROM AbpUserRoles 
WHERE UserId IN (
    SELECT Id FROM AbpUsers WHERE UserName IN ('lp-specialist', 'agriculture-manager', 'coo')
);

-- Add role assignments
INSERT INTO AbpUserRoles (UserId, RoleId, TenantId)
SELECT u.Id, r.Id, NULL
FROM AbpUsers u, AbpRoles r
WHERE (u.UserName = 'lp-specialist' AND r.Name = 'LPSpecialist')
   OR (u.UserName = 'agriculture-manager' AND r.Name = 'Manager')
   OR (u.UserName = 'coo' AND r.Name = 'COO'); 