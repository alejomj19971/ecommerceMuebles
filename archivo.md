# Plan Ecommerce de Muebleria (Primero UI)

## Objetivo
Construir un ecommerce de muebles con `Next.js`, `PostgreSQL`, `Prisma` y `shadcn/ui`, iniciando por el diseno visual y experiencia de usuario, sin implementar logica de backend en esta primera etapa.

## Stack definido
- **Frontend/App:** Next.js (App Router)
- **Base de datos (futuro):** PostgreSQL
- **ORM (futuro):** Prisma
- **Sistema UI:** shadcn/ui + Tailwind CSS

---

## Fase 1 - Diseno y maquetacion UI (sin backend)

### 1.1 Direccion visual (basada en la captura)
- Estilo limpio, premium y minimalista.
- Paleta neutra: crema, blanco roto, gris suave, acentos oscuros.
- Imagenes grandes de ambientes (sala, dormitorio, comedor, oficina).
- Tarjetas de producto con foco en fotografia + precio + CTA.
- Secciones largas tipo landing: hero, colecciones, beneficios, testimonios, FAQ, footer.

### 1.2 Estructura de paginas UI a construir
- `/` Home
- `/productos` Catalogo general
- `/productos/[slug]` Detalle de producto
- `/categorias/[slug]` Listado por categoria
- `/carrito` Carrito (UI solamente)
- `/checkout` Checkout (UI mock, sin pago real)
- `/mi-cuenta` Login/registro/perfil (pantallas visuales)
- `/favoritos` Wishlist (UI mock)

### 1.3 Secciones de Home (orden sugerido)
1. Header (logo, buscador, nav, iconos)
2. Hero principal con CTA "Comprar ahora"
3. "Nuevas colecciones" (grid de productos destacados)
4. "Productos recomendados para ti" (bloques grandes por ambiente)
5. Beneficios: envio, cambios, soporte
6. Testimonios de clientes
7. FAQ compacta
8. Banner promocional secundario
9. Footer completo (info, links, newsletter)

### 1.4 Componentes UI (con shadcn/ui)
- **Layout:** `Container`, `Section`, `PageHeader`
- **Navegacion:** `Navbar`, `MobileMenu`, `Breadcrumb`
- **Producto:** `ProductCard`, `ProductGrid`, `ProductGallery`, `PriceTag`, `StockBadge`
- **Interaccion:** `Button`, `Input`, `Select`, `Slider`, `Accordion`, `Tabs`, `Sheet`, `Dialog`
- **Compra:** `CartItem`, `CartSummary`, `CheckoutSteps`, `OrderSummary`
- **Social proof:** `TestimonialCard`, `RatingStars`
- **Estado vacio:** `EmptyState` para carrito/favoritos
- **Feedback visual:** skeleton loaders y toasts simulados

### 1.5 Design tokens iniciales
- **Tipografia:** Inter o Manrope
- **Escala:** espaciado 4/8/12/16/24/32
- **Radius:** tarjetas y botones redondeados suaves
- **Sombras:** suaves, enfoque elegante
- **Breakpoints:** mobile-first (sm, md, lg, xl)
- **Modo oscuro:** opcional para v2 (no bloquear v1)

### 1.6 Datos mock (solo frontend)
Crear un archivo local (ej. `src/mocks/products.ts`) con:
- Productos (nombre, slug, precio, imagen, categoria, rating)
- Categorias (living, dormitorio, comedor, oficina, exterior)
- Testimonios
- Preguntas frecuentes

> Nota: todo el contenido se consume desde mocks locales; no API ni DB en esta fase.

---

## Fase 2 - UX de compra simulada (sin backend real)

### 2.1 Flujos UI a cubrir
- Explorar catalogo por categoria
- Buscar y filtrar productos (estado local)
- Ver detalle y seleccionar variantes (color/tamano mock)
- Agregar/quitar en carrito (estado cliente)
- Simular checkout multi-paso (direccion, envio, pago ficticio)

### 2.2 Criterios de calidad UI
- Responsive completo (mobile/tablet/desktop)
- Accesibilidad basica (labels, contraste, focus visible)
- Consistencia visual en componentes
- Estados vacios/carga/error simulados

---

## Fase 3 - Preparacion tecnica para backend (sin implementarlo aun)

### 3.1 Preparar arquitectura sin conectar DB
- Definir tipos/interfaces de dominio (`Product`, `Category`, `CartItem`, `OrderDraft`)
- Separar `ui`, `features`, `lib`, `mocks`
- Dejar contratos listos para futuro consumo de API

### 3.2 Plan para siguiente etapa (cuando autorices backend)
- Prisma schema (productos, categorias, usuarios, ordenes)
- PostgreSQL + migraciones
- Endpoints o Server Actions
- Autenticacion
- Integracion de pagos

---

## Roadmap por semanas

### Semana 1: Base visual
- Setup Next.js + Tailwind + shadcn/ui
- Layout global + design tokens
- Home UI completa inspirada en la captura

### Semana 2: Catalogo y detalle
- Pagina de productos con filtros visuales
- Pagina detalle con galeria y variantes mock
- Componentes reutilizables de producto

### Semana 3: Carrito y checkout UI
- Carrito UI con resumen
- Checkout visual por pasos
- Pantallas de cuenta y favoritos mock

### Semana 4: Pulido
- Responsive fino + accesibilidad
- Skeletons, estados vacios, microinteracciones
- QA visual y checklist final de UI

---

## Entregables de esta primera etapa (solo UI)
- Sistema de componentes reutilizable con shadcn/ui
- Home + catalogo + detalle + carrito + checkout (sin backend)
- Datos mock locales listos para reemplazo futuro por API/DB
- Documentacion de estructura frontend para integracion con Prisma/PostgreSQL mas adelante

---

## Checklist de inicio inmediato
- [ ] Crear proyecto Next.js con App Router
- [ ] Instalar y configurar shadcn/ui
- [ ] Definir paleta, tipografia y espaciados
- [ ] Construir Home inspirada en la captura
- [ ] Crear mocks de productos/categorias/testimonios/FAQ
- [ ] Implementar catalogo y cards reutilizables
- [ ] Maquetar carrito y checkout (UI mock)

## Nota final
En esta fase **no** se crea logica de backend, ni conexion a base de datos, ni Prisma en ejecucion. Todo se centra en dejar una UI solida, moderna y lista para conectar datos reales en la siguiente etapa.
