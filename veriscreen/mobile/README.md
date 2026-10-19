# VeriScreen mobile app

Expo student app for the Node.js student API on port 8081. It uses the same sign-in, records, documents, and HELSB tracker as the website.

## Run

1. Start the student API (`veriscreen/server`, port 8081).
2. In another terminal:

```bash
cd veriscreen/mobile
npm install
npx expo start --port 8085
```

Metro uses port 8085 because the student API already uses 8081.

3. Install Expo Go on the phone, join the same Wi-Fi, and scan the QR code Expo prints.

The API address is `EXPO_PUBLIC_API_URL` in `.env`. A phone cannot use `localhost`.

## Demo logins

Password for every student: `password123`

| Computer number | Name |
|---|---|
| `2021465934` | Samuel Chibinji Mwanza |
| `2022030346` | Nosiku Mukuka |
| `2020123456` | Grace Banda |
| `2019876543` | Peter Zulu |
