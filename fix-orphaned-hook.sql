-- Fix orphaned Directories Pro hook in Ultra Card plugin
-- Run this in phpMyAdmin or MySQL command line

-- Check if the hook exists
SELECT * FROM wp_options WHERE option_name = 'cron' AND option_value LIKE '%enable_directories_pro_presets_api%';

-- Remove the orphaned hook from wp_options (cron jobs)
UPDATE wp_options 
SET option_value = REPLACE(option_value, 'enable_directories_pro_presets_api', '') 
WHERE option_name = 'cron';

-- Also check wp_hooks table if it exists
-- SELECT * FROM wp_hooks WHERE hook = 'enable_directories_pro_presets_api';
-- DELETE FROM wp_hooks WHERE hook = 'enable_directories_pro_presets_api';

