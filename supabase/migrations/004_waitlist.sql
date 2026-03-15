-- Waitlist: email signups for Monaris coming soon
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_waitlist_email on waitlist (lower(email));

alter table waitlist enable row level security;

-- Anyone can insert (sign up)
create policy "Anyone can join waitlist"
  on waitlist for insert
  with check (true);

-- Anyone can read count (for display)
create policy "Anyone can read waitlist count"
  on waitlist for select
  using (true);
