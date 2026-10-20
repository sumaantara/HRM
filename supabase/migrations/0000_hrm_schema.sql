-- applied 0000_hrm_schema
create schema if not exists hrm;
create table if not exists hrm.settings (key text primary key, value text not null);
