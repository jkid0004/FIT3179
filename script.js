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
        
        // Load the Solar Panel info
        await vegaEmbed('#vis_solar', 'graphs/sa4_solar_installations.vg.json');
        console.log('vis_solar loaded successfully');
        
        // Load the vis_irrigation
        await vegaEmbed('#vis_irrigation', 'graphs/water_irrigation.vg.json');
        console.log('vis_irrigation loaded successfully');

        // Load the vis_solar_wind
        await vegaEmbed('#vis_renewable_enegy_solwin', 'graphs/renewable_enegy_solwin.json');
        console.log('vis_solar_wind loaded successfully');

        // Update the highest consumption lists
        updateHighestConsumption(waterData, electricityData);
    } catch (error) {
        console.error('Error loading visualizations:', error);
    }
}

// Function to handle sidebar content switching
function handleSidebarContent() {
    const sidebar = document.querySelector('.sidebar');
    const highestConsumption = document.querySelector('.highest-consumption');
    const populationStats = document.querySelector('.population-stats');
    const waterConsumption = document.querySelector('.water-consumption');
    
    // Set initial active content
    setActiveContent(highestConsumption);
    
    // Define the sections and their corresponding sidebar contents
    const sections = [
        { element: document.querySelector('h2:contains("Victoria\'s Consumption of Electricity")'), content: highestConsumption },
        { element: document.querySelector('h2:contains("Population Density vs Energy Consumption and Generation Comparison (2023)")'), content: populationStats },
        { element: document.querySelector('h2:contains("Water Consumption throughout Victoria")'), content: waterConsumption }
    ];
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + window.innerHeight / 3; // Adjust this value to change when the switch happens
        
        for (let i = sections.length - 1; i >= 0; i--) {
            if (sections[i].element && scrollPosition > sections[i].element.offsetTop) {
                setActiveContent(sections[i].content);
                break;
            }
        }
    });
}

function setActiveContent(activeElement) {
    const contents = document.querySelectorAll('.sidebar-content');
    contents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    activeElement.classList.add('active');
    activeElement.style.display = 'block';
}

// Function to find elements by text content
function getElementByText(selector, text) {
    return Array.from(document.querySelectorAll(selector)).find(
        element => element.textContent.includes(text)
    );
}

// Load visualizations and update consumption lists
document.addEventListener('DOMContentLoaded', (event) => {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });

    loadVisualizations().then(() => {
        handleSidebarContent();
        
        // Trigger a scroll event to set the correct initial state
        window.dispatchEvent(new Event('scroll'));
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('show');
        }
    });
});