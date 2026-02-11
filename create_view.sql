-- Consolidated View for HR 360 Dashboard
-- This view aggregates Category A, P, and Q metrics per employee per day.

CREATE OR REPLACE VIEW hr_full_report AS
WITH daily_metrics AS (
  -- Tasks data from hr_total_task_done
  SELECT 
    s."LARK_MAIL" as lark_email,
    s."NAME" as name,
    s."DEPARTMENT" as department,
    CAST(t.date_time AS DATE) as activity_date,
    COUNT(t.id) as tasks_done,
    0 as meeting_count,
    0 as available_minutes
  FROM hr_staff_info s
  LEFT JOIN hr_total_task_done t ON LOWER(s."LARK_MAIL") = LOWER(t.id_nguoi_hung) OR LOWER(s."NAME") = LOWER(t.nguoi_hung)
  WHERE s."ACTIVE" = true
  GROUP BY s."LARK_MAIL", s."NAME", s."DEPARTMENT", CAST(t.date_time AS DATE)
  
  UNION ALL
  
  -- Meeting count from hr_teams_chats (not from hr_weekly_meeting_log)
  SELECT 
    s."LARK_MAIL" as lark_email,
    s."NAME" as name,
    s."DEPARTMENT" as department,
    CAST(c.date AS DATE) as activity_date,
    0 as tasks_done,
    SUM(c.meeting_count) as meeting_count,
    0 as available_minutes
  FROM hr_staff_info s
  LEFT JOIN hr_teams_chats c ON LOWER(s."LARK_MAIL") = LOWER(c.email)
  WHERE s."ACTIVE" = true
  GROUP BY s."LARK_MAIL", s."NAME", s."DEPARTMENT", CAST(c.date AS DATE)
  
  UNION ALL
  
  -- Available minutes from hr_weekly_meeting_log (presence data)
  SELECT 
    s."LARK_MAIL" as lark_email,
    s."NAME" as name,
    s."DEPARTMENT" as department,
    CAST(m."joinDateTime" AS DATE) as activity_date,
    0 as tasks_done,
    0 as meeting_count,
    SUM(m."durationInSeconds") / 60 as available_minutes
  FROM hr_staff_info s
  LEFT JOIN hr_weekly_meeting_log m ON LOWER(s."LARK_MAIL") = LOWER(m."emailAddress")
  WHERE s."ACTIVE" = true
  GROUP BY s."LARK_MAIL", s."NAME", s."DEPARTMENT", CAST(m."joinDateTime" AS DATE)
)
SELECT 
  lark_email,
  name,
  department,
  activity_date,
  SUM(tasks_done) as tasks_done,
  SUM(meeting_count) as meeting_count,
  SUM(available_minutes) as available_minutes
FROM daily_metrics
WHERE activity_date IS NOT NULL
GROUP BY lark_email, name, department, activity_date;
