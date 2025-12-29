firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        let databaseRef = firebase.database().ref("admins");
        databaseRef.once('value', function (snapshot) {
            const data = snapshot.val();
            const keys = Object.keys(data);
            const condition = keys.includes(user.uid);
            if (condition) {
                verifyAndLoad(user);
            } else {
                showErrorAlert("You Are Not Authorized to this page! Please login via Admin Credentials.", () => {
                    window.location.assign('index.html');
                });
            }
        });
    } else {
        window.location.assign('index.html');
    }
});

function calculateStats(dataArr) {
    const totalProperties = dataArr.length;
    const pendingReview = dataArr.filter(property => property.status.toLowerCase() === 'pending').length;
    const completedReview = dataArr.filter(property => property.status.toLowerCase() === 'completed').length;

    return [
        {
            title: 'Total Properties',
            value: totalProperties.toLocaleString(),
            trend: '',
            isPositive: true
        },
        {
            title: 'Pending Review',
            value: pendingReview.toLocaleString(),
            trend: '',
            isPositive: false
        },
        {
            title: 'Completed Review',
            value: completedReview.toLocaleString(),
            trend: '',
            isPositive: true
        }
    ];
}

function renderStats(statsData) {
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = statsData.map(stat => `
        <div class="stat-card">
            <h3>${stat.title}</h3>
            <div class="value">${stat.value}</div>
            ${stat.trend ? `<div class="trend ${stat.isPositive ? 'positive' : ''}">${stat.trend}</div>` : ''}
        </div>
    `).join('');
}

function renderTableRows(data) {
    const tableBody = document.getElementById('propertyTableBody');
    tableBody.innerHTML = data.map(property => {
        const isCompleted = property.status.toLowerCase() === "completed" || property.status.toLowerCase() === "approved";
        return `
        <tr>
            <td>${property.id}</td>
            <td>${property.owner}</td>
            <td>${property.location}</td>
            <td>${property.submitted}</td>
            <td><span class="status status-${property.status.toLowerCase()}">${property.status.toUpperCase()}</span></td>
            <td class="action-buttons">
                <button class="btn btn-edit" onclick="editProperty(this, '${property.id}')" data-edit-url="${property.reference}" >
                   ${property.status.toLowerCase() == "completed" ? "Update" : "Edit"}
                </button>
                <button class="btn btn-edit" onclick="navigateToEstimations(this,'${property.id}')" data-edit-url="${property.reference}"  >
                    Estimations
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

function showLoader() {
    document.getElementById('loader').classList.remove('hidden');
}

function hideLoader() {
    document.getElementById('loader').classList.add('hidden');
}

function verifyAndLoad(user) {
    showLoader();
    let allDataRef = firebase.database().ref();
    let dataArr = [];

    allDataRef.once('value', function (snapshot) {
        let data = snapshot.val();
        let sno = 0;
        for (let k in data) {
            const currentData = data[k];
            if (currentData.FIRSTNAME) {
                if (currentData.orders) {
                    const orderData = currentData.orders;
                    for (let j in orderData) {
                        const dataOfOrders = orderData[j];
                        if (dataOfOrders.projectType == "Construction") {

                            let obj = {
                                id: sno,
                                owner: `${currentData.FIRSTNAME} ${currentData.LASTNAME}`,
                                location: dataOfOrders.searchlocation,
                                submitted: dataOfOrders.timestamp.split("T")[0],
                                status: dataOfOrders.status,
                                reference: `${k}/orders/${j}`
                            };
                            dataArr.push(obj);
                            sno++;
                        }
                    }
                }
            }
        }

        // Sort by submitted date (descending)
        propertyData = dataArr.sort((a, b) => new Date(b.submitted) - new Date(a.submitted));

        // Reassign serial IDs sequentially starting from 1 after sorting
        propertyData.forEach((property, index) => {
            property.id = index + 1;
        });

        const dynamicStats = calculateStats(propertyData);
        renderStats(dynamicStats);

        renderTableRows(propertyData);

        document.getElementById("emailAd").innerText = user.email;

        hideLoader();
    });
}


document.getElementById("logout").addEventListener("click", function () {
    firebase.auth().signOut();
});

function editProperty(e, id) {
    const postDataPathRef = e.getAttribute("data-edit-url");
    console.log(`Editing property ${id}`);
    showCustomAlert(`Editing property with Serial No. ${id}`, () => {
        document.cookie = `reference=${postDataPathRef};`;
        window.location.href = "/Construction/cadEditor.html";
    });
}
function navigateToEstimations(e, id) {
    const postDataPathRef = e.getAttribute("data-edit-url");
    console.log(`Editing property ${id}`);
    console.log(`Editing property ${postDataPathRef}`);
    showCustomAlert(`Opening estimations for property with Serial No. ${id}`, () => {
        document.cookie = `reference=${postDataPathRef};`;
        window.location.href = "/Estimations/estimations.html";
    });
}

function rejectProperty(id) {
    console.log(`Rejecting property ${id}`);
    showCustomAlert(`Rejecting property ${id}`);
}


document.getElementById("viewAerial").addEventListener("click", function () {
    window.location.href = "admin.html";
});