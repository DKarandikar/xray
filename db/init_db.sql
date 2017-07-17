create table apps(
  id        text primary key not null,
  versions int[]
);

create table app_versions(
  id           serial         primary key not null,
  app            text references apps(id) not null,
  store          text                     not null,
  region         text                     not null,
  version        text                     not null,
  screen_flags    int
);

create table developers(
  id         serial primary key not null,
  email      text[]             not null,
  name         text             not null,
  store_site   text                     ,
  site         text
);

create table playstore_apps(
  id                      int primary key references app_versions(id) not null,
  title                  text                                         not null,
  summary                text                                                 ,
  description            text                                                 ,
  store_url              text                                         not null,
  price                  text                                         not null,
  free                   bool                                         not null,
  rating         numeric(2,1)                                                 ,
  num_reviews             int                                                 ,
  genre                  text                                                 ,
  family_genre           text                                                 ,
  min_installs            int                                                 ,
  max_installs            int                                                 ,
  developer               int               references developers(id) not null,
  updated                date                                         not null,
  android_ver            text                                         not null,
  content_rating         text                                         not null,
  screenshots          text[]                                                 ,
  video                  text                                                 ,
  recent_changes       text[]                                                 ,
  region                 text                                         not null,
  crawl_date             date                                         not null
);

create table app_perms(
  id       int references app_versions(id) primary key not null,
  perms text[]                                         not null
);

-- Contains the hostnames that were found in apps via analysis
create table app_hosts(
  id         int references app_versions(id) primary key not null,
  hosts    int[]                                                 ,
  pis   text[][]
);

create table companies(
  id             text     primary key not null,
  name           text                 not null,
  hosts         int[]                         ,
  founded        text                         ,
  acquired       text                         ,
  type         text[]                         ,
  typetag        text                         ,
  jurisdiction   text                         ,
  parent         text references companies(id),
  capital        text                         ,
  equity         text                         ,
  min_size        int                         ,
  max_size        int                         ,
  data_sources text[]                         ,
  description    text
);

create table hosts(
  id       serial    primary key not null,
  hostname   text                not null,
  company    text references companies(id)
);