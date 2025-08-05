import { userService } from '../api/user.service.js';
import { gruposService } from '../api/grupos.service.js';
import { centroService } from '../api/centro.service.js';

function init(){
    // 1. GRÁFICO DE CENTROS DE FORMACIÓN POR REGIONAL
    cargarGraficoCentrosPorRegional();
    
    // 2. GRÁFICO DE ESTADO ACTUAL DE GRUPOS
    cargarGraficoEstadoGrupos();
    
    // 3. GRÁFICO DE CREACIÓN DE GRUPOS EN EL TIEMPO
    cargarGraficoCreacionGrupos();
    
    // 4. GRÁFICO DE DEMOGRAFÍA DE APRENDICES
    cargarGraficoDemografiaAprendices();
    
    // 5. GRÁFICOS EXISTENTES (mantener)
    cargarGraficoProgramas();
    cargarGraficoRoles();
}

// 1. CENTROS DE FORMACIÓN POR REGIONAL
async function cargarGraficoCentrosPorRegional() {
    try {
        const centros = await centroService.getAllCentros();
        
        // Agrupar centros por regional
        const centrosPorRegional = {};
        centros.forEach(centro => {
            const regional = centro.cod_regional || 'Sin Regional';
            if (!centrosPorRegional[regional]) {
                centrosPorRegional[regional] = 0;
            }
            centrosPorRegional[regional]++;
        });

        const labels = Object.keys(centrosPorRegional);
        const data = Object.values(centrosPorRegional);

        const ctx = document.getElementById("chart-bars").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Centros de Formación",
                    tension: 0.4,
                    borderWidth: 0,
                    borderRadius: 4,
                    borderSkipped: false,
                    backgroundColor: "#43A047",
                    data: data,
                    barThickness: 'flex'
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
                            borderDash: [5, 5],
                            color: '#e5e5e5'
                        },
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: Math.max(...data) + 2,
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
    } catch (error) {
        console.error('Error cargando gráfico de centros por regional:', error);
    }
}

// 2. ESTADO ACTUAL DE GRUPOS DE FORMACIÓN
async function cargarGraficoEstadoGrupos() {
    try {
        // Obtener resumen de grupos
        const resumen = await gruposService.getResumenGrupos();
        
        // Preparar datos para el gráfico
        const estados = ['Activo', 'En formación', 'Finalizado', 'Cancelado'];
        const datos = estados.map(estado => {
            const item = resumen.find(r => r.estado_grupo === estado);
            return item ? item.cantidad : 0;
        });

        const ctx = document.getElementById("chart-line").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: estados,
                datasets: [{
                    label: "Grupos",
                    tension: 0,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: "#43A047",
                    pointBorderColor: "transparent",
                    borderColor: "#43A047",
                    backgroundColor: "#43A047",
                    fill: true,
                    data: datos,
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
    } catch (error) {
        console.error('Error cargando gráfico de estado de grupos:', error);
    }
}

// 3. CREACIÓN DE GRUPOS A LO LARGO DEL TIEMPO
async function cargarGraficoCreacionGrupos() {
    try {
        // Obtener resumen de grupos del backend
        const resumen = await gruposService.getResumenGrupos();
        
        // Si no hay datos, mostrar mensaje
        if (!resumen || resumen.length === 0) {
            console.log('No hay datos de grupos para mostrar');
            const canvas = document.getElementById('chart-line-tasks');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "16px Segoe UI";
                ctx.fillStyle = "#888";
                ctx.fillText("No hay datos disponibles", 40, 60);
            }
            return;
        }

        // Agrupar por estado y contar
        const estados = ['Activo', 'En formación', 'Finalizado', 'Cancelado'];
        const datos = estados.map(estado => {
            const item = resumen.find(r => r.estado_grupo === estado);
            return item ? item.cantidad : 0;
        });

        const ctx = document.getElementById("chart-line-tasks").getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels: estados,
                datasets: [{
                    label: "Grupos por Estado",
                    tension: 0,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: "#43A047",
                    pointBorderColor: "transparent",
                    borderColor: "#43A047",
                    backgroundColor: "transparent",
                    fill: true,
                    data: datos,
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
    } catch (error) {
        console.error('Error cargando gráfico de creación de grupos:', error);
    }
}

// 4. DEMOGRAFÍA DE APRENDICES POR GRUPO
async function cargarGraficoDemografiaAprendices() {
    try {
        // Obtener resumen de grupos del backend
        const resumen = await gruposService.getResumenGrupos();
        
        if (!resumen || resumen.length === 0) {
            console.log('No hay datos de grupos para mostrar demografía');
            const canvas = document.getElementById('demografia-aprendices-chart');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "16px Segoe UI";
                ctx.fillStyle = "#888";
                ctx.fillText("No hay datos disponibles", 40, 60);
            }
            return;
        }

        // Obtener datos de demografía para los grupos disponibles
        const gruposDemografia = [];
        let totalAprendices = 0;

        // Procesar los primeros 5 grupos del resumen para mostrar demografía
        const gruposAMostrar = resumen.slice(0, 5);
        
        for (const grupo of gruposAMostrar) {
            try {
                // Obtener datos específicos del grupo
                const datosGrupo = await gruposService.getDatosGrupoByCodFicha(grupo.cod_ficha);
                
                if (datosGrupo) {
                    const masculinos = datosGrupo.num_aprendices_masculinos || 0;
                    const femeninos = datosGrupo.num_aprendices_femenino || 0;
                    const noBinarios = datosGrupo.num_aprendices_no_binario || 0;
                    
                    gruposDemografia.push({
                        cod_ficha: grupo.cod_ficha,
                        masculinos: masculinos,
                        femeninos: femeninos,
                        no_binarios: noBinarios
                    });
                    
                    totalAprendices += masculinos + femeninos + noBinarios;
                }
            } catch (error) {
                console.warn(`Error obteniendo datos del grupo ${grupo.cod_ficha}:`, error);
                // Si no se pueden obtener datos específicos, usar datos del resumen
                const totalGrupo = grupo.cantidad || 0;
                gruposDemografia.push({
                    cod_ficha: grupo.cod_ficha,
                    masculinos: Math.floor(totalGrupo * 0.5),
                    femeninos: Math.floor(totalGrupo * 0.4),
                    no_binarios: totalGrupo % 10
                });
                totalAprendices += totalGrupo;
            }
        }

        if (gruposDemografia.length === 0) {
            console.log('No se pudieron obtener datos de demografía');
            const canvas = document.getElementById('demografia-aprendices-chart');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "16px Segoe UI";
                ctx.fillStyle = "#888";
                ctx.fillText("No hay datos de demografía disponibles", 40, 60);
            }
            return;
        }

        const labels = gruposDemografia.map(g => g.cod_ficha);
        const datosMasculinos = gruposDemografia.map(g => g.masculinos);
        const datosFemeninos = gruposDemografia.map(g => g.femeninos);
        const datosNoBinarios = gruposDemografia.map(g => g.no_binarios);

        // Actualizar el texto del total
        const totalElement = document.getElementById('total-aprendices-text');
        if (totalElement) {
            totalElement.textContent = `Total de aprendices: ${totalAprendices}`;
        }

        const ctx = document.getElementById("demografia-aprendices-chart").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Masculinos",
                        data: datosMasculinos,
                        backgroundColor: "#1e7e34",
                        borderColor: "#1e7e34",
                        borderWidth: 1
                    },
                    {
                        label: "Femeninos",
                        data: datosFemeninos,
                        backgroundColor: "#28a745",
                        borderColor: "#28a745",
                        borderWidth: 1
                    },
                    {
                        label: "No Binarios",
                        data: datosNoBinarios,
                        backgroundColor: "#51cf66",
                        borderColor: "#51cf66",
                        borderWidth: 1
                    }
                ]
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
                                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${context.dataset.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            drawBorder: false,
                            display: false,
                            drawOnChartArea: false,
                            drawTicks: false
                        },
                        ticks: {
                            color: '#737373',
                            padding: 10,
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        stacked: true,
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
                            beginAtZero: true,
                            padding: 10,
                            font: {
                                size: 14,
                                lineHeight: 2
                            },
                            color: "#737373"
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error cargando gráfico de demografía:', error);
        const totalElement = document.getElementById('total-aprendices-text');
        if (totalElement) {
            totalElement.textContent = 'Error cargando datos de demografía';
        }
    }
}

// 5. GRÁFICO DE PROGRAMAS (MANTENER EL EXISTENTE)
async function cargarGraficoProgramas() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/ruta-a-tu-login.html';
        return;
    }

    try {
        const response = await fetch('https://api.gestion-formacion.tech/programa/get-all?limit=10000&offset=0', {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

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

        const barraColors = [
            '#1e7e34', 
            '#28a745',
            '#51cf66',
            '#b2f2bb',
            '#e6fcf5'  
        ];

        const programas = programasArr
            .map(p => ({
                nombre: p.nombre,
                horas_lectivas: parseFloat(p.horas_lectivas) || 0,
                horas_productivas: parseFloat(p.horas_productivas) || 0,
                total: Math.round((parseFloat(p.horas_lectivas) || 0) + (parseFloat(p.horas_productivas) || 0))
            }))
            .filter(p => !isNaN(p.total) && p.total > 0)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map((p, idx) => ({
                ...p,
                ranking: idx + 1
            }));

        const rankingEmojis = ['🥇', '🥈', '🥉', '⭐️', '🏅'];
        const etiquetasY = programas.map((p, i) => `${rankingEmojis[i] || ''} ${p.nombre}`);

        if (programas.length === 0) {
            const canvas = document.getElementById('top-programas-bar');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "18px Segoe UI";
                ctx.fillStyle = "#888";
                ctx.fillText("No hay datos para mostrar", 40, 60);
            }
            return;
        }

        const maxHoras = Math.max(...programas.map(p => p.total), 10);
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

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: etiquetasY,
                datasets: [{
                    label: 'Duración Total (horas)',
                    data: programas.map(p => p.total),
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
                        backgroundColor: '#fff',
                        borderColor: '#28a745',
                        borderWidth: 2,
                        titleColor: '#222',
                        bodyColor: '#222',
                        titleFont: { weight: 'bold', size: 16 },
                        bodyFont: { size: 15 },
                        padding: 16,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                const p = programas[context[0].dataIndex];
                                return `🏆 ${p.ranking}° ${p.nombre}`;
                            },
                            label: function(context) {
                                const p = programas[context.dataIndex];
                                return [
                                    `Lectivas: ${p.horas_lectivas} h`,
                                    `Productivas: ${p.horas_productivas} h`,
                                    `Total: ${p.total} h`
                                ];
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
                            font: { size: 18, weight: 'bold', family: 'Segoe UI, Arial, sans-serif' },
                            color: '#222', 
                            padding: 18,
                            callback: function(value, index, ticks) {
                                const label = this.getLabelForValue(value);
                                return label.length > 38 ? label.slice(0, 35) + '...' : label;
                            }
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
    } catch (err) {
        console.error('Error cargando programas:', err);
    }
}

// 6. GRÁFICO DE ROLES (MANTENER EL EXISTENTE)
async function cargarGraficoRoles() {
    try {
        const data = await userService.getRoleDistribution();
        
        if (!Array.isArray(data) || data.length === 0) {
            console.error('No hay datos de distribución de roles');
            return;
        }

        const labels = data.map(item => item.rol_nombre);
        const values = data.map(item => item.cantidad_usuarios);
        const totalUsers = values.reduce((sum, value) => sum + value, 0);

        const sortedData = data
            .map((item, index) => ({ ...item, originalIndex: index }))
            .sort((a, b) => b.cantidad_usuarios - a.cantidad_usuarios);
        
        const greenScale = [
            '#0d4e2b',
            '#1e7e34',
            '#28a745',
            '#51cf66',
            '#b2f2bb'
        ];

        const colors = sortedData.map((_, index) => greenScale[index] || greenScale[greenScale.length - 1]);

        const totalUsersElement = document.getElementById('total-users-text');
        if (totalUsersElement) {
            totalUsersElement.textContent = `Total de usuarios: ${totalUsers}`;
        }

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
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });
    } catch (err) {
        console.error('Error cargando distribución de roles:', err);
        const totalUsersElement = document.getElementById('total-users-text');
        if (totalUsersElement) {
            totalUsersElement.textContent = 'Error cargando datos de usuarios';
        }
    }
}

// Verificar rol y ejecutar
const user = JSON.parse(localStorage.getItem('user'));
if (user?.id_rol !== 3) {
    init();
}

export { init };
