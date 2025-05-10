// メインデータストレージ
let data = {
    products: [],
    inventory: [],
    orders: [],
    orderItems: []
};

// 初期化処理
document.addEventListener('DOMContentLoaded', function() {
    // ローカルストレージからデータを読み込む
    loadDataFromStorage();
    
    // UI更新
    updateProductsTable();
    updateInventoryTable();
    updateOrdersTable();
    updateDashboard();
    
    // イベントリスナーを設定
    setupEventListeners();
});

// ローカルストレージからデータを読み込む
function loadDataFromStorage() {
    // 商品マスター
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        data.products = JSON.parse(storedProducts);
    } else {
        // サンプルデータを設定
        data.products = [
            { id: 'P001', name: 'オーガニックコーヒー', category: '飲料', price: 980, minStock: 10, standardOrder: 30 },
            { id: 'P002', name: 'プレミアム緑茶', category: '飲料', price: 780, minStock: 15, standardOrder: 40 },
            { id: 'P003', name: '高級チョコレート', category: '食品', price: 1200, minStock: 20, standardOrder: 50 },
            { id: 'P004', name: 'キッチンタオル', category: '日用品', price: 450, minStock: 30, standardOrder: 100 },
            { id: 'P005', name: '洗濯洗剤', category: '日用品', price: 850, minStock: 15, standardOrder: 30 }
        ];
    }
    
    // 在庫データ
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
        data.inventory = JSON.parse(storedInventory);
    } else {
        // サンプル在庫データを設定
        data.inventory = [
            { productId: 'P001', quantity: 25, lastUpdated: '2025-04-28' },
            { productId: 'P002', quantity: 18, lastUpdated: '2025-04-28' },
            { productId: 'P003', quantity: 12, lastUpdated: '2025-04-27' },
            { productId: 'P004', quantity: 45, lastUpdated: '2025-04-26' },
            { productId: 'P005', quantity: 8, lastUpdated: '2025-04-25' }
        ];
    }
    
    // 発注データ
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
        data.orders = JSON.parse(storedOrders);
    } else {
        // サンプル発注データ
        data.orders = [
            { id: 'ORD001', date: '2025-04-20', status: '完了', totalAmount: 68400 },
            { id: 'ORD002', date: '2025-04-29', status: '発注中', totalAmount: 42500 }
        ];
    }
    
    // 発注明細データ
    const storedOrderItems = localStorage.getItem('orderItems');
    if (storedOrderItems) {
        data.orderItems = JSON.parse(storedOrderItems);
    } else {
        // サンプル発注明細データ
        data.orderItems = [
            { orderId: 'ORD001', productId: 'P001', quantity: 30, unitPrice: 980 },
            { orderId: 'ORD001', productId: 'P003', quantity: 50, unitPrice: 1200 },
            { orderId: 'ORD002', productId: 'P002', quantity: 40, unitPrice: 780 },
            { orderId: 'ORD002', productId: 'P005', quantity: 30, unitPrice: 850 }
        ];
    }
}

// データをローカルストレージに保存
function saveDataToStorage() {
    localStorage.setItem('products', JSON.stringify(data.products));
    localStorage.setItem('inventory', JSON.stringify(data.inventory));
    localStorage.setItem('orders', JSON.stringify(data.orders));
    localStorage.setItem('orderItems', JSON.stringify(data.orderItems));
}

// イベントリスナーの設定
function setupEventListeners() {
    // ナビゲーションリンク
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // アクティブクラスを切り替え
            document.querySelectorAll('.nav-links a').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // ターゲットセクションを表示
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                // スクロール
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 商品追加ボタン
    document.getElementById('add-product-btn').addEventListener('click', function() {
        showProductModal();
    });
    
    // 商品フォーム送信
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
    
    // 発注作成ボタン
    document.getElementById('create-order-btn').addEventListener('click', function() {
        showOrderModal();
    });
    
    // 発注商品追加ボタン
    document.getElementById('add-order-item-btn').addEventListener('click', function() {
        addOrderItem();
    });
    
    // 発注フォーム送信
    document.getElementById('order-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveOrder();
    });
    
    // 在庫更新ボタン
    document.getElementById('update-inventory-btn').addEventListener('click', function() {
        showInventoryModal();
    });
    
    // 在庫フォーム送信
    document.getElementById('inventory-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateInventory();
    });
    
    // 入荷確定ボタン
    document.getElementById('receive-order-btn').addEventListener('click', function() {
        receiveOrder();
    });
    
    // 発注取消ボタン
    document.getElementById('cancel-order-btn').addEventListener('click', function() {
        const orderId = document.getElementById('detail-order-id').textContent;
        showConfirmModal(`発注 ${orderId} を取り消しますか？`, function() {
            cancelOrder(orderId);
        });
    });
    
    // 確認モーダルのYesボタン
    document.getElementById('confirm-yes').addEventListener('click', function() {
        // callbackを呼び出し
        if (this.dataset.callback) {
            window[this.dataset.callback]();
        }
        closeModal('confirm-modal');
    });
    
    // 確認モーダルのNoボタン
    document.getElementById('confirm-no').addEventListener('click', function() {
        closeModal('confirm-modal');
    });
    
    // すべてのモーダルクローズボタン
    document.querySelectorAll('.close, .close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // モーダル外クリックでモーダル閉じる
    window.addEventListener('click', function(e) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// 商品テーブル更新
function updateProductsTable() {
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = '';
    
    data.products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>¥${product.price.toLocaleString()}</td>
            <td>${product.minStock}</td>
            <td>${product.standardOrder}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick="editProduct('${product.id}')">📝</button>
                    <button class="btn-icon delete" onclick="deleteProduct('${product.id}')">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // 発注フォームのセレクトボックスも更新
    updateProductSelect();
}

// 在庫テーブル更新
function updateInventoryTable() {
    const tbody = document.querySelector('#inventory-table tbody');
    tbody.innerHTML = '';
    
    data.inventory.forEach(inv => {
        const product = findProductById(inv.productId);
        if (!product) return;
        
        // 在庫ステータスの判定
        let status, statusClass;
        if (inv.quantity <= 0) {
            status = '在庫切れ';
            statusClass = 'status-critical';
        } else if (inv.quantity < product.minStock) {
            status = '要発注';
            statusClass = 'status-warning';
        } else {
            status = '適正';
            statusClass = 'status-normal';
        }
        
        // 発注中かどうかチェック
        const isOrdered = isProductOrdered(inv.productId);
        if (isOrdered && inv.quantity < product.minStock) {
            status = '発注中';
            statusClass = 'status-ordered';
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${inv.productId}</td>
            <td>${product.name}</td>
            <td>${inv.quantity}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>${inv.lastUpdated}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="showInventoryUpdate('${inv.productId}')">📦</button>
                    ${status === '要発注' ? `<button class="btn-icon" onclick="createOrderForProduct('${inv.productId}')">🚚</button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // 在庫更新モーダルのセレクトボックスも更新
    updateInventorySelect();
}

// 発注テーブル更新
function updateOrdersTable() {
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = '';
    
    data.orders.forEach(order => {
        // 該当する発注の商品数をカウント
        const itemCount = data.orderItems.filter(item => item.orderId === order.id).length;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${order.date}</td>
            <td>${itemCount}種</td>
            <td>¥${order.totalAmount.toLocaleString()}</td>
            <td><span class="status-badge ${order.status === '発注中' ? 'status-ordered' : 'status-normal'}">${order.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="showOrderDetail('${order.id}')">👁️</button>
                    ${order.status === '発注中' ? `<button class="btn-icon" onclick="showCancelOrderConfirm('${order.id}')">❌</button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ダッシュボード更新
function updateDashboard() {
    // 総在庫数
    const totalInventory = data.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    document.getElementById('total-inventory').textContent = totalInventory;
    
    // 要発注商品数
    let lowStockCount = 0;
    data.inventory.forEach(inv => {
        const product = findProductById(inv.productId);
        if (product && inv.quantity < product.minStock && !isProductOrdered(inv.productId)) {
            lowStockCount++;
        }
    });
    document.getElementById('low-stock-count').textContent = lowStockCount;
    
    // 発注中商品数
    const orderedItems = data.orders
        .filter(order => order.status === '発注中')
        .flatMap(order => data.orderItems.filter(item => item.orderId === order.id));
    const uniqueOrderedProducts = [...new Set(orderedItems.map(item => item.productId))];
    document.getElementById('ordered-count').textContent = uniqueOrderedProducts.length;
}

// 商品セレクトボックス更新
function updateProductSelect() {
    const select = document.getElementById('order-product-select');
    select.innerHTML = '<option value="">商品を選択</option>';
    
    data.products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.id}: ${product.name} (¥${product.price.toLocaleString()})`;
        select.appendChild(option);
    });
    
    // 在庫更新モーダルのセレクトボックスも更新
    updateInventorySelect();
}

// 在庫更新用商品セレクトボックス更新
function updateInventorySelect() {
    const select = document.getElementById('inventory-product');
    select.innerHTML = '<option value="">選択してください</option>';
    
    data.products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.id}: ${product.name}`;
        select.appendChild(option);
    });
}

// 商品モーダル表示
function showProductModal(productId = null) {
    // モーダルタイトル設定
    document.getElementById('product-modal-title').textContent = productId ? '商品編集' : '商品追加';
    
    // フォームリセット
    document.getElementById('product-form').reset();
    
    // 編集モードの場合、既存データをセット
    if (productId) {
        const product = findProductById(productId);
        if (product) {
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-min-stock').value = product.minStock;
            document.getElementById('product-standard-order').value = product.standardOrder;
        }
    } else {
        // 新規作成モードの場合、IDフィールドをクリア
        document.getElementById('product-id').value = '';
    }
    
    // モーダル表示
    document.getElementById('product-modal').style.display = 'block';
}

// 商品データ保存
function saveProduct() {
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseInt(document.getElementById('product-price').value, 10);
    const minStock = parseInt(document.getElementById('product-min-stock').value, 10);
    const standardOrder = parseInt(document.getElementById('product-standard-order').value, 10);
    
    if (id) {
        // 編集モード
        const index = data.products.findIndex(p => p.id === id);
        if (index !== -1) {
            data.products[index] = { id, name, category, price, minStock, standardOrder };
        }
    } else {
        // 新規追加モード
        // 新しいIDを生成（最後のID+1）
        const lastId = data.products.length > 0 
            ? data.products[data.products.length - 1].id
            : 'P000';
        const numericPart = parseInt(lastId.substring(1), 10);
        const newId = 'P' + String(numericPart + 1).padStart(3, '0');
        
        // 商品を追加
        data.products.push({ id: newId, name, category, price, minStock, standardOrder });
        
        // 対応する在庫レコードも追加
        data.inventory.push({
            productId: newId,
            quantity: 0,
            lastUpdated: getCurrentDate()
        });
    }
    
    // データを保存
    saveDataToStorage();
    
    // テーブル更新
    updateProductsTable();
    updateInventoryTable();
    updateDashboard();
    
    // モーダルを閉じる
    closeModal('product-modal');
}

// 商品編集
function editProduct(id) {
    showProductModal(id);
}

// 商品削除
function deleteProduct(id) {
    showConfirmModal(`商品ID ${id} を削除しますか？<br>関連する在庫・発注データも削除されます。`, function() {
        // 商品削除
        data.products = data.products.filter(p => p.id !== id);
        
        // 関連する在庫データを削除
        data.inventory = data.inventory.filter(inv => inv.productId !== id);
        
        // 関連する発注明細を削除
        const affectedOrderIds = new Set();
        data.orderItems.forEach(item => {
            if (item.productId === id) {
                affectedOrderIds.add(item.orderId);
            }
        });
        data.orderItems = data.orderItems.filter(item => item.productId !== id);
        
        // 影響を受けた発注の合計金額を更新
        affectedOrderIds.forEach(orderId => {
            updateOrderTotal(orderId);
        });
        
        // データを保存
        saveDataToStorage();
        
        // テーブル更新
        updateProductsTable();
        updateInventoryTable();
        updateOrdersTable();
        updateDashboard();
    });
}

// 発注モーダル表示
function showOrderModal() {
    // フォームリセット
    document.getElementById('order-form').reset();
    
    // 発注商品テーブルをクリア
    document.querySelector('#order-products-table tbody').innerHTML = '';
    document.getElementById('order-total').textContent = '¥0';
    
    // モーダル表示
    document.getElementById('order-modal').style.display = 'block';
}

// 発注フォームに商品を追加
function addOrderItem() {
    const productId = document.getElementById('order-product-select').value;
    const quantity = parseInt(document.getElementById('order-quantity').value, 10);
    
    if (!productId || quantity <= 0) {
        alert('商品と数量を正しく選択してください。');
        return;
    }
    
    const product = findProductById(productId);
    if (!product) return;
    
    const tbody = document.querySelector('#order-products-table tbody');
    
    // 既に同じ商品が含まれているかチェック
    const existingRow = tbody.querySelector(`tr[data-product-id="${productId}"]`);
    if (existingRow) {
        const existingQuantity = parseInt(existingRow.querySelector('input[name="item-quantity"]').value, 10);
        existingRow.querySelector('input[name="item-quantity"]').value = existingQuantity + quantity;
        updateOrderItemSubtotal(existingRow);
    } else {
        // 新しい行を追加
        const tr = document.createElement('tr');
        tr.dataset.productId = productId;
        tr.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>¥${product.price.toLocaleString()}</td>
            <td><input type="number" name="item-quantity" value="${quantity}" min="1" onchange="updateOrderItemSubtotal(this.parentNode.parentNode)"></td>
            <td class="subtotal">¥${(product.price * quantity).toLocaleString()}</td>
            <td><button type="button" class="btn-icon delete" onclick="removeOrderItem(this.parentNode.parentNode)">🗑️</button></td>
        `;
        tbody.appendChild(tr);
    }
    
    // 合計を更新
    updateOrderFormTotal();
    
    // 選択をリセット
    document.getElementById('order-product-select').value = '';
    document.getElementById('order-quantity').value = '1';
}

// 発注フォームから商品を削除
function removeOrderItem(row) {
    row.remove();
    updateOrderFormTotal();
}

// 発注フォームの商品小計を更新
function updateOrderItemSubtotal(row) {
    const quantity = parseInt(row.querySelector('input[name="item-quantity"]').value, 10);
    const productId = row.dataset.productId;
    const product = findProductById(productId);
    
    if (product && quantity > 0) {
        const subtotal = product.price * quantity;
        row.querySelector('.subtotal').textContent = `¥${subtotal.toLocaleString()}`;
        updateOrderFormTotal();
    }
}

// 発注フォームの合計金額を更新
function updateOrderFormTotal() {
    let total = 0;
    document.querySelectorAll('#order-products-table tbody tr').forEach(row => {
        const subtotalText = row.querySelector('.subtotal').textContent;
        const subtotal = parseInt(subtotalText.replace(/[^0-9]/g, ''), 10);
        total += subtotal;
    });
    
    document.getElementById('order-total').textContent = `¥${total.toLocaleString()}`;
}

// 発注を保存
function saveOrder() {
    const rows = document.querySelectorAll('#order-products-table tbody tr');
    if (rows.length === 0) {
        alert('発注する商品がありません。');
        return;
    }
    
    // 新しい発注IDを生成
    const lastId = data.orders.length > 0 
        ? data.orders[data.orders.length - 1].id
        : 'ORD000';
    const numericPart = parseInt(lastId.substring(3), 10);
    const newId = 'ORD' + String(numericPart + 1).padStart(3, '0');
    
    // 総額を計算
    let totalAmount = 0;
    const items = [];
    
    rows.forEach(row => {
        const productId = row.dataset.productId;
        const quantity = parseInt(row.querySelector('input[name="item-quantity"]').value, 10);
        const product = findProductById(productId);
        
        if (product && quantity > 0) {
            const unitPrice = product.price;
            const subtotal = unitPrice * quantity;
            totalAmount += subtotal;
            
            items.push({
                orderId: newId,
                productId,
                quantity,
                unitPrice
            });
        }
    });
    
    // 発注データを追加
    data.orders.push({
        id: newId,
        date: getCurrentDate(),
        status: '発注中',
        totalAmount
    });
    
    // 発注明細を追加
    data.orderItems = [...data.orderItems, ...items];
    
    // データを保存
    saveDataToStorage();
    
    // テーブルを更新
    updateOrdersTable();
    updateInventoryTable(); // 発注中ステータスを反映
    updateDashboard();
    
    // モーダルを閉じる
    closeModal('order-modal');
}

// 発注詳細を表示
function showOrderDetail(orderId) {
    const order = data.orders.find(o => o.id === orderId);
    if (!order) return;
    
    // オーダー情報を設定
    document.getElementById('detail-order-id').textContent = order.id;
    document.getElementById('detail-order-date').textContent = order.date;
    document.getElementById('detail-order-status').textContent = order.status;
    document.getElementById('detail-order-total').textContent = `¥${order.totalAmount.toLocaleString()}`;
    
    // 明細テーブルを更新
    const tbody = document.querySelector('#order-detail-table tbody');
    tbody.innerHTML = '';
    
    const items = data.orderItems.filter(item => item.orderId === orderId);
    items.forEach(item => {
        const product = findProductById(item.productId);
        if (!product) return;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.productId}</td>
            <td>${product.name}</td>
            <td>¥${item.unitPrice.toLocaleString()}</td>
            <td>${item.quantity}</td>
            <td>¥${(item.unitPrice * item.quantity).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
    
    // 発注中の場合のみ操作ボタンを表示
    const actions = document.getElementById('order-detail-actions');
    if (order.status === '発注中') {
        document.getElementById('receive-order-btn').style.display = 'inline-block';
        document.getElementById('cancel-order-btn').style.display = 'inline-block';
    } else {
        document.getElementById('receive-order-btn').style.display = 'none';
        document.getElementById('cancel-order-btn').style.display = 'none';
    }
    
    // モーダルを表示
    document.getElementById('order-detail-modal').style.display = 'block';
}

// 発注取消確認を表示
function showCancelOrderConfirm(orderId) {
    showConfirmModal(`発注 ${orderId} を取り消しますか？`, function() {
        cancelOrder(orderId);
    });
}

// 発注取消
function cancelOrder(orderId) {
    const orderIndex = data.orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        // 発注ステータスを更新
        data.orders[orderIndex].status = '取消';
        
        // データを保存
        saveDataToStorage();
        
        // テーブルを更新
        updateOrdersTable();
        updateInventoryTable();
        updateDashboard();
        
        // 詳細モーダルが開いていれば更新
        if (document.getElementById('order-detail-modal').style.display === 'block') {
            showOrderDetail(orderId);
        }
    }
}

// 入荷確定
function receiveOrder() {
    const orderId = document.getElementById('detail-order-id').textContent;
    const order = data.orders.find(o => o.id === orderId);
    if (!order || order.status !== '発注中') return;
    
    // 該当する発注明細を抽出
    const items = data.orderItems.filter(item => item.orderId === orderId);
    
    // 在庫を更新
    items.forEach(item => {
        const inventoryItem = data.inventory.find(inv => inv.productId === item.productId);
        if (inventoryItem) {
            inventoryItem.quantity += item.quantity;
            inventoryItem.lastUpdated = getCurrentDate();
        }
    });
    
    // 発注ステータスを更新
    order.status = '完了';
    
    // データを保存
    saveDataToStorage();
    
    // テーブルを更新
    updateOrdersTable();
    updateInventoryTable();
    updateDashboard();
    
    // 詳細モーダルを更新
    showOrderDetail(orderId);
}

// 在庫更新モーダル表示
function showInventoryModal() {
    // フォームリセット
    document.getElementById('inventory-form').reset();
    
    // 日付を今日に設定
    document.getElementById('inventory-date').value = getCurrentDate();
    
    // モーダル表示
    document.getElementById('inventory-modal').style.display = 'block';
}

// 特定商品の在庫更新モーダル表示
function showInventoryUpdate(productId) {
    showInventoryModal();
    document.getElementById('inventory-product').value = productId;
}

// 在庫更新実行
function updateInventory() {
    const productId = document.getElementById('inventory-product').value;
    const quantity = parseInt(document.getElementById('inventory-quantity').value, 10);
    const date = document.getElementById('inventory-date').value;
    
    if (!productId || quantity <= 0 || !date) {
        alert('すべての項目を正しく入力してください。');
        return;
    }
    
    // 在庫アイテムを検索
    const inventoryItem = data.inventory.find(inv => inv.productId === productId);
    if (inventoryItem) {
        // 在庫数を更新
        inventoryItem.quantity += quantity;
        inventoryItem.lastUpdated = date;
    } else {
        // 新しい在庫アイテムを追加
        data.inventory.push({
            productId,
            quantity,
            lastUpdated: date
        });
    }
    
    // データを保存
    saveDataToStorage();
    
    // テーブルを更新
    updateInventoryTable();
    updateDashboard();
    
    // モーダルを閉じる
    closeModal('inventory-modal');
}

// 特定商品の発注作成
function createOrderForProduct(productId) {
    const product = findProductById(productId);
    if (!product) return;
    
    // 発注モーダルを表示
    showOrderModal();
    
    // 商品を選択して数量を標準発注量に設定
    document.getElementById('order-product-select').value = productId;
    document.getElementById('order-quantity').value = product.standardOrder;
    
    // 発注フォームに商品を追加
    addOrderItem();
}

// 発注合計を更新
function updateOrderTotal(orderId) {
    const items = data.orderItems.filter(item => item.orderId === orderId);
    const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    const orderIndex = data.orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        data.orders[orderIndex].totalAmount = total;
    }
}

// 確認モーダル表示
function showConfirmModal(message, callback) {
    document.getElementById('confirm-message').innerHTML = message;
    document.getElementById('confirm-yes').dataset.callback = callback.name;
    document.getElementById('confirm-modal').style.display = 'block';
}

// モーダルを閉じる
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ユーティリティ関数：商品検索
function findProductById(id) {
    return data.products.find(p => p.id === id);
}

// ユーティリティ関数：商品が発注中かどうか
function isProductOrdered(productId) {
    // 発注中の注文を抽出
    const pendingOrders = data.orders.filter(order => order.status === '発注中');
    // それらの注文に含まれる明細をフラット化して商品IDでフィルタ
    const orderedItems = pendingOrders.flatMap(order => 
        data.orderItems.filter(item => item.orderId === order.id && item.productId === productId)
    );
    return orderedItems.length > 0;
}

// ユーティリティ関数：現在の日付を取得（YYYY-MM-DD形式）
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}