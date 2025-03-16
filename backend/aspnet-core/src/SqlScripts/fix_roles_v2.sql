-- Delete any existing role assignments
DELETE FROM AbpUserRoles 
WHERE UserId IN (
    SELECT Id FROM AbpUsers WHERE UserName IN ('lp-specialist', 'agriculture-manager', 'coo', 'testadmin')
);

-- Add role assignments with correct IDs
INSERT INTO AbpUserRoles (UserId, RoleId, TenantId)
VALUES 
('44444444-4444-4444-4444-444444444444', '59DD50F3-96E1-CDF8-15F5-3A18ACB9D287', NULL), -- lp-specialist to LPSpecialist
('55555555-5555-5555-5555-555555555555', 'EA036143-5771-5CDC-2BF3-3A18ACB9D28B', NULL), -- agriculture-manager to Manager
('66666666-6666-6666-6666-666666666666', '61424761-5F1B-5692-CCF1-3A18ACB9D28D', NULL); -- coo to COO 