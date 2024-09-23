const filePath = './siteContent.json';

let data = [];

fetch(filePath)
    .then(Response => Response.json())
    .then(data => {
        data.forEach((e, index) => {
            createMiniCard(index ,e.imageSrc[0], e.Description, e.Title);
        });

        document.querySelectorAll('.mini_card').forEach(card => {
            card.addEventListener('click', () => {
                changeMainContent(card.id);
            });
        });

        this.data = data;
        changeMainContent(0);
});

function createMiniCard(id, imageSrc, cardDescription, cardTitle) {
    let miniCard = `
        <div class="mini_card" id="${id}">
            <div class="image">
                <img src="${imageSrc}" alt="placeholder">
            </div>
            <div class="info">
                <p class="data ubuntu-medium-italic">${cardDescription}</p>
                <h2 class="ubuntu-bold">${cardTitle}</h2>
            </div>
        </div>
    `;
    
    let aside = document.querySelector('aside.browse');
    aside.insertAdjacentHTML('beforeend', miniCard);
};

function changeMainContent(id) {
    console.log(id);
    document.querySelector('.imageCarousel').innerHTML = '';
    this.data[id].imageSrc.forEach((src, index) => {
        document.querySelector('.imageCarousel').insertAdjacentHTML('beforeend',`<img src="${src}" alt="placeholder">`);
    });

    document.querySelectorAll('.imageCarousel img').forEach(img => {
        img.addEventListener('click', (event) => {
            showImage(event.target.src);
        });
    });

    document.querySelector('main .mainBox .title').innerHTML = this.data[id].Title;
    document.querySelector('main .mainBox .description').innerHTML = this.data[id].Description;
    document.querySelector('main .mainBox .content').innerHTML = this.data[id].Content;

    document.querySelector('main').scrollTop = 0;
}

function showImage(src){
    document.querySelector('body').insertAdjacentHTML('beforeend', `
    <div class="blurred">
        <img class="big-image" src="${src}" alt="placeholder">
    </div>`);

    document.querySelector('.blurred').addEventListener('click', () => {
        document.querySelector('.blurred').remove();
    });
}


