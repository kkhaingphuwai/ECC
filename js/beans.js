 // 0. State Management
    let currentLang = 'en'; // Default language

    // 1. Static UI Translations
    const uiTranslations = {
        title: { en: "The Barista's Codex", ja: "バリスタの聖典 (Barista's Codex)" },
        subtitle: { en: "Origin, Process, and Profile Guide", ja: "産地・精製・プロファイルガイド" },
        btnAll: { en: "All Beans", ja: "全ての豆" },
        btnArabica: { en: "Arabica", ja: "アラビカ種" },
        btnRobusta: { en: "Robusta", ja: "ロブスタ種" },
        
        // Modal Labels
        lblSpecies: { en: "Species", ja: "品種" },
        lblVarietal: { en: "Varietal", ja: "亜種 (バリエタル)" },
        lblProcess: { en: "Process", ja: "精製方法" },
        lblAltitude: { en: "Altitude", ja: "標高" },
        lblRoast: { en: "Roast Profile", ja: "焙煎度" },
        lblUsage: { en: "Best For", ja: "おすすめの抽出" }
    };

    
    // 2. The Data with Bilingual Support
    const beansData = [
        {
            id: 1,
            name: { en: "Ethiopian Yirgacheffe", ja: "エチオピア・イルガチェフェ" },
            species: { en: "Arabica", ja: "アラビカ" },
            region: { en: "Gedeo Zone, Ethiopia", ja: "エチオピア、ゲデオゾーン" },
            varietal: { en: "Heirloom", ja: "在来種 (Heirloom)" },
            process: { en: "Washed", ja: "ウォッシュド" },
            altitude: "1,700 - 2,200 m",
            roast: { en: "Light to Medium", ja: "浅煎り 〜 中煎り" },
            flavor: { en: "Floral, bright citrus, lemon, tea-like body.", ja: "フローラル、明るい柑橘系、レモン、紅茶のような口当たり。" },
            usage: { en: "Pour-over, Cold Brew", ja: "ハンドドリップ、水出しコーヒー" }
        },
        {
            id: 2,
            name: { en: "Sumatra Mandheling", ja: "スマトラ・マンデリン" },
            species: { en: "Arabica", ja: "アラビカ" },
            region: { en: "Aceh, Indonesia", ja: "インドネシア、アチェ" },
            varietal: { en: "Catimor, Typica", ja: "カティモール、ティピカ" },
            process: { en: "Giling Basah (Wet Hulled)", ja: "スマトラ式 (ギリン・バサ)" },
            altitude: "1,100 - 1,500 m",
            roast: { en: "Dark", ja: "深煎り" },
            flavor: { en: "Earthy, spicy, tobacco, low acidity, heavy body.", ja: "アーシー、スパイシー、タバコ、酸味控えめ、重厚なコク。" },
            usage: { en: "Espresso, French Press", ja: "エスプレッソ、フレンチプレス" }
        },
        {
            id: 3,
            name: { en: "Colombian Supremo", ja: "コロンビア・スプレモ" },
            species: { en: "Arabica", ja: "アラビカ" },
            region: { en: "Huila, Colombia", ja: "コロンビア、ウィラ" },
            varietal: { en: "Caturra, Castillo", ja: "カトゥーラ、カスティージョ" },
            process: { en: "Washed", ja: "ウォッシュド" },
            altitude: "1,200 - 2,000 m",
            roast: { en: "Medium", ja: "中煎り" },
            flavor: { en: "Caramel sweetness, nutty, balanced acidity, cherry.", ja: "キャラメルのような甘さ、ナッツ、バランスの良い酸味、チェリー。" },
            usage: { en: "Espresso Blends, Aeropress", ja: "エスプレッソブレンド、エアロプレス" }
        },
        {
            id: 4,
            name: { en: "Vietnam Robusta", ja: "ベトナム・ロブスタ" },
            species: { en: "Robusta", ja: "ロブスタ" },
            region: { en: "Central Highlands, Vietnam", ja: "ベトナム、中部高原" },
            varietal: { en: "Robusta", ja: "ロブスタ" },
            process: { en: "Natural", ja: "ナチュラル" },
            altitude: "500 - 800 m",
            roast: { en: "Dark", ja: "深煎り" },
            flavor: { en: "Strong bitterness, dark chocolate, woody, high caffeine.", ja: "強い苦味、ダークチョコレート、ウッディ、高いカフェイン含有量。" },
            usage: { en: "Phin Filter, Milk-based drinks", ja: "フィン（ベトナム式）、カフェオレ" }
        },
        {
            id: 5,
            name: { en: "Costa Rica Honey", ja: "コスタリカ・ハニー" },
            species: { en: "Arabica", ja: "アラビカ" },
            region: { en: "Tarrazu, Costa Rica", ja: "コスタリカ、タラス" },
            varietal: { en: "Catuai", ja: "カトゥアイ" },
            process: { en: "Yellow Honey", ja: "イエローハニー" },
            altitude: "1,300 - 1,600 m",
            roast: { en: "Medium", ja: "中煎り" },
            flavor: { en: "Sweet, fruity complexity, syrup-like body.", ja: "甘み、フルーティーな複雑さ、シロップのような質感。" },
            usage: { en: "V60, Chemex", ja: "V60、ケメックス" }
        }
    ];

    const grid = document.getElementById('bean-grid');
    const modal = document.getElementById('modal');
    const btns = document.querySelectorAll('.filter-btn');
    let currentFilter = 'all';

    // 3. Language Logic
    function toggleLanguage() {
        currentLang = currentLang === 'en' ? 'ja' : 'en';
        updateUIText();
        renderBeans(currentFilter);
    }

    function updateUIText() {
        // Headers
        document.getElementById('ui-title').innerText = uiTranslations.title[currentLang];
        document.getElementById('ui-subtitle').innerText = uiTranslations.subtitle[currentLang];
        
        // Filter Buttons
        document.getElementById('btn-all').innerText = uiTranslations.btnAll[currentLang];
        document.getElementById('btn-arabica').innerText = uiTranslations.btnArabica[currentLang];
        document.getElementById('btn-robusta').innerText = uiTranslations.btnRobusta[currentLang];

        // Modal Labels
        document.getElementById('lbl-species').innerText = uiTranslations.lblSpecies[currentLang];
        document.getElementById('lbl-varietal').innerText = uiTranslations.lblVarietal[currentLang];
        document.getElementById('lbl-process').innerText = uiTranslations.lblProcess[currentLang];
        document.getElementById('lbl-altitude').innerText = uiTranslations.lblAltitude[currentLang];
        document.getElementById('lbl-roast').innerText = uiTranslations.lblRoast[currentLang];
        document.getElementById('lbl-usage').innerText = uiTranslations.lblUsage[currentLang];
    }

    // 4. Render Functions
    function renderBeans(filterType) {
        currentFilter = filterType; // Save state for language toggle
        grid.innerHTML = ''; 
        
        // Filter Logic (Note: checking against 'en' value for logic, independent of display lang)
        const filtered = filterType === 'all' 
            ? beansData 
            : beansData.filter(bean => bean.species.en === filterType);

        filtered.forEach(bean => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">☕</div>
                <div class="card-body">
                    <p class="bean-origin">${bean.region[currentLang]}</p>
                    <h3 class="bean-name">${bean.name[currentLang]}</h3>
                    <div class="tags">
                        <span class="tag">${bean.process[currentLang]}</span>
                        <span class="tag">${bean.roast[currentLang]}</span>
                    </div>
                </div>
            `;
            card.onclick = () => openModal(bean);
            grid.appendChild(card);
        });
    }

    // 5. Modal Logic
    function openModal(bean) {
        document.getElementById('modal-title').innerText = bean.name[currentLang];
        document.getElementById('modal-subtitle').innerText = `${bean.region[currentLang]} (${bean.species[currentLang]})`;
        document.getElementById('modal-flavor').innerText = `"${bean.flavor[currentLang]}"`;
        
        // Technical Details
        document.getElementById('modal-species').innerText = bean.species[currentLang];
        document.getElementById('modal-varietal').innerText = bean.varietal[currentLang];
        document.getElementById('modal-process').innerText = bean.process[currentLang];
        document.getElementById('modal-altitude').innerText = bean.altitude; // Numbers don't need trans
        document.getElementById('modal-roast').innerText = bean.roast[currentLang];
        document.getElementById('modal-usage').innerText = bean.usage[currentLang];

        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    // Close modal if clicking outside content
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    // 6. Filter Logic
    function filterBeans(type) {
        // Update active button state
        btns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        renderBeans(type);
    }

    // Initial Render
    renderBeans('all');
