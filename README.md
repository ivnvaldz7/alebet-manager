# Ale-Bet Manager

Sistema de gestion logistica para laboratorio veterinario.

## Stack

| | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, TypeScript 5 (strict) |
| Estilos | Tailwind CSS 4 |
| Base de Datos | MongoDB + Mongoose 9 |
| Autenticacion | NextAuth.js v4 (JWT) |
| UI | Lucide Icons, Radix UI |

## Inicio rapido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env.local
```

Editar `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/ale-bet-manager
NEXTAUTH_SECRET=tu-secret-seguro
NEXTAUTH_URL=http://localhost:3000
```

```bash
# 3. Cargar datos iniciales
npm run seed:admin
npm run seed:productos:reales
npm run seed:clientes

# 4. Iniciar
npm run dev
```

Acceder en `http://localhost:3000`

### Credenciales por defecto

```
Email: admin@alebet.com
Password: admin123
```

> Cambiar en produccion.

## Roles

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso total. Puede cambiar contexto a vendedor/armador. |
| **Vendedor** | Crear pedidos, ver sus pedidos, consultar stock |
| **Armador** | Tomar pedidos pendientes, armar, confirmar, consultar stock |

## Flujo de pedidos

```
Vendedor crea pedido → Pendiente
  ↓
Armador toma pedido → En Preparacion (lotes FIFO asignados)
  ↓
Armador confirma → Aprobado (stock descontado)
  ↓
Admin marca listo → Listo
  ↓
(o cualquier momento) → Cancelado (stock revertido si aplica)
```

## Estructura

```
app/
├── (auth)/login/          # Login
├── (dashboard)/
│   ├── inicio/            # Dashboard con stats
│   ├── pedidos/           # CRUD pedidos + detalle + editar
│   ├── stock/             # Vista de inventario
│   ├── perfil/            # Perfil de usuario
│   └── historial/         # Historial de actividad
├── admin/
│   ├── productos/         # CRUD productos + lotes + stock
│   ├── usuarios/          # CRUD usuarios
│   ├── reportes/          # Reportes
│   └── configuracion/     # Config del sistema
└── api/                   # REST API
components/
├── layout/                # Header, NotificacionesPanel
├── pedidos/               # PedidoCard, etc.
└── ui/                    # Button, Card, Input, Badge, etc.
hooks/                     # useAuth, usePedidos, useProducts, useNotificaciones
lib/
├── models/                # User, Product, Order, Customer, StockMovement
├── utils/                 # FIFO, stock calculator
└── auth/                  # NextAuth config
types/                     # TypeScript interfaces
scripts/                   # Seeds de base de datos
```

## API

### Pedidos
| Metodo | Ruta | Accion |
|--------|------|--------|
| GET | `/api/pedidos` | Listar pedidos (filtro por estado) |
| POST | `/api/pedidos` | Crear pedido |
| GET | `/api/pedidos/[id]` | Obtener pedido |
| PATCH | `/api/pedidos/[id]` | Acciones: `tomar`, `confirmar`, `listo`, `editar` |
| POST | `/api/pedidos/[id]/cancelar` | Cancelar pedido |

### Productos
| Metodo | Ruta | Accion |
|--------|------|--------|
| GET | `/api/productos` | Listar productos activos |
| POST | `/api/productos` | Crear producto |
| GET | `/api/productos/[id]` | Obtener producto |
| PATCH | `/api/productos/[id]` | Actualizar producto |
| POST | `/api/productos/[id]/lotes` | Agregar lote |
| PATCH | `/api/productos/[id]/lotes/[numero]` | Editar lote |
| POST | `/api/productos/[id]/lotes/[numero]/quitar` | Quitar lote |

### Usuarios
| Metodo | Ruta | Accion |
|--------|------|--------|
| GET | `/api/usuarios` | Listar usuarios |
| POST | `/api/usuarios` | Crear usuario |
| GET | `/api/usuarios/[id]` | Obtener usuario |
| PATCH | `/api/usuarios/[id]` | Actualizar usuario |
| PATCH | `/api/usuarios/[id]/password` | Cambiar password |

### Clientes
| Metodo | Ruta | Accion |
|--------|------|--------|
| GET | `/api/clientes` | Listar/buscar clientes |

## Scripts

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm run start` | Servidor de produccion |
| `npm run lint` | Linter |
| `npm run seed:admin` | Crear usuario admin |
| `npm run seed:productos` | Productos de ejemplo |
| `npm run seed:productos:reales` | Productos reales del laboratorio |
| `npm run seed:clientes` | Clientes de ejemplo |

## Deploy

### Vercel (recomendado)

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Configurar variables de entorno:
   - `MONGODB_URI` — Connection string de MongoDB Atlas
   - `NEXTAUTH_SECRET` — Secret aleatorio (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` — URL del dominio (ej: `https://alebet.vercel.app`)
3. Deploy automatico con cada push a `main`

### Variables de entorno requeridas

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `MONGODB_URI` | Conexion MongoDB | `mongodb+srv://user:pass@cluster.mongodb.net/alebet` |
| `NEXTAUTH_SECRET` | Secret JWT | (generar con `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL base de la app | `https://tu-dominio.com` |

## Caracteristicas tecnicas

- **FIFO automatico**: Al armar pedidos, los lotes mas antiguos se usan primero
- **Auditoria**: Cada movimiento de stock queda registrado con usuario, fecha y motivo
- **Notificaciones**: Panel dinamico con alertas de pedidos y stock critico + push del browser
- **PWA**: Instalable como app en celular
- **Multi-contexto**: Admin puede operar como vendedor o armador sin cambiar de cuenta
- **Responsive**: Optimizado para uso en celular/tablet

## Seguridad

- Passwords con bcrypt
- Sesiones JWT (NextAuth)
- Middleware de autenticacion en todas las rutas
- Validacion de permisos por rol en cada endpoint
- Comparaciones de ObjectId con `String()` para evitar falsos negativos

---

Desarrollado para Ale-Bet Laboratorio Veterinario
