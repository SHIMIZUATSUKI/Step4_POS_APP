import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const lookupProduct = async (productCode: string) => {
    const response = await axios.post(`${API_URL}/lookup/`, { product_code: productCode });
    return response.data; // 修正: レスポンスデータを直接返す
};

export const purchaseProducts = async (products: any) => {
    console.log("Sending products to API:", products);  // 送信するデータをログに出力
    const response = await axios.post(`${API_URL}/purchase/`, products);
    return response.data; // レスポンスデータを直接返す
};

