alter type public.personal_record_type add value if not exists 'max_reps';

comment on column public.workout_sessions.exercises is
'JSONB exercise log. Each set may include isPr/is_pr boolean and prType/pr_type values: weight, reps, volume.';
