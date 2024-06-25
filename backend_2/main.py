from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from models import Product, Transaction, TransactionDetail, TaxMaster, PromotionMaster
from schemas import (
    ProductCreate, Product as ProductSchema,
    TransactionCreate, Transaction as TransactionSchema,
    TransactionDetailCreate, TransactionDetail as TransactionDetailSchema,
    TaxMasterCreate, TaxMaster as TaxMasterSchema,
    PromotionMasterCreate, PromotionMaster as PromotionMasterSchema
)
from database import SessionLocal, engine
from datetime import datetime, timezone, timedelta


# テーブルの作成
Product.metadata.create_all(bind=engine)
Transaction.metadata.create_all(bind=engine)
TransactionDetail.metadata.create_all(bind=engine)
TaxMaster.metadata.create_all(bind=engine)
PromotionMaster.metadata.create_all(bind=engine)

app = FastAPI()

# CORS設定
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

# 製品コード用のPydanticモデル
class ProductCode(BaseModel):
    product_code: str

# データベース接続の依存関係を提供する関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", response_class=HTMLResponse)
def read_root():
    return "<h1>Backend FastAPI</h1>"

# 製品の作成エンドポイント
@app.post("/products/", response_model=ProductSchema)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# 製品の読み取りエンドポイント（リスト）
@app.get("/products/", response_model=list[ProductSchema])
def read_products(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    products = db.query(Product).offset(skip).limit(limit).all()
    return products

# 製品の読み取りエンドポイント（単一）
@app.get("/products/{prd_id}", response_model=ProductSchema)
def read_product(prd_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.prd_id == prd_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# 製品の更新エンドポイント
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

# 製品の削除エンドポイント
@app.delete("/products/{prd_id}", response_model=ProductSchema)
def delete_product(prd_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.prd_id == prd_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return db_product

# 製品コードによる製品検索エンドポイント
@app.post("/lookup/", response_model=ProductSchema)
def lookup_product(product_code: ProductCode, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.prd_code == product_code.product_code).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# 購入エンドポイント
@app.post("/purchase/", response_model=TransactionSchema)
def purchase(transaction: TransactionCreate, db: Session = Depends(get_db)):
    print("Received transaction:", transaction)  # 受信したデータをログに出力
    
    # 日本時間 (JST) の現在時刻を設定
    jst = timezone(timedelta(hours=9))
    now_jst = datetime.now(jst)

    # 新しいトランザクションを作成
    db_transaction = Transaction(
        emp_cd=transaction.emp_cd,
        store_cd=transaction.store_cd,
        pos_no=transaction.pos_no,
        datetime=now_jst,  # JSTの現在時刻を設定
        total_amt=0,
        ttl_amt_ex_tax=0,
        total_qty=0
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    total_amt = 0
    ttl_amt_ex_tax = 0
    total_qty = 0

    transaction_details = []  # トランザクション詳細を保存するリスト

    for detail in transaction.details:
        db_product = db.query(Product).filter(Product.prd_id == detail.prd_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail=f"Product with ID {detail.prd_id} not found")

        tax_rate = 0
        if db_product.tax_cd == '01':
            tax_rate = 0.1
        elif db_product.tax_cd == '02':
            tax_rate = 0.08

        item_total_amt = db_product.price * detail.quantity * (1 + tax_rate)
        item_ttl_amt_ex_tax = db_product.price * detail.quantity

        total_amt += item_total_amt
        ttl_amt_ex_tax += item_ttl_amt_ex_tax
        total_qty += detail.quantity

        # トランザクション詳細を作成
        db_transaction_detail = TransactionDetail(
            trd_id=db_transaction.trd_id,
            prd_id=detail.prd_id,
            prd_code=db_product.prd_code,
            prd_name=db_product.name,
            prd_price=db_product.price,
            tax_cd=db_product.tax_cd,
            quantity=detail.quantity,
            total_amt=item_total_amt,
            ttl_amt_ex_tax=item_ttl_amt_ex_tax
        )
        db.add(db_transaction_detail)
        transaction_details.append(db_transaction_detail)  # トランザクション詳細をリストに追加

    # トランザクションの合計金額、税抜き金額、合計数量を更新
    db_transaction.total_amt = total_amt
    db_transaction.ttl_amt_ex_tax = ttl_amt_ex_tax
    db_transaction.total_qty = total_qty

    db.commit()
    db.refresh(db_transaction)

    # トランザクション詳細をリフレッシュしてレスポンスに含める
    for detail in transaction_details:
        db.refresh(detail)

    # トランザクションとその詳細をレスポンスとして返す
    return TransactionSchema(
        trd_id=db_transaction.trd_id,
        emp_cd=db_transaction.emp_cd,
        store_cd=db_transaction.store_cd,
        pos_no=db_transaction.pos_no,
        total_amt=db_transaction.total_amt,
        ttl_amt_ex_tax=db_transaction.ttl_amt_ex_tax,
        total_qty=db_transaction.total_qty,
        datetime=db_transaction.datetime,
        details=transaction_details  # トランザクション詳細を含める
    )
