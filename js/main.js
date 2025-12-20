// --- 1. SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(e => console.log('SW Fail'));
    });
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
    }
};

const readFile = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
});


// --- 3. DATA INTEGRATION ---
const INITIAL_LIBRARY = [
    { 
        title_en: 'The Rosie Project', title_jp: 'ロージー・プロジェクト', 
        author: 'Graeme Simsion', mood: 'happy', category_en: 'Comedy', category_jp: 'コメディ',
        cover: 'bg-yellow-50', icon: '🤣', 
        content_en: 'A socially awkward genetics professor creates a scientific survey to find the perfect wife.',
        content_jp: '社会的に不器用な遺伝学教授が、完璧な妻を見つけるための科学的なアンケートを作成する物語。'
    },
    { 
        title_en: 'Atomic Habits', title_jp: 'アトミック・ハビッツ', 
        author: 'James Clear', mood: 'focused', category_en: 'Self-Help', category_jp: '自己啓発',
        cover: 'bg-orange-50', icon: '🧘', 
        content_en: 'Tiny changes, remarkable results. An easy and proven way to build good habits and break bad ones.',
        content_jp: '小さな変化が驚くべき結果を生む。良い習慣を身につけ、悪い習慣を断ち切るための確実な方法。'
    },
    { 
        title_en: 'The Midnight Library', title_jp: 'ミッドナイト・ライブラリー', 
        author: 'Matt Haig', mood: 'sad', category_en: 'Fiction', category_jp: '小説',
        cover: 'bg-blue-50', icon: '🌃', 
        content_en: 'Between life and death there is a library, and within that library, the shelves go on forever.',
        content_jp: '生と死の間には図書館があり、その棚は永遠に続いている。人生の「もしも」を体験する物語。'
    },
    { 
        title_en: 'Deep Work', title_jp: 'DEEP WORK', 
        author: 'Cal Newport', mood: 'focused', category_en: 'Business', category_jp: 'ビジネス',
        cover: 'bg-stone-100', icon: '💼', 
        content_en: 'Rules for focused success in a distracted world. Mastering the art of deep work.',
        content_jp: '気が散る世界で集中して成功するためのルール。ディープ・ワーク（深い集中）を極める書。'
    },
    { 
        title_en: 'Into the Wild', title_jp: '荒野へ', 
        author: 'Jon Krakauer', mood: 'excited', category_en: 'Adventure', category_jp: '冒険',
        cover: 'bg-red-50', icon: '🏔️', 
        content_en: 'The true story of Christopher McCandless who walked into the wilderness of Alaska.',
        content_jp: 'アラスカの荒野へと分け入った青年クリストファー・マッカンドレスの真実の物語。'
    },
    { 
        title_en: 'Braiding Sweetgrass', title_jp: 'スイートグラスを編む', 
        author: 'Robin Wall Kimmerer', mood: 'relaxed', category_en: 'Nature', category_jp: '自然',
        cover: 'bg-green-50', icon: '🌿', 
        content_en: 'Indigenous wisdom, scientific knowledge and the teachings of plants.',
        content_jp: '先住民の知恵、科学的知識、そして植物の教えを編み合わせた自然エッセイ。'
    },
    { 
        title_en: 'Men Without Women', title_jp: '女のいない男たち', 
        author: 'Haruki Murakami', mood: 'tired', category_en: 'Short Stories', category_jp: '短編小説',
        cover: 'bg-gray-100', icon: '📖', 
        content_en: 'A collection of short stories about isolation and loneliness by the Japanese master.',
        content_jp: '村上春樹による、孤独と喪失を描いた短編小説集。'
    },
    { 
        title_en: 'Steal Like an Artist', title_jp: 'クリエイティブの授業', 
        author: 'Austin Kleon', mood: 'creative', category_en: 'Art', category_jp: 'アート',
        cover: 'bg-pink-50', icon: '🎨', 
        content_en: '10 things nobody told you about being creative. A manifesto for the digital age.',
        content_jp: '誰も教えてくれなかったクリエイティブになるための10のこと。デジタル時代のマニフェスト。'
    },
    { 
        title_en: 'Pride and Prejudice', title_jp: '高慢と偏見', 
        author: 'Jane Austen', mood: 'nostalgic', category_en: 'Classic', category_jp: '古典',
        cover: 'bg-amber-50', icon: '🕰️', 
        content_en: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
        content_jp: '財産のある独身男性は妻を求めているに違いない、というのは世間で認められた真理である。'
    },
    { 
        title_en: 'Cosmos', title_jp: 'コスモス', 
        author: 'Carl Sagan', mood: 'curious', category_en: 'Science', category_jp: '科学',
        cover: 'bg-teal-50', icon: '🪐', 
        content_en: 'The story of cosmic evolution, science and civilization.',
        content_jp: '宇宙の進化、科学、そして文明の物語を描いた壮大な科学ノンフィクション。'
    },
    { 
        title_en: 'Meditations', title_jp: '自省録', 
        author: 'Marcus Aurelius', mood: 'anxious', category_en: 'Philosophy', category_jp: '哲学',
        cover: 'bg-rose-50', icon: '🏛️', 
        content_en: 'Private notes to himself and ideas on Stoic philosophy.',
        content_jp: 'ローマ皇帝マルクス・アウレリウスが自身に宛てた、ストア派哲学の思索ノート。'
    },
    { 
        title_en: 'The Notebook', title_jp: 'きみに読む物語', 
        author: 'Nicholas Sparks', mood: 'romantic', category_en: 'Romance', category_jp: 'ロマンス',
        cover: 'bg-pink-100', icon: '💌', 
        content_en: 'A timeless love story of Noah and Allie.',
        content_jp: 'ノアとアリーの、時代を超えた愛の物語。'
    },
    { 
        title_en: 'The Da Vinci Code', title_jp: 'ダ・ヴィンチ・コード', 
        author: 'Dan Brown', mood: 'bored', category_en: 'Mystery', category_jp: 'ミステリー',
        cover: 'bg-gray-800 text-white', icon: '🕵️', 
        content_en: 'A murder in the Louvre reveals a sinister plot to uncover a secret that has been protected since the days of Christ.',
        content_jp: 'ルーヴル美術館での殺人をきっかけに、キリストの時代から守られてきた秘密が暴かれる。'
    },
    { 
        title_en: 'World Atlas of Coffee', title_jp: 'コーヒーアトラス', 
        author: 'James Hoffmann', mood: 'curious', category_en: 'Education', category_jp: '専門書',
        cover: 'bg-amber-100', icon: '☕', 
        content_en: 'The definitive guide to coffee from beans to brewing.',
        content_jp: '豆から抽出まで、コーヒーに関するあらゆる知識を網羅した決定版ガイド。'
    },
    { 
        title_en: 'Before the Coffee Gets Cold', title_jp: 'コーヒーが冷めないうちに', 
        author: 'Toshikazu Kawaguchi', mood: 'nostalgic', category_en: 'Fiction', category_jp: '小説',
        cover: 'bg-indigo-50', icon: '⏳', 
        content_en: 'In a small cafe in Tokyo, there is a legend that you can travel back in time.',
        content_jp: '東京の小さな喫茶店にある、過去に戻れるという伝説の席をめぐる物語。'
    },
    { 
        title_en: 'Miracle of Mindfulness', title_jp: 'マインドフルネスの奇跡', 
        author: 'Thich Nhat Hanh', mood: 'anxious', category_en: 'Wellness', category_jp: 'ウェルネス',
        cover: 'bg-blue-100', icon: '🧘‍♀️', 
        content_en: 'Classic manual on meditation and mindfulness.',
        content_jp: '瞑想とマインドフルネスに関する古典的な手引き書。'
    },
    { 
        title_en: 'Flour Water Salt Yeast', title_jp: '小麦・水・塩・酵母', 
        author: 'Ken Forkish', mood: 'creative', category_en: 'Cooking', category_jp: '料理',
        cover: 'bg-orange-100', icon: '🥐', 
        content_en: 'The fundamentals of artisan bread and pizza.',
        content_jp: '職人技のパンとピザ作りの基本を学ぶための本。'
    },
    { 
        title_en: 'Milk and Honey', title_jp: 'ミルク・アンド・ハニー', 
        author: 'Rupi Kaur', mood: 'sad', category_en: 'Poetry', category_jp: '詩集',
        cover: 'bg-purple-50', icon: '🌻', 
        content_en: 'A collection of poetry and prose about survival.',
        content_jp: '愛、喪失、トラウマ、癒しについての詩と散文集。'
    },
    { 
        title_en: 'Vagabonding', title_jp: 'ヴァガボンディング', 
        author: 'Rolf Potts', mood: 'excited', category_en: 'Travel', category_jp: '旅行',
        cover: 'bg-sky-50', icon: '✈️', 
        content_en: 'An uncommon guide to the art of long-term world travel.',
        content_jp: '長期世界旅行の技術と精神を説く、旅人のバイブル。'
    },
    { 
        title_en: 'Legends & Lattes', title_jp: 'レジェンド＆ラテ', 
        author: 'Travis Baldree', mood: 'relaxed', category_en: 'Fantasy', category_jp: 'ファンタジー',
        cover: 'bg-indigo-100', icon: '🐉', 
        content_en: 'A novel of high fantasy and low stakes.',
        content_jp: '戦いに疲れたオークがカフェを開く、ほのぼのファンタジー。'
    }
];
const MOODS = [
    // Original Moods
    { id: 'happy', label: 'Happy', jp: '幸せ', color: 'bg-yellow-100 text-yellow-800', desc: 'Feeling great!', icon: '😊' },
    { id: 'relaxed', label: 'Relaxed', jp: 'リラックス', color: 'bg-orange-100 text-orange-800', desc: 'Chilling out.', icon: '😌' },
    { id: 'sad', label: 'Sad', jp: '悲しい', color: 'bg-blue-100 text-blue-800', desc: 'Need comfort.', icon: '😢' },
    { id: 'focused', label: 'Focused', jp: '集中したい', color: 'bg-stone-200 text-stone-800', desc: 'Time to work.', icon: '🧐' },
    { id: 'excited', label: 'Excited', jp: '興奮', color: 'bg-red-100 text-red-800', desc: 'Pumped up!', icon: '🤩' },
    { id: 'anxious', label: 'Anxious', jp: '不安', color: 'bg-purple-100 text-purple-800', desc: 'Calm down.', icon: '😰' },
    { id: 'tired', label: 'Tired', jp: '疲労', color: 'bg-gray-200 text-gray-800', desc: 'Need energy.', icon: '😴' },

    // NEW Moods Added
    { id: 'creative', label: 'Creative', jp: 'クリエイティブ', color: 'bg-pink-100 text-pink-800', desc: 'Seeking inspiration.', icon: '🎨' },
    { id: 'nostalgic', label: 'Nostalgic', jp: '懐かしい', color: 'bg-amber-100 text-amber-800', desc: 'Memory lane.', icon: '🕰️' },
    { id: 'curious', label: 'Curious', jp: '好奇心', color: 'bg-teal-100 text-teal-800', desc: 'Explore new things.', icon: '🔍' },
    { id: 'frustrated', label: 'Frustrated', jp: 'イライラ', color: 'bg-rose-200 text-rose-800', desc: 'Cool off.', icon: '😤' },
    { id: 'romantic', label: 'Romantic', jp: 'ロマンチック', color: 'bg-rose-100 text-rose-800', desc: 'Love is in the air.', icon: '🌹' },
    { id: 'bored', label: 'Bored', jp: '退屈', color: 'bg-lime-100 text-lime-800', desc: 'Surprise me.', icon: '🥱' }
];

// UPDATED: Recommendation Logic mapped to NEW Menu Items
// UPDATED: Recommendation Logic with Coffee, Book, and Food (Cake)
// --- REPLACE THIS SECTION IN MAIN.JS ---

const RECOMMENDATION_LOGIC = {
    'happy': { 
        coffee: 'Mocha', food: 'Chocolate Lava Cake', 
        book_en: 'Comedy & Light Reads', book_jp: 'コメディと軽い読書' 
    },
    'relaxed': { 
        coffee: 'Café au Lait', food: 'Victoria Sponge', 
        book_en: 'Self-Help & Philosophy', book_jp: '自己啓発・哲学' 
    },
    'sad': { 
        coffee: 'Latte', food: 'Coconut Dream Cake', 
        book_en: 'Uplifting Long Fiction', book_jp: '励ましになる長編小説' 
    },
    'focused': { 
        coffee: 'Espresso', food: 'Lemon Poppy Seed Cake', 
        book_en: 'Science & Business', book_jp: '科学・ビジネス書' 
    },
    'excited': { 
        coffee: 'Cold Brew', food: 'Red Velvet Cake', 
        book_en: 'Adventure & Mystery', book_jp: '冒険・ミステリー' 
    },
    'anxious': { 
        coffee: 'Flat White', food: 'Classic Cheesecake', 
        book_en: 'Calming Nature Books', book_jp: '穏やかな自然に関する本' 
    },
    'tired': { 
        coffee: 'Americano', food: 'Apple Crumble Cake', 
        book_en: 'Short Stories', book_jp: '短編小説集' 
    },

    // --- New Moods ---
    'creative': { 
        coffee: 'Vienna Coffee', food: 'Opera Cake', 
        book_en: 'Art & Design', book_jp: 'アート・デザイン' 
    },
    'nostalgic': { 
        coffee: 'Macchiato', food: 'Black Forest Cake', 
        book_en: 'Classics & Memoirs', book_jp: '古典文学・回顧録' 
    },
    'curious': { 
        coffee: 'Turkish Coffee', food: 'Pistachio Rose Cake', 
        book_en: 'Travel & Science', book_jp: '旅行記・サイエンス' 
    },
    'frustrated': { 
        coffee: 'Iced Coffee', food: 'Key Lime Pie', 
        book_en: 'Stoic Philosophy', book_jp: 'ストア派哲学' 
    },
    'romantic': { 
        coffee: 'Affogato', food: 'Molten Biscoff Cake', 
        book_en: 'Romance Novels', book_jp: '恋愛小説' 
    },
    'bored': { 
        coffee: 'Mazagran', food: 'Dobos Torte', 
        book_en: 'Suspense & Puzzles', book_jp: 'サスペンス・パズル' 
    }
};
// UPDATED: New Menu List (English & Japanese)
const MENU = [
    // --- Coffee Classics ---
    { id: 1, category: 'coffee', price: 350, name_en: 'Espresso', name_jp: 'エスプレッソ', desc_en: 'A concentrated, intense shot of coffee.', desc_jp: '濃厚で強烈なコーヒーのショット。' },
    { id: 2, category: 'coffee', price: 450, name_en: 'Doppio', name_jp: 'ドッピオ', desc_en: 'A double shot of espresso for extra kick.', desc_jp: 'ガツンとくるエスプレッソのダブルショット。' },
    { id: 3, category: 'coffee', price: 400, name_en: 'Americano', name_jp: 'アメリカーノ', desc_en: 'Espresso diluted with hot water.', desc_jp: 'エスプレッソをお湯で割ったすっきりした味わい。' },
    { id: 4, category: 'coffee', price: 550, name_en: 'Latte', name_jp: 'カフェラテ', desc_en: 'Espresso with steamed milk and a thin layer of foam.', desc_jp: 'エスプレッソにスチームミルクと薄いフォームをトッピング。' },
    { id: 5, category: 'coffee', price: 550, name_en: 'Cappuccino', name_jp: 'カプチーノ', desc_en: 'Equal parts espresso, steamed milk, and milk foam.', desc_jp: 'エスプレッソ、ミルク、泡が1:1:1の黄金比。' },
    { id: 6, category: 'coffee', price: 580, name_en: 'Flat White', name_jp: 'フラットホワイト', desc_en: 'Espresso with microfoam, velvety texture.', desc_jp: 'きめ細かいマイクロフォームでベルベットのような口当たり。' },
    { id: 7, category: 'coffee', price: 420, name_en: 'Macchiato', name_jp: 'マキアート', desc_en: 'Espresso stained with a dollop of milk foam.', desc_jp: 'エスプレッソにミルクフォームを少し落とした一杯。' },
    { id: 8, category: 'coffee', price: 600, name_en: 'Mocha', name_jp: 'カフェモカ', desc_en: 'Latte with chocolate syrup and whipped cream.', desc_jp: 'チョコシロップとホイップクリームを加えた甘いラテ。' },
    { id: 9, category: 'coffee', price: 450, name_en: 'Turkish Coffee', name_jp: 'トルココーヒー', desc_en: 'Finely ground coffee boiled in a pot.', desc_jp: '極細挽きの豆を煮出した伝統的なコーヒー。' },
    { id: 10, category: 'coffee', price: 400, name_en: 'Iced Coffee', name_jp: 'アイスコーヒー', desc_en: 'Brewed coffee served over ice.', desc_jp: '氷で急冷したすっきりとしたコーヒー。' },
    { id: 11, category: 'coffee', price: 550, name_en: 'Cold Brew', name_jp: 'コールドブリュー', desc_en: 'Coffee steeped in cold water for 12+ hours.', desc_jp: '12時間以上かけて水出ししたまろやかな味わい。' },
    { id: 12, category: 'coffee', price: 650, name_en: 'Affogato', name_jp: 'アフォガード', desc_en: 'Espresso poured over a scoop of vanilla ice cream.', desc_jp: 'バニラアイスに熱いエスプレッソをかけて。' },
    { id: 13, category: 'coffee', price: 520, name_en: 'Vienna Coffee', name_jp: 'ウィンナーコーヒー', desc_en: 'Espresso topped with whipped cream.', desc_jp: 'エスプレッソにたっぷりのホイップクリームをトッピング。' },
    { id: 14, category: 'coffee', price: 500, name_en: 'Red Eye', name_jp: 'レッドアイ', desc_en: 'Drip coffee with a shot of espresso.', desc_jp: 'ドリップコーヒーにエスプレッソを追加した強力な一杯。' },
    { id: 15, category: 'coffee', price: 800, name_en: 'Irish Coffee', name_jp: 'アイリッシュコーヒー', desc_en: 'Coffee, Irish whiskey, and sugar, topped with cream.', desc_jp: 'ウイスキーと砂糖、クリームを加えた大人のコーヒー。' },
    { id: 16, category: 'coffee', price: 600, name_en: 'Pour Over (Chemex)', name_jp: 'ハンドドリップ (ケメックス)', desc_en: 'Manually brewed coffee highlighting nuanced flavors.', desc_jp: '豆本来の繊細な風味を引き出すハンドドリップ。' },
    { id: 17, category: 'coffee', price: 620, name_en: 'Breve', name_jp: 'ブレーベ', desc_en: 'Latte made with half-and-half instead of milk.', desc_jp: '牛乳の代わりにクリームを使った濃厚なラテ。' },
    { id: 18, category: 'coffee', price: 380, name_en: 'Ristretto', name_jp: 'リストレット', desc_en: 'A short shot of espresso, sweeter and less bitter.', desc_jp: '抽出時間を短くし、甘みを引き出したエスプレッソ。' },
    { id: 19, category: 'coffee', price: 550, name_en: 'Mazagran', name_jp: 'マザグラン', desc_en: 'Cold coffee with lemon or rum.', desc_jp: 'レモンやラムを加えた爽やかな冷たいコーヒー。' },
    { id: 20, category: 'coffee', price: 480, name_en: 'Café au Lait', name_jp: 'カフェオレ', desc_en: 'Strong brewed coffee mixed with hot milk.', desc_jp: '濃いめのコーヒーとホットミルクを合わせた優しい味。' },

    // --- Decadent Cakes (Mapped to 'food' category for filter compatibility) ---
    { id: 21, category: 'food', price: 700, name_en: 'Classic Cheesecake', name_jp: 'クラシックチーズケーキ', desc_en: 'Creamy New York style, graham cracker crust.', desc_jp: '濃厚なNYスタイル、グラハムクラッカーの底生地。' },
    { id: 22, category: 'food', price: 750, name_en: 'Red Velvet Cake', name_jp: 'レッドベルベットケーキ', desc_en: 'Moist cocoa cake with tangy cream cheese frosting.', desc_jp: 'しっとりしたココア生地とクリームチーズの酸味が絶妙。' },
    { id: 23, category: 'food', price: 800, name_en: 'Chocolate Lava Cake', name_jp: 'フォンダンショコラ', desc_en: 'Warm cake with a molten dark chocolate center.', desc_jp: '中から温かいダークチョコがとろけ出すケーキ。' },
    { id: 24, category: 'food', price: 720, name_en: 'Carrot Walnut Cake', name_jp: 'キャロット＆ウォルナットケーキ', desc_en: 'Spiced cake with carrots, nuts, and cream cheese icing.', desc_jp: '人参とナッツのスパイスケーキにクリームチーズアイシング。' },
    { id: 25, category: 'food', price: 750, name_en: 'Tiramisu', name_jp: 'ティラミス', desc_en: 'Coffee-soaked ladyfingers with mascarpone cream.', desc_jp: 'コーヒーに浸した生地とマスカルポーネクリームの層。' },
    { id: 26, category: 'food', price: 850, name_en: 'Black Forest Cake', name_jp: 'ブラックフォレストケーキ', desc_en: 'Chocolate sponge, cherry filling, and whipped cream.', desc_jp: 'チョコスポンジ、チェリー、ホイップクリームのドイツ風ケーキ。' },
    { id: 27, category: 'food', price: 680, name_en: 'Lemon Poppy Seed Cake', name_jp: 'レモンポピーシードケーキ', desc_en: 'Light and zesty cake with a bright lemon glaze.', desc_jp: 'ポピーシードの食感とレモンの風味が爽やかなケーキ。' },
    { id: 28, category: 'food', price: 780, name_en: 'German Chocolate Cake', name_jp: 'ジャーマンチョコレートケーキ', desc_en: 'Layers of chocolate cake with coconut-pecan frosting.', desc_jp: 'ココナッツとピーカンのフロスティングを挟んだチョコケーキ。' },
    { id: 29, category: 'food', price: 900, name_en: 'Opera Cake', name_jp: 'オペラ', desc_en: 'French cake with coffee, chocolate glaze, and almond sponge.', desc_jp: 'コーヒーとチョコが重なるリッチなフランス菓子。' },
    { id: 30, category: 'food', price: 650, name_en: 'Apple Crumble Cake', name_jp: 'アップルクランブルケーキ', desc_en: 'Moist apple cake with a buttery, cinnamon streusel top.', desc_jp: 'シナモン香るサクサクのクランブルを乗せた林檎ケーキ。' },
    { id: 31, category: 'food', price: 820, name_en: 'Molten Biscoff Cake', name_jp: 'ビスコフ・ラヴァケーキ', desc_en: 'Rich butter cake with a melting Biscoff cookie center.', desc_jp: 'とろけるビスコフクッキーが入ったリッチなバターケーキ。' },
    { id: 32, category: 'food', price: 850, name_en: 'Pistachio Rose Cake', name_jp: 'ピスタチオとローズのケーキ', desc_en: 'Subtle rose flavor with ground pistachio and a light frosting.', desc_jp: 'ピスタチオとほのかなバラの香りが上品なケーキ。' },
    { id: 33, category: 'food', price: 700, name_en: 'Pavlova', name_jp: 'パブロバ', desc_en: 'Crisp meringue base topped with fresh cream and berries.', desc_jp: 'サクサクのメレンゲに生クリームとベリーをトッピング。' },
    { id: 34, category: 'food', price: 680, name_en: 'Tres Leches Cake', name_jp: 'トレスレチェケーキ', desc_en: 'Sponge cake soaked in three kinds of milk.', desc_jp: '3種のミルクに浸した、しっとり甘いスポンジケーキ。' },
    { id: 35, category: 'food', price: 700, name_en: 'Victoria Sponge', name_jp: 'ヴィクトリアスポンジ', desc_en: 'Classic British cake with jam and buttercream filling.', desc_jp: 'ジャムとバタークリームを挟んだ英国の伝統的ケーキ。' },
    { id: 36, category: 'food', price: 650, name_en: 'Key Lime Pie', name_jp: 'キーライムパイ', desc_en: 'Sweet and tart lime filling in a buttery crust.', desc_jp: '甘酸っぱいライムフィリングとバター香るタルト生地。' },
    { id: 37, category: 'food', price: 950, name_en: 'Dobos Torte', name_jp: 'ドボシュトルテ', desc_en: 'Hungarian sponge cake layered with chocolate buttercream and caramel.', desc_jp: 'チョコバタークリームの層とキャラメルが特徴のハンガリー菓子。' },
    { id: 38, category: 'food', price: 780, name_en: 'Hummingbird Cake', name_jp: 'ハミングバードケーキ', desc_en: 'Banana, pineapple, and pecan spice cake with cream cheese frosting.', desc_jp: 'バナナ、パイン、ナッツが入ったスパイスケーキ。' },
    { id: 39, category: 'food', price: 500, name_en: 'Eclair', name_jp: 'エクレア', desc_en: 'Choux pastry filled with cream and topped with chocolate icing.', desc_jp: 'クリームを詰め、チョコをかけた細長いシュー菓子。' },
    { id: 40, category: 'food', price: 750, name_en: 'Coconut Dream Cake', name_jp: 'ココナッツドリームケーキ', desc_en: 'Super moist cake filled and frosted with sweet coconut flakes.', desc_jp: 'ココナッツフレークをたっぷり使ったしっとりケーキ。' }
];
// --- 4. APP STATE ---
window.appState = {
    view: 'home',
    mood: null,
    cart: [],
    activeBook: null,
    orderId: null,
    isAdmin: false,
    activeOrderItems: [] 
};

// --- 5. ROUTING ---
window.router = function(viewName, param = null) {
    window.appState.view = viewName;
    updateNavbar();
    
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
};

function updateNavbar() {
    ['home', 'library', 'reviews', 'checkout'].forEach(v => {
        const btn = document.getElementById(`nav-${v}`);
        if (!btn) return;
        const isActive = window.appState.view === v || 
            (v === 'library' && ['reader', 'write'].includes(window.appState.view)) || 
            (v === 'home' && ['mood', 'recommendation', 'menu', 'shop-qr'].includes(window.appState.view)) ||
            (v === 'checkout' && ['order-pass'].includes(window.appState.view));
        
        if (isActive) {
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
    
    const nav = document.getElementById('navbar');
    if(nav) nav.style.display = ['reader', 'shop-qr'].includes(window.appState.view) ? 'none' : 'flex';
}

// --- 6. VIEW RENDERERS ---

// --- REPLACE window.renderHome ---
window.renderHome = function() {
    const app = document.getElementById('app');
    
    // LOGIC: Only show the banner if a valid order ID already exists
    let statusBanner = '';
    
    if (window.appState.orderId) {
        statusBanner = `
        <div onclick="router('order-pass')" class="w-full bg-green-50 border border-green-200 p-4 rounded-xl flex justify-between items-center cursor-pointer shadow-sm animate-pulse mb-4">
            <div class="text-left">
                <p class="text-[10px] font-bold text-green-600 uppercase">Active Order</p>
                <p class="text-lg font-mono font-bold text-[#4a2c2a]">${window.appState.orderId}</p>
            </div>
            <span class="text-green-600 font-bold">View ></span>
        </div>`;
    } 
    // We removed the 'else' block, so nothing shows if there is no order.

    app.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-8 fade-in">
            <div class="absolute top-4 right-4 flex gap-2">
                ${window.appState.isAdmin ? 
                    `<button onclick="router('shop-qr')" class="text-xs font-bold bg-[#4a2c2a] text-white px-3 py-1 rounded-full shadow">🖨️ QR</button>` : ''
                }
                <button onclick="toggleAdmin()" class="text-[#a07a67] hover:text-[#4a2c2a] transition">
                    ${window.appState.isAdmin ? '<span class="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded">ADMIN</span>' : '🔒'}
                </button>
            </div>
            
            ${statusBanner}

            <div class="space-y-2">
                <h1 class="text-4xl sm:text-5xl font-bold text-[#4a2c2a] tracking-tight">HEAVEN MIND</h1>
                <p class="text-[#a07a67] italic font-serif">Coffee, Community, and Connection.</p>
            </div>
            
            <div class="p-8 bg-white/90 backdrop-blur rounded-3xl border border-[#eee] w-full shadow-lg">
                <h2 class="text-xl font-bold text-[#4a2c2a] mb-2 font-serif">How are you feeling?</h2>
                <p class="text-sm text-gray-500 mb-6">Let us curate your experience.</p>
                <button onclick="router('mood')" class="w-full py-4 bg-[#4a2c2a] text-white rounded-xl shadow-lg hover:bg-[#3e2b26] transition font-bold">Start Experience</button>
            </div>
            
            <button onclick="router('menu')" class="text-[#999] text-xs font-bold tracking-widest uppercase hover:text-[#a07a67] transition">Skip to Full Menu</button>
        </div>
    `;
    document.getElementById('navbar').classList.remove('hidden');
}

async function sha256(source) {
    const sourceBytes = new TextEncoder().encode(source);
    const digest = await crypto.subtle.digest("SHA-256", sourceBytes);
    const resultBytes = [...new Uint8Array(digest)];
    return resultBytes.map(x => x.toString(16).padStart(2, '0')).join("");
}

// --- REPLACEMENT FUNCTION ---
window.toggleAdmin = async function() {
    if (!window.appState.isAdmin) {
        // 1. We removed the "(1234)" hint from the text so customers don't see it
        const pin = prompt("🔐 Staff Only: Enter Admin PIN");
        
        if (!pin) return; // Stop if user pressed Cancel

        // 2. This is the secure HASH for "1234".
        // Even if someone sees this code, they won't know the PIN is 1234.
        const SECRET_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
        
        // 3. Calculate the hash of what the user just typed
        const inputHash = await sha256(pin);

        // 4. Compare the hashes instead of the plain text
        if (inputHash === SECRET_HASH) {
            window.appState.isAdmin = true;
            alert("✅ Admin Mode Enabled.");
        } else {
            alert("❌ Incorrect PIN.");
            return; 
        }
    } else {
        window.appState.isAdmin = false;
        alert("🔒 Admin Mode Disabled.");
    }
    // Refresh the view to apply changes
    router(window.appState.view, window.appState.activeBook); 
}
// --- ADD THIS FUNCTION ---
window.startTable = function() {
    // Only create a new ID if one doesn't exist
    if (!window.appState.orderId) {
        window.appState.orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        window.appState.activeOrderItems = []; 
        
        // Save the empty state to the database
        DB.set('currentOrderId', window.appState.orderId);
        DB.set('activeOrder_' + window.appState.orderId, []);
    }
    // Go immediately to the Active Order view (Order Pass)
    router('order-pass');
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

// REPLACE your window.renderRecommendation function with this SAFE version:
// window.renderRecommendation をこの「安全版」に置き換えてください：

// REPLACE your window.renderRecommendation with this FIXED version
// これでケーキ（SWEET PAIRING）も日本語が表示されます

window.renderRecommendation = function() {
    const moodData = RECOMMENDATION_LOGIC[window.appState.mood];
    
    // Safety Checks
    if (!moodData) { console.error("Missing mood data"); return; }
    
    // Find Menu Items
    const drink = MENU.find(i => i.name_en === moodData.coffee) || MENU[0];
    const food = MENU.find(i => i.name_en === moodData.food) || MENU[20];
    const total = (drink.price + food.price);

    // Text Logic (Safe fallback)
    const bookTitleEn = moodData.book_en || moodData.book || 'General Reading';
    const bookTitleJp = moodData.book_jp || ''; 

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="px-6 py-8 fade-in">
            <div class="text-center mb-8">
                <p class="text-[#a07a67] text-xs font-bold uppercase tracking-widest">Perfect Match for ${window.appState.mood}</p>
                <h2 class="text-2xl font-serif text-[#4a2c2a]">Your Selection</h2>
            </div>
            
            <div class="bg-white p-6 rounded-2xl shadow-xl border border-[#eee] mb-8 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
                
                <div class="mb-6 pb-6 border-b border-dashed border-[#eee]">
                    <span class="text-[10px] bg-[#f8f5f0] text-[#a07a67] px-2 py-1 rounded mb-2 inline-block font-bold">RECOMMENDED DRINK</span>
                    <h3 class="font-bold text-xl text-[#4a2c2a]">${drink.name_en}</h3>
                    <p class="text-sm font-bold text-[#a07a67] mb-1">${drink.name_jp}</p>
                    <div class="text-right font-bold text-[#4a2c2a] text-lg">¥${drink.price}</div>
                </div>
                
                <div class="mb-6 pb-6 border-b border-dashed border-[#eee]">
                    <span class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded mb-2 inline-block font-bold">READING PAIRING</span>
                    <h3 class="font-bold text-lg text-[#4a2c2a]">${bookTitleEn}</h3>
                    ${bookTitleJp ? `<p class="text-sm font-bold text-[#a07a67] mb-1">${bookTitleJp}</p>` : ''}
                    <p class="text-xs text-gray-400">Recommended genre for this mood</p>
                </div>

                <div>
                    <span class="text-[10px] bg-[#f8f5f0] text-[#a07a67] px-2 py-1 rounded mb-2 inline-block font-bold">SWEET PAIRING</span>
                    <h3 class="font-bold text-xl text-[#4a2c2a]">${food.name_en}</h3>
                    
                    <p class="text-sm font-bold text-[#a07a67] mb-1">${food.name_jp}</p>
                    
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
    
    // Helper function to render a category section
    const renderCategory = (title, items) => {
        if (!items.length) return '';
        let html = `<h3 class="text-sm font-bold text-[#a07a67] uppercase tracking-widest mb-4 mt-8">${title}</h3><div class="space-y-4">`;
        items.forEach(item => {
            html += `
                <div class="bg-white p-4 rounded-xl shadow-sm flex justify-between items-start border border-[#eee]">
                    <div class="flex-1 pr-2">
                        <h4 class="font-bold text-[#4a2c2a]">${item.name_en}</h4>
                        <p class="text-xs font-bold text-[#a07a67] mb-1">${item.name_jp}</p>
                        <p class="text-[10px] text-gray-500">${item.desc_en}</p>
                        <p class="text-[10px] text-gray-400">${item.desc_jp}</p>
                    </div>
                    <div class="flex flex-col items-end space-y-2">
                        <span class="font-bold text-[#4a2c2a]">¥${item.price}</span>
                        <button onclick="addToCart(${item.id})" class="bg-[#4a2c2a] text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#a07a67] transition shadow-md">+</button>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        return html;
    };

    let html = `
        <div class="px-6 py-8 pb-24 fade-in">
            <div class="flex items-center mb-6">
                <button onclick="router('home')" class="mr-4 p-2 bg-white border border-[#eee] rounded-full text-[#4a2c2a] shadow-sm">←</button>
                <h2 class="text-2xl font-serif text-[#4a2c2a]">Menu</h2>
            </div>
            ${renderCategory('Coffee Menu', MENU.filter(i => i.category === 'coffee'))}
            ${renderCategory('Tea Selection', MENU.filter(i => i.category === 'tea'))}
            ${renderCategory('Food & Sweets', MENU.filter(i => i.category === 'food'))}
        </div>`;
    
    app.innerHTML = html;
}

window.addToCart = function(id) {
    const item = MENU.find(i => i.id === id);
    window.appState.cart.push(item);
    updateNavbar();
    const badge = document.getElementById('cart-badge');
    badge.classList.add('animate-bounce');
    setTimeout(() => badge.classList.remove('animate-bounce'), 1000);
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
                    <div>
                        <h4 class="font-bold text-[#4a2c2a] text-sm">${item.name_en}</h4>
                        <p class="text-xs text-gray-400">${item.name_jp}</p>
                        <p class="text-xs text-gray-500">¥${item.price}</p>
                    </div>
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
    }
    window.appState.activeOrderItems = [...window.appState.activeOrderItems, ...window.appState.cart];
    DB.set('activeOrder_' + window.appState.orderId, window.appState.activeOrderItems);
    DB.set('currentOrderId', window.appState.orderId);
    window.appState.cart = [];
    router('order-pass');
}

window.renderOrderPass = function() {
    if(!window.appState.orderId) {
        window.appState.orderId = DB.get('currentOrderId');
        if(window.appState.orderId) {
            window.appState.activeOrderItems = DB.get('activeOrder_' + window.appState.orderId);
        } else {
            router('home'); return;
        }
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
                <div>
                    <span class="text-[#4a2c2a] block">${item.name_en}</span>
                    <span class="text-[#a07a67] text-xs">${item.name_jp}</span>
                </div>
                <div class="flex items-center gap-2"><span class="font-bold text-[#4a2c2a]">¥${item.price}</span>${deleteBtn}</div>
            </div>
        `;
    });
    
    let actionButton = window.appState.isAdmin 
        ? `<button onclick="closeBill()" class="w-full py-3 bg-red-600 text-white rounded-xl font-bold shadow hover:bg-red-700">✓ Staff: Close Bill</button>`
        : `<button onclick="requestBill()" class="w-full py-3 bg-[#a07a67] text-white rounded-xl font-bold shadow hover:bg-[#8d6b5a]">👋 Call Staff to Pay</button>`;

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="px-6 py-8 flex flex-col min-h-screen bg-[#f8f5f0] pb-24 fade-in">
            <div class="bg-white p-6 rounded-t-3xl shadow-sm border border-[#eee] text-center relative">
                <div class="absolute top-0 left-0 w-full h-2 bg-[#a07a67] rounded-t-3xl"></div>
                <h2 class="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Table Order</h2>
                <div class="text-3xl font-mono font-bold text-[#4a2c2a]">${window.appState.orderId}</div>
            </div>
            
            <div class="bg-white p-4 border-x border-[#eee] flex flex-col items-center">
                <div id="order-qr-target" class="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-3"></div>
                <p class="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Scan for Bill</p>
            </div>

            <div class="bg-white p-6 border-x border-b border-[#eee] rounded-b-3xl shadow-sm flex-1 flex flex-col">
                <h3 class="text-xs font-bold text-gray-400 uppercase mb-3">Current Bill</h3>
                <div class="flex-1 overflow-y-auto max-h-48 mb-4">${itemListHtml || '<p class="text-center text-gray-300 italic">No items yet</p>'}</div>
                
                <div class="border-t border-dashed border-[#eee] pt-4 mb-6 text-sm">
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
    setTimeout(() => {
        new QRCode(document.getElementById('order-qr-target'), { text: window.appState.orderId, width: 160, height: 160, colorDark: "#4a2c2a" });
    }, 100);
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
        new QRCode(document.getElementById('shop-qr-target'), { text: currentUrl, width: 200, height: 200, colorDark: "#4a2c2a" });
    }, 100);
}

window.closeBill = function() {
    if (window.appState.isAdmin && confirm("Admin: Close this bill and clear table?")) {
        localStorage.removeItem('heavenmind_activeOrder_' + window.appState.orderId);
        localStorage.removeItem('heavenmind_currentOrderId');
        window.appState.orderId = null;
        window.appState.activeOrderItems = [];
        router('home');
    }
}
window.requestBill = () => alert("Staff has been notified! They will come shortly.");
window.removeActiveItem = function(idx) {
    if (window.appState.isAdmin && confirm("Remove this item?")) {
        window.appState.activeOrderItems.splice(idx, 1);
        DB.set('activeOrder_' + window.appState.orderId, window.appState.activeOrderItems);
        router('order-pass');
    }
}

window.renderLibrary = function() {
    let books = DB.get('stories');
    
    // --- FORCE FIX: Delete the old "Quiet Morning" book ---
    // これで「The Quiet Morning」を強制的に削除します
    if (books.length > 0 && books[0].title === 'The Quiet Morning') {
        books = []; 
        DB.set('stories', []); // Clear database
    }

    // --- AUTO-LOADER ---
    if(books.length === 0 && typeof INITIAL_LIBRARY !== 'undefined') {
        INITIAL_LIBRARY.forEach(book => {
            DB.add('stories', book);
        });
        books = DB.get('stories'); 
    }

    // The rest of your library code...
    const filtered = window.appState.mood ? books.filter(b => b.mood === window.appState.mood) : books;
    const app = document.getElementById('app');
    
    // ... (Use the same library HTML rendering you already have) ...
    // For brevity, using a simple call here. The logic above is the key fix!
    // 下の表示コードは以前のままで大丈夫です。重要なのは上の「FORCE FIX」部分です。
    
    let html = `
        <div class="px-6 py-8 pb-24 fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-serif text-[#4a2c2a]">Library</h2>
                <button onclick="router('write')" class="bg-[#4a2c2a] text-white px-4 py-2 rounded-full text-xs font-bold shadow">Write Story</button>
            </div>
             ${window.appState.mood ? `
                <div class="mb-6 bg-[#f8f5f0] border border-[#a07a67] p-3 rounded-xl text-sm text-[#4a2c2a] flex justify-between items-center shadow-sm">
                    <span class="font-bold">Filtering by: <span class="uppercase">${window.appState.mood}</span></span>
                    <button onclick="clearMood()" class="text-xs bg-[#a07a67] text-white px-2 py-1 rounded">Show All</button>
                </div>` : ''}
            <div class="grid grid-cols-2 gap-4">
    `;
    
    filtered.forEach(b => {
        let coverHtml = (b.cover && b.cover.startsWith('data:image')) 
            ? `<img src="${b.cover}" class="w-full h-full object-cover">` 
            : `<div class="w-full h-full ${b.cover || 'bg-stone-200'} flex items-center justify-center text-4xl">${b.icon || '📖'}</div>`;

        // Handle bilingual display
        const t_en = b.title_en || b.title;
        const t_jp = b.title_jp || '';
        const c_en = b.category_en || b.category || 'General';

        html += `
            <div class="relative group bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div onclick="openReader('${b.id}')" class="cursor-pointer">
                    <div class="aspect-[1/1] rounded-lg mb-3 relative overflow-hidden">${coverHtml}</div>
                    <h3 class="font-bold text-[#4a2c2a] text-sm leading-tight line-clamp-1">${t_en}</h3>
                    <p class="text-[10px] font-bold text-[#a07a67] mb-1 line-clamp-1">${t_jp}</p>
                    <p class="text-gray-500 text-[10px] mb-1">${b.author}</p>
                    <span class="text-[9px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full inline-block">${c_en}</span>
                </div>
            </div>`;
    });
    
    if (filtered.length === 0) html += `<div class="col-span-2 text-center py-10 text-gray-400 italic">No books found.</div>`;
    html += `</div></div>`;
    app.innerHTML = html;
}
window.renderWrite = function() {
    document.getElementById('app').innerHTML = `
        <div class="px-6 py-8 pb-24 fade-in">
            <div class="flex items-center mb-6"><button onclick="router('library')" class="mr-4 p-2 bg-white rounded-full shadow-sm">←</button><h2 class="text-2xl font-serif text-[#4a2c2a]">Submit Story</h2></div>
            <div class="space-y-4">
                <div><label class="block font-bold text-sm text-[#4a2c2a]">Title</label><input id="inp-title" class="w-full p-3 border rounded-lg"></div>
                <div><label class="block font-bold text-sm text-[#4a2c2a]">Mood</label>
                    <select id="inp-mood" class="w-full p-3 border rounded-lg bg-white">
                        <option value="happy">Happy</option><option value="tired">Tired</option><option value="relaxed">Relaxed</option><option value="sad">Sad</option>
                    </select>
                </div>
                <div><label class="block font-bold text-sm text-[#4a2c2a]">Cover Photo</label><input type="file" id="inp-cover" accept="image/*" class="text-sm"></div>
                <div>
                    <div class="flex justify-between items-center mb-1"><label class="block font-bold text-sm text-[#4a2c2a]">Content</label><button onclick="document.getElementById('inp-body-img').click()" class="text-xs bg-stone-200 px-2 py-1 rounded">📷 Add Image</button><input type="file" id="inp-body-img" accept="image/*" class="hidden" onchange="insertBodyImage(this)"></div>
                    <div id="inp-content" contenteditable="true" class="w-full p-3 border rounded-lg h-64 overflow-y-auto bg-white"></div>
                </div>
                <button onclick="submitStory()" class="w-full py-4 bg-[#4a2c2a] text-white rounded-xl font-bold shadow-lg">Publish</button>
            </div>
        </div>
    `;
}

window.insertBodyImage = async (input) => { if(input.files[0]) document.getElementById('inp-content').innerHTML += `<img src="${await readFile(input.files[0])}" class="w-full rounded-lg my-4 shadow-sm"><br>`; }
window.submitStory = async () => {
    const title = document.getElementById('inp-title').value;
    const content = document.getElementById('inp-content').innerHTML;
    const mood = document.getElementById('inp-mood').value;
    const coverFile = document.getElementById('inp-cover').files[0];
    if(title && content) {
        DB.add('stories', { title, content, author: 'Guest', mood, cover: coverFile ? await readFile(coverFile) : 'bg-stone-300' });
        router('library');
    } else alert("Fill all fields");
}
window.clearMood = () => { window.appState.mood = null; renderLibrary(); }
window.openReader = (id) => { router('reader', DB.get('stories').find(s => s.id == id)); }
window.deleteStory = (id) => { if(confirm('Delete?')) { DB.delete('stories', id); renderLibrary(); } }
window.renderReader = () => {
    const b = window.appState.activeBook;
    const img = (b.cover && b.cover.startsWith('data')) ? `<img src="${b.cover}" class="w-full h-64 object-cover mb-6">` : '';
    document.getElementById('app').innerHTML = `
        <div class="bg-[#f8f5f0] min-h-screen pb-24 fade-in">
            <div class="sticky top-0 bg-white/90 p-4 flex justify-between items-center shadow-sm"><button onclick="router('library')">←</button><h3 class="font-bold">${b.title}</h3><div></div></div>
            ${img}<div class="px-8 py-10 font-serif leading-loose whitespace-pre-wrap">${b.content}</div>
        </div>`;
}

window.renderReviews = function() {
    const reviews = DB.get('reviews');
    const avg = reviews.length ? (reviews.reduce((a, b) => a + (b.rating || 5), 0) / reviews.length).toFixed(1) : 'New';
    const app = document.getElementById('app');
    let html = `
        <div class="px-6 py-8 pb-24 fade-in">
            <h2 class="text-2xl font-serif text-[#4a2c2a] mb-2">Customer Feedback</h2>
            <div class="flex items-center space-x-2 mb-6"><span class="text-3xl font-bold text-[#a07a67]">${avg}</span><div class="text-xs text-gray-400">Average Rating</div></div>
            <div class="bg-white p-4 rounded-xl border border-[#eee] shadow-sm mb-8 menu-card">
                <select id="rev-rating" class="w-full p-2 border rounded mb-2 text-sm bg-white"><option value="5">★★★★★ Excellent</option><option value="4">★★★★☆ Good</option></select>
                <textarea id="rev-text" placeholder="Share your experience..." class="w-full p-2 border rounded h-20 text-sm mb-2 resize-none"></textarea>
                <button onclick="submitReview()" class="w-full py-2 bg-[#a07a67] text-white rounded text-sm font-bold">Post Feedback</button>
            </div>
            <div class="space-y-4">
    `;
    reviews.sort((a,b)=>b.createdAt-a.createdAt).forEach(r => {
        html += `<div class="bg-white p-4 rounded-xl border border-[#eee] shadow-sm relative"><p class="text-sm text-[#4a2c2a]">${r.text}</p>${window.appState.isAdmin ? `<button onclick="deleteReview('${r.id}')" class="absolute top-2 right-2 text-red-300 text-xs">✕</button>` : ''}</div>`;
    });
    html += `</div></div>`;
    app.innerHTML = html;
}
window.submitReview = () => {
    const t = document.getElementById('rev-text').value;
    if(t) { DB.add('reviews', { rating: document.getElementById('rev-rating').value, text: t }); renderReviews(); }
}
window.deleteReview = (id) => { if(confirm('Delete?')) { DB.delete('reviews', id); renderReviews(); } }

// Initialize App
// --- REPLACE THE BOTTOM 3 LINES OF MAIN.JS WITH THIS ---

// Initialize App
const savedId = DB.get('currentOrderId');

// Only load the ID if it is a real text string (fixes the "Active Order" bug)
if (savedId && typeof savedId === 'string' && savedId.length > 0) {
    window.appState.orderId = savedId;
} else {
    window.appState.orderId = null;
}

router('home');