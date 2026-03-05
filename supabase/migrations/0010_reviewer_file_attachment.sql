-- Add optional file attachment for reviewer feedback
alter table public.review_requests
  add column reviewer_file_id uuid references public.files(id);
