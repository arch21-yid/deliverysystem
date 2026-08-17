# 🛒 Supermarket E-Commerce, POS & Delivery Management System (v3.5 Pro)

An enterprise-ready, full-stack application engineered to unify physical point-of-sale (POS) cashier operations, online retail storefronts, real-time inventory synchronization, and multi-stage delivery logistics.

---

## ✨ Key Features & Capabilities

* **🌐 Multi-Language Support (i18n):** Real-time language switching between English and አማርኛ (Amharic) across all UI elements, tabs, forms, and receipt outputs.
* **🎨 Theme Switcher Engine:** Built-in theme toggling supporting Dark Mode, Light Mode, and High-Contrast Mode for various lighting environments.
* **📏 Multi-Unit Measurement System:** Inventory cataloging supports custom measurement units (`pcs`, `kg`, `g`, `L`, `pack`, `box`), properly tracked in stock deduction, unit pricing, and customer receipts.
* **⚡ Hardware Barcode Scanner Listener:** Global event listener detecting physical USB/Bluetooth scanner inputs directly to query items, trigger instant cart additions, and raise toast alerts.
* **🛒 POS Terminal & Checkout:** Interactive cart management, real-time inventory threshold validations, subtotal/tax auto-calculation, and instant print receipt modal generation.
* **📦 Inventory Catalog Management:** Full CRUD operations for stock, barcode assignments, custom pricing, category breakdown, and low-stock indicator thresholds.
* **🚚 Fulfillment Order Tracking:** Real-time lifecycle state updates (`PENDING` ➔ `PREPARING` ➔ `DISPATCHED` ➔ `DELIVERED`).
* **📊 Analytics Dashboard:** Category-wise unit distribution progress visualization, average order value tracking, and real-time revenue metrics.

---

## 🎯 Target Audience & System Purpose

### Who Uses This Application?
* **Store Cashiers / POS Clerks:** To handle walk-in customer checkouts, apply sales tax automatically, and trigger immediate stock deductions.
* **Warehouse & Inventory Managers:** To track stock counts, receive low-inventory warnings, manage SKUs/barcodes, and update catalog pricing.
* **Fulfillment & Delivery Teams:** To monitor incoming orders and update delivery pipelines (`PENDING` ➔ `PREPARING` ➔ `DISPATCHED` ➔ `DELIVERED`).
* **Store Operations:** To maintain live visibility over daily store sales volume, active dispatch counts, and stock availability.

### Primary Purpose
* **Omnichannel Store Management:** Solves inventory fragmentation by serving as a single source of truth for both online delivery requests and in-person store sales.
* **Atomic Inventory Tracking:** Deducts stock atomically on checkout to prevent overselling across fulfillment channels.
* **Logistics Pipeline Visibility:** Ensures real-time order status tracking from cart submission to physical doorstep delivery.

---

## 📐 System Architecture

The application uses a decoupled Client-Server Architecture:

```text
┌─────────────────────────────────────────────────────────┐
│              Next.js / React (Frontend)                 │
│   - Interactive POS Cart & Live Analytics               │
│   - Inventory Management & Order Lifecycle Tracking     │
└────────────────────────────┬────────────────────────────┘
                             │ REST API Requests
                             │ (HTTP Port 8081)
┌────────────────────────────▼────────────────────────────┐
│               Java / Spring Boot (Backend)              │
│   - Controllers, Service Layer, JPA Repositories        │
│   - Business Logic & Transactions                       │
└────────────────────────────┬────────────────────────────┘
                             │ JDBC
┌────────────────────────────▼────────────────────────────┐
│                  PostgreSQL (Database)                  │
│   - Persistent Storage (Products, Orders)               │
└─────────────────────────────────────────────────────────┘
Tech StackFrontend: Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide ReactBackend: Java 17/21, Spring Boot 3.x, Spring Data JPA / Hibernate, Flyway DB, RESTful APIsDatabase: PostgreSQL / MySQL💾 Database SchemaThe backend links to a relational PostgreSQL database managed via Spring Data JPA and Flyway migrations.products TableSQLCREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
orders TableSQLCREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
🛠️ REST API SpecificationBase Endpoint: http://localhost:8081/apiProducts Endpoint (/api/products)MethodEndpointDescriptionGET/api/productsRetrieve complete inventory catalogPOST/api/productsAdd a new product to inventoryPUT/api/products/{id}Update product details / specsDELETE/api/products/{id}Delete product from catalogPOST/api/products/deductDeduct item stock count upon checkoutOrders Endpoint (/api/orders)MethodEndpointDescriptionGET/api/ordersRetrieve all customer and POS ordersPOST/api/ordersCreate a new fulfillment orderPUT/api/orders/{id}/statusTransition order status (PENDING, PREPARING, DISPATCHED, DELIVERED)🚀 Getting StartedPrerequisitesNode.js: v18.x or higherJava SDK: v17 or v21Database: PostgreSQL or MySQL running locally1️⃣ Database SetupCreate the target PostgreSQL database:SQLCREATE DATABASE supermarket_db;
2️⃣ Backend Setup (Spring Boot)Configure src/main/resources/application.properties:Propertiesserver.port=8081
spring.datasource.url=jdbc:postgresql://localhost:5432/supermarket_db
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
Start the Spring Boot backend:Bash./mvnw spring-boot:run
Backend server will start at http://localhost:80813️⃣ Frontend Setup (Next.js)Navigate to the frontend directory and install dependencies:Bashcd deliverysystem-frontend
npm install
Launch the development server:Bashnpm run dev
Open http://localhost:3000 in your browser to view the application.📄 LicenseThis project is open-source and distributed under the MIT License. See LICENSE for details.