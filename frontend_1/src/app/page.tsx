"use client";

import { useState } from 'react';
import ProductLookup from './components/ProductLookup';
import PurchaseList from './components/PurchaseList';
import PurchaseButton from './components/PurchaseButton';

interface Product {
    prd_id: number;
    name: string;
    price: number;
}

const Home = () => {
    const [product, setProduct] = useState<Product | null>(null);
    const [purchaseList, setPurchaseList] = useState<Product[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const addToCart = () => {
        if (product) {
            setPurchaseList([...purchaseList, product]);
            setProduct(null);
        }
    };

    const clearList = () => {
        setPurchaseList([]);
    };

    return (
        <div className="container">
            <ProductLookup setProduct={setProduct} setErrorMessage={setErrorMessage} />
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            {product && (
                <div id="product_info">
                    <div id="product_name">{product.name}</div>
                    <div id="product_price">{product.price}円</div>
                </div>
            )}
            <PurchaseList purchaseList={purchaseList} addToCart={addToCart} />
            <PurchaseButton purchaseList={purchaseList} clearList={clearList} />
        </div>
    );
};

export default Home;
