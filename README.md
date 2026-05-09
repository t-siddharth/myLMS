# myLMS
Neuro Cognitive Aware Personalized LMS

## Local Postgres

This project includes a local Postgres setup for the Learner Intelligence System V1 ERD.

Start the database:

```bash
docker compose up -d
```

Connection details:

```text
Host: localhost
Port: 5432
Database: mylms
User: mylms
Password: mylms_dev_password
DATABASE_URL=postgresql://mylms:mylms_dev_password@localhost:5432/mylms
```

The schema is initialized from `db/init/001_schema.sql` the first time the Docker volume is created. It includes:

- `user_layer`
- `instructor_layer`
- `admin_layer`
- `data_layer`
- `output_llm_layer`
