# NestTestTask - SaaS Subscription Platform Backend

Backend для SaaS платформи з підтримкою автентифікації, тарифікації та системи знижок.

## Технології

- **NestJS** - Node.js framework
- **PostgreSQL** - База даних
- **Prisma v6** - ORM
- **JWT** - Автентифікація
- **Swagger** - API документація
- **Docker** - Контейнеризація бази даних

## Встановлення

```bash
# Встановити залежності
npm install

# Налаштувати змінні оточення
cp .env.example .env
# Відредагувати .env з правильним DATABASE_URL та JWT_SECRET
```

## Запуск бази даних через Docker

### Встановлення Docker

Якщо Docker не встановлений, завантажте та встановіть [Docker Desktop](https://www.docker.com/products/docker-desktop/) для Windows.

### Запуск PostgreSQL

```bash
# Запустити PostgreSQL в Docker
npm run docker:up

# Перевірити логи (опціонально)
npm run docker:logs

# Зупинити контейнер
npm run docker:down

# Повністю очистити та перезапустити (видаляє всі дані)
npm run docker:reset
```

Або вручну:
```bash
docker compose up -d
```

**Примітка:** 
- Якщо використовується стара версія Docker, може знадобитися `docker-compose` замість `docker compose`. У новіших версіях Docker Desktop використовується синтаксис без дефісу.
- Якщо Docker не встановлений, можна використовувати локальну установку PostgreSQL. Просто налаштуйте `DATABASE_URL` в `.env` файлі на ваш локальний PostgreSQL.

## Налаштування бази даних

```bash
# Створити міграції
npm run prisma:migrate

# Запустити seed (створює тестові плани, промокоди та адміна)
npm run db:seed
```

**Примітка:** Переконайтеся, що Docker контейнер з PostgreSQL запущений перед виконанням міграцій!

## Запуск

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## API Документація

Після запуску сервера, Swagger UI доступний за адресою:
- http://localhost:3000/api/docs

## Гайд для тестування

### Крок 1: Отримати список планів

**Swagger:** `GET /plans`

**cURL:**
```bash
curl http://localhost:3000/plans
```

**Очікуваний результат:** Список з 3 планами (Starter, Professional, Enterprise). Збережіть `id` одного з планів для наступних кроків.

---

### Крок 2: Реєстрація користувача

**Swagger:** `POST /auth/register`

**Body:**
```json
{
  "email": "user1@example.com",
  "password": "password123",
  "region": "UA"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"password123","region":"UA"}'
```

**Очікуваний результат:**
```json
{
  "user": {
    "id": "...",
    "email": "user1@example.com",
    "region": "UA",
    "role": "USER"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Збережіть `accessToken` для наступних запитів!**

---

### Крок 3: Вхід (альтернатива реєстрації)

**Swagger:** `POST /auth/login`

**Body:**
```json
{
  "email": "user1@example.com",
  "password": "password123"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"password123"}'
```

---

### Крок 4: Розрахунок ціни

**Swagger:** `POST /pricing/calculate`

**Body:**
```json
{
  "planId": "<ID_ПЛАНУ_З_КРОКУ_1>",
  "billingPeriod": "ANNUAL",
  "seats": 3,
  "promoCode": "WELCOME10"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "<ID_ПЛАНУ>",
    "billingPeriod": "ANNUAL",
    "seats": 3,
    "promoCode": "WELCOME10"
  }'
```

**Очікуваний результат:**
```json
{
  "currency": "USD",
  "plan": { "id": "...", "code": "professional", "name": "Professional", "includedApiCalls": 10000 },
  "billingPeriod": "ANNUAL",
  "seats": 3,
  "subtotalMicros": 5396400000,
  "discountMicros": 1079280000,
  "totalMicros": 4317120000,
  "appliedDiscounts": [
    { "type": "ANNUAL_17_PERCENT", "amountMicros": 917388000 },
    { "type": "PROMO", "amountMicros": 161892000, "details": { "code": "WELCOME10" } }
  ]
}
```

**Примітка:** Знижки застосовуються послідовно: спочатку 17% за річну підписку, потім промокод.

---

### Крок 5: Оформити підписку

**Swagger:** 
1. Натисніть кнопку **"Authorize"** (🔒) у верхній частині Swagger UI
2. Введіть: `Bearer <ВАШ_ACCESS_TOKEN>`
3. Натисніть **"Authorize"** та закрийте вікно
4. Виконайте `POST /subscriptions`

**Body:**
```json
{
  "planId": "<ID_ПЛАНУ_З_КРОКУ_1>",
  "billingPeriod": "ANNUAL",
  "seats": 3,
  "promoCode": "WELCOME10"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ВАШ_ACCESS_TOKEN>" \
  -d '{
    "planId": "<ID_ПЛАНУ>",
    "billingPeriod": "ANNUAL",
    "seats": 3,
    "promoCode": "WELCOME10"
  }'
```

**Очікуваний результат:**
```json
{
  "subscription": {
    "id": "...",
    "userId": "...",
    "planId": "...",
    "billingPeriod": "ANNUAL",
    "seats": 3,
    "status": "ACTIVE",
    "subtotalMicros": 5396400000,
    "discountMicros": 1079280000,
    "totalMicros": 4317120000,
    "provider": "MONOBANK",
    "currentPeriodStart": "2026-01-28T...",
    "currentPeriodEnd": "2027-01-28T...",
    "plan": { ... },
    "promoCode": { "code": "WELCOME10", ... },
    "payments": [
      {
        "id": "...",
        "provider": "MONOBANK",
        "status": "SUCCEEDED",
        "amountMicros": 4317120000,
        "providerRef": "mono_..."
      }
    ]
  },
  "payment": { ... }
}
```

**Примітка:** `provider` автоматично вибирається на основі `region` користувача:
- **UA** → `MONOBANK`
- **BR** → `PIX`
- **Інші** → `STRIPE`

---

### Крок 6: Перевірити підписки

**Swagger:** `GET /subscriptions` (з авторизацією)

**cURL:**
```bash
curl http://localhost:3000/subscriptions \
  -H "Authorization: Bearer <ВАШ_ACCESS_TOKEN>"
```

**Очікуваний результат:** Список всіх підписок користувача з деталями планів та платежів.

---

### Додаткові тести

#### Тест з різними регіонами

**UA користувач:**
```json
POST /auth/register
{ "email": "ua@example.com", "password": "pass123", "region": "UA" }
→ Підписка використає MONOBANK
```

**BR користувач:**
```json
POST /auth/register
{ "email": "br@example.com", "password": "pass123", "region": "BR" }
→ Підписка використає PIX
```

**Інший регіон:**
```json
POST /auth/register
{ "email": "other@example.com", "password": "pass123", "region": "OTHER" }
→ Підписка використає STRIPE
```

#### Тест промокодів

**Валідація промокоду:**
```bash
GET /promo-codes/validate?code=WELCOME10
→ { "valid": true, "promo": { ... } }
```

**Тест з фіксованою знижкою:**
```json
POST /pricing/calculate
{
  "planId": "...",
  "billingPeriod": "MONTHLY",
  "seats": 1,
  "promoCode": "SAVE5"
}
→ Знижка $5 (5000000 micros)
```

#### Тест адмін-функцій

**Вхід як адмін:**
```json
POST /auth/login
{ "email": "admin@example.com", "password": "admin12345" }
```

**Створення нового плану (тільки ADMIN):**
```json
POST /plans
Authorization: Bearer <ADMIN_TOKEN>
{
  "code": "premium",
  "name": "Premium",
  "basePriceMicros": 199990000,
  "pricePerSeatMicros": 20000000,
  "includedApiCalls": 50000
}
```

---

## User Flow

1. **Register** → `POST /auth/register`
   - Реєстрація з email, password та region (UA/BR/OTHER)

2. **Login** → `POST /auth/login`
   - Отримання JWT токену

3. **Calculate Price** → `POST /pricing/calculate`
   - Розрахунок ціни з урахуванням плану, кількості місць, періоду оплати та промокоду

4. **Subscribe** → `POST /subscriptions` (потребує авторизації)
   - Оформлення підписки з автоматичним вибором payment provider залежно від region

## API Endpoints

### Auth
- `POST /auth/register` - Реєстрація
- `POST /auth/login` - Вхід

### Plans
- `GET /plans` - Список планів (публічний)
- `GET /plans/:id` - Отримати план
- `POST /plans` - Створити план (тільки ADMIN)
- `PATCH /plans/:id` - Оновити план (тільки ADMIN)
- `DELETE /plans/:id` - Видалити план (тільки ADMIN)

### Promo Codes
- `GET /promo-codes` - Список промокодів
- `GET /promo-codes/validate?code=XXX` - Валідація промокоду
- `POST /promo-codes` - Створити промокод (тільки ADMIN)
- `PATCH /promo-codes/:id` - Оновити промокод (тільки ADMIN)
- `DELETE /promo-codes/:id` - Видалити промокод (тільки ADMIN)

### Pricing
- `POST /pricing/calculate` - Розрахунок ціни

### Subscriptions
- `GET /subscriptions` - Мої підписки (потребує авторизації)
- `GET /subscriptions/:id` - Отримати підписку (потребує авторизації)
- `POST /subscriptions` - Оформити підписку (потребує авторизації)

## Система знижок

1. **Річна підписка**: автоматична знижка 17% при `billingPeriod=ANNUAL`
2. **Промокоди**: можуть бути FIXED (фіксована сума) або PERCENT (відсоток)

## Payment Providers

Система автоматично вибирає провайдера на основі region користувача:
- **UA** → Monobank (mock)
- **BR** → PIX (mock)
- **Інші регіони** → Stripe (mock)

## Тестові дані (seed)

### Плани
- **Starter**: $29.99/міс, 1,000 API calls
- **Professional**: $99.49/міс + $15.75/user, 10,000 API calls
- **Enterprise**: $299.90/міс + $12.30/user, 100,000 API calls

### Промокоди
- **WELCOME10**: 10% знижка
- **SAVE5**: $5 знижка

### Тестовий адмін

**Важливо:** Хеш пароля в seed.ts може бути некоректним. Для тестування краще створити адміна через API:

1. Зареєструйте користувача через `POST /auth/register`
2. Вручну оновіть роль в БД:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'ваш@email.com';
   ```
   
   Або через Prisma Studio:
   ```bash
   npm run prisma:studio
   ```

## Структура проекту

```
src/
├── auth/              # Автентифікація та авторизація
├── common/            # Спільні guards, decorators
├── payments/          # Payment providers (mock)
├── plans/             # CRUD для планів
├── pricing/           # Калькулятор ціни
├── prisma/            # Prisma service
├── promo-codes/       # CRUD для промокодів
└── subscriptions/     # Управління підписками
```

## Docker

Проєкт включає `docker-compose.yml` для легкого запуску PostgreSQL:

- **Порт:** 5432
- **База даних:** nest_test_task
- **Користувач:** postgres
- **Пароль:** postgres

Дані зберігаються в Docker volume `postgres_data` для персистентності.

## Швидкий старт (Checklist)

```bash
# 1. Встановити залежності
npm install

# 2. Налаштувати .env
cp .env.example .env

# 3. Запустити PostgreSQL
npm run docker:up

# 4. Створити міграції
npm run prisma:migrate

# 5. Заповнити тестові дані
npm run db:seed

# 6. Запустити сервер
npm run start:dev

# 7. Відкрити Swagger
# http://localhost:3000/api/docs
```

## Примітки

- Всі ціни зберігаються в мікро-одиницях (micros) для точності
- Payment providers є mock-реалізаціями і завжди повертають успішний результат
- Для production потрібно налаштувати реальні payment providers та змінити JWT_SECRET
- Docker конфігурація використовує PostgreSQL 16 Alpine для мінімального розміру образу
- Для перегляду/редагування даних використовуйте `npm run prisma:studio`
