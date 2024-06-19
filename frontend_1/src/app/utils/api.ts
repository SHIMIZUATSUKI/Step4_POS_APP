import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const lookupProduct = async (productCode: string) => {
    return await axios.post(`${API_URL}/lookup/`, { product_code: productCode });
};

export const purchaseProducts = async (products: any) => {
    return await axios.post(`${API_URL}/purchase/`, products);
};
