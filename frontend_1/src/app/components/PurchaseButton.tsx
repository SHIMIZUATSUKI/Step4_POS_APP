"use client";

import { purchaseProducts } from '../utils/api';

interface Product {
    prd_id: number;
    name: string;
    price: number;
}

interface PurchaseButtonProps {
    purchaseList: Product[];
    clearList: () => void;
}

const PurchaseButton: React.FC<PurchaseButtonProps> = ({ purchaseList, clearList }) => {
    const purchase = async () => {
        const products = purchaseList.map(item => ({
            prd_id: item.prd_id,
            prd_price: item.price,
            tax_cd: '01' // Assuming a fixed tax code for simplicity
        }));
        try {
            const response = await purchaseProducts(products);
            alert(`購入が完了しました。合計金額: ${response.data.total_amt}円`);
            clearList();
        } catch (error) {
            alert('購入に失敗しました');
        }
    };

    return (
        <div className="button-group">
            <button onClick={purchase}>購入</button>
        </div>
    );
};

export default PurchaseButton;
