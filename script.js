// Function to update highest consumption lists
function updateHighestConsumption(waterData, electricityData) {
    // Define region colors
    const regionColors = {
        "Inner Melbourne": "#1f77b4",
        "Western Melbourne": "#ff7f0e",
        "Northern Melbourne": "#2ca02c",
        "Eastern Melbourne": "#d62728",
        "Southern Melbourne": "#9467bd",
        "Bayside Peninsula": "#8c564b"
    };

    // Function to get color based on suburb name
    function getSuburbColor(suburbName) {
        const waterItem = waterData.find(w => w.Suburbs.trim() === suburbName.trim());
        return waterItem ? regionColors[waterItem.Region] : "#000000"; // Default to black if not found
    }

    // Sort data by electricity consumption
    const sortedByElectricity = [...electricityData]
        .filter(item => !isNaN(parseFloat(item['Mean - 2012 (kWh)'])))
        .sort((a, b) => parseFloat(b['Mean - 2012 (kWh)']) - parseFloat(a['Mean - 2012 (kWh)']));
    
    // Sort data by water consumption
    const sortedByWater = [...waterData]
        .filter(item => !isNaN(parseFloat(item['2009'])))
        .sort((a, b) => parseFloat(b['2009']) - parseFloat(a['2009']));
    
    // Update electricity list
    const electricityList = document.getElementById('highest-electricity');
    electricityList.innerHTML = sortedByElectricity.slice(0, 5).map(item => {
        const color = getSuburbColor(item.sa2_name);
        return `<li style="color: ${color}; margin-bottom: 10px;">
            <div>${item.sa2_name}:</div>
            <div style="margin-left: 10px;">${Math.round(parseFloat(item['Mean - 2012 (kWh)']))} kWh</div>
        </li>`;
    }).join('');
    
    // Update water list
    const waterList = document.getElementById('highest-water');
    waterList.innerHTML = sortedByWater.slice(0, 5).map(item => 
        `<li style="color: ${regionColors[item.Region]}; margin-bottom: 10px;">
            <div>${item.Suburbs}:</div>
            <div style="margin-left: 10px;">${Math.round(parseFloat(item['2009']))} L/household/day</div>
        </li>`
    ).join('');
}

// Function to load CSV data
async function loadCSVData(url) {
    const response = await fetch(url);
    const text = await response.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0];
    return rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = row[index];
        });
        return obj;
    });
}

// Load and render visualizations
async function loadVisualizations() {
    try {
        // Load the Victoria Energy Consumption map
        await vegaEmbed('#vis_map', 'graphs/energy_consumption_map.vg.json');
        console.log('vis_map loaded successfully');

        // Load the Water vs Electricity Consumption data
        const waterData = await loadCSVData('data/wateruse.csv');
        const electricityData = await loadCSVData('data/supplied-sa2s.csv');
        
        // Render the Water vs Electricity Consumption scatter plot
        await vegaEmbed('#vis_water_elec', 'graphs/vic-consumption-water-elec.json');
        console.log('vis_water_elec loaded successfully');

        // Load the Victoria Energy Consumption map
        await vegaEmbed('#vis_pop_eng', 'graphs/population-density-energy-comparison.vg.json');
        console.log('vis_pop_eng loaded successfully');

        vegaEmbed('#vis_pop_eng_1', 'graphs/population-density-energy-comparison.vg.json');
        vegaEmbed('#vis_pop_eng_2', 'graphs/population-density-energy-comparison.vg.json');

        // Load the Solar Panel info
        await vegaEmbed('#vis_solar', 'graphs/sa4_solar_installations.vg.json');
        console.log('vis_solar loaded successfully');
        
        // Load the Solar Panel info
        await vegaEmbed('#vis_irrigation', 'graphs/water_irrigation.vg.json');
        console.log('vis_irrigation loaded successfully');

        // Update the highest consumption lists
        updateHighestConsumption(waterData, electricityData);
    } catch (error) {
        console.error('Error loading visualizations:', error);
    }
}

// Add event listener for the menu toggle button
document.addEventListener('DOMContentLoaded', (event) => {
    const menuToggle = document.querySelector('.menu-toggle');
    const cityList = document.querySelector('.city-list');

    menuToggle.addEventListener('click', () => {
        cityList.classList.toggle('show');
    });

    // Load visualizations and update consumption lists
    loadVisualizations();
});