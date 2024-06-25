import { calculatePurchaseTotals, Product } from './PurchaseCalculation';
import { useState, useEffect } from 'react';
import { purchaseProducts } from '../utils/api';

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
        const { totalPrice, totalPriceWithTax } = calculatePurchaseTotals(purchaseList);
        setTotalAmt(Math.round(totalPriceWithTax));  // 合計金額(税込)を設定
        setTtlAmtExTax(Math.round(totalPrice));  // 合計金額(税抜)を設定
        setTotalQty(purchaseList.reduce((sum, item) => sum + item.quantity, 0));  // 合計数量を設定
    }, [purchaseList]);

    const products = purchaseList.map(item => ({
        prd_id: item.prd_id,
        prd_code: item.prd_code,
        prd_name: item.name,
        prd_price: item.price,
        tax_cd: item.tax_cd,
        quantity: item.quantity,
        total_amt: item.price * item.quantity,
        ttl_amt_ex_tax: item.price * item.quantity
    }));

    const handlePurchase = async () => {
        const transaction = {
            emp_cd: 'E001',  // 固定値、適切に設定してください
            store_cd: 'S001',  // 固定値、適切に設定してください
            pos_no: 'P01',  // 固定値、適切に設定してください
            total_amt: totalAmt,
            ttl_amt_ex_tax: ttlAmtExTax,
            total_qty: totalQty,
            details: products  // トランザクション詳細を含む
        };

        try {
            console.log("Sending transaction:", transaction);
            const response = await purchaseProducts(transaction);
            alert(`購入が完了しました。`);
            clearList();
            setShowConfirmation(false);
        } catch (error: any) {
            console.error('Error during purchase:', error);
            if (error.response && error.response.data) {
                console.error('Error details:', error.response.data);
            }
            alert('購入に失敗しました');
        }
    };

    return (
        <div className="button-group">
            <button onClick={() => setShowConfirmation(true)}>購入</button>

            {showConfirmation && (
                <div className="confirmation-dialog">
                    <p>購入金額: {totalAmt}円</p>
                    <p>この注文を確定しますか？</p>
                    <button onClick={handlePurchase}>注文を確定する</button>
                    <button onClick={() => setShowConfirmation(false)}>キャンセル</button>
                </div>
            )}
        </div>
    );
};

export default PurchaseButton;

