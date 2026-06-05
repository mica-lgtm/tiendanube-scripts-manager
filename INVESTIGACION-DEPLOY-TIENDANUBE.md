# Investigación: por qué no funciona el "Deploy" a TiendaNube

**Fecha:** 2026-06-05
**Estado:** Cerrado — causa raíz confirmada. Decisión de camino: PENDIENTE.

## Problema reportado

Al apretar "Deploy" en el panel, falla. El usuario quería subir un bloque CSS
(`<style>` con nombres de producto en rosa) a la tienda.

## Causa raíz (confirmada en vivo contra la API + doc oficial + capturas)

El panel está construido sobre una premisa que la API de TiendaNube **no permite**:
"escribir el código en el editor → subirlo por API". Eso no existe.

Hechos verificados:

1. **`POST /scripts` exige `script_id`** — probado en vivo con el token real, en
   `v1` y en `2025-03`. El body actual del código (`{ name, code, type }` en
   `src/lib/tiendanube.ts`) devuelve siempre:
   ```json
   { "code": 422, "script_id": ["The script_id field is required."] }
   ```
   Ese 422 ES el error que ve el usuario al apretar Deploy.

2. **No existe `src`, ni `code`, ni `type`** en el POST. La API **no hostea ni
   recibe el contenido** del script. Solo *asocia* un `script_id` ya existente a
   la tienda (`{ script_id, query_params }`).

3. **El `script_id` solo se crea en el Partners Portal, y solo para apps de
   Partner.** No hay endpoint público para crear la definición del script.

4. **La app es "a medida" (Aplicación a Medida), no de Partner.** Tiene el permiso
   "Gestionar scripts" tildado, pero ese permiso solo deja *administrar* scripts;
   no alcanza para *crear* el `script_id` (no hay Partners Portal detrás). Es como
   tener la llave sin el auto.

Cosas que NO eran el problema (descartadas testeando, no asumiendo):
- El header de auth: `Authentication: bearer <tok>` y `Authentication: <tok>`
  ambos devuelven 200. El código actual lo manda bien.
- La versión de la URL: `v1` y `2025-03` responden igual.

## Datos del entorno

- App: "Mica-ZAS" (Aplicación a medida), tienda `601496`.
- Token válido (devuelve 200 en GET /scripts → `{ result: [], total: 0 }`, 0 scripts).

## Caminos posibles

### Camino A — Código del tema (recomendado para el CSS rosa)
Vía oficial y soportada para CSS/JS propio. Sin API, sin `script_id`.
Admin → Tienda online → tema → Editar código → pegar en el CSS del tema:
```css
.product-name, .product-title, h3, .name {
  color: #ffb7b0 !important;
  font-size: 18px !important;
  font-weight: 600 !important;
}
```
**Pendiente:** verificar que los selectores le peguen al tema real (son genéricos;
confirmar con el inspector del navegador).

### Camino B — Panel = "Generar código para pegar"
Cambiar el botón "Deploy" por "Generar código": el panel arma el CSS/JS final
listo para copiar/descargar, y el usuario lo pega en el tema. Conserva el valor
del panel (editor + versionado) sin prometer un auto-deploy que la API no da.

### Camino C — App de Partner real (auto-deploy de verdad)
Crear una app de Partner en partners.tiendanube.com (≠ "a medida"), hostear el JS,
registrar el script ahí para obtener el `script_id`, y recién entonces el panel
puede deployar solo. Proyecto aparte; solo vale la pena con muchos scripts/tiendas.

## Implicancia para el código

`src/lib/tiendanube.ts` y `src/app/api/tiendanube/deploy/route.ts` asumen el modelo
imposible (`{ name, code, type }`). NO tocar todavía: el fix depende de qué camino
(A/B/C) se elija. No es un bug de un campo — es el modelo entero.

## Próximo paso

Decidir camino A / B / C. Recomendación: A para dejar el CSS vivo ya; evaluar B
si se quiere seguir usando el panel.

## Fuentes
- https://tiendanube.github.io/api-documentation/resources/script
- https://docs.tiendanube.com/help/como-cargo-javascript
- https://ayuda.tiendanube.com/es_CO/socios-tecnologicos/como-creo-una-aplicacion-para-tiendanube
