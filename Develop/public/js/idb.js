let db;
const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending_object", { autoIncrement: true });
};

// check to see if the app is online, if so, then runs uploadObject()
request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    uploadObject();
  }
};
request.onerror = function (event) {
  console.log(event.target.errorcode);
};

// if there's no connection, the run saveRecord()
function saveRecord(record) {

  const transaction = db.transaction(["pending_object"], "readwrite");

  const transactionObjectStore = transaction.objectStore("pending_object");

  transactionObjectStore.add(record);
}

const uploadObject = () => {

    const transaction = db.transaction(["pending_object"], "readwrite");

    const transactionObjectStore = transaction.objectStore("pending_object")

    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                            'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse)
                }

                const transaction = db.transaction(["pending_object"], 'readwrite');

                const transactionObjectStore = transaction.objectStore("pending_object");

                transactionObjectStore.clear();
            })
            .catch(err => {
                console.log(err);
              });
        }
    }
}

// listens for a connection
window.addEventListener('online', uploadObject);