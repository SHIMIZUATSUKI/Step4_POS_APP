from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from models import Product, Transaction, TransactionDetail, TaxMaster, PromotionMaster
from schemas import ProductCreate, Product as ProductSchema, TransactionCreate, Transaction as TransactionSchema, TransactionDetailCreate, TransactionDetail as TransactionDetailSchema, TaxMasterCreate, TaxMaster as TaxMasterSchema, PromotionMasterCreate, PromotionMaster as PromotionMasterSchema
from database import SessionLocal, engine

# Create tables
Product.metadata.create_all(bind=engine)
Transaction.metadata.create_all(bind=engine)
TransactionDetail.metadata.create_all(bind=engine)
TaxMaster.metadata.create_all(bind=engine)
PromotionMaster.metadata.create_all(bind=engine)

app = FastAPI()

# CORS settings
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProductCode(BaseModel):
    product_code: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/products/", response_model=ProductSchema)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products/", response_model=list[ProductSchema])
def read_products(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    products = db.query(Product).offset(skip).limit(limit).all()
    return products

@app.get("/products/{prd_id}", response_model=ProductSchema)
def read_product(prd_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.prd_id == prd_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/products/{prd_id}", response_model=ProductSchema)
def update_product(prd_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.prd_id == prd_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{prd_id}", response_model=ProductSchema)
def delete_product(prd_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.prd_id == prd_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return db_product

@app.post("/lookup/", response_model=ProductSchema)
def lookup_product(product_code: ProductCode, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.prd_code == product_code.product_code).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/purchase/", response_model=TransactionSchema)
def purchase(products: list[TransactionDetailCreate], db: Session = Depends(get_db)):
    transaction = Transaction(total_amt=0, ttl_amt_ex_tax=0)
    db.add(transaction)
    db.commit()
    total_amt = 0
    for product in products:
        db_product = db.query(Product).filter(Product.prd_id == product.prd_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail=f"Product with ID {product.prd_id} not found")
        total_amt += db_product.price
        transaction_detail = TransactionDetail(
            trd_id=transaction.trd_id,
            prd_id=product.prd_id,
            prd_code=db_product.prd_code,
            prd_name=db_product.name,
            prd_price=db_product.price,
            tax_cd=product.tax_cd
        )
        db.add(transaction_detail)
    transaction.total_amt = total_amt
    db.commit()
    db.refresh(transaction)
    return transaction
