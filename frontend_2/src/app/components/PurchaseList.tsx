"use client";

import { useEffect, useState } from 'react';
import { Product, calculatePurchaseTotals } from './PurchaseCalculation';

interface PurchaseListProps {
    purchaseList: Product[];
    addToCart: () => void;
    updateQuantity: (prd_id: number, quantity: number) => void;
    removeFromCart: (prd_id: number) => void;
}

const PurchaseList: React.FC<PurchaseListProps> = ({ purchaseList, addToCart, updateQuantity, removeFromCart }) => {
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [totalPriceWithTax, setTotalPriceWithTax] = useState<number>(0);

    useEffect(() => {
        const { totalPrice, totalPriceWithTax } = calculatePurchaseTotals(purchaseList);
        setTotalPrice(Math.round(totalPrice)); // Math.roundを使用して整数に変換
        setTotalPriceWithTax(Math.round(totalPriceWithTax)); // Math.roundを使用して整数に変換
    }, [purchaseList]);

    const handleQuantityChange = (prd_id: number, quantity: number) => {
        if (quantity >= 1) {
            updateQuantity(prd_id, quantity);
        }
    };

    return (
        <div className="purchase-list">
            <div className="button-group">
                <button onClick={addToCart}>追加</button>
            </div>
            <div className="purchase-list-header">購入リスト</div>
            <div className="purchase-list-container">
                <ul>
                    {purchaseList.map((item, index) => (
                        <li key={index} className="purchase-list-item">
                            <span className="item-info">{item.name} - {item.price}円</span>
                            <div className="item-controls">
                                <div className="quantity-control">
                                    <button onClick={() => handleQuantityChange(item.prd_id, item.quantity - 1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleQuantityChange(item.prd_id, item.quantity + 1)}>+</button>
                                </div>
                                <button className="remove-button" onClick={() => removeFromCart(item.prd_id)}>削除</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="total-price">
                <p>合計金額(税抜き): {totalPrice}円</p>
                <p>合計金額(税込み): {totalPriceWithTax}円</p>
            </div>
        </div>
    );
};

export default PurchaseList;

