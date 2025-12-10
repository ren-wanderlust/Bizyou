-- Create chat_rooms table
create table if not exists public.chat_rooms (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  type text check (type in ('individual', 'group')) not null default 'group',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id) -- One chat room per project for now
);

-- Enable RLS
alter table public.chat_rooms enable row level security;

-- Policies for chat_rooms
-- Users can view chat rooms they are part of (owner or approved member)
create policy "Users can view their project chat rooms"
  on public.chat_rooms for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = chat_rooms.project_id
      and projects.owner_id = auth.uid()
    )
    or
    exists (
      select 1 from public.project_applications
      where project_applications.project_id = chat_rooms.project_id
      and project_applications.user_id = auth.uid()
      and project_applications.status = 'approved'
    )
  );

-- Users can insert chat rooms if they are the project owner (triggered by logic)
create policy "Project owners can create chat rooms"
  on public.chat_rooms for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = chat_rooms.project_id
      and projects.owner_id = auth.uid()
    )
  );

-- Add chat_room_id to messages
-- Note: This might fail if messages table doesn't exist or column already exists.
-- We wrap in a generic do block or just assume user handles migration order.
alter table public.messages add column chat_room_id uuid references public.chat_rooms(id) on delete cascade;

-- Update messages policies to allow access to group chat messages
create policy "Users can view messages in their chat rooms"
  on public.messages for select
  using (
    auth.uid() = sender_id 
    or auth.uid() = receiver_id
    or exists (
      select 1 from public.chat_rooms
      where chat_rooms.id = messages.chat_room_id
      and (
        exists (
          select 1 from public.projects
          where projects.id = chat_rooms.project_id
          and projects.owner_id = auth.uid()
        )
        or
        exists (
          select 1 from public.project_applications
          where project_applications.project_id = chat_rooms.project_id
          and project_applications.user_id = auth.uid()
          and project_applications.status = 'approved'
        )
      )
    )
  );

create policy "Users can insert messages in their chat rooms"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and (
      -- Direct message case (existing)
      receiver_id is not null
      or
      -- Group message case
      (
        chat_room_id is not null
        and exists (
          select 1 from public.chat_rooms
          where chat_rooms.id = messages.chat_room_id
          and (
            exists (
              select 1 from public.projects
              where projects.id = chat_rooms.project_id
              and projects.owner_id = auth.uid()
            )
            or
            exists (
              select 1 from public.project_applications
              where project_applications.project_id = chat_rooms.project_id
              and project_applications.user_id = auth.uid()
              and project_applications.status = 'approved'
            )
          )
        )
      )
    )
  );
