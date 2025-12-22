# Test Folder Structure

```bash
credis-frontend/
├── app/
├── assets/
├── components/
├── constants/
├── contexts/
├── hooks/
├── lib/
├── types/
├── tests/
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── api.test.ts
│   │   │   ├── validators.test.ts
│   │   │   ├── formatters.test.ts
│   │   │   └── calculations.test.ts
│   │   ├── hooks/
│   │   │   ├── useCreditBalance.test.ts
│   │   │   ├── useUserAuth.test.ts
│   │   │   └── useCustomerList.test.ts
│   │   ├── contexts/
│   │   │   ├── AuthContext.test.ts
│   │   │   └── CreditContext.test.ts
│   │   └── constants/
│   │       └── config.test.ts
│   ├── components/
│   │   ├── CreditCard.test.tsx
│   │   ├── PaymentForm.test.tsx
│   │   ├── CustomerList.test.tsx
│   │   ├── TransactionHistory.test.tsx
│   │   └── __snapshots__/
│   ├── integration/
│   │   ├── credit-workflow.test.ts
│   │   ├── payment-flow.test.ts
│   │   ├── customer-management.test.ts
│   │   └── auth-flow.test.ts
│   ├── e2e/
│   │   ├── credit-extension.e2e.ts
│   │   ├── payment-recording.e2e.ts
│   │   ├── statement-view.e2e.ts
│   │   └── customer-onboarding.e2e.ts
│   ├── fixtures/
│   │   ├── mock-data.ts
│   │   ├── test-utils.tsx
│   │   ├── factories.ts
│   │   └── mocks/
│   │       ├── api-mocks.ts
│   │       ├── async-storage-mock.ts
│   │       └── navigation-mock.ts
│   ├── setup.ts
│   └── jest.config.js
├── app.json
├── package.json
└── tsconfig.json
```