"""Generic Base Repository implementation using SQLAlchemy 2.0.
"""
from __future__ import annotations

from typing import Generic, TypeVar, Type, Any, Sequence
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.infra.database import Base

T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T]):
    """Generic repository providing CRUD operations for SQLAlchemy models."""

    def __init__(self, model: Type[T], db: Session) -> None:
        self.model = model
        self.db = db

    def get(self, id: Any) -> T | None:
        return self.db.get(self.model, id)

    def get_all(self, limit: int = 100, offset: int = 0) -> Sequence[T]:
        stmt = select(self.model).offset(offset).limit(limit)
        return self.db.scalars(stmt).all()

    def filter_by(self, **kwargs: Any) -> Sequence[T]:
        stmt = select(self.model).filter_by(**kwargs)
        return self.db.scalars(stmt).all()

    def create(self, instance: T) -> T:
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def update(self, instance: T) -> T:
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def delete(self, id: Any) -> bool:
        obj = self.get(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
            return True
        return False
