from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, DECIMAL
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Product(Base):
    __tablename__ = "products"

    prd_id = Column(Integer, primary_key=True, index=True)
    prd_code = Column(String(6), unique=True, index=True, nullable=False)
    from_date = Column(DateTime)
    to_date = Column(DateTime)
    name = Column(String(50), nullable=False)
    price = Column(Integer, nullable=False)
    tax_cd = Column(String(2), nullable=False)

class Transaction(Base):
    __tablename__ = "transactions"

    trd_id = Column(Integer, primary_key=True, index=True)
    datetime = Column(DateTime, default=datetime.datetime.utcnow)
    emp_cd = Column(String(10))
    store_cd = Column(String(5))
    pos_no = Column(String(3))
    total_amt = Column(Integer, nullable=False)
    ttl_amt_ex_tax = Column(Integer)
    total_qty = Column(Integer, nullable=False)

class TransactionDetail(Base):
    __tablename__ = "transaction_details"

    dtl_id = Column(Integer, primary_key=True, index=True)
    trd_id = Column(Integer, ForeignKey("transactions.trd_id"))
    prd_id = Column(Integer, ForeignKey("products.prd_id"))
    prd_code = Column(String(6))
    prd_name = Column(String(50))
    prd_price = Column(Integer)
    tax_cd = Column(String(2))
    quantity = Column(Integer, nullable=False)
    total_amt = Column(Integer, nullable=False)
    ttl_amt_ex_tax = Column(Integer, nullable=False)

class TaxMaster(Base):
    __tablename__ = "tax_master"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(2), unique=True, index=True, nullable=False)
    name = Column(String(20), nullable=False)
    percent = Column(DECIMAL(5, 2), nullable=False)

class PromotionMaster(Base):
    __tablename__ = "promotion_master"

    prm_id = Column(Integer, primary_key=True, index=True)
    prm_code = Column(String(6), nullable=False)
    from_date = Column(DateTime)
    to_date = Column(DateTime)
    name = Column(String(50), nullable=False)
    percent = Column(DECIMAL(5, 2))
    discount = Column(Integer)
    prd_id = Column(Integer, ForeignKey("products.prd_id"))
