-- Move all existing tasks to Unsorted (priority = NULL)
-- This is a one-time migration to clean up the old priority system

UPDATE tasks
SET priority = NULL
WHERE priority IS NOT NULL;

-- Also reset sort_order to 0 for all tasks
UPDATE tasks
SET sort_order = 0;
