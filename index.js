
import { temp, hum } from "./data.js";

// consshow = async () => {
//     try {
//         const res = await fetch(`http://localhost:1880/test`, {
//             method: "GET"
//         })
//         const data = await res.json()
//         return data
//     } catch (error) {
//         console.log("Error", error)
//     }
// }

// const filtrarData = async () => {

//     const data = awaishow()
//     let dataChart = []
//     const info = data.map(e => {
//         return dataChart = {
//             "date": e.EPOCH,
//             "value": e.VALOR
//         }
//     });

//     return info
// }

// filtrarData()

// Variables
let dateZoom = { min: temp[0][0], max: temp[temp.length - 1][0] };
const btnReset = document.querySelector("#btnReset")
const btnOneDay = document.querySelector("#btnOneDay")
const btnOnMonth = document.querySelector("#btnOnMonth")
const inputDateStart = document.querySelector("#inputDateStart")
const inputDateEnd = document.querySelector("#inputDateEnd")
const mediaText = document.querySelector("#mediaText")
const varianzaText = document.querySelector("#varianzaText")
const sdText = document.querySelector("#sdText")
const tableContent = document.querySelector("#tableContent")
const tableContentBody = document.querySelector("#tableContentBody")
const tableContentHead = document.querySelector("#tableContentHead")
const tableStatHead = document.querySelector("#tableStatHead")
const tableStatBody = document.querySelector("#tableStatBody")
const contentToExcel = document.querySelector("#contentToExcel")
const statisToExcel = document.querySelector("#statToExcel")
// Fecha actual
// const now = new Date();
const now = new Date('21 Dec 2021');

var options = {
    series: [
        {
            name: 'Temperatura',
            data: temp
        },
        {
            name: 'Humedad',
            data: hum
        }
    ],
    chart: {
        id: 'chart2',
        type: 'line',
        stacked: false,
        height: 300,
        zoom: {
            type: 'x',
            enabled: true,
            autoScaleYaxis: true
        },
        toolbar: {
            autoSelected: 'zoom',
            tools: {
                reset: false,
            },
        },
        events: {
            beforeZoom: function (chartContext, { xaxis, yaxis }) {
                dateZoom = xaxis;
                showStatistics(dateZoom);
                showData(dateZoom);
            }
        }
    },
    colors: ['#77B6EA', '#545454'],
    stroke: {
        width: 2
    },
    dataLabels: {
        enabled: false
    },
    fill: {
        opacity: 1,
    },
    markers: {
        size: 0
    },
    xaxis: {
        type: 'datetime',
    }
};


var optionsLine = {
    series: [{
        data: temp
    }],
    chart: {
        id: 'chart1',
        height: 130,
        type: 'area',
        brush: {
            target: 'chart2',
            enabled: true
        },
        selection: {
            enabled: true,
            xaxis: {
                min: temp[0][0],
                max: temp[temp.length - 1][0]
            }
        },
        events: {
            brushScrolled: function (chartContext, { xaxis, yaxis }) {
                dateZoom = xaxis;
                showStatistics(dateZoom);
                showData(dateZoom);
            }
        }
    },
    colors: ['#008FFB'],
    fill: {
        type: 'gradient',
        gradient: {
            opacityFrom: 0.91,
            opacityTo: 0.1,
        }
    },
    xaxis: {
        type: 'datetime',
        tooltip: {
            enabled: false
        }
    },
    yaxis: {
        tickAmount: 2
    }
};

var chart = new ApexCharts(document.querySelector("#chart-line"), options);
chart.render();

var chartLine = new ApexCharts(document.querySelector("#chart-line2"), optionsLine);
chartLine.render();

var resetCssClasses = function (activeEl) {
    var els = document.querySelectorAll('button')
    Array.prototype.forEach.call(els, function (el) {
        el.classList.remove('active')
    })

    activeEl.target.classList.add('active')
}

// Event Listeners
eventListeners();
function eventListeners() {
    // Reiniciar fecha
    const resetDate = {
        firstDate: temp[0][0],
        endDate: temp[temp.length - 1][0],
    }
    btnReset.addEventListener('click', (e) => selectDate(resetDate, e))

    // Un dia
    const dateOneDay = {
        firstDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime(),
        endDate: now.getTime(),
    }
    btnOneDay.addEventListener('click', (e) => selectDate(dateOneDay, e))

    // Un mes
    const dateOnMonth = {
        firstDate: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime(),
        endDate: now.getTime(),
    }
    btnOnMonth.addEventListener('click', (e) => selectDate(dateOnMonth, e))

    // Input de fechas
    inputDateStart.addEventListener('change', (e) => {
        resetDate.firstDate = new Date(e.target.value).getTime()
        chart.zoomX(
            resetDate.firstDate,
            resetDate.endDate
        )
    })

    inputDateEnd.addEventListener('change', (e) => {
        resetDate.endDate = new Date(e.target.value).getTime()
        chart.zoomX(
            resetDate.firstDate,
            resetDate.endDate
        )
    })

    contentToExcel.addEventListener('click', () => exportToExcel('xlsx', tableContentBody, 'data'));
    statisToExcel.addEventListener('click', () => exportToExcel('xlsx', tableStatBody, 'statistics'));
}

// Funciones

function exportToExcel(type, elt, name, fn, dl) {
    let firstDate = new Date(dateZoom.min).toLocaleDateString();
    let lastDate = new Date(dateZoom.max).toLocaleDateString();
    let wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
    return dl ?
        XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
        XLSX.writeFile(wb, fn || (`${name}_from_${firstDate}_to_${lastDate}.` + (type || 'xlsx')));
}

function selectDate(date, e) {
    // resetCssClasses(e);
    const { firstDate, endDate } = date;
    chart.zoomX(
        firstDate,
        endDate
    );
}

resetInputDates();
function resetInputDates() {

    const firstDate = new Date(temp[0][0]);
    const endDate = new Date(temp[temp.length - 1][0]);
    let firstYear = new Date(firstDate).getFullYear();
    let firstMonth = new Date(firstDate).getMonth() + 1;
    let firstDay = new Date(firstDate).getDate();
    let endYear = new Date(endDate).getFullYear();
    let endMonth = new Date(endDate).getMonth() + 1;
    let endDay = new Date(endDate).getDate();

    firstMonth < 10 ? firstMonth = `0${firstMonth}` : firstMonth
    endMonth < 10 ? endMonth = `0${endMonth}` : endMonth
    firstDay < 10 ? firstDay = `0${firstDay}` : firstDay
    endDay < 10 ? endDay = `0${endDay}` : endDay

    inputDateStart.value = `${firstYear}-${firstMonth}-${firstDay}`;
    inputDateStart.min = `${firstYear}-${firstMonth}-${firstDay}`;
    inputDateStart.max = `${endYear}-${endMonth}-${endDay}`;

    inputDateEnd.value = `${endYear}-${endMonth}-${endDay}`;
    inputDateEnd.min = `${firstYear}-${firstMonth}-${firstDay}`;
    inputDateEnd.max = `${endYear}-${endMonth}-${endDay}`;
}

showStatistics(dateZoom);
showData(dateZoom);

function showStatistics(date) {
    limpiarTabla(tableStatHead, tableStatBody);
    const { min, max } = date;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    statisToExcel.innerText = `Exportar estadística entre el ${new Date(min).toLocaleDateString("es-ES", options)} y el ${new Date(max).toLocaleDateString("es-ES", options)}`;
    const newTemp = temp.filter(fecha => fecha[0] > min && fecha[0] < max);
    const newHum = hum.filter(fecha => fecha[0] > min && fecha[0] < max);
    const dataTemp = newTemp.map(e => e[1]);
    const dataHum = newHum.map(e => e[1]);
    const allData = [
        {
            'metrica': 'Temperatura',
            'data': [...dataTemp],
        },
        {
            'metrica': 'Humedad',
            'data': [...dataHum],
        },
    ];

    const headStats = ['Métrica', 'Media', 'Varianza', 'Desviacion']
    fillHead(tableStatHead, headStats);

    allData.forEach(({ metrica, data }) => {
        const rowBody = document.createElement('tr');
        const media = calculateMedia(data).toFixed(3);
        const varianza = calculateVariance(data).toFixed(3);
        const sd = calculateSD(varianza).toFixed(3);
        rowBody.innerHTML = `
            <td>${metrica}</td>
            <td>${media}</td>
            <td>${varianza}</td>
            <td>${sd}</td>
        `;
        tableStatBody.appendChild(rowBody);
    })
}

function showData(date) {
    limpiarTabla(tableContentHead, tableContentBody);
    const { min, max } = date;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    contentToExcel.innerText = `Exportar datos entre el ${new Date(min).toLocaleDateString("es-ES", options)} y el ${new Date(max).toLocaleDateString("es-ES", options)}`;
    const newTemp = temp.filter(fecha => fecha[0] > min && fecha[0] < max);
    const newHum = hum.filter(fecha => fecha[0] > min && fecha[0] < max);

    let allData = [];
    newTemp.forEach((e, index) => {
        const oneData = {
            'fecha': e[0],
            'temperatura': newTemp[index][1],
            'humedad': newHum[index][1],
        }
        allData = [...allData, oneData]
    })


    const headContent = ['Fecha', 'Temperatura', 'Humedad']
    fillHead(tableContentHead, headContent);

    allData.forEach(({ fecha, temperatura, humedad }) => {
        const rowBody = document.createElement('tr');
        rowBody.innerHTML = `
            <td>${new Date(fecha).toLocaleDateString("es-ES", options)}</td>
            <td>${temperatura}</td>
            <td>${humedad}</td>
            `;

        tableContentBody.appendChild(rowBody);
    })
}

// Llenar encabezado de tablas automaticamente
function fillHead(table, data) {
    const rowHead = document.createElement('tr');
    data.forEach(value => {
        const thDate = document.createElement('th');
        thDate.innerText = value;
        rowHead.appendChild(thDate);
    });
    table.appendChild(rowHead);
}

function calculateMedia(data) {
    let sum = 0;
    data.forEach(value => sum += value);
    const media = sum / data.length;
    return media;
}

function calculateVariance(data) {
    const media = calculateMedia(data);
    const squareDiffs = data.map(value => {
        const diff = value - media;
        return diff * diff;
    });
    const varianza = calculateMedia(squareDiffs);
    return varianza;
}

function calculateSD(variance) {
    return Math.sqrt(variance);
};

function limpiarTabla(tableHead, tableBody) {
    while (tableHead.firstChild) {
        tableHead.removeChild(tableHead.firstChild)
    };
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild)
    };
}
