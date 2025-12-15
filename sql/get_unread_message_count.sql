-- Function: public.get_unread_message_count(p_user_id uuid)
-- Returns total unread messages (DM + group chats) for the given user.

create or replace function public.get_unread_message_count(p_user_id uuid)
returns integer
language plpgsql
set search_path = public
as $$
declare
  v_dm_unread_count integer := 0;
  v_group_unread_count integer := 0;
begin
  ----------------------------------------------------------------------
  -- 1. DM unread count (chat_room_id IS NULL)
  ----------------------------------------------------------------------
  select count(*) into v_dm_unread_count
  from public.messages m
  where
    m.receiver_id = p_user_id
    and m.chat_room_id is null
    and (m.is_read = false or m.is_read is null);

  ----------------------------------------------------------------------
  -- 2. Group chat unread count
  --   Target rooms:
  --     - projects.owner_id = p_user_id
  --     - OR project_applications.user_id = p_user_id AND status = 'approved'
  ----------------------------------------------------------------------
  with member_projects as (
    select id as project_id
    from public.projects
    where owner_id = p_user_id

    union

    select pa.project_id
    from public.project_applications pa
    where pa.user_id = p_user_id
      and pa.status = 'approved'
  ),
  group_rooms as (
    select cr.id as chat_room_id
    from public.chat_rooms cr
    join member_projects mp
      on cr.project_id = mp.project_id
    where cr.type = 'group'
  ),
  last_reads as (
    select
      rs.chat_room_id,
      rs.last_read_at
    from public.chat_room_read_status rs
    where rs.user_id = p_user_id
  )
  select count(*) into v_group_unread_count
  from public.messages m
  join group_rooms gr
    on m.chat_room_id = gr.chat_room_id
  left join last_reads lr
    on lr.chat_room_id = m.chat_room_id
  where
    m.sender_id <> p_user_id
    and m.created_at >
      coalesce(lr.last_read_at, timestamp with time zone '1970-01-01 00:00:00+00');

  return coalesce(v_dm_unread_count, 0) + coalesce(v_group_unread_count, 0);
end;
$$;
