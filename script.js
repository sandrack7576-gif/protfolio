document.addEventListener("DOMContentLoaded", () => {

    // 1. Google Sheets Integration Settings
    // This is your specific Google Sheet ID extracted from your link
    const sheetId = '1Yjub4XKpvgscwymTHa3bINf29W24eC67uA6twb2s8eI';
    // The specific Google endpoint to get data as JSON
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=Sheet1`;

    // 2. Fetch the Data and Build the Grid
    async function loadPortfolioData() {
        try {
            const response = await fetch(sheetUrl);
            const text = await response.text();

            // Google returns a weird text format, we extract just the JSON part
            const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonString);

            const rows = data.table.rows;
            console.log(rows);
            const grid = document.getElementById('dynamic-work-grid');

            let htmlContent = '';

            // Loop through each row in your spreadsheet
            // We start at index 1 to skip the header row (assuming row 1 is titles like "Project Name")
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];

                // If the row is empty, skip it
                if (!row.c || !row.c[0] || !row.c[0].v) continue;

                // Extract data based on columns: A=0, B=1, C=2
                const title = row.c[0]?.v || 'Untitled';
                const description = row.c[1]?.v || '';
                const category = row.c[2]?.v || '';
                const imageUrl = row.c[3]?.v || '';
                const projectDescription = row.c[4]?.v || '';
                const gallery = row.c[5]?.v || '';// Put a placeholder image URL here if you want

                // Create staggering animation delays based on the item index
                const delayClass = (i % 3 === 1) ? 'delay-1' : (i % 3 === 2) ? 'delay-2' : '';

                // Build the HTML for this item
                htmlContent += `
<div class="grid-item reveal fade-up ${delayClass}"
     data-gallery="${gallery}"
     data-description="${description}"
     data-title="${title}">

    <div class="image-wrapper">

        <img src="${imageUrl}" alt="${title}" class="project-img">

        <div class="img-overlay">

            <div class="overlay-content">

                

                <p>${description}</p>

                <span class="view-project">
                    View Project
                </span>

            </div>

        </div>

    </div>

    <div class="item-text">
        <h3>${title}</h3>
        <p>${category}</p>
    </div>

</div>
`;
            }

            // Inject the generated HTML into the page
            grid.innerHTML = htmlContent;

            // 3. Initialize Animations AFTER the data is loaded
            initScrollAnimations();

        } catch (error) {
            console.error('Error loading portfolio data:', error);
            document.getElementById('dynamic-work-grid').innerHTML = '<p>Error loading projects. Please try again later.</p>';
        }
    }

    async function loadHeroData() {

        try {

            const heroUrl =
                `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=Hero`;

            const response = await fetch(heroUrl);

            const text = await response.text();

            const jsonString = text.substring(
                text.indexOf('{'),
                text.lastIndexOf('}') + 1
            );

            const data = JSON.parse(jsonString);

            const rows = data.table.rows;

            let heroData = {};

            rows.forEach(row => {

                if (!row.c || !row.c[0] || !row.c[1]) return;

                const key = row.c[0]?.v;
                const value = row.c[1]?.v;

                heroData[key] = value;

            });

            console.log(heroData);

            // Elements
            const heading = document.getElementById('hero-heading');
            const role = document.getElementById('hero-role');
            const description = document.getElementById('hero-description');
            const image = document.getElementById('hero-image');

            // Set heading instantly
            heading.textContent = heroData.Heading || '';

            // Set image
            image.src = heroData.Image || '';

            // Hide description initially
            description.style.opacity = "0";

            // Clear role first
            role.textContent = "";

            // Wait until heading animation finishes
            setTimeout(() => {

                const roles = (heroData.Role || '')
                    .split(',')
                    .map(role => role.trim())
                    .filter(role => role.length > 0);

                let roleIndex = 0;

                function typeRole(text, callback) {

                    role.textContent = '';
                    role.style.borderRight = "1px solid #00d9ff";

                    let index = 0;

                    const typingInterval = setInterval(() => {

                        role.textContent += text.charAt(index);

                        index++;

                        if (index >= text.length) {

                            clearInterval(typingInterval);

                            callback();

                        }

                    }, 40);

                }

                function eraseRole(callback) {

                    let text = role.textContent;

                    const eraseInterval = setInterval(() => {

                        text = text.slice(0, -1);

                        role.textContent = text;

                        if (text.length === 0) {

                            clearInterval(eraseInterval);

                            callback();

                        }

                    }, 25);

                }

                function startLoop() {

                    const currentRole = roles[roleIndex];

                    typeRole(currentRole, () => {

                        // Show description only once
                        if (!description.dataset.loaded) {

                            setTimeout(() => {

                                description.textContent =
                                    heroData.Description || '';

                                description.style.opacity = "1";
                                description.style.transform = "translateY(0)";
                                description.style.transition =
                                    "all 1s ease";

                                description.dataset.loaded = "true";

                            }, 300);
                        }

                        // If only one role exists
                        if (roles.length === 1) {

                            role.style.borderRight = "none";

                            return;

                        }

                        // Wait 3 seconds
                        setTimeout(() => {

                            eraseRole(() => {

                                roleIndex = (roleIndex + 1) % roles.length;

                                startLoop();

                            });

                        }, 3000);

                    });

                }

                startLoop();

            }, 1200);

        } catch (error) {

            console.error('Hero Data Error:', error);

        }
    }

    async function loadContactData() {

    try {

        const contactUrl =
            `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=Contact`;

        const response = await fetch(contactUrl);

        const text = await response.text();

        const jsonString = text.substring(
            text.indexOf('{'),
            text.lastIndexOf('}') + 1
        );

        const data = JSON.parse(jsonString);

        const rows = data.table.rows;

        const container =
            document.getElementById('contact-links');

        let html = '';

        rows.forEach(row => {

            if (!row.c || !row.c[0]) return;

            const name =
                row.c[0]?.v || '';

            const icon =
                row.c[1]?.v || '';

            const value =
                row.c[2]?.v || '';

            const link =
                row.c[3]?.v || '#';

            html += `

                <a href="${link}"
                   target="_blank"
                   class="contact-btn">

                    <i class="lucide lucide-${icon}"></i>

                    <span>${name}</span>

                </a>

            `;

        });

        container.innerHTML = html;

        lucide.createIcons();

    } catch (error) {

        console.error('Contact Data Error:', error);

    }

}

    async function loadAboutData() {

        try {

            const aboutUrl =
                `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=About`;

            const response = await fetch(aboutUrl);

            const text = await response.text();

            const jsonString = text.substring(
                text.indexOf('{'),
                text.lastIndexOf('}') + 1
            );

            const data = JSON.parse(jsonString);

            const rows = data.table.rows;

            let aboutData = {};

            rows.forEach(row => {

                if (!row.c || !row.c[0] || !row.c[1]) return;

                const key = row.c[0].v;
                const value = row.c[1].v;

                aboutData[key] = value;

            });

            // Title + Description
            document.getElementById('about-title').textContent =
                aboutData.AboutTitle || '';

            document.getElementById('about-description').textContent =
                aboutData.AboutDescription || '';

            // Education
            // Education
            const educationList =
                document.getElementById('education-list');

            const educationItems =
                aboutData.Education?.split(',');

            educationItems?.forEach(item => {

                const parts = item.split('|');

                educationList.innerHTML += `
        <li>
            <span>${parts[0]?.trim()}</span>
            ${parts[1]?.trim()}
        </li>
    `;
            });

            for (let i = 1; i <= 5; i++) {

                const education =
                    aboutData[`Education${i}`];

                if (!education) continue;

                const parts = education.split('|');

                educationList.innerHTML += `
                <li>
                    <span>${parts[0]}</span>
                    ${parts[1]}
                </li>
            `;
            }

            // Languages
            createTags(
                aboutData.Language,
                'language-list'
            );

            // Interests
            createTags(
                aboutData.Interests,
                'interest-list'
            );

            // Software
            createTags(
                aboutData.Software,
                'software-list'
            );

        } catch (error) {

            console.error('About Data Error:', error);

        }
    }

    function createTags(data, elementId) {

        if (!data) return;

        const container =
            document.getElementById(elementId);

        const items = data.split(',');

        items.forEach(item => {

            container.innerHTML += `
            <span>${item.trim()}</span>
        `;
        });
    }

    // 4. Animation Logic (Wrapped in a function)
    function initScrollAnimations() {
        const reveals = document.querySelectorAll('.reveal');

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing once it's animated
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        reveals.forEach(reveal => {
            observer.observe(reveal);
        });
    }

    // 5. Advanced Parallax (From previous step)
    const isDesktop = window.innerWidth > 1024;
    if (isDesktop) {
        window.addEventListener('scroll', () => {
            const scrollValue = window.scrollY;
            const parallaxBg = document.querySelector('.parallax-bg');
            const parallaxTexts = document.querySelectorAll('.parallax-text');

            if (parallaxBg) {
                parallaxBg.style.transform = `translateY(${scrollValue * parallaxBg.dataset.speed}px)`;
            }

            parallaxTexts.forEach(text => {
                text.style.transform = `translateY(${scrollValue * text.dataset.speed}px)`;
            });
        });
    }

    const hero = document.querySelector('.hero');

    hero.addEventListener('mousemove', (e) => {

        const x = (window.innerWidth / 2 - e.pageX) / 40;
        const y = (window.innerHeight / 2 - e.pageY) / 40;

        document.querySelector('.blob-bg').style.transform =
            `translate(${x}px, ${y}px)`;

        document.querySelector('.blob-border').style.transform =
            `translate(${x * 1.5}px, ${y * 1.5}px)`;

    });

    const modal = document.getElementById('galleryModal');
    const galleryScroll = document.getElementById('galleryScroll');
    const closeGallery = document.querySelector('.close-gallery');

    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');

    document.addEventListener('click', (e) => {

        const project = e.target.closest('.grid-item');

        if (!project) return;

        const gallery = project.dataset.gallery;

        if (!gallery) return;

        modalTitle.textContent =
            project.dataset.title;

        modalDescription.textContent =
            project.dataset.description;

        galleryScroll.innerHTML = '';

        const images = gallery.split(',');

        images.forEach(img => {

            galleryScroll.innerHTML += `
            <img src="${img.trim()}">
        `;

        });

        modal.classList.add('active');

        document.body.style.overflow = 'hidden';

    });

    closeGallery.addEventListener('click', () => {

        modal.classList.remove('active');

        document.body.style.overflow = 'auto';

    });




    // --- START EVERYTHING ---
    // Start fetching data immediately when the page loads
    loadAboutData();
    loadPortfolioData();
    loadHeroData();
    loadContactData();
});