const STRAPI_URL = "https://landingspagina-felicks.onrender.com";
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

const titleEl = document.getElementById("articleTitle");
const imageEl = document.getElementById("articleImage");
const descEl = document.getElementById("articleDescription");
const catButtons = document.getElementById("categoryButtons");

const CATEGORIES = ["Voeding", "Veiligheid", "Training", "Verzorging", "Activiteit"];

function renderCategories(activeCategory) {
    catButtons.innerHTML = "";
    CATEGORIES.forEach(category => {
        const btn = document.createElement("button");
        btn.textContent = category;
        btn.className = "category-button";
        if (category === activeCategory) btn.classList.add("active");
        catButtons.appendChild(btn);
    });
}

async function loadArticle() {
    if (!slug) {
        titleEl.textContent = "Geen artikel gevonden";
        return;
    }

    const url = `${STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`;
    const res = await fetch(url);
    const data = await res.json();

    

    if (!data.data || data.data.length === 0) {
        titleEl.textContent = "Geen artikel gevonden";
        return;
    }

    const articleData = data.data?.[0];
    if (!articleData) {
        titleEl.textContent = "Geen artikel gevonden";
        return;
    }

    


    const article = articleData.attributes;

    titleEl.textContent = article.title;

    let imageUrl = "/images/fallback.jpg";
    let imageAlt = article.title || "Artikel";

    if (Array.isArray(article.image) && article.image.length > 0) {
        const imageData = article.image[0];
        if (imageData?.url) {
            imageUrl = `${STRAPI_URL}${imageData.url}`;
            imageAlt = imageData.alternativeText || imageAlt;
        }
    }

    imageEl.src = imageUrl;
    imageEl.alt = imageAlt;



    descEl.innerHTML = article.description
        .map(block => {
            if (block.type === "paragraph") {
                const content = block.children.map(child => {
                    let text = child.text || "";

                    if (child.bold) text = `<strong>${text}</strong>`;
                    if (child.italic) text = `<em>${text}</em>`;
                    if (child.underline) text = `<u>${text}</u>`;

                    return text;
                }).join("");

                return `<p>${content}</p>`;
            }

            if (block.type === "list") {
                const items = block.children.map(item => {
                    const content = item.children.map(child => {
                        let text = child.text || "";
                        if (child.bold) text = `<strong>${text}</strong>`;
                        if (child.italic) text = `<em>${text}</em>`;
                        if (child.underline) text = `<u>${text}</u>`;
                        return text;
                    }).join("");
                    return `<li>${content}</li>`;
                }).join("");

                return `<ul>${items}</ul>`;
            }

            return "";
        })
        .join("");



    const summaryEl = document.getElementById("articleSummary");
    summaryEl.textContent = article.summary;


    const category = article.category?.data?.attributes?.name;
    if (category) renderCategories(category);
}

document.addEventListener("DOMContentLoaded", loadArticle);
