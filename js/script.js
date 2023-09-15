
document.addEventListener("DOMContentLoaded", function () {
const app = new Vue({
    el: "#app",
    data: {
        userActivityTimeout: null,
        userActivityDuration: 5000,
        zoomLevel: 0,
        zoomScale: 1,
        showThumbnails: true,
        showInfo: true,
        showNavigation: true,
        isToggleThumbnailsActive: false,
        currentIndex: 0,
        modalImageUrl: null,
        thumbnailsPerPage: 3,
        currentPage: 0,
        currentIndexOnPage: 0,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        dragLastX: 0,
        dragLastY: 0,
        images: [],
        Thumbs: [],
        currentTranslateX: 0,
        currentTranslateY: 0,
        minZoomLevel: 0, // Минимальное значение zoomLevel
        maxZoomLevel: 1,  // Максимальное значение zoomLevel
    },

    computed: {
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
        },
    },

    methods: {
        loadImage(image) {
            if (!image.loaded) {
                const img = new Image();
                img.src = image.src;
                img.onload = () => {
                    image.loaded = true;
                };
            }
        },
        startDrag(event) {
            event.preventDefault();
            if (this.zoomLevel !== 0) {
                this.isDragging = true;
                this.dragStartX = event.clientX || event.touches[0].clientX;
                this.dragStartY = event.clientY || event.touches[0].clientY;
                this.dragLastX = this.dragStartX;
                this.dragLastY = this.dragStartY;
                document.body.classList.add('img-grabbing');
                modalImage.style.cursor = 'grabbing';
            }
        },
        drag(event) {
            if (!this.isDragging) return;
            const clientX = event.clientX || event.touches[0].clientX;
            const clientY = event.clientY || event.touches[0].clientY;
            this.deltaX = clientX - this.dragLastX;
            this.deltaY = clientY - this.dragLastY;
            this.currentTranslateX += this.deltaX;
            this.currentTranslateY += this.deltaY;
            modalImage.style.transform = `translate(${this.currentTranslateX}px, ${this.currentTranslateY}px) scale(${this.zoomScale})`;
            this.dragLastX = clientX;
            this.dragLastY = clientY;
        },
        endDrag() {
            if (!this.isDragging) return;
            this.isDragging = false;
            document.body.classList.remove('img-grabbing');
            modalImage.style.cursor = 'zoom-in';
        },
        // Обработчик события прокрутки колеса мыши
        handleMouseWheel(event) {
        // Добавьте эти переменные в раздел data вашего объекта Vue

            if (event.ctrlKey) {
                event.preventDefault();
                if (event.deltaY < 0) {
                    // Уменьшение масштаба при прокрутке вниз (увеличение zoomLevel)
                    if (this.zoomLevel <= this.maxZoomLevel) {
                        this.zoomLevel++;
                    }
                } else if (event.deltaY > 0) {
                    // Увеличение масштаба при прокрутке вверх (уменьшение zoomLevel)
                    if (this.zoomLevel > this.minZoomLevel) {
                        this.zoomLevel--;
                    }else{
                        this.currentTranslateX = 0;
                        this.currentTranslateY = 0;
                        this.deltaX = 0;
                        this.deltaY = 0;
                        this.currentTranslateY = 0;
                    }
                }

                // Обновите значение zoomScale в зависимости от zoomLevel
                this.zoomScale = Math.pow(2, this.zoomLevel);
                console.log(this.zoomLevel);
                // Обновите стиль изображения
                const modalImage = document.getElementById("modalImage");
                modalImage.style.transform = `translate(${this.currentTranslateX}px, ${this.currentTranslateY}px) scale(${this.zoomScale})`;
            };

        },

        resetUserActivityTimer() {
            clearTimeout(this.userActivityTimeout);
            this.userActivityTimeout = setTimeout(this.hideControlsAndThumbnails, this.userActivityDuration);
        },
        hideControlsAndThumbnails() {
        // Проверяем флаг и состояние миниатюр
        if (!this.isToggleThumbnailsActive) {
            this.showThumbnails = false;
        }
            this.showInfo = false;
            this.showNavigation = false;
        },
        handleUserActivity() {
                    // Проверяем флаг и состояние миниатюр
        if (!this.isToggleThumbnailsActive) {
            this.showThumbnails = true;
        }
            this.showInfo = true;
            this.showNavigation = true;
            this.resetUserActivityTimer();
        }, 
        // Обработчик события прокрутки колеса мыши

        updateThumbnails() {
            const currentPageStart = this.currentPage * this.thumbnailsPerPage;
            const currentPageEnd = currentPageStart + this.thumbnailsPerPage;
            const currentIndex = this.currentIndex;
            
            this.Thumbs.forEach((thumbnail, index) => {
                thumbnail.visible = index >= currentPageStart && index < currentPageEnd;
                thumbnail.active = index === currentIndex;
            });
        },
        openModal(index) {
            if (this.Thumbs.length > this.images.length) {
                this.Thumbs.splice(this.images.length);
            }
            this.currentIndex = index;
            this.modalImageUrl = this.images[index].src;
            this.currentPage = Math.floor(index / this.thumbnailsPerPage);
            document.getElementById("myModal").classList.remove("d-none");
            document.getElementById("myModal").classList.add("d-block");
            document.querySelector(".info").classList.add("active"); 
        },
        closeModal() {
            document.getElementById("myModal").classList.remove("d-block");
            document.getElementById("myModal").classList.add("d-none");
            document.querySelector(".info").classList.remove("active");
        },
        prevImage() {
            this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
            this.modalImageUrl = null;
            if (this.currentIndex + 1 <= this.thumbnailsPerPage * (this.currentPage + 1)) {
                this.prevThumbnails();
            }
            if (this.currentIndex + 1 > this.thumbnailsPerPage * (this.currentPage + 1)) {
                this.nextThumbnails();
            }
            this.zoomLevel = 0;
            setTimeout(() => {
                this.modalImageUrl = this.images[this.currentIndex].src;
            }, 10);
        },
        nextImage() {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
            this.modalImageUrl = null;
            if (this.currentIndex + 1 <= this.thumbnailsPerPage * (this.currentPage + 1)) {
                this.prevThumbnails();
            }
            if (this.currentIndex + 1 > this.thumbnailsPerPage * (this.currentPage + 1)) {
                this.nextThumbnails();
            }
            this.zoomLevel = 0;
            setTimeout(() => {
                this.modalImageUrl = this.images[this.currentIndex].src;
            }, 10);
        },
        prevThumbnails() {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.updateThumbnails();
            }
        },
        nextThumbnails() {
            const totalPages = Math.ceil(this.Thumbs.length / this.thumbnailsPerPage);
            if (this.currentPage < totalPages - 1) {
                this.currentPage++;
                this.updateThumbnails();
            }
        },
        toggleThumbnails() {
            this.showThumbnails = !this.showThumbnails;
            this.isToggleThumbnailsActive = !this.isToggleThumbnailsActive;
        },
        
        toggleZoom() {
            const modalImage = document.getElementById("modalImage");
            
            if (this.zoomLevel === 0) {
                this.zoomLevel = 1;
                this.zoomScale = 2;
                modalImage.style.transform = `scale(${this.zoomScale})`;
            } else if (this.zoomLevel === 1) {
                this.zoomLevel = 2;
                this.zoomScale = 4;
                modalImage.style.transform = `translate(${(this.currentTranslateX * 2)+ (this.deltaX * 2)}px, ${(this.currentTranslateY * 2)+ (this.deltaY * 2)}px) scale(${this.zoomScale})`;
            } else {
                this.zoomLevel = 0;
                this.zoomScale = 1;
                modalImage.style.removeProperty("transform");
                this.currentTranslateX = 0;
                this.currentTranslateY = 0;
                this.deltaX = 0;
                this.deltaY = 0;
                this.currentTranslateY = 0;
            }
        },
        lazyLoadImage() {
            const image = document.querySelector("[loading='lazy']");
            if (image && !image.src) {
                image.src = image.getAttribute("data-src");
            }
        },
    },
    created() {
        fetch("loadImages.php")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            this.images = data.map((image) => ({
                src: image.src,
                alt: image.alt,
                hash: image.hash,
                loaded: false,
            }));
        })
        .catch((error) => {
            console.error("Ошибка при загрузке изображений:", error);
        });
        fetch("loadThumbs.php")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            this.Thumbs = data.map((image) => ({
                src: image.src,
                alt: image.alt,
                hash: image.hash,
                loaded: false,
            }));
        })
        .catch((error) => {
            console.error("Ошибка при загрузке изображений:", error);
        });
        this.$on("after-enter", this.lazyLoadImage);
        document.addEventListener("mousemove", this.handleUserActivity);
        document.addEventListener("keydown", this.handleUserActivity);
        document.addEventListener('mousedown', this.startDrag);
        document.addEventListener('mousemove', this.drag);
        document.addEventListener('mouseup', this.endDrag);
        document.addEventListener('touchstart', this.startDrag, { passive: false });
        document.addEventListener('touchmove', this.drag, { passive: false });
        document.addEventListener('touchend', this.endDrag);
        document.addEventListener('wheel', this.handleMouseWheel, { passive: false });
        this.resetUserActivityTimer();
    },
    destroyed() {
        this.$off("after-enter", this.lazyLoadImage);
        document.removeEventListener("mousemove", this.handleUserActivity);
        document.removeEventListener("keydown", this.handleUserActivity);
        document.removeEventListener('mousedown', this.startDrag);
        document.removeEventListener('mousemove', this.drag);
        document.removeEventListener('mouseup', this.endDrag);
        document.removeEventListener('touchstart', this.startDrag);
        document.removeEventListener('touchmove', this.drag);
        document.removeEventListener('touchend', this.endDrag);
    },
});
document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
        app.prevImage();
    } else if (event.key === "ArrowRight") {
        app.nextImage();
    } else if (event.key === "Escape") {
        app.closeModal();
    }
});
});