class Gallery {
    constructor(containerSelector, images) {
        this.container = document.querySelector(containerSelector);
        this.images = images;
        this.Thumbs = Thumbs;
        this.currentSlideIndex = 0;
        this.thumbnailsPerPage = 3;
        this.currentPage = 0;
        this.thumbnailNavigationLimit = 3; // Set the limit for automatic thumbnail navigation
        this.zoomLevel = 0;
        this.zoomScales = [1, 2, 4];
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragLastX = 0;
        this.dragLastY = 0;
        this.currentTranslateX = 0;
        this.currentTranslateY = 0;
        this.minZoomLevel = 0;
        this.showThumbnailsFlag = 1;
        this.maxZoomLevel = this.zoomScales.length - 1;
        this.leftHalf = document.getElementById("leftHalf");
        this.rightHalf = document.getElementById("rightHalf");
        this.imageContainer = null;
        this.spread = true;

        if (this.container) {
            this.init();
        }
    }

    init() {
        this.createGalleryElements();
        this.addEventListeners();
        this.showSlide(this.currentSlideIndex);
        this.showThumbnailPage(this.currentPage); // Add this line
    }
    

    createGalleryElements() {
        this.createSlides();
        this.createThumbnails();
        this.lazyLoadImages();
    }
    showPageSpread(){
        const slides = this.container.querySelectorAll(".gallery-slide");
        slides[this.currentSlideIndex + 1].style.display = "block";
        slides[this.currentSlideIndex + 1].style.marginLeft = "1px";
        slides.style = "width: 50%";
    }
    hidePageSpread(){
        const slides = this.container.querySelectorAll(".gallery-slide");
        slides[this.currentSlideIndex + 1].style.display = "none";
        if (slides[this.currentSlideIndex + 1].style.marginLef){
            slides[this.currentSlideIndex + 1].style.marginLeft= "";
            slides.style.width = "";
        }

    }
    spreadToogle(){
        switch (this.spread) {
            case true:
                this.spread = false;
                this.showPageSpread();
                break;
        
            default:
                this.spread = true;
                this.hidePageSpread();
                break;
        }
    }

    createSlides() {
        const slidesContainer = document.createElement("div");
        slidesContainer.classList.add("gallery-slides", "d-flex");

        this.images.forEach((image) => {
            const slide = document.createElement("div");
            slide.classList.add("gallery-slide");
            const img = document.createElement("img");
            img.classList.add("d-inline-block", "align-middle");
            img.src = "";
            img.alt = image.alt;
            img.dataset.src = image.src;
            slide.appendChild(img);
            slidesContainer.appendChild(slide);
        });

        this.imageContainer = slidesContainer;
        this.container.appendChild(slidesContainer);
    }

    createThumbnails() {
        const thumbnailsContainer = document.createElement("div");
        thumbnailsContainer.classList.add(
            "gallery-thumbnails",
            "d-flex",
            "justify-content-center",
            "align-items-center",
            "overflow-auto",
            "flex-nowrap",
            "mt-2",
            "overflow-y-hidden",
            "bg-dark",
            "bg-opacity-50"
        );

        const thumbnailsInner = document.createElement("div");
        thumbnailsInner.classList.add(
            "thumbnails-inner",
            "d-flex",
            "justify-content-center",
            "align-items-end",
            "mw-100"
        );

        this.Thumbs.forEach((image, index) => {
            const thumbnail = document.createElement("div");
            thumbnail.classList.add("thumbnail", "z-1");
            const img = document.createElement("img");
            img.classList.add("rounded");
            img.src = "";
            img.alt = image.alt;
            thumbnail.classList.add("thumbnail");
            img.src = "";
            img.dataset.src = image.src;
            thumbnail.dataset.index = index;
            thumbnail.appendChild(img);
            thumbnailsInner.appendChild(thumbnail);
        });

        thumbnailsContainer.appendChild(thumbnailsInner);
        this.container.appendChild(thumbnailsContainer);
    }

    lazyLoadImages() {
        const imagesToLoad = this.container.querySelectorAll("img[data-src]");

        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0.1,
        };

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.removeAttribute("data-src");
                    imageObserver.unobserve(image);
                }
            });
        }, options);

        imagesToLoad.forEach((image) => {
            imageObserver.observe(image);
        });
    }

    addEventListeners() {
        const prevBtn = this.container.querySelector(".carousel-control-prev");
        const nextBtn = this.container.querySelector(".carousel-control-next");
        const thumbnails = this.container.querySelectorAll(".thumbnail");
        const showInfoToggle = document.querySelector(".toggle-thumbnails-button");
        const showSpread = document.getElementById("showSpread");


        this.imageContainer.addEventListener("mousedown", (event) => this.startDrag(event));
        this.imageContainer.addEventListener("mousemove", (event) => this.drag(event));
        this.imageContainer.addEventListener("mouseup", () => this.endDrag());
        this.imageContainer.addEventListener("touchstart", (event) => this.startDrag(event), { passive: false });
        this.imageContainer.addEventListener("touchmove", (event) => this.drag(event), { passive: false });
        this.imageContainer.addEventListener("touchend", () => this.endDrag());
        showSpread.addEventListener("click", ()=>{
            this.spreadToogle(this.currentPage);
        })
        if (prevBtn && nextBtn && thumbnails) {

            prevBtn.addEventListener("click", () => {
                this.prevSlide();
                this.updateCurrentPage();
            });
            nextBtn.addEventListener("click", () => {
                this.nextSlide();
                this.updateCurrentPage();
            });
            document.addEventListener("keydown",(event) => {
                if (event.key === "ArrowLeft") {
                    this.prevSlide();
                    this.updateCurrentPage();
                } else if (event.key === "ArrowRight") {
                    this.nextSlide();
                    this.updateCurrentPage();
                } 
            });

            thumbnails.forEach((thumbnail, index) => {
                thumbnail.addEventListener("click", () => {
                    this.showSlide(index);
                    this.updateCurrentPage();
                });
            });
            showInfoToggle.addEventListener("click", () => {
                this.toggleThumbnails();
            });

            this.imageContainer.addEventListener("dblclick", () => {
                this.toggleZoom();
            });

            this.imageContainer.addEventListener("wheel", (event) => {
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.handleMouseWheel(event);
                }
            }, { passive: false });
        }
    }

    startDrag(event) {
        event.preventDefault();
        if (this.zoomLevel !== 0) {
            this.isDragging = true;
            this.dragStartX = event.clientX || event.touches[0].clientX;
            this.dragStartY = event.clientY || event.touches[0].clientY;
            this.dragLastX = this.dragStartX;
            this.dragLastY = this.dragStartY;
            document.body.classList.add('img-grabbing');
        }
    }

    drag(event) {
        if (!this.isDragging) return;
        const clientX = event.clientX || event.touches[0].clientX;
        const clientY = event.clientY || event.touches[0].clientY;
        this.deltaX = clientX - this.dragLastX;
        this.deltaY = clientY - this.dragLastY;
        this.currentTranslateX += this.deltaX;
        this.currentTranslateY += this.deltaY;
        this.updateImageTransform();
        this.dragLastX = clientX;
        this.dragLastY = clientY;
    }

    endDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        document.body.classList.remove('img-grabbing');
    }

    handleMouseWheel(event) {
        if (event.deltaY < 0) {
            this.zoomIn();
        } else if (event.deltaY > 0) {
            this.zoomOut();
        }
        if (this.zoomLevel === 0) {
            this.resetZoom();
        }
    }

    zoomIn() {
        if (this.zoomLevel < this.maxZoomLevel) {
            this.zoomLevel++;
            this.updateImageTransform();
        }
    }

    zoomOut() {
        if (this.zoomLevel > this.minZoomLevel) {
            this.zoomLevel--;
            this.updateImageTransform();
        }
    }

    toggleZoom() {
        switch (this.zoomLevel) {
            case 0:
                this.zoomIn();
                break;
            case 1:
                this.zoomIn();
                break;

            default:
                this.resetZoom();
                break;
        }
    }

    resetZoom() {
        this.zoomLevel = 0;
        this.currentTranslateX = 0;
        this.currentTranslateY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.updateImageTransform();
    }

    updateImageTransform() {
        const currentSlide = document.querySelector(".gallery-slides");
        if (currentSlide) {
            currentSlide.style.transform = `translate(${this.currentTranslateX}px, ${this.currentTranslateY}px) scale(${this.zoomScales[this.zoomLevel]})`;
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

    hideThumb() {
        const thumb = document.querySelector(".gallery-thumbnails");
        thumb.classList.add("d-none");
    }

    showThumb() {
        const thumb = document.querySelector(".gallery-thumbnails");
        thumb.classList.remove("d-none");
    }

    toggleThumbnails() {
        switch (this.showThumbnailsFlag) {
            case 0:
                this.showThumbnailsFlag = 1;
                this.showThumb();
                break;

            case 1:
                this.showThumbnailsFlag = 0;
                this.hideThumb();
                break;
        }
        this.isToggleThumbnailsActive = !this.isToggleThumbnailsActive;
    }

    visibleThumbnails() {
        const start = this.currentPage * this.thumbnailsPerPage;
        const end = start + this.thumbnailsPerPage;
        const visibleThumbnails = this.Thumbs.slice(start, end);
        this.currentIndexOnPage = this.currentIndex - start;
        return visibleThumbnails.map((thumbnail, index) => ({
            ...thumbnail,
            index: start + index,
            active: index === this.currentIndexOnPage,
        }));
    }

    showSlide(index) {
        const slides = this.container.querySelectorAll(".gallery-slide");
        const thumbnails = this.container.querySelectorAll(".thumbnail");
    
        slides.forEach((slide) => (slide.style.display = "none"));
        thumbnails.forEach((thumbnail) => thumbnail.classList.remove("active"));
    
        slides[index].style.display = "block";
        thumbnails[index].classList.add("active");
    
        this.currentSlideIndex = index;
        this.resetZoom();
        this.updateCurrentPage();
        this.showInfo();
    
        // Обновление отображаемых миниатюр при смене слайда
        const currentPage = Math.floor(index / this.thumbnailsPerPage);
        const previousPage = Math.floor((index - 1) / this.thumbnailsPerPage);
        const nextPage = Math.floor((index + 1) / this.thumbnailsPerPage);
    
        if (currentPage !== previousPage) {
            this.showThumbnailPage(currentPage);
        } else if (currentPage !== nextPage) {
            this.showThumbnailPage(currentPage);
        }
    }
    
    

    showInfo() {
        const topbar = document.querySelector(".info");
        topbar.textContent = this.currentSlideIndex + 1 + "/" + this.images.length;
    }

    prevSlide() {
        if (this.currentSlideIndex > 0) {
            this.showSlide(this.currentSlideIndex - 1);
        }
    }

    nextSlide() {
        if (this.currentSlideIndex < this.images.length - 1) {
            this.showSlide(this.currentSlideIndex + 1);
        }
    }

    // New method to navigate to the next thumbnail page
    navigateToNextThumbnailPage() {
        if (this.currentSlideIndex >= this.thumbnailNavigationLimit) {
            // Increase the current page if the slide number reaches the limit
            this.currentPage = Math.min(this.currentPage + 1, this.getTotalThumbnailPages() - 1);
            this.showThumbnailPage(this.currentPage);
        }
    }

    // New method to navigate to the previous thumbnail page
    navigateToPreviousThumbnailPage() {
        if (this.currentSlideIndex <= this.thumbnailNavigationLimit - 1) {
            // Decrease the current page if the slide number reaches the limit
            this.currentPage = Math.max(this.currentPage - 1, 0);
            this.showThumbnailPage(this.currentPage);
        }
    }

    // New method to get the total number of thumbnail pages
    getTotalThumbnailPages() {
        return Math.ceil(this.Thumbs.length / this.thumbnailsPerPage);
    }
    showThumbnailPage(page) {
        const thumbnails = this.container.querySelectorAll(".thumbnail");
        const startIndex = page * this.thumbnailsPerPage;
        const endIndex = Math.min(startIndex + this.thumbnailsPerPage, thumbnails.length);
    
        for (let index = 0; index < thumbnails.length; index++) {
            if (index >= startIndex && index < endIndex) {
                thumbnails[index].style.display = "block";
            } else {
                thumbnails[index].style.display = "none";
            }
    
            if (index === startIndex && page > 0) {
                // Отобразить последнюю миниатюру с предыдущей страницы первой на текущей странице
                const previousPageLastIndex = startIndex - 1;
                const currentPageLastIndex = Math.min(startIndex + this.thumbnailsPerPage - 1, thumbnails.length - 1);
    
                for (let i = previousPageLastIndex; i >= startIndex; i--) {
                    thumbnails[i].style.display = "block";
                }
            }
        }
    }
}

