# Capítulo 4 — La base de datos (PostgreSQL + Prisma)

Aquí es donde los pacientes se guardan **de verdad y para siempre**. Vamos a
entender qué es PostgreSQL, qué es Prisma, y cómo creamos las tablas y los datos.

---

## 4.1 · ¿Por qué una base de datos y no una variable?

Al principio de este proyecto, los pacientes se guardaban en memoria (en una
variable dentro del programa). El problema:

> Cada vez que apagabas el backend, **se borraban todos los pacientes**. 😱

Una base de datos guarda los datos en el disco, en un programa aparte
especializado. Apagas, enciendes, reinicias el ordenador... **los datos siguen
ahí**. Eso es lo que llamamos **persistencia**.

---

## 4.2 · ¿Qué es PostgreSQL?

**PostgreSQL** (o "Postgres") es una base de datos **relacional**. "Relacional"
significa que organiza los datos en **tablas**, como una hoja de cálculo:

Tabla `pacientes`:

| id | nombre | apellidos | email | telefono | genero |
|----|--------|-----------|-------|----------|--------|
| abc-1 | Ana | García López | ana@... | 600111222 | femenino |
| abc-2 | Luis | Martín Ruiz | luis@... | 600333444 | masculino |

- Cada **columna** es un dato (nombre, email...).
- Cada **fila** es un paciente.
- La columna **`id`** es un identificador único: dos pacientes nunca tienen el
  mismo `id`. Sirve para referirte a uno concreto.

Es gratis, muy robusta y usadísima en el mundo real (bancos, hospitales,
startups...). Por eso la eligieron en la startup.

---

## 4.3 · ¿Qué es SQL y qué es un ORM?

Para hablar con PostgreSQL existe un idioma llamado **SQL**. Por ejemplo, pedir
todos los pacientes en SQL puro sería:

```sql
SELECT * FROM pacientes ORDER BY "createdAt" DESC;
```

Funciona, pero escribir SQL a mano es tedioso y fácil de equivocarse. Aquí entra
**Prisma**, que es un **ORM** (*Object-Relational Mapping*).

> Un **ORM** es un traductor: tú escribes JavaScript normal, y él lo convierte a
> SQL por debajo.

Con Prisma, lo de arriba se escribe así:

```ts
prisma.paciente.findMany({ orderBy: { createdAt: 'desc' } });
```

Más legible, con autocompletado y con tipos que te avisan si te equivocas.
**Ventaja enorme para quien aprende:** piensas en objetos JavaScript, no en SQL.

---

## 4.4 · `schema.prisma` — el plano de la base de datos 📐

Este archivo (`backend/prisma/schema.prisma`) es **el más importante** de la
base de datos. Define **cómo son las tablas**. Prisma lo lee para: (a) crear las
tablas reales en PostgreSQL, y (b) generar el código con el que hablamos con ella.

```prisma
datasource db {
  provider = "postgresql"        // qué base de datos usamos
  url      = env("DATABASE_URL") // la dirección de conexión (viene del .env)
}

model Paciente {
  id              String   @id @default(uuid())
  nombre          String
  apellidos       String
  email           String   @unique
  telefono        String
  fechaNacimiento String
  genero          Genero
  grupoSanguineo  String?
  alergias        String[] @default([])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("pacientes")
}

enum Genero {
  masculino
  femenino
  otro
}
```

Traducido a español, campo por campo:

- **`model Paciente`** — define la tabla. Cada línea dentro es una columna.
- **`id String @id @default(uuid())`** — el identificador único. `@id` dice que
  es la clave principal. `@default(uuid())` genera automáticamente un código
  único aleatorio (un `uuid`, tipo `abc-123-def...`) para cada paciente nuevo.
- **`email String @unique`** — `@unique` obliga a que **no se repita**: no puede
  haber dos pacientes con el mismo email. (Por eso el backend puede devolver el
  error 409 de "email duplicado".)
- **`grupoSanguineo String?`** — el `?` significa **opcional** (puede estar vacío).
- **`alergias String[]`** — el `[]` significa **lista** (varias alergias).
- **`createdAt DateTime @default(now())`** — se rellena solo con la fecha de
  creación. **`updatedAt @updatedAt`** se actualiza solo cada vez que editas.
- **`@@map("pacientes")`** — en el código la llamamos `Paciente`, pero en la BD
  la tabla se llamará `pacientes` (en minúscula y plural, la convención habitual).
- **`enum Genero`** — una lista cerrada: `genero` solo puede ser uno de esos tres.

> 🧑‍⚕️ **Una decisión de diseño honesta:** verás que `fechaNacimiento` es
> `String` (texto) y no un tipo fecha. Se hizo así para que encajara sin líos con
> el calendario del formulario del frontend (que trabaja con texto `AAAA-MM-DD`).
> En un sistema de producción "de verdad" usarías el tipo fecha nativo (`@db.Date`).
> Lo dejamos anotado como mejora futura.

---

## 4.5 · Las migraciones — el historial de la base de datos 📜

Vale, ya tenemos el "plano" (`schema.prisma`). Pero, ¿cómo se crean las tablas
reales en PostgreSQL? Con una **migración**.

> Una **migración** es un conjunto de instrucciones SQL que **transforma** la
> base de datos de un estado al siguiente. Es como un "commit" pero para la
> estructura de la BD.

Cuando ejecutas:

```bash
npm run db:migrate
```

Prisma:
1. Mira tu `schema.prisma`.
2. Genera el SQL necesario para crear la tabla `pacientes` y el enum `Genero`.
3. Lo ejecuta contra PostgreSQL (crea las tablas de verdad).
4. Guarda ese SQL en `backend/prisma/migrations/` como historial.

El archivo generado en este proyecto contiene, entre otras cosas:

```sql
CREATE TYPE "Genero" AS ENUM ('masculino', 'femenino', 'otro');

CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    ...
    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pacientes_email_key" ON "pacientes"("email");
```

**¿Por qué guardar las migraciones en el proyecto (y en git)?** Porque así
cualquier persona que clone el repo puede recrear *exactamente* la misma
estructura de base de datos con un comando. Es lo que hace el proyecto
**reproducible**. (Por eso las subimos a GitHub.)

---

## 4.6 · El "seed" — datos de ejemplo 🌱

Una base de datos recién creada está **vacía**. Para no empezar mirando una
lista en blanco, tenemos un **seed** ("semilla"): un script que mete un par de
pacientes de ejemplo. Está en `backend/prisma/seed.ts`:

```ts
const pacientes = [
  { nombre: 'Ana',  apellidos: 'García López', email: 'ana.garcia@...', ... },
  { nombre: 'Luis', apellidos: 'Martín Ruiz',  email: 'luis.martin@...', ... },
];

for (const p of pacientes) {
  await prisma.paciente.upsert({
    where: { email: p.email }, // busca por email
    update: {},                // si ya existe, no cambia nada
    create: p,                 // si no existe, lo crea
  });
}
```

Se ejecuta con `npm run db:seed`. Usamos **`upsert`** (mezcla de *update* +
*insert*): si lo ejecutas dos veces, **no duplica** los pacientes. Detalle
pequeño pero pro.

---

## 4.7 · ¿Dónde vive PostgreSQL? Docker 🐳

Necesitas un PostgreSQL corriendo en algún sitio. En vez de instalarlo a mano en
tu ordenador, usamos **Docker**.

> **Docker** te permite arrancar programas dentro de "cajas" aisladas llamadas
> **contenedores**. En vez de instalar PostgreSQL en tu Windows, arrancas un
> contenedor que ya lo trae listo. Cuando acabas, lo apagas y no ha ensuciado tu
> sistema.

La "receta" del contenedor está en `docker-compose.yml` (en la raíz):

```yaml
services:
  db:
    image: postgres:16-alpine      # qué programa meter en la caja
    environment:
      POSTGRES_USER: health        # usuario
      POSTGRES_PASSWORD: health    # contraseña
      POSTGRES_DB: health_crud     # nombre de la base de datos
    ports:
      - '5432:5432'                # puerta por la que se accede
    volumes:
      - pgdata:/var/lib/postgresql/data  # dónde se guardan los datos
```

- **`image: postgres:16-alpine`** — la versión de PostgreSQL a usar.
- **`environment`** — el usuario, contraseña y nombre de la BD que se crean.
- **`ports: 5432:5432`** — expone la base de datos en el puerto 5432 de tu
  ordenador, para que el backend pueda conectarse.
- **`volumes`** — ¡importante! Guarda los datos **fuera** del contenedor, para
  que no se pierdan aunque borres el contenedor.

Se arranca con un solo comando (desde la raíz del proyecto):

```bash
docker compose up -d
```

---

## 4.8 · El `.env` — la dirección de conexión (y por qué es secreta) 🔑

¿Cómo sabe el backend dónde está la base de datos? Por una variable llamada
`DATABASE_URL`, que vive en un archivo `.env` dentro de `backend/`:

```
DATABASE_URL="postgresql://health:health@localhost:5432/health_crud?schema=public"
```

Esa línea se lee así:
```
postgresql:// usuario : contraseña @ dirección : puerto / nombre_bd
              health    health       localhost   5432    health_crud
```

> 🔒 **Muy importante:** el archivo `.env` contiene **contraseñas**, así que
> **NUNCA se sube a git**. Por eso está en el `.gitignore`. Lo que SÍ se sube es
> `.env.example`, una plantilla **sin** contraseñas reales, para que otros sepan
> qué variables necesitan. Esto es una práctica de seguridad estándar.

---

## ✅ Resumen del capítulo

- Una **base de datos** guarda los datos de forma **permanente** (persistencia).
- **PostgreSQL** organiza los datos en **tablas** (filas y columnas).
- **Prisma** es un **ORM**: traduce tu JavaScript a **SQL** para no escribir SQL a mano.
- **`schema.prisma`** define cómo son las tablas; **las migraciones** las crean
  de verdad y quedan versionadas en git.
- El **seed** mete datos de ejemplo sin duplicar (`upsert`).
- **Docker** arranca PostgreSQL en un contenedor aislado con un comando.
- El **`.env`** guarda la conexión (con contraseña) y **jamás** se sube a git.

➡️ Sigue con el [Capítulo 5 — El frontend paso a paso](05-frontend.md).
