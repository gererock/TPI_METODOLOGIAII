# 🎨 BodyPaint

Plataforma web de venta de productos de pintura, desarrollada como Trabajo Práctico Integrador de **Metodología de Sistemas II**. Permite a un **Cliente** registrarse, explorar el catálogo, armar un carrito y generar pedidos con cupones de descuento; a un **Vendedor** gestionar los pedidos, ver clientes, emitir cupones y generar reportes de ventas; y a un **Administrador** dar de alta productos y monitorear el stock.

![Backend](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JS%20Vanilla-blue)
![DB](https://img.shields.io/badge/DB-PostgreSQL-336791)
![Licencia](https://img.shields.io/badge/licencia-sin%20definir-lightgrey)

📸 *Pendiente: screenshots del catálogo, checkout y paneles de vendedor/admin.*

---

## Índice

- [Stack tecnológico](#stack-tecnológico)
- [Roles y flujo general](#roles-y-flujo-general)
- [Reglas de negocio destacadas](#reglas-de-negocio-destacadas)
- [Endpoints principales](#endpoints-principales)
- [Instalación y configuración](#instalación-y-configuración)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Notas](#notas)

---

## Stack tecnológico

**Backend**
- Java 21
- Spring Boot 4.0.6 (Spring Web MVC, Spring Data JPA / Hibernate, Spring Validation)
- Spring Security Crypto (hash de contraseñas con `BCryptPasswordEncoder`, solo para clientes)
- PostgreSQL como base de datos (driver `org.postgresql`), alojada en Render
- `spring-dotenv` para cargar variables desde un archivo `.env`
- Maven (con wrapper `mvnw` / `mvnw.cmd`)
- Lombok

**Frontend**
- HTML5 + CSS3 + JavaScript nativo (sin frameworks ni build step)
- Consume la API vía `fetch`, apuntando a `http://localhost:8081`

## Roles y flujo general

| Rol | Cómo ingresa | Qué puede hacer |
|---|---|---|
| **Cliente** | Se registra (`/api/clientes/register`) y luego inicia sesión con email/password contra la base | Ver catálogo, armar carrito, aplicar cupón, generar pedido |
| **Vendedor** | Login contra credenciales fijas configuradas por variables de entorno (no valida contra tabla `vendedores`) | Ver pedidos y cambiar su estado, listar clientes, generar cupones, generar reporte de productos más vendidos |
| **Administrador** | Login contra credenciales fijas configuradas por variables de entorno | Dar de alta productos, ver reporte de stock mínimo |

El login (`/frontend/js/LoginClienteApi.js`) es un único formulario: si el email ingresado coincide con el email de admin o de vendedor (comparado en el propio frontend), redirige a ese flujo; en cualquier otro caso intenta loguear como cliente contra la base de datos.

## Reglas de negocio destacadas

- **Stock automático al generar un pedido**: `ActualizarStock` descuenta la cantidad pedida de cada producto y, si llega a 0, marca `sinStock = true`. Si no hay stock suficiente, rechaza la operación.
- **Reposición de stock al cancelar**: `CancelarPedido` devuelve al stock las unidades del pedido cancelado y quita la marca `sinStock` si corresponde. Cancelar un pedido **requiere** indicar un `motivoCancelacion`.
- **Estados de pedido**: `EN_PROCESO`, `CANCELADO`, `ENTREGADO`. Un pedido `ENTREGADO` o `CANCELADO` no puede volver a cambiar de estado.
- **Cupones de descuento** (`CuponDescuentoService`):
  - Se generan para un cliente puntual, con vigencia (`fechaDesde`/`fechaHasta`, formato `dd/MM/yyyy`) y un tipo: `PORCENTAJE` (no puede superar 100) o `MONTO_FIJO`.
  - El código se genera como `100000 + id` del cupón.
  - Al aplicarlo se valida que pertenezca al cliente indicado, que no esté usado y que esté dentro de su vigencia; el descuento no puede ser mayor o igual al total del pedido.
  - Se aplica en un paso separado (`/aplicar`) del marcado como usado (`/usar` — `PATCH`), lo que permite simular el cupón antes de confirmarlo en el checkout.
- **Reporte de stock mínimo**: un producto se considera "cerca del mínimo" si su stock actual es ≤ `stockMinimo + 20%`. Se clasifica en `Sin stock`, `Por debajo del mínimo`, `Stock mínimo alcanzado` o `Cerca del mínimo`.
- **Reporte de productos más vendidos**: agrega las cantidades vendidas por producto para un mes/año dado, **excluyendo pedidos cancelados**; no admite filtrar por día (aunque el parámetro `dia` existe en el endpoint, siempre lanza error si se envía).
- **Validación de productos duplicados**: no se puede crear un producto con el mismo nombre **y** marca que uno ya existente.

## Endpoints principales

Todos los endpoints devuelven un `BaseResponse` (`data`, `message`, `errors`, `timestamp`) salvo el reporte de productos más vendidos, que devuelve la lista directamente.

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/clientes/register` | Registro de cliente |
| `POST` | `/api/clientes/login` | Login de cliente (contra base de datos, password hasheada) |
| `GET` | `/api/clientes` | Listado de clientes (usado por el panel de vendedor) |
| `POST` | `/api/admin/login` | Login de administrador (credenciales fijas por variables de entorno) |
| `POST` | `/api/vendedor/login` | Login de vendedor (credenciales fijas por variables de entorno) |
| `GET` | `/api/productos?page=&size=` | Catálogo paginado (tamaño de página por defecto: 8) |
| `POST` | `/api/productos` | Alta de producto |
| `GET` | `/api/productos/reporte-stock-minimo` | Reporte de productos cerca del stock mínimo |
| `POST` | `/api/pedidos/generar` | Genera un pedido y descuenta stock |
| `GET` | `/api/pedidos` | Lista todos los pedidos |
| `GET` | `/api/pedidos/{id}` | Pedido por id |
| `PATCH` | `/api/pedidos/{id}/estado` | Cambia el estado de un pedido (`estado`, `motivoCancelacion` si aplica) |
| `POST` | `/api/cupones` | Genera un cupón para un cliente |
| `POST` | `/api/cupones/aplicar` | Simula la aplicación de un cupón sobre un total |
| `PATCH` | `/api/cupones/usar` | Marca un cupón como usado |
| `GET` | `/api/reportes/productos-mas-vendidos?mes=&anio=` | Reporte de productos más vendidos del mes/año |

Todos los controllers tienen `@CrossOrigin(origins = "*")`.

## Instalación y configuración

### Backend

El backend lee la configuración desde variables de entorno (vía `spring-dotenv`), buscando un archivo `.env` en la raíz del repo o en `backend/.env`. Copiá `backend/.env.example` a `backend/.env` y completá los valores reales:

```env
DB_URL=jdbc:postgresql://<host>:5432/<database>?sslmode=require
DB_USERNAME=<usuario>
DB_PASSWORD=<password>
DDL_AUTO=update

ADMIN_EMAIL=<email del administrador>
ADMIN_PASSWORD=<password del administrador>

VENDEDOR_EMAIL=<email del vendedor>
VENDEDOR_PASSWORD=<password del vendedor>
```

`backend/src/main/resources/application.properties` ya está preparado para tomar estos valores; solo se necesita el `.env`. El servidor corre en el puerto **8081** (`server.port=8081`).

> El proyecto trae dependencia de H2 (`spring-boot-h2console`) pero está deshabilitada (`spring.h2.console.enabled=false`); la persistencia real es PostgreSQL.

### Frontend

No requiere instalación ni build. Es HTML/CSS/JS estático que debe servirse desde algún servidor de archivos (Live Server de VS Code, `python -m http.server`, etc.) apuntando a la raíz del repo, ya que las páginas referencian rutas absolutas como `/frontend/pages/...` y `/frontend/js/...`. La URL del backend está hardcodeada como `http://localhost:8081` en cada archivo JS del frontend.

## Cómo correr el proyecto

### Backend

Desde `backend/`:

```bash
# Linux / macOS
./mvnw spring-boot:run
```

```powershell
# Windows
.\mvnw.cmd spring-boot:run
```

O compilar y ejecutar el jar:

```bash
./mvnw clean package
java -jar target/bodypanit-0.0.1-SNAPSHOT.jar
```

### Frontend

Servir la carpeta raíz del repositorio con cualquier servidor estático y abrir `frontend/index.html`, por ejemplo:

```bash
python -m http.server 5500
```

y navegar a `http://localhost:5500/frontend/index.html`.

## Estructura de carpetas

```
TPI_METODOLOGIAII/
├── pom.xml                    # POM raíz (agregador, solo referencia al módulo backend)
├── backend/
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   └── src/
│       ├── main/java/com/bodypaint/
│       │   ├── BodypanitApplication.java
│       │   └── feature/
│       │       ├── Config/            # BaseResponse, manejo global de excepciones, encoder, excepciones custom
│       │       ├── controllers/       # AdminController, ClienteController, CuponDescuentoController,
│       │       │                      # PedidoController, ProductoCreateController, ProductoGetController,
│       │       │                      # ReporteController, VendedorLoginController
│       │       ├── dto/{request,response}/
│       │       ├── mapper/
│       │       ├── models/            # Cliente, Vendedor, Producto, Pedido, CuponDescuento, EstadoPedido, TipoDescuento
│       │       ├── repository/
│       │       ├── services/{impl,interfaces}/
│       │       └── utils/             # ActualizarStock, CancelarPedido, BuscarProductoPorPedido
│       └── test/java/com/bodypaint/   # BodypanitApplicationTests (contextLoads)
└── frontend/
    ├── index.html
    ├── css/
    ├── js/
    ├── fonts/
    └── pages/                  # Admin, LoginCliente, RegistrarCliente, CatalogoCliente,
                                 # CarritoCliente, CheckoutCliente, Cliente, VendedorPedidos
```
