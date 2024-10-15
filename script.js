// Function to update highest consumption lists
function updateHighestConsumption(waterData, electricityData) {
    // Define region colors
    const regionColors = {
        "Inner Melbourne": "#000000",
        "Western Melbourne": "#000000",
        "Northern Melbourne": "#000000",
        "Eastern Melbourne": "#000000",
        "Southern Melbourne": "#000000",
        "Bayside Peninsula": "#000000",
        "Regional Victoria": "#000000"
    };

    // Function to get color based on suburb name or SA2 code
    function getSuburbColor(item) {
        if (item.sa2_code_2011 && item.sa2_code_2011.startsWith('20')) {
            return regionColors["Regional Victoria"];
        }
        const waterItem = waterData.find(w => w.Suburbs.trim() === item.sa2_name.trim());
        return waterItem ? regionColors[waterItem.Region] : "#000000";
    }

    // Sort data by electricity consumption
    const sortedByElectricity = [...electricityData]
        .filter(item => !isNaN(parseFloat(item['Mean - 2012 (kWh)'])) && 
                        (item.sa2_code_2011.startsWith('20') || waterData.some(w => w.Suburbs.trim() === item.sa2_name.trim())))
        .sort((a, b) => parseFloat(b['Mean - 2012 (kWh)']) - parseFloat(a['Mean - 2012 (kWh)']));
    
    // Sort data by water consumption
    const sortedByWater = [...waterData]
        .filter(item => !isNaN(parseFloat(item['2009'])))
        .sort((a, b) => parseFloat(b['2009']) - parseFloat(a['2009']));
    
    // Update electricity list
    const electricityList = document.getElementById('highest-electricity');
    electricityList.innerHTML = sortedByElectricity.slice(0, 5).map(item => {
        const color = getSuburbColor(item);
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
        await vegaEmbed('#vis_map', 'energy_consumption_map.vg.json');
        console.log('vis_map loaded successfully');

        // Load the Water vs Electricity Consumption data
        const waterData = await loadCSVData('data/wateruse.csv');
        const electricityData = await loadCSVData('data/supplied-sa2s.csv');
        
        // Render the Water vs Electricity Consumption scatter plot
        await vegaEmbed('#vis_water_elec', 'vic-consumption-water-elec.json');
        console.log('vis_water_elec loaded successfully');

        // Load the Victoria Energy Consumption map
        await vegaEmbed('#vis_pop_eng', 'population-density-energy-comparison.vg.json');
        console.log('vis_pop_eng loaded successfully');

        // Load the Solar Panel info
        await vegaEmbed('#vis_solar', 'sa4_solar_installations.vg.json');
        console.log('vis_solar loaded successfully');
        
        // Load the vis_irrigation
        await vegaEmbed('#vis_irrigation', 'water_irrigation.vg.json');
        console.log('vis_irrigation loaded successfully');

        // Load the vis_solar_wind
        await vegaEmbed('#vis_renewable_enegy_solwin', 'renewable_enegy_solwin.json');
        console.log('vis_solar_wind loaded successfully');

        // Update the highest consumption lists
        updateHighestConsumption(waterData, electricityData);
    } catch (error) {
        console.error('Error loading visualizations:', error);
    }
}

// Function to handle sidebar content switching
function handleSidebarContent() {
    const main = document.querySelector('main');
    const sidebarContents = document.querySelectorAll('.sidebar-content');
    
    // Define the sections and their corresponding sidebar contents
    const sections = [
        { 
            element: getElementByText('h2', "Victoria's Resource Management Story"),
            content: document.querySelector('.highest-consumption')
        },
        { 
            element: getElementByText('h2', "Renewable Energy Resource Usage"),
            content: document.querySelector('.population-stats')
        },
        { 
            element: getElementByText('h2', "Water Consumption throughout Victoria"),
            content: document.querySelector('.water-consumption')
        }
    ];
    
    // Set initial active content
    setActiveContent(sections[0].content);
    
    // Use IntersectionObserver to detect when sections enter/exit the viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeSection = sections.find(section => section.element === entry.target);
                if (activeSection) {
                    setActiveContent(activeSection.content);
                    console.log(`Activated section: ${activeSection.element.textContent.trim()}`);
                }
            }
        });
    }, { threshold: 0.5 }); // Trigger when 50% of the section is visible

    // Observe all section elements
    sections.forEach(section => {
        if (section.element) {
            observer.observe(section.element);
        }
    });
}

// Function to set active content
function setActiveContent(activeElement) {
    const contents = document.querySelectorAll('.sidebar-content');
    contents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    activeElement.classList.add('active');
    activeElement.style.display = 'block';
}


// Helper function to find elements by text content
function getElementByText(selector, text) {
    return Array.from(document.querySelectorAll(selector)).find(
        element => element.textContent.trim().includes(text.trim())
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
        //handleSidebarContent();
        
        // Trigger a scroll event to set the correct initial state
        //window.dispatchEvent(new Event('scroll'));
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('show');
        }
    });
});