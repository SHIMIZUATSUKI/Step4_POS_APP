"use client";

import { useState, useEffect } from 'react';
import ProductLookup from './components/ProductLookup';
import PurchaseList from './components/PurchaseList';
import PurchaseButton from './components/PurchaseButton';
import ProductScan from './components/ProductScan';
import { lookupProduct } from './utils/api';

interface Product {
    prd_id: number;
    prd_code: string;
    name: string;
    price: number;
    quantity: number;
    tax_cd: string;
}

const Home = () => {
    const [product, setProduct] = useState<Product | null>(null);
    const [purchaseList, setPurchaseList] = useState<Product[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [scannedBarcode, setScannedBarcode] = useState<string>('');

    useEffect(() => {
        if (scannedBarcode) {
            handleLookupProduct(scannedBarcode);
        }
    }, [scannedBarcode]);

    const handleLookupProduct = async (barcode: string) => {
        try {
            const data = await lookupProduct(barcode);
            setProduct(data); // レスポンスデータをセット
            setErrorMessage('');
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    const addToCart = () => {
        if (product) {
            const existingProduct = purchaseList.find(item => item.prd_id === product.prd_id);
            if (existingProduct) {
                updateQuantity(existingProduct.prd_id, existingProduct.quantity + 1);
            } else {
                setPurchaseList([...purchaseList, { ...product, quantity: 1 }]);
            }
            setProduct(null);
        }
    };

    const updateQuantity = (prd_id: number, quantity: number) => {
        setPurchaseList(
            purchaseList.map(item =>
                item.prd_id === prd_id ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        );
    };

    const removeFromCart = (prd_id: number) => {
        setPurchaseList(purchaseList.filter(item => item.prd_id !== prd_id));
    };

    const clearList = () => {
        setPurchaseList([]);
    };

    const handleScan = (barcode: string) => {
        setScannedBarcode(barcode);
    };

    return (
        <div className="container">
            <ProductScan onScan={handleScan} />
            <ProductLookup setProduct={setProduct} setErrorMessage={setErrorMessage} scannedBarcode={scannedBarcode} />
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            {product && (
                <div id="product_info">
                    <div id="product_name">{product.name}</div>
                    <div id="product_price">{product.price}円</div>
                </div>
            )}
            <PurchaseList 
                purchaseList={purchaseList} 
                addToCart={addToCart} 
                updateQuantity={updateQuantity} 
                removeFromCart={removeFromCart}
            />
            <PurchaseButton purchaseList={purchaseList} clearList={clearList} />
        </div>
    );
};

export default Home;
