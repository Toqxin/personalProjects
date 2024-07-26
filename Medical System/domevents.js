document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll('.dashboard-content li');
    const pages = document.querySelectorAll('.pages');
    
    pages.forEach(page => 
        page.style.display = 'none'
    );

    document.querySelector('.first-page').style.display = 'flex';

    menuItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            pages.forEach(page => page.style.display = 'none');
            
            switch (index) {
                case 0:
                    document.querySelector('.about-page').style.display = 'flex';
                    break;
                case 1:
                    document.querySelector('.doctors-page').style.display = 'flex';
                    break;
                case 2:
                    document.querySelector('.patients-page').style.display = 'flex';
                    break;
                case 3:
                    document.querySelector('.polyclinics-page').style.display = 'flex';
                    break;
                default:
                    break;
            }

            menuItems.forEach(item => 
                item.classList.remove('active')
            );

            item.classList.add('active');
        });
    });

    const dashboardH1 = document.querySelector('.dashboard h1');
    dashboardH1.addEventListener('click',()=>{
        location.reload();
    });
    
});
