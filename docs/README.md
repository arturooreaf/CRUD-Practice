# 📚 Guía de aprendizaje — Cómo está hecho este CRUD

> Esta guía está pensada para alguien que **nunca ha hecho un CRUD** y está
> empezando con Node.js, Express, Next.js, TypeScript y PostgreSQL.
> No damos nada por sabido: cada concepto se explica antes de usarlo, con
> analogías y usando *este mismo proyecto* como ejemplo real.

## ¿Cómo leer esta documentación?

Los capítulos están ordenados. Si eres principiante, **léelos en orden**, poco
a poco. Cada uno se apoya en el anterior.

| # | Capítulo | Qué aprenderás |
|---|----------|----------------|
| 1 | [Conceptos básicos](01-conceptos-basicos.md) | Qué es un frontend, un backend, una API, una base de datos y un CRUD. La foto general. |
| 2 | [La arquitectura del proyecto](02-arquitectura.md) | Cómo encajan todas las piezas y qué pasa, paso a paso, cuando haces clic en un botón. |
| 3 | [El backend paso a paso](03-backend.md) | Cómo se construye la API con Express + TypeScript, archivo por archivo. |
| 4 | [La base de datos](04-base-de-datos.md) | Qué es PostgreSQL, qué es Prisma, y cómo se guardan los datos de verdad. |
| 5 | [El frontend paso a paso](05-frontend.md) | Cómo se construye la interfaz con Next.js y React, archivo por archivo. |
| 6 | [Cómo ejecutarlo todo](06-ejecucion.md) | Puesta en marcha paso a paso y los problemas reales que nos encontramos. |
| 7 | [Glosario](07-glosario.md) | Diccionario de todas las palabras raras que aparecen. |

## ¿Qué es este proyecto?

Una pequeña aplicación para **gestionar pacientes** de una clínica: puedes ver
la lista, añadir uno nuevo, editarlo y borrarlo. Eso es un **CRUD** (lo vemos en
el capítulo 1).

## ¿Qué tecnologías usa y para qué?

- **Node.js** → permite ejecutar JavaScript fuera del navegador (en el servidor).
- **Express** → librería para construir la API (el "cerebro" que responde a las peticiones).
- **TypeScript** → JavaScript con "tipos", que evita muchos errores antes de ejecutar.
- **Next.js + React** → para construir la interfaz visual que ve el usuario.
- **PostgreSQL** → la base de datos donde se guardan los pacientes de forma permanente.
- **Prisma** → el "traductor" entre nuestro código y la base de datos.
- **Zod** → valida que los datos que llegan son correctos.

> 💡 Si alguna de estas palabras te suena a chino, tranquilo: el
> [capítulo 1](01-conceptos-basicos.md) las explica todas desde cero.
