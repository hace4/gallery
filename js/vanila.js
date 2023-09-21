class Gallery {
    constructor(containerSelector, images) {
        this.container = document.querySelector(containerSelector);
        this.images = images;
        this.currentSlideIndex = 0;
         this.currentPage = 0; // Текущая страница миниатюр
    this.thumbnailsPerPage = 3; // Количество миниатюр на одной странице

        if (this.container) {
            this.init();
        }
    }

    init() {
        this.createSlides();
        this.createThumbnails();
        this.lazyLoadImages();
        this.addEventListeners();
        this.showSlide(this.currentSlideIndex);
    }
    lazyLoadImages() {
        const imagesToLoad = document.querySelectorAll("img[data-src]");
    
        const options = {
            root: null, // viewport
            rootMargin: "0px",
            threshold: 0.1, // процент видимости изображения
        };
    
        const imageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.removeAttribute("data-src");
                    imageObserver.unobserve(image);
                }
            });
        }, options);
    
        imagesToLoad.forEach(function (image) {
            imageObserver.observe(image);
        });
    }
    createSlides() {
        const slidesContainer = document.createElement("div");
        slidesContainer.classList.add("gallery-slides");

        this.images.forEach((image) => {
            const slide = document.createElement("div");
            slide.classList.add("gallery-slide");
            const img = document.createElement("img");
            img.classList.add("d-inline-block", "align-middle");
            img.src = ""; // Оставьте пустой src
            img.alt = image.alt;
            img.dataset.src = image.src; // Добавьте data-src с реальным источником изображения
            slide.appendChild(img);

            slidesContainer.appendChild(slide);
        });

        this.container.appendChild(slidesContainer);
    }

    createThumbnails() {
        const thumbnailsContainer = document.createElement("div");
        thumbnailsContainer.classList.add("gallery-thumbnails","d-flex", "justify-content-center", "align-items-center","overflow-auto","flex-nowrap", "mt-2", "overflow-y-hidden");

        const thumbnailsInner = document.createElement("div");
        thumbnailsInner.classList.add("thumbnails-inner", "d-flex", "justify-content-center", "align-items-end", "mw-100");

        this.images.forEach((image, index) => {
            const thumbnail = document.createElement("div");
            thumbnail.classList.add("thumbnail");

            const img = document.createElement("img");
            img.classList.add("rounded");
            img.src = "";
            img.alt = image.alt;
            thumbnail.classList.add("thumbnail");
            img.src = ""; // Оставьте пустой src
            img.dataset.src = image.src; // Добавьте data-src с реальным источником изображения
            thumbnail.dataset.index = index;
            thumbnail.appendChild(img);
            thumbnailsInner.appendChild(thumbnail);
        });

        thumbnailsContainer.appendChild(thumbnailsInner);
        this.container.appendChild(thumbnailsContainer);
    }
    addEventListeners() {
        const prevBtn = this.container.querySelector(".carousel-control-prev");
        const nextBtn = this.container.querySelector(".carousel-control-next");
        const thumbnails = this.container.querySelectorAll(".thumbnail");
        const slidesContainer = this.container.querySelector(".gallery-slides");
    
        if (prevBtn && nextBtn && thumbnails && slidesContainer) {
            prevBtn.addEventListener("click", () => {
                this.prevSlide();
                this.updateCurrentPage();
            });
            nextBtn.addEventListener("click", () => {
                this.nextSlide();
                this.updateCurrentPage();
            });
    
            thumbnails.forEach((thumbnail, index) => {
                thumbnail.addEventListener("click", () => {
                    this.showSlide(index);
                    this.updateCurrentPage();
                });
            });
    
            slidesContainer.addEventListener("dblclick", () => {
                this.toggleZoom();
                console.log(1);
            });
    
            slidesContainer.addEventListener("wheel", (event) => {
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.handleZoomWithWheel(event.deltaY);
                }
            });
        }
    }
    
    
    toggleZoom() {
        const slidesContainer = this.container.querySelector(".gallery-slides");
        const currentSlide = slidesContainer.querySelectorAll(".gallery-slide img")[this.currentSlideIndex];
        console.log(currentSlide);
    
        if (currentSlide) {
            const currentTransform = window.getComputedStyle(currentSlide).getPropertyValue("transform");
    
            if (currentTransform === "matrix(1, 0, 0, 1, 0, 0)" || currentTransform === "none") {
                // Если изображение не увеличено или нет трансформации, увеличить в 2 раза
                currentSlide.style.transform = "scale(2)";
            }else if (currentTransform === "matrix(2, 0, 0, 2, 0, 0)") {
                currentSlide.style.transform = "scale(4)";
            }else {
                // Если изображение уже увеличено, вернуть к обычному масштабу
                currentSlide.style.transform = "none";
            }
        }
    }
    
    
    resetZoom() {
        const slidesContainer = this.container.querySelector(".gallery-slides");
        const currentSlide = slidesContainer.querySelectorAll(".gallery-slide img")[this.currentSlideIndex];
    
        if (currentSlide) {
            currentSlide.style.transform = "";
        }
    }
    
    
   
    updateCurrentPage() {
        const thumbnails = this.container.querySelectorAll(".thumbnail");
        thumbnails.forEach((thumbnail, index) => {
            if (index === this.currentSlideIndex) {
                thumbnail.classList.add("active");
            } else {
                thumbnail.classList.remove("active");
            }
        });
    }
    showSlide(index) {
        const slides = this.container.querySelectorAll(".gallery-slide");
        const thumbnails = this.container.querySelectorAll(".thumbnail");

        slides.forEach((slide) => (slide.style.display = "none"));
        thumbnails.forEach((thumbnail) => thumbnail.classList.remove("active"));
        console.log(index);
        slides[index].style.display = "block";
        thumbnails[index].classList.add("active");

        this.currentSlideIndex = index;
        this.updateCurrentPage();
    }

  prevSlide() {
        if (this.currentSlideIndex > 0) {
            this.showSlide(this.currentSlideIndex - 1);
            this.resetZoom(); // Добавить вызов увеличения после смены слайда
        }
    }

    nextSlide() {
        if (this.currentSlideIndex < this.images.length - 1) {
            this.showSlide(this.currentSlideIndex + 1);
            this.resetZoom(); // Добавить вызов увеличения после смены слайда
        }
    }


    
}

const images = [
    { src: "images/page1.jpg", alt: "Image 1" },
    { src: "images/page2.jpg", alt: "Image 2" },
    { src: "images/lol.jpg", alt: "Image 3" },
    // Добавьте другие изображения
];

const gallery = new Gallery(".gallery", images);
