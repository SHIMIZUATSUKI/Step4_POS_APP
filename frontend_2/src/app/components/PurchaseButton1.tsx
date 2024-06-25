"use client";

import { useState, useEffect } from 'react';
import { purchaseProducts } from '../utils/api';
import { Product } from './PurchaseCalculation';

interface PurchaseButtonProps {
    purchaseList: Product[];
    clearList: () => void;
}

const PurchaseButton: React.FC<PurchaseButtonProps> = ({ purchaseList, clearList }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [totalAmt, setTotalAmt] = useState<number>(0);
    const [ttlAmtExTax, setTtlAmtExTax] = useState<number>(0);
    const [totalQty, setTotalQty] = useState<number>(0);

    useEffect(() => {
        const total_amt = purchaseList.reduce((sum, item) => sum + item.price * item.quantity * (1 + (item.tax_cd === '01' ? 0.1 : item.tax_cd === '02' ? 0.08 : 0)), 0);
        const ttl_amt_ex_tax = purchaseList.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const total_qty = purchaseList.reduce((sum, item) => sum + item.quantity, 0);
        setTotalAmt(Math.round(total_amt));  // Math.roundを使用して整数に変換
        setTtlAmtExTax(Math.round(ttl_amt_ex_tax));  // Math.roundを使用して整数に変換
        setTotalQty(total_qty);
    }, [purchaseList]);

    const products = purchaseList.map(item => ({
        prd_id: item.prd_id,
        tax_cd: item.tax_cd,
        quantity: item.quantity
    }));

    const handlePurchase = async () => {
        try {
            console.log("Sending products:", products);  // 送信するデータをログに出力
            const response = await purchaseProducts(products);
            alert(`購入が完了しました。合計金額: ${response.total_amt}円`);
            clearList();
            setShowConfirmation(false);
        } catch (error: any) {
            console.error('Error details:', error.response?.data);
            alert('購入に失敗しました');
        }
    };

    return (
        <div className="button-group">
            <button onClick={() => setShowConfirmation(true)}>購入</button>

            {showConfirmation && (
                <div className="confirmation-dialog">
                    <p>購入金額: {totalAmt}円</p> {/* ここで整数を表示 */}
                    <p>この注文を確定しますか？</p>
                    <button onClick={handlePurchase}>注文を確定する</button>
                    <button onClick={() => setShowConfirmation(false)}>キャンセル</button>
                </div>
            )}
        </div>
    );
};

export default PurchaseButton;


