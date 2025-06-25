-- UniVault Database Seed Data - IMPROVED VERSION
-- Enhanced sample data for testing and development
-- Version: 2.1
-- Last Updated: 2025-06-25
-- COMPREHENSIVE AUDIT IMPROVEMENTS APPLIED

USE univault_schema;

-- ////////////////
-- REFERENCE_TABLES
-- ////////////////

-- 1. CIVIL_STATUS_TYPE
INSERT INTO CIVIL_STATUS_TYPE (civil_status_code, civil_status_description, is_active) VALUES
		('CS01','Single', TRUE),
		('CS02','Married', TRUE),
		('CS03','Legally Separated', TRUE),
		('CS04','Divorced', TRUE),
		('CS05','Annulled', TRUE),
		('CS06','Widow/er', TRUE);

-- 2. ADDRESS_TYPE
INSERT INTO ADDRESS_TYPE (address_type_code, address_type, is_active) VALUES
		('AD01','Home', TRUE),
		('AD02','Alternative', TRUE),
		('AD03','Work', TRUE),
		('AD04','Other', TRUE);

-- 3. CONTACT_TYPE
INSERT INTO CONTACT_TYPE (contact_type_code, contact_type_description, is_active) VALUES
		('CT01','Mobile Number', TRUE),
		('CT02','Telephone Number', TRUE),
		('CT03','Work Number', TRUE),
		('CT04','Personal Email', TRUE),
		('CT05','Work Email', TRUE),
		('CT06','Other', TRUE);

-- 4. EMPLOYMENT_POSITION
INSERT INTO EMPLOYMENT_POSITION (position_code, employment_type, job_title, is_active) VALUES
 ('EP01', 'Private/Self-Employed', 'Owner/Director/Officer', TRUE),
 ('EP02', 'Private/Self-Employed', 'Non-Officer/Employee', TRUE),
 ('EP03', 'Private/Self-Employed', 'Contractual/Part-Time', TRUE),
 ('EP04', 'Government Employed', 'Elected/Appointee', TRUE),
 ('EP05', 'Government Employed', 'Employee', TRUE),
 ('EP06', 'Government Employed', 'Contractual/Part-Time', TRUE);

-- 5. FUND_SOURCE_TYPE
INSERT INTO FUND_SOURCE_TYPE (fund_source_code, fund_source, requires_documentation, is_active) VALUES
	 ('FS001', 'Employed - Fixed Income', FALSE, TRUE),
	 ('FS002', 'Employed - Variable Income', FALSE, TRUE),
	 ('FS003', 'Self-Employed - Business Income', TRUE, TRUE),
	 ('FS004', 'Remittances', TRUE, TRUE),
	 ('FS005', 'Pension', FALSE, TRUE),
	 ('FS006', 'Personal Savings / Retirement Proceeds', TRUE, TRUE),
	 ('FS007', 'Allowance', FALSE, TRUE),
	 ('FS008', 'Inheritance', TRUE, TRUE),
	 ('FS009', 'Investment/Dividend Income', TRUE, TRUE),
	 ('FS010', 'Rental Income', TRUE, TRUE),
	 ('FS011', 'Sale of Asset / Property', TRUE, TRUE),
	 ('FS012', 'Other Sources (Lottery, Donations, Tax Refunds, and Insurance/Legal Claims)', TRUE, TRUE);

-- 6. WORK_NATURE_TYPE
INSERT INTO WORK_NATURE_TYPE (work_nature_code, nature_description, is_high_risk, is_active) VALUES
	 ('ACT', 'Accounting/Auditing/Tax Practice Services', FALSE, TRUE),
	 ('LEG', 'Legal Services', FALSE, TRUE),
	 ('ANE', 'Architecture/Engineering', FALSE, TRUE),
	 ('SVC', 'Other Professional Services / Consultancy/Coaching', FALSE, TRUE),
	 ('PWN', 'Pawnshop', TRUE, TRUE),
	 ('LDG', 'Lending', TRUE, TRUE),
	 ('MSE', 'Money Service Business - Electronic Money Issuer', TRUE, TRUE),
	 ('MSV', 'Money Service Business - Virtual Currency Exchange', TRUE, TRUE),
	 ('MSR', 'Money Service Business - Remittance Transfer Company', TRUE, TRUE),
	 ('MSF', 'Money Service Business - Foreign Exchange Dealer / Money Changer', TRUE, TRUE),
	 ('BAN', 'Banking', FALSE, TRUE),
	 ('INS', 'Insurance', FALSE, TRUE),
	 ('SBD', 'Securities Broker / Dealer', TRUE, TRUE),
	 ('CON', 'Construction and Civil Engineering', FALSE, TRUE),
	 ('REL', 'Real Estate Brokerage and Sales', TRUE, TRUE),
	 ('MED', 'Media', FALSE, TRUE),
	 ('ENT', 'Arts/Entertainment/Recreation', FALSE, TRUE),
	 ('SPO', 'Sports/eSports', FALSE, TRUE),
	 ('GAM', 'Gambling/Casino/eGames', TRUE, TRUE),
	 ('HEA', 'Healthcare (Doctor, Dentist, Nurse, Psychiatrist and others)', FALSE, TRUE),
	 ('SOC', 'Social Work / Non-Government and Non-Profit Organizations', FALSE, TRUE),
	 ('EDU', 'Education/ Online Education', FALSE, TRUE),
	 ('COM', 'Information/Communication/Telecommunication', FALSE, TRUE),
	 ('PUB', 'Publishing/Printing', FALSE, TRUE),
	 ('ADV', 'Advertising/Marketing', FALSE, TRUE),
	 ('ICT', 'Robotics/AI/Cloud/Data Engineering/ Software Development/Cybersecurity', FALSE, TRUE),
	 ('MFG', 'Manufacturing/Packaging', FALSE, TRUE),
	 ('MFF', 'Manufacturing/Trading of Firearms and Ammunition', TRUE, TRUE),
	 ('ART', 'Art / Antiques Dealership', TRUE, TRUE),
	 ('CAR', 'Car/Boat/Plane Dealership', FALSE, TRUE),
	 ('JEW', 'Jewelry / Precious Metals / Precious Stones Dealership', TRUE, TRUE),
	 ('WRT', 'Wholesale / Retail Trade (Distribution & Sales) / E-Commerce / Online Selling', FALSE, TRUE),
	 ('REP', 'Repair Services', FALSE, TRUE),
	 ('TRN', 'Transportation (Land, Sea and Air)', FALSE, TRUE),
	 ('SHI', 'Shipping/Cargo / Storage', FALSE, TRUE),
	 ('SEA', 'Seaman / Seafarer', FALSE, TRUE),
	 ('AGR', 'Agriculture / Fishing', FALSE, TRUE),
	 ('FOR', 'Forestry', FALSE, TRUE),
	 ('MIN', 'Mining/Quarrying', TRUE, TRUE),
	 ('UTL', 'Electric Utilities', FALSE, TRUE),
	 ('OIL', 'Oil/Gasoline', TRUE, TRUE),
	 ('WAT', 'Water Supply/Sewerage/Waste Management', FALSE, TRUE),
	 ('PAD', 'Public Administration / Government', FALSE, TRUE),
	 ('MIL', 'Peace and Order (Military, Police, Fireman, Jail Warden and Others)', FALSE, TRUE),
	 ('AFS', 'Hotel/Accommodation/Restaurant/Food Services', FALSE, TRUE),
	 ('EMB', 'Embassies/Diplomatic Services / Attached Offices', FALSE, TRUE),
	 ('TRA', 'Travel / Travel Agencies', FALSE, TRUE),
	 ('AGY', 'Employment Agency / Human Resources', FALSE, TRUE),
	 ('SEC', 'Security Agency / Services', FALSE, TRUE),
	 ('OTS', 'Other Service Activities (Hairdresser, Manicurist, Masseuse and others)', FALSE, TRUE),
	 ('HOU', 'Private Household / Household Employee / Household Staff', FALSE, TRUE),
	 ('RLG', 'Religious Organization', FALSE, TRUE),
	 ('DFP', 'Designated Non Financial Business And Professions (DNFBP)', TRUE, TRUE),
	 ('OGB', 'Direct OGB/POGO Licensee and Authorized Gaming Agent', TRUE, TRUE),
	 ('OGI', 'Indirect OGB/POGO Allied Service Provider', TRUE, TRUE);

-- 7. CUSTOMER_PRODUCT_TYPE
INSERT INTO CUSTOMER_PRODUCT_TYPE (product_type_code, product_type_name, minimum_balance, is_active) VALUES
	('PR01', 'Deposits', 1000.00, TRUE),
	('PR02', 'Cards', 0.00, TRUE),
	('PR03', 'Loans', 0.00, TRUE),
	('PR04', 'Wealth Management', 100000.00, TRUE),
	('PR05', 'Insurance', 0.00, TRUE);

-- 8. ALIAS_DOCUMENTATION_TYPE
INSERT INTO ALIAS_DOCUMENTATION_TYPE (alias_doc_type_code, alias_doc_description, is_active) VALUES
	('A01', 'Driver''s License', TRUE),
	('A02', 'Passport', TRUE),
	('A03', 'SSS ID', TRUE),
	('A04', 'PhilHealth ID', TRUE),
	('A05', 'TIN ID', TRUE),
	('A06', 'Voter''s ID', TRUE),
	('A07', 'Senior Citizen ID', TRUE),
	('A08', 'PWD ID', TRUE),
	('A09', 'Postal ID', TRUE),
	('A10', 'Professional ID', TRUE),
	('A11', 'Company ID', TRUE),
	('A12', 'School ID', TRUE),
	('A13', 'Barangay ID', TRUE),
	('A14', 'UMID', TRUE),
	('A15', 'PRC ID', TRUE),
	('A16', 'GSIS ID', TRUE),
	('A17', 'PhilSys ID', TRUE),
	('A18', 'OWWA ID', TRUE),
	('A19', 'OFW ID', TRUE),
	('A20', 'Other Government ID', TRUE);

-- 9. ID_TYPE
INSERT INTO ID_TYPE (id_type_code, id_description, is_primary_id, expiration_required, is_active) VALUES
 ('PSY', 'PhilSys ID', TRUE, TRUE, TRUE),
 ('NPP', 'New Philippine Passport (Signature and photo are on separate pages)', TRUE, TRUE, TRUE),
 ('OPP', 'Old Philippine Passport (Signature and photo are on the same page)', TRUE, TRUE, TRUE),
 ('DRV', 'Driver''s License', TRUE, TRUE, TRUE),
 ('PRC', 'PRC ID', TRUE, TRUE, TRUE),
 ('UMD', 'UMID', TRUE, TRUE, TRUE),
 ('SSS', 'SSS ID', FALSE, FALSE, TRUE),
 ('POS', 'Postal ID', FALSE, TRUE, TRUE),
 ('TIN', 'TIN ID', FALSE, FALSE, TRUE),
 ('BRG', 'Barangay Certification / ID', FALSE, FALSE, TRUE),
 ('GSI', 'GSIS ID', FALSE, FALSE, TRUE),
 ('PHL', 'PhilHealth ID', FALSE, FALSE, TRUE),
 ('OWW', 'OWWA ID', FALSE, TRUE, TRUE),
 ('OFW', 'OFW ID', FALSE, TRUE, TRUE),
 ('IBP', 'IBP ID', FALSE, TRUE, TRUE),
 ('COM', 'Company ID', FALSE, TRUE, TRUE),
 ('MAR', 'MARINA ID', FALSE, TRUE, TRUE),
 ('VOT', 'Voter''s ID', FALSE, FALSE, TRUE),
 ('SEN', 'Senior Citizen ID', FALSE, TRUE, TRUE),
 ('SEA', 'Seaman''s Book', FALSE, TRUE, TRUE),
 ('GOV', 'Government Office and GOCC ID (e.g., AFP, HDMF)', FALSE, TRUE, TRUE),
 ('DSW', 'DSWD Certification', FALSE, FALSE, TRUE),
 ('NCW', 'Certification from the National Council for the Welfare of Disabled Persons (NCWDP)', FALSE, FALSE, TRUE),
 ('PWD', 'Person with Disability (PWD) ID issued by National Council on Disability Affairs (NCDA)', FALSE, TRUE, TRUE);

-- ////////////////
-- MAIN TABLES
-- ////////////////

-- Bank Employees
INSERT INTO BANK_EMPLOYEE (employee_position, employee_last_name, employee_first_name, employee_username, employee_password, is_active) VALUES
('Account Officer', 'Rizal', 'Jose', 'jrizal', '$2a$12$L8Y.A5b2.xP9tN8U7X6e2uSHJ2a7/R/C.b6E3fD4gH5e2uSHJ2a7A.LongerExampleHashValue', TRUE),
('Branch Manager', 'Bonifacio', 'Andres', 'abonifacio', '$2a$12$K9Z.B6c3.yQ0uO9V8Y7f3vTGI3b8/S/D.c7F4gH6f3vTGI3b8A.AnotherLongerExampleHash', TRUE),
('Compliance Officer', 'Del Pilar', 'Gregorio', 'gdelpilar', '$2a$12$M0A.C7d4.zR1vP0W9Z8g4wUHI4c9/T/E.d8G5hI7g4wUHI4c9A.YetAnotherLongerHashVal', TRUE),
('New Accounts Specialist', 'Silang', 'Gabriela', 'gsilang', '$2a$12$N1B.D8e5.aS2wQ1X0A9h5xVI5d0/U/F.e9H6iJ8h5xVI5d0/A.AndFinalLongerHashVal', TRUE),
('Risk Officer', 'Luna', 'Antonio', 'aluna', '$2a$12$O2C.F9g6.cT3yS2Z1B0i6yWJ6e1/V/G.f0J7jK9i6yWJ6e1/A.AdditionalHashValue', TRUE);

-- Sample Customers

-- Customer 1: Juan Dela Cruz (Standard Profile - Low Risk)
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status, reg_political_affiliation, reg_fatca, reg_dnfbp, reg_online_gaming, reg_beneficial_owner)
VALUES ('Account Owner', 'Dela Cruz', 'Juan', 'Protacio', 'juandelacruz', '$2a$12$O2C.E9f6.bT3xR2Y1B0i6yWJ6e1/V/G.f0J7jK9i6yWJ6e1/A', '1990-05-15', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '123-456-789-000', 'Active', 'No', 'No', 'No', 'No', 'No');
SET @cif1 = LAST_INSERT_ID();

INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_unit, address_street, address_barangay, address_city, address_province, address_country, address_zip_code, is_primary) VALUES
(@cif1, 'AD01', 'Unit 1A', '123 Rizal Ave', 'Barangay 176', 'Caloocan', 'Metro Manila', 'Philippines', '1422', TRUE),
(@cif1, 'AD03', '10th Floor, BGC Tower', '5th Avenue', 'Fort Bonifacio', 'Taguig', 'Metro Manila', 'Philippines', '1634', FALSE);

INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value, is_primary, is_verified) VALUES
(@cif1, 'CT01', '+639171234567', TRUE, TRUE),
(@cif1, 'CT02', '+63288876543', FALSE, FALSE),
(@cif1, 'CT04', 'juan.delacruz@email.com', TRUE, TRUE),
(@cif1, 'CT05', 'j.delacruz@workplace.com', FALSE, FALSE);

INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date, is_verified, verification_date) VALUES
(@cif1, 'DRV', 'N02-11-111111', '/ids/juan_dela_cruz_drv.jpg', '2022-08-20', '2027-08-20', TRUE, '2025-01-15'),
(@cif1, 'UMD', 'CRN-0111-1111111-1', '/ids/juan_dela_cruz_umd.jpg', '2019-01-25', '2029-01-25', TRUE, '2025-01-15');

INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code, estimated_amount) VALUES
(@cif1, 'FS001', 65000.00);

INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross, income_currency, years_in_current_position)
VALUES (@cif1, 'Tech Solutions Inc.', '2018-03-01', 'EP02', 65000.00, 'PHP', 7);
SET @emp1 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp1, 'ICT');

INSERT INTO ACCOUNT_DETAILS (product_type_code, verified_by_employee, account_open_date, account_status, initial_deposit, current_balance)
VALUES ('PR01', 1, CURDATE(), 'Active', 5000.00, 25000.00);
SET @acc1 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number, account_role) VALUES (@cif1, @acc1, 'Primary');

-- Customer 2: Maria Clara Santos (Remittance Profile - Medium Risk)
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status, remittance_country, remittance_purpose, reg_political_affiliation, reg_fatca, reg_dnfbp, reg_online_gaming, reg_beneficial_owner)
VALUES ('Account Owner', 'Santos', 'Maria Clara', 'maria.santos', '$2a$12$P3D.F0g7.cT4yS3Z2C1j7zXK7f2/W/H.g1K8kL0j7zXK7f2/A', '1985-11-22', 'Female', 'CS06', 'Philippines', 'Resident', 'Filipino', '234-567-890-001', 'Active', 'United States', 'Family Support', 'No', 'No', 'No', 'No', 'No');
SET @cif2 = LAST_INSERT_ID();

INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code, is_primary) VALUES
(@cif2, 'AD01', '456 Aguinaldo St.', 'Poblacion', 'Cebu City', 'Cebu', 'Philippines', '6000', TRUE);

INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value, is_primary, is_verified) VALUES
(@cif2, 'CT01', '+639182345678', TRUE, TRUE),
(@cif2, 'CT02', '+63322551234', FALSE, FALSE),
(@cif2, 'CT04', 'mc.santos@email.com', TRUE, TRUE);

INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date, is_verified, verification_date) VALUES
(@cif2, 'NPP', 'P1234567A', '/ids/maria_santos_npp.jpg', '2023-01-10', '2033-01-09', TRUE, '2025-01-20'),
(@cif2, 'SEN', 'SC-54321', '/ids/maria_santos_sen.jpg', '2020-11-22', '2030-11-22', TRUE, '2025-01-20');

INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code, estimated_amount) VALUES
(@cif2, 'FS004', 50000.00),
(@cif2, 'FS005', 30000.00);

INSERT INTO ACCOUNT_DETAILS (product_type_code, verified_by_employee, account_open_date, account_status, initial_deposit, current_balance)
VALUES ('PR02', 3, CURDATE(), 'Active', 2000.00, 15000.00);
SET @acc2 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number, account_role) VALUES (@cif2, @acc2, 'Primary');

-- Customer 3: Pedro Penduko (Self-Employed with Alias - Medium Risk)
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status, reg_political_affiliation, reg_fatca, reg_dnfbp, reg_online_gaming, reg_beneficial_owner)
VALUES ('Business Owner', 'Penduko', 'Pedro', 'Reyes', 'pedro.penduko', '$2a$12$Q4E.G1h8.dT5zT4A3D2k8aYL8g3/X/I.h2L9lM1k8aYL8g3/A', '1982-02-20', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '345-678-901-002', 'Active', 'No', 'No', 'No', 'No', 'No');
SET @cif3 = LAST_INSERT_ID();

INSERT INTO CUSTOMER_ALIAS (cif_number, alias_first_name, alias_last_name, alias_reason, is_verified) VALUES (@cif3, 'Peter', 'Punzalan', 'Business name variant', TRUE);
SET @alias1_cif3 = LAST_INSERT_ID();
INSERT INTO ALIAS_DOCUMENTATION (customer_alias_id, alias_doc_type_code, alias_doc_number, alias_doc_issue_date, alias_doc_storage, is_verified)
VALUES (@alias1_cif3, 'A17', 'ALIAS-DOC-001', '2021-06-30', '/docs/penduko_alias_cert.pdf', TRUE);

INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code, is_primary) VALUES
(@cif3, 'AD01', '789 Malakas St.', 'Diliman', 'Quezon City', 'Metro Manila', 'Philippines', '1101', TRUE);

INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value, is_primary, is_verified) VALUES
(@cif3, 'CT01', '+639203456789', TRUE, TRUE),
(@cif3, 'CT02', '+63279123456', FALSE, FALSE),
(@cif3, 'CT04', 'pedro.p@email.com', TRUE, TRUE);

INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date, is_verified, verification_date) VALUES
(@cif3, 'PSY', '1234-5678-9012-3456', '/ids/penduko_psy.jpg', '2022-04-12', '2032-04-12', TRUE, '2025-01-25'),
(@cif3, 'TIN', '345-678-901-002', '/ids/penduko_tin.jpg', '2005-03-15', '2035-03-15', TRUE, '2025-01-25');

INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code, estimated_amount) VALUES
(@cif3, 'FS003', 80000.00);

INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross, income_currency, years_in_current_position)
VALUES (@cif3, 'Penduko''s Sari-Sari Store', '2010-09-01', 'EP01', 80000.00, 'PHP', 15);
SET @emp3 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp3, 'WRT');

INSERT INTO ACCOUNT_DETAILS (product_type_code, verified_by_employee, account_open_date, account_status, initial_deposit, current_balance)
VALUES ('PR03', 4, CURDATE(), 'Active', 10000.00, 50000.00);
SET @acc3 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number, account_role) VALUES (@cif3, @acc3, 'Primary');

-- Customer 4: Rodrigo Gambler (High-Risk Gaming Industry)
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status, reg_political_affiliation, reg_fatca, reg_dnfbp, reg_online_gaming, reg_beneficial_owner)
VALUES ('Business Owner', 'Gambler', 'Rodrigo', 'Sanchez', 'r.gambler', '$2a$12$R5F.H2i9.eU6A5E4F3L9m9Z0h4/Y/J.i3M0nN2l9m9Z0h4/A', '1975-07-10', 'Male', 'CS02', 'Philippines', 'Resident', 'Filipino', '456-789-012-003', 'Active', 'No', 'No', 'Yes', 'Yes', 'No');
SET @cif4 = LAST_INSERT_ID();

INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code, is_primary) VALUES
(@cif4, 'AD01', '1 Casino Drive', 'Entertainment City', 'Paranaque', 'Metro Manila', 'Philippines', '1700', TRUE);

INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value, is_primary, is_verified) VALUES
(@cif4, 'CT01', '+639171112233', TRUE, TRUE),
(@cif4, 'CT04', 'r.gambler@email.com', TRUE, TRUE);

INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date, is_verified, verification_date) VALUES
(@cif4, 'DRV', 'N02-65-987654', '/ids/gambler_drv.jpg', '2020-01-20', '2030-01-20', TRUE, '2025-02-01'),
(@cif4, 'PRC', 'PRC-123456', '/ids/gambler_prc.jpg', '2018-06-15', '2028-06-15', TRUE, '2025-02-01');

INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code, estimated_amount) VALUES
(@cif4, 'FS003', 200000.00);

INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross, income_currency, years_in_current_position)
VALUES (@cif4, 'Lucky Casino Corp', '2015-01-01', 'EP01', 150000.00, 'PHP', 10);
SET @emp4 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp4, 'GAM');

INSERT INTO ACCOUNT_DETAILS (product_type_code, verified_by_employee, account_open_date, account_status, initial_deposit, current_balance)
VALUES ('PR04', 1, '2025-01-01', 'Active', 100000.00, 500000.00);
SET @acc4 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number, account_role) VALUES (@cif4, @acc4, 'Primary');

-- Customer 5: Sisa Madrigal (Pending Verification)
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status, reg_political_affiliation, reg_fatca, reg_dnfbp, reg_online_gaming, reg_beneficial_owner)
VALUES ('Account Owner', 'Madrigal', 'Sisa', NULL, 'sisa.m', '$2a$12$S6G.I3j0.fV7B6F5G4N0o0A1i5/Z/K.j4O1pP3m0o0A1i5/A', '1978-03-25', 'Female', 'CS01', 'Philippines', 'Resident', 'Filipino', '987-654-321-009', 'Pending Verification', 'No', 'No', 'No', 'No', 'No');
SET @cif5 = LAST_INSERT_ID();

INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code, is_primary) VALUES
(@cif5, 'AD01', '876 Acacia Ave', 'San Isidro', 'Davao City', 'Davao del Sur', 'Philippines', '8000', TRUE);

INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value, is_primary, is_verified) VALUES
(@cif5, 'CT01', '+639987654321', TRUE, FALSE),
(@cif5, 'CT04', 'sisa.m@email.com', TRUE, FALSE);

INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date, is_verified) VALUES
(@cif5, 'UMD', 'CRN-0555-5555555-5', '/ids/sisa_umd.jpg', '2019-10-05', '2029-10-05', FALSE),
(@cif5, 'NPP', 'PH9876543', '/ids/sisa_passport.jpg', '2021-01-15', '2031-01-15', FALSE);

INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code, estimated_amount) VALUES
(@cif5, 'FS001', 45000.00);

INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross, income_currency, years_in_current_position)
VALUES (@cif5, 'Davao General Hospital', '2020-01-15', 'EP02', 45000.00, 'PHP', 5);
SET @emp5 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp5, 'HEA');

INSERT INTO ACCOUNT_DETAILS (product_type_code, verified_by_employee, account_open_date, account_status, initial_deposit, current_balance)
VALUES ('PR05', 4, CURDATE(), 'Pending Verification', 1000.00, 1000.00);
SET @acc5 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number, account_role) VALUES (@cif5, @acc5, 'Primary');

-- Customer 6: Young Politician (High-Risk Political Connection)
INSERT INTO CUSTOMER (customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_username, customer_password, birth_date, gender, civil_status_code, birth_country, residency_status, citizenship, tax_identification_number, customer_status, reg_political_affiliation, reg_fatca, reg_dnfbp, reg_online_gaming, reg_beneficial_owner)
VALUES ('Account Owner', 'Politico', 'Miguel', 'Cabrera', 'm.politico', '$2a$12$T7H.J4k1.gV8C7F6H5O1p1B2j6/A/L.k5P2rQ4o1p1B2j6/A', '2000-12-01', 'Male', 'CS01', 'Philippines', 'Resident', 'Filipino', '111-222-333-004', 'Active', 'Yes', 'No', 'No', 'No', 'No');
SET @cif6 = LAST_INSERT_ID();

INSERT INTO CUSTOMER_ADDRESS (cif_number, address_type_code, address_street, address_barangay, address_city, address_province, address_country, address_zip_code, is_primary) VALUES
(@cif6, 'AD01', '88 Political Ave', 'Capitol Hills', 'Manila', 'Metro Manila', 'Philippines', '1000', TRUE);

INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value, is_primary, is_verified) VALUES
(@cif6, 'CT01', '+639191234567', TRUE, TRUE),
(@cif6, 'CT04', 'm.politico@gov.ph', TRUE, TRUE);

INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date, is_verified, verification_date) VALUES
(@cif6, 'PSY', '4321-8765-2109-6543', '/ids/politico_psy.jpg', '2023-01-01', '2033-01-01', TRUE, '2025-02-10'),
(@cif6, 'GOV', 'GOV-54321', '/ids/politico_gov.jpg', '2022-07-01', '2027-07-01', TRUE, '2025-02-10');

INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code, estimated_amount) VALUES
(@cif6, 'FS007', 100000.00);

INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, position_code, income_monthly_gross, income_currency, years_in_current_position)
VALUES (@cif6, 'Local Government Unit', '2022-07-01', 'EP04', 80000.00, 'PHP', 3);
SET @emp6 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code) VALUES (@emp6, 'PAD');

INSERT INTO ACCOUNT_DETAILS (product_type_code, verified_by_employee, account_open_date, account_status, initial_deposit, current_balance)
VALUES ('PR01', 2, '2025-02-01', 'Active', 50000.00, 200000.00);
SET @acc6 = LAST_INSERT_ID();
INSERT INTO CUSTOMER_ACCOUNT (cif_number, account_number, account_role) VALUES (@cif6, @acc6, 'Primary');

-- Sample Review Queue Entries
INSERT INTO REVIEW_QUEUE (cif_number, request_type, request_timestamp, request_details, review_status, priority_level) VALUES
(@cif4, 'Risk Assessment', '2025-01-15 10:30:00', 'High-risk customer in gaming industry requires enhanced due diligence', 'PENDING', 'High'),
(@cif6, 'Compliance Review', '2025-02-10 14:15:00', 'Politically exposed person (PEP) screening required', 'PENDING', 'Critical'),
(@cif5, 'Document Verification', '2025-02-20 09:00:00', 'Pending verification of customer IDs and employment information', 'PENDING', 'Medium');

-- Trigger risk scoring updates for all customers
UPDATE CUSTOMER SET updated_at = CURRENT_TIMESTAMP WHERE cif_number IN (@cif1, @cif2, @cif3, @cif4, @cif5, @cif6);
