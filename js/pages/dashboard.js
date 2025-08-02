import { userService } from '../api/user.service.js';

function init(){
    var ctx = document.getElementById("chart-bars").getContext("2d");

new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["M", "T", "W", "T", "F", "S", "S"],
        datasets: [{
            label: "Views",
            tension: 0.4,
            borderWidth: 0,
            borderRadius: 4,
            borderSkipped: false,
            backgroundColor: "#43A047",
            data: [50, 45, 22, 28, 50, 60, 76],
            barThickness: 'flex'
        },],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        scales: {
            y: {
                grid: {
                    drawBorder: false,
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: false,
                    borderDash: [5, 5],
                    color: '#e5e5e5'
                },
                ticks: {
                    suggestedMin: 0,
                    suggestedMax: 500,
                    beginAtZero: true,
                    padding: 10,
                    font: {
                        size: 14,
                        lineHeight: 2
                    },
                    color: "#737373"
                },
            },
            x: {
                grid: {
                    drawBorder: false,
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false,
                    borderDash: [5, 5]
                },
                ticks: {
                    display: true,
                    color: '#737373',
                    padding: 10,
                    font: {
                        size: 14,
                        lineHeight: 2
                    },
                }
            },
        },
    },
});


var ctx2 = document.getElementById("chart-line").getContext("2d");

new Chart(ctx2, {
    type: "line",
    data: {
        labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
        datasets: [{
            label: "Sales",
            tension: 0,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: "#43A047",
            pointBorderColor: "transparent",
            borderColor: "#43A047",
            backgroundColor: "transparent",
            fill: true,
            data: [120, 230, 130, 440, 250, 360, 270, 180, 90, 300, 310, 220],
            maxBarThickness: 6

        }],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    title: function (context) {
                        const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                        return fullMonths[context[0].dataIndex];
                    }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        scales: {
            y: {
                grid: {
                    drawBorder: false,
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: false,
                    borderDash: [4, 4],
                    color: '#e5e5e5'
                },
                ticks: {
                    display: true,
                    color: '#737373',
                    padding: 10,
                    font: {
                        size: 12,
                        lineHeight: 2
                    },
                }
            },
            x: {
                grid: {
                    drawBorder: false,
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false,
                    borderDash: [5, 5]
                },
                ticks: {
                    display: true,
                    color: '#737373',
                    padding: 10,
                    font: {
                        size: 12,
                        lineHeight: 2
                    },
                }
            },
        },
    },
});

var ctx3 = document.getElementById("chart-line-tasks").getContext("2d");

new Chart(ctx3, {
    type: "line",
    data: {
        labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
            label: "Tasks",
            tension: 0,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: "#43A047",
            pointBorderColor: "transparent",
            borderColor: "#43A047",
            backgroundColor: "transparent",
            fill: true,
            data: [50, 40, 300, 220, 500, 250, 400, 230, 500],
            maxBarThickness: 6

        }],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        scales: {
            y: {
                grid: {
                    drawBorder: false,
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: false,
                    borderDash: [4, 4],
                    color: '#e5e5e5'
                },
                ticks: {
                    display: true,
                    padding: 10,
                    color: '#737373',
                    font: {
                        size: 14,
                        lineHeight: 2
                    },
                }
            },
            x: {
                grid: {
                    drawBorder: false,
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false,
                    borderDash: [4, 4]
                },
                ticks: {
                    display: true,
                    color: '#737373',
                    padding: 10,
                    font: {
                        size: 14,
                        lineHeight: 2
                    },
                }
            },
        },
    },
});

// INICIO MODULO GRAFICA CAMILO
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/ruta-a-tu-login.html';
    return;
}

fetch('https://api.gestion-formacion.tech/programa/get-all?limit=10000&offset=0', {
    headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
    }
})
.then(res => res.json())
.then(data => {
    console.log(data); 


    let programasArr = [];
    if (Array.isArray(data.data)) {
        programasArr = data.data;
    } else if (Array.isArray(data.items)) {
        programasArr = data.items;
    } else if (Array.isArray(data)) {
        programasArr = data;
    } else {
        console.error('Respuesta inesperada del endpoint:', data);
        return;
    }

    console.log(programasArr); 

    const posiciones = [
        '🥇 1°',
        '🥈 2°',
        '🥉 3°',
        '4°',
        '5°'
    ];
    const barraColors = [
        '#1e7e34', 
        '#28a745',
        '#51cf66',
        '#b2f2bb',
        '#e6fcf5'  
    ];


    const barraShadows = [
        '0 4px 12px 0 rgba(30,126,52,0.15)',
        '0 4px 12px 0 rgba(40,167,69,0.12)',
        '0 4px 12px 0 rgba(81,207,102,0.10)',
        '0 4px 12px 0 rgba(178,242,187,0.08)',
        '0 4px 12px 0 rgba(230,252,245,0.06)'
    ];

    const programas = programasArr
        .map(p => ({
            nombre: p.nombre,
            horas: Math.round((parseFloat(p.horas_lectivas) || 0) + (parseFloat(p.horas_productivas) || 0))
        }))
        .filter(p => !isNaN(p.horas) && p.horas > 0)
        .sort((a, b) => b.horas - a.horas)
        .slice(0, 5);

    const maxHoras = Math.max(...programas.map(p => p.horas), 10);
    let step = 100;
    if (maxHoras > 1000) step = 1000;
    else if (maxHoras > 500) step = 500;
    else if (maxHoras > 100) step = 100;
    const ejeMax = Math.ceil((maxHoras + step * 0.1) / step) * step;

    const canvas = document.getElementById('top-programas-bar');
    if (!canvas) return;
    canvas.height = 60 * programas.length;
    canvas.width = 900;
    const ctx = canvas.getContext('2d');


    Chart.defaults.elements.bar.borderRadius = 12;
    Chart.defaults.elements.bar.backgroundColor = barraColors;
    Chart.defaults.elements.bar.borderSkipped = false;

    const etiquetasY = programas.map((p, i) => `${posiciones[i] || (i+1) + '°'} ${p.nombre}`);
const etiquetasConPosicion = programas.map((p, i) => `${posiciones[i] || (i+1) + '°'} ${p.nombre}`);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: etiquetasY,
            datasets: [{
                label: 'Duración Total (horas)',
                data: programas.map(p => p.horas),
                backgroundColor: barraColors,
                borderColor: '#fff',
                borderWidth: 2,
                barThickness: 28,
                hoverBackgroundColor: barraColors.map(c => c + 'cc'),
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                    backgroundColor: '#222',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#28a745',
                    borderWidth: 1,
                    callbacks: {
                        title: function(context) {
                            return etiquetasConPosicion[context[0].dataIndex];
                        },
                        label: function(context) {
                            return ` ${context.parsed.x} horas`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: ejeMax,
                    display: false,
                    grid: {
                        display: false,
                        drawBorder: false,
                        drawOnChartArea: false,
                        drawTicks: false
                    }
                },
                y: {
                    title: { display: false },
                    ticks: {
                        font: { size: 15, weight: 'bold', family: 'Segoe UI, Arial, sans-serif' },
                        color: '#222',
                    },
                    grid: {
                        display: false,
                        drawBorder: false,
                        drawOnChartArea: false,
                        drawTicks: false
                    }
                }
            }
        },
        plugins: []
    });
})
.catch(err => {
    console.error('Error cargando programas:', err);
});

// GRÁFICO DE DISTRIBUCIÓN DE ROLES
userService.getRoleDistribution()
.then(data => {
    console.log('Role distribution data:', data);
    
    if (!Array.isArray(data) || data.length === 0) {
        console.error('No hay datos de distribución de roles');
        return;
    }

    // Preparar datos para el gráfico
    const labels = data.map(item => item.rol_nombre);
    const values = data.map(item => item.cantidad_usuarios);
    const totalUsers = values.reduce((sum, value) => sum + value, 0);

    // Colores en escala de verdes - del más oscuro al más claro según el porcentaje
    const sortedData = data
        .map((item, index) => ({ ...item, originalIndex: index }))
        .sort((a, b) => b.cantidad_usuarios - a.cantidad_usuarios);
    
    const greenScale = [
        '#0d4e2b', // Verde muy oscuro para el mayor porcentaje
        '#1e7e34', // Verde oscuro
        '#28a745', // Verde medio
        '#51cf66', // Verde claro
        '#b2f2bb'  // Verde muy claro para el menor porcentaje
    ];

    // Asignar colores basados en el ranking de usuarios
    const colors = sortedData.map((_, index) => greenScale[index] || greenScale[greenScale.length - 1]);

    // Actualizar el texto del total de usuarios
    const totalUsersElement = document.getElementById('total-users-text');
    if (totalUsersElement) {
        totalUsersElement.textContent = `Total de usuarios: ${totalUsers}`;
    }

    // Crear el gráfico circular
    const ctx = document.getElementById('role-distribution-chart');
    if (!ctx) {
        console.error('Canvas para gráfico de roles no encontrado');
        return;
    }

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Usuarios',
                data: values,
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 6,
                hoverBorderColor: '#28a745',
                hoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#1e7e34',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#28a745',
                    borderWidth: 2,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const percentage = ((value / totalUsers) * 100).toFixed(1);
                            return `${context.label}: ${value} usuarios (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%', // Para hacer un gráfico de anillo (donut)
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });
})
.catch(err => {
    console.error('Error cargando distribución de roles:', err);
    // Mostrar mensaje de error en el elemento
    const totalUsersElement = document.getElementById('total-users-text');
    if (totalUsersElement) {
        totalUsersElement.textContent = 'Error cargando datos de usuarios';
    }
});


}
init();
export { init };

localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sIjoxLCJleHAiOjE3NTQxODgyMjF9.HkQCtPTMns0oKZfwmcZp5K3nvQJoK55oVL5TT38UUTg');

// FIN MODULO GRAFICA CAMILO
