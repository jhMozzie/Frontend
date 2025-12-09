# API Base URL configuration

Resumen de cambios realizados:

- Cambiado el origen de la URL base de la API para que sea configurable a través de la variable de entorno `VITE_API_URL`.
- Archivo modificado: `src/services/api.ts`.

Detalles técnicos:

- Anteriormente `src/services/api.ts` tenía la URL fija:

```ts
baseURL: "http://localhost:3000/api"
```

- Ahora se usa `import.meta.env.VITE_API_URL` con fallback a `http://localhost:3000/api`:

```ts
const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api"

export const api = axios.create({ baseURL: BASE_URL, headers: { "Content-Type": "application/json" } })
```

Notas sobre módulos y rutas:

- Todas las llamadas a la API se siguen realizando a rutas relativas (por ejemplo, `/championships`, `/academies`, `/participants`, etc.). El `baseURL` se antepone automáticamente por Axios. Por ejemplo, si `VITE_API_URL` es `http://localhost:3000/api` y un servicio hace `api.get('/academies')`, la petición final será `http://localhost:3000/api/academies`.

- En particular, los servicios del módulo `academies` ya usan rutas que empiezan por `/academies` (ver `src/modules/academies/services/academy.service.ts`). Si necesitas que alguna ruta de otro módulo comience por `/academies`, indícamelo y lo adapto en el servicio correspondiente.

Cómo usarlo en desarrollo:

1. Copia `.env.example` a `.env.local` (o crea `.env` según tu flujo):

```bash
cp .env.example .env.local
```

2. Asegúrate de que la variable `VITE_API_URL` apunte a tu backend (por ejemplo):

```
VITE_API_URL=http://localhost:3000/api
```

3. Reinicia el servidor de desarrollo (`pnpm dev` o `npm run dev`) para que Vite inyecte la nueva variable.

Comprobación rápida:

- Abre DevTools → Network y verifica que las peticiones apunten a la URL establecida en `VITE_API_URL`.

Si quieres que además haga cambios automáticos para que rutas de ciertos módulos comiencen explícitamente por `/academies` (por ejemplo para llamadas entre módulos), dime qué servicios deben cambiar y los parcheo.
