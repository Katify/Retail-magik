// Load cart from localStorage
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (cart.length === 0) {
    cartItems.innerHTML = `<div class="empty-cart">Your cart is empty. <a href="products.html">Continue shopping</a></div>`;
    return;
  }

  let html = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;
    html += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="item-details">
          <h3>${item.name}</h3>
          <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
        </div>
        <button class="remove-btn" data-id="${item.id}">Remove</button>
      </div>
    `;
  });

  cartItems.innerHTML = html;
  cartTotal.textContent = `$${total.toFixed(2)}`;

  // Add event listeners for remove buttons
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const newCart = cart.filter((item) => item.id !== btn.dataset.id);
      localStorage.setItem("cart", JSON.stringify(newCart));
      loadCart(); // Refresh display
    });
  });
}

// Initialize
loadCart();
