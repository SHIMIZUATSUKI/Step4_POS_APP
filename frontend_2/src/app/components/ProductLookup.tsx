"use client";

import { useState, useEffect } from 'react';
import { lookupProduct as apiLookupProduct } from '../utils/api';

interface Product {
    prd_id: number;
    prd_code: string;
    name: string;
    price: number;
    quantity: number;
    tax_cd: string;
}

interface ProductLookupProps {
    setProduct: (product: Product) => void;
    setErrorMessage: (message: string) => void;
    scannedBarcode?: string; // スキャンしたバーコードを受け取るためのプロップス
}

const ProductLookup: React.FC<ProductLookupProps> = ({ setProduct, setErrorMessage, scannedBarcode }) => {
    const [productCode, setProductCode] = useState('');

    useEffect(() => {
        if (scannedBarcode) {
            setProductCode(scannedBarcode);
            lookupProduct(scannedBarcode);
        }
    }, [scannedBarcode]);

    const lookupProduct = async (code: string) => {
        try {
            const response = await apiLookupProduct(code);
            setProduct(response); // 修正: response.dataではなくresponseをセット
            setProductCode('');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('商品が見つかりません');
        }
    };

    return (
        <div className="product-lookup">
            <input 
                type="text" 
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="商品コードを入力"
            />
            <button onClick={() => lookupProduct(productCode)}>商品コード読み込み</button>
        </div>
    );
};

export default ProductLookup;
