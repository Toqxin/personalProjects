import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, set, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

const firebaseConfig2 = {
    apiKey: "API_KEY2",
    authDomain: "AUTH_DOMAIN2",
    databaseURL: "DATABASE_URL2",
    projectId: "PROJECT_ID2",
    storageBucket: "STORAGE_BUCKET2",
    messagingSenderId: "MESSAGING_SENDER_ID2",
    appId: "APP_ID2"
};

const app2 = initializeApp(firebaseConfig2, "app2");
const database2 = getDatabase(app2);

const addDoctorBtn = document.querySelector('.add-doctor-btn');
const alertContainer = document.getElementById('alert-container');
const addDoctorForm = document.getElementById('add-doctor-form');
const closeAlertBtn = document.getElementById('close-alert');
const dCountElement = document.getElementById('d-count');
const doctorsCardsDiv = document.querySelector('.doctors-cards-div');
const searchInput = document.getElementById('doctor-name-input');

addDoctorBtn.addEventListener('click', () => {
    alertContainer.style.display = 'flex';
});

closeAlertBtn.addEventListener('click', () => {
    hideAlertForm();
});

document.addEventListener('DOMContentLoaded', () => {
    const departmentDropdown = document.getElementById('doctor-department-dropdown');
    const sectionPolyclinics = document.querySelectorAll('.clinics');

    departmentDropdown.innerHTML = '';

    sectionPolyclinics.forEach(section => {
        const departmentOption = document.createElement('option');
        departmentOption.text = section.textContent.trim();
        departmentOption.value = section.textContent.trim();
        departmentDropdown.appendChild(departmentOption);
    });

    sectionPolyclinics.forEach(section => {
        section.addEventListener('click', () => {
            const sectionText = section.textContent.trim();
            const polyclinicLabel = document.getElementById('polyclinic-label');
            polyclinicLabel.textContent = sectionText;
            departmentDropdown.value = sectionText;
        });
    });
});

addDoctorForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const doctorId = document.getElementById('doctor-id').value;
    const doctorName = document.getElementById('doctor-name').value;
    const doctorSurname = document.getElementById('doctor-surname').value;
    const doctorDepartment = document.getElementById('doctor-department-dropdown').value;

    if (doctorId && doctorName && doctorSurname && doctorDepartment) {
        try {
            const doctorRef = ref(database2, 'doctors/' + doctorId);
            const doctorSnapshot = await get(doctorRef);

            if (doctorSnapshot.exists()) {
                alert('Doctor with this ID already exists.');
            } else {
                await set(doctorRef, {
                    id: doctorId,
                    name: doctorName,
                    surname: doctorSurname,
                    department: doctorDepartment
                });

                createDoctorCard(doctorId, doctorName, doctorSurname, doctorDepartment);
                await updateDoctorsCount();
                hideAlertForm();
            }
        } catch (error) {
            console.error('Error adding doctor:', error);
        }
    } else {
        alert('Please fill in all fields.');
    }
});

const updateDoctorsCount = async () => {
    const dbRef = ref(database2, 'doctors');
    const snapshot = await get(dbRef);

    let doctorsCount = 0;
    snapshot.forEach((childSnapshot) => {
        doctorsCount++;
    });
    dCountElement.textContent = doctorsCount;
};

const hideAlertForm = () => {
    alertContainer.style.display = 'none';
    addDoctorForm.reset();
};

document.addEventListener('DOMContentLoaded', async () => {
    const dbRef = ref(database2, 'doctors');
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const doctorData = childSnapshot.val();
            const doctorId = childSnapshot.key;
            const doctorName = doctorData.name;
            const doctorSurname = doctorData.surname;
            const doctorDepartment = doctorData.department;
            createDoctorCard(doctorId, doctorName, doctorSurname, doctorDepartment);
        });
    }
});

const createDoctorCard = (doctorId, doctorName, doctorSurname, doctorDepartment) => {
    const doctorCard = document.createElement('div');
    doctorCard.classList.add('doctor-card');
    doctorCard.setAttribute('data-doctor-id', doctorId);
    doctorCard.innerHTML = `
        <div class="doctor-card-head">
            <div class="card-delete" data-doctor-id="${doctorId}">X</div>
        </div>
        <img src="images/doctor.png" alt="">
        <div class="doctor-name">${doctorName} ${doctorSurname}</div>
        <div class="doctor-department">(${doctorDepartment})</div>
    `;

    const deleteButton = doctorCard.querySelector('.card-delete');
    deleteButton.addEventListener('click', () => {
        const confirmDelete = confirm(`Are you sure you want to delete Dr. ${doctorName} ${doctorSurname}?`);
        if (confirmDelete) {
            deleteDoctor(doctorId);
        }
    });

    doctorsCardsDiv.appendChild(doctorCard);
};

const deleteDoctor = async (doctorId) => {
    try {
        await set(ref(database2, `doctors/${doctorId}`), null);
        const doctorCardToDelete = document.querySelector(`.doctor-card[data-doctor-id="${doctorId}"]`);
        if (doctorCardToDelete) {
            doctorCardToDelete.remove();
        }
        await updateDoctorsCount();
    } catch (error) {
        console.error('Error deleting doctor:', error);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await updateDoctorsCount();
});

if (searchInput) {
    searchInput.addEventListener('input', () => {
        const searchValue = searchInput.value.toLowerCase();
        const doctorCards = document.querySelectorAll('.doctor-card');

        doctorCards.forEach(card => {
            const doctorName = card.querySelector('.doctor-name').textContent.toLowerCase();
            if (doctorName.includes(searchValue)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
} else {
    console.error('Search input element not found.');
}

const clinicElements = document.querySelectorAll(".clinics");
const doctorUl = document.getElementById('under-doctors');

clinicElements.forEach(clinic => {
    clinic.addEventListener("click", async function() {
        const polyclinicName = clinic.textContent.trim();
        const polyclinicLabel = document.getElementById("polyclinic-label");
        polyclinicLabel.textContent = polyclinicName;

        doctorUl.innerHTML = '';

        clinicElements.forEach(clinic => clinic.classList.remove('active'));
        clinic.classList.add('active');

        try {
            const doctorsRef = ref(database2, 'doctors');
            const doctorsQuery = query(doctorsRef, orderByChild('department'), equalTo(polyclinicName));
            const snapshot = await get(doctorsQuery);

            if(!snapshot.exists()){
                const doctorLi = document.createElement('li');
                doctorLi.textContent = `Doctor/Doctors not found!`;
                doctorLi.style.backgroundColor = 'red';
                doctorLi.style.color = 'white';
                doctorUl.appendChild(doctorLi);
            }else{
                snapshot.forEach((childSnapshot) => {
                    const doctorsData = childSnapshot.val();
                    const doctorLi = document.createElement('li');
                    doctorLi.textContent = `${doctorsData.name} ${doctorsData.surname}`;
                    doctorUl.appendChild(doctorLi);
                });
            }

        } catch (error) {
            console.error("Firebase Error:", error);
        }
    });
});
