/* FUOCO — menu data. Every page reads from here.
   Images are served by Unsplash's CDN; `img(id, w)` builds a sized URL. */
(function () {
  "use strict";
  var img = function (id, w, h) {
    return "https://images.unsplash.com/" + id + "?auto=format&fit=crop&q=80&w=" + (w || 800) + (h ? "&h=" + h : "");
  };

  var SIZES = [
    { id: "s", label: 'Small 8"', serves: "1 person" },
    { id: "m", label: 'Medium 10"', serves: "2 people" },
    { id: "l", label: 'Large 12"', serves: "3–4 people" },
  ];

  var MENU = [
    // ---------- pizzas ----------
    {
      id: "pepperoni-inferno", cat: "pizza", name: "Pepperoni Inferno", badge: "Bestseller", spicy: 2, veg: false,
      desc: "Double beef pepperoni, fior di latte, San Marzano tomato and a drizzle of chilli honey.",
      photo: "photo-1628840042765-356cda07504e", prices: { s: 1050, m: 1650, l: 2250 },
    },
    {
      id: "margherita-fuoco", cat: "pizza", name: "Margherita Fuoco", badge: "Classic", spicy: 0, veg: true,
      desc: "Our 48-hour dough, San Marzano tomato, buffalo mozzarella, basil and olive oil.",
      photo: "photo-1574071318508-1cdbab80d002", prices: { s: 850, m: 1350, l: 1850 },
    },
    {
      id: "green-crush", cat: "pizza", name: "Green Crush", badge: "New", spicy: 0, veg: true,
      desc: "Garlic cream, spinach, ricotta clouds, mozzarella and toasted pine nuts.",
      photo: "photo-1593560708920-61dd98c46a4e", prices: { s: 950, m: 1550, l: 2100 },
    },
    {
      id: "fiery-tikka", cat: "pizza", name: "Fiery Chicken Tikka", badge: "Desi favourite", spicy: 3, veg: false,
      desc: "Charcoal chicken tikka, onion, green chilli, mozzarella and mint-yoghurt swirl.",
      photo: "photo-1565299624946-b28f40a0ae38", prices: { s: 1100, m: 1750, l: 2350 },
    },
    {
      id: "garden-of-fire", cat: "pizza", name: "Garden of Fire", badge: "", spicy: 1, veg: true,
      desc: "Roasted peppers, cherry tomato, olives, red onion, basil and a chilli flake finish.",
      photo: "photo-1585238342024-78d387f4a707", prices: { s: 900, m: 1450, l: 1950 },
    },
    {
      id: "four-cheese-melt", cat: "pizza", name: "Four Cheese Melt", badge: "", spicy: 0, veg: true,
      desc: "Mozzarella, cheddar, gorgonzola and parmesan on a white garlic base.",
      photo: "photo-1513104890138-7c749659a591", prices: { s: 1000, m: 1600, l: 2150 },
    },
    {
      id: "rocket-supreme", cat: "pizza", name: "Rocket Supreme", badge: "", spicy: 0, veg: false,
      desc: "Smoked beef, mozzarella, tomato, fresh rocket and shaved parmesan.",
      photo: "photo-1528137871618-79d2761e3fd5", prices: { s: 1150, m: 1800, l: 2400 },
    },
    {
      id: "loaded-feast", cat: "pizza", name: "Loaded Feast", badge: "Sharing", spicy: 1, veg: false,
      desc: "Pepperoni, chicken, beef, mushrooms, peppers and olives. Everything, all at once.",
      photo: "photo-1594007654729-407eedc4be65", prices: { s: 1200, m: 1900, l: 2550 },
    },
    // ---------- sides ----------
    { id: "fire-fries", cat: "sides", name: "Fire Fries", badge: "", spicy: 1, veg: true, desc: "Crisp fries, smoked paprika salt and garlic mayo.", photo: "photo-1573080496219-bb080dd4f877", price: 450 },
    { id: "cheese-pull-bread", cat: "sides", name: "Cheese Pull Garlic Bread", badge: "Must try", spicy: 0, veg: true, desc: "Wood-fired garlic bread under a blanket of mozzarella.", photo: "photo-1541745537411-b8046dc6d66c", price: 550 },
    { id: "pizza-knots", cat: "sides", name: "Garlic Knots", badge: "", spicy: 0, veg: true, desc: "Six dough knots, garlic butter, parsley and marinara.", photo: "photo-1600028068383-ea11a7a101f3", price: 420 },
    // ---------- drinks ----------
    { id: "mint-lemonade", cat: "drinks", name: "Mint Lemonade", badge: "", spicy: 0, veg: true, desc: "Fresh mint, lime and crushed ice.", photo: "photo-1513558161293-cdaf765ed2fd", price: 300 },
    { id: "cold-soda", cat: "drinks", name: "Chilled Soft Drink", badge: "", spicy: 0, veg: true, desc: "345 ml can, ice cold. Ask for your favourite flavour.", photo: "photo-1437418747212-8d9709afab22", price: 150 },
    // ---------- desserts ----------
    { id: "lava-cake", cat: "desserts", name: "Chocolate Lava Cake", badge: "", spicy: 0, veg: true, desc: "Warm chocolate cake with a molten centre.", photo: "photo-1578985545062-69928b1d9587", price: 550 },
    { id: "donut-stack", cat: "desserts", name: "Sprinkle Donut Stack", badge: "", spicy: 0, veg: true, desc: "Three glazed donuts with rainbow sprinkles.", photo: "photo-1551024601-bec78aea704b", price: 480 },
  ];

  var CATS = [
    { id: "all", label: "All" },
    { id: "pizza", label: "Pizzas" },
    { id: "sides", label: "Sides" },
    { id: "drinks", label: "Drinks" },
    { id: "desserts", label: "Desserts" },
  ];

  // build-your-own options
  var BUILD = {
    base: { s: 700, m: 1100, l: 1500 },
    crusts: [
      { id: "classic", label: "Classic hand-tossed", price: 0 },
      { id: "thin", label: "Thin & crispy", price: 0 },
      { id: "stuffed", label: "Cheese-stuffed crust", price: 250 },
    ],
    sauces: [
      { id: "tomato", label: "San Marzano tomato", color: "#c8321a" },
      { id: "bbq", label: "Smoky BBQ", color: "#6b2410" },
      { id: "garlic", label: "Garlic cream", color: "#efe2c4" },
    ],
    toppings: [
      { id: "pepperoni", label: "Pepperoni", price: 180, veg: false },
      { id: "chicken", label: "Chicken tikka", price: 200, veg: false },
      { id: "mushroom", label: "Mushrooms", price: 120, veg: true },
      { id: "olive", label: "Black olives", price: 100, veg: true },
      { id: "pepper", label: "Green peppers", price: 100, veg: true },
      { id: "onion", label: "Red onion", price: 80, veg: true },
      { id: "jalapeno", label: "Jalapeños", price: 100, veg: true },
      { id: "basil", label: "Fresh basil", price: 60, veg: true },
      { id: "extra-cheese", label: "Extra cheese", price: 200, veg: true },
    ],
  };

  var DEALS = [
    {
      id: "duo-night", name: "Duo Night", tag: "For two",
      desc: "2 medium pizzas of your choice, garlic bread and 2 drinks.",
      price: 3600, was: 4350, photo: "photo-1565299624946-b28f40a0ae38",
      items: [{ id: "pepperoni-inferno", size: "m", qty: 1 }, { id: "margherita-fuoco", size: "m", qty: 1 }, { id: "cheese-pull-bread", qty: 1 }, { id: "mint-lemonade", qty: 2 }],
    },
    {
      id: "family-fire", name: "Family Fire", tag: "Feeds 4–5",
      desc: "2 large pizzas, fire fries, garlic knots and 4 drinks.",
      price: 5900, was: 7120, photo: "photo-1594007654729-407eedc4be65",
      items: [{ id: "loaded-feast", size: "l", qty: 1 }, { id: "fiery-tikka", size: "l", qty: 1 }, { id: "fire-fries", qty: 1 }, { id: "pizza-knots", qty: 1 }, { id: "cold-soda", qty: 4 }],
    },
    {
      id: "solo-slice", name: "Solo Hunger", tag: "Lunch deal",
      desc: "1 small pizza, fries and a drink. Weekdays 12–4 pm.",
      price: 1350, was: 1650, photo: "photo-1628840042765-356cda07504e",
      items: [{ id: "pepperoni-inferno", size: "s", qty: 1 }, { id: "fire-fries", qty: 1 }, { id: "cold-soda", qty: 1 }],
    },
  ];

  window.FUOCO_DATA = { img: img, SIZES: SIZES, MENU: MENU, CATS: CATS, BUILD: BUILD, DEALS: DEALS };
})();
