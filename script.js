
const imageDir = "";
const images = [
    "page1.jpg",
    "page2.jpg",
    "page2.jpg",
];
const thumbs = [
    "demo.jpg",
    "demo.jpg",
    "demo.jpg",
];

const app = new Vue({
    el: "#app",
    data: {
        userActivityTimeout: null,
        userActivityDuration: 5000, // Продолжительность неактивности пользователя в миллисекундах
        zoomLevel: 0,
        zoomScale: 0,
        showThumbnails: true,
        showInfo: true,
        showNavigation: true,
        currentIndex: 0,
        modalImageUrl: null,
        thumbnailsPerPage: 3, // Количество выводимых миниатюр на странице
        currentPage: 0, // Текущая страница миниатюр
        currentIndexOnPage: 0,
        isDragging: false, // Флаг для отслеживания перемещения изображения
        dragStartX: 0, // Начальная позиция X при перемещении
        dragStartY: 0, // Начальная позиция Y при перемещении

        images: images.map((image, index) => ({
            src: imageDir + image,
            alt: `Image ${index + 1}`
        })),

        Thumbs: thumbs.map((image, index) => ({
            src: imageDir + image,
            alt: `Image ${index + 1}`
        })),


    },

    computed: {
        // Вычисляемое свойство для определения видимых миниатюр на текущей странице
        visibleThumbnails() {
            const start = this.currentPage * this.thumbnailsPerPage;
            const end = start + this.thumbnailsPerPage;
            const visibleThumbnails = this.Thumbs.slice(start, end);
            this.currentIndexOnPage = this.currentIndex - start;
            return visibleThumbnails.map((thumbnail, index) => ({
                ...thumbnail,
                index: start + index, // Добавляем индекс слайда
                active: index === this.currentIndexOnPage, // Проверяем активность
            }));
        },
    },
    methods: {
        startDrag(event) {
            event.preventDefault();
            this.isDragging = true;
            this.dragStartX = event.clientX || event.touches[0].clientX;
            this.dragStartY = event.clientY || event.touches[0].clientY;
            document.body.classList.add('img-grabbing');
        },
    
        // Обработчик перемещения изображения
        drag(event) {
            if (!this.isDragging) return;
            const clientX = event.clientX || event.touches[0].clientX;
            const clientY = event.clientY || event.touches[0].clientY;
            const deltaX = clientX - this.dragStartX;
            const deltaY = clientY - this.dragStartY;
            const modalImage = document.getElementById("modalImage");
            modalImage.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${this.zoomScale})`;
        },
    
        // Обработчик окончания перемещения изображения
        endDrag() {
            if (!this.isDragging) return;
            this.isDragging = false;
            document.body.classList.remove('img-grabbing');
        },
        // Добавьте функцию для сброса таймера неактивности пользователя
        resetUserActivityTimer() {
            clearTimeout(this.userActivityTimeout); // Очистить предыдущий таймер
            this.userActivityTimeout = setTimeout(this.hideControlsAndThumbnails, this.userActivityDuration);
        },

        // Добавьте функцию для скрытия элементов управления и миниатюр
        hideControlsAndThumbnails() {
            this.showThumbnails = false; // Скрыть миниатюры      
            this.showInfo = false; // Скрыть info bar      
            this.showNavigation = false; // Скрыть элементы навигации
        },

        // Добавьте обработчики событий для отслеживания активности пользователя
        handleUserActivity() {
            this.showThumbnails = true; // Показать миниатюры  
            this.showInfo = true; // Показать info bar  
            this.showNavigation = true; // Показать элементы навигации 
            this.resetUserActivityTimer(); // Сбросить таймер неактивности
        },

        // Функция для управления отображением миниатюр при смене слайда
        updateThumbnails() {
            const currentPageStart = this.currentPage * this.thumbnailsPerPage;
            const currentPageEnd = currentPageStart + this.thumbnailsPerPage;
            const currentIndex = this.currentIndex;
            
            // Устанавливаем видимость каждой миниатюры
            this.Thumbs.forEach((thumbnail, index) => {
                thumbnail.visible = index >= currentPageStart && index < currentPageEnd;
                thumbnail.active = index === currentIndex;
            });
        },
        openModal(index) {
            if (this.Thumbs.length > this.images.length){
                for (let i = 0; i < this.Thumbs.length - this.images.length; i++) {
                    this.Thumbs.pop();
                  }
            }
            this.currentIndex = index;
            this.modalImageUrl = this.images[index].src;
            this.currentPage = Math.floor(index / this.thumbnailsPerPage); // Переключение страницы миниатюр при открытии модального окна
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
            console.log(this.currentPage + 1);
            if (this.currentIndex + 1 <= this.thumbnailsPerPage * (this.currentPage + 1) ){
                this.prevThumbnails();
            }
            if (this.currentIndex + 1 > this.thumbnailsPerPage * (this.currentPage + 1)){
                this.nextThumbnails();
            }
            setTimeout(() => {
                this.modalImageUrl = this.images[this.currentIndex].src;
            }, 10);
        },

        nextImage() {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
            this.modalImageUrl = null;
            if (this.currentIndex + 1 <= this.thumbnailsPerPage * (this.currentPage + 1) ){
                this.prevThumbnails();
            }
            if (this.currentIndex + 1 > this.thumbnailsPerPage * (this.currentPage + 1)){
                this.nextThumbnails();
            }
            setTimeout(() => {
            
                this.modalImageUrl = this.images[this.currentIndex].src;
            }, 10);
        },
       // Методы для переключения страниц миниатюр
       prevThumbnails() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.updateThumbnails(); // Обновление видимости и активности миниатюр
        }
    },
    nextThumbnails() {
        const totalPages = Math.ceil(this.Thumbs.length / this.thumbnailsPerPage);
        if (this.currentPage < totalPages - 1) {
            this.currentPage++;
            this.updateThumbnails(); // Обновление видимости и активности миниатюр
        }
    },
        toggleThumbnails() {
            this.showThumbnails = !this.showThumbnails;
        },
        toggleZoom() {
            const modalImage = document.getElementById("modalImage");
            if (this.zoomLevel === 0) {
                this.zoomLevel = 1;
                modalImage.classList.add("zoomed-1");
                this.zoomScale = 2;
            } else if (this.zoomLevel === 1) {
                this.zoomLevel = 2;
                this.zoomScale = 4;
                modalImage.classList.remove("zoomed-1");
                modalImage.classList.add("zoomed-2");
                modalImage.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${this.zoomScale})`;
            } else {
                this.zoomLevel = 0;
                modalImage.classList.remove("zoomed-2");
                this.zoomScale = 0;
                modalImage.style.removeProperty("transform")
            }
        }, lazyLoadImage() {
            const image = document.querySelector("[loading='lazy']");
            if (image && !image.src) {
                image.src = image.getAttribute("data-src");
            }
        },
    },
    created() {
        // Добавление обработчика события смены слайда
        this.$on("after-enter", this.lazyLoadImage);
         // Добавьте обработчики событий для отслеживания активности пользователя
         document.addEventListener("mousemove", this.handleUserActivity);
         document.addEventListener("keydown", this.handleUserActivity);
         document.addEventListener('mousedown', this.startDrag);
         document.addEventListener('mousemove', this.drag);
         document.addEventListener('mouseup', this.endDrag);
         document.addEventListener('touchstart', this.startDrag, { passive: false });
         document.addEventListener('touchmove', this.drag, { passive: false });
         document.addEventListener('touchend', this.endDrag);
         // Инициализируйте таймер неактивности при создании компонента
         this.resetUserActivityTimer();
    },
    destroyed() {
        // Удаление обработчика события смены слайда при уничтожении компонента
        this.$off("after-enter", this.lazyLoadImage);
        document.removeEventListener("mousemove", this.handleUserActivity);
        document.removeEventListener("keydown", this.handleUserActivity);
        document.removeEventListener('mousedown', this.startDrag);
    document.removeEventListener('mousemove', this.drag);
    document.removeEventListener('mouseup', this.endDrag);
    document.removeEventListener('touchstart', this.startDrag);
    document.removeEventListener('touchmove', this.drag);
    document.removeEventListener('touchend', this.endDrag);
    },        // Добавьте вызовы методов в соответствующие события

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
