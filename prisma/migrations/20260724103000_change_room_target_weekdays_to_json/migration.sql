UPDATE `rooms`
SET `target_weekdays` = '[]'
WHERE `target_weekdays` IS NULL
   OR `target_weekdays` = '';

UPDATE `rooms`
SET `target_weekdays` = CONCAT('[', `target_weekdays`, ']')
WHERE `target_weekdays` NOT LIKE '[%]';

ALTER TABLE `rooms`
  MODIFY `target_weekdays` JSON NOT NULL;
