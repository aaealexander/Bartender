const menuItems = [
  { id: 1, name: "Mojito", price: 8 },
  { id: 2, name: "Old Fashioned", price: 10 },
  { id: 3, name: "Margarita", price: 9 },
  { id: 4, name: "Martini", price: 11 }
];

const localStorageKey = "bartenderOrders";
const shoppingCart = [];

function saveOrdersToLocalStorage(orderList) {
  localStorage.setItem(localStorageKey, JSON.stringify(orderList));
}

function getOrdersFromLocalStorage() {
  const storedData = localStorage.getItem(localStorageKey);
  if (storedData === null) {
    return [];
  }
  return JSON.parse(storedData);
}

function renderMenuItems() {
  const menuListElement = document.getElementById("menuList");

  menuItems.forEach(menuItem => {
    const listItem = document.createElement("li");
    listItem.className = "item";

    listItem.innerHTML = `
      <span>${menuItem.name}</span>
      <span class="price">$${menuItem.price}</span>
      <input class="qty" type="number" min="0" max="10" value="0" data-id="${menuItem.id}" />
    `;

    menuListElement.appendChild(listItem);
  });

  menuListElement.addEventListener("change", function (event) {
    if (event.target.matches(".qty")) {
      const selectedId = parseInt(event.target.dataset.id);
      const selectedQuantity = parseInt(event.target.value);

      const existingItemIndex = shoppingCart.findIndex(item => item.id === selectedId);
      if (existingItemIndex !== -1) {
        shoppingCart.splice(existingItemIndex, 1);
      }

      if (selectedQuantity > 0) {
        const selectedItem = menuItems.find(item => item.id === selectedId);
        shoppingCart.push({
          ...selectedItem,
          quantity: selectedQuantity
        });
      }

      updateCartDisplay();
    }
  });
}

function updateCartDisplay() {
  const cartElement = document.getElementById("cart");

  if (shoppingCart.length === 0) {
    cartElement.innerHTML = "empty";
    return;
  }

  const cartSummary = shoppingCart.map(item => {
    return `${item.name} × ${item.quantity}`;
  }).join("<br>");

  cartElement.innerHTML = cartSummary;
}

function handlePlaceOrder() {
  const orderList = getOrdersFromLocalStorage();
  const currentTime = Date.now();

  const orderTotal = shoppingCart.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);

  const newOrder = {
    id: currentTime,
    items: [...shoppingCart],
    total: orderTotal,
    ready: false
  };

  orderList.push(newOrder);
  saveOrdersToLocalStorage(orderList);
  shoppingCart.length = 0;

  updateCartDisplay();

  const resultElement = document.getElementById("orderResult");
  resultElement.innerText = "Order placed!";

  setTimeout(function () {
    location.href = "index.html";
  }, 1000);
}

function renderOrderQueue() {
  const queueElement = document.getElementById("queue");
  const orderList = getOrdersFromLocalStorage();

  if (orderList.length === 0) {
    queueElement.innerHTML = "<p class='muted'>No orders yet.</p>";
    return;
  }

  queueElement.innerHTML = "";

  orderList.forEach(order => {
    const orderDiv = document.createElement("div");
    orderDiv.className = "order";

    const itemDescriptions = order.items.map(item => {
      return `${item.name} × ${item.quantity}`;
    }).join(", ");

    const isReady = order.ready;
    const buttonDisabled = isReady ? "disabled" : "";

    orderDiv.innerHTML = `
      <div>Order #${order.id}</div>
      <div>${itemDescriptions}</div>
      <div>Total: $${order.total}</div>
      <span class="badge ${isReady ? "ready" : ""}">${isReady ? "Ready" : "In Progress"}</span>
      <button data-id="${order.id}" ${buttonDisabled}>Mark Ready</button>
    `;

    queueElement.appendChild(orderDiv);
  });

  queueElement.addEventListener("click", function (event) {
    if (event.target.matches("button")) {
      const orderId = parseInt(event.target.dataset.id);
      const orderList = getOrdersFromLocalStorage();
      const matchingOrder = orderList.find(order => order.id === orderId);

      if (matchingOrder) {
        matchingOrder.ready = true;
        saveOrdersToLocalStorage(orderList);
        renderOrderQueue();
      }
    }
  });
}

const currentPage = document.body.dataset.page;

if (currentPage === "menu") {
  renderMenuItems();
  const placeOrderButton = document.getElementById("placeOrderBtn");
  placeOrderButton.addEventListener("click", handlePlaceOrder);
} else if (currentPage === "queue") {
  renderOrderQueue();
}
