-- Script to manually make a user an admin
-- Usage: Replace 'user@example.com' with the actual email address

UPDATE users 
SET is_admin = true 
WHERE email = 'ighanghangodspower@gmail.com';

-- Verify the change
SELECT id, email, first_name, last_name, is_admin 
FROM users 
WHERE email = 'ighanghangodspower@gmail.com';
