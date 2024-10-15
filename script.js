function updateHighestConsumption(waterData, electricityData) {
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
    electricityList.innerHTML = sortedByElectricity.slice(0, 5).map(item => `
        <li style="margin-bottom: 10px;">
            <div>${item.sa2_name}:</div>
            <div style="margin-left: 10px;">${Math.round(parseFloat(item['Mean - 2012 (kWh)']))} kWh</div>
        </li>
    `).join('');
    
    // Update water list
    const waterList = document.getElementById('highest-water');
    waterList.innerHTML = sortedByWater.slice(0, 5).map(item => `
        <li style="margin-bottom: 10px;">
            <div>${item.Suburbs}:</div>
            <div style="margin-left: 10px;">${Math.round(parseFloat(item['2009']))} L/household/day</div>
        </li>
    `).join('');

    const waterUsageData = [
        { year: 2018, volume: 1634030 },
        { year: 2017, volume: 1546197 },
        { year: 2019, volume: 1494826 },
        { year: 2021, volume: 1324234 },
        { year: 2020, volume: 1308730 }
    ];
    
    // Update water usage list
    const waterUsageList = document.getElementById('top-water-usage-years');
    waterUsageList.innerHTML = waterUsageData.map(item => `
        <li style="margin-bottom: 10px;">
            <div>${item.year}:</div>
            <div style="margin-left: 10px;">
                Volume of water applied to irrigated agricultural land: ${item.volume.toLocaleString()} ML
            </div>
        </li>
    `).join('');
}

function updateLowestConsumptionDensityRatio(electricityData, populationData) {
    // Combine electricity and population data
    const combinedData = electricityData.map(elecItem => {
        const popItem = populationData.find(p => p.sa2_code_2011 === elecItem.sa2_code_2011);
        if (popItem) {
            return {
                sa2_name: elecItem.sa2_name,
                consumption: parseFloat(elecItem['Mean - 2012 (kWh)']),
                density: parseFloat(popItem['persons/km2']),
                ratio: parseFloat(elecItem['Mean - 2012 (kWh)']) / parseFloat(popItem['persons/km2'])
            };
        }
        return null;
    }).filter(item => item !== null && !isNaN(item.ratio) && item.ratio > 0);

    // Sort data by consumption to density ratio (ascending order for lowest)
    const sortedByRatio = combinedData.sort((a, b) => a.ratio - b.ratio);

    // Update the list
    const ratioList = document.getElementById('lowest-consumption-density-ratio');
    ratioList.innerHTML = sortedByRatio.slice(0, 4).map(item => `
        <li style="margin-bottom: 10px;">
            <div>${item.sa2_name}:</div>
            <div style="margin-left: 10px;">
                Ratio: ${item.ratio.toFixed(2)} kWh per person/km²
            </div>
            <div style="margin-left: 10px;">
                Consumption: ${Math.round(item.consumption).toLocaleString()} kWh
            </div>
            <div style="margin-left: 10px;">
                Density: ${item.density.toFixed(2)} persons/km²
            </div>
        </li>
    `).join('');
}

function updateSustainablePractices(victoriaEnergyData, landData) {
    // Process Victoria Energy Data (unchanged)
    victoriaEnergyData.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    
    let totalIncrease = 0;
    let yearsCount = 0;
    
    const renewablesData = victoriaEnergyData.reduce((acc, curr, index, array) => {
        if (index > 0) {
            const prevYear = parseFloat(array[index - 1].Renewables);
            const currYear = parseFloat(curr.Renewables);
            const increase = currYear - prevYear;
            totalIncrease += increase;
            yearsCount++;
            
            acc.push({
                year: parseInt(curr.Year),
                renewables: currYear,
                increase: increase,
                total: parseFloat(curr.Total.replace(',', ''))
            });
        }
        return acc;
    }, []);

    const averageIncrease = totalIncrease / yearsCount;
    
    renewablesData.sort((a, b) => b.increase - a.increase);

    // Update renewables list (unchanged)
    const renewablesList = document.getElementById('top-renewables-usage');
    renewablesList.innerHTML = `
        <li style="margin-bottom: 10px;">
            <div>Average Yearly Increase in Renewables:</div>
            <div style="margin-left: 10px;">
                ${averageIncrease.toFixed(2)} PJ
            </div>
        </li>
    ` + renewablesData.slice(0, 3).map(item => `
        <li style="margin-bottom: 10px;">
            <div>${item.year}:</div>
            <div style="margin-left: 10px;">
                Renewables: ${item.renewables.toFixed(1)} PJ
            </div>
            <div style="margin-left: 10px;">
                Increase: ${item.increase.toFixed(2)} PJ
            </div>
            <div style="margin-left: 10px;">
                Total Energy: ${item.total.toFixed(1)} PJ
            </div>
        </li>
    `).join('');

    const solarData = [
        { region: "Melbourne - South East", average: 9650 },
        { region: "Melbourne - West", average: 9482 },
        { region: "Melbourne - North East", average: 5010 },
        { region: "Melbourne - Outer East", average: 4763 }
    ];

    // Update solar installations list
    const solarList = document.getElementById('top-solar-installations');
    solarList.innerHTML = solarData.map(item => `
        <li style="margin-bottom: 10px;">
            <div>${item.region}:</div>
            <div style="margin-left: 10px;">
                Average Solar Panel Installations (2018-2023): ${item.average.toLocaleString()}
            </div>
        </li>
    `).join('');
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

        // Load the Water vs Electricity Consumption data
        const waterData = await loadCSVData('data/wateruse.csv');
        const electricityData = await loadCSVData('data/supplied-sa2s.csv');
        const populationData  = await loadCSVData('data/population-sa2s.csv');
        const victoriaEnergyData = await loadCSVData('data/victoria_energy.csv');
        const landData = await loadCSVData('data/SA4_Vic_LandData.csv');

        // Update the highest consumption lists
        updateHighestConsumption(waterData, electricityData);
        updateLowestConsumptionDensityRatio(electricityData, populationData);
        updateSustainablePractices(victoriaEnergyData, landData);


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
            element: getElementByText('p', "An interesting comparison to note is that more urban regions inside of Melbourne tend to have a higher population density, but have a lower mean electricity total. This could be because of the maintance of good energy practices, whilst more rural regions tend to have higher energy usage."),
            content: document.querySelector('.highest-consumption')
        },
        { 
            element: getElementByText('h2', "Renewable Energy Resource Usage"),
            content: document.querySelector('.population-stats')
        },
        { 
            element: getElementByText('p', "This visualisation show the different statisical areas (level 4), and how many solar panels were installed on households each year. From the data you can see that there is a consistant increase up to 2021, which is when the solar panel rebate was introduced into Victoria, creating incentive to add solar panels to your house."),
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

function setActiveContent(activeElement) {
    const contents = document.querySelectorAll('.sidebar-content');
    contents.forEach(content => {
        if (content === activeElement) {
            content.style.display = 'block';
            setTimeout(() => {
                content.classList.add('active');
            }, 10);
        } else {
            content.classList.remove('active');
            setTimeout(() => {
                content.style.display = 'none';
            }, 0); // Match this to the transition duration in CSS
        }
    });
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