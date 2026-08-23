# VeriScreen Frontend

Standalone React + Vite app for **VeriScreen**, a digital academic document verification and HELSB exchange platform. It runs **without a backend**. All data comes from a mock API (`src/api/`) and fake records (`src/data/`).

## Run

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Demo accounts

Password for every account: `password123`

| Role | Username |
| --- | --- |
| Student (full records, can apply to HELSB) | `2021465934` |
| Student (already submitted to HELSB) | `2022030346` |
| Student (empty documents) | `2023001122` |
| HELSB student (pay fee / bank details) | `helsb.nosiku` |
| HELSB student (contract ready) | `helsb.banda` |
| HELSB officer | `officer` |
| Administrator | `admin` |

You can also click **Use** on the login page demo table.

## Later: real backend

Keep calling `usersApi.getUsers()`, `authApi.login()`, `documentsApi.getDocuments()`, etc. Replace the function bodies in `src/api/` with `fetch` or Axios. Do not call `localhost` from components.
