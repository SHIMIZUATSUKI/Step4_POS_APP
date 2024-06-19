"use client";

interface Product {
    prd_id: number;
    name: string;
    price: number;
}

interface PurchaseListProps {
    purchaseList: Product[];
    addToCart: () => void;
}

const PurchaseList: React.FC<PurchaseListProps> = ({ purchaseList, addToCart }) => {
    return (
        <div className="purchase-list">
            <div className="button-group">
                <button onClick={addToCart}>追加</button>
            </div>
            <div className="purchase-list-header">購入リスト</div>
            <div className="purchase-list-container">
                <ul>
                    {purchaseList.map((item, index) => (
                        <li key={index}>{item.name} - {item.price}円</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PurchaseList;
