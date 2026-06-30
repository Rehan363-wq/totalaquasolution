// Default Products Fallback Array
const defaultProducts = [
  {
    id: 1,
    brand: "Kent",
    name: "Kent Grand Plus",
    type: "RO+UV+UF",
    price: 16500,
    originalPrice: 19500,
    badge: "Bestseller",
    specs: ["TDS Controller", "9L Storage Tank", "Save Water Technology", "1 Year Brand Warranty"]
  },
  {
    id: 2,
    brand: "Kent",
    name: "Kent Gold",
    type: "UF",
    price: 3200,
    originalPrice: 3800,
    badge: "Non-Electric",
    specs: ["Gravity Based Filtration", "20L Storage Tank", "Food-Grade Plastic", "6 Months Warranty"]
  },
  {
    id: 3,
    brand: "Aquaguard",
    name: "Aquaguard Ritz",
    type: "RO+UV",
    price: 18999,
    originalPrice: 22000,
    badge: "Copper Active",
    specs: ["Alkaline Boost Tech", "Active Copper Filter", "Advanced MTDS Controller", "1 Year Warranty"]
  },
  {
    id: 4,
    brand: "Aquaguard",
    name: "Aquaguard Aura",
    type: "UV+UF",
    price: 8499,
    originalPrice: 10500,
    badge: "Eco-Friendly",
    specs: ["Active Copper Filter", "Dual Filtration", "Compact Design", "1 Year Brand Warranty"]
  },
  {
    id: 5,
    brand: "Pureit",
    name: "Pureit Copper+ Eco",
    type: "RO+UV+UF",
    price: 21500,
    originalPrice: 24999,
    badge: "Premium",
    specs: ["Copper Charge Technology", "Eco Recovery (Save Water)", "8L Storage Tank", "1 Year Warranty"]
  },
  {
    id: 6,
    brand: "Pureit",
    name: "Pureit Classic",
    type: "RO",
    price: 11999,
    originalPrice: 14500,
    badge: "Value for Money",
    specs: ["TDS Modulator", "6L Storage Tank", "Advanced 6-Stage Tech", "1 Year Brand Warranty"]
  },
  {
    id: 7,
    brand: "Livpure",
    name: "Livpure Bolt",
    type: "RO+UV",
    price: 10499,
    originalPrice: 12999,
    badge: "Smart RO",
    specs: ["7-Stage Filtration", "7L Storage Tank", "Mineralizer", "1 Year Brand Warranty"]
  },
  {
    id: 8,
    brand: "Livpure",
    name: "Livpure Glitz",
    type: "RO+UV+UF",
    price: 12499,
    originalPrice: 14999,
    badge: "Hot Seller",
    specs: ["Alkaline Filter", "Smart LED Indicators", "8L Storage Tank", "1 Year Warranty"]
  }
];

let products = [];

// Supabase Configuration
const SUPABASE_URL = "https://givabiaeqvlamyvigsjs.supabase.co";
const SUPABASE_KEY = "sb_publishable_35Fcp9wKNOc2DpzmQqHeyw_jmnoq85m";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Default configurations
const defaultConfig = {
  shopName: "Total Aqua Solution",
  tagline: "Pure Water, Healthy Life",
  location: "Sikar (Rajasthan)",
  whatsapp: "919876543210",
  phone: "+91 98765 43210",
  address: "Devipura Rd, near S. N, Bisayatiyan Mohalla, Sikar, Rajasthan 332001",
  hours: "9:00 AM to 8:00 PM (All Days)"
};

// Current active configuration
let currentConfig = { ...defaultConfig };

// Active catalog filters state
let activeFilters = {
  brand: "all",
  type: "all",
  price: "all"
};

// Selected product for WhatsApp Checkout
let selectedProduct = null;

// DOM Elements
const bodyEl = document.body;

// Navigation
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const navLinks = document.querySelectorAll(".nav-link");



// Display elements (to sync config)
const shopNameDisplays = document.querySelectorAll(".shop-name-display");
const taglineDisplays = document.querySelectorAll(".tagline-display");
const locationDisplays = document.querySelectorAll(".shop-location-display");
const phoneDisplays = document.querySelectorAll(".shop-phone-display");
const addressDisplays = document.querySelectorAll(".shop-address-display");
const hoursDisplays = document.querySelectorAll(".shop-hours-display");

// Link CTA elements
const headerCallCTA = document.getElementById("headerCallCTA");
const phoneLinks = document.querySelectorAll(".shop-phone-link");
const whatsappLinks = document.querySelectorAll(".shop-whatsapp-link");
const mapDirectionBtn = document.querySelector(".get-directions-btn");

// Products Grid
const productsGrid = document.getElementById("productsGrid");

// Checkout Modal elements
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutModal = document.getElementById("closeCheckoutModal");
const cancelCheckout = document.getElementById("cancelCheckout");
const checkoutForm = document.getElementById("checkoutForm");
const summaryProductName = document.getElementById("summaryProductName");
const summaryProductBrand = document.getElementById("summaryProductBrand");
const summaryProductType = document.getElementById("summaryProductType");
const summaryProductPrice = document.getElementById("summaryProductPrice");
const custName = document.getElementById("custName");
const custAddress = document.getElementById("custAddress");

// Service Booking elements
const serviceForm = document.getElementById("serviceForm");
const srvDate = document.getElementById("srvDate");

// Initialize Website
document.addEventListener("DOMContentLoaded", async () => {
  await loadConfig();
  await loadProducts();
  renderBrandFilters();
  renderProducts();
  setupFilterListeners();
  setupFAQAccordion();
  setupModalEvents();
  setupDateLimiter();
  
  // Mobile menu toggle
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      mainNav.classList.toggle("active");
      const icon = menuToggle.querySelector("i");
      if (mainNav.classList.contains("active")) {
        icon.className = "fa-solid fa-xmark";
      } else {
        icon.className = "fa-solid fa-bars";
      }
    });
  }

  // Close mobile nav on click
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("active");
      const icon = menuToggle.querySelector("i");
      if (icon) icon.className = "fa-solid fa-bars";
      
      // Update active nav style
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });



  // Service Booking Submit
  serviceForm.addEventListener("submit", handleServiceSubmit);
});

// Product Catalog Management
async function loadProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    
    products = data.map(item => ({
      id: item.id,
      brand: item.brand,
      name: item.name,
      type: item.type,
      price: Number(item.price),
      originalPrice: Number(item.original_price),
      badge: item.badge,
      image: item.image,
      specs: item.specs || []
    }));

    if (products.length === 0) {
      // Supabase table empty — try localStorage
      const saved = localStorage.getItem("total_aqua_products");
      if (saved) {
        try { products = JSON.parse(saved); } catch(err) { products = [ ...defaultProducts ]; }
      } else {
        products = [ ...defaultProducts ];
      }
    }
  } catch (e) {
    console.error("Error loading products from Supabase, using local fallback", e);
    // Try localStorage first, then defaults
    const saved = localStorage.getItem("total_aqua_products");
    if (saved) {
      try { products = JSON.parse(saved); } catch(err) { products = [ ...defaultProducts ]; }
    } else {
      products = [ ...defaultProducts ];
    }
  }
}

// Configuration Management
async function loadConfig() {
  try {
    const { data, error } = await supabase
      .from('shop_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    if (data) {
      currentConfig = {
        shopName: data.shop_name,
        tagline: data.tagline,
        location: data.location,
        whatsapp: data.whatsapp,
        phone: data.phone,
        address: data.address,
        hours: data.hours
      };
    }
  } catch (e) {
    console.error("Error loading config from Supabase, using local fallback", e);
    const saved = localStorage.getItem("total_aqua_config");
    if (saved) {
      try {
        currentConfig = JSON.parse(saved);
      } catch (err) {
        currentConfig = { ...defaultConfig };
      }
    } else {
      currentConfig = { ...defaultConfig };
    }
  }
  applyConfig();
}

function applyConfig() {
  // Update text display
  shopNameDisplays.forEach(el => el.textContent = currentConfig.shopName);
  taglineDisplays.forEach(el => el.textContent = currentConfig.tagline);
  locationDisplays.forEach(el => el.textContent = currentConfig.location);
  phoneDisplays.forEach(el => el.textContent = currentConfig.phone);
  addressDisplays.forEach(el => el.textContent = currentConfig.address);
  hoursDisplays.forEach(el => el.textContent = currentConfig.hours);

  // Update document title
  document.title = `${currentConfig.shopName} | Premium Water Purifiers & Service`;

  // Update Call CTAs
  const cleanPhone = currentConfig.phone.replace(/[^0-9+]/g, "");
  if (headerCallCTA) {
    headerCallCTA.href = `tel:${cleanPhone}`;
  }
  phoneLinks.forEach(link => {
    link.href = `tel:${cleanPhone}`;
  });

  // Update general WhatsApp contact link in footer
  whatsappLinks.forEach(link => {
    const defaultText = encodeURIComponent(`Hello! Main ${currentConfig.shopName} se water purifier purchase ya service booking ke baare me puchna chahta hoon.`);
    link.href = `https://wa.me/${currentConfig.whatsapp}?text=${defaultText}`;
  });

  // Update Google map helper
  if (mapDirectionBtn) {
    const addressQuery = encodeURIComponent(`${currentConfig.shopName} ${currentConfig.address}`);
    mapDirectionBtn.href = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
  }

  // Update mobile WhatsApp FAB
  const mobileWAFab = document.getElementById("mobileWhatsappFab");
  if (mobileWAFab) {
    const fabText = encodeURIComponent(`Hello! Main ${currentConfig.shopName} se baat karna chahta/chahti hoon.`);
    mobileWAFab.href = `https://wa.me/${currentConfig.whatsapp}?text=${fabText}`;
  }
}

// Render Products Catalog
function renderProducts() {
  productsGrid.innerHTML = "";

  const filtered = products.filter(p => {
    // Brand Filter
    if (activeFilters.brand !== "all" && p.brand !== activeFilters.brand) return false;
    
    // Type Filter (flexible matching, e.g. "RO" matches "RO+UV")
    if (activeFilters.type !== "all") {
      if (activeFilters.type === "RO") {
        if (!p.type.includes("RO")) return false;
      } else if (activeFilters.type === "RO+UV") {
        if (p.type !== "RO+UV" && p.type !== "RO+UV+UF") return false;
      } else if (activeFilters.type === "RO+UV+UF") {
        if (p.type !== "RO+UV+UF") return false;
      } else if (activeFilters.type === "Alkaline") {
        // Find if custom matching needed, or filters for specific keyword
        if (!p.specs.some(s => s.toLowerCase().includes("alkaline")) && !p.type.includes("Alkaline")) return false;
      } else if (p.type !== activeFilters.type) {
        return false;
      }
    }

    // Price Filter
    if (activeFilters.price !== "all") {
      if (activeFilters.price === "under-10" && p.price >= 10000) return false;
      if (activeFilters.price === "10-18" && (p.price < 10000 || p.price > 18000)) return false;
      if (activeFilters.price === "above-18" && p.price <= 18000) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    productsGrid.innerHTML = `
      <div class="no-products">
        <i class="fa-solid fa-circle-exclamation"></i>
        <h3>Filter ke anusar koi machine nahi mili</h3>
        <p>Kripya dusra filter try karein ya call par poochheine.</p>
        <button class="btn btn-outline btn-sm" onclick="resetAllFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";

    const specsHTML = p.specs.map(spec => `<li><i class="fa-solid fa-check-circle"></i> ${spec}</li>`).join("");

    const imageHTML = p.image
      ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;">`
      : `<div class="purifier-vector">
           <i class="fa-solid fa-droplet-slash" style="opacity: 0.1; position: absolute; font-size: 8rem; left: 50%; top: 50%; transform: translate(-50%, -50%);"></i>
           <i class="fa-solid fa-glass-water" style="color: var(--primary); font-size: 3.5rem;"></i>
         </div>`;

    card.innerHTML = `
      ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ""}
      <div class="product-img-wrapper">
        ${imageHTML}
        <div class="water-indicator"></div>
      </div>
      <div class="product-info">
        <span class="product-brand">${p.brand}</span>
        <h3 class="product-name">${p.name}</h3>
        <ul class="product-specs">
          ${specsHTML}
        </ul>
        <div class="product-price-row">
          <div class="price-container">
            <span class="original-price">₹${p.originalPrice.toLocaleString()}</span>
            <span class="discounted-price">₹${p.price.toLocaleString()}</span>
          </div>
          <button class="btn btn-success buy-btn" data-id="${p.id}"><i class="fa-brands fa-whatsapp"></i> Buy Now</button>
        </div>
      </div>
    `;

    productsGrid.appendChild(card);
    
    // Smooth entry animation
    setTimeout(() => {
      card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 50);
  });

  // Attach dynamic event listeners to "Buy Now" buttons
  const buyButtons = productsGrid.querySelectorAll(".buy-btn");
  buyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const prodId = parseInt(btn.getAttribute("data-id"));
      openCheckout(prodId);
    });
  });
}

// Reset Filters
window.resetAllFilters = function() {
  activeFilters = { brand: "all", type: "all", price: "all" };
  
  // Reset active classes on filter buttons
  document.querySelectorAll(".filter-btn").forEach(btn => {
    if (btn.getAttribute("data-value") === "all") {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderProducts();
};

// Dynamic Brand Filters Generation
function renderBrandFilters() {
  const brandFilters = document.getElementById("brandFilters");
  if (!brandFilters) return;

  // Get unique brands, ignore empty/null
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(b => b && b.trim() !== ""))];
  
  let html = `<button class="filter-btn active" data-filter="brand" data-value="all">All Brands</button>`;
  uniqueBrands.forEach(brand => {
    html += `<button class="filter-btn" data-filter="brand" data-value="${brand}">${brand}</button>`;
  });
  
  brandFilters.innerHTML = html;
}

// Filter Button Click Handlers (using event delegation for dynamic elements)
function setupFilterListeners() {
  const filterContainers = ["brandFilters", "typeFilters", "priceFilters"];
  filterContainers.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;

        const group = btn.getAttribute("data-filter");
        const value = btn.getAttribute("data-value");

        // Set active status inside current options group
        el.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // Update state
        activeFilters[group] = value;
        renderProducts();
      });
    }
  });
}

// Modal Checkout Dialog logic
function setupModalEvents() {
  closeCheckoutModal.addEventListener("click", closeCheckout);
  cancelCheckout.addEventListener("click", closeCheckout);
  checkoutModal.addEventListener("click", (e) => {
    if (e.target === checkoutModal) closeCheckout();
  });

  checkoutForm.addEventListener("submit", handleCheckoutSubmit);
}

function openCheckout(prodId) {
  selectedProduct = products.find(p => p.id === prodId);
  if (!selectedProduct) return;

  // Set checkout summary details
  summaryProductName.textContent = selectedProduct.name;
  summaryProductBrand.textContent = selectedProduct.brand;
  summaryProductType.textContent = selectedProduct.type;
  summaryProductPrice.textContent = `₹${selectedProduct.price.toLocaleString()}`;

  checkoutModal.classList.add("open");
  bodyEl.style.overflow = "hidden";
}

function closeCheckout() {
  checkoutModal.classList.remove("open");
  bodyEl.style.overflow = "auto";
  checkoutForm.reset();
  selectedProduct = null;
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  if (!selectedProduct) return;

  const name = custName.value.trim();
  const address = custAddress.value.trim();

  // WhatsApp order template:
  // "Hello! Main [Machine Ka Naam] kharidna chahta hoon. Price: ₹[Amount]. Mera naam: ___ , Address: ___ . Please confirm karein."
  const msgText = `Hello! Main ${selectedProduct.name} kharidna chahta hoon. Price: ₹${selectedProduct.price.toLocaleString()}. Mera naam: ${name} , Address: ${address} . Please confirm karein.`;
  
  const whatsappUrl = `https://wa.me/${currentConfig.whatsapp}?text=${encodeURIComponent(msgText)}`;

  // Redirect client to WhatsApp (using anchor click to avoid popup blockers)
  openWhatsAppLink(whatsappUrl);

  // Close dialog
  closeCheckout();
}

// Service Request Submit
function handleServiceSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("srvName").value.trim();
  const phone = document.getElementById("srvPhone").value.trim();
  const brand = document.getElementById("srvBrand").value;
  const problem = document.getElementById("srvProblem").value;
  const dateVal = document.getElementById("srvDate").value;
  const address = document.getElementById("srvAddress").value.trim();

  // Formatting Date nicely (dd/mm/yyyy)
  let formattedDate = dateVal;
  if (dateVal) {
    const d = new Date(dateVal);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    formattedDate = `${day}/${month}/${year}`;
  }

  // Service Request template:
  // "Service Request: Naam: ___ , Phone: ___ , Machine: ___ , Problem: ___ , Date: ___"
  const serviceText = `Service Request:\nNaam: ${name}\nPhone: ${phone}\nMachine: ${brand}\nProblem: ${problem}\nDate: ${formattedDate}\nAddress: ${address}`;

  const whatsappUrl = `https://wa.me/${currentConfig.whatsapp}?text=${encodeURIComponent(serviceText)}`;

  // Launch WhatsApp (using anchor click to avoid popup blockers)
  openWhatsAppLink(whatsappUrl);

  // Reset Form
  serviceForm.reset();
  setupDateLimiter(); // Reset date field minimum
}

// Date field limit settings (minimum tomorrow or today)
function setupDateLimiter() {
  if (srvDate) {
    const today = new Date();
    // Allow service bookings starting from today
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    srvDate.min = `${year}-${month}-${day}`;
    srvDate.value = `${year}-${month}-${day}`;
  }
}

// FAQ Accordion Toggle
function setupFAQAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      
      // Close other accordions
      faqItems.forEach(i => i.classList.remove("active"));
      
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });
}

// Storage event listener for instant synchronization between tabs
window.addEventListener("storage", async (e) => {
  if (e.key === "total_aqua_config") {
    await loadConfig();
  } else if (e.key === "total_aqua_products") {
    await loadProducts();
    renderBrandFilters();
    renderProducts();
  }
});

// Helper: Open WhatsApp link reliably (avoids popup blockers)
function openWhatsAppLink(url) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

