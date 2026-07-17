# Capítulo 5 — El frontend paso a paso (Next.js + React)

El frontend es **lo que ve y toca el usuario**: la lista de pacientes, los
botones, el formulario. Está en la carpeta `frontend/`. Vamos a entenderlo poco
a poco, empezando por los conceptos de React.

---

## 5.0 · Primero, dos ideas de React que necesitas

### Componentes
React construye interfaces con **componentes**: piezas reutilizables. Un
componente es una función que **devuelve lo que se debe pintar** en la pantalla,
usando una sintaxis parecida a HTML llamada **JSX**:

```tsx
function Saludo() {
  return <h1>Hola 👋</h1>;
}
```

Ese `<h1>Hola</h1>` dentro de JavaScript es **JSX**. Puedes mezclar lógica y
"HTML" en el mismo sitio. Los componentes se combinan como piezas de Lego para
formar páginas enteras.

### Estado (`useState`)
El **estado** es la memoria de un componente: datos que pueden cambiar y que,
cuando cambian, hacen que la pantalla se **repinte** sola. Ejemplo:

```tsx
const [contador, setContador] = useState(0);
// contador = el valor actual (empieza en 0)
// setContador = la función para cambiarlo
// Al llamar setContador(1), React repinta con el nuevo valor.
```

Con estos dos conceptos (componentes + estado) puedes leer todo el frontend.

---

## 5.1 · ¿Qué es Next.js y qué son las rutas?

**Next.js** es un framework sobre React. Su superpoder más visible: **las
páginas se crean con carpetas**. Esto se llama *App Router*. Mira:

```
app/
├── page.tsx                      → la página principal   →  /
└── pacientes/
    ├── nuevo/
    │   └── page.tsx              → página de crear        →  /pacientes/nuevo
    └── [id]/
        └── editar/
            └── page.tsx          → página de editar       →  /pacientes/123/editar
```

> 📌 **Regla:** cada archivo llamado `page.tsx` se convierte en una página web, y
> **la ruta la marca la carpeta** donde está. La carpeta `[id]` entre corchetes
> es un **comodín**: `123` en la URL se convierte en el `id`.

---

## 5.2 · `lib/api.ts` — el puente hacia el backend 🌉

Antes de pintar nada, necesitamos una forma de **llamar al backend**. Ese código
está centralizado aquí, para no repetirlo en cada página:

```ts
const API_URL = 'http://localhost:3001';

export const pacientesApi = {
  listar:     () => request('/api/pacientes'),
  obtener:    (id) => request(`/api/pacientes/${id}`),
  crear:      (data) => request('/api/pacientes', { method: 'POST', body: ... }),
  actualizar: (id, data) => request(`/api/pacientes/${id}`, { method: 'PUT', ... }),
  eliminar:   (id) => request(`/api/pacientes/${id}`, { method: 'DELETE' }),
};
```

Cada función corresponde a un endpoint del backend (¿te suena? son las 4
operaciones del CRUD otra vez). Por dentro usan **`fetch`**, la herramienta del
navegador para hacer peticiones HTTP:

```ts
async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, { ... });
  if (!res.ok) {
    // El backend respondió con error (400, 404, 409...) → lo traducimos a un mensaje
    throw new Error(mensaje);
  }
  return res.json(); // convertimos la respuesta JSON a un objeto JavaScript
}
```

> 🔁 **Esto cierra el círculo del capítulo 2:** cuando el frontend llama a
> `pacientesApi.crear(...)`, por debajo hace un `fetch` con `POST` al backend.
> Ese es el "viaje de la petición" que dibujamos allí, ¡pero ahora en código!

Este archivo también define los **tipos** de TypeScript (`Paciente`,
`PacienteInput`) para que el editor te avise si usas mal los datos.

---

## 5.3 · `app/page.tsx` — la lista de pacientes (la R de "Read") 📋

Es la página principal. Su trabajo: **pedir la lista al backend y mostrarla en
una tabla**, con botones de editar y borrar. Las partes clave:

### 1) Guardar la lista en el estado
```tsx
const [pacientes, setPacientes] = useState([]); // empieza vacía
const [cargando, setCargando] = useState(true); // ¿estamos esperando?
```

### 2) Pedir los datos al cargar la página
```tsx
useEffect(() => {
  cargar(); // se ejecuta una vez, cuando la página aparece
}, []);

async function cargar() {
  const datos = await pacientesApi.listar(); // llama al backend
  setPacientes(datos);                       // guarda en el estado → repinta
}
```

> 🪝 **`useEffect`** sirve para ejecutar código en momentos concretos del ciclo de
> vida del componente. Aquí, con `[]` al final, significa "ejecuta esto **una
> sola vez**, cuando la página se muestra por primera vez". Es el momento
> perfecto para ir a buscar los datos.

### 3) Pintar la tabla
```tsx
{pacientes.map((p) => (
  <tr key={p.id}>
    <td>{p.nombre} {p.apellidos}</td>
    <td>{p.email}</td>
    <td>
      <Link href={`/pacientes/${p.id}/editar`}>Editar</Link>
      <button onClick={() => eliminar(p)}>Eliminar</button>
    </td>
  </tr>
))}
```

**`.map(...)`** recorre la lista y genera una fila `<tr>` por cada paciente. Es
el patrón más común de React: "por cada dato de esta lista, pinta esto".

### 4) Borrar (la D de "Delete")
```tsx
async function eliminar(p) {
  if (!confirm(`¿Eliminar a ${p.nombre}?`)) return; // pregunta antes
  await pacientesApi.eliminar(p.id);                // llama al backend
  setPacientes((prev) => prev.filter((x) => x.id !== p.id)); // quita de la lista
}
```

Fíjate: primero pide confirmación, luego llama al backend, y por último quita al
paciente de la lista visible (sin recargar la página entera).

---

## 5.4 · `components/PacienteForm.tsx` — el formulario reutilizable 📝

Crear y editar usan **el mismo formulario**. En vez de escribirlo dos veces, lo
hacemos **una vez** como componente reutilizable y lo usamos en ambos sitios.
Esto es el principio **DRY** (*Don't Repeat Yourself*, "no te repitas").

Cada campo del formulario está conectado al estado:

```tsx
const [form, setForm] = useState(inicial ?? VACIO);

<input
  value={form.nombre}
  onChange={(e) => set('nombre', e.target.value)}
/>
```

Esto se llama **input controlado**: el valor del campo (`value`) sale del estado,
y cada vez que el usuario teclea (`onChange`) se actualiza el estado. Así React
siempre sabe qué hay escrito en el formulario.

Al pulsar "Guardar":
```tsx
async function handleSubmit(e) {
  e.preventDefault();     // evita que el navegador recargue la página
  await onSubmit(form);   // llama a crear() o actualizar(), según el caso
  router.push('/');       // vuelve a la lista
}
```

> ♻️ **La gracia:** este componente **no sabe** si está creando o editando. Recibe
> una función `onSubmit` desde fuera, y él solo se encarga de recoger los datos y
> llamarla. Quien lo usa decide qué hacer. Eso lo hace reutilizable.

---

## 5.5 · Las páginas de crear y editar (la C y la U)

Gracias a que el formulario es reutilizable, estas dos páginas son **muy
cortas**:

### `app/pacientes/nuevo/page.tsx` — Crear
```tsx
export default function NuevoPacientePage() {
  async function crear(data) {
    await pacientesApi.crear(data); // POST al backend
  }
  return <PacienteForm titulo="Nuevo paciente" onSubmit={crear} />;
}
```
Le pasa al formulario una función `crear` que hace un `POST`. Nada más.

### `app/pacientes/[id]/editar/page.tsx` — Editar
```tsx
export default function EditarPacientePage() {
  const { id } = useParams();          // saca el id de la URL

  // 1. Al cargar, pide los datos actuales del paciente para rellenar el formulario
  useEffect(() => {
    pacientesApi.obtener(id).then(setInicial);
  }, [id]);

  // 2. Al guardar, hace un PUT
  async function actualizar(data) {
    await pacientesApi.actualizar(id, data);
  }

  return <PacienteForm titulo="Editar paciente" inicial={inicial} onSubmit={actualizar} />;
}
```
La diferencia con "crear": primero **descarga** los datos actuales del paciente
(para que el formulario aparezca ya relleno), y al guardar hace `PUT` en vez de
`POST`. **El mismo formulario, distinto comportamiento.** 🎯

---

## 5.6 · `app/globals.css` y `app/layout.tsx` — el aspecto

- **`globals.css`** son los **estilos** (colores, márgenes, la tabla, los
  botones...). CSS es el lenguaje que da aspecto visual a las páginas. Aquí, por
  ejemplo, se define el color verde de la marca o el aspecto de los botones.
- **`layout.tsx`** es el "marco" común a todas las páginas (el `<html>`, el
  `<body>`, el contenedor centrado). Todas las páginas se pintan *dentro* de él.

---

## ✅ Resumen del capítulo

- React construye la interfaz con **componentes** (piezas) y **estado** (memoria
  que, al cambiar, repinta la pantalla).
- **Next.js** crea las **páginas con carpetas** (`page.tsx`), con comodines `[id]`.
- **`lib/api.ts`** centraliza las llamadas al backend con `fetch` (cierra el
  "viaje de la petición" del cap. 2).
- **`page.tsx`** lista y borra; **`PacienteForm`** es un formulario reutilizable;
  las páginas de **crear** y **editar** lo reutilizan cambiando solo el `onSubmit`.
- No repetirse (**DRY**) y componentes reutilizables = código limpio.

➡️ Sigue con el [Capítulo 6 — Cómo ejecutarlo todo](06-ejecucion.md).
