Microservice Student Complaint System

Nama : Fauzan Alfarisi Satya Putra
NIM  : 2410511097

Link video: https://youtu.be/p4UYa7IPETA

Cara Menjalankan:
1. Download submission-v1. Github Project Link: https://github.com/FauzanAlfarisi001/utspplos-b-2410511097

Installasi dasar:
Node.js
PHP
Composer
MySQL

2. Instalasi:

cd utspplos-b-2410511097

mysql -u root -p < database/data.sql

cd services/auth-service && npm install && cd ..

cd complaint-service && composer install && cd ..

cd disposition-service && npm install && cd ..

cd notification-service && npm install && cd ..

cd api-gateway && npm install && cd ..

# Root 
npm install

# Jalankan Service :

# Semua service (package.json root)
npm run dev


Peta Endpoint:

# Auth Service
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
GET /api/auth/github
GET /api/auth/me
GET /api/auth/logout

# Complaint Service
GET /api/complaints?page=1&per_page=3
GET /api/complaints?page=1&per_page=3&status=submitted
GET /api/complaints?page=1&per_page=3&priority=high
GET http://localhost:3000/api/complaints?page=1&per_page=3&type=non-akademik
GET /api/complaints?page=1&per_page=3&user_id=4
GET /api/complaints?page=1&per_page=3&search=wifi
GET /api/complaints?page=1&per_page=3&status=submitted&type=akademik&priority=high
GET /api/complaints/1
GET /api/complaints/1/responses
POST /api/complaints
POST /api/complaints/1/responses
PUT /api/complaints/1
PUT /api/complaints/1/status
DELETE /api/complaints/3

# Categories
GET /api/categories
GET /api/categories?type=non-akademik
POST /api/categories

# Disposition Service
GET /api/dispositions/2
GET /api/dispositions?page=1&per_page=3
GET /api/dispositions?page=1&per_page=3&status=pending
GET /api/dispositions?complaint_id=1
GET /api/dispositions?to_unit_id=1
GET /api/dispositions/units
POST /api/dispositions
POST /api/dispositions/units
PATCH /api/dispositions/1/status
DELETE /api/dispositions/2

# Notification Service
GET /api/notifications?page=1&per_page=3
GET /api/notifications/ratings/stats
PATCH /api/notifications/1/read
PATCH /api/notifications/read-all
POST /api/notifications/ratings
GET /api/notifications/ratings/complaint/3
