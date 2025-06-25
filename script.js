document.addEventListener('DOMContentLoaded', function() {
  // Carrega os produtos do JSON
  fetch('produtos.json')
    .then(response => response.json())
    .then(data => {
      const produtos = data;
      renderFeaturedProducts(produtos);
      renderAllProducts(produtos);
      setupEventListeners(produtos);
    })
    .catch(error => console.error('Erro ao carregar produtos:', error));
  
  // Renderiza produtos em destaque
  function renderFeaturedProducts(produtos) {
    const featuredContainer = document.getElementById('featured-products');
    const featuredProducts = produtos.filter(produto => produto.destaque);
    
    featuredContainer.innerHTML = featuredProducts.map(produto => createProductCard(produto)).join('');
  }
  
  // Renderiza todos os produtos
  function renderAllProducts(produtos) {
    const allProductsContainer = document.getElementById('all-products');
    allProductsContainer.innerHTML = produtos.map(produto => createProductCard(produto)).join('');
  }
  
  // Cria o card do produto
  function createProductCard(produto) {
    return `
            <div class="product-card" data-id="${produto.id}" data-category="${produto.categoria}">
                <div class="product-image" style="background-image: url('${produto.imagem}')">
                    ${produto.destaque ? '<span class="product-badge">Destaque</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${produto.nome}</h3>
                    <p class="product-description">${produto.descricao}</p>
                    <div class="product-price">R$ ${produto.preco.toFixed(2).replace('.', ',')}</div>
                    <div class="product-actions">
                        <button class="btn add-to-cart">Adicionar ao Carrinho</button>
                        <button class="wishlist-btn"><i class="far fa-heart"></i></button>
                    </div>
                </div>
            </div>
        `;
  }
  
  // Configura os event listeners
  function setupEventListeners(produtos) {
    // Filtro de categoria
    document.getElementById('category-filter').addEventListener('change', function() {
      const category = this.value;
      const allProducts = document.querySelectorAll('#all-products .product-card');
      
      allProducts.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
          product.style.display = 'block';
        } else {
          product.style.display = 'none';
        }
      });
    });
    
    // Adicionar ao carrinho
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
        const productCard = e.target.closest('.product-card');
        const productId = parseInt(productCard.dataset.id);
        addToCart(productId, produtos);
      }
      
      // Favoritos
      if (e.target.classList.contains('wishlist-btn') || e.target.closest('.wishlist-btn')) {
        const wishlistBtn = e.target.classList.contains('wishlist-btn') ? e.target : e.target.closest('.wishlist-btn');
        wishlistBtn.classList.toggle('active');
        wishlistBtn.querySelector('i').classList.toggle('far');
        wishlistBtn.querySelector('i').classList.toggle('fas');
      }
    });
  }
  
  // Lógica do carrinho
  let cart = [];
  
  function addToCart(productId, produtos) {
    const product = produtos.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({
        ...product,
        quantity: 1
      });
    }
    
    updateCartCount();
    showNotification(`${product.nome} adicionado ao carrinho!`);
  }
  
  function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = totalItems;
  }
  
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
  
  // Adiciona estilo para a notificação
  const style = document.createElement('style');
  style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #2c3e50;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 1000;
        }
        
        .notification.show {
            opacity: 1;
        }
    `;
  document.head.appendChild(style);
});
