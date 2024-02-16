// Function to open an image file
function openImage(fileInput, callback) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            callback(img);
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(fileInput.files[0]);
}

// Function to create a grid of specified rows and columns
function createGrid(rows, cols, width, height) {
    const grid = [];

    const gridWidth = width / cols;
    const gridHeight = height / rows;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const box = {
                x: j * gridWidth,
                y: i * gridHeight,
                width: gridWidth,
                height: gridHeight,
            };
            grid.push(box);
        }
    }

    return grid;
}

// Function to calculate brightness of a grid section with sampling
function calculateBrightness(context, box, sampleSize) {
    const imageData = context.getImageData(box.x, box.y, box.width, box.height);
    const data = imageData.data;

    let totalBrightness = 0;
    const sampleStep = Math.max(1, Math.floor(data.length / (4 * sampleSize)));

    for (let i = 0; i < data.length; i += sampleStep * 4) {
        totalBrightness += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    const averageBrightness = totalBrightness / (data.length / (4 * sampleSize));

    // Normalize the brightness value to a scale of 1 to 6
    const invertedBrightness = Math.round(((255 - averageBrightness) / 255) * 5 + 1);

    return invertedBrightness;
}

// Function to handle file input change with throttling
function handleFileInputChange(fileInput, rows, cols, sampleSize) {
    openImage(fileInput, function (image) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);

        const grid = createGrid(rows, cols, canvas.width, canvas.height);

        let resultMatrix = Array.from({ length: rows }, () => Array(cols).fill(0));

        let index = 0;
        const processNextSection = () => {
            if (index < grid.length) {
                const box = grid[index];
                const brightness = calculateBrightness(context, box, sampleSize);
                resultMatrix[Math.floor(index / cols)][index % cols] = brightness;
                index++;
                setTimeout(processNextSection, 0); // Introduce a delay to prevent freezing
            } else {
                // Print the resultMatrix
                for (let i = 0; i < rows; i++) {
                    console.log(resultMatrix[i].join(" "));
                }
            }
        };

        processNextSection();
    });
}

// Example usage with a sample size of 10 (adjust as needed)
const fileInput = document.getElementById("fileInput"); // Replace with your file input element
const rows = 100;
const cols = 100;
const sampleSize = 10;

fileInput.addEventListener("change", function () {
    handleFileInputChange(fileInput, rows, cols, sampleSize);
});
