from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ProductBase(BaseModel):
    prd_code: str
    from_date: Optional[datetime]
    to_date: Optional[datetime]
    name: str
    price: int
    tax_cd: str

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    prd_id: int

    class Config:
        from_attributes = True

class TransactionDetailBase(BaseModel):
    prd_id: int
    prd_code: str
    prd_name: str
    prd_price: int
    tax_cd: str
    quantity: int
    total_amt: int
    ttl_amt_ex_tax: int

class TransactionDetailCreate(TransactionDetailBase):
    pass

class TransactionDetail(TransactionDetailBase):
    dtl_id: int
    trd_id: int

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    emp_cd: Optional[str]
    store_cd: Optional[str]
    pos_no: Optional[str]
    total_amt: int
    ttl_amt_ex_tax: Optional[int]
    total_qty: int

class TransactionCreate(TransactionBase):
    details: List[TransactionDetailCreate]  # トランザクション詳細のリスト

class Transaction(TransactionBase):
    trd_id: int
    datetime: datetime
    details: List[TransactionDetail]

    class Config:
        from_attributes = True

class TaxMasterBase(BaseModel):
    code: str
    name: str
    percent: float

class TaxMasterCreate(TaxMasterBase):
    pass

class TaxMaster(TaxMasterBase):
    id: int

    class Config:
        from_attributes = True

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
        from_attributes = True
