from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
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

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def read_root():
    with open("static/index.html", "r", encoding="utf-8") as file:
        return file.read()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CRUD Endpoints for Products
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

# Endpoint to handle product lookup
@app.post("/lookup/", response_model=ProductSchema)
def lookup_product(product_code: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.prd_code == product_code).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Endpoint to handle purchase transactions
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
