# Ale-Bet Manager

Sistema de Gestion Logistica para Laboratorio Veterinario

## Descripcion

Ale-Bet Manager es una plataforma web integral para administrar la logistica de un laboratorio/distribuidora de productos veterinarios. Permite gestionar pedidos, controlar inventario con sistema FIFO, administrar usuarios con diferentes roles y mantener trazabilidad completa de operaciones.

## Tecnologias

| Categoria | Tecnologia |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Base de Datos | MongoDB + Mongoose |
| Autenticacion | NextAuth.js |
| UI Components | Radix UI, Lucide Icons |

## Estructura del Proyecto

```
ale-bet-manager/
├── app/
│   ├── (auth)/           # Login y autenticacion
│   ├── (dashboard)/      # Panel principal (vendedor/armador)
│   │   ├── inicio/       # Dashboard con estadisticas
│   │   ├── pedidos/      # Crear y ver pedidos
│   │   ├── stock/        # Ver inventario
│   │   └── historial/    # Historial de actividades
│   ├── (admin)/          # Panel administrativo
│   │   ├── panel/        # Dashboard admin
│   │   ├── usuarios/     # Gestion de usuarios
│   │   ├── productos/    # Gestion de productos
│   │   └── reportes/     # Reportes y analisis
│   └── api/              # Endpoints REST
├── components/           # Componentes React
├── lib/
│   ├── models/           # Modelos Mongoose
│   ├── utils/            # Funciones utilitarias
│   └── auth/             # Configuracion NextAuth
├── hooks/                # React Hooks personalizados
├── types/                # Tipos TypeScript
└── scripts/              # Seeds de base de datos
```

## Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso total: usuarios, productos, pedidos, reportes, configuracion |
| **Vendedor** | Crear pedidos, ver sus pedidos, consultar stock |
| **Armador** | Ver pedidos pendientes, armar/preparar pedidos, consultar stock |

## Funcionalidades Principales

### Gestion de Pedidos
- Crear pedidos con busqueda de clientes frecuentes
- Busqueda y seleccion de productos con autocomplete
- Validacion de stock en tiempo real
- Alertas de stock insuficiente
- Estados: Pendiente → En Preparacion → Aprobado → Listo

### Control de Inventario
- Gestion de productos con variantes y presentaciones
- Sistema de lotes con FIFO automatico
- Alertas de stock minimo
- Control de fechas de vencimiento
- Movimientos de stock con auditoria completa

### Sistema de Lotes (FIFO)
```
Cada producto puede tener multiples lotes:
- Numero de lote
- Cantidad (cajas + sueltos)
- Fecha de produccion
- Fecha de vencimiento
- Orden FIFO (se usa el mas antiguo primero)
```

### Dashboard
- Estadisticas en tiempo real
- Pedidos del dia
- Stock critico
- Actividad reciente
- Acciones rapidas segun rol

## Instalacion

### Requisitos
- Node.js 18+
- MongoDB 6+
- npm o yarn

### Pasos

1. Clonar el repositorio
```bash
git clone <url-repositorio>
cd ale-bet-manager
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/ale-bet-manager
NEXTAUTH_SECRET=tu-secret-seguro-aqui
NEXTAUTH_URL=http://localhost:3000
```

4. Cargar datos iniciales (opcional)
```bash
# Crear usuario admin
npm run seed:admin

# Cargar productos de ejemplo
npm run seed:productos

# Cargar clientes de ejemplo
npm run seed:clientes
```

5. Iniciar el servidor
```bash
npm run dev
```

6. Acceder a la aplicacion
```
http://localhost:3000
```

## Scripts Disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para produccion |
| `npm run start` | Inicia servidor de produccion |
| `npm run lint` | Ejecuta linter |
| `npm run seed:admin` | Crea usuario administrador |
| `npm run seed:productos` | Carga productos de prueba |
| `npm run seed:clientes` | Carga clientes de prueba |
| `npm run seed:productos:reales` | Carga productos reales del laboratorio |

## Modelos de Datos

### Usuario
```typescript
{
  nombre: string
  email: string (unico)
  password: string (encriptada)
  rol: 'admin' | 'vendedor' | 'armador'
  activo: boolean
}
```

### Producto
```typescript
{
  nombre: string           // Ej: "OLIVITASAN"
  variante: string | null  // Ej: "FORTE"
  presentacion: string     // Ej: "500ML"
  codigoSKU: string
  stockTotal: {
    cajas: number
    sueltos: number
    unidadesPorCaja: number
    totalUnidades: number
  }
  lotes: Lote[]
  stockMinimo: number
}
```

### Pedido
```typescript
{
  numeroPedido: string     // Ej: "PED-2025-001"
  cliente: {
    nombre: string
    direccion: { calle, numero, localidad }
  }
  productos: ProductoPedido[]
  estado: 'pendiente' | 'en_preparacion' | 'aprobado' | 'listo' | 'cancelado'
  creadoPor: Usuario
  armadoPor: Usuario | null
}
```

### Movimiento de Stock
```typescript
{
  tipo: 'ingreso_lote' | 'egreso_pedido' | 'ajuste_manual'
  producto: Producto
  lote: { numero, cambios }
  motivo: string
  usuario: Usuario
  fecha: Date
}
```

## Flujo de Trabajo

### Vendedor
```
1. Inicia sesion
2. Dashboard → "Nuevo Pedido"
3. Busca/selecciona cliente
4. Agrega productos (con validacion de stock)
5. Envia pedido
6. Pedido queda en estado "Pendiente"
```

### Armador
```
1. Inicia sesion
2. Ve pedidos pendientes
3. Toma un pedido → Estado cambia a "En Preparacion"
4. Sistema asigna lotes automaticamente (FIFO)
5. Prepara fisicamente el pedido
6. Confirma armado → Estado cambia a "Listo"
7. Stock se descuenta automaticamente
```

### Admin
```
- Gestiona usuarios (crear, editar, desactivar)
- Gestiona productos (crear, agregar lotes, ajustar stock)
- Ve reportes y estadisticas
- Accede a todas las funciones del sistema
- Puede cambiar su "contexto" para ver como vendedor o armador
```

## API Endpoints

### Autenticacion
- `POST /api/auth/[...nextauth]` - Login/Logout

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Crear pedido
- `GET /api/pedidos/[id]` - Obtener pedido
- `PATCH /api/pedidos/[id]` - Actualizar pedido
- `POST /api/pedidos/[id]/armar` - Iniciar armado
- `POST /api/pedidos/[id]/listo` - Marcar como listo

### Productos
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `GET /api/productos/[id]` - Obtener producto
- `PATCH /api/productos/[id]` - Actualizar producto
- `POST /api/productos/[id]/lotes` - Agregar lote
- `POST /api/productos/[id]/ajustar-stock` - Ajustar stock

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/buscar` - Buscar clientes

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PATCH /api/usuarios/[id]` - Actualizar usuario

## Caracteristicas Tecnicas

- **TypeScript**: Tipado estatico en todo el proyecto
- **App Router**: Estructura moderna de Next.js
- **Server Components**: Renderizado del lado del servidor
- **API Routes**: Backend serverless integrado
- **Middleware**: Proteccion de rutas por rol
- **FIFO Automatico**: Gestion inteligente de lotes
- **Auditoria**: Registro de todos los movimientos
- **PWA**: Instalable como aplicacion movil
- **Responsive**: Diseno adaptable a moviles y tablets

## Seguridad

- Passwords encriptadas con bcrypt
- Sesiones JWT con NextAuth
- Middleware de autenticacion en rutas protegidas
- Validacion de permisos por rol
- Proteccion CSRF integrada

## Credenciales por Defecto

Despues de ejecutar `npm run seed:admin`:

```
Email: admin@alebet.com
Password: admin123
```

**Importante**: Cambiar estas credenciales en produccion.

## Soporte

Para reportar problemas o solicitar funciones:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

Desarrollado para Ale-Bet Laboratorio Veterinario
