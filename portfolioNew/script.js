const filePath = './siteContent.json';

let data = [];
// recommendationUrls = ["https://open.spotify.com/embed/track/5Qv2Nby1xTr9pQyjkrc94J?utm_source=generator", "https://open.spotify.com/embed/track/4mRSbPLnOm54ttkTYvxxSY?utm_source=generator", "https://open.spotify.com/embed/track/2bs56RTPDDT7aCu3t2LGHd?utm_source=generator", "https://open.spotify.com/embed/track/0j5FJJOmmnXPd0XajFWkMF?utm_source=generator", "https://open.spotify.com/embed/track/20ExQDt5c9FkcoyDZzRm4o?utm_source=generator", "https://open.spotify.com/embed/track/376NlA4w5MQytogS2JUVX9?utm_source=generator", "https://open.spotify.com/embed/track/0R3aeCg7ofE3SD89MNySgA?utm_source=generator", "https://open.spotify.com/embed/track/39WRg2JYdZVaBFVS3oBTXo?utm_source=generator" ];

console.log(window.location.pathname);

fetch(filePath)
    .then(Response => Response.json())
    .then(data => {
        this.data = data;

        if(['/portfolioNew/index.html', '/portfolioNew/projects.html', '/projects.html', '/preview/projects.html'].includes(window.location.pathname)){ 
            data.forEach((e, index) => {
                createMiniCard(index ,e.imageSrc[0], e.Description, e.Title);
            });
            document.querySelectorAll('.projects-list .mini_card').forEach(card => {
                card.addEventListener('click', () => {
                    goToProject(card.id);
                });
            });
        };

        
        if(['/portfolioNew/project.html', '/project.html', '/preview/project.html'].includes(window.location.pathname)){
            changeMainContent();
        }
    })

if(['/portfolioNew/index.html', '/portfolioNew/', '/', '/index.html', '/preview/index.html', '/preview/', '/preview'].includes(window.location.pathname)){ 
    document.addEventListener('scroll', function() {
        const behindPic = document.getElementById('behindPic');
        const scrollPosition = window.scrollY;
        behindPic.style.right = `-${scrollPosition}px`;
        behindPic.style.opacity = 1 - (scrollPosition / 1000);
    });

    // let randomIndex = Math.floor(Math.random() * this.recommendationUrls.length);
    // let randomUrl = this.recommendationUrls[randomIndex];
    // document.getElementById('spotify-rec').src = randomUrl;
};



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
    
    let comp = document.querySelector('.projects-list');
    comp.insertAdjacentHTML('beforeend', miniCard);
};

function goToProject(id) {
    window.location.href = './project.html?id=' + id;
};

function changeMainContent() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');

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