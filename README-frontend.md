# Frontend MVP - Ecommerce Muebleria

## Estado actual
Este proyecto implementa el **frontend del MVP** con `Next.js` (App Router), `Tailwind CSS` y `shadcn/ui`, enfocado en UI/UX y datos mock locales.

No hay backend real conectado todavia. No se usa PostgreSQL ni Prisma en ejecucion en esta etapa.

## Stack usado
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## Rutas implementadas
- `/` Home
- `/productos` Catalogo general
- `/productos/[slug]` Detalle de producto
- `/categorias/[slug]` Listado por categoria
- `/carrito` Carrito (UI + estado local mock)
- `/checkout` Checkout visual
- `/checkout/confirmacion` Confirmacion de orden mock
- `/favoritos` Wishlist mock
- `/mi-cuenta` Login/perfil mock
- `/_not-found` Pantalla 404 personalizada

## Estructura principal
```txt
src/
  app/
    page.tsx
    productos/
      page.tsx
      [slug]/page.tsx
    categorias/
      [slug]/page.tsx
    carrito/page.tsx
    checkout/
      page.tsx
      confirmacion/page.tsx
    favoritos/page.tsx
    mi-cuenta/page.tsx
    not-found.tsx
  components/
    layout/
      site-header.tsx
      site-footer.tsx
    home/
      section-header.tsx
      product-card.tsx
      benefit-card.tsx
    catalog/
      catalog-client.tsx
    cart/
      cart-client.tsx
    product/
      product-options-client.tsx
  mocks/
    home-data.ts
    cart-data.ts
```

## Componentes clave
- `SiteHeader`: header global reusable con link activo automatico.
- `SiteFooter`: footer global reusable.
- `ProductCard`: card de producto reutilizada en home/catalogo/favoritos/categorias.
- `CatalogClient`: filtros mock por categoria + orden por precio + busqueda por nombre.
- `CartClient`: carrito mock con ajuste de cantidades y resumen.
- `ProductOptionsClient`: selector visual de color/tamano/cantidad en detalle.

## Fuente de datos mock
- `src/mocks/home-data.ts`
  - Tipo `Product`
  - `featuredProducts`
  - `roomCollections`
  - `getProductBySlug()`
  - `getProductsByCategorySlug()`
- `src/mocks/cart-data.ts`
  - `cartItemsMock`
  - `emptyCartItemsMock`

## Como ejecutar
```bash
npm install
npm run dev
```

Checks recomendados:
```bash
npm run lint
npm run build
```

## Convenciones del frontend actual
- Estilo visual premium/minimalista, paleta neutra.
- Mobile-first con breakpoints de Tailwind.
- Layout y navegacion consistentes en todas las rutas.
- Reutilizacion de componentes para evitar duplicacion.

## Como conectar backend despues (Prisma + PostgreSQL)
Cuando inicie la fase backend, mantener estas reglas para no romper la UI:

1. **No cambiar contratos del frontend de golpe**
   - Mantener inicialmente el shape de `Product` usado por los componentes.
   - Si cambias nombres/campos, usar adaptadores en `lib/` antes de tocar UI.

2. **Introducir capa de acceso a datos**
   - Crear `src/lib/api/` o `src/lib/repositories/`.
   - Reemplazar consumo de mocks progresivamente por funciones de lectura reales.

3. **Migracion incremental por rutas**
   - Empezar por `/productos` y `/productos/[slug]`.
   - Luego categorias, carrito, checkout.
   - Mantener fallback a mocks mientras se estabiliza cada endpoint.

4. **Prisma schema sugerido inicial**
   - `Product`, `Category`, `User`, `CartItem`, `Order`, `OrderItem`.
   - Agregar slugs unicos para productos/categorias.

5. **Checklist de reemplazo**
   - [ ] Endpoint/lista productos
   - [ ] Endpoint/detalle producto por slug
   - [ ] Endpoint/productos por categoria
   - [ ] Persistencia real de carrito
   - [ ] Checkout + creacion de orden

## Siguientes mejoras frontend (opcional)
- Drawer/menu mobile real en `SiteHeader`.
- Skeleton loaders y estados de carga por pagina.
- Toasts de feedback visual (agregar al carrito, favoritos, etc.).
- Pagina de perfil mas completa (direccion, historial de ordenes mock).
- Internacionalizacion y formato monetario centralizado.

