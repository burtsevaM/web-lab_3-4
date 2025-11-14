document.addEventListener("DOMContentLoaded", () => {
    // главная INDEX
    //анимация появления страницы 
    function animate({duration, draw, timing}) {
        let start = performance.now();

        requestAnimationFrame(function animateFrame(time) {
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;

            let progress = timing(timeFraction);
            draw(progress);

            if (timeFraction < 1) {
                requestAnimationFrame(animateFrame);
            }
        });
    }

    // анимация плавное появление страницы
    document.body.style.opacity = 0;
    animate({
        duration: 1200,
        timing: function easeOut(t) { return 1 - Math.pow(1 - t, 3); }, // плавное замедление
        draw: function(progress) {
        document.body.style.opacity = progress;
        }
    });

    //анимация плавного перехода между страницами
    const navLinks = document.querySelectorAll(".nav__link");

    navLinks.forEach(link => {
        link.addEventListener("click", e => {
        e.preventDefault();

        animate({
            duration: 600,
            timing: function easeIn(t) { return t * t; }, // мягкое ускорение
            draw: function(progress) {
            document.body.style.opacity = 1 - progress;
            }
        });

        setTimeout(() => {
            window.location.href = link.href;
        }, 600);
        });
    });

    // подсветка активного пункта меню
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPage) link.classList.add("active");
    });


    //добавление в корзину STORE
    const buyButtons = document.querySelectorAll(".buy-btn");

    buyButtons.forEach(button => {
        button.addEventListener("click", () => {
            const album = button.closest(".album");
            const title = album.querySelector(".album-title").textContent;
            const img = album.querySelector("img").src;

            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const exists = cart.find(item => item.title === title);

            if (!exists) {
                cart.push({ title, img, price: randomPrice(), qty: 1 });
                localStorage.setItem("cart", JSON.stringify(cart));
            }

            button.textContent = "Added to cart!";
            button.classList.add("added");
            button.disabled = true;

            setTimeout(() => window.location.href = "cart.html", 1200);
        });
    });

    function randomPrice() {
        const prices = [35, 40, 50];
        return prices[Math.floor(Math.random() * prices.length)];
    }

    //CART
    if (document.body.classList.contains("body-cart")) {
        const cartContainer = document.querySelector(".cart-container");
        const deliveryAmount = 25.50;

        // загрузка корзины
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        // функция сохранения корзины
        function saveCart() {
            localStorage.setItem("cart", JSON.stringify(cart));
        }

        // функция пересчёта итоговой суммы
        function updateTotal() {
            let subtotal = 0;
            cart.forEach(item => subtotal += item.price * item.qty);
            const total = subtotal + deliveryAmount;
            const totalElem = document.getElementById("total");
            if (totalElem) totalElem.textContent = `$${total.toFixed(2)}`;
        }

        // отрисовка корзины
        function renderCart() {
            const summary = cartContainer.querySelector(".summary");
            document.querySelectorAll(".cart-item").forEach(el => el.remove());

            cart.forEach(item => {
                const div = document.createElement("div");
                div.classList.add("cart-item");
                div.innerHTML = `
                    <img src="${item.img}" alt="${item.title}">
                    <div class="item-info">
                        <p class="title">${item.title}</p>
                        <p class="pieces">Кол-во: 
                            <button class="minus">−</button>
                            <span class="quantity">${item.qty}</span>
                            <button class="plus">+</button>
                        </p>
                    </div>
                    <p class="price" data-price="${item.price}">$${item.price.toFixed(2)}</p>
                `;
                cartContainer.insertBefore(div, summary);
            });

            updateTotal();
        }

        renderCart();

        // обработчик для +/− 
        cartContainer.addEventListener("click", e => {
            if (e.target.classList.contains("plus") || e.target.classList.contains("minus")) {
                const itemElem = e.target.closest(".cart-item");
                const title = itemElem.querySelector(".title").textContent;
                const item = cart.find(p => p.title === title);

                if (!item) return;

                if (e.target.classList.contains("plus")) {
                    item.qty++;
                } else if (e.target.classList.contains("minus")) {
                    item.qty--;
                    if (item.qty < 1) {
                        // удаляем товар
                        cart = cart.filter(p => p.title !== title);
                    }
                }

                saveCart();
                renderCart();
            }
        });

        // оплата
        const payBtn = document.getElementById("payment-btn");
        if (payBtn) {
            payBtn.addEventListener("click", () => {
                payBtn.style.background = "linear-gradient(90deg, #4CAF50, #81C784)";
                payBtn.textContent = "Processing...";
                setTimeout(() => {
                    alert("Thank you for your purchase! 🎵");
                    localStorage.removeItem("cart");
                    window.location.href = "index.html";
                }, 2000);
            });
        }
    }

});
