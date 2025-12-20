// --- 1. SERVICE WORKER & PWA INSTALLATION ---
let deferredPrompt;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(e => console.log('SW Fail'));
    });
}

// Listen for the install prompt
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    showInstallPromotion();
});

function showInstallPromotion() {
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.classList.remove('hidden');
    }
}

async function installPWA() {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
    // Hide the button
    document.getElementById('install-btn').classList.add('hidden');
}

// --- 2. LOCAL DATABASE ---
const DB = {
    get: (key) => JSON.parse(localStorage.getItem('heavenmind_' + key) || '[]'),
    set: (key, data) => localStorage.setItem('heavenmind_' + key, JSON.stringify(data)),
    add: (key, item) => {
        const data = DB.get(key);
        data.push({ id: Date.now(), createdAt: Date.now(), ...item });
        DB.set(key, data);
        return data;
    },
    delete: (key, id) => {
        let data = DB.get(key);
        data = data.filter(item => item.id != id);
        DB.set(key, data);
        return data;
    },
    getValue: (key) => localStorage.getItem('heavenmind_' + key),
    setValue: (key, val) => localStorage.setItem('heavenmind_' + key, val),
    removeValue: (key) => localStorage.removeItem('heavenmind_' + key)
};

const readFile = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
});

// --- 3. DATA CONSTANTS ---
const MOODS = [
    { id: 'happy', label: 'Happy', jp: '幸せ', color: 'bg-yellow-100 text-yellow-800', desc: 'Feeling great!', icon: '😊' },
    { id: 'relaxed', label: 'Relaxed', jp: 'リラックス', color: 'bg-orange-100 text-orange-800', desc: 'Chilling out.', icon: '😌' },
    { id: 'sad', label: 'Sad', jp: '悲しい', color: 'bg-blue-100 text-blue-800', desc: 'Need comfort.', icon: '😢' },
    { id: 'focused', label: 'Focused', jp: '集中したい', color: 'bg-stone-200 text-stone-800', desc: 'Time to work.', icon: '🧐' },
    { id: 'excited', label: 'Excited', jp: '興奮', color: 'bg-red-100 text-red-800', desc: 'Pumped up!', icon: '🤩' },
    { id: 'anxious', label: 'Anxious', jp: '不安', color: 'bg-purple-100 text-purple-800', desc: 'Calm down.', icon: '😰' },
    { id: 'tired', label: 'Tired', jp: '疲労', color: 'bg-gray-200 text-gray-800', desc: 'Need energy.', icon: '😴' }
];

// EXPANDED MENU WITH TAGS FOR AI MATCHING
const MENU = [
    // Drinks
    { id: 1, name: 'Espresso', price: 350, type: 'drink', desc: 'Concentrated shot.', tags: ['strong', 'energy', 'focused'] },
    { id: 2, name: 'Doppio', price: 450, type: 'drink', desc: 'Double shot.', tags: ['strong', 'energy', 'tired'] },
    { id: 3, name: 'Americano', price: 400, type: 'drink', desc: 'Diluted espresso.', tags: ['classic', 'focused'] },
    { id: 4, name: 'Latte', price: 550, type: 'drink', desc: 'Steamed milk & espresso.', tags: ['creamy', 'comfort', 'happy'] },
    { id: 5, name: 'Cappuccino', price: 550, type: 'drink', desc: 'Foamy delight.', tags: ['classic', 'comfort'] },
    { id: 6, name: 'Flat White', price: 580, type: 'drink', desc: 'Velvety microfoam.', tags: ['creamy', 'artisan'] },
    { id: 7, name: 'Macchiato', price: 420, type: 'drink', desc: 'Stained espresso.', tags: ['strong', 'light'] },
    { id: 8, name: 'Mocha', price: 600, type: 'drink', desc: 'Chocolate latte.', tags: ['sweet', 'comfort', 'sad'] },
    { id: 10, name: 'Iced Coffee', price: 400, type: 'drink', desc: 'Chilled brew.', tags: ['cold', 'refreshing'] },
    { id: 11, name: 'Cold Brew', price: 550, type: 'drink', desc: 'Steeped for 12 hours.', tags: ['cold', 'strong', 'excited'] },
    { id: 101, name: 'Iced Latte', price: 520, type: 'drink', desc: 'Cold & creamy.', tags: ['cold', 'creamy', 'happy'] },
    { id: 102, name: 'Hot Chamomile Tea', price: 450, type: 'drink', desc: 'Soothing herbal.', tags: ['tea', 'calm', 'relaxed'] },
    { id: 103, name: 'Herbal Tea', price: 400, type: 'drink', desc: 'Caffeine-free.', tags: ['tea', 'calm', 'anxious'] },
    
    // Cakes
    { id: 21, name: 'Classic Cheesecake', price: 700, type: 'food', desc: 'NY Style.', tags: ['rich', 'classic', 'relaxed'] },
    { id: 22, name: 'Red Velvet Cake', price: 750, type: 'food', desc: 'Cream cheese frosting.', tags: ['sweet', 'colorful', 'happy', 'excited'] },
    { id: 23, name: 'Chocolate Lava', price: 800, type: 'food', desc: 'Molten center.', tags: ['rich', 'chocolate', 'comfort', 'sad'] },
    { id: 24, name: 'Carrot Walnut', price: 720, type: 'food', desc: 'Spiced cake.', tags: ['spiced', 'nutty', 'focused'] },
    { id: 25, name: 'Tiramisu', price: 750, type: 'food', desc: 'Coffee soaked.', tags: ['coffee', 'creamy', 'tired', 'energy'] },
    { id: 30, name: 'Apple Crumble', price: 650, type: 'food', desc: 'Cinnamon treat.', tags: ['fruity', 'warm', 'anxious'] },
    { id: 26, name: 'Black Forest', price: 850, type: 'food', desc: 'Chocolate sponge & cherry.', tags: ['rich', 'fruit', 'indulgent'] },
    { id: 27, name: 'Lemon Poppy Seed', price: 680, type: 'food', desc: 'Zesty with lemon glaze.', tags: ['citrus', 'light', 'focused'] },
    { id: 39, name: 'Eclair', price: 500, type: 'food', desc: 'Choux pastry with cream.', tags: ['light', 'sweet', 'happy'] }
];

// SIMULATED AI ENGINE
async function getAIRecommendation(moodId) {
    // 1. Loading Simulation
    await new Promise(r => setTimeout(r, 1500));

    // 2. AI Logic for DRINKS
    const drinkScores = MENU.filter(i => i.type === 'drink').map(item => {
        let score = 0;
        if (item.tags) {
            if (item.tags.includes(moodId)) score += 10; // Direct match
            // Contextual matching
            if (moodId === 'sad' && item.tags.includes('comfort')) score += 5;
            if (moodId === 'tired' && item.tags.includes('strong')) score += 5;
            if (moodId === 'anxious' && item.tags.includes('calm')) score += 5;
        }
        return { item, score: score + Math.random() * 5 };
    });
    drinkScores.sort((a, b) => b.score - a.score);
    const drink = drinkScores[0].item;

    // 3. AI Logic for CAKES (New!)
    const foodScores = MENU.filter(i => i.type === 'food').map(item => {
        let score = 0;
        if (item.tags) {
            if (item.tags.includes(moodId)) score += 10;
            // Pairing logic: Coffee drinks go well with sweet/creamy foods
            if (drink.tags.includes('coffee') && item.tags.includes('chocolate')) score += 3;
            if (drink.tags.includes('tea') && item.tags.includes('fruity')) score += 3;
            // Mood specific food logic
            if (moodId === 'happy' && item.tags.includes('colorful')) score += 5;
            if (moodId === 'sad' && item.tags.includes('chocolate')) score += 8; // Chocolate helps sadness!
        }
        return { item, score: score + Math.random() * 5 };
    });
    foodScores.sort((a, b) => b.score - a.score);
    const food = foodScores[0].item;

    // 4. AI Logic for BOOKS
    let bookGenre = "General Fiction";
    if (moodId === 'happy') bookGenre = "Comedy & Light Reads";
    else if (moodId === 'relaxed') bookGenre = "Self-help / Philosophy";
    else if (moodId === 'sad') bookGenre = "Uplifting Novels";
    else if (moodId === 'focused') bookGenre = "Science or Business";
    else if (moodId === 'excited') bookGenre = "Adventure & Mystery";
    else if (moodId === 'anxious') bookGenre = "Nature & Calm";
    else if (moodId === 'tired') bookGenre = "Short Stories";

    return { 
        drink, 
        food, 
        bookGenre,
        reason: `Based on your mood (${moodId}), we selected a ${drink.name} to match your energy, paired with a ${food.name} for comfort.` 
    };
}

// --- 4. APP STATE ---
window.appState = {
    view: 'home',
    mood: null,
    cart: [],
    activeBook: null,
    orderId: null,
    orderStatus: 'active',
    isAdmin: false,
    activeOrderItems: [] 
};

// --- 5. INITIALIZATION & ROUTING ---

// LOAD STATE FROM STORAGE ON START
function initApp() {
    const storedOrderId = DB.getValue('currentOrderId');
    if (storedOrderId) {
        window.appState.orderId = storedOrderId;
        window.appState.activeOrderItems = DB.get('activeOrder_' + storedOrderId);
        window.appState.orderStatus = DB.getValue('orderStatus_' + storedOrderId) || 'active';
    }
    router('home');
}

window.router = function(viewName, param = null) {
    window.appState.view = viewName;
    updateNavbar();
    
    const app = document.getElementById('app');
    if (!app) return;

    // Scroll to top on nav
    window.scrollTo(0,0);

    if (viewName === 'home') renderHome();
    else if (viewName === 'mood') renderMoodSelector();
    else if (viewName === 'recommendation') renderRecommendation();
    else if (viewName === 'menu') renderMenu();
    else if (viewName === 'checkout') renderCheckout();
    else if (viewName === 'order-pass') renderOrderPass();
    else if (viewName === 'library') renderLibrary();
    else if (viewName === 'reader') { window.appState.activeBook = param; renderReader(); }
    else if (viewName === 'write') renderWrite();
    else if (viewName === 'reviews') renderReviews();
    else if (viewName === 'shop-qr') renderShopQR();
    
    // NEW ROUTES
    else if (viewName === 'brews') renderBrews();
    else if (viewName === 'beans') renderBeans();
    else if (viewName === 'takeout') renderTakeout();
    else if (viewName === 'workshops') renderWorkshops();
};

function updateNavbar() {
    const navbar = document.getElementById('navbar');
    if(navbar) {
        if(['reader', 'shop-qr'].includes(window.appState.view)) navbar.classList.add('hidden');
        else navbar.classList.remove('hidden');
    }

    ['home', 'library', 'reviews', 'checkout'].forEach(v => {
        const btn = document.getElementById(`nav-${v}`);
        if (!btn) return;
        const active = window.appState.view === v || 
            (v === 'library' && ['reader', 'write'].includes(window.appState.view)) || 
            (v === 'home' && ['mood', 'recommendation', 'menu', 'shop-qr'].includes(window.appState.view)) ||
            (v === 'checkout' && ['order-pass'].includes(window.appState.view));
        
        if (active) {
            btn.classList.add('active');
            btn.classList.remove('text-[#999]');
        } else {
            btn.classList.remove('active');
            btn.classList.add('text-[#999]');
        }
    });
    
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.innerText = window.appState.cart.length;
        badge.classList.toggle('hidden', window.appState.cart.length === 0);
    }
}

// --- 6. VIEW RENDERERS ---

window.renderHome = function() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-8 fade-in">
            <div class="absolute top-4 right-4 flex gap-2">
                <!-- INSTALL BUTTON (Hidden by default, shown if installable) -->
                <button id="install-btn" onclick="installPWA()" class="text-xs font-bold bg-amber-500 text-white px-3 py-1 rounded-full shadow hidden hover:bg-amber-600 transition flex items-center gap-1">
                    📲 Install App
                </button>

                ${window.appState.isAdmin ? 
                    `<button onclick="router('shop-qr')" class="text-xs font-bold bg-[#4a2c2a] text-white px-3 py-1 rounded-full shadow">🖨️ QR</button>` : ''
                }
                <button onclick="toggleAdmin()" class="text-[#a07a67] hover:text-[#4a2c2a] transition">
                    ${window.appState.isAdmin ? '<span class="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded">ADMIN</span>' : '🔒'}
                </button>
            </div>
            
            ${window.appState.orderId ? 
                `<div onclick="router('order-pass')" class="w-full bg-green-50 border border-green-200 p-4 rounded-xl flex justify-between items-center cursor-pointer shadow-sm animate-pulse mb-4">
                    <div class="text-left">
                        <p class="text-[10px] font-bold text-green-600 uppercase">
                            ${window.appState.orderStatus === 'payment_requested' ? 'Wait for Staff' : 'Active Order'}
                        </p>
                        <p class="text-lg font-mono font-bold text-[#4a2c2a]">${window.appState.orderId}</p>
                    </div>
                    <span class="text-green-600 font-bold">View ></span>
                </div>` : ''
            }

            <div class="space-y-2">
                <h1 class="text-4xl sm:text-5xl font-bold text-[#4a2c2a] tracking-tight">HEAVEN MIND</h1>
                <p class="text-[#a07a67] italic font-serif">Coffee, Community, and Connection.</p>
            </div>
            
            <div class="p-8 bg-white/90 backdrop-blur rounded-3xl border border-[#eee] w-full shadow-lg">
                <h2 class="text-xl font-bold text-[#4a2c2a] mb-2 font-serif">How are you feeling?</h2>
                <p class="text-sm text-gray-500 mb-6">Let AI curate your experience.</p>
                <button onclick="router('mood')" class="w-full py-4 bg-[#4a2c2a] text-white rounded-xl shadow-lg hover:bg-[#3e2b26] transition font-bold">Start AI Experience</button>
            </div>
            
            <!-- SERVICE CARDS -->
            <div class="w-full max-w-md grid grid-cols-1 gap-4 mt-8">
                <h3 class="text-left text-[#a07a67] text-xs font-bold uppercase tracking-widest pl-2">Services</h3>
                
                <a href="#" onclick="event.preventDefault(); router('brews')" class="block bg-white p-5 rounded-2xl shadow-sm border border-[#eee] hover:shadow-md transition flex items-center gap-4 group no-underline">
                    <span class="text-3xl group-hover:scale-110 transition">☕</span>
                    <div class="text-left">
                        <h3 class="font-bold text-[#4a2c2a] text-lg">Specialty Brews</h3>
                        <p class="text-xs text-gray-500">Hand-dripped perfection.<br>至福のハンドドリップ体験。</p>
                    </div>
                </a>

                <a href="#" onclick="event.preventDefault(); router('menu')" class="block bg-white p-5 rounded-2xl shadow-sm border border-[#eee] hover:shadow-md transition flex items-center gap-4 group no-underline">
                    <span class="text-3xl group-hover:scale-110 transition">🍰</span>
                    <div class="text-left">
                        <h3 class="font-bold text-[#4a2c2a] text-lg">House Cakes</h3>
                        <p class="text-xs text-gray-500">Freshly baked daily.<br>毎日お店で焼いています。</p>
                    </div>
                </a>

                <a href="#" onclick="event.preventDefault(); router('beans')" class="block bg-white p-5 rounded-2xl shadow-sm border border-[#eee] hover:shadow-md transition flex items-center gap-4 group no-underline">
                    <span class="text-3xl group-hover:scale-110 transition">🌱</span>
                    <div class="text-left">
                        <h3 class="font-bold text-[#4a2c2a] text-lg">Fresh Beans</h3>
                        <p class="text-xs text-gray-500">Directly sourced from sustainable farms.<br>サステナブルな農園から直送。</p>
                    </div>
                </a>

                <a href="#" onclick="event.preventDefault(); router('takeout')" class="block bg-white p-5 rounded-2xl shadow-sm border border-[#eee] hover:shadow-md transition flex items-center gap-4 group no-underline">
                    <span class="text-3xl group-hover:scale-110 transition">🥡</span>
                    <div class="text-left">
                        <h3 class="font-bold text-[#4a2c2a] text-lg">Takeout & Delivery</h3>
                        <p class="text-xs text-gray-500">Enjoy our coffee anywhere.<br>どこでも当店の味を。</p>
                    </div>
                </a>
                 <a href="#" onclick="event.preventDefault(); router('workshops')" class="block bg-white p-5 rounded-2xl shadow-sm border border-[#eee] hover:shadow-md transition flex items-center gap-4 group no-underline">
                    <span class="text-3xl group-hover:scale-110 transition">🎓</span>
                    <div class="text-left">
                        <h3 class="font-bold text-[#4a2c2a] text-lg">Barista Workshops</h3>
                        <p class="text-xs text-gray-500">Learn the art of brewing from pros.<br>プロから淹れ方を学ぶ。</p>
                    </div>
                </a>
                 <a href="#" onclick="event.preventDefault(); router('library')" class="block bg-white p-5 rounded-2xl shadow-sm border border-[#eee] hover:shadow-md transition flex items-center gap-4 group no-underline">
                    <span class="text-3xl group-hover:scale-110 transition">📚</span>
                    <div class="text-left">
                        <h3 class="font-bold text-[#4a2c2a] text-lg">Library</h3>
                        <p class="text-xs text-gray-500">Read while you sip.<br>コーヒーと共に読書を。</p>
                    </div>
                </a>
            </div>
            
            <button onclick="router('menu')" class="text-[#999] text-xs font-bold tracking-widest uppercase hover:text-[#a07a67] transition mt-8">Skip to Full Menu</button>
        </div>
    `;
    document.getElementById('navbar').classList.remove('hidden');
    
    // Check if install prompt is available
    if (deferredPrompt) showInstallPromotion();
}

// ... (Rest of existing functions: toggleAdmin, renderShopQR, Moods, Recommendation, Menu, Checkout, OrderPass, Library, etc.) ...
// Note: Keep all other functions as they were in the previous correct version.
// Just ensure `renderHome` above replaces the old one.

window.toggleAdmin = function() {
    if (!window.appState.isAdmin) {
        const modal = document.getElementById('admin-login-modal');
        const input = document.getElementById('admin-pin-input');
        const btn = document.getElementById('confirm-pin-btn');
        input.value = ''; 
        modal.showModal();
        btn.onclick = () => {
            if (input.value === "1234") {
                window.appState.isAdmin = true;
                modal.close();
                alert("✅ Admin Mode Enabled.");
                router(window.appState.view, window.appState.activeBook);
            } else {
                alert("❌ Incorrect PIN.");
                input.value = ''; input.focus();
            }
        };
    } else {
        window.appState.isAdmin = false;
        router(window.appState.view, window.appState.activeBook);
    }
}

window.renderShopQR = function() {
    const currentUrl = window.location.href;
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="px-6 py-12 flex flex-col items-center justify-center min-h-[80vh] text-center fade-in bg-[#4a2c2a] text-white">
            <button onclick="router('home')" class="absolute top-6 left-6 text-white/50 hover:text-white">← Back</button>
            <h2 class="text-2xl font-serif text-[#a07a67] mb-2">Entry QR Code</h2>
            <p class="text-white/50 text-sm mb-8 max-w-xs">Print this and place it on tables.</p>
            <div id="shop-qr-target" class="bg-white p-4 rounded-3xl shadow-2xl mb-8 flex items-center justify-center"></div>
            <button onclick="window.print()" class="px-8 py-3 bg-[#a07a67] text-white rounded-full font-bold shadow-lg hover:bg-[#8d6b5a] transition flex items-center gap-2">
                Print QR
            </button>
        </div>
    `;
    setTimeout(() => {
        new QRCode(document.getElementById('shop-qr-target'), {
            text: currentUrl,
            width: 200,
            height: 200
        });
    }, 100);
}

window.renderMoodSelector = function() {
    const app = document.getElementById('app');
    let html = `
        <div class="px-6 py-8 fade-in">
            <h2 class="text-2xl font-serif text-[#4a2c2a] mb-6 text-center">What's your vibe?</h2>
            <div class="grid grid-cols-1 gap-4">
    `;
    MOODS.forEach(m => {
        html += `
        <button onclick="selectMood('${m.id}')" class="${m.color} p-5 rounded-2xl flex items-center space-x-4 w-full text-left transition hover:scale-[1.02] shadow-sm border border-black/5">
            <div class="text-3xl">${m.icon}</div>
            <div>
                <h3 class="font-bold text-lg">${m.label} <span class="text-sm font-normal opacity-75">(${m.jp})</span></h3>
                <p class="text-xs opacity-80">${m.desc}</p>
            </div>
        </button>`;
    });
    html += `</div></div>`;
    app.innerHTML = html;
}

window.selectMood = function(id) {
    window.appState.mood = id;
    router('recommendation');
}

window.renderRecommendation = async function() {
    const app = document.getElementById('app');
    
    // 1. Show "Thinking" State
    app.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[80vh] fade-in">
            <div class="w-12 h-12 border-4 border-[#a07a67] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 class="text-xl font-bold text-[#4a2c2a] animate-pulse">AI is curating your menu...</h2>
            <p class="text-sm text-gray-400">Analyzing mood: ${window.appState.mood}</p>
        </div>
    `;

    // 2. Call AI Function
    const result = await getAIRecommendation(window.appState.mood);

    const drink = result.drink;
    const food = result.food;
    const total = (drink.price + food.price);

    // 3. Render Result
    app.innerHTML = `
        <div class="px-6 py-8 fade-in">
            <div class="text-center mb-8">
                <p class="text-[#a07a67] text-xs font-bold uppercase tracking-widest">AI Perfect Match for ${window.appState.mood}</p>
                <h2 class="text-2xl font-serif text-[#4a2c2a]">Your Selection</h2>
            </div>
            
            <div class="bg-white p-6 rounded-2xl shadow-xl border border-[#eee] mb-8 relative overflow-hidden menu-card">
                <div class="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
                
                <!-- 1. DRINK -->
                <div class="mb-6 pb-6 border-b border-dashed border-[#eee]">
                    <span class="text-[10px] bg-[#f8f5f0] text-[#a07a67] px-2 py-1 rounded mb-2 inline-block font-bold">RECOMMENDED DRINK</span>
                    <h3 class="font-bold text-xl text-[#4a2c2a]">${drink.name}</h3>
                    <p class="text-xs text-gray-500 mb-2">${drink.desc}</p>
                    <div class="text-right font-bold text-[#4a2c2a] text-lg">¥${drink.price}</div>
                </div>
                
                <!-- 2. BOOK -->
                <div class="mb-6 pb-6 border-b border-dashed border-[#eee]">
                    <span class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded mb-2 inline-block font-bold">READING PAIRING</span>
                    <h3 class="font-bold text-lg text-[#4a2c2a]">${result.bookGenre}</h3>
                    <p class="text-xs text-gray-400">Recommended genre for this mood</p>
                </div>

                <!-- 3. CAKE (New!) -->
                <div>
                    <span class="text-[10px] bg-[#f8f5f0] text-[#a07a67] px-2 py-1 rounded mb-2 inline-block font-bold">SWEET PAIRING</span>
                    <h3 class="font-bold text-xl text-[#4a2c2a]">${food.name}</h3>
                    <p class="text-xs text-gray-500 mb-2">${food.desc}</p>
                    <div class="text-right font-bold text-[#4a2c2a] text-lg">¥${food.price}</div>
                </div>

                <div class="mt-6 pt-4 border-t-2 border-[#4a2c2a] flex justify-between font-bold text-xl text-[#4a2c2a]">
                    <span>Total</span><span>¥${total}</span>
                </div>
            </div>
            
            <button onclick="addBundle(${drink.id}, ${food.id})" class="w-full py-4 bg-[#a07a67] text-white rounded-xl font-bold shadow-lg mb-3 hover:bg-[#8d6b5a] transition">Order This Pair</button>
            <button onclick="router('menu')" class="w-full py-4 bg-white text-[#4a2c2a] border border-[#eee] rounded-xl font-medium shadow-sm">No thanks, Show Full Menu</button>
        </div>
    `;
}

window.addBundle = function(dId, fId) {
    const d = MENU.find(m => m.id === dId);
    const f = MENU.find(m => m.id === fId);
    window.appState.cart.push(d, f);
    router('checkout');
}

window.renderMenu = function() {
    const app = document.getElementById('app');
    let html = `
        <div class="px-6 py-8 pb-24 fade-in">
            <div class="flex items-center mb-6">
                <button onclick="router('home')" class="mr-4 p-2 bg-white border border-[#eee] rounded-full text-[#4a2c2a] shadow-sm">←</button>
                <h2 class="text-2xl font-serif text-[#4a2c2a]">Menu</h2>
            </div>
            
            <h3 class="text-sm font-bold text-[#a07a67] uppercase tracking-widest mb-4">Coffee Classics</h3>
            <div class="space-y-4 mb-8">
    `;
    
    MENU.filter(i => i.type === 'drink').forEach(item => {
        html += `
            <div class="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center menu-card group">
                <div>
                    <h4 class="font-bold text-[#4a2c2a]">${item.name}</h4>
                    <p class="text-xs text-gray-500">${item.desc}</p>
                </div>
                <div class="flex flex-col items-end space-y-2">
                    <span class="font-bold text-[#4a2c2a]">¥${item.price}</span>
                    <button onclick="addToCart(${item.id})" class="bg-[#4a2c2a] text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#a07a67] transition shadow-md">+</button>
                </div>
            </div>
        `;
    });

    html += `</div><h3 class="text-sm font-bold text-[#a07a67] uppercase tracking-widest mb-4">Decadent Cakes</h3><div class="space-y-4">`;

    MENU.filter(i => i.type === 'food').forEach(item => {
        html += `
            <div class="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center menu-card group">
                <div>
                    <h4 class="font-bold text-[#4a2c2a]">${item.name}</h4>
                    <p class="text-xs text-gray-500">${item.desc}</p>
                </div>
                <div class="flex flex-col items-end space-y-2">
                    <span class="font-bold text-[#4a2c2a]">¥${item.price}</span>
                    <button onclick="addToCart(${item.id})" class="bg-[#4a2c2a] text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#a07a67] transition shadow-md">+</button>
                </div>
            </div>
        `;
    });

    html += `</div></div>`;
    app.innerHTML = html;
}

window.addToCart = function(id) {
    const item = MENU.find(i => i.id === id);
    window.appState.cart.push(item);
    updateNavbar();
    const badge = document.getElementById('cart-badge');
    if(badge) {
        badge.classList.add('animate-bounce');
        setTimeout(() => badge.classList.remove('animate-bounce'), 1000);
    }
}

window.renderCheckout = function() {
    const total = window.appState.cart.reduce((a, b) => a + b.price, 0);
    const tax = Math.floor(total * 0.1); 
    const service = Math.floor(total * 0.05); 
    const grandTotal = total + tax + service;

    const app = document.getElementById('app');
    
    let html = `
        <div class="px-6 py-8 h-screen flex flex-col fade-in">
            <h2 class="text-2xl font-serif text-[#4a2c2a] mb-6">Your Order</h2>
    `;
    
    if (window.appState.cart.length === 0) {
        html += `<div class="flex-1 flex flex-col items-center justify-center text-gray-400"><p>Cart is empty</p><button onclick="router('menu')" class="mt-4 text-[#a07a67] font-bold">Go to Menu</button></div>`;
    } else {
        html += `<div class="flex-1 overflow-y-auto space-y-3 pb-4">`;
        window.appState.cart.forEach((item, idx) => {
            html += `
                <div class="flex justify-between items-center bg-white p-3 rounded-lg border border-[#eee]">
                    <div><h4 class="font-bold text-[#4a2c2a] text-sm">${item.name}</h4><p class="text-xs text-gray-500">¥${item.price}</p></div>
                    <button onclick="removeFromCart(${idx})" class="text-gray-300 hover:text-red-500 p-2">✕</button>
                </div>
            `;
        });
        html += `</div>
            <div class="bg-white border border-[#eee] p-6 rounded-t-3xl -mx-6 mt-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-10 text-sm">
                <div class="flex justify-between mb-1 text-gray-500"><span>Subtotal</span><span>¥${total}</span></div>
                <div class="flex justify-between mb-1 text-gray-500"><span>Tax (10%)</span><span>¥${tax}</span></div>
                <div class="flex justify-between mb-4 text-gray-500"><span>Service (5%)</span><span>¥${service}</span></div>
                <div class="flex justify-between items-center mb-6 pt-4 border-t border-dashed border-[#eee]">
                    <span class="font-bold text-[#4a2c2a] text-lg">Total</span><span class="text-3xl font-serif text-[#4a2c2a]">¥${grandTotal}</span>
                </div>
                <button onclick="generatePass()" class="w-full py-4 bg-[#4a2c2a] text-white rounded-xl font-bold shadow-lg hover:bg-[#3e2b26] transition">Confirm Order</button>
            </div>
        `;
    }
    html += `</div>`;
    app.innerHTML = html;
}

window.removeFromCart = function(idx) {
    window.appState.cart.splice(idx, 1);
    router('checkout');
}

window.generatePass = function() {
    if (!window.appState.orderId) {
        window.appState.orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        window.appState.activeOrderItems = []; 
        window.appState.orderStatus = 'active'; // Initialize status
    }
    // Update local variable
    window.appState.activeOrderItems = [...window.appState.activeOrderItems, ...window.appState.cart];
    
    // PERSIST TO STORAGE
    DB.set('activeOrder_' + window.appState.orderId, window.appState.activeOrderItems);
    DB.setValue('currentOrderId', window.appState.orderId);
    DB.setValue('orderStatus_' + window.appState.orderId, 'active');

    window.appState.cart = [];
    router('order-pass');
}

window.requestBill = function() {
    // 1. Update State
    window.appState.orderStatus = 'payment_requested';
    // 2. Persist State
    DB.setValue('orderStatus_' + window.appState.orderId, 'payment_requested');
    // 3. Feedback
    alert("Staff has been notified! They will come to your table shortly to finalize the bill.");
    // 4. Re-render to show updated UI (e.g. disabled button)
    router('order-pass');
}

window.closeBill = function() {
    if (window.appState.isAdmin) {
        if(confirm("Admin: Close this bill and clear table?")) {
            // Clean up DB
            localStorage.removeItem('heavenmind_activeOrder_' + window.appState.orderId);
            localStorage.removeItem('heavenmind_orderStatus_' + window.appState.orderId);
            DB.removeValue('currentOrderId');
            
            // Reset State
            window.appState.orderId = null;
            window.appState.activeOrderItems = [];
            window.appState.orderStatus = 'active';
            router('home');
        }
    } else {
        console.log("Customer requested bill closure.");
    }
}

window.removeActiveItem = function(idx) {
    if (!window.appState.isAdmin) {
        alert("Please ask a staff member to remove items from an active order.");
        return;
    }
    if(confirm("Remove this item from the active bill?")) {
        window.appState.activeOrderItems.splice(idx, 1);
        DB.set('activeOrder_' + window.appState.orderId, window.appState.activeOrderItems);
        router('order-pass');
    }
}

window.renderOrderPass = function() {
    // RECOVERY LOGIC: Ensure we load the persistent state if available
    if(!window.appState.orderId) {
        const storedId = DB.getValue('currentOrderId');
        if(storedId) {
            window.appState.orderId = storedId;
            window.appState.activeOrderItems = DB.get('activeOrder_' + storedId);
            window.appState.orderStatus = DB.getValue('orderStatus_' + storedId) || 'active';
        } else {
            // No active order, go home
            router('home'); return;
        }
    } else {
        // Even if ID exists in memory, refresh data from storage to be safe (sync tabs)
        window.appState.activeOrderItems = DB.get('activeOrder_' + window.appState.orderId);
        window.appState.orderStatus = DB.getValue('orderStatus_' + window.appState.orderId) || 'active';
    }

    const subTotal = window.appState.activeOrderItems.reduce((a, b) => a + b.price, 0);
    const tax = Math.floor(subTotal * 0.1);
    const service = Math.floor(subTotal * 0.05);
    const grandTotal = subTotal + tax + service;

    let itemListHtml = '';
    window.appState.activeOrderItems.forEach((item, idx) => {
        const deleteBtn = window.appState.isAdmin ? `<button onclick="removeActiveItem(${idx})" class="text-gray-300 hover:text-red-500 text-xs px-2">✕</button>` : '';
        itemListHtml += `
            <div class="flex justify-between items-center py-2 border-b border-[#eee] text-sm">
                <span class="text-[#4a2c2a]">${item.name}</span>
                <div class="flex items-center gap-2"><span class="font-bold text-[#4a2c2a]">¥${item.price}</span>${deleteBtn}</div>
            </div>
        `;
    });
    
    // Dynamic Button based on Status
    let actionButton;
    if (window.appState.isAdmin) {
         actionButton = `
            <button onclick="closeBill()" class="w-full py-3 bg-red-600 text-white rounded-xl font-bold shadow hover:bg-red-700">✓ Staff: Close Bill</button>
        `;
    } else {
        if (window.appState.orderStatus === 'payment_requested') {
            actionButton = `
                <div class="w-full py-3 bg-stone-200 text-stone-500 rounded-xl font-bold text-center border border-stone-300 flex items-center justify-center gap-2">
                    <div class="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                    Wait for Staff...
                </div>
            `;
        } else {
            actionButton = `
                <button onclick="requestBill()" class="w-full py-3 bg-[#a07a67] text-white rounded-xl font-bold shadow hover:bg-[#8d6b5a]">👋 Call Staff to Pay</button>
            `;
        }
    }

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="px-6 py-8 flex flex-col min-h-screen bg-[#f8f5f0] pb-24 fade-in">
            
            <!-- Ticket Header -->
            <div class="bg-white p-6 rounded-t-3xl shadow-sm border border-[#eee] text-center relative">
                <div class="absolute top-0 left-0 w-full h-2 bg-[#a07a67] rounded-t-3xl"></div>
                <h2 class="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Table Order</h2>
                <div class="text-3xl font-mono font-bold text-[#4a2c2a]">${window.appState.orderId}</div>
            </div>

            <!-- QR Section (JS Generated) -->
            <div class="bg-white p-4 border-x border-[#eee] flex flex-col items-center">
                <div id="order-qr-target" class="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                    <!-- QR Here -->
                </div>
                <p class="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Scan for Bill</p>
                
                <!-- NEW DOWNLOAD BUTTON -->
                <button onclick="downloadQR('order-qr-target')" class="mt-4 text-xs font-bold text-[#a07a67] hover:text-[#4a2c2a] flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Save Ticket
                </button>
            </div>

            <!-- Active Order List -->
            <div class="bg-white p-6 border-x border-b border-[#eee] rounded-b-3xl shadow-sm flex-1 flex flex-col">
                <h3 class="text-xs font-bold text-gray-400 uppercase mb-3">Current Bill</h3>
                <div class="flex-1 overflow-y-auto max-h-48 mb-4">
                    ${itemListHtml || '<p class="text-center text-gray-300 text-sm italic">No items yet</p>'}
                </div>
                
                <div class="border-t border-dashed border-stone-200 pt-4 mb-6 text-sm">
                    <div class="flex justify-between mb-1 text-gray-500"><span>Subtotal</span><span>¥${subTotal}</span></div>
                    <div class="flex justify-between mb-1 text-gray-500"><span>Tax</span><span>¥${tax}</span></div>
                    <div class="flex justify-between mb-2 text-gray-500"><span>Service</span><span>¥${service}</span></div>
                    <div class="flex justify-between items-center pt-2 border-t border-[#eee]">
                        <span class="font-bold text-[#4a2c2a]">Total</span><span class="text-2xl font-serif text-[#4a2c2a]">¥${grandTotal}</span>
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <button onclick="router('menu')" class="w-full py-3 bg-[#f8f5f0] text-[#4a2c2a] rounded-xl font-bold border border-[#eee] hover:bg-[#eee]">+ Add More Items</button>
                    ${actionButton}
                </div>
            </div>
        </div>
    `;

    // Generate QR Code locally
    setTimeout(() => {
        const target = document.getElementById('order-qr-target');
        if(target) {
            target.innerHTML = '';
            // Using QRCode.js to generate the QR code from the order ID
            new QRCode(target, {
                text: window.appState.orderId,
                width: 160,
                height: 160,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        }
    }, 100);
}

// --- UPDATED DOWNLOAD LOGIC (LOCAL IMAGES) ---
window.downloadQR = function(elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    // qrcode.js generates an <img> or <canvas>
    const img = container.querySelector('img');
    const canvas = container.querySelector('canvas');
    
    let url = '';
    
    if (img && img.src) {
        url = img.src;
    } else if (canvas) {
        url = canvas.toDataURL("image/png");
    }

    if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `MoodCafe-Order-${window.appState.orderId || 'QR'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("QR Code generation in progress. Please wait a moment.");
    }
}

// --- LIBRARY WITH LOCAL DB ---

window.renderLibrary = function() {
    // LOAD FROM LOCAL DB
    const books = DB.get('stories');
    if(books.length === 0) {
        // Add dummy data if empty
        DB.add('stories', { title: 'The Quiet Morning', author: 'Jane Doe', mood: 'relaxed', content: 'The sun rose slowly...', cover: 'bg-orange-200' });
        DB.add('stories', { title: 'Energy Shift', author: 'John Smith', mood: 'tired', content: 'The engines roared...', cover: 'bg-blue-200' });
    }
    
    const allBooks = DB.get('stories');
    const filteredBooks = window.appState.mood ? allBooks.filter(b => b.mood === window.appState.mood) : allBooks;
    
    let html = `
        <div class="px-6 py-8 pb-24 fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-serif text-stone-800">Library</h2>
                <button onclick="router('write')" class="bg-stone-800 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">Write Story</button>
            </div>
            ${window.appState.mood ? `<div class="mb-6 bg-amber-50 p-2 rounded text-sm text-amber-800 flex justify-between"><span>Mood: ${window.appState.mood}</span><button onclick="clearMood()">Clear</button></div>` : ''}
            
            <div class="grid grid-cols-2 gap-4">
    `;
    filteredBooks.forEach((book) => {
        // Determine Cover (Image or Color)
        let coverHtml;
        if (book.cover && book.cover.startsWith('data:image')) {
            coverHtml = `<img src="${book.cover}" class="w-full h-full object-cover">`;
        } else {
            coverHtml = `<div class="w-full h-full ${book.cover || 'bg-stone-200'}"></div>`;
        }

        html += `
            <div class="relative group">
                <div onclick="openReader('${book.id}')" class="cursor-pointer">
                    <div class="aspect-[2/3] rounded-lg shadow-md mb-2 relative overflow-hidden">
                        ${coverHtml}
                        <div class="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition"></div>
                    </div>
                    <h3 class="font-bold text-stone-800 text-sm leading-tight">${book.title}</h3>
                    <p class="text-stone-500 text-xs">${book.author}</p>
                </div>
                ${window.appState.isAdmin ? `<button onclick="deleteStory('${book.id}')" class="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md z-10">✕</button>` : ''}
            </div>
        `;
    });
    html += `</div></div>`;
    app.innerHTML = html;
}

window.deleteStory = function(id) {
    if(confirm('Delete this story?')) {
        DB.delete('stories', id);
        renderLibrary();
    }
}

window.clearMood = function() {
    window.appState.mood = null;
    renderLibrary();
}

window.openReader = function(id) {
    const allBooks = DB.get('stories');
    const book = allBooks.find(s => s.id == id);
    router('reader', book);
}

window.renderReader = function() {
    const b = window.appState.activeBook;
    
    // Cover Image in Reader
    let headerImage = '';
    if (b.cover && b.cover.startsWith('data:image')) {
        headerImage = `<img src="${b.cover}" class="w-full h-64 object-cover mb-6 rounded-b-3xl shadow-lg">`;
    }

    app.innerHTML = `
        <div class="bg-stone-50 min-h-screen pb-24 fade-in">
            <div class="sticky top-0 bg-white/90 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
                <button onclick="router('library')" class="text-stone-500">← Back</button>
                <div class="text-center"><h3 class="font-bold text-stone-800 text-sm truncate max-w-[150px]">${b.title}</h3></div>
                <div></div>
            </div>
            ${headerImage}
            <div class="px-8 ${headerImage ? '' : 'pt-10'} max-w-2xl mx-auto">
                <!-- Content rendered as HTML to support embedded images -->
                <div class="font-serif text-lg leading-loose text-stone-800 whitespace-pre-wrap">${b.content}</div>
            </div>
        </div>
    `;
}

// --- WRITE STORY VIEW (WITH IMAGE UPLOAD) ---
window.renderWrite = function() {
    app.innerHTML = `
        <div class="px-6 py-8 pb-24 fade-in">
            <div class="flex items-center mb-6"><button onclick="router('library')" class="mr-4 p-2 rounded-full bg-stone-100">←</button><h2 class="text-2xl font-serif text-stone-800">Submit Story</h2></div>
            <div class="space-y-4">
                <div class="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200">
                    <strong>Rules:</strong> Keep it clean. Admin has the right to remove content.
                </div>
                
                <div><label class="block font-bold text-sm mb-1 text-stone-600">Title</label><input id="inp-title" class="w-full p-3 border rounded-lg focus:border-amber-500 outline-none"></div>
                
                <div><label class="block font-bold text-sm mb-1 text-stone-600">Mood</label>
                    <select id="inp-mood" class="w-full p-3 border rounded-lg bg-white">
                        <option value="happy">Happy</option>
                        <option value="tired">Tired</option>
                        <option value="relaxed">Relaxed</option>
                        <option value="sad">Blue</option>
                    </select>
                </div>

                <!-- Cover Photo Input -->
                <div>
                    <label class="block font-bold text-sm mb-1 text-stone-600">Cover Photo</label>
                    <input type="file" id="inp-cover" accept="image/*" class="text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100">
                </div>

                <!-- Content Area with Insert Image -->
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="block font-bold text-sm text-stone-600">Story Content</label>
                        <button onclick="document.getElementById('inp-body-img').click()" class="text-xs bg-stone-200 px-2 py-1 rounded hover:bg-stone-300">📷 Add Image to Text</button>
                        <input type="file" id="inp-body-img" accept="image/*" class="hidden" onchange="insertBodyImage(this)">
                    </div>
                    <div id="inp-content" contenteditable="true" class="w-full p-3 border rounded-lg h-64 focus:border-amber-500 outline-none overflow-y-auto bg-white" placeholder="Start writing..."></div>
                </div>

                <button onclick="submitStory()" class="w-full py-4 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition">Publish to Library</button>
            </div>
        </div>
    `;
}

window.insertBodyImage = async function(input) {
    if (input.files && input.files[0]) {
        try {
            const base64 = await readFile(input.files[0]);
            const imgTag = `<img src="${base64}" class="w-full rounded-lg my-4 shadow-sm">`;
            // Insert at end or cursor (simplified to end for now)
            document.getElementById('inp-content').innerHTML += imgTag + '<br>';
        } catch (e) {
            alert("Failed to load image");
        }
    }
}

window.submitStory = async function() {
    const title = document.getElementById('inp-title').value;
    const content = document.getElementById('inp-content').innerHTML; // Get HTML from contenteditable
    const mood = document.getElementById('inp-mood').value;
    const coverInput = document.getElementById('inp-cover');
    
    let coverData = 'bg-stone-300'; // Default fallback
    
    if(coverInput.files && coverInput.files[0]) {
        try {
            coverData = await readFile(coverInput.files[0]);
        } catch(e) {
            console.error("Cover upload failed");
        }
    }

    if(title && content) {
        DB.add('stories', {
            title, 
            content, 
            author: 'Guest Author', 
            mood, 
            cover: coverData 
        });
        router('library');
    } else {
        alert("Please fill in title and content");
    }
}

// --- REVIEWS PAGE WITH LOCAL DB ---

window.renderReviews = function() {
    const reviews = DB.get('reviews');
    
    // Calculate Average Rating
    const avg = reviews.length ? (reviews.reduce((a, b) => a + (b.rating || 5), 0) / reviews.length).toFixed(1) : 'New';

    let html = `
        <div class="px-6 py-8 pb-24 fade-in">
            <h2 class="text-2xl font-serif text-stone-800 mb-2">Customer Feedback</h2>
            <div class="flex items-center space-x-2 mb-6">
                <span class="text-3xl font-bold text-amber-600">${avg}</span>
                <div class="text-xs text-stone-400">Average Rating<br>from ${reviews.length} reviews</div>
            </div>

            <div class="bg-white p-4 rounded-xl border border-stone-100 shadow-sm mb-8">
                <h3 class="font-bold text-sm mb-2">Write a Review</h3>
                <select id="rev-rating" class="w-full p-2 border rounded mb-2 text-sm bg-white">
                    <option value="5">★★★★★ Excellent</option>
                    <option value="4">★★★★☆ Good</option>
                    <option value="3">★★★☆☆ Okay</option>
                    <option value="2">★★☆☆☆ Poor</option>
                    <option value="1">★☆☆☆☆ Bad</option>
                </select>
                <textarea id="rev-text" placeholder="Share your experience..." class="w-full p-2 border rounded h-20 text-sm mb-2 resize-none"></textarea>
                <button onclick="submitReview()" class="w-full py-2 bg-amber-600 text-white rounded text-sm font-bold">Post Feedback</button>
            </div>

            <div class="space-y-4">
    `;

    if (reviews.length === 0) {
        html += `<p class="text-center text-stone-400 text-sm">No reviews yet.</p>`;
    }

    // Sort by newest
    reviews.sort((a,b) => b.createdAt - a.createdAt).forEach(rev => {
        const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
        html += `
            <div class="bg-white p-4 rounded-xl border border-stone-100 relative group">
                <div class="flex justify-between mb-1">
                    <span class="text-amber-500 text-sm">${stars}</span>
                    <span class="text-[10px] text-stone-300">Verified Customer</span>
                </div>
                <p class="text-stone-600 text-sm leading-relaxed">${rev.text}</p>
                ${window.appState.isAdmin ? `<button onclick="deleteReview('${rev.id}')" class="absolute top-2 right-2 text-red-300 hover:text-red-600 text-xs">Delete</button>` : ''}
            </div>
        `;
    });

    html += `</div></div>`;
    app.innerHTML = html;
}

window.submitReview = function() {
    const rating = parseInt(document.getElementById('rev-rating').value);
    const text = document.getElementById('rev-text').value;

    if (text) {
        DB.add('reviews', { rating, text });
        // Clear form
        document.getElementById('rev-text').value = '';
        renderReviews(); // Refresh list
    }
}

window.deleteReview = function(id) {
    if(confirm('Delete this review?')) {
        DB.delete('reviews', id);
        renderReviews();
    }
}

// --- NEW PAGE RENDERERS FOR LINKS ---

window.renderBrews = function() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="fade-in bg-white min-h-screen">
            <div class="h-64 bg-[#4a2c2a] text-white flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 bg-black/30"></div>
                <div class="relative z-10 text-center p-4">
                    <h1 class="text-4xl font-serif mb-2">Specialty Brews</h1>
                    <p class="text-[#e8d5c4]">Hand-dripped perfection in every cup.</p>
                </div>
            </div>
            
            <div class="max-w-2xl mx-auto p-8">
                <h2 class="text-2xl font-serif text-[#4a2c2a] mb-4">The Art of Pour Over</h2>
                <p class="text-gray-600 leading-relaxed mb-6">
                    We believe that speed kills quality. That's why our "Specialty Brews" are exclusively hand-dripped using the pour-over method (V60 or Chemex) to extract the most delicate floral and fruity notes from our beans.
                </p>
                
                <div class="bg-[#f8f5f0] p-6 rounded-xl border-l-4 border-[#a07a67]">
                    <ul class="space-y-3 text-[#4a2c2a]">
                        <li><strong>🔹 V60:</strong> Clean, crisp, and highlights acidity.</li>
                        <li><strong>🔹 Chemex:</strong> Rich, smooth, and balanced body.</li>
                        <li><strong>🔹 Siphon:</strong> A theatrical brewing method for intense aroma.</li>
                    </ul>
                </div>
                
                <button onclick="router('home')" class="mt-8 text-[#a07a67] font-bold hover:underline">← Back to Home</button>
            </div>
        </div>
    `;
}

window.renderBeans = function() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="fade-in bg-white min-h-screen">
            <div class="h-64 bg-[#2c4a3b] text-white flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 bg-black/30"></div>
                <div class="relative z-10 text-center p-4">
                    <h1 class="text-4xl font-serif mb-2">Fresh Beans</h1>
                    <p class="text-[#d5e8c4]">Directly sourced from sustainable farms.</p>
                </div>
            </div>
            
            <div class="max-w-2xl mx-auto p-8">
                <h2 class="text-2xl font-serif text-[#4a2c2a] mb-4">From Farm to Cup</h2>
                <p class="text-gray-600 leading-relaxed mb-6">
                    We partner directly with small-lot farmers in Ethiopia, Colombia, and Guatemala. By cutting out the middleman, we ensure farmers get paid fairly and you get the freshest beans possible.
                </p>
                
                <div class="bg-green-50 p-6 rounded-xl border-l-4 border-green-700">
                    <p class="text-green-800">
                        You can purchase <strong>200g bags</strong> of any bean we serve. Ask our baristas for the roast date—we never sell beans older than 2 weeks.
                    </p>
                </div>

                <button onclick="router('home')" class="mt-8 text-[#a07a67] font-bold hover:underline">← Back to Home</button>
            </div>
        </div>
    `;
}

window.renderTakeout = function() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="fade-in bg-white min-h-screen">
            <div class="h-64 bg-[#d97706] text-white flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 bg-black/30"></div>
                <div class="relative z-10 text-center p-4">
                    <h1 class="text-4xl font-serif mb-2">Takeout & Delivery</h1>
                    <p class="text-yellow-100">Enjoy HEAVEN MIND anywhere you go.</p>
                </div>
            </div>
            
            <div class="max-w-2xl mx-auto p-8">
                <div class="mb-8">
                    <h2 class="text-2xl font-serif text-[#4a2c2a] mb-2">Coffee on the Go</h2>
                    <p class="text-gray-600">In a rush? Order ahead via this App and pick it up at the counter. No lines, no waiting.</p>
                </div>
                
                <div class="mb-8">
                    <h2 class="text-2xl font-serif text-[#4a2c2a] mb-2">Delivery Partners</h2>
                    <p class="text-gray-600">
                        We also deliver via UberEats and DoorDash within a 3km radius. We use specially designed spill-proof cups and biodegradable packaging to ensure your coffee arrives hot and the planet stays cool.
                    </p>
                </div>
                
                <button onclick="router('menu')" class="w-full py-4 bg-[#4a2c2a] text-white rounded-xl font-bold shadow-lg mb-4">Start Mobile Order</button>
                <button onclick="router('home')" class="block w-full text-center text-[#a07a67] font-bold hover:underline">← Back to Home</button>
            </div>
        </div>
    `;
}

window.renderWorkshops = function() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="fade-in bg-white min-h-screen">
            <div class="h-64 bg-[#57534e] text-white flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 bg-black/30"></div>
                <div class="relative z-10 text-center p-4">
                    <h1 class="text-4xl font-serif mb-2">Barista Workshops</h1>
                    <p class="text-stone-200">Learn the art of brewing from the pros.</p>
                </div>
            </div>
            
            <div class="max-w-2xl mx-auto p-8">
                <h2 class="text-2xl font-serif text-[#4a2c2a] mb-4">Become a Home Barista</h2>
                <p class="text-gray-600 leading-relaxed mb-8">
                    Ever wanted to pour the perfect latte art heart? Or dial in your espresso grind? We host weekend workshops for coffee enthusiasts of all levels.
                </p>
                
                <div class="bg-white rounded-2xl shadow-lg border border-[#eee] overflow-hidden">
                    <div class="bg-[#4a2c2a] text-white p-4 font-bold text-center">Upcoming Classes</div>
                    <div class="divide-y divide-[#eee]">
                        <div class="p-4 flex justify-between items-center hover:bg-gray-50">
                            <div>
                                <h4 class="font-bold text-[#4a2c2a]">Latte Art Basics</h4>
                                <p class="text-xs text-gray-500">Saturdays 10:00 AM</p>
                            </div>
                            <button class="px-4 py-2 bg-[#a07a67] text-white text-xs rounded-full">Book</button>
                        </div>
                        <div class="p-4 flex justify-between items-center hover:bg-gray-50">
                            <div>
                                <h4 class="font-bold text-[#4a2c2a]">Hand Drip Mastery</h4>
                                <p class="text-xs text-gray-500">Sundays 2:00 PM</p>
                            </div>
                            <button class="px-4 py-2 bg-[#a07a67] text-white text-xs rounded-full">Book</button>
                        </div>
                         <div class="p-4 flex justify-between items-center hover:bg-gray-50">
                            <div>
                                <h4 class="font-bold text-[#4a2c2a]">Bean Roasting 101</h4>
                                <p class="text-xs text-gray-500">First Monday of Month</p>
                            </div>
                            <button class="px-4 py-2 bg-[#a07a67] text-white text-xs rounded-full">Book</button>
                        </div>
                    </div>
                </div>

                <button onclick="router('home')" class="mt-8 text-[#a07a67] font-bold hover:underline">← Back to Home</button>
            </div>
        </div>
    `;
}

// INITIALIZE APP
initApp();