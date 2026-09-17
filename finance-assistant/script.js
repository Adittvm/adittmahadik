const API_URL =
    "https://zuqyrgsy8k.execute-api.us-east-1.amazonaws.com/analyze";

const analyzeButton = document.getElementById("analyzeButton");

analyzeButton.addEventListener("click", analyzeBudget);
let expenseChart = null;

function getNumberValue(elementId) {
    return Number(document.getElementById(elementId).value);
}


function getNumberValue(elementId) {
    return Number(document.getElementById(elementId).value);
}


function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(value);
}


function setButtonLoading(isLoading) {
    if (isLoading) {
        analyzeButton.disabled = true;
        analyzeButton.innerText = "Analyzing Your Budget...";
    } else {
        analyzeButton.disabled = false;
        analyzeButton.innerText = "Analyze My Budget";
    }
}


function updateHealthBadge(health) {
    const badge = document.getElementById("healthBadge");

    badge.innerText = health;

    badge.className = "health-badge";

    if (health === "Excellent") {
        badge.classList.add("health-excellent");
    } else if (health === "Good") {
        badge.classList.add("health-good");
    } else if (health === "Fair") {
        badge.classList.add("health-fair");
    } else {
        badge.classList.add("health-attention");
    }
}


function displayRecommendations(recommendations) {
    const list = document.getElementById("recommendationsList");

    list.innerHTML = "";

    recommendations.forEach(function (recommendation) {
        const listItem = document.createElement("li");
        listItem.innerText = recommendation;
        list.appendChild(listItem);
    });
}


function validateForm(data) {
    if (data.monthlyIncome <= 0) {
        throw new Error(
            "Please enter a monthly income greater than zero."
        );
    }

    const expenseFields = [
        data.housing,
        data.food,
        data.transportation,
        data.utilities,
        data.debtPayments,
        data.entertainment,
        data.otherExpenses
    ];

    const hasNegativeExpense = expenseFields.some(function (value) {
        return value < 0;
    });

    if (hasNegativeExpense) {
        throw new Error("Expenses cannot contain negative numbers.");
    }
}


async function analyzeBudget() {
    setButtonLoading(true);

    const data = {
        monthlyIncome: getNumberValue("income"),
        housing: getNumberValue("housing"),
        food: getNumberValue("food"),
        transportation: getNumberValue("transportation"),
        utilities: getNumberValue("utilities"),
        debtPayments: getNumberValue("debt"),
        entertainment: getNumberValue("entertainment"),
        otherExpenses: getNumberValue("other"),
        savingsGoal: document.getElementById("goal").value.trim(),
        question: document.getElementById("question").value.trim()
    };

    try {
        validateForm(data);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok || result.success !== true) {
            throw new Error(
                result.error || "The analysis could not be completed."
            );
        }

        document.getElementById("incomeResult").innerText =
            formatCurrency(result.summary.monthlyIncome);

        document.getElementById("expenseResult").innerText =
            formatCurrency(result.summary.totalExpenses);

        document.getElementById("remainingResult").innerText =
            formatCurrency(result.summary.remainingMoney);

        document.getElementById("savingsResult").innerText =
            result.summary.savingsRate.toFixed(1) + "%";

        document.getElementById("analysisSummary").innerText =
            result.analysis.summary;

        document.getElementById("weeklyAction").innerText =
            result.analysis.weeklyAction;

        document.getElementById("goalAdvice").innerText =
            result.analysis.goalAdvice;

        document.getElementById("warning").innerText =
            result.analysis.warning;

        document.getElementById("disclaimer").innerText =
            result.disclaimer;

        displayRecommendations(result.analysis.recommendations);

        updateHealthBadge(result.summary.budgetHealth);

        document.querySelector(".results").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        document.getElementById("analysisSummary").innerText =
            error.message;

        updateHealthBadge("Needs Attention");

        console.error("Budget analysis error:", error);

    } finally {
        setButtonLoading(false);
    }
}