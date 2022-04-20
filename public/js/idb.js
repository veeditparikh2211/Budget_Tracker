let db;

// establish a connetion to indexeddb called budgettracker
const request = indexedDB.opne('budgettracker', 1);

request.onupgradeneeded = function(event) {
    // saving a reference
    const db = event.target.result;

    db.creataOBjectStore('new_transaction', { autoIncrement: true });

};

// when the request is successful

request.onsuccess = function(event) {

    db = event.target.result;

    if (navigator.onLine) {
        uploadTransaction();
    }
};

// Error message
request.onerror = function(event) {

    // log error
    console.log(event.target.errorCode);
}

// New transaction

function newrecord(record) {

    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_transaction');

    budgetObjectStore.add(record);
}

function uploadTransaction() {

    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access the objectstore
    const budgetObjectStore = transaction.objectStore('new_transaction');

    const getall = budgetObjectStore.getall();

    getall.onsuccess = function() {

        if (getall.result.length > 0) {

            fetch('/api/transaction', {
                    method: 'POST',
                    body: JSON.stringify(getall.result),
                    headers: {
                        Accept: 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(serverResponse => {

                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['new_transcation'], 'readwrite');

                    const budgetObjectStore = transaction.objectStore('new_transaction');

                    budgetObjectStore.clear();

                    alert("All transacation has been submitted");
                })
                .catch(err => {
                    console.log(err);
                });
        }

    }

}

window.addEventListener('online', uploadTransaction);