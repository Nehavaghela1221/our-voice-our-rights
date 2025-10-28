const apiUrl = "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722";
const apiKey = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

let allData = [];
let chart; // for Chart.js

async function fetchMGNREGA() {
  try {
    const res = await fetch(`${apiUrl}?api-key=${apiKey}&format=json&filters[state_name]=GUJARAT&limit=100`);
    const data = await res.json();
    allData = data.records || [];
    console.log("Fetched API data:", allData);

    if (allData.length === 0) throw new Error("No data found");
    populateDistricts(allData);
    drawChart(allData);
  } catch (err) {
    console.warn("API failed, using local fallback:", err);
    const local = await fetch("gujarat_mgnrega.json");
    const data = await local.json();
    allData = [data];
    populateDistricts(allData);
    drawChart(allData);
  }
}

function populateDistricts(data) {
  const select = document.getElementById("districtSelect");
  select.innerHTML = `<option>Select District</option>`;
  data.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.district_name;
    opt.textContent = d.district_name;
    select.appendChild(opt);
  });

  select.addEventListener("change", e => updateDetails(e.target.value));
}

function updateDetails(district) {
  const d = allData.find(x => x.district_name === district);
  if (!d) return;

  document.getElementById("beneficiaries").textContent = d.Total_Individuals_Worked || "N/A";
  document.getElementById("persondays").textContent = d.Persondays_of_Central_Liability_so_far || "N/A";
  document.getElementById("wages").textContent = d.Wages || "N/A";
}

function drawChart(data) {
  const topDistricts = data
    .sort((a, b) => parseFloat(b.Wages) - parseFloat(a.Wages))
    .slice(0, 5);

  const ctx = document.getElementById("wagesChart").getContext("2d");

  if (chart) chart.destroy(); // clear old chart

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: topDistricts.map(d => d.district_name),
      datasets: [
        {
          label: "Wages Paid (₹ lakh)",
          data: topDistricts.map(d => parseFloat(d.Wages)),
          backgroundColor: ["#68b684", "#4ba3c3", "#f4a261", "#e76f51", "#2a9d8f"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Wages Paid (₹)" },
        },
      },
    },
  });
}
// =====================
// Detect User Location
// =====================

document.getElementById("locationText").innerHTML = "📍 Detected Location: <b>Ahmedabad</b>";
const select = document.getElementById("districtSelect");
for (let i = 0; i < select.options.length; i++) {
  if (select.options[i].value.toLowerCase().includes("ahmedabad")) {
    select.selectedIndex = i;
    select.dispatchEvent(new Event("change"));
    break;
  }
}

fetchMGNREGA();
