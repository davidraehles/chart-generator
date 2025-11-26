# Email Capture Database Integration

## Overview

This document describes the email capture database integration for the Human Design Chart Generator backend.

## Architecture

The implementation follows a layered architecture:

1. **Database Model** (`src/models/lead_email_db.py`)
   - SQLAlchemy ORM model for lead emails
   - Supports soft-delete pattern
   - Tracks metadata (IP, user agent, timestamps)

2. **Service Layer** (`src/services/email_service.py`)
   - Database operations (save, check duplicates, soft delete)
   - Case-insensitive duplicate checking
   - Handles data normalization

3. **Handler Layer** (`src/handlers/email_handler.py`)
   - Business logic coordination
   - Validation and error handling
   - Response formatting

4. **API Endpoint** (`src/main.py`)
   - FastAPI route: `POST /api/email-capture`
   - Request/response models from `src/models/email.py`
   - Error handling (400, 409, 500)

## Database Schema

### Table: `lead_emails`

| Column        | Type         | Constraints           | Description                    |
|---------------|--------------|----------------------|--------------------------------|
| id            | UUID         | PRIMARY KEY          | Unique identifier              |
| email         | VARCHAR(255) | NOT NULL, INDEXED    | Email address (lowercase)      |
| status        | VARCHAR(50)  | NOT NULL, DEFAULT    | Status (pending, contacted...)  |
| source        | VARCHAR(100) | NULLABLE             | Lead source identifier         |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT    | Record creation time           |
| updated_at    | TIMESTAMP    | NOT NULL, AUTO       | Last update time               |
| deleted_at    | TIMESTAMP    | NULLABLE, INDEXED    | Soft delete timestamp          |
| notes         | TEXT         | NULLABLE             | Admin notes                    |
| consent_given | BOOLEAN      | NOT NULL, DEFAULT    | GDPR consent flag              |
| consent_date  | TIMESTAMP    | NULLABLE             | When consent was given         |
| ip_address    | VARCHAR(45)  | NULLABLE             | Client IP address              |
| user_agent    | TEXT         | NULLABLE             | Client user agent string       |

## Features

### Email Validation

- Format validation using `email-validator` library
- German error messages
- Required field checking

### Duplicate Detection

- Case-insensitive email comparison
- Excludes soft-deleted records
- Returns 409 status code on duplicate

### Soft Delete Pattern

- `deleted_at` column for soft deletes
- Soft-deleted records not considered in duplicate checks
- Allows email re-registration after deletion

### Metadata Tracking

- Client IP address capture
- User agent string capture
- Creation and update timestamps
- GDPR consent tracking

## API Usage

### Request

```http
POST /api/email-capture
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Response - Success (200)

```json
{
  "success": true,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Vielen Dank für dein Interesse an einem Business Reading."
}
```

### Response - Validation Error (400)

```json
{
  "field": "email",
  "error": "Bitte gib eine gültige E-Mail-Adresse ein."
}
```

### Response - Duplicate (409)

```json
{
  "field": "email",
  "error": "Diese E-Mail-Adresse wurde bereits registriert."
}
```

### Response - Server Error (500)

```json
{
  "error": "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später noch einmal."
}
```

## Database Setup

### Initialize Database Tables

```bash
cd /home/darae/chart-generator/backend
python3 scripts/init_database.py
```

This creates all necessary tables including `lead_emails` and `ephemeris_files`.

### Environment Variables

Required in `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/chart_generator
```

## Testing

### Automated Tests

```bash
cd /home/darae/chart-generator/backend
pytest tests/test_email_integration.py -v
```

Test coverage:
- Email service operations (save, duplicate check, soft delete)
- Email handler business logic
- Database model functionality
- Error handling scenarios

### Manual Testing

```bash
cd /home/darae/chart-generator/backend
python3 tests/manual_test_email.py
```

Tests various scenarios:
- Valid emails
- Invalid formats
- Duplicates
- Case sensitivity
- International domains

## Implementation Details

### Email Normalization

All emails are stored in lowercase for consistent duplicate checking:

```python
email_service.save_email("User@Example.COM")
# Stored as: "user@example.com"
```

### Database Session Management

Sessions are properly managed with try-finally blocks:

```python
db_session = get_db_session()
try:
    # Database operations
finally:
    db_session.close()
```

### Error Handling

Custom `EmailCaptureError` exception with status codes:

```python
raise EmailCaptureError(
    "Diese E-Mail-Adresse wurde bereits registriert.",
    status_code=409
)
```

## Security Considerations

1. **Input Validation**: Email format validated before database operations
2. **SQL Injection**: Prevented by SQLAlchemy ORM parameter binding
3. **GDPR Compliance**: Consent tracking and soft-delete support
4. **IP Logging**: Optional IP address tracking for fraud prevention
5. **Rate Limiting**: Should be implemented at API gateway level

## Performance

- Indexed columns: `email`, `deleted_at`
- Case-insensitive search uses `func.lower()` for database-level comparison
- Connection pooling configured in `src/database.py`

## Future Enhancements

1. Email verification workflow
2. Unsubscribe mechanism
3. Admin dashboard for lead management
4. Export functionality (CSV, Excel)
5. Email marketing integration
6. Analytics and reporting

## Files Created

1. `/home/darae/chart-generator/backend/src/database.py` - Database configuration
2. `/home/darae/chart-generator/backend/src/models/lead_email_db.py` - Database model
3. `/home/darae/chart-generator/backend/src/services/email_service.py` - Service layer
4. `/home/darae/chart-generator/backend/src/handlers/email_handler.py` - Handler layer
5. `/home/darae/chart-generator/backend/scripts/init_database.py` - Database init script
6. `/home/darae/chart-generator/backend/tests/test_email_integration.py` - Automated tests
7. `/home/darae/chart-generator/backend/tests/manual_test_email.py` - Manual test script

## Files Modified

1. `/home/darae/chart-generator/backend/src/main.py` - Updated email capture endpoint
