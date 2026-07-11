Since the ERP is the **brain of the business**, the website backend should only be responsible for **customer interactions**. It should never contain business logic like stock calculations, invoice generation, accounting, or inventory management. Instead, it acts as a bridge between the website frontend and the ERP.

# Website Backend Architecture

```
website-backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── middlewares/
│   ├── routes/
│   ├── models/
│   ├── utils/
│   ├── jobs/
│   ├── emails/
│   ├── sockets/
│   ├── integrations/
│   └── app.js
│
├── uploads/
├── logs/
├── .env
├── package.json
└── server.js

```

---

# 1. Configuration Module

Responsible for loading everything the system needs.

```
config/

database.js
mailer.js
jwt.js
erpApi.js
redis.js
cloudinary.js

```

Example

```
ERP_URL=https://erp.company.com
ERP_API_KEY=xxxxxxxx
JWT_SECRET=xxxxxxxx
EMAIL_USER=info@company.com

```

---

# 2. Authentication Module

This controls customer accounts.

### Responsibilities

- Register customer
- Login
- Logout
- Refresh Token
- Change Password
- Forgot Password
- Email Verification
- JWT Authentication

Routes

```
POST /register

POST /login

POST /logout

POST /forgot-password

POST /reset-password

POST /verify-email

GET /profile

```

Database

```
Users

id
erpClientId
name
email
phone
passwordHash
emailVerified
status
lastLogin
createdAt

```

---

# 3. Customer Module

Responsible for customer profile management.

```
GET /profile

PUT /profile

PUT /change-password

DELETE /account

```

Profile fields

```
Company

Phone

Email

Country

Address

PIN Number

Profile Photo

```

Only basic information is stored locally.

---

# 4. ERP Integration Module

This is the most important module.

Every communication with the ERP goes through here.

```
services/

erp.service.js

```

Functions

```
getProducts()

createClient()

createQuotation()

getQuotation()

getInvoices()

downloadInvoice()

requestInvoice()

getOrders()

trackOrder()

```

No controller should call the ERP directly.

Everything goes through this service.

---

# 5. Products Module

The website never stores products permanently.

Instead

```
Customer

↓

GET /products

↓

Website Backend

↓

ERP API

↓

Website

↓

Customer

```

You may cache products for a few minutes.

Example

```
Redis Cache

5 minutes

```

This reduces ERP traffic.

---

# 6. Quote Module

Handles quotation requests.

Routes

```
GET /quotes

GET /quotes/:id

POST /quotes

DELETE /quotes/:id

```

Workflow

```
Customer

↓

Select Products

↓

Website Backend

↓

ERP

↓

Quotation Created

↓

Save quotationId

↓

Return quotation

```

Website Table

```
QuoteRequests

id

quotationId

userId

status

createdAt

```

Only references are stored.

---

# 7. Invoice Module

Routes

```
GET /invoices

GET /invoice/:id

POST /request-invoice

```

Workflow

```
Customer

↓

Clicks Request Invoice

↓

ERP

↓

Invoice Generated

↓

PDF Download

```

---

# 8. Orders Module

After payment

```
GET /orders

GET /orders/:id

GET /orders/:id/tracking

```

Example Status

```
Pending

Processing

Packed

Dispatched

Delivered

```

---

# 9. Notifications Module

Stores notifications for logged-in users.

Table

```
Notifications

id

userId

title

message

read

createdAt

```

Examples

```
Quotation Approved

Invoice Ready

Payment Received

Order Shipped

```

---

# 10. Email Module

Responsible for sending emails.

Templates

```
Welcome Email

Password Reset

Quotation Created

Invoice Ready

Order Delivered

Verification Email

```

Example Folder

```
emails/

welcome.html

invoice.html

quotation.html

resetPassword.html

```

---

# 11. Session Module

Keeps users logged in.

Database

```
Sessions

id

userId

refreshToken

expiresAt

device

ipAddress

```

Customer remains logged in for

```
30 days

```

using Refresh Tokens.

---

# 12. Dashboard Module

Collects everything from ERP.

```
Dashboard

↓

ERP

↓

Quotes

Invoices

Orders

Notifications

↓

Frontend

```

Instead of making six frontend requests, make one.

```
GET /dashboard

```

Backend internally fetches

```
Quotes

Invoices

Orders

Notifications

```

Returns

```
{
quotes:[],
orders:[],
invoices:[],
notifications:[]
}

```

Much faster.

---

# 13. File Module

Downloads ERP documents.

Examples

```
Invoice PDF

Quotation PDF

Receipt

Delivery Note

Warranty

```

Routes

```
GET /download/invoice/:id

GET /download/quotation/:id

```

---

# 14. Support Module

Customers can communicate with the company.

```
POST /support

GET /support

POST /reply

```

Stores tickets locally.

---

# 15. Activity Module

Tracks customer activity.

```
Logged In

Downloaded Invoice

Created Quote

Updated Profile

Requested Invoice

```

Useful for analytics.

---

# 16. Admin Integration Module

The website administrator can manage only website content.

Examples

```
Homepage Banner

Blogs

FAQs

Testimonials

Careers

Contact Messages

SEO Settings

```

These are independent of the ERP.

---

# Database Design

```
Users
│
├── Sessions
│
├── Notifications
│
├── QuoteRequests
│
├── SupportTickets
│
├── ActivityLogs
│
├── PasswordResets
│
└── EmailVerification

```

The ERP database contains the operational data:

```
ERP

Customers

Products

Stock

Quotations

Invoices

Orders

Payments

Accounting

```

The only link between the two systems is:

```
Users.erpClientId
            │
            ▼
ERP.Client.id

```

---

# Authentication Flow

```
Customer Visits Website
        │
        ▼
Request Quote
        │
        ▼
Does Email Exist?
        │
 ┌──────┴────────┐
 │               │
Yes             No
 │               │
Login        Create Website Account
 │               │
 │        Generate Password
 │               │
 │        Send Welcome Email
 │               │
 └──────┬────────┘
        ▼
Create/Retrieve ERP Client
        │
        ▼
Create Quotation in ERP
        │
        ▼
Save ERP IDs Locally
        │
        ▼
Generate JWT + Refresh Token
        │
        ▼
Customer Dashboard

```

## Recommended Technology Stack

For consistency with your ERP, I recommend:

- **Framework:** Node.js + Express.js (or NestJS if you want a more scalable architecture)
- **Database:** MongoDB (same as ERP) or PostgreSQL if you prefer relational data for website users
- **Authentication:** JWT + Refresh Tokens stored in HTTP-only cookies
- **Password Hashing:** bcrypt
- **Email Service:** Nodemailer with SMTP (or SendGrid/Brevo for production)
- **Caching:** Redis for products, dashboard data, and sessions
- **Queue:** BullMQ (Redis-backed) for sending emails and background synchronization
- **Validation:** Zod or Joi
- **Logging:** Winston or Pino
- **API Communication:** Axios with retry logic and centralized ERP service layer

This separation ensures the website remains lightweight and responsive while the ERP stays the single source of truth for all business-critical data. As you add more websites for different tenants, each website backend can follow this same structure and securely communicate with the ERP through its API Gateway.