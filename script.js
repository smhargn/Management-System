// Farmer Class
class Farmer {
    constructor(id, name, contact, location) {
        this.id = id;
        this.name = name;
        this.contact = contact;
        this.location = location;
    }
}



window.onload = function() {
    // Upload Data
    loadDataFromLocalStorage();
    loadBlueberryStockFromLocalStorage();
    loadFarmersFromLocalStorage();
    loadOrdersFromLocalStorage();
    loadPurchasesFromLocalStorage();
    loadCustomersFromLocalStorage();
    loadProductCategoriesFromLocalStorage();
    renderPurchases();
    renderOrders();
    renderFarmers();
    renderCustomerTable();
    updateInventoryDisplay();
    updateBlueberryStockDisplay();
    updatePriceDisplay();

};



let farmers = JSON.parse(localStorage.getItem("farmers")) || [];
let purchases = JSON.parse(localStorage.getItem("purchases")) || [];
let customers = JSON.parse(localStorage.getItem("customers")) || [];
let editIndex = null;
const currentDate = new Date();
const day = String(currentDate.getDate()).padStart(2, '0');
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
const year = currentDate.getFullYear();

window.showSection = (sectionId) => {
    document.querySelectorAll("section").forEach(section => {
        section.classList.add("hidden");
    });
    document.getElementById(sectionId).classList.remove("hidden");
};

const farmerForm = document.getElementById("farmerForm");
const farmerTable = document.querySelector("#farmerTable tbody");

const searchInputId = document.querySelector('.searchInputId')
const searchInputName = document.querySelector('.searchInputName')
const searchInputContact = document.querySelector('.searchInputContact')
const searchInputLocation =document.querySelector('.searchInputLocation')
const searchCustomersId = document.querySelector('.search-customer-id');
const searchCustomersName = document.querySelector('.search-customer-name');
const searchCustomersContact = document.querySelector('.search-customer-contact');
const searchButton = document.querySelector('.search-btn');
const searchCustomerButton = document.querySelector('.search-customer-btn');
const exportButton = document.querySelector('.export-farmers-btn')
let products = loadBlueberryStockFromLocalStorage();

let productCategories = {
    frozen: {
        small: { weight: 100, pricePerKg: 14, stock: 0 },
        medium: { weight: 250, pricePerKg: 12, stock: 0 },
        large: { weight: 500, pricePerKg: 10, stock: 0 },
        extraLarge: { weight: 1000, pricePerKg: 8, stock: 0 },
        familyPack: { weight: 2000, pricePerKg: 7, stock: 0 },
        bulkPack: { weight: 5000, pricePerKg: 6.25, stock: 0 },
        premium: { weight: 'custom', pricePerKg: 'Varies', stock: 0 }
    },
    organic: {
        small: { weight: 100, pricePerKg: 13, stock: 0 },
        medium: { weight: 250, pricePerKg: 11, stock: 0 },
        large: { weight: 500, pricePerKg: 10, stock: 0 },
        extraLarge: { weight: 1000, pricePerKg: 9, stock: 0 },
        familyPack: { weight: 2000, pricePerKg: 6, stock: 0 },
        bulkPack: { weight: 5000, pricePerKg: 5, stock: 0 },
        premium: { weight: 'custom', pricePerKg: 'Varies', stock: 0 }
    },
    fresh: {
        small: { weight: 100, pricePerKg: 12, stock: 0 },
        medium: { weight: 250, pricePerKg: 10, stock: 0 },
        large: { weight: 500, pricePerKg: 8.5, stock: 0 },
        extraLarge: { weight: 1000, pricePerKg: 7.5, stock: 0 },
        familyPack: { weight: 2000, pricePerKg: 6, stock: 0 },
        bulkPack: { weight: 5000, pricePerKg: 4.8, stock: 0 },
        premium: { weight: 'custom', pricePerKg: 'Varies', stock: 0 }
    }
};

function validateForm(id, name, contact, location, farmers) {
    if (!id || !/^\d+$/.test(id)) {
        alert("ID must contain only numbers.");
        return false;
    }

    if (farmers.some(farmer => farmer.id === id)) {
        alert("A farmer with this ID already exists.");
        return false;
    }

    if (!name || !/^[a-zA-ZçÇşŞğĞıİüÜöÖ\s]+$/.test(name)) {
        alert("Name cannot contain numbers or special characters. Please enter a valid name.");
        return false;
    }

    if (!contact || contact.length < 10 || contact.length > 11) {
        alert("Contact must be exactly 10 or 11 digits long.");
        return false;
    }

    if (contact.length === 11 || contact[0] === "0") {
        alert("If the contact number has 11 digits, it should not start with 0.");
        return false;
    }

    if (farmers.some(farmer => farmer.contact === contact)) {
        alert("A farmer with this contact number already exists.");
        return false;
    }

    if (!location) {
        alert("Please provide a valid location.");
        return false;
    }

    return true; 
}

farmerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("farmerId").value.trim();
    const name = document.getElementById("farmerName").value.trim();
    const contact = document.getElementById("farmerContact").value.trim();
    const location = document.getElementById("farmerLocation").value.trim();

    // ID doğrulaması (sadece rakamlar)
    if (validateForm(id, name, contact, location,farmers)) {
        console.log("Form is valid.");
    } else {
        console.log("Form is invalid.");
        return;
    }

    const farmer = new Farmer(id, name, contact, location);

    if (editIndex !== null) {
        farmers[editIndex] = farmer; 
        editIndex = null;
    } else {
        farmers.push(farmer); 
    }

    saveFarmersToLocalStorage();
    populateFarmerDropdown();
    renderFarmers();
    farmerForm.reset();
    farmerForm.querySelector("button").textContent = "Save"; 
});

function renderFarmers(filteredFarmers = farmers) {
    const farmerTable = document.getElementById("farmerTable");
    const tableBody = farmerTable.querySelector("tbody");

    tableBody.innerHTML = ""; 

    filteredFarmers.forEach((farmer, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${farmer.id}</td>
            <td>${farmer.name}</td>
            <td>${farmer.contact}</td>
            <td>${farmer.location}</td>
            <td>
                <button class="general-btn" onclick="editFarmer(${index})">Edit</button>
                <button class="general-btn" onclick="deleteFarmer(${index})">Delete</button>
            </td>
        `;
    });
}

// Farmer'ı sil
function deleteFarmer(index) {
    if (confirm("Bu çiftçiyi silmek istediğinizden emin misiniz?")) {
        farmers.splice(index, 1); 
        saveFarmersToLocalStorage(); 
        populateFarmerDropdown();
        renderFarmers(); 
    }
}

// Farmer'ı düzenle
function editFarmer(index) {
    const farmer = farmers[index];
    

    const tableBody = document.querySelector("#farmerTable tbody");
    const tableRow = tableBody.rows[index];


    tableRow.innerHTML = `
        <td><input class="general-input" type="text" value="${farmer.id}" id="editId-${index}" /></td>
        <td><input class="general-input" type="text" value="${farmer.name}" id="editName-${index}" /></td>
        <td><input class="general-input" type="text" value="${farmer.contact}" id="editContact-${index}" /></td>
        <td><input class="general-input" type="text" value="${farmer.location}" id="editLocation-${index}" /></td>
        <td>
            <button class="general-btn" onclick="saveFarmer(${index})">Save</button>
            <button class="general-btn" onclick="cancelEdit(${index})">Cancel</button>
        </td>
    `;
}

function cancelEdit(index) {
    const farmer = farmers[index];

    const tableBody = document.querySelector("#farmerTable tbody");
    const tableRow = tableBody.rows[index]; 

    tableRow.innerHTML = `
        <td>${farmer.id}</td>
        <td>${farmer.name}</td>
        <td>${farmer.contact}</td>
        <td>${farmer.location}</td>
        <td>
            <button class="general-btn" onclick="editFarmer(${index})">Edit</button>
            <button class="general-btn" onclick="deleteFarmer(${index})">Delete</button>
        </td>
    `;
}

function saveFarmer(index) {
    // Düzenlenmiş verileri al
    const updatedFarmer = {
        id: document.getElementById(`editId-${index}`).value,
        name: document.getElementById(`editName-${index}`).value,
        contact: document.getElementById(`editContact-${index}`).value,
        location: document.getElementById(`editLocation-${index}`).value,
    };

    const currentFarmer = farmers[index]; 

    if (
        currentFarmer.id === updatedFarmer.id &&
        currentFarmer.name === updatedFarmer.name &&
        currentFarmer.contact === updatedFarmer.contact &&
        currentFarmer.location === updatedFarmer.location
    ) {
        farmers[index] = updatedFarmer;
        localStorage.setItem("farmers", JSON.stringify(farmers));
        renderFarmers();
        return;
    }

    const isDuplicateId = farmers.some((farmer, i) => farmer.id === updatedFarmer.id && i !== index);

    if (isDuplicateId) {
        alert("This ID is already in use. Please choose a different ID.");
        return;
    }

    const isDuplicateContact = farmers.some((farmer, i) => farmer.contact === updatedFarmer.contact && i !== index);

    if (isDuplicateContact) {
        alert("This contact number is already in use. Please choose a different contact.");
        return;
    }

    if (!updatedFarmer.id || !/^\d+$/.test(updatedFarmer.id)) {
        alert("ID must contain only numbers.");
        return false;
    }


    if (!updatedFarmer.name || !/^[a-zA-ZçÇşŞğĞıİüÜöÖ\s]+$/.test(updatedFarmer.name)) {
        alert("Name cannot contain numbers or special characters. Please enter a valid name.");
        return false;
    }


    if (!updatedFarmer.contact || updatedFarmer.contact.length < 10 || updatedFarmer.contact.length > 11) {
        alert("Contact must be exactly 10 or 11 digits long.");
        return false;
    }


    if (updatedFarmer.contact.length === 11 || updatedFarmer.contact[0] === "0") {
        alert("If the contact number has 11 digits, it should not start with 0.");
        return false;
    }

    if (!updatedFarmer.location) {
        alert("Please provide a valid location.");
        return false;
    }


    farmers[index] = updatedFarmer;

   
    localStorage.setItem("farmers", JSON.stringify(farmers));
    populateFarmerDropdown();


    renderFarmers();
}


searchCustomerButton.addEventListener("click", () => {
    const idSearch = searchCustomersId.value;
    const nameSearch = searchCustomersName.value.trim().toLowerCase();
    const contactSearch = searchCustomersContact.value;


    const filteredCustomers = customers.filter(customer => {
        return (customer.id === idSearch ||
                customer.name.toLowerCase() === nameSearch ||
                customer.contact === contactSearch )
            });


    renderCustomerTable(filteredCustomers);
});

searchButton.addEventListener("click", () => {
    const idSearch = searchInputId.value.trim().toLowerCase();
    const nameSearch = searchInputName.value.trim().toLowerCase();
    const contactSearch = searchInputContact.value.trim().toLowerCase();
    const locationSearch = searchInputLocation.value.trim().toLowerCase();


    const filteredFarmers = farmers.filter(farmer => {
        return (farmer.id.toLowerCase() === idSearch ||
                farmer.name.toLowerCase() === nameSearch ||
                farmer.contact.toLowerCase() === contactSearch ||
                farmer.location.toLowerCase() === locationSearch );
    });


    renderFarmers(filteredFarmers);
});

exportButton.addEventListener("click", () => {
    const bom = "\uFEFF";
    const csvContent = [
        "ID,Name,Contact,Location",
        ...farmers.map(f => `${f.id},${f.name},${f.contact},${f.location}`)
    ].join("\n");

    const csvWithBom = bom + csvContent;
    const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "farmers.csv");
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});


const farmerDropdown = document.getElementById("farmerDropdown");
const blueberryForm = document.getElementById("blueberryForm");
const blueberryQuantityInput = document.getElementById("blueberryQuantity");
const blueberryCategoryDropdown = document.getElementById("blueberryCategoryDropdown");
const blueberryStockDisplay = document.querySelectorAll("#blueberryStock");



function populateFarmerDropdown() {
    farmerDropdown.innerHTML = '<option value="" disabled selected>Choose farmer</option>';
    farmers.forEach(farmer => {
        const option = document.createElement("option");
        option.value = farmer.id;
        option.textContent = `${farmer.name} - ${farmer.location}`;
        farmerDropdown.appendChild(option);
    });
}

function populateBlueberryCategoryDropdown() {
    blueberryCategoryDropdown.innerHTML = '<option value="" disabled selected>Choose Category</option>';


    Object.keys(products).forEach(category => {

        const option = document.createElement("option");
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);

        blueberryCategoryDropdown.appendChild(option);
    });
}


function editPriceBlueberry(index) {
    const category = Object.keys(products)[index];

    const tableBody = document.querySelector("#blueberryStockTable tbody");

    const tableRow = tableBody.rows[index];

  
    tableRow.innerHTML = `
        <td>${category.charAt(0).toUpperCase() + category.slice(1)}</td>
        <td>${products[category].stock.toFixed(2)} kg</td>
        <td>
            <input class="general-input" type="number" id="editPrice-${index}" value="${products[category].price.toFixed(2)}" min="0" step="0.01" />
        </td>
        <td>
            <button class="general-btn" onclick="savePriceBlueberry(${index})">Save</button>
        </td>
    `;
}

function savePriceBlueberry(index) {
    const category = Object.keys(products)[index];
    const newPrice = parseFloat(document.getElementById(`editPrice-${index}`).value);

    if (isNaN(newPrice) || newPrice < 0) {
        alert("Invalid price value!");
        return;
    }

    products[category].price = newPrice;
    saveBlueberryStockToLocalStorage()

    const tableBody = document.querySelector("#blueberryStockTable tbody");
    const tableRow = tableBody.rows[index];

    tableRow.innerHTML = `
        <td>${category.charAt(0).toUpperCase() + category.slice(1)}</td>
        <td>${products[category].stock.toFixed(2)} kg</td>
        <td>${products[category].price.toFixed(2)} $</td>
        <td>
            <button class="general-btn" onclick="editPriceBlueberry(${index})">Edit Price</button>
        </td>
    `;
}

function updateBlueberryStockDisplay() {
    Object.keys(products).forEach(category => {
        const stockElement = document.getElementById(`${category}-stock`);
        const priceElement = document.getElementById(`${category}-price`);

        if (stockElement && priceElement) {
            stockElement.textContent = `${products[category].stock.toFixed(2)} kg`; 
            priceElement.textContent = `${products[category].price.toFixed(2)} $`; 
        }
    });
}

function updateSimpleInventoryDisplay() {
    const tableBody = document.querySelector("#blueberryStock-package tbody");

    if (!tableBody) {
        console.error("Table body not found.");
        return;
    }

    tableBody.innerHTML = "";

    Object.keys(products).forEach(category => {
        const stock = products[category].stock.toFixed(2);

        const row = document.createElement("tr");

        const categoryCell = document.createElement("td");
        categoryCell.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        row.appendChild(categoryCell);

        const stockCell = document.createElement("td");
        stockCell.textContent = `${stock} kg`;
        row.appendChild(stockCell);


        tableBody.appendChild(row);
    });
}

updateSimpleInventoryDisplay();

function formatDate(date) {
// Format: YYYY-MM-DD

    if (!date) return null; 
    const parts = date.split(/[-\/]/); 
    if (parts.length === 3) {
        
        if (parts[0].length === 2 && parts[2].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`; 
        }
    }
    return date; 
}

function formatDate2(date) {
    // DD-MM-YY

    if (!date) return null; 
    const parts = date.split(/[-\/]/); 
    if (parts.length === 3) {

        if (parts[0].length === 4 && parts[2].length === 2) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`; // "DD-MM-YY"
        }

        if (parts[0].length === 2 && parts[2].length === 4) {
            return `${parts[0]}-${parts[1]}-${parts[2]}`; // "DD-MM-YY"
        }
    }
    return date; 
}




// Upload 
populateFarmerDropdown();
populateBlueberryCategoryDropdown();
updateBlueberryStockDisplay();
updateSimpleInventoryDisplay();
checkStockLevels();



function updateTableCategory() {
    
    let selectedCategory = document.getElementById("categorySelectPrice").value;
    const categoryData = productCategories[selectedCategory];

    if (categoryData) {
        const rows = document.querySelectorAll("#pricingTable tbody tr");
        rows.forEach(row => {
            const packageSize = row.querySelector(".price").getAttribute("data-category");
            const priceCell = row.querySelector(".price");

            if (categoryData[packageSize]) {
                const price = categoryData[packageSize].pricePerKg;
                priceCell.textContent = `$${price}`;
            } else {
                priceCell.textContent = "N/A";
            }
        });
    } else {
        console.error(`No data found for category "${selectedCategory}".`);
    }
}


function editPrice(button) {
    const selectedCategory = document.getElementById("categorySelectPrice").value; 
    const packageSize = button.getAttribute('data-category'); 

    const categoryData = productCategories[selectedCategory];
    if (categoryData && categoryData[packageSize]) {
        const currentPrice = categoryData[packageSize].pricePerKg;


        document.getElementById("newPrice").value = currentPrice === "Varies" ? "" : currentPrice;
        document.getElementById("editPriceModal").style.display = 'block';
        document.getElementById("editPriceModal").setAttribute('data-category', selectedCategory);
        document.getElementById("editPriceModal").setAttribute('data-packageSize', packageSize);
    } else {
        console.error(`No data found for category "${selectedCategory}" and package size "${packageSize}".`);
    }
}

function savePrice() {
    const modal = document.getElementById("editPriceModal");
    const selectedCategory = modal.getAttribute('data-category');
    const packageSize = modal.getAttribute('data-packageSize');
    const newPriceInput = document.getElementById("newPrice").value.trim();

    const newPrice = parseInt(newPriceInput, 10); 

    if (isNaN(newPrice) || newPrice <= 0) {
        alert("Please enter a valid positive integer price.");
        return;
    }

    if (selectedCategory && packageSize) {
        const categoryData = productCategories[selectedCategory];
        if (categoryData && categoryData[packageSize]) {
            categoryData[packageSize].pricePerKg = newPrice;
            saveProductCategoriesToLocalStorage();

            const priceElement = document.querySelector(`.price[data-category="${packageSize}"]`);
            if (priceElement) {
                priceElement.textContent = `$${newPrice}`;
            }

            modal.style.display = 'none';
        } else {
            alert("Invalid category or package size.");
        }
    } else {
        alert("Please enter a valid price.");
    }
}

function closeModal() {
    document.getElementById("editPriceModal").style.display = 'none';
}

function cancelEdit() {
    document.getElementById("editPriceModal").style.display = 'none';
}

const premiumChange = document.getElementById("productCategory");
const premiumWeightInput = document.getElementById("premiumWeightInput");

premiumChange.addEventListener('change', function() {

    if (premiumChange.value === 'premium') {
        premiumWeightInput.style.display = 'block'; 
    } else {
        premiumWeightInput.style.display = 'none'; 
    }
});

const categorizeForm = document.getElementById('categorizeForm');

categorizeForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const category = document.getElementById("productCategory").value;
    const quantity = parseInt(document.getElementById("productQuantity").value.trim());
    const blueberryPackage = document.getElementById("blueberryCategory").value;
    const categoryData = productCategories[blueberryPackage][category];

    if (!quantity || quantity <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    if (category === 'premium') {
        const customWeight = parseFloat(document.getElementById("premiumWeight")?.value.trim());
        if (isNaN(customWeight) || customWeight <= 0) {
            alert("Please enter a valid weight.");
            return;
        }
        productCategories[blueberryPackage].premium.weight = customWeight;
        categoryData.weight = customWeight; // Update Premium
    }


    const requiredBlueberryAmount = (categoryData.weight / 1000) * quantity; 
    if (products[blueberryPackage].stock < requiredBlueberryAmount) {
        alert("Not enought blueberry sotck.");
        return;
    }

  
    products[blueberryPackage].stock -= requiredBlueberryAmount; 
    categoryData.stock += quantity; 
    
    saveProductCategoriesToLocalStorage();
    saveBlueberryStockToLocalStorage();
    updateBlueberryStockDisplay(); 
    updateSimpleInventoryDisplay();
    updateInventoryDisplay();
    alert(`Succesfully ${quantity} ${category} packaged.`);
    checkStockLevels();
});


function updatePriceDisplay() {

    const selectedCategory = document.getElementById('categorySelectPrice').value;
    const categoryData = productCategories[selectedCategory];

    Object.keys(categoryData).forEach(packageSize => {
        const priceElement = document.querySelector(`.price[data-category="${packageSize}"]`);
        if (priceElement) {
            const pricePerKg = categoryData[packageSize].pricePerKg;
            priceElement.innerText = typeof pricePerKg === 'number' ? `$${pricePerKg}` : pricePerKg;
        }
    });
}


function updateInventoryDisplay() {
    // Default Frozen
    const dropdown = document.getElementById('categorySelect');
    const selectedCategory = dropdown.value || 'frozen'; 
    const categoryData = productCategories[selectedCategory];

    Object.keys(categoryData).forEach(packageSize => {
        const stockElement = document.getElementById(`${packageSize}Stock`);
        if (stockElement) {
            // if stock value < 5 svg icon
            const stockValue = categoryData[packageSize].stock;
            if (stockValue < 5) {
                stockElement.innerHTML = `${stockValue} <span style="margin-left: 5px;">  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 16px; height: 16px; color: red;">
                    <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
                </svg>`;
            } else {
                stockElement.innerText = stockValue;
            }
        }
    });
}


/////////////// ************************************* PURCHASES AND CUSTOMER ***************** PURCHASES AND CUSTOMERS ************************************* //////////////////////
/////////////// ************************************* PURCHASES AND CUSTOMER ***************** PURCHASES AND CUSTOMERS ************************************* //////////////////////
/////////////// ************************************* PURCHASES AND CUSTOMER ***************** PURCHASES AND CUSTOMERS ************************************* //////////////////////
/////////////// ************************************* PURCHASES AND CUSTOMER ***************** PURCHASES AND CUSTOMERS ************************************* //////////////////////
/////////////// ************************************* PURCHASES AND CUSTOMER ***************** PURCHASES AND CUSTOMERS ************************************* //////////////////////
/////////////// ************************************* PURCHASES AND CUSTOMER ***************** PURCHASES AND CUSTOMERS ************************************* //////////////////////
/////////////// ************************************* PURCHASES AND CUSTOMER ***************** PURCHASES AND CUSTOMERS ************************************* //////////////////////
/////////////// ************************************* PURCHASES AND CUSTOMER ***************** PURCHASES AND CUSTOMERS ************************************* //////////////////////
/////////////// ************************************* PURCHASES AND CUSTOMER ***************** PURCHASES AND CUSTOMERS ************************************* //////////////////////

blueberryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const selectedFarmerId = farmerDropdown.value;
    const selectedCategory = blueberryCategoryDropdown.value;
    const quantity = parseFloat(blueberryQuantityInput.value);

    const dateInput = document.getElementById("blueberryDate").value;

    if (!dateInput) {
        console.error("Choose date!");
        return;
    }

    // Convert Date
    const [year, month, day] = dateInput.split("-"); //  YYYY-MM-DD
    const purchaseDate = `${day}-${month}-${year}`;

    if (!selectedFarmerId || !selectedCategory || isNaN(quantity) || quantity <= 0) {
        alert("Choose valid farmer.");
        return;
    }


    if (quantity > 500) {
        alert("Quantity cannot be higher than 500kg");
        return;
    }

    const farmer = farmers.find(f => f.id === selectedFarmerId);
    const totalPrice = quantity * products[selectedCategory].price;
    const lastPurchaseId = purchases.length > 0 ? purchases[purchases.length - 1].purchaseId : 0;
    const newPurchaseId = lastPurchaseId + 1;

    const purchase = {
        purchaseId: newPurchaseId,
        farmerId: farmer.id,
        farmerName: farmer.name,
        date: purchaseDate,
        category: selectedCategory,
        quantity: quantity,
        priceperkg: products[selectedCategory].price,
        totalPrice: totalPrice
    };

    purchases.push(purchase);
    renderPurchases();
    products[selectedCategory].stock += quantity;
    products[selectedCategory].restockDate = calculateNextRestockDate();
    saveBlueberryStockToLocalStorage();
    savePurchasesToLocalStorage();

    updateBlueberryStockDisplay();
    updateSimpleInventoryDisplay();
    checkStockLevels();

    alert(`Successfully ${quantity} kg ${selectedCategory} blueberry added to stock`);

    // Reset Form
    blueberryForm.reset();
});

// Stock level checking
function checkStockLevels() {

    const nav = document.querySelector('.alerts');
    nav.innerHTML = ''; 

    Object.keys(products).forEach(category => {
        if (products[category].stock <= 10) {
            const alertMessage = document.createElement('p');
            alertMessage.innerHTML = `
                <div class="alert">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 20px; height: 20px;">
                    <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
                </svg>
                <strong>${category.charAt(0).toUpperCase() + category.slice(1)} low stock level !</strong>
                <br>Restock Date Planned : ${products[category].restockDate}
                </div>
            `;
            nav.appendChild(alertMessage);
        }
    });
}

function calculateNextRestockDate() {
    const today = new Date();
    today.setDate(today.getDate() + 7); // 1 Week
    return `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
}


function generateInventoryReport() {
    let report = "Envanter Report:\n";
    Object.keys(products).forEach(category => {
        report += `${category.charAt(0).toUpperCase() + category.slice(1)} - Stok: ${products[category].stock} kg, Price: ${products[category].price} TL/kg, Storage : ${products[category].storageLocation}, Restock Date: ${products[category].restockDate}\n`;
    });
    return report;
}

function forecastDemand(salesData, timeframe = "weekly") {
    const forecast = {};
    salesData.forEach(sale => {
        const category = sale.category;
        if (!forecast[category]) {
            forecast[category] = 0;
        }
        forecast[category] += sale.quantity;
    });

    Object.keys(forecast).forEach(category => {
        console.log(`${category.charAt(0).toUpperCase() + category.slice(1)}: ${forecast[category]} kg`);
    });

    return forecast;
}

function notifyRestockingSchedule() {
    Object.keys(products).forEach(category => {
        console.log(`Reminder: ${category.charAt(0).toUpperCase() + category.slice(1)} için yeniden stoklama ${products[category].restockDate} tarihinde planlanmıştır.`);
    });
}

document.getElementById("generateReportButton").addEventListener("click", function() {
    const report = generateInventoryReport();
    document.getElementById("reportContainer").innerHTML = `<p>${report.replace(/\n/g, '<br>')}</p>`;
});




document.getElementById('categorySelect').addEventListener('change', updateInventoryDisplay);
document.getElementById('categorySelectPrice').addEventListener('change', updatePriceDisplay);
let purchaseId = 1; 

const purchaseFarmerId = document.getElementById("purchaseFarmerId");
farmers.forEach(farmer => {
    const option = document.createElement("option");
    option.value = farmer.id;
    option.textContent = farmer.name;
    purchaseFarmerId.appendChild(option);
});

const purchaseCategoryId = document.getElementById("purchaseCategoryId");
const allOption = document.createElement("option");
allOption.value = ""; 
allOption.textContent = "All Categories"; 
purchaseCategoryId.appendChild(allOption);

Object.keys(products).forEach(productKey => {
    const option = document.createElement("option");
    option.value = productKey; 
    option.textContent = productKey.charAt(0).toUpperCase() + productKey.slice(1); 
    purchaseCategoryId.appendChild(option);
});

function formatDateToInput(dateString) {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
}

//  dd-MM-yyyy
function formatDateForDisplay(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
}

function savePurchase(purchaseId) {
    const updatedQuantity = parseFloat(document.getElementById(`editQuantityInput-${purchaseId}`).value);
    const updatedDate = document.getElementById(`editDateInput-${purchaseId}`).value;

    if (isNaN(updatedQuantity) || updatedQuantity <= 0) {
        alert("Enter valid amount");
        return;
    }

    const purchase = purchases.find(p => p.purchaseId === purchaseId);
    if (purchase) {
        const category = purchase.category.toLowerCase();
        const oldQuantity = purchase.quantity;
        const quantityDifference = updatedQuantity - oldQuantity;

        if (products[category]) {
            products[category].stock += quantityDifference;
        } else {
            console.error(`No category found: ${category}`);
        }

        purchase.quantity = updatedQuantity;
        purchase.date = updatedDate;

        const pricePerKg = products[category]?.price || 0;
        purchase.priceperkg = pricePerKg;
        purchase.totalPrice = updatedQuantity * pricePerKg;

        updatePurchaseTableRow(purchaseId, updatedQuantity, updatedDate, pricePerKg, purchase.totalPrice);
        updateBlueberryStockDisplay();
        updateSimpleInventoryDisplay();
        savePurchasesToLocalStorage();
        loadPurchasesFromLocalStorage();
        checkStockLevels();
        renderPurchases();
    } else {
        alert("No purchase find.");
    }
}

function updatePurchaseTableRow(purchaseId, updatedQuantity, updatedDate, pricePerKg, totalPrice) {
    const rows = document.querySelectorAll("#purchaseTable tbody tr");
    rows.forEach(row => {
        const rowPurchaseId = parseInt(row.cells[0].innerText, 10);
        if (rowPurchaseId === purchaseId) {
            const quantityCell = row.cells[5];
            quantityCell.innerText = updatedQuantity;

            const dateCell = row.cells[3];
            dateCell.innerText = formatDate2(updatedDate);

            const pricePerKgCell = row.cells[4];
            pricePerKgCell.innerText = pricePerKg;

            const totalPriceCell = row.cells[6];
            totalPriceCell.innerText = totalPrice.toFixed(2);

            const actionCell = row.cells[8];
            actionCell.innerHTML = `<button class="general-btn" onclick="editPurchase(${purchaseId})">Edit</button>
                                    <button class="general-btn" onclick="deletePurchase(${purchaseId})">Delete</button>`;
        }
    });
}

function deletePurchase(purchaseId) {
    purchases = purchases.filter(p => p.purchaseId !== purchaseId);
    renderPurchases();
}

const purchaseForm = document.getElementById("purchaseForm");
const purchaseDate = document.getElementById("purchaseDate");

const allFarmerOption = document.createElement("option");
allFarmerOption.value = ""; 
allFarmerOption.textContent = "All Farmer"; 
purchaseFarmerId.appendChild(allFarmerOption);

const exportPurchasesButton = document.getElementById("exportPurchasesButton");

exportPurchasesButton.addEventListener("click", () => {
    // Filter export
    const selectedFarmerId = purchaseFarmerId.value;
    const startDate = document.getElementById("startDate").value; 
    const endDate = document.getElementById("endDate").value; 

    const startDateNormalized = startDate ? formatDate(startDate) : null;
    const endDateNormalized = endDate ? formatDate(endDate) : null;

    const filteredPurchases = purchases.filter(purchase => {
        const farmerMatch = selectedFarmerId ? purchase.farmerId === selectedFarmerId : true;
        const selectedCategory = purchaseCategoryId.value; 
        const categoryMatch = selectedCategory ? purchase.category === selectedCategory : true;

        const purchaseDate = formatDate(purchase.date);
        const dateMatch = (!startDateNormalized || purchaseDate >= startDateNormalized) &&
                          (!endDateNormalized || purchaseDate <= endDateNormalized);

        return farmerMatch && dateMatch && categoryMatch;
    });

    // CSV headers and rows
    const headers = ["Purchase ID,Farmer ID,Farmer Name,Date,Category,Quantity,Price Per Kg,Total Price"];
    const rows = filteredPurchases.map(purchase =>
        `${purchase.purchaseId},${purchase.farmerId},${purchase.farmerName},${purchase.date},${purchase.category},${purchase.quantity},${purchase.priceperkg},${purchase.totalPrice}`
    );

    
    const bom = "\uFEFF"; 
    const csvContent = [headers.join("\n"), ...rows].join("\n");
    const csvWithBom = bom + csvContent;

    const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Filtered_Purchases.csv");
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});


purchaseForm.addEventListener("submit", (event) => {
    event.preventDefault(); 

    const selectedFarmerId = purchaseFarmerId.value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value; 

    const startDateNormalized = startDate ? formatDate(startDate) : null;
    const endDateNormalized = endDate ? formatDate(endDate) : null;

    const filteredPurchases = purchases.filter(purchase => {
        const farmerMatch = selectedFarmerId ? purchase.farmerId === selectedFarmerId : true;
        const selectedCategory = purchaseCategoryId.value; 
        const categoryMatch = selectedCategory ? purchase.category === selectedCategory : true;

        const purchaseDate = formatDate(purchase.date);
        const dateMatch = (!startDateNormalized || purchaseDate >= startDateNormalized) &&
                            (!endDateNormalized || purchaseDate <= endDateNormalized);

        return farmerMatch && dateMatch && categoryMatch;
    });

    renderPurchases(filteredPurchases); 
    calculateAndDisplayTotals(filteredPurchases);
});

document.getElementById("clearFilterButton").addEventListener("click", () => {
    document.getElementById("purchaseFarmerId").value = ""; 
    document.getElementById("startDate").value = ""; 
    document.getElementById("endDate").value = ""; 
    renderPurchases(); 
    calculateAndDisplayTotals(purchases);
});

let sortOrder = 1; // 1 for ascending, -1 for descending

function sortPurchasesTable(column) {
    purchases.sort((a, b) => {
        if (column === "date") {

            return sortOrder * (new Date(a[column]) - new Date(b[column]));
        } else if (typeof a[column] === "number") {

            return sortOrder * (a[column] - b[column]);
        } else {

            return sortOrder * a[column].localeCompare(b[column]);
        }
    });
    sortOrder *= -1;
    renderPurchases();
}


function renderPurchases(filteredPurchases = purchases) {
    const purchaseTableBody = document.querySelector("#purchaseTable tbody");
    purchaseTableBody.innerHTML = ""; 

    filteredPurchases.forEach(purchase => {
        const row = document.createElement("tr");
        
        row.innerHTML = `
            <td>${purchase.purchaseId}</td>
            <td>${purchase.farmerId}</td>
            <td>${purchase.farmerName}</td>
            <td>${purchase.date}</td>
            <td>${purchase.category}</td>
            <td>${purchase.quantity}</td>
            <td>${purchase.priceperkg}</td>
            <td>${purchase.totalPrice}</td>
            <td>
                <button class="general-btn" onclick="editPurchase(${purchase.purchaseId})">Edit</button>
                <button class="general-btn" onclick="deletePurchase(${purchase.purchaseId})">Delete</button>
            </td>
        `;
        
        purchaseTableBody.appendChild(row);
    });
}

function calculateAndDisplayTotals(filteredPurchases) {

    const totalQuantity = filteredPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
    const totalPrice = filteredPurchases.reduce((sum, purchase) => sum + purchase.totalPrice, 0);

    document.getElementById("totalQuantity").textContent = totalQuantity;
    document.getElementById("totalPrice").textContent = totalPrice.toFixed(2);
}

const generateReportButton = document.getElementById("generate-sales-report");
const salesReportDiv = document.getElementById("salesReport");

function populateCustomerSelect(dropdownId) {
    const customerSelect = document.getElementById(dropdownId);

    customerSelect.innerHTML = `
    <option value="all">All Customers</option>`

    const savedCustomers = localStorage.getItem("customers");
    let customers = [];

    if (savedCustomers) {
        customers = JSON.parse(savedCustomers); 
    } else {

        localStorage.setItem("customers", JSON.stringify(customers)); 
    }

    customers.forEach(customer => {
        const option = document.createElement("option");
        option.value = customer.name;
        option.textContent = customer.name;
        customerSelect.appendChild(option);
    });

    customerSelect.addEventListener("change", updateCustomerStatistics);
}
populateCustomerSelect('customerSelect');
populateCustomerSelect('customerSelect-order');


document.getElementById("customerSelect").addEventListener("change", (event) => {
    const customerId = event.target.value;
    const customer = customers.find(c => c.id == customerId);
    
    if (customer) {
        document.getElementById("customerContact").value = customer.contact;
    }
});


function updateCustomerStatistics() {
    const customerName = document.getElementById("customerSelect").value;
    const customer = customers.find(c => c.name === customerName);
    const customerStatisticsTable = document.getElementById("customerStatisticsTable").querySelector("tbody");

    customerStatisticsTable.innerHTML = ""; 

    if (customer) {
        Object.keys(customer.statistics).forEach(category => {
            let totalPrice = 0;

            const subStats = Object.entries(customer.statistics[category])
                .map(([size, value]) => {
                    const product = productCategories[category][size];

                    let price = 0;
                    if (product.weight !== 'custom' && product.pricePerKg !== 'Varies') {
                        price = product.weight / 1000 * product.pricePerKg * value; 
                        totalPrice += price;
                    }

                    return `${size}: ${value} ($${price.toFixed(2)})`; 
                })
                .join(", ");


            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${category}</td>
                <td>${subStats}</td>
                <td>$${totalPrice.toFixed(2)}</td> <!-- Total Price Sütunu -->
            `;
            customerStatisticsTable.appendChild(row);
        });
    }
}


document.getElementById("addCustomerButton").addEventListener("click", () => {
    const customerName = document.getElementById("customerName").value.trim();
    const customerContact = document.getElementById("customerContact").value.trim();
    const customerAddress = document.getElementById("customerAddress").value.trim();

    const lastCustomerId = customers.length > 0 ? parseInt(customers[customers.length - 1].id, 10) : 0; 
    const newCustomerId = lastCustomerId + 1;

    const nameRegex = /^[a-zA-ZçÇşŞğĞıİüÜöÖ\s]+$/;
    if (!customerName || !nameRegex.test(customerName)) {
        alert("Name cannot contain numbers or special characters. Please enter a valid name.");
        return;
    }

    if (!customerContact || customerContact.length < 10 || customerContact.length > 11) {
        alert("Contact must be exactly 10 or 11 digits long.");
        return;
    }else if (customerContact.length === 11 || customerContact[0] === "0") {
        alert("it should not start with 0.");
        return;
    }

    const newCustomer = {
        id: newCustomerId,  
        name: customerName,
        contact: customerContact,
        address: customerAddress,
        statistics: {
            frozen: { small: 0, medium: 0, large: 0, extraLarge: 0, familyPack: 0, bulkPack: 0, premium: 0 },
            organic: { small: 0, medium: 0, large: 0, extraLarge: 0, familyPack: 0, bulkPack: 0, premium: 0 },
            fresh: { small: 0, medium: 0, large: 0, extraLarge: 0, familyPack: 0, bulkPack: 0, premium: 0 }
        }
    };

    customers.push(newCustomer);

    saveCustomersToLocalStorage();
    populateCustomerSelect('customerSelect');
    populateCustomerSelect('customerSelect-order');
    renderCustomerTable();

    document.getElementById("customerName").value = '';
    document.getElementById("customerContact").value = '';
    document.getElementById("customerAddress").value = '';
});

function renderCustomerTable(customersToRender = customers) {
    const tbody = document.querySelector('#customerTable tbody');
    tbody.innerHTML = ''; 

    customersToRender.forEach((customer, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.contact}</td>
            <td>${customer.address}</td>
            <td>
                <button class="general-btn" onclick="editCustomer(${index})">Edit</button>
                <button class="general-btn" onclick="deleteCustomer(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function cancelEdit(index) {
    renderCustomerTable(); 
}

function deleteCustomer(index) {
    customers.splice(index, 1);

    saveCustomersToLocalStorage();
    populateCustomerSelect('customerSelect');
    populateCustomerSelect('customerSelect-order');

    renderCustomerTable();
}


function editCustomer(index) {
    const customer = customers[index];

    if (!customer) {
        alert('Customer not found!');
        return;
    }


    const tableBody = document.querySelector("#customerTable tbody");
    const tableRow = tableBody.rows[index];

    tableRow.innerHTML = `
        <td><input class="general-input" type="text" value="${customer.id}" id="editId-${index}" readonly /></td>
        <td><input class="general-input" type="text" value="${customer.name}" id="editName-${index}" /></td>
        <td><input class="general-input" type="text" value="${customer.contact}" id="editContact-${index}" /></td>
        <td><input class="general-input" type="text" value="${customer.address}" id="editAddress-${index}" /></td>
        <td>
            <button class="general-btn" onclick="saveCustomer(${index})">Save</button>
            <button class="general-btn" onclick="cancelEdit(${index})">Cancel</button>
        </td>
    `;
}


function saveCustomer(index) {
    const updatedCustomer = {
        id: document.getElementById(`editId-${index}`).value,
        name: document.getElementById(`editName-${index}`).value,
        contact: document.getElementById(`editContact-${index}`).value,
        address: document.getElementById(`editAddress-${index}`).value,
        statistics: customers[index].statistics
    };

    const isIdTaken = customers.some(customer => customer.id === updatedCustomer.id && customer.id !== customers[index].id);
    const isContactTaken = customers.some(customer => customer.contact === updatedCustomer.contact && customer.contact !== customers[index].contact);

    if (isIdTaken) {
        alert("ID already exists. Please use a unique ID.");
        return; 
    }

    if (isContactTaken) {
        alert("Contact already exists. Please use a unique contact.");
        return; 
    }

    const nameRegex = /^[a-zA-ZçÇşŞğĞıİüÜöÖ\s]+$/;
    if (!updatedCustomer.name || !nameRegex.test(updatedCustomer.name)) {
        alert("Name cannot contain numbers or special characters. Please enter a valid name.");
        return;
    }

    if (!updatedCustomer.contact || updatedCustomer.contact.length < 10 || updatedCustomer.contact.length > 11) {
        alert("Contact must be exactly 10 or 11 digits long.");
        return;
    } else if (updatedCustomer.contact[0] === "0") {
        alert("Contact should not start with 0.");
        return;
    }

    customers[index] = updatedCustomer;

    saveCustomersToLocalStorage();
    populateCustomerSelect('customerSelect');
    populateCustomerSelect('customerSelect-order');

    renderCustomerTable();
}

document.getElementById('exportCustomerButton').addEventListener('click', () => {
    exportToCSV(customers);
});

function exportToCSV(customers) {

    const headers = ["ID", "Name", "Contact", "Address"];
    const rows = customers.map(customer => [
        customer.id,
        customer.name,
        customer.contact,
        customer.address
    ]);


    const csvContent = [
        headers.join(","),  
        ...rows.map(row => row.join(","))
    ].join("\n");


    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });

 
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link);


    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}




//// **************************** ORDER FORM ORDER FORM ORDER FORM ORDER FORM ************************************************************** ////////////////////////
//// **************************** ORDER FORM ORDER FORM ORDER FORM ORDER FORM ************************************************************** ////////////////////////
//// **************************** ORDER FORM ORDER FORM ORDER FORM ORDER FORM ************************************************************** ////////////////////////
//// **************************** ORDER FORM ORDER FORM ORDER FORM ORDER FORM ************************************************************** ////////////////////////
//// **************************** ORDER FORM ORDER FORM ORDER FORM ORDER FORM ************************************************************** ////////////////////////
//// **************************** ORDER FORM ORDER FORM ORDER FORM ORDER FORM ************************************************************** ////////////////////////
//// **************************** ORDER FORM ORDER FORM ORDER FORM ORDER FORM ************************************************************** ////////////////////////
//// **************************** ORDER FORM ORDER FORM ORDER FORM ORDER FORM ************************************************************** ////////////////////////

let orders = [];
let orderId = 1; 

const orderForm = document.getElementById("orderForm");
const ordersTable = document.querySelector("#ordersTable tbody");

orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const customerName = document.getElementById("customerSelect").value;
    const productCategory = document.getElementById("packageOrder").value.trim();
    const blueberryCategory = document.getElementById("blueberryCategoryOrder").value.trim();
    const quantityOrdered = parseInt(document.getElementById("quantityOrdered").value);

    const lastOrderId = orders.length > 0 ? orders[orders.length - 1].orderId : 0;
    const newOrderId = lastOrderId + 1;

    const dateInput = document.getElementById("orderDate").value;

    if (!dateInput) {
        console.error("Choose date");
        return;
    }

    // Convert day
    const [year, month, day] = dateInput.split("-"); // yyyy-mm-dd
    const orderDate = `${day}-${month}-${year}`;

    if (!customerName) {
        alert("Please select a customer.");
        return;
    }

    const customer = customers.find(c => c.name == customerName);
    
    if (!productCategory || !blueberryCategory || !quantityOrdered) {
        alert("Please fill in all fields.");
        return;
    }

    if (productCategories[blueberryCategory][productCategory].stock < quantityOrdered) {
        alert("Not enough stock to fulfill this order.");
        return;
    }

    const unitPrice = productCategories[blueberryCategory][productCategory].pricePerKg;
    const totalPrice = productCategories[blueberryCategory][productCategory].weight / 1000 * unitPrice * quantityOrdered; 

    
    const order = {
        orderId: newOrderId, 
        customerName: customer.name,
        customerContact: customer.contact,
        productCategory,
        blueberryCategory,
        orderDate,
        quantityOrdered,
        totalPrice,
        status: "Pending"
    };

    orders.push(order);
    saveOrdersToLocalStorage();
    renderOrders();

    if (customer.statistics[blueberryCategory] && customer.statistics[blueberryCategory][productCategory] !== undefined) {
        customer.statistics[blueberryCategory][productCategory] += quantityOrdered;
    } else {
        alert("Invalid Category.");
        return;
    }

    saveCustomersToLocalStorage();
    updateInventory(blueberryCategory, productCategory, quantityOrdered);
    updateCustomerStatistics(); 
});


function applyOrderFilters() {
    const customerFilter = document.getElementById("customerSelect-order").value.trim();
    const categoryFilter = document.getElementById("order-category-select").value.trim();
    const statusFilter = document.getElementById("order-status-select").value.trim();
    const packageFilter = document.getElementById("order-package-select").value.trim();

    const startDate = document.getElementById("order-start-date").value; 
    const endDate = document.getElementById("order-end-date").value; 

    const filteredOrders = orders.filter(order => {
        const matchesCustomer = customerFilter === "all" || (customerFilter ? order.customerName.includes(customerFilter) : true);
        const matchesCategory = categoryFilter === "all" || (categoryFilter ? order.blueberryCategory.includes(categoryFilter) : true);
        const matchesPackage = packageFilter === "all" ||  (packageFilter ? order.productCategory.includes(packageFilter) : true);

        const startDateNormalized = startDate ? formatDate2(startDate) : null;
        const endDateNormalized = endDate ? formatDate2(endDate) : null;

        const matchesStatus = statusFilter === "allStatus" || 
                                (statusFilter ? order.status.includes(statusFilter) : true);

        const orderDate = formatDate2(order.orderDate);
        const matchesDate = (!startDateNormalized || orderDate >= startDateNormalized) &&
                            (!endDateNormalized || orderDate <= endDateNormalized);

        return matchesCustomer && matchesCategory && matchesDate && matchesStatus && matchesPackage;
    });

    renderOrders(filteredOrders);
}

let sortDirection = 1;
let lastSortedColumn = null;

function sortOrdersTable(columnKey) {
    if (lastSortedColumn === columnKey) {
        sortDirection *= -1;
    } else {
        sortDirection = 1; 
        lastSortedColumn = columnKey;
    }

    const sortedOrders = [...orders].sort((a, b) => {
        const valueA = a[columnKey];
        const valueB = b[columnKey];

        if (typeof valueA === "number" && typeof valueB === "number") {
            return (valueA - valueB) * sortDirection;
        }

        if (typeof valueA === "string" && typeof valueB === "string") {
            return valueA.localeCompare(valueB) * sortDirection;
        }

        if (columnKey === "orderDate") {
            return new Date(valueA) - new Date(valueB) * sortDirection;
        }

        return 0;
    });

    renderOrders(sortedOrders);
}

function renderOrders(filteredOrders = orders) {
    const ordersTable = document.querySelector("#ordersTable tbody");
    const customerName = document.getElementById("customerSelect-order").value; 
    const blueberryCategory = document.getElementById("order-category-select").value; 
    const productCategory = document.getElementById("order-package-select").value;

    ordersTable.innerHTML = ""; 

    const displayedOrders = filteredOrders.filter(order => {
        const matchesCustomer = customerName === "all" || order.customerName === customerName;
        const matchesBlueberryCategory = blueberryCategory === "all" || order.blueberryCategory === blueberryCategory;
        const matchesProductCategory = productCategory === "all" || order.productCategory === productCategory;
        return matchesCustomer && matchesBlueberryCategory && matchesProductCategory;
    });

    displayedOrders.forEach(order => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.customerName}</td>
            <td>${order.orderDate}</td>
            <td>${order.blueberryCategory}</td>
            <td>${order.productCategory}</td>
            <td>${order.quantityOrdered}</td>
            <td>${order.totalPrice}</td>
            <td>${order.status}</td>
            <td>
                <button class="general-btn" onclick="updateOrderStatus(${order.orderId})">Update Status</button>
            </td>
        `;
        ordersTable.appendChild(row);
    });

    renderSummary(displayedOrders);
}

function renderSummary(displayedOrders) {
    const summaryData = {};

    displayedOrders.forEach(order => {
        if (!summaryData[order.blueberryCategory]) {
            summaryData[order.blueberryCategory] = {};
        }
        if (!summaryData[order.blueberryCategory][order.productCategory]) {
            summaryData[order.blueberryCategory][order.productCategory] = {
                totalQuantity: 0,
                totalRevenue: 0
            };
        }
        summaryData[order.blueberryCategory][order.productCategory].totalQuantity += order.quantityOrdered;
        summaryData[order.blueberryCategory][order.productCategory].totalRevenue += order.totalPrice;
    });

    const ordersTable = document.querySelector("#ordersTable");
    let footer = document.querySelector("#ordersTable tfoot");

    if (!footer) {
        footer = document.createElement("tfoot");
        ordersTable.appendChild(footer);
    }

    footer.innerHTML = "";
    for (const [category, products] of Object.entries(summaryData)) {
        footer.innerHTML += `<tr><td colspan="9"><strong>${category} Summary</strong></td></tr>`;
        for (const [product, data] of Object.entries(products)) {
            footer.innerHTML += `
                <tr>
                    <td colspan="4">${product}</td>
                    <td>Total Quantity: ${data.totalQuantity}</td>
                    <td>Total Revenue: ${data.totalRevenue.toFixed(2)}</td>
                    <td colspan="3"></td>
                </tr>
            `;
        }
    }
}

document.getElementById("customerSelect-order").addEventListener("change", () => renderOrders());
document.getElementById("order-category-select").addEventListener("change", () => renderOrders());
document.getElementById("order-package-select").addEventListener("change", () => renderOrders());

let currentOrderId = null; 

window.updateOrderStatus = (orderId) => {
    currentOrderId = orderId; 
    document.getElementById("updateStatusModal").style.display = "block";
    document.getElementById("modalOverlay").style.display = "block";
};

function closeModal() {
    currentOrderId = null; 
    document.getElementById("updateStatusModal").style.display = "none";
    document.getElementById("modalOverlay").style.display = "none";
}


function updateStatus(newStatus) {
    if (currentOrderId !== null) {
        const order = orders.find(o => o.orderId === currentOrderId); 
        if (order) {
            order.status = newStatus; 
            saveOrdersToLocalStorage();
            renderOrders(); 
            closeModal(); 
        }
    }
}


function updateInventory(category, subCategory, quantity) {
    if (!productCategories[category]) {
        alert("invalid category");
        return;
    }
    
    if (!productCategories[category][subCategory]) {
        alert("invalid category");
        return;
    }

    const currentStock = productCategories[category][subCategory].stock;
    if (currentStock >= quantity) {
        productCategories[category][subCategory].stock -= quantity;

        updateInventoryDisplay();
        saveProductCategoriesToLocalStorage();
        alert(`Successfully ${quantity}  ${subCategory} (${category}) stock updated..`);
    } else {
        alert("Not Enought Stock");
        return;
    }
}

function exportOrdersToCSV() {
    const table = document.getElementById("ordersTable");
    const rows = table.querySelectorAll("tr");
    let csvContent = "\uFEFF"; // UTF-8 BOM chracter

    // Add headers
    const headers = Array.from(rows[0].querySelectorAll("th")).map(th => th.textContent.trim());
    csvContent += headers.join(",") + "\n";

    // Add rows
    Array.from(rows)
        .slice(1) // Skip header row
        .forEach(row => {
            const cells = Array.from(row.querySelectorAll("td")).map(td => td.textContent.trim());
            csvContent += cells.join(",") + "\n";
        });

    // Create a Blob with UTF-8 encoding
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a download link and trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


// Report Section *************************************************************************************************************************************************************************************************************
// Report Section *************************************************************************************************************************************************************************************************************
// Report Section *************************************************************************************************************************************************************************************************************
// Report Section *************************************************************************************************************************************************************************************************************
// Report Section *************************************************************************************************************************************************************************************************************
// Report Section *************************************************************************************************************************************************************************************************************
// Report Section *************************************************************************************************************************************************************************************************************
// Report Section *************************************************************************************************************************************************************************************************************
// Report Section *************************************************************************************************************************************************************************************************************
// Report Section *************************************************************************************************************************************************************************************************************
// Report Section *************************************************************************************************************************************************************************************************************



function exportSalesReportToCSV() {
    const table = document.getElementById("sales-report-table");
    const rows = table.querySelectorAll("tr");
    let csvContent = "\uFEFF"; 

    const headers = Array.from(rows[0].querySelectorAll("th")).map(th => th.textContent.trim());
    csvContent += headers.join(",") + "\n";

    Array.from(rows)
        .slice(1) 
        .forEach(row => {
            const cells = Array.from(row.querySelectorAll("td")).map(td => td.textContent.trim());
            csvContent += cells.join(",") + "\n";
        });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sales_report.csv";
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}



function generateSalesReports() {
    let revenuePerCategory = {};
    const startDate = document.getElementById("report-start-date").value;
    const endDate = document.getElementById("report-end-date").value;

    const startDateNormalized = startDate ? formatDate2(startDate) : null;
    const endDateNormalized = endDate ? formatDate2(endDate) : null;

    const blueberryCategory = document.getElementById("report-blueberry-category").value;
    const packageCategory = document.getElementById("report-package-category").value;

    const filteredOrders = orders.filter(order => {
        const blueberryCategoryMatch =
            blueberryCategory === "all" ||
            (blueberryCategory ? order.blueberryCategory.includes(blueberryCategory) : true);
        const packageCategoryMatch =
        packageCategory === "all" ||
            (packageCategory ? order.productCategory.includes(packageCategory) : true);

        const orderDate = order.orderDate;

        return (
            (!startDateNormalized || orderDate >= startDateNormalized) &&
            (!endDateNormalized || orderDate <= endDateNormalized) &&
            blueberryCategoryMatch && packageCategoryMatch
        );
    });

    
let totalRevenue = 0;
let totalUnitsSold = 0;

filteredOrders.forEach(order => {
    const category = order.productCategory;
    const blueberryCategory = order.blueberryCategory;
    const revenue = order.totalPrice;
    const units = order.quantityOrdered;

    if (!revenuePerCategory[category]) {
        revenuePerCategory[category] = {};
    }

    if (!revenuePerCategory[category][blueberryCategory]) {
        revenuePerCategory[category][blueberryCategory] = { revenue: 0, units: 0 };
    }

    revenuePerCategory[category][blueberryCategory].revenue += revenue;
    revenuePerCategory[category][blueberryCategory].units += units;

    totalRevenue += revenue;
    totalUnitsSold += units;
});

    document.getElementById("total-revenue").textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById("total-units-sold").textContent = totalUnitsSold;

    const tbody = document.getElementById("sales-report-table").getElementsByTagName("tbody")[0];
    tbody.innerHTML = ""; 
    
    Object.keys(revenuePerCategory).forEach(category => {
        Object.keys(revenuePerCategory[category]).forEach(blueberryCategory => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${blueberryCategory}</td>
                <td>${category}</td>
                <td>$${revenuePerCategory[category][blueberryCategory].revenue.toFixed(2)}</td>
                <td>${revenuePerCategory[category][blueberryCategory].units}</td>
            `;
            tbody.appendChild(row);
        });
    });
    


}


function calculateTotalIncome(period, selectedDate) {
    const filteredOrders = filterByPeriod(orders, period, selectedDate);
    return filteredOrders.reduce((total, order) => total + order.totalPrice, 0);
}

function calculateTotalExpenses(period, selectedDate) {
    const filteredPurchases = filterByPeriod(purchases, period, selectedDate);
    return filteredPurchases.reduce((total, purchase) => total + purchase.totalPrice, 0);
}

function calculateTax(income, taxRate = 0.20) {
    return income * taxRate;
}

function calculateNetProfit(income, expenses, tax) {
    return income - expenses - tax;
}



function generateFinancialReport(period, selectedDate) {
    const totalIncome = calculateTotalIncome(period, selectedDate);
    const totalExpenses = calculateTotalExpenses(period, selectedDate);
    const tax = calculateTax(totalIncome);
    const netProfit = calculateNetProfit(totalIncome, totalExpenses, tax);


    const productsSoldPerCategory = {};
    const filteredOrders = filterByPeriod(orders, period, selectedDate); 
    filteredOrders.forEach(order => {
        productsSoldPerCategory[order.productCategory] = 
            (productsSoldPerCategory[order.productCategory] || 0) + order.quantityOrdered;
    });

    const reportTable = `
        <table border="1" cellpadding="10" cellspacing="0">
            <thead>
                <tr>
                    <th colspan="2">Financial Report (${period} - ${selectedDate})</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Total Income (Sales):</td>
                    <td>$${totalIncome.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Total Expenses (Purchases):</td>
                    <td>$${totalExpenses.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Tax Applied:</td>
                    <td>$${tax.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Net Profit:</td>
                    <td>$${netProfit.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    `;

    const reportDiv = document.getElementById("financialReport");
    reportDiv.innerHTML = reportTable;
}


document.getElementById("generateFinancialReport").addEventListener("click", function() {
    const period = document.getElementById("periodSelect-finance").value;
    const selectedDate = document.getElementById("datePicker-finance").value;  // "YYYY-MM-DD"


    if (!selectedDate) {
        alert("Please select a date.");
        return;
    }

    generateFinancialReport(period, selectedDate);
});

function exportFinancialReportToCSV() {
    const reportDiv = document.getElementById("financialReport");
    const table = reportDiv.querySelector("table");
    const rows = table.querySelectorAll("tr");
    let csvContent = "\uFEFF"; 

    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("th, td")).map(cell => {
            return `"${cell.textContent.trim()}"`; 
        });
        csvContent += cells.join(",") + "\n"; 
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financial_report.csv"; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


function generateEndOfPeriodReport(period, selectedDate) {

    const totalIncome = calculateTotalIncome(period, selectedDate);
    const totalExpenses = calculateTotalExpenses(period, selectedDate);
    const taxRate = 0.20; 
    const tax = calculateTax(totalIncome, taxRate);
    const netProfit = calculateNetProfit(totalIncome, totalExpenses, tax);


    const inventoryStatus = Object.keys(productCategories).map(category => {
        const categoryStock = Object.keys(productCategories[category]).map(packageSize => ({
            packageSize,
            stock: productCategories[category][packageSize].stock
        }));

        return {
            category,
            stock: categoryStock
        };
    });


    const productsSoldPerCategory = {};
    orders.forEach(order => {
        const category = `${order.blueberryCategory} - ${order.productCategory}`;
        productsSoldPerCategory[category] = 
            (productsSoldPerCategory[category] || 0) + order.quantityOrdered;
    });

    const reportDiv = document.getElementById("end-of-report-div");
    const reportTable = `
        <table border="1" cellpadding="10" cellspacing="0">
            <thead>
                <tr>
                    <th colspan="2">End-of-Period Report (${period})</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Total Income (Sales):</td>
                    <td>$${totalIncome.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Total Expenses (Purchases):</td>
                    <td>$${totalExpenses.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Tax Applied:</td>
                    <td>$${tax.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Net Profit:</td>
                    <td>$${netProfit.toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="2"><strong>Inventory Status (Remaining Stock):</strong></td>
                </tr>
                ${inventoryStatus.map(item => `
                    <tr>
                        <td colspan="2"><strong>${item.category.charAt(0).toUpperCase() + item.category.slice(1)}:</strong></td>
                    </tr>
                    ${item.stock.map(subItem => `
                        <tr>
                            <td>${subItem.packageSize}</td>
                            <td>${subItem.stock} kg</td>
                        </tr>
                    `).join('')}
                `).join('')}
                <tr>
                    <td colspan="2"><strong>Products Sold Per Category:</strong></td>
                </tr>
                ${Object.entries(productsSoldPerCategory)
                    .map(([category, quantity]) => `
                        <tr>
                            <td>${category}</td>
                            <td>${quantity} units</td>
                        </tr>
                    `).join('')}
            </tbody>
        </table>
    `;
    reportDiv.innerHTML = reportTable;


}


document.getElementById("generateEndOfPeriodReport").addEventListener("click", () => {
    const periodSelect = document.getElementById("periodSelect").value;
    const dateInput = document.getElementById("dateInput").value;

    if (!dateInput) {
        alert("Please select a date.");
        return;
    }

    generateEndOfPeriodReport(periodSelect, dateInput);
});

function filterByPeriod(data, period, selectedDate) {


    const [selectedYear, selectedMonth, selectedDay] = selectedDate.split('-').map(Number);

    return data.filter(item => {
        const [itemDay, itemMonth, itemYear] = (item.date || item.orderDate).split('-').map(Number);

        

        switch (period.toLowerCase()) {
            case "daily":
                return (
                    itemYear === selectedYear &&
                    itemMonth === selectedMonth &&
                    itemDay === selectedDay
                );
            case "monthly":
                return (
                    itemYear === selectedYear &&
                    itemMonth === selectedMonth
                );
            case "quarterly":
                const selectedQuarter = Math.floor((selectedMonth - 1) / 3);
                const itemQuarter = Math.floor((itemMonth - 1) / 3);
                return (
                    itemYear === selectedYear &&
                    selectedQuarter === itemQuarter
                );
            case "yearly":
                return itemYear === selectedYear;
            default:
                return true; 
        }
    });
}

function exportEndOfPeriodReportToCSV() {
    const reportDiv = document.getElementById("end-of-report-div");
    const table = reportDiv.querySelector("table");
    const rows = table.querySelectorAll("tr");
    let csvContent = "\uFEFF";

    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("th, td")).map(cell => {
            return `"${cell.textContent.trim()}"`; 
        });
        csvContent += cells.join(",") + "\n"; 
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "end_of_period_report.csv"; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


populateFarmerDropdown();
renderCustomerTable();
renderFarmers();


// Storages Section **************************************************************************************************************************************************************************************************************
// Storages Section **************************************************************************************************************************************************************************************************************
// Storages Section **************************************************************************************************************************************************************************************************************
// Storages Section **************************************************************************************************************************************************************************************************************
// Storages Section **************************************************************************************************************************************************************************************************************
// Storages Section **************************************************************************************************************************************************************************************************************
// Storages Section **************************************************************************************************************************************************************************************************************
// Storages Section **************************************************************************************************************************************************************************************************************
// Storages Section **************************************************************************************************************************************************************************************************************
// Storages Section **************************************************************************************************************************************************************************************************************
// Storages Section **************************************************************************************************************************************************************************************************************

const defaultProductCategories = {
    frozen: {
        small: { weight: 100, pricePerKg: 14, stock: 0 },
        medium: { weight: 250, pricePerKg: 12, stock: 0 },
        large: { weight: 500, pricePerKg: 10, stock: 0 },
        extraLarge: { weight: 1000, pricePerKg: 8, stock: 0 },
        familyPack: { weight: 2000, pricePerKg: 7, stock: 0 },
        bulkPack: { weight: 5000, pricePerKg: 6.25, stock: 0 },
        premium: { weight: 'custom', pricePerKg: 'Varies', stock: 0 }
    },
    organic: {
        small: { weight: 100, pricePerKg: 13, stock: 0 },
        medium: { weight: 250, pricePerKg: 11, stock: 0 },
        large: { weight: 500, pricePerKg: 10, stock: 0 },
        extraLarge: { weight: 1000, pricePerKg: 9, stock: 0 },
        familyPack: { weight: 2000, pricePerKg: 6, stock: 0 },
        bulkPack: { weight: 5000, pricePerKg: 5, stock: 0 },
        premium: { weight: 'custom', pricePerKg: 'Varies', stock: 0 }
    },
    fresh: {
        small: { weight: 100, pricePerKg: 12, stock: 0 },
        medium: { weight: 250, pricePerKg: 10, stock: 0 },
        large: { weight: 500, pricePerKg: 8.5, stock: 0 },
        extraLarge: { weight: 1000, pricePerKg: 7.5, stock: 0 },
        familyPack: { weight: 2000, pricePerKg: 6, stock: 0 },
        bulkPack: { weight: 5000, pricePerKg: 4.8, stock: 0 },
        premium: { weight: 'custom', pricePerKg: 'Varies', stock: 0 }
    }
};


function loadDataFromLocalStorage() {
    farmers = loadFarmersFromLocalStorage();  
    products = loadBlueberryStockFromLocalStorage();
    purchases = loadPurchasesFromLocalStorage();
    customers = loadCustomersFromLocalStorage();
    orders = loadOrdersFromLocalStorage();
    productCategories = loadProductCategoriesFromLocalStorage();
    
}



function saveFarmersToLocalStorage() {
    localStorage.setItem('farmers', JSON.stringify(farmers));
}

function loadFarmersFromLocalStorage() {
    const savedFarmers = localStorage.getItem('farmers');
    if (savedFarmers) {
        return JSON.parse(savedFarmers);
    }
    return []; 
}


function saveBlueberryStockToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
}

function loadBlueberryStockFromLocalStorage() {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        return JSON.parse(savedProducts);
    }
    return { 
        frozen: {stock: 0, price: 7, storageLocation: "Warehouse 1", restockDate: "22-12-2024"},
        organic: {stock: 0, price: 10, storageLocation: "Warehouse 2", restockDate: "22-12-2024"},
        fresh: {stock: 0, price: 12, storageLocation: "Warehouse 3", restockDate: "22-12-2024"}
    };
}

function savePurchasesToLocalStorage() {
    localStorage.setItem('purchases', JSON.stringify(purchases));
}

function loadPurchasesFromLocalStorage() {
    const savedPurchases = localStorage.getItem('purchases');
    if (savedPurchases) {
        return JSON.parse(savedPurchases);
    }
    return []; 
}

function saveOrdersToLocalStorage() {
    localStorage.setItem('orders', JSON.stringify(orders));
}


function loadOrdersFromLocalStorage() {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        return JSON.parse(savedOrders);
    }
    return []; 
}


function saveCustomersToLocalStorage() {
    localStorage.setItem('customers', JSON.stringify(customers));
}


function loadCustomersFromLocalStorage() {
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
        return JSON.parse(savedCustomers);
    }
    return [];
}

function saveProductCategoriesToLocalStorage() {
    localStorage.setItem("productCategories", JSON.stringify(productCategories));
}

function loadProductCategoriesFromLocalStorage() {
    const storedProductCategories = localStorage.getItem("productCategories");
    
    
    if (storedProductCategories) {
        return JSON.parse(storedProductCategories);
    } else {
        
        return defaultProductCategories; 
    }
}



