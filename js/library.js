  // Note: 'cover' property now uses simplified CSS class names (e.g., bg-yellow) instead of Tailwind specific ones (bg-yellow-50)
        const LIBRARY_DATA = [
            { 
                title_en: 'The Rosie Project', title_jp: 'ロージー・プロジェクト', 
                author: 'Graeme Simsion', category_en: 'Comedy',
                cover: 'bg-yellow', icon: '🤣', 
                content_en: 'A socially awkward genetics professor creates a scientific survey to find the perfect wife.'
            },
            { 
                title_en: 'Atomic Habits', title_jp: 'アトミック・ハビッツ', 
                author: 'James Clear', category_en: 'Self-Help',
                cover: 'bg-orange', icon: '🧘', 
                content_en: 'Tiny changes, remarkable results.'
            },
            { 
                title_en: 'The Midnight Library', title_jp: 'ミッドナイト・ライブラリー', 
                author: 'Matt Haig', category_en: 'Fiction',
                cover: 'bg-blue', icon: '🌃', 
                content_en: 'Between life and death there is a library.'
            },
            { 
                title_en: 'Deep Work', title_jp: 'DEEP WORK', 
                author: 'Cal Newport', category_en: 'Business',
                cover: 'bg-stone', icon: '💼', 
                content_en: 'Rules for focused success in a distracted world.'
            },
            { 
                title_en: 'Into the Wild', title_jp: '荒野へ', 
                author: 'Jon Krakauer', category_en: 'Adventure',
                cover: 'bg-red', icon: '🏔️', 
                content_en: 'The true story of Christopher McCandless.'
            },
            { 
                title_en: 'Braiding Sweetgrass', title_jp: 'スイートグラスを編む', 
                author: 'Robin Wall Kimmerer', category_en: 'Nature',
                cover: 'bg-green', icon: '🌿', 
                content_en: 'Indigenous wisdom, scientific knowledge and the teachings of plants.'
            },
            { 
                title_en: 'Men Without Women', title_jp: '女のいない男たち', 
                author: 'Haruki Murakami', category_en: 'Short Stories',
                cover: 'bg-gray', icon: '📖', 
                content_en: 'A collection of short stories about isolation.'
            },
            { 
                title_en: 'Steal Like an Artist', title_jp: 'クリエイティブの授業', 
                author: 'Austin Kleon', category_en: 'Art',
                cover: 'bg-pink', icon: '🎨', 
                content_en: '10 things nobody told you about being creative.'
            },
            { 
                title_en: 'Pride and Prejudice', title_jp: '高慢と偏見', 
                author: 'Jane Austen', category_en: 'Classic',
                cover: 'bg-amber', icon: '🕰️', 
                content_en: 'It is a truth universally acknowledged...'
            },
            { 
                title_en: 'Cosmos', title_jp: 'コスモス', 
                author: 'Carl Sagan', category_en: 'Science',
                cover: 'bg-teal', icon: '🪐', 
                content_en: 'The story of cosmic evolution, science and civilization.'
            },
            { 
                title_en: 'Meditations', title_jp: '自省録', 
                author: 'Marcus Aurelius', category_en: 'Philosophy',
                cover: 'bg-rose', icon: '🏛️', 
                content_en: 'Private notes to himself and ideas on Stoic philosophy.'
            },
            { 
                title_en: 'The Notebook', title_jp: 'きみに読む物語', 
                author: 'Nicholas Sparks', category_en: 'Romance',
                cover: 'bg-pink', icon: '💌', 
                content_en: 'A timeless love story of Noah and Allie.'
            },
            { 
                title_en: 'World Atlas of Coffee', title_jp: 'コーヒーアトラス', 
                author: 'James Hoffmann', category_en: 'Education',
                cover: 'bg-amber', icon: '☕', 
                content_en: 'The definitive guide to coffee from beans to brewing.'
            },
            { 
                title_en: 'Before the Coffee Gets Cold', title_jp: 'コーヒーが冷めないうちに', 
                author: 'Toshikazu Kawaguchi', category_en: 'Fiction',
                cover: 'bg-indigo', icon: '⏳', 
                content_en: 'In a small cafe in Tokyo, you can travel back in time.'
            },
            { 
                title_en: 'Vagabonding', title_jp: 'ヴァガボンディング', 
                author: 'Rolf Potts', category_en: 'Travel',
                cover: 'bg-sky', icon: '✈️', 
                content_en: 'An uncommon guide to the art of long-term world travel.'
            },
            { 
                title_en: 'Legends & Lattes', title_jp: 'レジェンド＆ラテ', 
                author: 'Travis Baldree', category_en: 'Fantasy',
                cover: 'bg-indigo', icon: '🐉', 
                content_en: 'A novel of high fantasy and low stakes.'
            }
        ];

        const grid = document.getElementById('book-grid');
        
        LIBRARY_DATA.forEach(book => {
            const card = document.createElement('div');
            card.className = "book-card"; // Clean class name
            
            card.innerHTML = `
                <div class="cover-box ${book.cover}">
                    ${book.icon}
                </div>
                <div>
                    <h3 class="book-title-en">${book.title_en}</h3>
                    <p class="book-title-jp">${book.title_jp}</p>
                    
                    <div class="card-meta">
                        <p class="book-author">${book.author}</p>
                        <span class="book-tag">${book.category_en}</span>
                    </div>
                    
                    <p class="book-desc">${book.content_en}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    