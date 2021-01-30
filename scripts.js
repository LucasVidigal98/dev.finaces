const modal = {
    open (){
        //Abrir modal
        //Adcionar a classe active ao modal
        document
            .querySelector('.modal-overlay')
            .classList.add('active');
    },
    close (){
        //Fechar o modal
        //Remover a classe active ao modal
        document
            .querySelector('.modal-overlay')
            .classList.remove('active');
    }
};

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },
    set(tr) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(tr));
    }
}

const transaction = {
    all: Storage.get(),

    add(tr){
        this.all.push(tr);
        App.reload();
    },
    remove(index) {
        this.all.splice(index, 1);
        App.reload();
    },

    incomes() {
        //Somara todas as entradas
        let income = 0;
        this.all.map(tr => {
            if(tr.amount > 0){
                income += tr.amount;
            }
        });

        return income;
    },
    expenses() {
        //Somar as saídas
        let expense = 0;
        this.all.map(tr => {
            if(tr.amount < 0){
                expense += tr.amount;
            }
        });

        return expense;
    },
    total() {
        //Entradas - Saídas
        return transaction.incomes() + transaction.expenses();
    }
};

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),
    
    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = this.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        this.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income": "expense";

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
        <td class="description">${transaction.desccription}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="alt">${transaction.date}</td>
        <td>
             <img onclick="transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
        </td>
        `;

        return html;
    },
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(transaction.incomes()); 
        
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(transaction.expenses());

        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(transaction.total());
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : "";
        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100;
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
        
        return signal + value;
    },
    formatAmount(value) {
        value = Number(value) * 100;

        return value;
    },
    formatDate(date) {
        const splitedDate = date.split('-');
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`;
    }
}

const App = {
    init() {
        transaction.all.map((tr, index) => DOM.addTransaction(tr, index));
        DOM.updateBalance();
        Storage.set(transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },
    valiedateField() {
        const { description, amount, date } = Form.getValues();

        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por Favor, preencha todos os campos");
        }
    },
    formatData() {
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },
    saveTransaction (tr){
        transaction.add(tr);
    },
    clearFields() {
        this.description.value = "";
        this.amount.value = "";
        this.date.value = "";
    },
    submit(e) {
        e.preventDefault();
        
        try{
            this.valiedateField();
            const tr = this.formatData();
            this.saveTransaction(tr);
            this.clearFields();
            modal.close();
        }catch(error){
            alert(error.message);
        }
    }
}

App.init();
