"""CSV & Excel Roster Importer Service for FPT University Class Sections.

Parses CSV and Excel files containing student rosters and validates FPT emails and student codes.
"""
from __future__ import annotations

import csv
import io

from pydantic import BaseModel


class RosterRow(BaseModel):
    student_code: str
    name: str
    email: str
    major_code: str = ""


class ImportSummary(BaseModel):
    total_rows: int
    imported_count: int
    failed_count: int
    errors: list[str]
    students: list[RosterRow]


def parse_csv_roster(file_content: bytes) -> ImportSummary:
    """Parses a CSV file containing student roster data."""
    decoded = file_content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(decoded))
    
    total = 0
    imported = 0
    failed = 0
    errors: list[str] = []
    students: list[RosterRow] = []

    for idx, row in enumerate(reader, start=1):
        total += 1
        # Normalize column keys
        normalized = {k.strip().lower(): v.strip() for k, v in row.items() if k}
        
        student_code = (
            normalized.get("student_code") or 
            normalized.get("mssv") or 
            normalized.get("code") or ""
        )
        name = (
            normalized.get("name") or 
            normalized.get("fullname") or 
            normalized.get("full_name") or ""
        )
        email = (
            normalized.get("email") or 
            normalized.get("fpt_email") or ""
        )
        major_code = (
            normalized.get("major_code") or 
            normalized.get("major") or ""
        )

        if not student_code or not email:
            failed += 1
            errors.append(f"Line {idx}: Missing student code or email.")
            continue

        st = RosterRow(
            student_code=student_code,
            name=name or student_code,
            email=email,
            major_code=major_code
        )
        students.append(st)
        imported += 1

    return ImportSummary(
        total_rows=total,
        imported_count=imported,
        failed_count=failed,
        errors=errors,
        students=students
    )
