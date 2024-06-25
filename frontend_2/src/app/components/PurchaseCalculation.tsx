// PurchaseCalculation.tsx

export interface Product {
    prd_id: number;
    prd_code: string;
    name: string;
    price: number;
    quantity: number;
    tax_cd: string;
}

export interface PurchaseCalculationResult {
    totalPrice: number;
    totalPriceWithTax: number;
}

export const calculatePurchaseTotals = (purchaseList: Product[]): PurchaseCalculationResult => {
    let total = 0;
    let totalWithTax = 0;

    purchaseList.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const taxRate = item.tax_cd === '01' ? 0.1 : item.tax_cd === '02' ? 0.08 : 0;
        const itemTotalWithTax = itemTotal * (1 + taxRate);
        totalWithTax += itemTotalWithTax;
    });

    return {
        totalPrice: total,
        totalPriceWithTax: totalWithTax
    };
};
