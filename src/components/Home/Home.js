import React, { useEffect, useState, useContext } from "react";

import { AppStateContext, ChangeAppStateContext } from "../App";

import { getState } from "../util";

import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-moment';
  
Chart.register(...registerables);

let myChart;

function Home() {

        const appContext = useContext(AppStateContext);
        const changeAppStateContext = useContext(ChangeAppStateContext)

        let [state, setState] = useState({
            timeChart: {
                year: 2022,
                month: 2
            }
        })

        // function downloadState() {
        //     var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storageObj));
        //     var dlAnchorElem = document.getElementById('downloadAnchorElem');
        //     dlAnchorElem.setAttribute("href",     dataStr     );
        //     dlAnchorElem.setAttribute("download", "scene.json");
        //     dlAnchorElem.click();
        // }

        function changeTimeChart(monthChange) {
            return () => {
                let year = state.timeChart.year
                let maxyear = state.timeChart.year
                let month = state.timeChart.month + monthChange;
                let maxmonth = state.timeChart.month + monthChange + 1;
                // let newMin = year+ "-" + month + "-01"
                // let newMax = year+ "-" + (month + 1) + "-01"

                if(month > 12) {
                    month = 1
                    maxmonth = 2;
                    maxyear++;
                    year++;
                }
                if(month < 1) {
                    month = 12
                    maxmonth = 1;
                    year--;
                }
                if(maxmonth > 12) {
                    maxmonth = 1
                    maxyear++;
                }
                if(maxmonth < 1) {
                    maxmonth = 12
                }

                let newMin = year+ "-" + month + "-01"
                let newMax = maxyear+ "-" + maxmonth + "-01"
                

                myChart.options.scales.x.min = newMin
                myChart.options.scales.x.max = newMax
                myChart.update();
                setState({
                    ...state,
                    timeChart: {
                        ...state.timeChart,
                        month: month,
                        year: year
                    }
                })
            }
        }

        useEffect(() => {
            const ctx = document.getElementById('myChart');
            myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Red', 'Blue', 'Yellow'],
                    datasets: [{
                        label: '# of Votes',
                        data: [
                        ...appContext.stats.chronologicalData.map(point => {
                            return {
                                x: point.year + "-" + point.month + "-" + point.day,
                                y: point.answered
                            }
                        })    
                            
                            //     {
                            //     x: '2021-11-06',
                            //     y: 50
                            // }, {
                            //     x: '2021-11-07',
                            //     y: 60
                            // }, {
                            //     x: '2021-11-08',
                            //     y: 20
                            // }
                        ],
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                                displayFormats: {
                                    quarter: 'YYYY-MM-DD'

                                }
                            },
                            min: '2022-02-01',
                            max: '2022-03-01'
                        }
                    }
                }
            });
            myChart.resize(300, 300);

        }, [])

        function download(content, fileName, contentType) {
            var a = document.createElement("a");
            var file = new Blob([content], {type: contentType});
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        }

        function upload() {
            var files = document.getElementById('selectFiles').files;
          console.log(files);
          if (files.length <= 0) {
            return false;
          }
        
          var fr = new FileReader();
        
          fr.onload = function(e) { 
            console.log(e);
            var result = JSON.parse(e.target.result);
            var formatted = JSON.stringify(result, null, 2);
            //document.getElementById('result').value = formatted;
            console.log(result)
            changeAppStateContext(getState(result))
          }
        
          fr.readAsText(files.item(0));
        };

        return (
        <div style={{textAlign: "center"}}>
            <div style={{width: "400px", margin: "auto"}}>
           
            <canvas id="myChart" width="400" height="400"></canvas>
            </div>
            <button onClick={changeTimeChart(-1)}>Prev</button>
            <button onClick={changeTimeChart(1)}>Next</button>
            <div>
                {/* <a 
                href={"data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage.getItem("appState")))}
                download={"scene.json"}
                >Download state</a> */}
                <button onClick={() => { download(localStorage.getItem("appState"), "scene.json", "text/plain")}}>
                    Download state
                </button>
            </div>
            <div>
                <input type="file" id="selectFiles"/><br />
                <button id="import" onClick={upload}>Import</button>
            </div>
        
        </div>);
        
}

export default Home;