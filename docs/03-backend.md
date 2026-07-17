# Capítulo 3 — El backend paso a paso

El backend es **el cerebro**: recibe peticiones, comprueba que los datos son
correctos, habla con la base de datos y responde. Vamos a construir el
entendimiento **archivo por archivo**, en el orden en que tiene sentido leerlos.

Todo el backend está en la carpeta `backend/`.

---

## 3.0 · Primero, dos ideas de TypeScript que necesitas

Vas a ver TypeScript en todos los archivos, así que dos conceptos rápidos:

### Los "tipos"
Un tipo es decir de qué clase es un dato. En JavaScript normal escribirías:
```js
let edad = 30;
```
En TypeScript puedes decir *explícitamente* que es un número:
```ts
let edad: number = 30;
edad = "hola"; // ❌ TypeScript te avisa: "hola" no es un número
```
Esto atrapa errores **antes** de ejecutar el programa. Es como un corrector
ortográfico para tu código.

### `import` / `export`
El código se parte en muchos archivos. Para usar algo de otro archivo:
- En el archivo A lo **exportas**: `export function saludar() {...}`
- En el archivo B lo **importas**: `import { saludar } from './A'`

Ya está. Con eso puedes leer todo el backend.

---

## 3.1 · `package.json` — la ficha del proyecto

Todo proyecto de Node tiene un `package.json`. Es la **ficha de identidad**:
dice cómo se llama, qué librerías necesita y qué comandos puedes ejecutar.

```json
{
  "name": "health-crud-backend",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",     // arranca en modo desarrollo
    "build": "prisma generate && tsc",   // compila para producción
    "db:migrate": "prisma migrate dev",  // crea/actualiza tablas
    "db:seed": "tsx prisma/seed.ts"      // mete datos de ejemplo
  },
  "dependencies": {
    "@prisma/client": "...",  // para hablar con la BD
    "cors": "...",            // para permitir que el frontend nos llame
    "express": "...",         // el framework del backend
    "zod": "..."              // el validador de datos
  }
}
```

- **`scripts`** son atajos. En vez de escribir el comando largo, escribes
  `npm run dev` y se ejecuta lo de la derecha.
- **`dependencies`** son las librerías (código de otros) que usamos. Se instalan
  con `npm install` y se guardan en una carpeta `node_modules/`.
- **`"type": "module"`** dice que usamos la forma moderna de `import/export`.

---

## 3.2 · `src/index.ts` — el punto de arranque 🚀

Este es el archivo que **enciende** el servidor. Cuando ejecutas `npm run dev`,
esto es lo primero que corre. Míralo entero, luego lo desmenuzamos:

```ts
import express from 'express';
import cors from 'cors';
import pacientesRouter from './routes/pacientes.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// --- Middlewares globales ---
app.use(cors());            // Permite peticiones desde el frontend
app.use(express.json());    // Entiende el JSON que llega en las peticiones

// --- Healthcheck ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', servicio: 'health-crud-backend' });
});

// --- Rutas de la API ---
app.use('/api/pacientes', pacientesRouter);

// --- Manejo de errores (siempre al final) ---
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API escuchando en http://localhost:${PORT}`);
});
```

Vamos parte por parte:

- **`const app = express()`** — crea la aplicación. `app` es nuestro servidor.
- **`app.use(cors())`** — CORS es una norma de seguridad de los navegadores:
  por defecto, una web NO puede llamar a un servidor de otra dirección. Como
  nuestro frontend (puerto 3005) y backend (puerto 3001) son "direcciones"
  distintas, hay que dar permiso explícito. Eso hace `cors()`.
- **`app.use(express.json())`** — le enseña al servidor a leer el JSON que llega
  en el cuerpo de las peticiones (recuerda el capítulo 2). Sin esto, no
  entendería los datos del formulario.
- **`app.get('/health', ...)`** — un endpoint sencillo que responde "estoy vivo".
  Sirve para comprobar rápido si el servidor funciona.
- **`app.use('/api/pacientes', pacientesRouter)`** — aquí conectamos TODAS las
  rutas de pacientes (que están en otro archivo) bajo la dirección
  `/api/pacientes`. Lo vemos en 3.3.
- **`app.listen(PORT, ...)`** — pone el servidor "a escuchar" en el puerto 3001.
  A partir de aquí, queda esperando peticiones.

> 🧩 **¿Qué es un "middleware"?** Es una función que se ejecuta *en medio*, entre
> que llega la petición y que se responde. Como una cinta transportadora con
> filtros: la petición pasa por `cors`, luego por `express.json`, luego llega a
> tu endpoint. Cada `app.use(...)` añade un filtro a la cinta.

---

## 3.3 · `src/routes/pacientes.routes.ts` — el mapa de URLs 🗺️

Este archivo dice **qué URL corresponde a qué acción**. Es el mapa de la API:

```ts
import { Router } from 'express';
import * as controller from '../controllers/pacientes.controller.js';

const router = Router();

router.get('/', controller.listar);          // GET    /api/pacientes
router.get('/:id', controller.obtener);      // GET    /api/pacientes/123
router.post('/', controller.crear);          // POST   /api/pacientes
router.put('/:id', controller.actualizar);   // PUT    /api/pacientes/123
router.delete('/:id', controller.eliminar);  // DELETE /api/pacientes/123

export default router;
```

Léelo así: *"cuando llegue un **GET** a `/`, encárgate con la función
`controller.listar`"*. Y así con cada uno.

- **`:id`** es un **comodín**. En `GET /api/pacientes/:id`, ese `:id` puede ser
  cualquier valor. Si pides `/api/pacientes/abc-123`, entonces `id` vale
  `"abc-123"`. Así identificamos *qué* paciente concreto quieres.
- Fíjate en la correspondencia perfecta con el CRUD del capítulo 1:
  listar/obtener (Leer), crear (Crear), actualizar (Actualizar), eliminar (Borrar).

> El router **no hace el trabajo**, solo **reparte**. El trabajo de verdad está
> en el controlador. Esto es la "separación de responsabilidades" del capítulo 2:
> el mapa por un lado, la lógica por otro.

---

## 3.4 · `src/types/paciente.ts` — cómo es un paciente y sus reglas ✅

Antes de crear pacientes, definimos **cómo debe ser un paciente** y **qué reglas**
deben cumplir sus datos. Para eso usamos **Zod** (el portero de discoteca).

```ts
import { z } from 'zod';

export const crearPacienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios').max(150),
  email: z.string().email('Email no válido'),
  telefono: z.string().min(6, 'Teléfono no válido').max(20),
  fechaNacimiento: z.string().refine(/* que sea una fecha válida */),
  genero: z.enum(['masculino', 'femenino', 'otro']),
  grupoSanguineo: z.enum(['A+','A-','B+','B-','AB+','AB-','O+','O-']).optional(),
  alergias: z.array(z.string()).default([]),
});
```

Léelo en español:
- `nombre` debe ser **texto** (`string`), con **mínimo 1** carácter (no vacío) y
  máximo 100. Si no, muestra "El nombre es obligatorio".
- `email` debe ser texto **con formato de email** (tener `@`, etc.).
- `genero` solo puede ser uno de esos **tres valores** exactos (`enum` = lista
  cerrada de opciones).
- `grupoSanguineo` es **opcional** (`.optional()`): puede no venir.
- `alergias` es una **lista de textos**, y si no viene, por defecto es una lista
  vacía (`.default([])`).

**Lo bonito de Zod:** definimos las reglas *una sola vez* y las usamos para dos
cosas a la vez:

```ts
// 1) Para validar en tiempo de ejecución (el portero)
crearPacienteSchema.parse(datosQueLlegan); // lanza error si algo está mal

// 2) Para generar el TIPO de TypeScript automáticamente (el corrector)
export type CrearPacienteDTO = z.infer<typeof crearPacienteSchema>;
```

> 🔤 **DTO** significa *Data Transfer Object* ("objeto de transferencia de
> datos"). Es un nombre elegante para "la forma de los datos que se envían". No
> te asustes por la sigla.

También hay un `actualizarPacienteSchema` que es igual pero con **todos los
campos opcionales** (`.partial()`), porque al editar quizás solo quieras cambiar
el teléfono y nada más.

---

## 3.5 · `src/data/prisma.ts` y `store.ts` — hablar con la base de datos 🗄️

Esta es la capa que **habla con PostgreSQL**. Son dos archivos.

### `prisma.ts` — la conexión
```ts
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
```
Crea **un único** "cliente" de Prisma para toda la app. Ese `prisma` es el objeto
que sabe hablar con la base de datos. (Por qué "uno solo": abrir muchas
conexiones a la vez sería un desperdicio.)

### `store.ts` — las operaciones sobre datos
Aquí están las funciones que **leen y escriben** pacientes. Por ejemplo:

```ts
import { prisma } from './prisma.js';

// Devuelve TODOS los pacientes, del más nuevo al más viejo
export function listar() {
  return prisma.paciente.findMany({ orderBy: { createdAt: 'desc' } });
}

// Busca UN paciente por su id
export function obtener(id: string) {
  return prisma.paciente.findUnique({ where: { id } });
}

// Crea un paciente nuevo
export function crear(data) {
  return prisma.paciente.create({ data });
}
```

¿Ves lo legible que es? `prisma.paciente.findMany()` = "de la tabla pacientes,
encuentra muchos (todos)". `findUnique({ where: { id } })` = "encuentra el único
que tenga este id". **No hemos escrito SQL:** Prisma lo genera por nosotros. Esa
es la magia del ORM (capítulo 4).

> ⏳ **Nota "async" (asíncrono):** hablar con una base de datos **tarda** (hay
> que ir a buscar los datos y volver). Por eso estas funciones son *asíncronas*:
> devuelven una "promesa" de resultado. Quien las llama usa `await` para esperar
> a que terminen. Lo verás en el siguiente archivo.

---

## 3.6 · `src/controllers/pacientes.controller.ts` — la lógica 🧠

El **controlador** es donde se juntan todas las piezas. Para cada endpoint hay
una función que: valida los datos, llama al `store` para tocar la BD, y decide
qué responder. Ejemplo, **crear un paciente**:

```ts
export async function crear(req, res, next) {
  try {
    // 1. Validar los datos que llegan (el portero Zod)
    const data = crearPacienteSchema.parse(req.body);

    // 2. Regla de negocio: ¿ya existe alguien con ese email?
    if (await store.existeEmail(data.email)) {
      throw new HttpError(409, 'Ya existe un paciente con ese email');
    }

    // 3. Guardar en la base de datos
    const nuevo = await store.crear(data);

    // 4. Responder "201 Creado" con el paciente ya guardado
    res.status(201).json(nuevo);
  } catch (err) {
    next(err); // si algo falla, se lo pasamos al manejador de errores
  }
}
```

Tres conceptos nuevos, fáciles:

- **`req`** (request) = la petición que llega. `req.body` son los datos JSON del
  formulario. `req.params.id` sería el comodín `:id` de la URL.
- **`res`** (response) = la respuesta que enviamos. `res.status(201).json(...)`
  significa "responde con código 201 y estos datos en JSON".
- **`next`** = "pásale el problema al siguiente". Si hay un error, `next(err)`
  lo manda al manejador de errores (3.7), en vez de que la app se caiga.

**Los códigos de estado HTTP** son números estándar que dicen cómo fue la cosa:

| Código | Significa |
|--------|-----------|
| **200** | OK (todo bien) |
| **201** | Creado (algo nuevo se guardó) |
| **204** | OK, pero sin contenido que devolver (típico al borrar) |
| **400** | Petición incorrecta (datos mal → falló Zod) |
| **404** | No encontrado (ese paciente no existe) |
| **409** | Conflicto (p. ej. email duplicado) |
| **500** | Error interno del servidor (algo se rompió por nuestra culpa) |

El resto de funciones (`listar`, `obtener`, `actualizar`, `eliminar`) siguen el
mismo patrón: validar → tocar la BD → responder con el código adecuado.

---

## 3.7 · `src/middleware/errorHandler.ts` — cuando algo sale mal 🚑

En vez de repetir `try/catch` con mensajes en cada sitio, tenemos **un único
lugar** que traduce los errores a respuestas HTTP limpias:

```ts
export function errorHandler(err, req, res, next) {
  // ¿Fue un error de validación de Zod? → 400 con el detalle
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Datos no válidos', detalles: ... });
  }
  // ¿Fue un error "nuestro" con código concreto? → ese código
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  // ¿Errores conocidos de Prisma? (email duplicado, no encontrado...)
  if (/* err.code === 'P2002' */) { return res.status(409)... }
  // Cualquier otra cosa inesperada → 500
  return res.status(500).json({ error: 'Error interno del servidor' });
}
```

Así, si Zod rechaza un email, el usuario recibe un mensaje claro
(`"Email no válido"`) en vez de una pantalla de error fea. **Centralizar los
errores** es una práctica profesional: un solo sitio que arreglar y mantener.

`HttpError` es una pequeña clase propia que nos deja lanzar errores con un código
concreto, por ejemplo `throw new HttpError(404, 'Paciente no encontrado')`.

---

## 3.8 · Recapitulando: el recorrido completo dentro del backend

Cuando llega `POST /api/pacientes`, esto es lo que pasa **dentro** del backend:

```
index.ts            → recibe la petición, la pasa por cors + express.json
   │
routes/…            → ve que es POST /api/pacientes → llama a controller.crear
   │
controllers/…       → valida con Zod (types/…), comprueba el email
   │
data/store.ts       → prisma.paciente.create(...)  → guarda en PostgreSQL
   │
controllers/…       → responde 201 con el paciente
   │
(si algo falla en cualquier punto) → middleware/errorHandler → respuesta de error
```

Cada archivo tiene **un solo trabajo**. Eso es lo que hace este backend limpio y
fácil de ampliar.

---

## ✅ Resumen del capítulo

- **`index.ts`** enciende el servidor y monta los middlewares (cors, json).
- **`routes/`** mapea cada URL+método a una función.
- **`types/`** define cómo es un paciente y sus reglas de validación con **Zod**.
- **`data/`** (prisma + store) es la capa que habla con PostgreSQL.
- **`controllers/`** es la lógica: valida → toca la BD → responde con un código HTTP.
- **`middleware/errorHandler`** traduce cualquier fallo a una respuesta limpia.

➡️ Sigue con el [Capítulo 4 — La base de datos](04-base-de-datos.md).
