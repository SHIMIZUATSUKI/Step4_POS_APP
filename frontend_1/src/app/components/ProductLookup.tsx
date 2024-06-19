"use client";

import { useState } from 'react';
import { lookupProduct as apiLookupProduct } from '../utils/api';

interface Product {
    prd_id: number;
    name: string;
    price: number;
}

interface ProductLookupProps {
    setProduct: (product: Product) => void;
    setErrorMessage: (message: string) => void;
}

const ProductLookup: React.FC<ProductLookupProps> = ({ setProduct, setErrorMessage }) => {
    const [productCode, setProductCode] = useState('');

    const lookupProduct = async () => {
        try {
            const response = await apiLookupProduct(productCode);
            setProduct(response.data);
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
            <button onClick={lookupProduct}>商品コード読み込み</button>
        </div>
    );
};

export default ProductLookup;


