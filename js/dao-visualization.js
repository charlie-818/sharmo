/**
 * DAO Visualization - Real Estate Property DAO Focused
 * A visualization showing the relationship between real estate property DAOs, investors, properties, and managers
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeDAOVisualization();
});

/**
 * Initialize the DAO visualization with a clear, real estate focused design
 */
function initializeDAOVisualization() {
    // Get the container element
    const container = document.querySelector('.dao-network');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Set up the base SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 900 600"); // Expanded viewBox for more space
    
    // Add a subtle background pattern first (so it's behind everything)
    addBackground(svg);
    
    // Create the main elements group
    const mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    // Define the center of the visualization
    const centerX = 450;
    const centerY = 300;
    
    // Create the central DAO node
    createCircleNode(centerX, centerY, 50, "#6366f1", "Property\nDAO", "#FFFFFF", mainGroup);
    
    // Create property nodes in a semi-circle below the DAO
    const propertyCount = 5; // Add one more property
    const propertyPositions = [];
    const propertyRadius = 250; // Increased radius
    const propertyStartAngle = Math.PI * 0.1; // Starting slightly right of bottom
    const propertyEndAngle = Math.PI * 0.9; // Ending slightly left of bottom
    
    for (let i = 0; i < propertyCount; i++) {
        const angle = propertyStartAngle + (i / (propertyCount - 1)) * (propertyEndAngle - propertyStartAngle);
        const x = centerX + propertyRadius * Math.cos(angle);
        const y = centerY + propertyRadius * Math.sin(angle);
        propertyPositions.push({ x, y });
        
        // Create property with more specific information
        const propertyTypes = ["Residential\nApartment", "Commercial\nOffice", "Mixed-Use\nDevelopment", "Single Family\nHomes", "Retail\nSpace"];
        createPropertyNode(x, y, 35, "#3b82f6", propertyTypes[i], "#FFFFFF", mainGroup);
        
        // Connect each property to the DAO
        createConnection(centerX, centerY, x, y, "#3b82f680", 2, mainGroup);
    }
    
    // Create investor nodes in a semi-circle above the DAO
    const investorCount = 9; // Add one more investor
    const investorRadius = 230; // Increased radius
    const investorStartAngle = -Math.PI * 0.85; // Starting above and to the left
    const investorEndAngle = -Math.PI * 0.15; // Ending above and to the right
    
    const investorPositions = [];
    for (let i = 0; i < investorCount; i++) {
        const angle = investorStartAngle + (i / (investorCount - 1)) * (investorEndAngle - investorStartAngle);
        const x = centerX + investorRadius * Math.cos(angle);
        const y = centerY + investorRadius * Math.sin(angle);
        investorPositions.push({ x, y });
        
        // Create different types of investors to represent diversity
        let investorLabel;
        if (i < 3) {
            investorLabel = "Individual\nInvestor";
        } else if (i < 6) {
            investorLabel = "Investment\nFund";
        } else {
            investorLabel = "Financial\nInstitution";
        }
        
        createCircleNode(x, y, 30, "#34d399", investorLabel, "#FFFFFF", mainGroup);
        
        // Connect each investor to the DAO
        createConnection(centerX, centerY, x, y, "#6366f180", 2, mainGroup);
    }
    
    // Create service providers on the right
    const serviceProviderCount = 4; // Add one more service provider
    const serviceLabels = ["Property\nManager", "Legal\nAdvisor", "Maintenance\nContractor", "Insurance\nProvider"];
    const serviceColors = ["#f59e0b", "#8b5cf6", "#ec4899", "#fb7185"];
    const serviceStartX = centerX + 270; // Pushed further to the right
    const serviceStartY = centerY - 180;
    const serviceSpacing = 120; // Increased spacing
    
    for (let i = 0; i < serviceProviderCount; i++) {
        const x = serviceStartX + 30;
        const y = serviceStartY + (i * serviceSpacing);
        createRectNode(x, y, 40, serviceColors[i], serviceLabels[i], "#FFFFFF", mainGroup);
        
        // Connect service providers to the DAO
        createConnection(centerX, centerY, x - 40, y, serviceColors[i] + "80", 2, mainGroup);
    }
    
    // Create governance elements on the left
    const governanceCount = 4; // Add one more governance element
    const governanceLabels = ["Governance\nVoting", "DAO\nTreasury", "Smart\nContracts", "Regulatory\nCompliance"];
    const governanceColors = ["#0ea5e9", "#14b8a6", "#a855f7", "#38bdf8"];
    const governanceStartX = centerX - 270; // Pushed further to the left
    const governanceStartY = centerY - 180;
    const governanceSpacing = 120; // Increased spacing
    
    for (let i = 0; i < governanceCount; i++) {
        const x = governanceStartX - 30;
        const y = governanceStartY + (i * governanceSpacing);
        createHexNode(x, y, 40, governanceColors[i], governanceLabels[i], "#FFFFFF", mainGroup);
        
        // Connect governance elements to the DAO
        createConnection(centerX, centerY, x + 40, y, governanceColors[i] + "80", 2, mainGroup);
    }
    
    // Add the main group to the SVG
    svg.appendChild(mainGroup);
    
    // Add the SVG to the container
    container.appendChild(svg);
}

/**
 * Create a circle node with text
 */
function createCircleNode(x, y, radius, fillColor, text, textColor, parent) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    // Create the circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", fillColor);
    circle.setAttribute("stroke", "#FFFFFF");
    circle.setAttribute("stroke-width", "2");
    
    // Add a drop shadow
    circle.setAttribute("filter", "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.15))");
    
    // Handle multiline text
    const lines = text.split('\n');
    const lineHeight = lines.length > 1 ? 14 : 0;
    
    // Add each line of text
    lines.forEach((line, index) => {
        const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElement.setAttribute("x", x);
        textElement.setAttribute("y", y + (index - (lines.length - 1) / 2) * lineHeight);
        textElement.setAttribute("text-anchor", "middle");
        textElement.setAttribute("dominant-baseline", "middle");
        textElement.setAttribute("font-family", "Poppins, sans-serif");
        textElement.setAttribute("font-weight", "bold");
        textElement.setAttribute("font-size", radius < 30 ? "10" : "12");
        textElement.setAttribute("fill", textColor);
        textElement.textContent = line;
        group.appendChild(textElement);
    });
    
    group.appendChild(circle);
    // Add text elements after appending the circle to ensure text is on top
    lines.forEach((line, index) => {
        const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElement.setAttribute("x", x);
        textElement.setAttribute("y", y + (index - (lines.length - 1) / 2) * lineHeight);
        textElement.setAttribute("text-anchor", "middle");
        textElement.setAttribute("dominant-baseline", "middle");
        textElement.setAttribute("font-family", "Poppins, sans-serif");
        textElement.setAttribute("font-weight", "bold");
        textElement.setAttribute("font-size", radius < 30 ? "10" : "12");
        textElement.setAttribute("fill", textColor);
        textElement.textContent = line;
        group.appendChild(textElement);
    });
    
    parent.appendChild(group);
    return group;
}

/**
 * Create a property node (house shape with text)
 */
function createPropertyNode(x, y, size, fillColor, text, textColor, parent) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    // Create a house shape
    const house = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const halfSize = size / 2;
    
    // House path: roof and body
    const pathData = `
        M ${x - halfSize * 1.2},${y + halfSize * 0.3}
        L ${x},${y - halfSize}
        L ${x + halfSize * 1.2},${y + halfSize * 0.3}
        L ${x + halfSize * 1.2},${y + halfSize}
        L ${x - halfSize * 1.2},${y + halfSize}
        Z
    `;
    
    house.setAttribute("d", pathData);
    house.setAttribute("fill", fillColor);
    house.setAttribute("stroke", "#FFFFFF");
    house.setAttribute("stroke-width", "2");
    house.setAttribute("filter", "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.15))");
    
    // Add text
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttribute("x", x);
    textElement.setAttribute("y", y + halfSize * 1.5);
    textElement.setAttribute("text-anchor", "middle");
    textElement.setAttribute("font-family", "Poppins, sans-serif");
    textElement.setAttribute("font-weight", "bold");
    textElement.setAttribute("font-size", "12");
    textElement.setAttribute("fill", textColor);
    textElement.textContent = text;
    
    group.appendChild(house);
    group.appendChild(textElement);
    parent.appendChild(group);
    
    return group;
}

/**
 * Create a rectangular node with text
 */
function createRectNode(x, y, size, fillColor, text, textColor, parent) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    // Create the rectangle
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x - size);
    rect.setAttribute("y", y - size/2);
    rect.setAttribute("width", size * 2);
    rect.setAttribute("height", size);
    rect.setAttribute("rx", "8"); // Rounded corners
    rect.setAttribute("ry", "8");
    rect.setAttribute("fill", fillColor);
    rect.setAttribute("stroke", "#FFFFFF");
    rect.setAttribute("stroke-width", "2");
    rect.setAttribute("filter", "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.15))");
    
    // Handle multiline text
    const lines = text.split('\n');
    const lineHeight = lines.length > 1 ? 14 : 0;
    
    group.appendChild(rect);
    // Add each line of text
    lines.forEach((line, index) => {
        const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElement.setAttribute("x", x);
        textElement.setAttribute("y", y + (index - (lines.length - 1) / 2) * lineHeight);
        textElement.setAttribute("text-anchor", "middle");
        textElement.setAttribute("dominant-baseline", "middle");
        textElement.setAttribute("font-family", "Poppins, sans-serif");
        textElement.setAttribute("font-weight", "bold");
        textElement.setAttribute("font-size", "11");
        textElement.setAttribute("fill", textColor);
        textElement.textContent = line;
        group.appendChild(textElement);
    });
    
    parent.appendChild(group);
    return group;
}

/**
 * Create a hexagonal node with text
 */
function createHexNode(x, y, size, fillColor, text, textColor, parent) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    // Create a hexagon shape
    const hexagon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const points = [];
    
    // Calculate hexagon points
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const pointX = x + size * Math.cos(angle);
        const pointY = y + size * Math.sin(angle);
        points.push(`${pointX},${pointY}`);
    }
    
    hexagon.setAttribute("points", points.join(" "));
    hexagon.setAttribute("fill", fillColor);
    hexagon.setAttribute("stroke", "#FFFFFF");
    hexagon.setAttribute("stroke-width", "2");
    hexagon.setAttribute("filter", "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.15))");
    
    // Handle multiline text
    const lines = text.split('\n');
    const lineHeight = lines.length > 1 ? 14 : 0;
    
    group.appendChild(hexagon);
    // Add each line of text
    lines.forEach((line, index) => {
        const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElement.setAttribute("x", x);
        textElement.setAttribute("y", y + (index - (lines.length - 1) / 2) * lineHeight);
        textElement.setAttribute("text-anchor", "middle");
        textElement.setAttribute("dominant-baseline", "middle");
        textElement.setAttribute("font-family", "Poppins, sans-serif");
        textElement.setAttribute("font-weight", "bold");
        textElement.setAttribute("font-size", "11");
        textElement.setAttribute("fill", textColor);
        textElement.textContent = line;
        group.appendChild(textElement);
    });
    
    parent.appendChild(group);
    return group;
}

/**
 * Create a connection line between two points
 */
function createConnection(x1, y1, x2, y2, color, width, parent) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", width);
    
    parent.appendChild(line);
    return line;
}

/**
 * Add subtle background elements to the visualization
 */
function addBackground(svg) {
    const backgroundGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    backgroundGroup.setAttribute("opacity", "0.05"); // More subtle background
    
    // Add a city skyline silhouette
    const skyline = document.createElementNS("http://www.w3.org/2000/svg", "path");
    skyline.setAttribute("d", "M50,400 L100,400 L100,350 L130,350 L130,370 L160,370 L160,320 L190,320 L190,380 L220,380 L220,350 L250,350 L250,300 L280,300 L280,350 L310,350 L310,330 L340,330 L340,350 L370,350 L370,280 L400,280 L400,330 L430,330 L430,350 L460,350 L460,300 L490,300 L490,380 L520,380 L520,340 L550,340 L550,370 L580,370 L580,320 L610,320 L610,360 L640,360 L640,330 L670,330 L670,400 L720,400");
    skyline.setAttribute("stroke", "#6366f1");
    skyline.setAttribute("stroke-width", "2");
    skyline.setAttribute("fill", "none");
    
    // Add a dollar sign
    const dollar = document.createElementNS("http://www.w3.org/2000/svg", "text");
    dollar.setAttribute("x", "700");
    dollar.setAttribute("y", "100");
    dollar.setAttribute("font-family", "Arial, sans-serif");
    dollar.setAttribute("font-size", "60");
    dollar.setAttribute("fill", "#34d399");
    dollar.setAttribute("font-weight", "bold");
    dollar.textContent = "$";
    
    // Add subtle grid lines in the background
    const grid = document.createElementNS("http://www.w3.org/2000/svg", "g");
    for (let i = 0; i < 11; i++) {
        const horizontalLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        horizontalLine.setAttribute("x1", "50");
        horizontalLine.setAttribute("y1", 50 + i * 50);
        horizontalLine.setAttribute("x2", "750");
        horizontalLine.setAttribute("y2", 50 + i * 50);
        horizontalLine.setAttribute("stroke", "#CBD5E1");
        horizontalLine.setAttribute("stroke-width", "1");
        horizontalLine.setAttribute("stroke-dasharray", "5,5");
        grid.appendChild(horizontalLine);
        
        const verticalLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        verticalLine.setAttribute("x1", 50 + i * 75);
        verticalLine.setAttribute("y1", "50");
        verticalLine.setAttribute("x2", 50 + i * 75);
        verticalLine.setAttribute("y2", "450");
        verticalLine.setAttribute("stroke", "#CBD5E1");
        verticalLine.setAttribute("stroke-width", "1");
        verticalLine.setAttribute("stroke-dasharray", "5,5");
        grid.appendChild(verticalLine);
    }
    
    backgroundGroup.appendChild(grid);
    backgroundGroup.appendChild(skyline);
    backgroundGroup.appendChild(dollar);
    svg.appendChild(backgroundGroup);
} 