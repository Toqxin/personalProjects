import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

const firebaseConfig1 = {
    apiKey: "API_KEY1",
    authDomain: "AUTH_DOMAIN1",
    databaseURL: "DATABASE_URL1",
    projectId: "PROJECT_ID1",
    storageBucket: "STORAGE_BUCKET1",
    messagingSenderId: "MESSAGING_SENDER_ID1",
    appId: "APP_ID1"
};

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

const app = initializeApp(firebaseConfig1);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', async () => {
    const addPatientBtn = document.querySelector('.add-patient-btn');
    const alertContainer = document.getElementById('alert-container-patient');
    const addPatientForm = document.getElementById('add-patient-form');
    const closeAlertBtn = document.getElementById('close-alert-patient');
    const pCountElement = document.getElementById('p-count');
    const patientsCardsDiv = document.querySelector('.patients-cards-div');
    const searchInput = document.getElementById('patient-name-input');
    const patientPolyclinicInput = document.getElementById('patient-polyclinic');
    const updatePatientPolyclinicInput = document.getElementById('update-patient-polyclinic');
    
    const alertUpdateContainer = document.getElementById('alert-container-update-patient');
    const closeUpdatePatientForm = document.getElementById('close-alert-update-patient');
    const updatePatientForm = document.getElementById('update-patient-form');
    const updatePatientIdInput = document.getElementById('update-patient-id');
    const updatePatientNameInput = document.getElementById('update-patient-name');
    const updatePatientDoctorInput = document.getElementById('update-patient-doctor');
    const updatePatientDateInput = document.getElementById('update-patient-date');

    if (!addPatientBtn || !alertContainer || !addPatientForm || !closeAlertBtn || !pCountElement || !patientsCardsDiv || !searchInput || !patientPolyclinicInput || !updatePatientPolyclinicInput || !alertUpdateContainer || !updatePatientForm || !updatePatientIdInput || !updatePatientNameInput || !updatePatientDoctorInput || !updatePatientDateInput) {
        console.error('Some DOM elements were not found. Please check your HTML file.');
        return;
    }

    addPatientBtn.addEventListener('click', () => {
        alertContainer.style.display = 'flex';
    });

    closeAlertBtn.addEventListener('click', () => {
        hideAlertForm();
    });

    try {
        const doctorsRef = ref(database2, 'doctors');
        const snapshot = await get(doctorsRef);
        const doctorDropdown = document.getElementById('patient-doctor-dropdown');

        if (!doctorDropdown) {
            console.error('Doctor dropdown element not found.');
            return;
        }

        if (!snapshot.exists()) {
            const option = document.createElement('option');
            option.value = '';
            option.text = 'No doctors available';
            doctorDropdown.appendChild(option);
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const doctorData = childSnapshot.val();
            const option = document.createElement('option');
            option.value = childSnapshot.key;
            option.text = `${doctorData.name} ${doctorData.surname} (${doctorData.department.toUpperCase()})`; 
            option.dataset.department = doctorData.department;
            doctorDropdown.appendChild(option);
        });

        doctorDropdown.addEventListener('change', (event) => {
            const selectedOption = event.target.options[event.target.selectedIndex];
            const selectedDepartment = selectedOption.dataset.department;
            patientPolyclinicInput.value = selectedDepartment || ''; 
            updatePatientDoctorInput.value = selectedOption.text;
        });

    } catch (error) {
        console.error('Error loading doctors:', error);
    }

    addPatientForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const patientId = document.getElementById('patient-id').value;
        const patientName = document.getElementById('patient-name').value;
        const patientPolyclinic = patientPolyclinicInput.value;
        const patientDoctor = document.getElementById('patient-doctor-dropdown').options[document.getElementById('patient-doctor-dropdown').selectedIndex].text;
        const patientDate = document.getElementById('patient-date').value;

        if (patientId && patientName && patientPolyclinic && patientDoctor && patientDate) {
            try {
                const existingPatientSnapshot = await get(ref(database, 'patients/' + patientId));
                if (existingPatientSnapshot.exists()) {
                    alert('This patient ID already exists. Please use a different ID.');
                } else {
                    await set(ref(database, 'patients/' + patientId), {
                        id: patientId,
                        name: patientName,
                        polyclinic: patientPolyclinic,
                        doctor: patientDoctor,
                        date: patientDate
                    });

                    createPatientCard(patientId, patientName, patientPolyclinic, patientDoctor, patientDate);
                    await updatePatientsCount();
                    hideAlertForm();
                }
            } catch (error) {
                console.error('Error adding patient: ', error);
            }
        } else {
            alert('Please fill in all fields.');
        }
    });

    const updatePatientsCount = async () => {
        const dbRef = ref(database, 'patients');
        const snapshot = await get(dbRef);
    
        let patientsCount = 0;
        snapshot.forEach(() => {
            patientsCount++;
        });
    
        pCountElement.textContent = patientsCount;
    };

    const hideAlertForm = () => {
        alertContainer.style.display = 'none';
        addPatientForm.reset();
    };

    const loadPatients = async () => {
        const dbRef = ref(database, 'patients');
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const patientData = childSnapshot.val();
                const patientId = childSnapshot.key;
                const patientName = patientData.name;
                const patientPolyclinic = patientData.polyclinic;
                const patientDoctor = patientData.doctor;
                const patientDate = patientData.date;
                createPatientCard(patientId, patientName, patientPolyclinic, patientDoctor, patientDate);
            });
        }
    };

    const createPatientCard = (patientId, patientName, patientPolyclinic, patientDoctor, patientDate) => {
        const patientCard = document.createElement('div');
        patientCard.classList.add('patient-card');
        patientCard.setAttribute('data-patient-id', patientId);
        patientCard.innerHTML = `
            <div class="balloons">
                <ul>
                    <li class="patient-id">${patientId}</li>
                    <li class="patient-name">${patientName}</li>
                    <li class="patient-polyclinic">${patientPolyclinic}</li>
                    <li class="patient-doctor">${patientDoctor}</li>
                    <li class="patient-date">${patientDate}</li>
                    <li id="delete-balloons" data-patient-id="${patientId}">X</li>
                </ul>
            </div>
        `;

        const deleteButton = patientCard.querySelector('#delete-balloons');
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const confirmDelete = confirm(`Are you sure you want to delete "${patientName}"?`);
            if (confirmDelete) {
                deletePatient(patientId);
            }
        });

        patientCard.addEventListener('click', () => {
            const idElement = patientCard.querySelector('.patient-id');
            const nameElement = patientCard.querySelector('.patient-name');
            const polyclinicElement = patientCard.querySelector('.patient-polyclinic');
            const doctorElement = patientCard.querySelector('.patient-doctor');
            const dateElement = patientCard.querySelector('.patient-date');

            if (idElement && nameElement && polyclinicElement && doctorElement && dateElement) {
                updatePatientIdInput.value = idElement.textContent;
                updatePatientNameInput.value = nameElement.textContent;
                updatePatientPolyclinicInput.value = polyclinicElement.textContent;
                updatePatientDoctorInput.value = doctorElement.textContent;
                updatePatientDateInput.value = dateElement.textContent;
                alertUpdateContainer.style.display = 'flex';
            } else {
                console.error('Error: Patient card elements are missing.');
            }
        });

        patientsCardsDiv.appendChild(patientCard);
    };

    const deletePatient = async (patientId) => {
        try {
            await remove(ref(database, 'patients/' + patientId));
            const patientCard = document.querySelector(`.patient-card[data-patient-id="${patientId}"]`);
            if (patientCard) {
                patientCard.remove();
                await updatePatientsCount();
            }
        } catch (error) {
            console.error('Error deleting patient: ', error);
        }
    };

    updatePatientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const patientId = updatePatientIdInput.value;
        const patientName = updatePatientNameInput.value;
        const patientPolyclinic = updatePatientPolyclinicInput.value;
        const patientDoctor = updatePatientDoctorInput.value;
        const patientDate = updatePatientDateInput.value;
    
        if (patientId && patientName && patientPolyclinic && patientDoctor && patientDate) {
            try {
                await set(ref(database, 'patients/' + patientId), {
                    id: patientId,
                    name: patientName,
                    polyclinic: patientPolyclinic,
                    doctor: patientDoctor,
                    date: patientDate
                });
    
                const patientCard = document.querySelector(`.patient-card[data-patient-id="${patientId}"]`);
                if (patientCard) {
                    patientCard.querySelector('.patient-name').textContent = patientName;
                    patientCard.querySelector('.patient-polyclinic').textContent = patientPolyclinic;
                    patientCard.querySelector('.patient-doctor').textContent = patientDoctor;
                    patientCard.querySelector('.patient-date').textContent = patientDate;
                }
                
               
                await updatePatientsCount();
            
            } catch (error) {
                console.error('Error updating patient: ', error);
            }
        } else {
            alert('Please fill in all fields.');
        }
    });
    
    closeUpdatePatientForm.addEventListener('click', () => {
        alertUpdateContainer.style.display = 'none';
        updatePatientForm.reset();
    });
    
    await loadPatients();
    await updatePatientsCount();
    
    function populateUpdateForm(patientId, patientName, patientPolyclinic, patientDoctor, patientDate) {
        updatePatientIdInput.value = patientId;
        updatePatientNameInput.value = patientName;
        updatePatientPolyclinicInput.value = patientPolyclinic;
        updatePatientPolyclinicInput.readOnly = true;
        updatePatientPolyclinicInput.disabled = true;
        updatePatientDoctorInput.value = patientDoctor;
        updatePatientDoctorInput.readOnly = true;
        updatePatientDoctorInput.disabled = true;
        updatePatientDateInput.value = patientDate;
    }
    
    
    document.querySelectorAll(".patient-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            let id = card.getAttribute("data-id");
            const dbref = ref(database, "Patients List/" + id);
            get(dbref).then((snapshot) => {
                let data = snapshot.val();
                populateUpdateForm(data.PatientID, data.PatientName, data.PatientPolyclinic, data.PatientDoctor, data.PatientDate);
                alertUpdateContainer.style.display = "block";
            });
        });
    });
    

    searchInput.addEventListener('input', () => {
        const searchValue = searchInput.value.toLowerCase();
        const patientCards = document.querySelectorAll('.balloons');

        patientCards.forEach(card => {
            const patientName = card.querySelector('.balloons ul').children[1].textContent.toLowerCase();
            if (patientName.includes(searchValue)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});


