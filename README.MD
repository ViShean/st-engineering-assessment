# Technical Assessment Submission

## Setup & Run

### 1. Clone the repository

```bash
git clone https://github.com/ViShean/st-engineering-assessment.git
cd st-engineering-assessment
```

### 2. Create environment file

Create a `.env` file in the root directory:

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=comments_db
```

### 3. Run the application

```bash
docker compose up --build
```

### 4. Access the application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

## Running Tests

```bash
docker compose --profile test run --rm backend-test
```

## Stopping the Application

```bash
docker compose down
```
