alter table public.review_requests
  add column if not exists document_category text;
