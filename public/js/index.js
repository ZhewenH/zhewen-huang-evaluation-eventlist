const API = {
    baseURL: 'http://localhost:3000/events',
    async get() {
        const response = await fetch(this.baseURL);
        return await response.json();
    },
    async post(event) {
        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
        return await response.json();
    },
    async put(id, event) {
        await fetch(`${this.baseURL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
    },
    async delete(id) {
        await fetch(`${this.baseURL}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

class EventModel {
    constructor() {
    }
    async getEvents() {
        return await API.get();
    }
    async createEvent(event) {
        return await API.post(event);
    }
    async updateEvent(id, event) {
        return await API.put(id, event);
    }
    async deleteEvent(id) {
        return await API.delete(id);
    }
}
class EventView {
    constructor() {
        this.form = document.getElementById('event-form');
        this.eventsTable = document.getElementById('events-table');
    }
    addEditableRowToTable(event = {}, isNew = true) {
        const newRow = this.eventsTable.insertRow();
        const titleCell = newRow.insertCell(0);
        const startCell = newRow.insertCell(1);
        const endCell = newRow.insertCell(2);
        const actionCell = newRow.insertCell(3);

        titleCell.textContent = event.eventName || '';

        const startDateInput = document.createElement('input');
        startDateInput.type = 'date';
        startDateInput.value = event.startDate || '';
        startCell.appendChild(startDateInput);

        const endDateInput = document.createElement('input');
        endDateInput.type = 'date';
        endDateInput.value = event.endDate || '';
        endCell.appendChild(endDateInput);

        if (isNew) {
            titleCell.contentEditable = 'true';
            startCell.contentEditable = 'true';
            endCell.contentEditable = 'true';

            actionCell.innerHTML = `
                <div class="action-buttons">
                 <span onclick="eventController.handleSave(this)">
                    <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21,20V8.414a1,1,0,0,0-.293-.707L16.293,3.293A1,1,0,0,0,15.586,3H4A1,1,0,0,0,3,4V20a1,1,0,0,0,1,1H20A1,1,0,0,0,21,20ZM9,8h4a1,1,0,0,1,0,2H9A1,1,0,0,1,9,8Zm7,11H8V15a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1Z"/>
                    </svg>
                </span>
                </div>
            `;
        } else {
            actionCell.innerHTML = `
                    <div class="action-buttons">
                     <span onclick="eventController.handleBeginUpdate(this, ${event.id})">
                      <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="EditIcon" aria-label="fontSize small">
                       <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                      </svg>
                    </span>
                     <span onclick="eventController.handleDelete(this, ${event.id})">
                     <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" aria-label="fontSize small">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                        </svg>
                     </span>
                 </div>
                `;
        }
    }
    makeRowEditable(button, id) {
        const row = button.parentNode.parentNode.parentNode;
        row.cells[0].contentEditable = 'true';
        row.cells[1].contentEditable = 'true';
        row.cells[2].contentEditable = 'true';
        // button.outerHTML = `<button onclick="eventController.handleSave(this, ${id})">Save</button>`;
        button.outerHTML = 
        `
        <span onclick="eventController.handleSave(this, ${id})">
            <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path d="M21,20V8.414a1,1,0,0,0-.293-.707L16.293,3.293A1,1,0,0,0,15.586,3H4A1,1,0,0,0,3,4V20a1,1,0,0,0,1,1H20A1,1,0,0,0,21,20ZM9,8h4a1,1,0,0,1,0,2H9A1,1,0,0,1,9,8Zm7,11H8V15a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1Z"/>
        </svg>
         </span>`;

    }
}
class EventController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.form = this.view.form;
        this.form.addEventListener('submit', this.handleAdd.bind(this));
        this.init();
    }
    async init() {
        const events = await this.model.getEvents();
        events.forEach(event => {
            this.view.addEditableRowToTable(event, false);
        });
    }
    handleAdd(e) {
        e.preventDefault();
        this.view.addEditableRowToTable();
    }

    handleBeginUpdate(button, id){
        this.view.makeRowEditable(button, id);
    }
    async handleUpdate(button, id) {
        const row = button.parentNode.parentNode;
        const eventName = row.cells[0].textContent;
        const startDate = row.cells[1].textContent;
        const endDate = row.cells[2].textContent;
        await this.model.updateEvent(id, { eventName, startDate, endDate });
    }
    async handleSave(button, id) {
        const row = button.parentNode.parentNode.parentNode;
        const eventName = row.cells[0].textContent;
        const startDate = row.cells[1].textContent;
        const endDate = row.cells[2].textContent;
        console.log(button)
        if (!id) {
            const event = await this.model.createEvent({ eventName, startDate, endDate });
            button.id = event.id;
            button.outerHTML = `
            <span onclick="eventController.handleBeginUpdate(this, ${button.id})">
              <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="EditIcon" aria-label="fontSize small">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
              </svg>
            </span>
            <span onclick="eventController.handleDelete(this, ${button.id})">
              <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" aria-label="fontSize small">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
              </svg>
            </span>`;
        } else {
            await this.model.updateEvent(id, { eventName, startDate, endDate });
            button.outerHTML = `
            <span onclick="eventController.handleBeginUpdate(this, ${id})">
                <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="EditIcon" aria-label="fontSize small">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                </svg>
            </span>`;
        }
        row.cells[0].contentEditable = 'false';
        row.cells[1].contentEditable = 'false';
        row.cells[2].contentEditable = 'false';
    }
    async handleDelete(button, id) {
        const row = button.parentNode.parentNode.parentNode;
        await this.model.deleteEvent(id);
        this.view.eventsTable.deleteRow(row.rowIndex);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const model = new EventModel(API);
    const view = new EventView();
    const controller = new EventController(model, view);
    window.eventController = controller;
});
