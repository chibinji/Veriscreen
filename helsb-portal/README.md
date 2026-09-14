# HELSB Officer Portal

Separate HELSB staff system. It does not share the student VeriScreen UI.

- Backend: Spring Boot on port **8083**, database `helsb_db`
- Frontend: React on port **5174**

Officer login uses an institutional email, for example:

- `mwaka.chanda@helsb.zm` / `password123`
- `chanda.phiri@helsb.zm` / `password123`

The dashboard lists universities. Open a university to see its schools. Each school has **View applications** (new applications and a total count) and **Screening** (programmes with the number of students on a loan). Screening is implemented in detail for the University of Zambia.

Inbound applications arrive from VeriScreen with `X-API-Key`.
