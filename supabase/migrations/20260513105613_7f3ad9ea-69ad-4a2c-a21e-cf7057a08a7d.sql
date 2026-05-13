
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  title_he text NOT NULL,
  title_en text,
  description_he text,
  description_en text,
  type text NOT NULL DEFAULT 'lecture' CHECK (type IN ('lecture','workshop','meetup','evening')),
  date date NOT NULL,
  time time NOT NULL,
  location_he text,
  location_en text,
  price integer NOT NULL DEFAULT 0,
  max_spots integer NOT NULL DEFAULT 0,
  spots_remaining integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','completed')),
  image_url text
);

CREATE INDEX idx_events_date_status ON public.events(date, status);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_events" ON public.events FOR SELECT USING (true);

CREATE TRIGGER trg_events_touch BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  notes text,
  confirmation_sent boolean NOT NULL DEFAULT false,
  UNIQUE (event_id, email)
);

CREATE INDEX idx_event_regs_event ON public.event_registrations(event_id);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_register_event" ON public.event_registrations FOR INSERT WITH CHECK (true);

-- Trigger: decrement spots_remaining on registration (and prevent overbooking)
CREATE OR REPLACE FUNCTION public.handle_event_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining integer;
  v_status text;
BEGIN
  SELECT spots_remaining, status INTO v_remaining, v_status
  FROM public.events WHERE id = NEW.event_id FOR UPDATE;
  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'EVENT_NOT_ACTIVE';
  END IF;
  IF v_remaining <= 0 THEN
    RAISE EXCEPTION 'EVENT_FULL';
  END IF;
  UPDATE public.events SET spots_remaining = spots_remaining - 1 WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_event_registration BEFORE INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_event_registration();
