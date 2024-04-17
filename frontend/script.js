window.onload = function() {
    const token = localStorage.getItem('token');

    if (token && token !== 'undefined' && token !== null) {
        fetch('/api/user/', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        })
        .then(response => {
            if (response.status === 401) {
                // If the server responds with a 401 status, remove the token
                localStorage.removeItem('token');
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(data => {
            const userName = data.data.name.split(' ')[0];
            document.body.innerHTML = document.body.innerHTML.replace(/username/g, userName);
        })
        .catch((error) => {
            console.error('🙏');
        });

        if (!window.location.href.endsWith('expenses.html')) {
            window.location.href = 'expenses.html';
        }
        getExpenses();
    }
    else {
        logOut();
    }
};

function currencyFormat(inputValue) {
    return inputValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

async function register(event) {
    event.preventDefault();

    const name = document.getElementById('name-register').value               || 'John Doe';
    const email = document.getElementById('email-register').value             || 'johnD@gmail.com';
    const password = document.getElementById('password-register').value       || '123456';
    const confirmPassword = document.getElementById('password-confirm').value || '123456';

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const newUser = { name, email, password }

    fetch('/api/user/register', { // Make a POST request to the server
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newUser)
    })
    .then(response => response.json()) // Parse the JSON from the response
    .then(data => {
        if (data) {
            localStorage.setItem('token', data.data.token); // Store the token in the local storage
            // Redirect to the home page
        }
    })
    .catch((error) => alert(error)); // Catch any errors and alert the user
}

async function login(event) {
    event.preventDefault();
    const email = document.getElementById('email-login').value                || 'johnD@gmail.com';
    const password = document.getElementById('password-login').value          || '123456';

    const existingUser = { email, password }

    fetch('/api/user/login', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(existingUser)
    })
    .then(response => response.json())
    .then(data => {
        if (data.data) {
            localStorage.setItem('token', data.data.token); 
            window.location.href = 'expenses.html';
        }
        else {
            alert(data.message);
        }
    })
    .catch((error) => alert(error.message));
}

async function logOut(event) {
    localStorage.removeItem('token');

    if (!window.location.href.endsWith('login.html')) {
        window.location.href = 'login.html';
    }
}

async function addExpense(event) {
    event.preventDefault();

    const name = document.getElementById('expense-name').value;
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;

    if (!name || !amount || !date) {
        return res.status(400).json({
            message: "Please provide name, amount, and date"
        });
    }

    const newExpense = { name, description, amount, date, category };

    document.getElementById('expense-name').value = '';
    document.getElementById('expense-description').value = '';
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-date').value = '';
    document.getElementById('expense-category').value = '';

    fetch('/api/expense/', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem('token')
        },
        body: JSON.stringify(newExpense)
    })
    .then(response => response.json())
    .then(data => {
        getExpenses();
    })
    .catch((error) => alert(error));
}

async function removeExpense(id, event) {

    event.target.parentNode.parentNode.remove();

    fetch(`/api/expense/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        getExpenses();
    })
    .catch((error) => alert(error));
}

async function getExpenses() {
    fetch('/api/expense/', {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            document.getElementById('expense-list').innerHTML = '';

            let index = 0;
            let total = 0;

            expenses = data.data;

            sortedExpenses = expenses.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });

            for (expense of sortedExpenses) {
                const date = new Date(expense.date);
                let formattedDate = date.toISOString().split('T')[0];
                formattedDate = formattedDate.split('-')[2] + '-' + formattedDate.split('-')[1] + '-' + formattedDate.split('-')[0]; // dd-mm-yyyy

                if ((parseInt(document.getElementById('month-category').value) == parseInt(formattedDate.split('-')[1]) || parseInt(document.getElementById('month-category').value) == 0) && (parseInt(document.getElementById('year-category').value) == parseInt(formattedDate.split('-')[2]) || parseInt(document.getElementById('year-category').value) == 0)) {
                    const expenseElement = document.createElement('tr');

                    expenseElement.innerHTML = `
                        <tr id="expense-${expense._id}">
                            <td>${expense.name}</td>
                            <td>${expense.description}</td>
                            <td>${formattedDate}</td>
                            <td>${expense.category}</td>
                            <td>$${currencyFormat(expense.amount)}</td>
                            <td>
                                <!-- <button class="button-gloss small"  onclick="modifyExpense('${expense._id}', event)">✏️</button> -->
                                <button class="button-gloss small"  onclick="removeExpense('${expense._id}', event)">🗑️</button>
                            </td>
                        </tr>
                    `;
                    document.getElementById('expense-list').appendChild(expenseElement);
                    index++;
                    total += expense.amount;
                }
            }

            const totalElement = document.createElement('tr');
                totalElement.innerHTML = `
                    <tr>
                        <td>Total</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>$${currencyFormat(total)}</td>
                        <td></td>
                    </tr>
                `;
                document.getElementById('expense-list').appendChild(totalElement);
        }
    })
    .catch((error) => alert(error));
}