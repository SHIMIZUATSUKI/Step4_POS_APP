async function lookupProduct() {
    const productCode = document.getElementById('product_code').value;
    const response = await fetch('/lookup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_code: productCode }),
    });
    if (response.ok) {
        const product = await response.json();
        document.getElementById('product_name').value = product.name;
        document.getElementById('product_price').value = product.price;
    } else {
        alert('商品が見つかりません');
    }
}

function addToCart() {
    const productName = document.getElementById('product_name').value;
    const productPrice = document.getElementById('product_price').value;
    const purchaseList = document.getElementById('purchase_list');
    const listItem = document.createElement('li');
    listItem.innerText = `${productName} - ${productPrice}円`;
    purchaseList.appendChild(listItem);
    document.getElementById('product_code').value = '';
    document.getElementById('product_name').value = '';
    document.getElementById('product_price').value = '';
}

async function purchase() {
    const purchaseList = document.getElementById('purchase_list');
    const items = purchaseList.getElementsByTagName('li');
    const products = [];
    for (let item of items) {
        const [name, price] = item.innerText.split(' - ');
        const priceValue = parseInt(price.replace('円', ''));
        const response = await fetch('/products/', {
            method: 'GET',
        });
        const allProducts = await response.json();
        const product = allProducts.find(p => p.name === name && p.price === priceValue);
        if (product) {
            products.push({
                prd_id: product.prd_id,
                prd_price: product.price,
                tax_cd: '01' // Simplified for example purposes
            });
        }
    }
    console.log('Purchasing products:', products);  // デバッグ用のログ
    const response = await fetch('/purchase/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(products),
    });
    if (response.ok) {
        const transaction = await response.json();
        alert(`購入が完了しました。合計金額: ${transaction.total_amt}円`);
        purchaseList.innerHTML = '';
    } else {
        alert('購入に失敗しました');
        console.error('Purchase failed:', response.statusText);  // デバッグ用のログ
    }
}
