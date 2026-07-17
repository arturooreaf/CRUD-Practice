# Capítulo 1 — Conceptos básicos

Antes de mirar una sola línea de código, necesitamos entender **de qué estamos
hablando**. Este capítulo es solo teoría, explicada fácil. Tómatelo con calma.

---

## 1.1 · La analogía del restaurante 🍽️

Casi cualquier aplicación web funciona como un restaurante. Quédate con esta
imagen porque la usaremos todo el rato:

- **Tú (el cliente)** entras y te sientas. → Eres el **usuario** con su navegador.
- **La sala y el camarero** son lo que ves y con lo que hablas. → Es el **frontend**.
- **La cocina** prepara los platos, pero tú no la ves. → Es el **backend**.
- **La despensa/nevera** guarda los ingredientes. → Es la **base de datos**.
- **La comanda** (el papelito con tu pedido) viaja de la sala a la cocina. → Es una **petición** (request).
- **El plato que te traen** de vuelta. → Es la **respuesta** (response).

Cuando pides "una hamburguesa", tú no cocinas: se lo dices al camarero
(frontend), que lleva la comanda a la cocina (backend), que coge ingredientes de
la nevera (base de datos), cocina, y te devuelve el plato. **Exactamente así
funciona nuestra app de pacientes.**

---

## 1.2 · Frontend vs Backend

Son las dos mitades de toda aplicación:

### Frontend ("la parte de delante")
Es **todo lo que el usuario ve y toca**: botones, formularios, tablas, colores.
Se ejecuta en el **navegador** (Chrome, Firefox...).

En nuestro proyecto, el frontend está hecho con **Next.js** y **React**, y vive
en la carpeta `frontend/`.

### Backend ("la parte de atrás")
Es el **cerebro invisible**. Recibe peticiones, aplica las reglas ("¿este email
es válido?", "¿este paciente existe?"), habla con la base de datos y devuelve
respuestas. El usuario **nunca lo ve directamente**.

En nuestro proyecto, el backend está hecho con **Node.js** y **Express**, y vive
en la carpeta `backend/`.

> 🔑 **Idea clave:** frontend y backend son **dos programas separados** que se
> comunican por internet. En nuestro caso:
> - El frontend corre en `http://localhost:3005`
> - El backend corre en `http://localhost:3001`

---

## 1.3 · ¿Qué es una API?

**API** = *Application Programming Interface*. Suena complicado, pero es simple:

> Una API es **la lista de cosas que el backend sabe hacer**, y cómo pedírselas.

Volviendo al restaurante: la API es **la carta del menú**. La carta te dice qué
puedes pedir ("hamburguesa", "ensalada") y el camarero sabe cómo llevar cada
pedido a la cocina. No necesitas saber *cómo* se cocina; solo pides del menú.

En nuestro proyecto, la API del backend ofrece cosas como:
- "Dame la lista de todos los pacientes"
- "Crea este paciente nuevo"
- "Borra el paciente número 5"

Cada una de esas "cosas que puedes pedir" se llama un **endpoint** (un punto de
entrada). Por ejemplo, el endpoint para pedir la lista de pacientes es:

```
GET http://localhost:3001/api/pacientes
```

---

## 1.4 · ¿Qué es HTTP y los "métodos" (GET, POST, PUT, DELETE)?

**HTTP** es el idioma que usan frontend y backend para hablar por internet.
Cada petición HTTP tiene un **método** (o "verbo") que indica *qué tipo de
acción* quieres. Los 4 que usamos:

| Método | Significa | Ejemplo en el restaurante |
|--------|-----------|---------------------------|
| **GET** | "Dame / muéstrame" | Pedir la carta o ver un plato |
| **POST** | "Crea algo nuevo" | Hacer un pedido nuevo |
| **PUT** | "Modifica algo que ya existe" | "Cambia mi pedido, quiero sin cebolla" |
| **DELETE** | "Borra algo" | "Cancela mi pedido" |

Fíjate que estos 4 verbos encajan perfectamente con... el CRUD. Vamos a ello.

---

## 1.5 · ¿Qué es un CRUD? (el corazón de todo)

**CRUD** son las 4 operaciones básicas que puedes hacer con cualquier dato.
Es un acrónimo en inglés:

| Letra | Inglés | Español | Método HTTP | En nuestra app |
|-------|--------|---------|-------------|----------------|
| **C** | Create | Crear | POST | Añadir un paciente nuevo |
| **R** | Read | Leer | GET | Ver la lista o un paciente |
| **U** | Update | Actualizar | PUT | Editar los datos de un paciente |
| **D** | Delete | Borrar | DELETE | Eliminar un paciente |

**Eso es un CRUD: una app que te deja Crear, Leer, Actualizar y Borrar cosas.**
Prácticamente todas las aplicaciones que usas (redes sociales, tiendas, tu
banco...) son, en el fondo, CRUDs muy grandes. Aprender a hacer uno es aprender
la base de todo el desarrollo web.

---

## 1.6 · ¿Qué es una base de datos?

Es donde se guardan los datos **de forma permanente**. La diferencia clave:

- Si guardas los pacientes solo en la memoria del programa (en una variable),
  cuando **apagas el servidor, se borran todos**. 😱
- Si los guardas en una **base de datos**, siguen ahí aunque apagues y
  enciendas mil veces. ✅

Piensa en la base de datos como una **hoja de Excel muy potente**: tiene tablas,
cada tabla tiene columnas (nombre, email, teléfono...) y filas (cada paciente es
una fila).

Nuestra base de datos es **PostgreSQL** (o "Postgres" para los amigos), una de
las más usadas y respetadas del mundo. La vemos a fondo en el
[capítulo 4](04-base-de-datos.md).

> 📝 **Curiosidad de este proyecto:** al principio guardábamos los pacientes en
> memoria (en una variable) para ir rápido. Luego lo cambiamos a PostgreSQL para
> que fuera "de verdad". Verás las dos versiones mencionadas en el código.

---

## 1.7 · ¿Qué pinta cada tecnología?

Ahora que tienes el mapa mental, aquí está el papel de cada herramienta:

- **Node.js** — Normalmente JavaScript solo funciona dentro del navegador. Node
  es un programa que te deja ejecutar JavaScript **en tu ordenador/servidor**,
  fuera del navegador. Sin Node, no habría backend en JavaScript.

- **Express** — Escribir un backend desde cero con Node es tedioso. Express es
  una **librería** (código ya hecho por otros) que te da atajos para crear
  endpoints fácilmente. Es el framework de backend más popular de Node.

- **TypeScript** — Es JavaScript + **tipos**. Un "tipo" es decir de qué clase es
  un dato: "esto es un número", "esto es texto". Te avisa de errores *mientras
  escribes*, en vez de que exploten cuando el usuario ya está usando la app.
  Lo vemos con calma en el [capítulo 3](03-backend.md).

- **React** — Una librería para construir interfaces visuales por **piezas
  reutilizables** llamadas *componentes* (un botón, un formulario, una tabla).

- **Next.js** — Un framework construido *encima* de React que le añade
  superpoderes: rutas (páginas), organización, optimizaciones... Es la forma
  profesional de usar React hoy.

- **PostgreSQL** — La base de datos (la nevera permanente).

- **Prisma** — Hablar con la base de datos requiere un idioma especial llamado
  **SQL**. Prisma es un **traductor**: tú escribes JavaScript normal y Prisma lo
  convierte a SQL por debajo. Se llama un **ORM**. Capítulo 4.

- **Zod** — Un "portero de discoteca" para los datos: revisa que lo que llega
  cumple las normas (que el email tenga `@`, que el nombre no esté vacío...)
  antes de dejarlo pasar.

---

## ✅ Resumen del capítulo

- Una app web tiene **frontend** (lo que ves) y **backend** (el cerebro invisible).
- Se comunican por **HTTP**, usando **peticiones** y **respuestas**.
- La **API** es el menú de cosas que el backend sabe hacer; cada opción es un **endpoint**.
- Los métodos **GET, POST, PUT, DELETE** corresponden a **Leer, Crear, Actualizar, Borrar**.
- Un **CRUD** es una app que hace esas 4 cosas. ¡Es lo que estamos construyendo!
- La **base de datos** (PostgreSQL) guarda los datos para siempre.

➡️ Sigue con el [Capítulo 2 — La arquitectura del proyecto](02-arquitectura.md).
