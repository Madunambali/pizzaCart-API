document.addEventListener("alpine:init", () => {

    Alpine.data('pizzaCart', () => ({
        title: 'Pizza Cart API',
        pizzas: [],
        username: '',
        cartId: '',
        cartPizzas: [],
        cartTotal: 0.00,
        paymentAmount: 0,
        message: '',
        featuredPizzas: [ 
            {
                id: 1,
                flavour: 'Chicken & Mushroom',
                size: 'Medium',
                price: 120.00,
                image: './pizzas.jpeg', 
                description: 'Enjoy our featured pizzas with extra toppings of your choice!!. Try it now add it to your cart, best decision ever.'
            },
            {
                id: 2,
                flavour: 'Sweet Chilli Chicken',
                size: 'Large',
                price: 150.00,
                image: '.pizzas.jpeg' 
            },
            
        ],
        
        login() {
            if (this.username.length > 2) {
                localStorage['username'] = this.username;
                this.createCart();
            } else {
                alert("Username is too short");
            }
        },

        logout() {
            if (confirm('Do you want to logout?')) {
                this.username = '';
                this.cartId = '';
                localStorage.removeItem('cartId'); 
                localStorage.removeItem('username'); 
            }
        },

        createCart() {
            if (!this.username) {
                return Promise.resolve(); 
            }

            const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;

            return axios.get(createCartURL)
                .then(result => {
                    this.cartId = result.data.cart_code;
                    localStorage.setItem('cartId', this.cartId); 
                });
        },

        getCart() {
            const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
            return axios.get(getCartURL);
        },

        addPizza(pizzaId) {
            return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                cart_code: this.cartId,
                pizza_id: pizzaId
            });
        },

        removePizza(pizzaId) {
            return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                cart_code: this.cartId,
                pizza_id: pizzaId
            });
        },

        pay(amount) {
            return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                cart_code: this.cartId,
                amount: amount
            });
        },

        showCartData() {
            this.getCart().then(result => {
                const cartData = result.data;
                this.cartPizzas = cartData.pizzas;
                this.cartTotal = cartData.total;
            });
        },

        init() {
            const storedUsername = localStorage.getItem('username');
            if (storedUsername) {
                this.username = storedUsername;
            }

            axios.get('https://pizza-api.projectcodex.net/api/pizzas')
                .then(result => {
                    this.pizzas = result.data.pizzas;
                })
                .catch(error => {
                    console.error('Error fetching pizzas:', error);
                });

            if (!this.cartId) {
                this.createCart()
                    .then(() => {
                        this.showCartData();
                    });
            }
        },

        addPizzaToCart(pizzaId) {
            this.addPizza(pizzaId)
                .then(() => {
                    this.showCartData();
                });
        },

        removePizzaFromCart(pizzaId) {
            this.removePizza(pizzaId)
                .then(() => {
                    this.showCartData();
                });
        },

        payForCart() {
            this.pay(this.paymentAmount)
                .then(result => {
                    if (result.data.status === 'failure') { 
                        this.message = result.data.message;
                        setTimeout(() => this.message = '', 3000);
                    } else {
                        this.message = 'Payment received!';
                        setTimeout(() => {
                            this.message = '';
                            this.cartPizzas = [];
                            this.cartTotal = 0.00;
                            this.cartId = '';
                            this.paymentAmount = 0;
                            localStorage.removeItem('cartId'); 
                            this.createCart();
                        }, 3000);
                    }
                })
                .catch(error => {
                    console.error('Error paying for cart:', error);
                });
        }
    }));
});
