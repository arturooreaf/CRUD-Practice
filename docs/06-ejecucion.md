# Capítulo 6 — Cómo ejecutarlo todo (paso a paso)

Ya entiendes cómo está hecho. Ahora vamos a **arrancarlo**, con calma y
explicando qué hace cada comando. Incluyo también los **problemas reales** que
nos encontramos montándolo, porque aprender a resolverlos es parte del juego.

---

## 6.1 · Qué necesitas tener instalado

1. **Node.js** — para ejecutar el backend y el frontend.
2. **Docker Desktop** — para arrancar PostgreSQL. (En Windows, además necesita
   **WSL2**; ver 6.6.)
3. **Git** — para clonar el proyecto (si no lo tienes ya).

Para comprobar si los tienes, abre una terminal (PowerShell) y escribe:
```powershell
node --version
docker --version
git --version
```
Si cada uno responde con un número de versión, lo tienes. Si dice "no se
reconoce el comando", no está instalado (o no está en el PATH; ver 6.5).

---

## 6.2 · La idea general: 3 cosas corriendo a la vez

Recuerda el capítulo 2: son **tres piezas**. Para usar la app, las tres tienen
que estar encendidas:

1. **La base de datos** (PostgreSQL en Docker) — se arranca una vez.
2. **El backend** (Express) — en una terminal.
3. **El frontend** (Next.js) — en otra terminal.

Así que vas a usar **dos terminales** abiertas a la vez (además de Docker).

---

## 6.3 · Paso a paso

### Paso 0 — Arranca la base de datos (Docker)
Desde la carpeta raíz del proyecto:
```powershell
docker compose up -d
```
Esto arranca PostgreSQL en segundo plano (`-d` = *detached*, "en segundo plano").

**¿Cómo sé que está lista?**
```powershell
docker ps
```
Debe aparecer un contenedor llamado **`health_crud_db`** con estado
**`Up ... (healthy)`**. "healthy" significa que PostgreSQL ya acepta conexiones.

### Paso 1 — Arranca el backend (Terminal 1)
```powershell
cd backend
npm install            # instala las librerías (solo la primera vez)
Copy-Item .env.example .env   # crea tu archivo de configuración
npm run db:migrate     # crea las tablas en la base de datos
npm run db:seed        # (opcional) mete 2 pacientes de ejemplo
npm run dev            # ¡arranca la API!
```
Cuando veas `🚀 API escuchando en http://localhost:3001`, el backend está listo.
**Deja esta terminal abierta** (si la cierras, el backend se apaga).

### Paso 2 — Arranca el frontend (Terminal 2, una ventana nueva)
```powershell
cd frontend
npm install            # solo la primera vez
npm run dev            # arranca la web
```
Cuando veas que está listo, abre el navegador en la dirección que te indique
(normalmente **http://localhost:3000**, o el puerto que te diga).

### Paso 3 — ¡Úsalo!
Abre la web, verás la lista con los 2 pacientes de ejemplo. Prueba a crear, editar
y borrar. Cada acción viaja al backend y a PostgreSQL (capítulo 2). 🎉

---

## 6.4 · Cómo apagarlo todo

- **Backend y frontend:** pulsa `Ctrl + C` en cada terminal (o ciérralas).
- **Base de datos:** desde la raíz:
  ```powershell
  docker compose down
  ```
  Esto apaga PostgreSQL. **Tus datos NO se borran** (se guardan en el "volumen"
  de Docker, ¿recuerdas el cap. 4?). La próxima vez que hagas `docker compose up`,
  seguirán ahí.

---

## 6.5 · Problema real #1: "npm no se reconoce como comando"

En la máquina donde se montó esto, **Node estaba instalado pero no en el PATH**.
El PATH es la lista de sitios donde el sistema busca los comandos. Si Node no
está en esa lista, la terminal no lo encuentra.

**Solución rápida** (añadir Node al PATH solo para esa terminal):
```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```
Después de esa línea, `npm` y `node` ya funcionan en esa ventana. (Solución
permanente: añadir `C:\Program Files\nodejs` al PATH en las variables de entorno
de Windows.)

---

## 6.6 · Problema real #2: Docker no arranca ("WSL not installed")

En Windows, Docker Desktop necesita **WSL2** (una capa que permite correr Linux
dentro de Windows). Si no lo tienes, Docker muestra el error *"WSL not installed"*.

**Solución:**
1. Abre PowerShell **como Administrador**.
2. Ejecuta:
   ```powershell
   wsl --install
   ```
3. **Reinicia el ordenador** (obligatorio).
4. Vuelve a abrir Docker Desktop.

**Problema #2b (nos pasó):** tras instalar WSL, el motor de Docker seguía sin
arrancar ("Docker Desktop is unable to start"), porque había arrancado *antes* de
que WSL estuviera listo. Se arregló reiniciando el motor:
```powershell
# Cerrar Docker Desktop, reiniciar WSL y volver a lanzarlo:
wsl --shutdown
# (y volver a abrir Docker Desktop)
```
Tras esto, `docker ps` ya respondió y todo funcionó.

---

## 6.7 · Problema real #3: "el puerto ya está en uso"

Si al arrancar el frontend ves un error tipo `EADDRINUSE: port 3000`, significa
que **otro programa ya está usando ese puerto**. Solución: usa otro puerto.
```powershell
npm run dev -- -p 3005
```
Y abres `http://localhost:3005` en su lugar. (Nos pasó: el 3000 estaba ocupado y
usamos el 3005.)

---

## 6.8 · Chuleta de comandos (para tener a mano)

| Quiero... | Comando | Dónde |
|-----------|---------|-------|
| Arrancar la BD | `docker compose up -d` | raíz |
| Ver si la BD está viva | `docker ps` | cualquier sitio |
| Apagar la BD | `docker compose down` | raíz |
| Crear/actualizar tablas | `npm run db:migrate` | `backend/` |
| Meter datos de ejemplo | `npm run db:seed` | `backend/` |
| Ver la BD en el navegador | `npm run db:studio` | `backend/` |
| Arrancar el backend | `npm run dev` | `backend/` |
| Arrancar el frontend | `npm run dev` | `frontend/` |

> 🔎 **Truco extra:** `npm run db:studio` abre **Prisma Studio**, una web donde
> ves y editas la base de datos con el ratón, sin escribir SQL. Muy útil para
> aprender y para comprobar que los datos se están guardando.

---

## ✅ Resumen del capítulo

- Necesitas **Node**, **Docker** (con WSL2 en Windows) y **Git**.
- Arranca **3 cosas**: base de datos (Docker) + backend + frontend.
- Comprueba la BD con `docker ps` (estado `healthy`).
- Apaga con `Ctrl+C` y `docker compose down` (los datos se conservan).
- Problemas típicos: **PATH** (Node no encontrado), **WSL/Docker** y **puertos
  ocupados**. Todos tienen solución sencilla.

➡️ Termina con el [Capítulo 7 — Glosario](07-glosario.md).
