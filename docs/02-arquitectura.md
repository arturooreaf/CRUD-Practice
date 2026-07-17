# Capítulo 2 — La arquitectura del proyecto

En el capítulo 1 vimos las piezas por separado. Ahora vamos a ver **cómo encajan
todas juntas** y qué ocurre, paso a paso, cuando usas la app.

---

## 2.1 · Las tres piezas y dónde viven

El proyecto tiene **tres partes** que funcionan a la vez:

```
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   FRONTEND      │        │    BACKEND      │        │   BASE DE DATOS │
│   (Next.js)     │ ─────► │   (Express)     │ ─────► │  (PostgreSQL)   │
│                 │ ◄───── │                 │ ◄───── │                 │
│  localhost:3005 │        │  localhost:3001 │        │  localhost:5432 │
│  Lo que ves     │        │  El cerebro     │        │  Los datos      │
└─────────────────┘        └─────────────────┘        └─────────────────┘
     navegador                  Node.js                   Docker
```

Cada una corre en un **puerto** distinto. Un puerto es como el número de una
puerta en un edificio: la misma máquina (`localhost` = tu ordenador) puede tener
varios programas escuchando, cada uno en su puerta:
- Puerta **3005** → el frontend
- Puerta **3001** → el backend
- Puerta **5432** → PostgreSQL

---

## 2.2 · La estructura de carpetas

Así está organizado el proyecto (lo importante):

```
CRUD-Practice/
│
├── docker-compose.yml     ← receta para arrancar PostgreSQL en Docker
├── README.md              ← instrucciones rápidas
├── docs/                  ← esta documentación 📚
│
├── backend/               ← 🧠 EL BACKEND (la cocina)
│   ├── package.json           lista de librerías y comandos
│   ├── tsconfig.json          configuración de TypeScript
│   ├── prisma/
│   │   ├── schema.prisma      define cómo son las tablas de la BD
│   │   ├── seed.ts            mete datos de ejemplo
│   │   └── migrations/        historial de cambios en la BD
│   └── src/
│       ├── index.ts           arranca el servidor
│       ├── routes/            define las URLs (endpoints)
│       ├── controllers/       la lógica de cada endpoint
│       ├── data/              acceso a la base de datos
│       ├── middleware/        validación y manejo de errores
│       └── types/             los "tipos" y reglas de los datos
│
└── frontend/              ← 🎨 EL FRONTEND (la sala)
    ├── package.json
    ├── app/                   las páginas que ve el usuario
    │   ├── page.tsx           la lista de pacientes (página principal)
    │   └── pacientes/
    │       ├── nuevo/         página para crear
    │       └── [id]/editar/   página para editar
    ├── components/            piezas reutilizables (el formulario)
    └── lib/
        └── api.ts             el código que llama al backend
```

> 💡 No te agobies si no entiendes cada carpeta todavía. En los capítulos 3, 4 y
> 5 abrimos cada archivo y lo explicamos línea a línea.

---

## 2.3 · El viaje de una petición (¡el concepto más importante!)

Vamos a seguir, paso a paso, qué pasa cuando **creas un paciente nuevo**. Esto
es el 90% de entender cómo funciona una app web. Léelo despacio.

Imagina que rellenas el formulario y pulsas **"Guardar"**:

```
1. TÚ pulsas "Guardar" en el navegador (frontend, puerto 3005)
        │
        ▼
2. El frontend empaqueta los datos del formulario (nombre, email...)
   en formato JSON y los ENVÍA al backend:
        POST http://localhost:3001/api/pacientes
        │
        ▼
3. El BACKEND (puerto 3001) recibe la petición. Primero pasa por el
   "portero" (Zod): ¿el email es válido? ¿el nombre está relleno?
        │
        ├─ ❌ Si algo está mal → responde "400 Datos no válidos" y aquí acaba.
        │
        ▼ ✅ Si todo está bien
4. El backend le pide a PRISMA que guarde el paciente.
   Prisma traduce la orden a SQL y se la manda a PostgreSQL (puerto 5432).
        │
        ▼
5. POSTGRESQL guarda la fila nueva en la tabla "pacientes" y confirma.
        │
        ▼
6. El backend responde al frontend: "201 Creado ✅", con los datos
   del paciente ya guardado (incluido su id nuevo).
        │
        ▼
7. El FRONTEND recibe el "OK" y te lleva de vuelta a la lista, donde
   ya aparece el paciente nuevo.
```

**Esa ida y vuelta es TODO.** Cambiando el verbo (GET, PUT, DELETE) y la lógica
del paso 4, tienes las otras 3 operaciones del CRUD. Si entiendes este viaje,
entiendes la app entera. 🎉

---

## 2.4 · ¿Qué es JSON? (el formato de los mensajes)

En el paso 2 dijimos que los datos viajan "en formato JSON". **JSON** es
simplemente una forma de escribir datos como texto, fácil de leer tanto para
humanos como para máquinas. Un paciente en JSON se ve así:

```json
{
  "nombre": "María",
  "apellidos": "Pérez Gil",
  "email": "maria.perez@example.com",
  "telefono": "600555666",
  "genero": "femenino",
  "alergias": ["Polen"]
}
```

Son **parejas de `"clave": valor`**. Es el idioma estándar en el que frontend y
backend se pasan la información. Lo verás por todas partes.

---

## 2.5 · ¿Por qué separar backend y frontend? (arquitectura por capas)

Podríamos haberlo mezclado todo, pero separarlo tiene ventajas enormes, y es lo
que hacen los equipos profesionales:

- **Cada parte hace una sola cosa** y la hace bien (la sala atiende, la cocina cocina).
- Puedes **cambiar la interfaz** sin tocar la lógica, y al revés.
- Varias personas pueden trabajar **en paralelo** (uno en el frontend, otro en el backend).
- Mañana podrías tener una **app de móvil** que use el *mismo* backend.

Y dentro del backend también separamos por "capas" (rutas → controladores →
acceso a datos). Esto se llama **separación de responsabilidades** y lo verás en
el [capítulo 3](03-backend.md). La idea: **cada archivo tiene un único trabajo**,
así el código es fácil de leer, arreglar y ampliar.

---

## ✅ Resumen del capítulo

- El proyecto son **3 programas** corriendo a la vez: frontend (3005), backend
  (3001) y base de datos (5432).
- Cada tecnología vive en su **carpeta** (`frontend/`, `backend/`).
- Una acción del usuario dispara un **viaje de petición**: frontend → backend →
  base de datos → y vuelta.
- Los datos viajan en formato **JSON**.
- Separar en piezas y capas hace el código **mantenible y profesional**.

➡️ Sigue con el [Capítulo 3 — El backend paso a paso](03-backend.md).
