from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ProductBase(BaseModel):
    prd_code: str
    from_date: Optional[datetime]
    to_date: Optional[datetime]
    name: str
    price: int

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    prd_id: int

    class Config:
        orm_mode = True

class TransactionBase(BaseModel):
    emp_cd: Optional[str]
    store_cd: Optional[str]
    pos_no: Optional[str]
    total_amt: int
    ttl_amt_ex_tax: Optional[int]

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    trd_id: int
    datetime: datetime

    class Config:
        orm_mode = True

class TransactionDetailBase(BaseModel):
    prd_id: int
    tax_cd: str

class TransactionDetailCreate(TransactionDetailBase):
    pass

class TransactionDetail(TransactionDetailBase):
    dtl_id: int
    trd_id: int

    class Config:
        orm_mode = True

class TaxMasterBase(BaseModel):
    code: str
    name: str
    percent: float

class TaxMasterCreate(TaxMasterBase):
    pass

class TaxMaster(TaxMasterBase):
    id: int

    class Config:
        orm_mode = True

class PromotionMasterBase(BaseModel):
    prm_code: str
    from_date: Optional[datetime]
    to_date: Optional[datetime]
    name: str
    percent: Optional[float]
    discount: Optional[int]
    prd_id: int

class PromotionMasterCreate(PromotionMasterBase):
    pass

class PromotionMaster(PromotionMasterBase):
    prm_id: int

    class Config:
        orm_mode = True
