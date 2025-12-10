/**
 * Sample JavaScript file for testing
 */

// Modal functions - properly connected
function openModal() {
    const modal = document.getElementById('testModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal() {
    const modal = document.getElementById('testModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Form handling - properly connected
function handleSubmit(event) {
    event.preventDefault();
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    
    if (nameInput && emailInput) {
        console.log('Form submitted:', {
            name: nameInput.value,
            email: emailInput.value
        });
    }
}

function validateInput(input) {
    if (input.value.length < 2) {
        input.style.borderColor = 'red';
    } else {
        input.style.borderColor = 'green';
    }
}

// Tab functions - partially connected
function switchTab(tabId) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    
    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
}

// Orphaned function - references non-existent element
function orphanedFunction() {
    const nonExistentElement = document.getElementById('nonExistentElement');
    if (nonExistentElement) {
        nonExistentElement.style.display = 'block';
    }
    
    // Also query for element that doesn't exist
    const anotherMissing = document.querySelector('#missingElement');
    return anotherMissing;
}

// Unused function - never called
function unusedFunction() {
    console.log('This function is never called');
    return 'unused';
}

// Another unused function
const anotherUnusedFunction = () => {
    return 'also unused';
};

// Function that calls other functions
function callerFunction() {
    openModal();
    closeModal();
    return 'caller';
}

// Export function (should not be marked as unused)
export function exportedFunction() {
    return 'exported';
}

// Function with complex DOM queries
function complexDOMQueries() {
    // This should work
    const app = document.getElementById('app');
    
    // This references missing element
    const missing = document.getElementById('definitelyMissing');
    
    // Query selector variations
    const byClass = document.querySelector('.missing-class');
    const byAttribute = document.querySelector('[data-missing="true"]');
    
    return { app, missing, byClass, byAttribute };
}

// Class with methods
class SampleClass {
    constructor() {
        this.element = document.getElementById('classElement'); // Missing element
    }
    
    method1() {
        return 'method1';
    }
    
    unusedMethod() {
        return 'unused method';
    }
}

// Create instance to make constructor called
const instance = new SampleClass();
instance.method1(); // This makes method1 used