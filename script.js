// Carrega os dados do JSON
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        initializeApp(data);
    })
    .catch(error => {
        console.error('Erro ao carregar dados:', error);
    });

function initializeApp(data) {
    // Elementos do DOM
    const ticketGrid = document.getElementById('ticketGrid');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const instructionsList = document.getElementById('instructionsList');
    const ticketPriceElement = document.getElementById('ticketPrice');
    const pixKeyElement = document.getElementById('pixKey');
    const contactPhone = document.getElementById('contactPhone');
    const contactEmail = document.getElementById('contactEmail');
    const prizeAmount = document.querySelector('.prize-amount');
    const modalTicketNumber = document.getElementById('modalTicketNumber');
    const modalTicketPrice = document.getElementById('modalTicketPrice');
    const copyPixBtn = document.getElementById('copyPixBtn');
    const ticketModal = document.getElementById('ticketModal');
    const closeModal = document.querySelector('.close-modal');
    const confirmReservation = document.getElementById('confirmReservation');
    const buyersList = document.getElementById('buyersList');
    
    // Estado da aplicação
    let selectedTicket = null;
    let soldTickets = data.soldTickets || [];
    let reservedTickets = JSON.parse(localStorage.getItem('reservedTickets')) || [];
    
    // Atualiza a UI com os dados do JSON
    prizeAmount.textContent = data.prizeAmount;
    ticketPriceElement.textContent = data.ticketPrice;
    pixKeyElement.textContent = data.contact.pixKey;
    contactPhone.textContent = data.contact.phone;
    contactEmail.textContent = data.contact.email;
    
    // Preenche as instruções
    data.instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = instruction.replace('[price]', data.ticketPrice);
        instructionsList.appendChild(li);
    });
    
    // Cria a grade de números
    for (let i = 1; i <= data.totalTickets; i++) {
        const ticket = document.createElement('div');
        ticket.textContent = i;
        
        const soldTicket = soldTickets.find(t => t.number === i);
        if (soldTicket) {
            ticket.innerHTML = '<span class="sold-mark">X</span>';
            ticket.classList.add('sold');
            ticket.title = `Vendido para: ${soldTicket.buyerName}\nContato: ${soldTicket.contact}`;
        } else if (reservedTickets.includes(i)) {
            ticket.classList.add('reserved');
            ticket.title = 'Número reservado';
        }
        
        ticket.addEventListener('click', () => handleTicketClick(i, ticket));
        ticketGrid.appendChild(ticket);
    }
    
    // Preenche a lista de compradores
    renderBuyersList();
    
    // Atualiza a barra de progresso
    updateProgress();
    
    // Lógica para copiar chave PIX
    copyPixBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(data.contact.pixKey)
            .then(() => showToast('Chave PIX copiada!'))
            .catch(err => console.error('Erro ao copiar:', err));
    });
    
    // Lógica do modal
    closeModal.addEventListener('click', () => {
        ticketModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === ticketModal) {
            ticketModal.style.display = 'none';
        }
    });
    
    confirmReservation.addEventListener('click', () => {
        if (selectedTicket) {
            reserveTicket(selectedTicket);
            ticketModal.style.display = 'none';
        }
    });
    
    function handleTicketClick(number, element) {
        if (element.classList.contains('sold') || element.classList.contains('reserved')) {
            return;
        }
        
        selectedTicket = number;
        modalTicketNumber.textContent = number;
        modalTicketPrice.textContent = data.ticketPrice;
        ticketModal.style.display = 'flex';
    }
    
    function reserveTicket(number) {
        if (!reservedTickets.includes(number)) {
            reservedTickets.push(number);
            localStorage.setItem('reservedTickets', JSON.stringify(reservedTickets));
            
            // Atualiza a UI
            const tickets = document.querySelectorAll('.grid div');
            tickets[number - 1].classList.add('reserved');
            tickets[number - 1].title = 'Número reservado';
            
            showToast(`Número ${number} reservado! Envie o comprovante.`);
        }
    }
    
    function updateProgress() {
        const totalSold = soldTickets.length;
        const percentage = Math.round((totalSold / data.totalTickets) * 100);
        
        progressFill.style.width = `${percentage}%`;
        progressFill.textContent = `${percentage}%`;
        progressText.textContent = `${totalSold} de ${data.totalTickets} números vendidos`;
    }
    
    function renderBuyersList() {
        const buyersSection = document.createElement('div');
        buyersSection.className = 'buyers-section';
        buyersSection.innerHTML = `
            <h3>Números Vendidos</h3>
            <div class="buyers-table-container">
                <table class="buyers-table">
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Comprador</th>
                            <th>Contato</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody id="buyersTableBody">
                    </tbody>
                </table>
            </div>
        `;
        
        document.querySelector('.info-container').appendChild(buyersSection);
        
        const tableBody = document.getElementById('buyersTableBody');
        soldTickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ticket.number}</td>
                <td>${ticket.buyerName}</td>
                <td>${ticket.contact}</td>
                <td>${ticket.purchaseDate}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}