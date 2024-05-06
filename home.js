// to manage the certificate-related functionalities

const baseUrl = 'http://localhost:9393';
const fieldNames = ['certificateName', 'organisationName', 'issueDate', 'expiryDate', 'certificateUrl', 'credentialId'];

async function handleError(error, operation) {
    console.error(`Error during ${operation}:`, error.message);
    alert(`An error occurred during ${operation}. Please try again later.`);
}

async function editCertificate(row) {
    try {

        const certificate = {};
        for (let counter = 0; counter < fieldNames.length; counter++) {
            certificate[fieldNames[counter]] = row.cells[counter].innerText;
        }
        console.log(certificate);
        renderForm(certificate);
    } catch (error) {
        handleError(error, 'editing certificate');
        alert('Failed to edit certificate. Please try again later.');
    }
}

async function validateToken(token) {
    const url = `${baseUrl}/api/validateToken`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        if (!response.ok) {
            throw new Error('Failed to validate token');
        }
        const data = await response.json();
        return data.valid;
    } catch (error) {
        handleError(error, 'validating token');
        return false;
    }
}

async function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (token) {
        const isValid = await validateToken(token);
        if (isValid) {
            showCertificates();
            return;
        }
    }
    window.location.href = 'login.html';
}

async function renderForm(certificate = null) {
    const form = document.createElement('form');
    form.id = 'certificateForm';

    function createInputField(field, value, disabled = false) {
        const label = document.createElement('label');
        label.htmlFor = field;
        label.textContent = field + ':';
        form.appendChild(label);

        const input = document.createElement('input');
        input.id = field;
        input.name = field;
        input.value = value;
        input.placeholder = 'Enter ' + field;
        if (field === 'issueDate' || field === 'expiryDate') {
            input.type = 'date';
        } else {
            input.type = 'text';
        }
        if (disabled) {
            input.disabled = true;
        }
        form.appendChild(input);

        form.appendChild(document.createElement('br'));
    }

    if (certificate) {
        for (const field of fieldNames) {
            createInputField(field, certificate[field], field === 'credentialId');
        }
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Update Certificate';
        form.appendChild(submitButton);
    } else {
        for (const field of fieldNames) {
            createInputField(field, '');
        }
        const saveButton = document.createElement('button');
        saveButton.type = 'submit';
        saveButton.textContent = 'Save Certificate';
        form.appendChild(saveButton);
    }

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', closeForm);
    form.appendChild(closeButton);

    form.addEventListener('submit', certificate ? updateCertificate : saveCertificate);

    const userInput = document.getElementById('userInput');
    userInput.innerHTML = '';
    userInput.appendChild(form);
}

function closeForm() {
    const userInput = document.getElementById('userInput');
    userInput.innerHTML = '';
}

async function getFormData() {
    const form = document.getElementById('certificateForm');
    const formData = new FormData(form);
    document.querySelectorAll('input:disabled').forEach(input => {
        formData.append(input.name, input.value);
    });
    const jsonData = Object.fromEntries(formData.entries());
    return jsonData;
}


async function saveCertificate(event) {
    event.preventDefault();
    const formData = await getFormData();
    const jsonData = JSON.stringify(Object.fromEntries(formData));
    if (!validateCertificateFormData(jsonData)) {
        return;
    }
    const token = localStorage.getItem('token');
    const url = `${baseUrl}/api/Employees/certificates`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: jsonData
        });
        if (!response.ok) {
            throw new Error('Failed to save certificate');
        }
        alert('Certificate saved successfully!');
        showCertificates();
    } catch (error) {
        handleError(error, 'saving certificate');
    }
}

function validateCertificateFormData(formData) {
    for (let key of fieldNames) {
        if (!formData[key]) {
            alert(`Please fill in ${key}`);
            return false;
        }
    }
    return true;
}

async function showCertificates() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/api/Employees/certificates`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch certificates');
        }
        const responseData = await response.json();
        const table = convertJsonToTable(responseData.certificates);
        const tableContainer = document.getElementById('table');
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    } catch (error) {
        handleError(error, 'loading certificates');
    }
}

function convertJsonToTable(certificates) {
    if (certificates.length === 0) {
        return "No certificates found";
    }

    const table = document.createElement('table');
    table.id = 'certificates-table';
    table.style.borderSpacing = '10px';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (let key of fieldNames) {
        const th = document.createElement('th');
        th.style.padding = '10px';
        th.textContent = key;
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let certificate of certificates) {
        const row = document.createElement('tr');
        for (let key of fieldNames) {
            const td = document.createElement('td');
            td.style.padding = '10px';
            td.textContent = certificate[key];
            row.appendChild(td);
        }
        if (certificates.length > 0) {
            const editButtonCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', function() {
                editCertificate(row);
            });
            editButtonCell.appendChild(editButton);
            row.appendChild(editButtonCell);

            const deleteButtonCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function() {
                deleteCertificate(row);
            });
            deleteButtonCell.appendChild(deleteButton);
            row.appendChild(deleteButtonCell);
        }
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    return table;
}

async function updateCertificate(event) {
    event.preventDefault();
    const formData = await getFormData();
    console.log(formData);
    if (!validateCertificateFormData(formData)) {
        return;
    }
    const jsonData = JSON.stringify(formData);
    console.log(jsonData);
    const token = localStorage.getItem('token');
    const credentialId = formData.credentialId;
    const url = `${baseUrl}/api/Employees/certificates/${credentialId}`;
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: jsonData
        });
        if (!response.ok) {
            throw new Error('Failed to update certificate');
        }
        alert('Certificate updated successfully!');
        showCertificates();
    } catch (error) {
        handleError(error, 'updating certificate');
    }
}

async function deleteCertificate(row) {
    const credentialId = row.cells[5].innerText;
    const isConfirmed = confirm("Are you sure you want to delete the certificate with Credential ID: " + credentialId);
    if (isConfirmed) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/api/Employees/certificates/${credentialId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete certificate');
            }
            alert('Certificate deleted successfully!');
            showCertificates();
        } catch (error) {
            handleError(error, 'deleting certificate');
        }
    } else {
        console.log("Deletion canceled!");
    }
}

function logout() {
    const isConfirmed = confirm('Are you sure you want to log out?');
    if (isConfirmed) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        alert('Logged out successfully!');
    }
}

