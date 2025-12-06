-- Add is_read column to messages table to track unread status
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

-- Allow users to update is_read status (Mark as read)
-- Adjust policy as needed, typically users can update messages sent to them?
-- Or sender can update?
-- Usually: "Users can update 'is_read' for messages where receiver_id = auth.uid()"
-- Check existing policies first, but here is a safe policy creation if needed:

-- create policy "Users can mark received messages as read"
-- on messages for update
-- using (auth.uid() = receiver_id)
-- with check (auth.uid() = receiver_id);
