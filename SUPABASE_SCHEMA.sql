create table ofertas (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  fecha text,
  plataforma text,
  cluster text,
  puesto text,
  empresa text,
  ubicacion text,
  sector text,
  nivel_jerarquico text,
  salario_min numeric,
  salario_max numeric,
  salario_informado text,
  ingles_requerido text,
  nivel_ingles text,
  ingles_en_titulo text,
  otros_idiomas text,
  requisitos_educativos text,
  notas text,
  synced_to_sheets boolean default false
);

alter table ofertas enable row level security;
create policy "Allow all" on ofertas for all using (true);
