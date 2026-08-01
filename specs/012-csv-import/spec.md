# Feature Spec: CSV/Excel Import (Admin)

## Summary
Admin can import student rosters into class sections via CSV or Excel file upload.
The system parses the file, validates entries, creates student accounts if needed,
and enrolls students in the specified class section.

## Requirements

### File Upload
- [ ] FR-CI-01: Admin can upload a CSV or Excel (.xlsx) file for a class section
- [ ] FR-CI-02: System validates file format and required columns
- [ ] FR-CI-03: Required columns: student_code, name, email
- [ ] FR-CI-04: Optional columns: major_code, phone
- [ ] FR-CI-05: Maximum file size: 10MB

### Processing
- [ ] FR-CI-06: For each row, system creates a student account if email doesn't exist
- [ ] FR-CI-07: For each row, system enrolls the student in the class section
- [ ] FR-CI-08: Duplicate enrollments are silently skipped (idempotent)
- [ ] FR-CI-09: Invalid rows are collected and reported (not silently dropped)

### Feedback
- [ ] FR-CI-10: Show import progress (processing, completed, errors)
- [ ] FR-CI-11: Show summary: total rows, created, enrolled, skipped, errors
- [ ] FR-CI-12: Show detailed error report for failed rows (with row number and reason)
- [ ] FR-CI-13: Admin can download a sample CSV template

### History
- [ ] FR-CI-14: System logs import events in audit log
- [ ] FR-CI-15: Admin can view recent import history

## CSV Template

```csv
student_code,name,email,major_code
SE170001,Nguyen Van A,AnNVSE170001@fpt.edu.vn,SE
SE170002,Tran Thi B,BTSE170002@fpt.edu.vn,SE
AI170003,Le Van C,CLAI170003@fpt.edu.vn,AI
```

## Security
- [ ] SC-CI-01: Only admin role can import
- [ ] SC-CI-02: File type validation (reject non-CSV/Excel)
- [ ] SC-CI-03: Row-level validation (email format, required fields)

## UI / Components
- Import wizard: file upload → preview → confirm → results
- Drag-and-drop file zone (react-dropzone)
- Preview table showing parsed rows
- Error/warning badges per row
- Import result summary card

## Verification Plan
- Unit test: CSV parser with valid/invalid files
- Unit test: Excel parser with valid/invalid files
- API test: upload with valid file → 200 + summary
- API test: upload with invalid file type → 400
- API test: non-admin → 403
- E2E test: Admin uploads CSV → students appear in class roster
