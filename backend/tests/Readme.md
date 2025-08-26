# 🔄 Automated API Testing Pipeline (via Swagger)

This project ensures **automatic API endpoints validation** on every commit using **Swagger/OpenAPI
specs** and **Jest/SuperTest**.

## ⚙️ Flow of Testing

When a new commit is pushed to the repository:

Commit is pushed to GitHub  
⬇  
GitHub Actions workflow is triggered  
⬇  
`swagger.json` is loaded into an **in-memory MongoDB instance (MongoMemoryServer)**  
⬇  
API test cases are **generated automatically** from the Swagger documentation  
⬇  
Requests are executed against the running API service  
⬇  
Responses are validated against the **Swagger schema definitions** via **jest-openapi** ⬇  
If all validations pass → ✅ CI pipeline succeeds  
⬇  
If any validation fails → ❌ CI pipeline fails and reports the mismatched request/response details

---

## 🚀 Why this Flow?

- **Swagger-driven** → No need to manually write repetitive tests.
- **MongoMemoryServer** → Provides isolated test DB, ensuring no pollution of real data.
- **Continuous Validation** → Every commit ensures APIs stay compliant with the defined Swagger
  spec.

---

✅ This keeps the backend **always aligned with API contracts**, boosting reliability & confidence
in deployments.
