// Константы
const WHATSAPP_NUMBER = '77475040576'; // Замените на реальный номер
const WHATSAPP_BASE_URL = 'https://wa.me/';
const CONTACT_NAME = 'Майкл';
const CONTACT_SURNAME = 'Джексон';
const FORMATTED_PHONE = '+7 747 504 05 76'; // Для отображения в футере

// Данные продуктов
const productsData = {
    "products": [
        {
            "id": 1,
            "name": "Молоко Савушкин продукт",
            "imageURL": "https://fakeimg.pl/400x300",
            "price": 640,
            "description": "Свежее молоко высшего сорта с натуральным вкусом",
            "compound": "Цельное нормализованное молоко"
        },
        {
            "id": 2,
            "name": "Сыр Брест-Литовск классический",
            "imageURL": "https://fakeimg.pl/400x300",
            "price": 1700,
            "description": "Полутвердый сыр с классическим вкусом",
            "compound": "Молоко нормализованное, соль, закваска, ферментный препарат"
        },
        {
            "id": 3,
            "name": "Творог Минская марка",
            "imageURL": "https://fakeimg.pl/400x300",
            "price": 860,
            "description": "Нежный творог 9% жирности",
            "compound": "Молоко цельное, молоко обезжиренное, закваска"
        },
        {
            "id": 4,
            "name": "Колбаса Минская марка",
            "imageURL": "https://fakeimg.pl/400x300",
            "price": 860,
            "description": "Колбаса сырокопченая",
            "compound": "Говядина, свинина, соль, специи, вода"
        }
    ]
};

// DOM элементы
const productsContainer = document.getElementById('products');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const orderBtn = document.getElementById('orderBtn');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalDescription = document.getElementById('modalDescription');
const modalCompound = document.getElementById('modalCompound');
const modalPrice = document.getElementById('modalPrice');
const modalAddToCart = document.getElementById('modalAddToCart');
const whatsappHeader = document.getElementById('whatsappHeader');
const whatsappFooter = document.getElementById('whatsappFooter');
const footerName = document.getElementById('footerName');
const footerPhone = document.getElementById('footerPhone');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// Состояние приложения
let products = productsData.products;
let filteredProducts = [...products];
let cart = JSON.parse(localStorage.getItem('cart')) || {};
let currentProduct = null;
let currentPage = 1;
const itemsPerPage = 8;

// Сортировка
function sortProducts(sortType) {
    switch(sortType) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        default:
            filteredProducts = [...products];
    }
    currentPage = 1; // Сбрасываем страницу при сортировке
    renderProducts();
    updatePagination();
}

// Пагинация
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

function getCurrentPageProducts() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredProducts.slice(start, end);
}

// Обновляем рендеринг продуктов
function renderProducts() {
    const currentPageProducts = getCurrentPageProducts();
    productsContainer.innerHTML = currentPageProducts.map(product => `
        <div class="product-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer" onclick="showProductModal(${product.id})">
            <img src="${product.imageURL}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-bold text-lg mb-2">${product.name}</h3>
                <div class="flex justify-between items-center">
                    <span class="text-lg font-bold">${product.price.toFixed(0)} ₸</span>
                    <button 
                        class="bg-belarus-green text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors btn-hover-effect"
                        onclick="event.stopPropagation(); addToCart(${product.id})"
                    >
                        В корзину
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Поиск и фильтрация
function filterProducts(query) {
    query = query.toLowerCase();
    filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
    currentPage = 1; // Сбрасываем страницу при поиске
    renderProducts();
    updatePagination();
}

// Модальное окно продукта
function showProductModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;

    modalTitle.textContent = currentProduct.name;
    modalImage.src = currentProduct.imageURL;
    modalImage.alt = currentProduct.name;
    modalDescription.textContent = currentProduct.description;
    modalCompound.textContent = currentProduct.compound;
    modalPrice.textContent = `${currentProduct.price.toFixed(0)} ₸`;
    productModal.classList.add('active');
}

// Корзина
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (cart[productId]) {
        cart[productId].quantity++;
    } else {
        cart[productId] = {
            name: product.name,
            price: product.price,
            quantity: 1
        };
    }

    // Добавляем эффект пульсации для кнопки корзины
    cartBtn.classList.add('cart-pulse');
    setTimeout(() => cartBtn.classList.remove('cart-pulse'), 300);

    // Показываем уведомление
    showNotification('Товар добавлен в корзину!');

    saveCart();
    updateCartCount();
    renderCartItems();
}

function updateCartCount() {
    const count = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
}

function renderCartItems() {
    cartItems.innerHTML = Object.entries(cart).map(([id, item]) => `
        <div class="flex items-center justify-between p-2 border-b">
            <div class="flex-1">
                <h4 class="font-bold">${item.name}</h4>
                <p class="text-gray-600">${item.price.toFixed(0)} ₸</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="updateQuantity(${id}, ${item.quantity - 1})" class="text-gray-500 hover:text-gray-700">-</button>
                <input type="number" value="${item.quantity}" min="1" class="cart-item-quantity" 
                    onchange="updateQuantity(${id}, this.value)">
                <button onclick="updateQuantity(${id}, ${item.quantity + 1})" class="text-gray-500 hover:text-gray-700">+</button>
            </div>
        </div>
    `).join('');

    const total = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = `${total.toFixed(0)} ₸`;
}

function updateQuantity(productId, quantity) {
    quantity = parseInt(quantity);
    if (quantity < 1) {
        delete cart[productId];
    } else {
        cart[productId].quantity = quantity;
    }
    saveCart();
    updateCartCount();
    renderCartItems();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// WhatsApp интеграция
function generateWhatsAppMessage() {
    const items = Object.values(cart).map(item => 
        `• ${item.name} (${item.quantity} шт.) - ${(item.price * item.quantity).toFixed(0)} ₸`
    ).join('\n\n');
    const total = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
    return encodeURIComponent(`Здравствуйте, я хотел(а) бы приобрести:\n\n${items}\n\nИтого: ${total.toFixed(0)} ₸`);
}

function openWhatsApp() {
    const message = generateWhatsAppMessage();
    window.open(`${WHATSAPP_BASE_URL}${WHATSAPP_NUMBER}?text=${message}`, '_blank');
}

// Обработчики событий
cartBtn.addEventListener('click', () => cartSidebar.classList.add('open'));
closeCart.addEventListener('click', () => cartSidebar.classList.remove('open'));
closeModal.addEventListener('click', () => productModal.classList.remove('active'));
orderBtn.addEventListener('click', openWhatsApp);
whatsappHeader.addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('Открываем WhatsApp...');
    setTimeout(() => window.open(`${WHATSAPP_BASE_URL}${WHATSAPP_NUMBER}`, '_blank'), 500);
});
whatsappFooter.addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('Открываем WhatsApp...');
    setTimeout(() => window.open(`${WHATSAPP_BASE_URL}${WHATSAPP_NUMBER}`, '_blank'), 500);
});
modalAddToCart.addEventListener('click', () => {
    if (currentProduct) {
        addToCart(currentProduct.id);
        productModal.classList.remove('active');
    }
});

// Обновление контактной информации
function updateContactInfo() {
    footerName.textContent = `${CONTACT_NAME} ${CONTACT_SURNAME}`;
    footerPhone.textContent = FORMATTED_PHONE;
}

// Функция для показа уведомлений
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-belarus-green text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 z-50';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Анимация появления
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);

    // Анимация исчезновения
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Добавляем обработчик поиска
searchInput.addEventListener('input', (e) => {
    filterProducts(e.target.value);
});

// Добавляем обработчики событий
sortSelect.addEventListener('change', (e) => sortProducts(e.target.value));
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderProducts();
        updatePagination();
    }
});
nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
        updatePagination();
    }
});

// Инициализация
renderProducts();
updateCartCount();
renderCartItems();
updateContactInfo(); 