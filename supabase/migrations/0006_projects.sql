-- Projects: named folders for organising conversations

create table if not exists projects (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users(id) on delete cascade not null,
  name       text        not null check (char_length(name) between 1 and 100),
  emoji      text        not null default '📁',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table projects enable row level security;

create policy "Users can select their own projects" on projects
  for select using (auth.uid() = user_id);

create policy "Users can insert their own projects" on projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects" on projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own projects" on projects
  for delete using (auth.uid() = user_id);

create trigger set_projects_updated_at
  before update on projects
  for each row execute procedure set_updated_at();

-- Link conversations to a project (nullable; cascade to null on project delete)
alter table conversations
  add column if not exists project_id uuid references projects(id) on delete set null;
