# Test Folder Structure

```bash
credis/
├── credis-frontend/
│   ├── src/
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── hooks/
│   │   ├── integration/
│   │   │   ├── api-integration/
│   │   │   └── workflows/
│   │   ├── e2e/
│   │   │   ├── auth/
│   │   │   ├── credit-management/
│   │   │   └── reporting/
│   │   └── fixtures/
│   │       ├── mock-data.ts
│   │       └── test-utils.ts
│   └── package.json
│
├── credis-backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── middleware/
│   │   ├── integration/
│   │   │   ├── api-routes/
│   │   │   ├── database/
│   │   │   └── workflows/
│   │   ├── e2e/
│   │   │   ├── credit-operations/
│   │   │   ├── user-management/
│   │   │   └── reporting/
│   │   ├── fixtures/
│   │   │   ├── seed-data.ts
│   │   │   ├── mock-db.ts
│   │   │   └── test-factories.ts
│   │   └── setup.ts
│   └── package.json
```

DATABASE_URL="postgresql://chimi:meopen123@localhost:5432/coc_db"