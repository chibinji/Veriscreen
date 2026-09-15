# VeriScreen mobile app

Expo (React Native) student app for the existing Spring Boot API.

It uses the same endpoints as the web portal:

- `POST /api/v1/auth/login`
- `GET /api/v1/students/me/profile`
- `GET /api/v1/students/me/documents`
- `GET /api/v1/students/me/registrations`
- `GET /api/v1/students/me/fees`
- `GET /api/v1/students/me/examinations`
- `GET /api/v1/students/me/academic-results`
- `GET /api/v1/students/me/helsb`

Officer, admin, register, and HELSB-student flows are not included because the backend does not provide those APIs.

## Run

1. Start PostgreSQL and the backend (`cd backend && mvnw.cmd spring-boot:run`).
2. In another terminal:

```bash
cd mobile
npm install
npx expo start
```

3. Scan the QR code with **Expo Go** on your phone (same Wi-Fi as the PC), or press `a` for an Android emulator.

## Connecting to the backend

The app talks to port **8080**. A phone cannot use `localhost` — that would mean the phone itself.

By default the app uses the same IP address Expo shows for Metro, plus port 8080. That usually works on a physical device.

| Where the app runs | API URL |
|---|---|
| Android emulator | `http://10.0.2.2:8080` |
| iOS simulator | `http://localhost:8080` |
| Physical phone | `http://YOUR_PC_LAN_IP:8080` |

To force a URL, copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`.

## Demo logins

Password for all seeded students: `password123`

| Student ID | Name |
|---|---|
| `2021465934` | Samuel Chibinji Mwanza |
| `2022030346` | Nosiku Mukuka |
| `2020123456` | Grace Banda |
| `2019876543` | Peter Zulu |
