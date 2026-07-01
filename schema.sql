-- 1. PROFILES TABLE (User metadata linked to Supabase Auth)
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    display_name text,
    avatar_url text,
    luxury_tier text DEFAULT 'Standard' CHECK (luxury_tier IN ('Standard', 'Gold', 'Platinum', 'Royal')),
    signature text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. CONVERSATIONS TABLE (Email Threads)
CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subject text DEFAULT 'No Subject',
    is_archived boolean DEFAULT false,
    last_message_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. PARTICIPANTS TABLE (Many-to-Many: Users in a conversation)
CREATE TABLE public.participants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    joined_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(conversation_id, user_id)
);

-- 4. MESSAGES TABLE (Individual emails/chats inside a thread)
CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    body text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb, -- Array of {name, url, size}
    is_draft boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;

GRANT SELECT ON public.profiles TO anon;

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles: Users can update their own profile; anyone authenticated can read profiles
CREATE POLICY "Allow public read access to profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow system/user insertion on signup" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Conversations: Users can view conversations they are participating in
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.participants 
            WHERE participants.conversation_id = conversations.id 
            AND participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert conversations" ON public.conversations
    FOR INSERT WITH CHECK (true);

-- Participants: Users can see participants of their conversations
CREATE POLICY "Users can view participants" ON public.participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.participants AS p
            WHERE p.conversation_id = participants.conversation_id 
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add participants" ON public.participants
    FOR INSERT WITH CHECK (true);

-- Messages: Users can view/write messages in conversations they belong to
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.participants 
            WHERE participants.conversation_id = messages.conversation_id 
            AND participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.participants 
            WHERE participants.conversation_id = messages.conversation_id 
            AND participants.user_id = auth.uid()
        )
    );