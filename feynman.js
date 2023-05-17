const { Poppler } = require("node-poppler");
const fs = require("fs");
const prompt = require("prompt-sync")();

const parsePDF = async () => {
    const poppler = new Poppler();
    const text = await poppler.pdfToText(
        "Feynman Diagrams and Conservation Laws Lab.pdf"
    );
    fs.writeFileSync("feynman-parsed.txt", text);
};

const labelSymbols = async () => {
    const text = fs.readFileSync("feynman-parsed.txt", "utf8").split("\n");
    const symbols = new Set();
    const symbolData = [];
    for (var line of text) {
        line = line.substring(line.indexOf(" ")).trim();
        const lineSymbols = line.split(" ");
        for (var symbol of lineSymbols) {
            if (symbol != "→" && symbol != "+" && !symbols.has(symbol)) {
                symbols.add(symbol);
                console.log(`Particle: ${symbol}`);
                let charge = prompt("Charge: ");
                if (charge == "e") {
                    charge = "50"; // arbitrary large value
                } else if (charge == "-e") {
                    charge = "-50"; // arbitrary large value
                } else if (charge == "2e") {
                    charge = "100"; // arbitrary large value
                }
                const baryon = prompt("Baryon Number: ");
                const lepton = prompt("Lepton Number: ");
                const strange = prompt("Strangeness: ");
                symbolData.push({
                    symbol: symbol,
                    charge: parseInt(charge),
                    baryon: parseInt(baryon),
                    lepton: parseInt(lepton),
                    strange: parseInt(strange),
                });
            }
        }
    }
    fs.writeFileSync("symbols.json", JSON.stringify(symbolData, null, 4));
};

const getSymbol = (symbol, data) => {
    for (var i = 0; i < data.length; i++) {
        if (data[i].symbol == symbol) {
            return data[i];
        }
    }
};

(async () => {
    // Parse the PDF
    if (!fs.existsSync("feynman-parsed.txt")) {
        await parsePDF();
    }

    // Create the symbols JSON
    if (!fs.existsSync("symbols.json")) {
        await labelSymbols();
    }

    // Check each equation
    const text = fs.readFileSync("feynman-parsed.txt", "utf8").split("\n");
    const symbolData = JSON.parse(fs.readFileSync("symbols.json", "utf8"));
    let i = 1;
    for (var line of text) {
        line = line.substring(line.indexOf(" ")).trim();
        const lineSymbols = line.split(" ");
        let side = false;
        let left = [];
        let right = [];
        for (var symbol of lineSymbols) {
            if (symbol == "+") {
                continue;
            }
            if (symbol == "→") {
                side = true;
                continue;
            }
            if (!side) {
                // Left side
                left.push(getSymbol(symbol, symbolData));
            } else {
                // Right side
                right.push(getSymbol(symbol, symbolData));
            }
        }
        // Print to user
        console.log(`${i}.          ${line}`);
        // Check conservation of charge
        process.stdout.write("Charge (Q):  ");
        let leftCharge = 0,
            rightCharge = 0;
        for (var leftSymbol of left) {
            if (leftSymbol.charge == "50") {
                process.stdout.write("e ");
            } else if (leftSymbol.charge == "-50") {
                process.stdout.write("-e ");
            } else if (leftSymbol.charge == "100") {
                process.stdout.write("2e ");
            } else {
                process.stdout.write(leftSymbol.charge + " ");
            }
            leftCharge += leftSymbol.charge;
        }

        for (var rightSymbol of right) {
            if (rightSymbol.charge == "50") {
                process.stdout.write("e ");
            } else if (rightSymbol.charge == "-50") {
                process.stdout.write("-e ");
            } else if (rightSymbol.charge == "100") {
                process.stdout.write("2e ");
            } else {
                process.stdout.write(rightSymbol.charge + " ");
            }
            rightCharge += rightSymbol.charge;
        }
        console.log(leftCharge == rightCharge ? "Allowed" : "Not Allowed");
        // Check conservation of baryon number
        process.stdout.write("Baryon (B):  ");
        let leftBaryon = 0,
            rightBaryon = 0;
        for (var leftSymbol of left) {
            process.stdout.write(leftSymbol.baryon + " ");
            leftBaryon += leftSymbol.baryon;
        }

        for (var rightSymbol of right) {
            process.stdout.write(rightSymbol.baryon + " ");
            rightBaryon += rightSymbol.baryon;
        }
        console.log(leftBaryon == rightBaryon ? "Allowed" : "Not Allowed");
        // Check conservation of muon lepton number
        process.stdout.write("Muon Lepton (L):  ");
        let leftmLepton = 0,
            rightmLepton = 0;
        for (var leftSymbol of left) {
            process.stdout.write(leftSymbol.mlepton + " ");
            leftmLepton += leftSymbol.mlepton;
        }

        for (var rightSymbol of right) {
            process.stdout.write(rightSymbol.mlepton + " ");
            rightmLepton += rightSymbol.mlepton;
        }
        console.log(leftmLepton == rightmLepton ? "Allowed" : "Not Allowed");
        // Check conservation of electron lepton number
        process.stdout.write("Electron Lepton (L):  ");
        let lefteLepton = 0,
            righteLepton = 0;
        for (var leftSymbol of left) {
            process.stdout.write(leftSymbol.elepton + " ");
            lefteLepton += leftSymbol.elepton;
        }

        for (var rightSymbol of right) {
            process.stdout.write(rightSymbol.elepton + " ");
            righteLepton += rightSymbol.elepton;
        }
        console.log(lefteLepton == righteLepton ? "Allowed" : "Not Allowed");
        // Check conservation of strange
        // Only needs to be conserved for strong and em, not for weak
        let leftStrange = 0,
            rightStrange = 0;
        if (
            left.includes("𝛾") ||
            right.includes("𝛾") ||
            left.includes() ||
            right.includes() ||
            left.includes() ||
            right.includes()
        ) {
            process.stdout.write("Strange (S): ");
            for (var leftSymbol of left) {
                process.stdout.write(leftSymbol.strange + " ");
                leftStrange += leftSymbol.strange;
            }

            for (var rightSymbol of right) {
                process.stdout.write(rightSymbol.strange + " ");
                rightStrange += rightSymbol.strange;
            }
            console.log(
                leftStrange == rightStrange ? "Allowed" : "Not Allowed"
            );
        }
        console.log(
            leftCharge == rightCharge &&
                leftBaryon == rightBaryon &&
                lefteLepton == righteLepton &&
                leftmLepton == rightmLepton &&
                leftStrange == rightStrange
                ? "Allowed"
                : "Not Allowed"
        );
        console.log("---------------------------------");
        i++;
    }
})();
