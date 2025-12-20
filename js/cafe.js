   // --- STATE MANAGEMENT ---
        let currentLang = 'en'; // 'en' or 'jp'

        // --- FUNCTIONS ---

        function showPage(pageId) {
            document.querySelectorAll('section').forEach(sec => {
                sec.classList.remove('active');
                if(sec.id === 'home') sec.classList.add('hidden');
            });
            const selected = document.getElementById(pageId);
            selected.classList.add('active');
            if(pageId === 'home') selected.classList.remove('hidden');

            document.querySelectorAll('.nav-item').forEach(link => link.classList.remove('active'));
            const activeLink = Array.from(document.querySelectorAll('.nav-item')).find(l => l.getAttribute('onclick').includes(pageId));
            if(activeLink) activeLink.classList.add('active');
        }

        function setLang(lang) {
            currentLang = lang;
            document.querySelectorAll('.lang-opt').forEach(opt => opt.classList.remove('active'));
            document.querySelector(`.lang-opt[onclick="setLang('${lang}')"]`).classList.add('active');
            
            // This selects all elements with data-en attributes
            document.querySelectorAll('[data-en]').forEach(el => {
                // If the element has children (like the h3 having a span), we might want to target the span specifically if we organized it that way.
                // However, our logic puts data-en ON the span itself for menu items.
                // For headers like <h2>Title</h2>, we put data-en on the h2.
                // This generic function works for both as long as the text to replace is the innerText.
                el.innerText = el.getAttribute(`data-${lang}`);
            });
        }