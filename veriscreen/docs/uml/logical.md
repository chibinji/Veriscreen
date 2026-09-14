# UML (logical)

```
Student ||--o{ IssuedDocument : generates
Student ||--o{ HelsbApplication : submits
HelsbApplication }o--|| LoanApplication : forwarded as
LoanApplication ||--o{ ApplicationReview : reviewed by
HelsbOfficer ||--o{ ApplicationReview : writes
StudentRecord ||--o{ Registration
StudentRecord ||--o{ AcademicResult
StudentRecord ||--o{ Examination
StudentRecord ||--o{ Payment
```

VeriScreen does not write into `sis_db`. HELSB officers do not write student academic tables.
