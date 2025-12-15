-- Function: public.get_my_matches(p_user_id uuid)
-- Returns mutual like partner ids as match_id (distinct)

create or replace function public.get_my_matches(p_user_id uuid)
returns table(match_id uuid)
language sql
set search_path = public
as $$
  select distinct l1.receiver_id as match_id
  from public.likes l1
  join public.likes l2
    on l1.sender_id = p_user_id
   and l2.receiver_id = p_user_id
   and l1.receiver_id = l2.sender_id;
$$;

-- Grant execute to authenticated users
grant execute on function public.get_my_matches(uuid) to authenticated;
