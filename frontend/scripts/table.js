// Table functionality for displaying car data

async function loadCarData() {
  const loadingDiv = document.getElementById('table-loading');
  const tableContainer = document.getElementById('table-container');
  const recordCountDiv = document.getElementById('record-count');
  
  // show loading, hide table
  loadingDiv.style.display = 'block';
  tableContainer.style.display = 'none';
  loadingDiv.innerHTML = 'Loading car data...';
  
  try {
    const response = await fetch('/api/cars');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const cars = await response.json();
    
    if (cars.length === 0) {
      loadingDiv.innerHTML = 'No cars in the database yet. Use the "Input Data" form to add some!';
      loadingDiv.style.color = 'rgb(107, 114, 128)';
      return;
    }
    
    // build the table HTML
    let tableHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Car Name</th>
            <th>MPG</th>
            <th>Cylinders</th>
            <th>Displacement</th>
            <th>Horsepower</th>
            <th>Weight (lbs)</th>
            <th>Acceleration</th>
            <th>Model Year</th>
            <th>Origin</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    cars.forEach(car => {
      // Convert origin number to text
      let originText = '';
      switch(car.origin) {
        case 1: originText = 'USA'; break;
        case 2: originText = 'Europe'; break;
        case 3: originText = 'Japan'; break;
        default: originText = car.origin;
      }
      
      tableHTML += `
        <tr>
          <td>${escapeHtml(car.id)}</td>
          <td><strong>${escapeHtml(car.car_name)}</strong></td>
          <td>${car.mpg}</td>
          <td>${car.cylinders}</td>
          <td>${car.displacement}</td>
          <td>${car.horsepower}</td>
          <td>${car.weight}</td>
          <td>${car.acceleration}</td>
          <td>${car.model_year}</td>
          <td>${originText}</td>
        </tr>
      `;
    });
    
    tableHTML += `
        </tbody>
      </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
    recordCountDiv.innerHTML = `Total records: ${cars.length} cars`;
    
    // hide loading, show table
    loadingDiv.style.display = 'none';
    tableContainer.style.display = 'block';
    
  } catch (error) {
    console.error('Error loading car data:', error);
    loadingDiv.innerHTML = 'Error loading data. Make sure the server is running.';
    loadingDiv.style.color = '#dc2626';
  }
}

// helper function to prevent XSS attacks
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// load data when page loads
document.addEventListener('DOMContentLoaded', loadCarData);

// auto-refresh every 120 seconds
setInterval(loadCarData, 120000);