# Capítulo 7 — Glosario

Diccionario rápido de todas las palabras raras que aparecen en el proyecto.
Ordenado alfabéticamente para que lo uses como consulta.

---

**API** — La lista de cosas que el backend sabe hacer y cómo pedírselas. El
"menú" del restaurante. Cada opción del menú es un *endpoint*.

**async / await** — Forma de trabajar con operaciones que **tardan** (como hablar
con la base de datos). `async` marca una función que tarda; `await` significa
"espera aquí a que termine antes de seguir".

**Backend** — La parte invisible de la app (el "cerebro" / la cocina). Recibe
peticiones, aplica reglas, habla con la base de datos y responde. Aquí: Node.js +
Express.

**CORS** — Norma de seguridad de los navegadores que controla qué webs pueden
llamar a qué servidores. Como frontend y backend están en puertos distintos, hay
que dar permiso con `cors()`.

**CRUD** — Las 4 operaciones básicas sobre datos: **C**reate, **R**ead,
**U**pdate, **D**elete (Crear, Leer, Actualizar, Borrar). Es lo que hace esta app.

**Componente (React)** — Una pieza reutilizable de interfaz (un botón, un
formulario, una tabla). Se combinan como Legos para formar páginas.

**Contenedor (Docker)** — Una "caja" aislada donde corre un programa (aquí,
PostgreSQL) sin ensuciar tu sistema.

**Docker** — Herramienta para arrancar programas dentro de contenedores aislados.
La usamos para tener PostgreSQL sin instalarlo a mano.

**DTO** (*Data Transfer Object*) — Nombre elegante para "la forma de los datos
que se envían" entre frontend y backend.

**Endpoint** — Un "punto de entrada" de la API: una URL + un método que hace algo
concreto. Ej.: `GET /api/pacientes` (dame la lista).

**.env** — Archivo con la configuración secreta (como la contraseña de la base de
datos). **Nunca se sube a git.** Su plantilla pública es `.env.example`.

**Estado (state, React)** — La "memoria" de un componente. Cuando cambia, la
pantalla se repinta sola. Se maneja con `useState`.

**Express** — La librería de Node con la que construimos la API del backend.

**fetch** — La herramienta del navegador para hacer peticiones HTTP al backend.

**Frontend** — La parte visible de la app (lo que ve y toca el usuario / la sala
del restaurante). Aquí: Next.js + React.

**Git / GitHub** — Git es el sistema para guardar el historial de cambios del
código. GitHub es la web donde se sube ese código para compartirlo.

**HTTP** — El idioma con el que frontend y backend se comunican por internet.
Usa *métodos* (GET, POST, PUT, DELETE) y *códigos de estado* (200, 404...).

**JSON** — Formato de texto para intercambiar datos, en parejas `"clave": valor`.
El idioma en el que viajan los datos entre frontend y backend.

**JSX** — La sintaxis parecida a HTML que se escribe dentro de los componentes de
React (ej.: `<h1>Hola</h1>` dentro de JavaScript).

**Librería / Framework** — Código ya escrito por otros que reutilizas. Una
*librería* es una caja de herramientas; un *framework* es una estructura más
completa que organiza tu proyecto (Express, Next.js).

**localhost** — Nombre que significa "este mismo ordenador". `localhost:3001` es
un programa corriendo en tu máquina, en el puerto 3001.

**Método HTTP** — El "verbo" de una petición: GET (leer), POST (crear), PUT
(actualizar), DELETE (borrar).

**Middleware** — Función que se ejecuta "en medio", entre que llega la petición y
se responde. Como filtros en una cinta transportadora (ej.: `cors`, `express.json`).

**Migración** — Instrucciones que crean o modifican la estructura de la base de
datos (las tablas). Quedan versionadas para poder recrear la BD en cualquier sitio.

**Next.js** — Framework sobre React. Aquí crea las páginas a partir de carpetas
(*App Router*).

**Node.js** — Programa que permite ejecutar JavaScript fuera del navegador (en el
servidor). Sin él no habría backend en JS.

**npm** — El gestor de paquetes de Node: instala librerías (`npm install`) y
ejecuta comandos (`npm run dev`).

**ORM** (*Object-Relational Mapping*) — Un "traductor" entre tu código y la base
de datos: escribes JavaScript y él genera el SQL. Aquí: Prisma.

**Persistencia** — Que los datos se guarden de forma permanente (sobreviven a
apagar el programa). Lo da la base de datos.

**PATH** — Lista de carpetas donde el sistema busca los comandos. Si un programa
no está en el PATH, la terminal "no lo encuentra".

**Petición / Respuesta (request / response)** — La petición es lo que el frontend
pide; la respuesta es lo que el backend devuelve. La ida y la vuelta.

**PostgreSQL** — La base de datos relacional donde se guardan los pacientes.
Organiza los datos en tablas (filas y columnas).

**Prisma** — El ORM que usamos para hablar con PostgreSQL sin escribir SQL a mano.

**Puerto** — El "número de puerta" de un programa en una máquina. Frontend (3005),
backend (3001), PostgreSQL (5432).

**React** — Librería para construir interfaces con componentes y estado.

**REST** — Un estilo/convención para diseñar APIs usando los métodos HTTP de
forma ordenada (justo como hacemos: GET para leer, POST para crear...).

**Ruta (route)** — La correspondencia entre una URL+método y la función que la
atiende. Están en `routes/`.

**Schema (Prisma)** — El "plano" que define cómo son las tablas de la base de
datos (`schema.prisma`).

**Seed** — Script que mete datos de ejemplo en una base de datos vacía.

**SQL** — El idioma para hablar con bases de datos relacionales. Prisma lo genera
por nosotros.

**TypeScript** — JavaScript + *tipos*. Avisa de errores mientras escribes.

**Tipo (type)** — Decir de qué clase es un dato: número, texto, lista... Ayuda a
evitar errores.

**uuid** — Un identificador único y aleatorio (ej.: `a1b2c3-...`). Cada paciente
tiene uno como `id`.

**Validación** — Comprobar que los datos que llegan cumplen las reglas (email
válido, nombre no vacío...). Aquí lo hace **Zod**.

**WSL2** (*Windows Subsystem for Linux*) — Capa que permite correr Linux dentro de
Windows. Docker Desktop la necesita.

**Zod** — Librería que valida datos y, de paso, genera los tipos de TypeScript. El
"portero de discoteca" de los datos.

---

🎓 **¡Y hasta aquí la guía!** Si has llegado leyendo con calma desde el capítulo
1, ahora entiendes de punta a punta cómo funciona una aplicación web CRUD
moderna: frontend, backend, base de datos y cómo se comunican. Eso es una base
enorme sobre la que seguir construyendo. ¡Enhorabuena! 👏

⬅️ Volver al [índice](README.md).
